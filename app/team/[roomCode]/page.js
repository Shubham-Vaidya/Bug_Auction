"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function TeamPage({ params }) {
    const { roomCode } = use(params);
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [room, setRoom] = useState(null);
    const [myData, setMyData] = useState(null);
    const [allTeams, setAllTeams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (!userData) { router.push("/signup"); return; }
        setUser(JSON.parse(userData));
    }, [router]);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                // Fetch room status
                const roomRes = await fetch(`/api/rooms/${roomCode}/status`);
                const roomData = await roomRes.json();
                if (roomData.success) setRoom(roomData.room);

                // Fetch teams
                const teamsRes = await fetch(`/api/rooms/${roomCode}/teams`);
                const teamsData = await teamsRes.json();
                if (teamsData.success) {
                    setAllTeams(teamsData.teams);
                    const me = teamsData.teams.find((t) => t.odid === user._id);
                    if (me) setMyData(me);
                }
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, [user, roomCode]);

    if (loading) {
        return (
            <div className="screen-center">
                <div className="text-sec" style={{ fontSize: '1.2rem' }}>Connecting to arena...</div>
            </div>
        );
    }

    const leaderboard = [...allTeams].sort((a, b) => {
        if (b.bugsWon !== a.bugsWon) return b.bugsWon - a.bugsWon;
        return b.coins - a.coins;
    });

    return (
        <>
            {/* Top Bar */}
            <div className="top-bar">
                <div className="top-bar-title neon-purple">👥 TEAM UPLINK</div>
                <div className="top-bar-center">
                    <div className="room-chip" style={{ borderColor: 'var(--neon-purple)', background: 'rgba(188,19,254,0.06)', color: 'var(--neon-purple)' }}>
                        <div className="room-chip-dot" style={{ background: 'var(--neon-purple)', boxShadow: '0 0 8px var(--neon-purple)' }}></div>
                        {roomCode}
                    </div>
                    {room && (
                        <span className={`badge ${room.status === 'LIVE' ? 'badge-green' : room.status === 'ENDED' ? 'badge-blue' : 'badge-gray'}`}>
                            {room.status}
                        </span>
                    )}
                </div>
                <div className="btn-row">
                    {myData && (
                        <div className="badge badge-green" style={{ padding: '8px 16px', fontSize: '0.7rem' }}>{myData.teamName}</div>
                    )}
                    <button className="btn btn-purple btn-sm" onClick={() => router.push("/")}>DISCONNECT</button>
                </div>
            </div>

            <div className="page">
                {/* Wallet */}
                {myData && (
                    <div style={{ marginBottom: '32px' }}>
                        <div className="card wallet-card border-green" style={{ display: 'inline-flex' }}>
                            <div className="wallet-icon">💰</div>
                            <div>
                                <div className="wallet-label">Wallet Balance</div>
                                <div className="wallet-value neon-green">₹{myData.coins?.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="auction-team-layout">
                    {/* Left: Team Info + Purchased Bugs */}
                    <div className="panel">
                        <div className="card border-purple pulse-purple">
                            <div className="panel-title">Your Portfolio</div>
                            <h3 className="orbitron mb-24" style={{ fontSize: '1rem' }}>BUGS ACQUIRED</h3>

                            {!myData || myData.purchases?.length === 0 ? (
                                <div className="text-center" style={{ padding: '40px 20px' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🕐</div>
                                    <div className="text-sec">No bugs acquired yet. Wait for admin to allot bugs from the auction.</div>
                                </div>
                            ) : (
                                myData.purchases?.map((p, i) => {
                                    const diffColor = p.difficulty === "Expert" ? "neon-purple" : p.difficulty === "Hard" ? "neon-amber" : p.difficulty === "Medium" ? "neon-blue" : "neon-green";
                                    return (
                                        <div key={i} className="bug-card" style={{ marginBottom: '16px' }}>
                                            <div className="bug-card-id">{p.bugId} {p.tag}</div>
                                            <div className="bug-card-name">{p.bugName}</div>
                                            <div className="bug-card-meta">
                                                <div className="bug-meta-item">
                                                    <span className="bug-meta-label">Price Paid</span>
                                                    <span className="bug-meta-value neon-green">₹{p.price?.toLocaleString()}</span>
                                                </div>
                                                <div className="bug-meta-item">
                                                    <span className="bug-meta-label">Difficulty</span>
                                                    <span className={`bug-meta-value ${diffColor}`}>{p.difficulty}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Right: Leaderboard + Stats */}
                    <div className="panel">
                        <div className="card">
                            <div className="panel-title mb-16">Live Rankings</div>
                            {leaderboard.map((t, i) => {
                                const isMe = t.odid === user?._id;
                                const rankEmoji = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
                                return (
                                    <div key={t._id} className="team-item" style={isMe ? { border: '1px solid var(--neon-purple)', background: 'rgba(188,19,254,0.06)' } : {}}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontSize: '1.1rem', width: '30px' }}>{rankEmoji}</span>
                                            <div>
                                                <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                                                    {t.teamName} {isMe && <span className="neon-purple" style={{ fontSize: '0.7rem' }}>(YOU)</span>}
                                                </div>
                                                <div className="text-xs text-sec">
                                                    {t.bugsWon} bugs · ₹{t.coins?.toLocaleString()} remaining
                                                </div>
                                            </div>
                                        </div>
                                        <span className="badge badge-green">{t.status}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Team Stats */}
                        {myData && (
                            <div className="card">
                                <div className="panel-title mb-16">Your Stats</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
                                        <span className="text-xs text-sec" style={{ letterSpacing: '1.5px' }}>TEAM</span>
                                        <span className="font-bold" style={{ fontSize: '0.9rem' }}>{myData.teamName}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
                                        <span className="text-xs text-sec" style={{ letterSpacing: '1.5px' }}>WALLET</span>
                                        <span className="orbitron neon-green">₹{myData.coins?.toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
                                        <span className="text-xs text-sec" style={{ letterSpacing: '1.5px' }}>BUGS WON</span>
                                        <span className="orbitron neon-purple">{myData.bugsWon}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
                                        <span className="text-xs text-sec" style={{ letterSpacing: '1.5px' }}>ROOM</span>
                                        <span className="mono" style={{ fontSize: '0.82rem' }}>{room?.roomId || roomCode}</span>

                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
