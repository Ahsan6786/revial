/**
 * Filler Word Detection Utility (Intelligent v2)
 *
 * Strategy:
 * - Pure hesitation sounds (um, uh, umm, hmm, er, ah) → always fillers, simple word-boundary match
 * - Sentence-position fillers (so, like, right, okay, you know, I mean, basically, actually,
 *   literally, kind of, sort of, I guess, well, honestly, seriously) →
 *   detected ONLY when they appear in filler-typical positions:
 *     • At the very start of an utterance / after a comma / sentence boundary
 *     • Immediately before a verb phrase or at the end of a clause
 *     • Repeated consecutively ("like, like")
 *   This avoids counting "I like this", "that's right because", "so we went…" as fillers.
 */

export type FillerCounts = {
  // Hesitation sounds — always fillers
  "um": number;
  "umm": number;
  "uh": number;
  "er": number;
  "ah": number;
  "hmm": number;
  // Discourse fillers — position-aware
  "like": number;
  "you know": number;
  "I mean": number;
  "basically": number;
  "actually": number;
  "literally": number;
  "right": number;
  "okay": number;
  "so": number;
  "well": number;
  "kind of": number;
  "sort of": number;
  "I guess": number;
  "honestly": number;
  "seriously": number;
  // Hinglish fillers
  "matlab": number;
  "matlab ki": number;
  "matlab bolo": number;
  "woh": number;
  "aur": number;
  "toh": number;
  "yaar": number;
  "na": number;
  "haan": number;
  "bas": number;
  [key: string]: number;
};

// ── Hesitation sounds — always fillers, plain word-boundary match ─────────────
const PURE_HESITATIONS: (keyof FillerCounts)[] = [
  "umm",
  "um",
  "uh",
  "er",
  "ah",
  "hmm",
  "matlab ki",
  "matlab bolo",
  "matlab",
  "woh",
  "yaar",
  "haan",
  "bas",
];

// ── Discourse fillers — only counted when in filler positions ─────────────────
//
// A "filler position" means one of:
//   (A) Start of sentence / after [.,!?;:] optionally followed by spaces
//   (B) After a comma (mid-clause pause)
//   (C) Before a comma or end-of-sentence (trailing pause)
//   (D) Consecutive repeat: "like, like" or "like like"
//
// Pattern structure per word W:
//   (?:^|[.,!?;:\n]\s*)W\b           ← position A / B
//   \bW(?:\s*[,.]|\s*$)              ← position C
//   \bW[,\s]+W\b                     ← position D (repetition)
//
// We combine A+B+C+D with alternation and count unique matches.
const DISCOURSE_FILLERS: (keyof FillerCounts)[] = [
  "like",
  "you know",
  "I mean",
  "basically",
  "actually",
  "literally",
  "right",
  "okay",
  "so",
  "well",
  "kind of",
  "sort of",
  "I guess",
  "honestly",
  "seriously",
  "aur",
  "toh",
  "na",
];

// Words that can legitimately appear in the same filler position but are
// preceded by common "legitimising" prefixes we strip out before counting.
// (e.g. "I actually did" where "actually" is intentional emphasis)
// We apply a small exclusion heuristic: don't count an instance if it is
// immediately preceded by "not", "very", "most", "so" (as an intensifier),
// or is sandwiched between two content words in a long noun-phrase.
// This is approximated by checking lookahead/lookbehind for those words.

function buildDiscoursePattern(word: string): RegExp {
  const w = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // escape for regex
  const ws = w.includes(" ") ? w.replace(/ /g, "\\s+") : w;
  const parts = [
    // A/B: after sentence boundary or comma
    `(?:(?:^|[.!?;:\\n]\\s*)\\s*${ws}\\b)`,
    // C: before comma or end of sentence
    `(?:\\b${ws}(?:\\s*[,.]|\\s*(?=[.!?]|$)))`,
    // D: consecutive repeat
    `(?:\\b${ws}[,\\s]+${ws}\\b)`,
  ];
  return new RegExp(parts.join("|"), "gi");
}

/**
 * Detects filler words in a transcript with context-awareness.
 * @param transcript - The speech transcript string.
 * @returns An object with filler words as keys and occurrence counts as values.
 */
