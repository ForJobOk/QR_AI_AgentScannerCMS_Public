"use client";

import { useCallback } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createAgent, getUserAgents, updateAgent, deleteAgent } from "@/app/agentService";
import { auth } from "@/app/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import EditPromptModal from "@/components/PromptModal";
import "../globals.css";

export default function AgentsPage() {
    const router = useRouter();
    const [user, setUser] = useState<{ uid: string } | null>(null);

    interface Agent {
        id: string;
        ownerId: string;
        agentName: string;
        prompt: string;
        createdAt: Date;
    }

    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [newAgentName, setNewAgentName] = useState("");

    // 編集モード
    const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
    const [editedAgentName, setEditedAgentName] = useState("");
    const [editedPrompt, setEditedPrompt] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchAgents = useCallback(async ({ userId }: FetchAgentsProps) => {
        try {
            const agentsData = await getUserAgents(userId);
            const formattedAgents = agentsData.map(agent => ({
                ...agent,
                createdAt: agent.createdAt ? agent.createdAt.toDate() : new Date() // Timestamp → Date
            }));
            setAgents(formattedAgents);
        } catch (error) {
            console.error("エージェントの取得に失敗:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                router.push("/login");
            } else {
                setUser(currentUser);
                await fetchAgents({ userId: currentUser.uid });
            }
        });

        return () => unsubscribe();
    }, [router, fetchAgents]);

    interface FetchAgentsProps {
        userId: string;
    }

    // 新規エージェント作成
    const handleCreateAgent = async () => {
        if (!newAgentName.trim()) return;
    
        try {
            if (user) {
                const agentId = await createAgent(user.uid, newAgentName, "");
                const newAgent = {
                    id: agentId,
                    ownerId: user.uid,
                    agentName: newAgentName,
                    prompt: "",
                    createdAt: new Date(),
                };
    
                setAgents([newAgent, ...agents]);
                setNewAgentName("");
            } else {
                console.error("ユーザーが認証されていません。");
            }
        } catch (error) {
            console.error("エージェント作成エラー:", error);
        }
    };
    
    interface StartEditingProps {
        agentId: string;
        currentAgentName: string;
        currentPrompt: string;
    }

    const startEditing = ({ agentId, currentAgentName, currentPrompt }: StartEditingProps) => {
        setEditingAgentId(agentId);
        setEditedAgentName(currentAgentName);
        setEditedPrompt(currentPrompt || ""); // デフォルト値を設定
        setIsModalOpen(true);
    };

    // エージェントの更新
    const handleUpdateAgent = async () => {
        try {
            if (editingAgentId) {
                await updateAgent({ agentId: editingAgentId, newAgentName: editedAgentName, newPrompt: editedPrompt });
            } else {
                console.error("編集中のエージェントIDが無効です。");
            }
            setAgents(
                agents.map((agent) =>
                    agent.id === editingAgentId ? { ...agent, agentName: editedAgentName, prompt: editedPrompt } : agent
                )
            );
            setEditingAgentId(null);
            setIsModalOpen(false);
        } catch (error) {
            console.error("エージェントの更新失敗:", error);
        }
    };

    interface DeleteAgentProps {
        agentId: string;
    }

    // エージェントの削除
    const handleDeleteAgent = async ({ agentId }: DeleteAgentProps) => {
        const confirmDelete = window.confirm("本当にこのエージェントを削除しますか？");
        if (!confirmDelete) return;

        try {
            await deleteAgent(agentId);
            setAgents(agents.filter((agent) => agent.id !== agentId));
        } catch (error) {
            console.error("エージェントの削除に失敗:", error);
        }
    };

    // コンテンツ編集ページへ遷移
    const handleEditContent = (agentId: string) => {
        router.push(`/content?agentId=${agentId}`);
    };

    return (
        <div className="agents-container">
            <h2>AIエージェント管理</h2>
            <div className="new-agent">
                <input
                    type="text"
                    placeholder="新しいAIエージェントの名前を入力"
                    value={newAgentName}
                    onChange={(e) => setNewAgentName(e.target.value)}
                />
                <button className="btn-primary" onClick={handleCreateAgent} disabled={!newAgentName.trim()}>
                    新規エージェント作成
                </button>
            </div>
            <br />
            {loading ? (
                <p>読み込み中...</p>
            ) : (
                <div className="agent-list">
                    {agents.length > 0 ? (
                        agents.map((agent) => (
                            <div key={agent.id}className="agent-card">
                                <div className="agent-info">
                                    <p>
                                        <strong>エージェント名:</strong> {agent.agentName.length > 30 ? agent.agentName.slice(0, 30) + "..." : agent.agentName}
                                    </p>

                                </div>

                                <div className="button-container-right">
                                    <button
                                        className="btn-primary"
                                        onClick={() => startEditing({ agentId: agent.id, currentAgentName: agent.agentName, currentPrompt: agent.prompt })}
                                    >
                                        プロンプトを編集
                                    </button>
                                    <button className="btn-primary" onClick={() => handleEditContent(agent.id)}>
                                        コンテンツを編集
                                    </button>
                                    <button className="btn-danger" onClick={() => handleDeleteAgent({ agentId: agent.id })}>
                                        削除
                                    </button>
                                </div>
                            </div>

                        ))
                    ) : (
                        <p>エージェントが登録されていません。</p>
                    )}
                </div>
            )}

        
            {/* モーダルの追加 */}
            <EditPromptModal
                isOpen={isModalOpen}
                prompt={editedPrompt}
                setPrompt={setEditedPrompt}
                onClose={() => setIsModalOpen(false)}
                onSave={handleUpdateAgent}
            />
        </div>
    );
}
