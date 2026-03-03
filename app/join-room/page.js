"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinRoomPage() {
    const router = useRouter();
    const [roomId, setRoomId] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleJoin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const userData = localStorage.getItem("user");
        if (!userData) { setError("Please signup first."); setLoading(false); return; }
        const user = JSON.parse(userData);

        try {
            const res = await fetch("/api/rooms/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomCode: roomId.toUpperCase(), userId: user._id }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error); setLoading(false); return; }

            router.push(`/team/${roomId.toUpperCase()}`);
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
                <h1 className="orbitron neon-purple">TEAM UPLINK</h1>
                <p className="subtitle">CONNECT TO ACTIVE ARENA</p>

                {error && (
                    <div style={{ padding: '10px 14px', borderRadius: '6px', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff4444', fontSize: '0.85rem', marginBottom: '16px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleJoin} style={{ marginTop: '32px' }}>
                    <div className="input-group mb-32">
                        <label className="input-label">Room ID</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="e.g. ARENA-X7K2"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                            style={{ fontSize: '1.2rem', textAlign: 'center', letterSpacing: '3px', fontFamily: "'Space Mono', monospace" }}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-purple btn-full" disabled={loading}>
                        {loading ? "CONNECTING..." : "ESTABLISH CONNECTION →"}
                    </button>
                </form>

                <p className="mt-20 text-xs text-sec text-center cursor-pointer" onClick={() => router.push("/signup")}>
                    Need an account? Register →
                </p>
            </div>
        </div>
    );
}
