import { db } from "./firebaseConfig";
import { Timestamp } from "firebase/firestore";
import { getAgentContents } from "./contentService"; 
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    serverTimestamp,
    doc,
    updateDoc,
    deleteDoc,
    getDoc
} from "firebase/firestore";

// **AIエージェントをFirestoreに登録**
interface Agent {
    ownerId: string;
    agentName: string;
    prompt: string;
    createdAt: Timestamp | null; // serverTimestamp type
}

export const createAgent = async (userId: string, agentName: string, prompt: string): Promise<string> => {
    const agentRef = await addDoc(collection(db, "agents"), {
        ownerId: userId,
        agentName,
        prompt,
        createdAt: serverTimestamp(),
    } as Agent);
    return agentRef.id;
};

// **ユーザーのAIエージェント一覧を取得**
interface AgentData {
    id: string;
    ownerId: string;
    agentName: string;
    prompt: string;
    createdAt: Timestamp | null;
}

export const getUserAgents = async (userId: string): Promise<AgentData[]> => {
    const q = query(collection(db, "agents"), where("ownerId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            ownerId: data.ownerId,
            agentName: data.agentName,
            prompt: data.prompt,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt : null, 
        };
    });
};

// **agentIdからエージェントの取得**
interface AgentDetail {
    id: string;
    ownerId: string;
    agentName: string;
    prompt: string;
    createdAt: Timestamp | null;
}

export const getAgentById = async (agentId: string): Promise<AgentDetail | null> => {
    const agentRef = doc(db, "agents", agentId);
    const agentDoc = await getDoc(agentRef);
    if (agentDoc.exists()) {
        const data = agentDoc.data();
        return {
            id: agentDoc.id,
            ownerId: data.ownerId,
            agentName: data.agentName,
            prompt: data.prompt,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt : null,
        };
    } else {
        return null;
    }
};

// **AIエージェントの情報を更新**
interface UpdateAgentParams {
    agentId: string;
    newAgentName: string;
    newPrompt: string;
}

export const updateAgent = async ({ agentId, newAgentName, newPrompt }: UpdateAgentParams): Promise<void> => {
    const agentRef = doc(db, "agents", agentId);
    await updateDoc(agentRef, {
        agentName: newAgentName,
        prompt: newPrompt,
    });
};

// エージェントの削除処理。関連コンテンツも削除する。
export const deleteAgent = async (agentId: string): Promise<void> => {
    try {
        // 1. `getAgentContents` を利用して関連コンテンツを取得
        const relatedContents = await getAgentContents(agentId);

        console.log(`削除対象のコンテンツ数: ${relatedContents.length}`);

        if (relatedContents.length > 0) {
            // 2. 関連するコンテンツを削除
            for (const content of relatedContents) {
                await deleteDoc(doc(db, "contents", content.id));
            }
        } else {
            console.log("関連コンテンツが見つかりませんでした");
        }

        // 3. エージェント削除
        await deleteDoc(doc(db, "agents", agentId));
    } catch (error) {
        console.error("エージェントと関連コンテンツの削除に失敗:", error);
        throw error;
    }
};

