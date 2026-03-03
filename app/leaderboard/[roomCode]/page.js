"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function LeaderboardPage({ params }) {
    const { roomCode } = use(params);
    const router = useRouter();
    const [teams, setTeams] = useState([]);
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [roomRes, teamsRes] = await Promise.all([
                    fetch(`/api/rooms/${roomCode}/status`),
                    fetch(`/api/rooms/${roomCode}/teams`),
                ]);
                const roomData = await roomRes.json();
                const teamsData = await teamsRes.json();
                if (roomData.success) setRoom(roomData.room);
                if (teamsData.success) setTeams(teamsData.teams);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, [roomCode]);

    const sorted = [...teams].sort((a, b) => {
        if (b.bugsWon !== a.bugsWon) return b.bugsWon - a.bugsWon;
        return b.coins - a.coins;
    });

    const totalSpent = teams.reduce((acc, t) => acc + (t.purchases?.reduce((s, p) => s + (p.price || 0), 0) || 0), 0);

    if (loading) {
        return (
            <div className="screen-center">
                <div className="text-sec" style={{ fontSize: '1.2rem' }}>Loading rankings...</div>
            </div>
        );
    }

    return (
        <>
            <div className="top-bar">
                <div className="top-bar-title neon-green">⚡ BUG AUCTION ARENA</div>
                <div className="top-bar-center">
                    <div className="room-chip"><div className="room-chip-dot"></div>LIVE RANKINGS</div>
                </div>
                <button className="btn btn-purple btn-sm" onClick={() => router.push("/")}>← BACK</button>
            </div>

            <div className="page">
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <h1 className="orbitron neon-green" style={{ fontSize: '2.4rem', marginBottom: '10px' }}>🏆 GLOBAL RANKINGS</h1>
                    <p className="text-sec" style={{ letterSpacing: '4px', fontSize: '0.78rem' }}>ROOM: {room?.roomId || roomCode}</p>

                </div>

                <div className="card border-purple" style={{ padding: 0, overflow: 'hidden', marginBottom: '32px' }}>
                    <table className="lb-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Team Identity</th>
                                <th>Status</th>
                                <th>Bugs Won</th>
                                <th style={{ textAlign: 'right' }}>Remaining ₹</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((t, i) => {
                                const rank = i + 1;
                                const rankClass = rank === 1 ? "neon-green" : rank === 2 ? "neon-purple" : rank === 3 ? "neon-amber" : "text-sec";
                                return (
                                    <tr key={t._id}>
                                        <td className={`${rankClass} orbitron`} style={{ fontSize: '1.1rem' }}>#{rank}</td>
                                        <td style={{ fontWeight: 600, letterSpacing: '1px' }}>{t.teamName}</td>
                                        <td><span className={`badge ${t.status === 'online' ? 'badge-green' : 'badge-amber'}`}>{t.status?.toUpperCase()}</span></td>
                                        <td><span className="orbitron neon-blue" style={{ fontSize: '1rem' }}>{t.bugsWon}</span></td>
                                        <td style={{ textAlign: 'right' }}>
                                            <span className="neon-green orbitron mono" style={{ fontSize: '0.9rem' }}>₹{t.coins?.toLocaleString()}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="stats-row">
                    <div className="card text-center">
                        <div className="stat-label">Total Teams</div>
                        <div className="stat-value neon-green">{teams.length}</div>
                    </div>
                    <div className="card text-center">
                        <div className="stat-label">Top Team</div>
                        <div className="stat-value neon-purple" style={{ fontSize: '1.1rem' }}>{sorted[0]?.teamName || "—"}</div>
                    </div>
                    <div className="card text-center">
                        <div className="stat-label">Bugs Sold</div>
                        <div className="stat-value neon-blue">{teams.reduce((a, t) => a + t.bugsWon, 0)}</div>
                    </div>
                    <div className="card text-center">
                        <div className="stat-label">Total Revenue</div>
                        <div className="stat-value neon-amber">₹{totalSpent.toLocaleString()}</div>
                    </div>
                </div>

                <div className="btn-row btn-row-center mt-40">
                    <button className="btn btn-green" onClick={() => router.push("/")}>← BACK TO PORTAL</button>
                </div>
            </div>
        </>
    );
}
