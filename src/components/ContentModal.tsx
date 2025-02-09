import React, { useState, useEffect } from "react";

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContent?: { id?: string; contentName: string; subPrompt: string; pdfUrl?: string };
  onSave: (content: { id?: string; contentName: string; subPrompt: string; pdfUrl?: string }) => void;
}

export default function ContentModal({ isOpen, onClose, initialContent, onSave }: ContentModalProps) {
  const [contentName, setContentName] = useState("");
  const [subPrompt, setSubPrompt] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");

  useEffect(() => {
    if (initialContent) {
      setContentName(initialContent.contentName || "");
      setSubPrompt(initialContent.subPrompt || "");
      setPdfUrl(initialContent.pdfUrl || "");
    }
  }, [initialContent]);

  const handleSave = () => {
    if (!contentName.trim()) {
      alert("コンテンツ名を入力してください。");
      return;
    }
    onSave({ id: initialContent?.id, contentName, subPrompt, pdfUrl });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{initialContent?.id ? "コンテンツを編集" : "新しいコンテンツを追加"}</h2>

        <div className="input-group">
          <label>コンテンツ名:</label>
          <input
            type="text"
            value={contentName}
            onChange={(e) => setContentName(e.target.value)}
            placeholder="コンテンツ名を入力"
          />
        </div>

        <div className="input-group">
          <label>サブプロンプト:</label>
          <textarea
            value={subPrompt}
            onChange={(e) => setSubPrompt(e.target.value)}
            placeholder="サブプロンプトを入力してください"
            className="modal-textarea"
          />
        </div>

        {/* <div className="input-group">
          <label>PDF URL:</label>
          <input
            type="text"
            value={pdfUrl}
            onChange={(e) => setPdfUrl(e.target.value)}
            placeholder="PDFのURLを入力 (任意)"
          />
        </div> */}

        <div className="modal-buttons">
          <button className="btn-primary" onClick={handleSave}>保存</button>
          <button className="btn-danger" onClick={onClose}>キャンセル</button>
        </div>
      </div>
    </div>
  );
}
