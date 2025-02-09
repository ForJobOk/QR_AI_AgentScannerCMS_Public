import Link from 'next/link';

export default function HomePage() {
    return (
        <div className="home-container">
            <div className="hero">
                <h1>AIエージェント管理CMS</h1>
                <p>簡単にAIエージェントを作成し、管理できるCMSです。</p>
                <div className="button-container">
                    <Link href="/login" className="link">ログイン</Link>
                    <Link href="/register" className="link">新規登録</Link>
                </div>
            </div>
        </div>
    );
}
