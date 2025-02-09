"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChange, logout } from "../app/auth";
import { User } from "firebase/auth";

export function ClientWrapper({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isHydrated, setIsHydrated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setIsHydrated(true);
        const unsubscribe = onAuthStateChange((authUser: User | null) => {
            setUser(authUser);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        await logout();
        setUser(null);
        router.push("/");
    };

    if (!isHydrated) {
        return null;
    }

    return (
        <>
            <header className="header">
                <div className="header-container">
                    <h1>CMS管理画面</h1>
                    <nav className="nav">
                        {!user && <Link href="/">ホーム</Link>}
                        {user && <Link href="/agent">エージェント管理画面</Link>}
                        {user && <button className="logout-button" onClick={handleLogout}>ログアウト</button>}
                    </nav>
                </div>
            </header>
            <main>{children}</main>
        </>
    );
}
