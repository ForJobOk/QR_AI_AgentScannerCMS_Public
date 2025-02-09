import React from "react";

interface EditPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  setPrompt: (value: string) => void;
  onSave: () => void;
}

export default function EditPromptModal({ isOpen, onClose, prompt, setPrompt, onSave }: EditPromptModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>プロンプトを編集</h2>
        <textarea
          value={prompt || ""}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="プロンプトを入力してください"
          className="modal-textarea"
        />
        <div className="modal-buttons">
          <button className="btn-primary" onClick={onSave}>保存</button>
          <button className="btn-danger" onClick={onClose}>キャンセル</button>
        </div>
      </div>
    </div>
  );
}
