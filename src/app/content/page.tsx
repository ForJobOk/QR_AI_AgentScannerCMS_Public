"use client";

import { useState, useEffect } from "react";
import QRComponent from "@/components/CreateQR";
import { createContent, getAgentContents, updateContent, deleteContent } from "@/app/contentService";
import { getAgentById } from "@/app/agentService";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/app/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { User } from "firebase/auth";
import ContentModal from "@/components/ContentModal";

export default function ContentManagement() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const agentId = searchParams.get("agentId");

  const [, setUser] = useState<User | null>(null);
  const [agentName, setAgentName] = useState<string>("");
  const [agentPrompt, setAgentPrompt] = useState<string>("");
  const [contents, setContents] = useState<
    { id: string; contentName: string; subPrompt: string; pdfUrl?: string; contentCode: string }[]
  >([]);
  const [selectedContent, setSelectedContent] = useState<
    { id?: string; contentName: string; subPrompt: string; pdfUrl?: string } | undefined
  >(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        if (agentId) {
          await fetchAgentData(agentId);;
          await fetchContents(agentId);
        }
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router, agentId]);

  const fetchAgentData = async (agentId: string) => {
    try {
      const agent = await getAgentById(agentId);
      if (agent) {
        setAgentName(agent.agentName || "未設定のエージェント"); // 🔹 エージェント名を取得
        setAgentPrompt(agent.prompt || "プロンプトが設定されていません");
      }
    } catch (error) {
      console.error("エージェントの取得エラー:", error);
    }
  };

  const fetchContents = async (agentId: string) => {
    try {
      const data = await getAgentContents(agentId);
      setContents(
        data.map((doc) => ({
          id: doc.id,
          contentName: doc.contentName || "無題のコンテンツ",
          subPrompt: doc.subPrompt || "",
          pdfUrl: doc.pdfUrl || "",
          contentCode: doc.contentCode || "",
          createdAt: doc.createdAt || new Date(),
        }))
      );
    } catch (error) {
      console.error("コンテンツ取得エラー:", error);
    }
  };

  const handleAddContent = () => {
    setSelectedContent({ contentName: "", subPrompt: "", pdfUrl: "" });
    setIsModalOpen(true);
  };

  const handleEditContent = (content: { id: string; contentName: string; subPrompt: string; pdfUrl?: string }) => {
    setSelectedContent(content);
    setIsModalOpen(true);
  };

  const handleDeleteContent = async (contentId: string) => {
    const confirmDelete = window.confirm("本当にこのコンテンツを削除しますか？");
    if (!confirmDelete) return;

    try {
      await deleteContent(contentId);
      setContents(contents.filter((content) => content.id !== contentId));
    } catch (error) {
      console.error("コンテンツ削除エラー:", error);
    }
  };

  const handleSaveContent = async (content: { id?: string; contentName: string; subPrompt: string; pdfUrl?: string }) => {
    try {
      if (content.id) {
        await updateContent(content.id, content.contentName, content.subPrompt, content.pdfUrl);
        setContents(contents.map((c) => (c.id === content.id ? { ...content, id: c.id, contentCode: c.contentCode } : c)));
      } else {
        if (!agentId) {
          console.error("agentId が取得できませんでした。");
          return;
        }

        const contentId = await createContent(agentId, content.contentName, content.subPrompt, content.pdfUrl || "");
        const newContent = {
          id: contentId,
          contentCode: "",
          createdAt: new Date(),
          ...content,
        };

        setContents([newContent, ...contents]);
      }
      setIsModalOpen(false);
      if (agentId) fetchContents(agentId);
    } catch (error) {
      console.error("コンテンツ保存エラー:", error);
    }
  };

  return (
    <div className="content-management-container">
      <h2>コンテンツ管理</h2>

      <h3 className="agent-name"><strong>エージェント名：</strong> {agentName}</h3>
      <br />
      <hr></hr>
      <br />
      <div className="agent-prompt-container">
        <strong>エージェントのプロンプト</strong>
        <br />
        <p className="agent-prompt">
          {agentPrompt}
        </p>
      </div>
      <br />
      <br />
      <hr />
      <br />
      <br />
      <h3>登録済みコンテンツ</h3>
      <div className="button-container-right">
        <button onClick={handleAddContent} className="btn-primary">
          コンテンツ追加
        </button>
      </div>

      <ul className="content-list">
        {contents.map((content, index) => (
          <li key={content.id || `temp-${index}`} className="content-item">
            <p><strong>コンテンツ名:</strong> {content.contentName}</p>
            <p><strong>サブプロンプト</strong> </p>
            <p>{content.subPrompt}</p>

            {/* {content.pdfUrl ? (
              <p>
                <strong>PDF:</strong> <a href={content.pdfUrl} target="_blank" rel="noopener noreferrer">PDFを開く</a>
              </p>
            ) : (
              <p>PDFなし</p>
            )} */}

            <div className="qr-code-container">
              <QRComponent contentCode={content.contentCode} contentName={content.contentName} />
            </div>

            <div className="button-container-right">
              <button className="btn-primary" onClick={() => handleEditContent(content)}>編集</button>
              <button className="btn-danger" onClick={() => handleDeleteContent(content.id)}>削除</button>
            </div>
          </li>
        ))}
      </ul>

      <ContentModal isOpen={isModalOpen} initialContent={selectedContent} onClose={() => setIsModalOpen(false)} onSave={handleSaveContent} />
    </div>
  );
}
