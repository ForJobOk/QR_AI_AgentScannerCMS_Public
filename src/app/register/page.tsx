"use client";

import { useState } from "react";
import { register } from "@/app/auth"; // Firebaseの登録処理
import { useRouter } from "next/navigation";
import "./../globals.css";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true); // ローディング状態を開始

    try {
      await register(email, password);
      router.push("/agent"); 
    } catch (err) {
      console.error("新規登録エラー:", err);
      setError("新規登録に失敗しました。メールアドレスが既に使用されているか、パスワードが弱すぎます。");
    } finally {
      setLoading(false); // ローディング状態を終了
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>新規登録</h2>
        <p>アカウントを作成して始めましょう。</p>
        <form onSubmit={handleRegister}>
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="error">{error}</p>}
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "登録中..." : "新規登録"}
          </button>
        </form>
        <p className="toggle-text">
          既にアカウントをお持ちですか？{" "}
          <a href="/login" className="toggle-link">ログイン</a>
        </p>
      </div>
    </div>
  );
}
