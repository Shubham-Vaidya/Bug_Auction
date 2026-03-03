"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [teamName, setTeamName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, teamName, password }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error); setLoading(false); return; }

            localStorage.setItem("user", JSON.stringify(data.user));
            router.push("/join-room");
        } catch (err) {
            setError("Connection failed.");
            setLoading(false);
        }
    };

    return (
        <div className="screen-center">
            <div className="card join-card border-purple pulse-purple slide-up">
                <div className="text-xs text-sec mb-8" style={{ letterSpacing: '3px', cursor: 'pointer' }} onClick={() => router.push("/")}>
                    ← BACK TO PORTAL
                </div>
                <h1 className="orbitron neon-purple">TEAM REGISTRATION</h1>
                <p className="subtitle">CREATE YOUR TEAM PROFILE</p>

                {error && (
                    <div style={{ padding: '10px 14px', borderRadius: '6px', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff4444', fontSize: '0.85rem', marginBottom: '16px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignup} style={{ marginTop: '32px' }}>
                    <div className="input-group">
                        <label className="input-label">Username</label>
                        <input type="text" className="input" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Team Name</label>
                        <input type="text" className="input" placeholder="e.g. Shadow Coders" value={teamName} onChange={(e) => setTeamName(e.target.value)} required />
                    </div>
                    <div className="input-group mb-32">
                        <label className="input-label">Password</label>
                        <input type="password" className="input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-purple btn-full" disabled={loading}>
                        {loading ? "CREATING..." : "CREATE TEAM PROFILE →"}
                    </button>
                </form>

                <p className="mt-20 text-xs text-sec text-center cursor-pointer" onClick={() => router.push("/join-room")}>
                    Already registered? Join a room →
                </p>
            </div>
        </div>
    );
}
