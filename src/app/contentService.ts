import { db } from "./firebaseConfig";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  updateDoc,
  doc,
  Timestamp,
  deleteDoc,
} from "firebase/firestore";

// Firestoreのタイムスタンプの型
type FirestoreTimestamp = Timestamp | ReturnType<typeof serverTimestamp>;

// **コンテンツの追加**
export const createContent = async (agentId: string, contentName: string, subPrompt: string, pdfUrl: string): Promise<string> => {
  const contentCode: string = Math.random().toString().slice(2, 8); // 6桁のランダムな数字
  const contentRef = await addDoc(collection(db, "contents"), {
    agentId,
    contentName,
    subPrompt,
    pdfUrl,
    contentCode,
    createdAt: serverTimestamp(),
  });
  return contentRef.id;
};

// **AIエージェントに紐づくコンテンツ一覧を取得**
interface AgentContent {
  id: string;
  agentId: string;
  contentName: string;
  subPrompt: string;
  pdfUrl: string;
  contentCode: string;
  createdAt: FirestoreTimestamp; // Firestoreのタイムスタンプを型定義
}

export const getAgentContents = async (agentId: string): Promise<AgentContent[]> => {
  const q = query(collection(db, "contents"), where("agentId", "==", agentId));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        agentId: data.agentId,
        contentName: data.contentName,
        subPrompt: data.subPrompt,
        pdfUrl: data.pdfUrl,
        contentCode: data.contentCode,
        createdAt: data.createdAt?.toDate() || new Date(), 
      };
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};


// **コンテンツの更新**
export const updateContent = async (contentId: string, contentName: string, subPrompt?: string, pdfUrl?: string): Promise<void> => {
  const contentRef = doc(db, "contents", contentId);
  await updateDoc(contentRef, {
    contentName,
    subPrompt,
    pdfUrl: pdfUrl || "",
  });
};

// **コンテンツの削除**
export const deleteContent = async (contentId: string): Promise<void> => {
  await deleteDoc(doc(db, "contents", contentId));
};
