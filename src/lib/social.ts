import { db } from "./firebase";
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  arrayUnion, 
  arrayRemove,
  limit,
  setDoc,
  onSnapshot
} from "firebase/firestore";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  friends?: string[];
  streak?: number;
  createdAt?: any;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: any;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: string;
  updatedAt: any;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: any;
}


// Friend Requests
export const sendFriendRequest = async (senderId: string, receiverId: string) => {
  // Check if already friends
  const senderDoc = await getDoc(doc(db, "users", senderId));
  const friends = senderDoc.data()?.friends || [];
  if (friends.includes(receiverId)) throw new Error("Already friends");

  // Check if request already exists
  const q = query(
    collection(db, "friendRequests"),
    where("senderId", "==", senderId),
    where("receiverId", "==", receiverId),
    where("status", "==", "pending")
  );
  const snapshot = await getDocs(q);
  if (!snapshot.empty) throw new Error("Request already pending");

  return addDoc(collection(db, "friendRequests"), {
    senderId,
    receiverId,
    status: "pending",
    createdAt: serverTimestamp()
  });
};

export const handleFriendRequest = async (requestId: string, status: "accepted" | "rejected") => {
  const requestRef = doc(db, "friendRequests", requestId);
  const requestSnap = await getDoc(requestRef);
  if (!requestSnap.exists()) return;

  const { senderId, receiverId } = requestSnap.data();

  if (status === "accepted") {
    // Update both users' friends list
    await updateDoc(doc(db, "users", senderId), {
      friends: arrayUnion(receiverId)
    });
    await updateDoc(doc(db, "users", receiverId), {
      friends: arrayUnion(senderId)
    });
  }

  return updateDoc(requestRef, { status });
};

// Chat
export const getOrCreateChat = async (userId1: string, userId2: string) => {
  const chatsRef = collection(db, "chats");
  const q = query(
    chatsRef,
    where("participants", "array-contains", userId1)
  );
  
  const snapshot = await getDocs(q);
  const existingChat = snapshot.docs.find(doc => {
    const participants = doc.data().participants;
    return participants.includes(userId2);
  });

  if (existingChat) return existingChat.id;

  const newChatRef = await addDoc(chatsRef, {
    participants: [userId1, userId2].sort(),
    updatedAt: serverTimestamp()
  });

  return newChatRef.id;
};

export const sendMessage = async (chatId: string, senderId: string, text: string) => {
  const messagesRef = collection(db, "chats", chatId, "messages");
  await addDoc(messagesRef, {
    senderId,
    text,
    createdAt: serverTimestamp()
  });

  await updateDoc(doc(db, "chats", chatId), {
    lastMessage: text,
    updatedAt: serverTimestamp()
  });
};

// Rooms
export const joinRoom = async (roomId: string, userId: string) => {
  const roomRef = doc(db, "rooms", roomId);
  return updateDoc(roomRef, {
    members: arrayUnion(userId)
  });
};

export const sendRoomMessage = async (roomId: string, senderId: string, text: string) => {
  const messagesRef = collection(db, "rooms", roomId, "messages");
  return addDoc(messagesRef, {
    senderId,
    text,
    createdAt: serverTimestamp()
  });
};