export function detectFillers(transcript: string): FillerCounts {
  const result: FillerCounts = {
    um: 0, umm: 0, uh: 0, er: 0, ah: 0, hmm: 0,
    like: 0, "you know": 0, "I mean": 0,
    basically: 0, actually: 0, literally: 0,
    right: 0, okay: 0, so: 0, well: 0,
    "kind of": 0, "sort of": 0, "I guess": 0,
    honestly: 0, seriously: 0,
    matlab: 0, "matlab ki": 0, "matlab bolo": 0,
    woh: 0, aur: 0, toh: 0, yaar: 0, na: 0, haan: 0, bas: 0,
  };

  if (!transcript || transcript.trim().length === 0) return result;

  const text = transcript;
  const textLower = text.toLowerCase();

  // ── 1. Pure hesitations (always fillers) ─────────────────────────────────
  for (const filler of PURE_HESITATIONS) {
    const f = filler as string;
    const escaped = f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s+");
    const pat = new RegExp(`\\b${escaped}\\b`, "gi");
    const matches = textLower.match(pat);
    result[filler] = matches ? matches.length : 0;
  }

  // ── 2. Discourse fillers (position-aware) ──────────────────────────────
  for (const filler of DISCOURSE_FILLERS) {
    const pat = buildDiscoursePattern(filler as string);
    // We need to work on the original case for "I mean" / "I guess" but
    // match case-insensitively, so use textLower for matching
    const matches = textLower.match(pat);
    let count = matches ? matches.length : 0;

    // ── Exclusion heuristic ─────────────────────────────────────────────
    // For words that are commonly non-filler when intensified/negated,
    // subtract instances that are immediately preceded by known modifiers.
    if (count > 0 && ["actually", "literally", "basically", "honestly", "seriously", "well"].includes(filler as string)) {
      const precededByModifier = new RegExp(
        `\\b(?:not|very|most|quite|so|more|less|even|just|but|however)\\s+${(filler as string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
        "gi"
      );
      const falsePositives = (textLower.match(precededByModifier) || []).length;
      count = Math.max(0, count - falsePositives);
    }

    // For "so" — only sentence-initial uses count as filler (not "so that", "so much", etc.)
    if (filler === "so" && count > 0) {
      // The position-aware pattern already handles this — but further
      // exclude "so that", "so much", "so many", "so far", "so long"
      const soContentUses = (textLower.match(/\bso\s+(?:that|much|many|far|long|often|well|good|bad|few|little|hard|easy)\b/gi) || []).length;
      count = Math.max(0, count - soContentUses);
    }

    // For "right" — exclude "that's right", "right now", "right here", "right?", "all right"
    if (filler === "right" && count > 0) {
      const rightContentUses = (textLower.match(/\bright\s+(?:now|here|there|away|after|before|above|below|side)\b|(?:all|that's|that is|you're|you are)\s+right\b/gi) || []).length;
      count = Math.max(0, count - rightContentUses);
    }

    // For "okay" — exclude "okay so", "okay so I", which is itself a filler combo (keep)
    // But exclude "it's okay", "that's okay", "not okay"
    if (filler === "okay" && count > 0) {
      const okayContentUses = (textLower.match(/(?:it'?s?|that'?s?|not|is|was|be|been|are|were)\s+okay\b/gi) || []).length;
      count = Math.max(0, count - okayContentUses);
    }

    result[filler] = count;
  }

  return result;
}

/**
 * Gets total filler count from a FillerCounts object.
 */
export function getTotalFillers(fillers: FillerCounts): number {
  return Object.values(fillers).reduce((sum, count) => sum + count, 0);
}

/**
 * Gets the most used filler word.
 */
export function getMostUsedFiller(fillers: FillerCounts): string | null {
  const sorted = Object.entries(fillers).sort(([, a], [, b]) => b - a);
  return sorted[0]?.[1] > 0 ? sorted[0][0] : null;
}

/**
 * Groups fillers into categories for UI display.
 */
export function getFillerCategories(fillers: FillerCounts): {
  hesitations: [string, number][];
  discourse: [string, number][];
  hinglish: [string, number][];
} {
  const hesitationKeys = new Set(PURE_HESITATIONS as string[]);
  const hinglishKeys = new Set(["matlab", "matlab ki", "matlab bolo", "woh", "aur", "toh", "yaar", "na", "haan", "bas"]);

  const hesitations: [string, number][] = [];
  const discourse: [string, number][] = [];
  const hinglish: [string, number][] = [];

  Object.entries(fillers).forEach(([k, v]) => {
    if (v <= 0) return;
    if (hesitationKeys.has(k)) hesitations.push([k, v]);
    else if (hinglishKeys.has(k)) hinglish.push([k, v]);
    else discourse.push([k, v]);
  });

  return {
    hesitations: hesitations.sort(([, a], [, b]) => b - a),
    discourse: discourse.sort(([, a], [, b]) => b - a),
    hinglish: hinglish.sort(([, a], [, b]) => b - a),
  };
}
