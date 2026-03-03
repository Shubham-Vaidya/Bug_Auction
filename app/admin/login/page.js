"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error); setLoading(false); return; }
            if (data.user.role !== "admin") { setError("Access denied. Admin credentials required."); setLoading(false); return; }

            localStorage.setItem("user", JSON.stringify(data.user));
            router.push("/admin/dashboard");
        } catch (err) {
            setError("Connection failed.");
            setLoading(false);
        }
    };

    return (
        <div className="screen-center">
            <div className="card auth-card border-green pulse-green slide-up">
                <div className="text-xs text-sec mb-8" style={{ letterSpacing: '3px', cursor: 'pointer' }} onClick={() => router.push("/")}>
                    ← BACK TO PORTAL
                </div>
                <h1 className="orbitron neon-green">ADMIN ACCESS</h1>
                <p className="auth-subtitle">INITIALIZE SECURE SESSION</p>

                {error && (
                    <div style={{ padding: '10px 14px', borderRadius: '6px', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff4444', fontSize: '0.85rem', marginBottom: '16px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label className="input-label">Admin Username</label>
                        <input type="text" className="input" placeholder="Enter admin ID" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </div>
                    <div className="input-group mb-32">
                        <label className="input-label">Key Phrase / Password</label>
                        <input type="password" className="input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-green btn-full" disabled={loading}>
                        {loading ? "AUTHENTICATING..." : "INITIALIZE SESSION ⚡"}
                    </button>
                </form>

                <p className="mt-20 text-xs text-sec text-center cursor-pointer" onClick={() => router.push("/signup")}>
                    Switch to Team Access →
                </p>
            </div>
        </div>
    );
}
