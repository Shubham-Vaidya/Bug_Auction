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

    // Submission state
    const [submissions, setSubmissions] = useState({}); // { bugId: submissionObj }
    const [submitModal, setSubmitModal] = useState(null); // { bugId, bugName, purchasePrice }
    const [solutionCode, setSolutionCode] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitMsg, setSubmitMsg] = useState("");

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

    // Fetch team submissions when room is ENDED
    useEffect(() => {
        if (!user || !room || room.status !== "ENDED") return;

        const fetchSubmissions = async () => {
            try {
                const res = await fetch(`/api/submissions/team?userId=${user._id}&roomCode=${roomCode}`);
                const data = await res.json();
                if (data.success) {
                    const map = {};
                    data.submissions.forEach((s) => {
                        // Key by the bug's string bugId (e.g. "BUG-001")
                        map[s.bugId?.bugId || s.bugTitle] = s;
                    });
                    setSubmissions(map);
                }
            } catch (err) {
                console.error("Failed to fetch submissions", err);
            }
        };

        fetchSubmissions();
        const interval = setInterval(fetchSubmissions, 5000);
        return () => clearInterval(interval);
    }, [user, room, roomCode]);

    const handleSubmit = async () => {
        if (!solutionCode.trim() || !submitModal) return;
        setSubmitting(true);
        setSubmitMsg("");
        try {
            const res = await fetch("/api/submissions/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user._id,
                    roomCode,
                    bugStringId: submitModal.bugStringId,
                    solutionCode,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setSubmitMsg("✅ Solution submitted successfully!");
                // Refresh submissions
                const r = await fetch(`/api/submissions/team?userId=${user._id}&roomCode=${roomCode}`);
                const d = await r.json();
                if (d.success) {
                    const map = {};
                    d.submissions.forEach((s) => { map[s.bugId?.bugId || s.bugTitle] = s; });
                    setSubmissions(map);
                }
                setTimeout(() => { setSubmitModal(null); setSolutionCode(""); setSubmitMsg(""); }, 1500);
            } else {
                setSubmitMsg(`❌ ${data.error}`);
            }
        } catch (err) {
            setSubmitMsg("❌ Failed to submit. Try again.");
        }
        setSubmitting(false);
    };

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

    const isEnded = room?.status === "ENDED";

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
                    {/* Left: Live Bug + Team Portfolio (Purchased Bugs) */}
                    <div className="panel">
                        {/* LIVE BUG Section */}
                        <div className="card" style={{ marginBottom: '4px', border: 'none', boxShadow: 'none' }}>
                            <div className="panel-title underline-blue">Live Auction</div>
                            <h3 className="orbitron mb-20 neon-blue" style={{ fontSize: '1rem' }}>LIVE BUG</h3>

                            {room?.activeBug ? (() => {
                                const ab = room.activeBug;
                                const diffColor = ab.difficulty === "Expert" ? "neon-purple" : ab.difficulty === "Hard" ? "neon-amber" : ab.difficulty === "Medium" ? "neon-blue" : "neon-green";
                                return (
                                    <div className="bug-card" style={{ marginBottom: 0, border: '1px solid rgba(0,242,255,0.35)', background: 'rgba(0,242,255,0.04)' }}>
                                        <div className="bug-card-id">BUG ID: {ab.bugId} &nbsp; {ab.tag}</div>
                                        <div className="bug-card-name">{ab.name}</div>
                                        <div className="text-xs text-sec mb-12">{ab.description}</div>
                                        <div className="bug-card-meta">
                                            <div className="bug-meta-item">
                                                <span className="bug-meta-label">Market Value</span>
                                                <span className="bug-meta-value neon-green">₹{ab.marketValue?.toLocaleString()}</span>
                                            </div>
                                            <div className="bug-meta-item">
                                                <span className="bug-meta-label">Difficulty</span>
                                                <span className={`bug-meta-value ${diffColor}`}>{ab.difficulty}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })() : (
                                <div className="text-center" style={{ padding: '32px 20px' }}>
                                    <div style={{ fontSize: '1.8rem', marginBottom: '12px' }}>🔍</div>
                                    <div className="text-sec" style={{ fontSize: '0.85rem' }}>
                                        {isEnded ? "Auction has ended." : "Waiting for admin to reveal a bug..."}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* BUGS ACQUIRED Section */}
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
                                    // Find submission by matching bugId string (e.g. "BUG-001")
                                    const submissionEntry = submissions[p.bugId];

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

                                            {/* Submission Status + Score/Profit */}
                                            {isEnded && (
                                                <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
                                                    {!submissionEntry ? (
                                                        <button
                                                            className="btn btn-blue btn-sm"
                                                            style={{ width: '100%' }}
                                                            onClick={() => {
                                                                setSubmitModal({ bugId: p.bugId, bugStringId: p.bugId, bugName: p.bugName, purchasePrice: p.price });
                                                                setSolutionCode("");
                                                                setSubmitMsg("");
                                                            }}
                                                        >
                                                            📤 SUBMIT SOLUTION
                                                        </button>
                                                    ) : submissionEntry.status === "pending" ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                                            <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>⏳ SUBMITTED — AWAITING SCORE</span>
                                                            <button
                                                                className="btn btn-blue btn-sm"
                                                                onClick={() => {
                                                                    setSubmitModal({ bugId: p.bugId, bugStringId: p.bugId, bugName: p.bugName, purchasePrice: p.price });
                                                                    setSolutionCode(submissionEntry.solutionCode || "");
                                                                    setSubmitMsg("");
                                                                }}
                                                                style={{ fontSize: '0.65rem', padding: '4px 10px' }}
                                                            >
                                                                ✏️ Edit
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <span className="bug-meta-label">Admin Score</span>
                                                                <span className="bug-meta-value neon-purple">{submissionEntry.adminScore} pts</span>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <span className="bug-meta-label">Profit</span>
                                                                <span className={`bug-meta-value ${submissionEntry.profit >= 0 ? 'neon-green' : 'neon-amber'}`}>
                                                                    {submissionEntry.profit >= 0 ? '+' : ''}₹{submissionEntry.profit?.toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <span className="badge badge-green" style={{ fontSize: '0.62rem', alignSelf: 'flex-start' }}>✅ SCORED</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>


                    {/* Right: Leaderboard + Stats */}
                    <div className="panel">
                        <div className="card border-white-subtle">
                            <div className="panel-title mb-16" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>Live Rankings</div>
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
                            <div className="card border-white-subtle">
                                <div className="panel-title mb-16" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>Your Stats</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    <div className="stats-row-item">
                                        <span className="text-xs text-sec" style={{ letterSpacing: '1.5px' }}>TEAM</span>
                                        <span className="font-bold orbitron neon-blue" style={{ fontSize: '0.9rem' }}>{myData.teamName}</span>
                                    </div>
                                    <div className="stats-row-item">
                                        <span className="text-xs text-sec" style={{ letterSpacing: '1.5px' }}>WALLET</span>
                                        <span className="orbitron neon-green">₹{myData.coins?.toLocaleString()}</span>
                                    </div>
                                    <div className="stats-row-item">
                                        <span className="text-xs text-sec" style={{ letterSpacing: '1.5px' }}>BUGS WON</span>
                                        <span className="orbitron neon-purple">{myData.bugsWon}</span>
                                    </div>
                                    <div className="stats-row-item">
                                        <span className="text-xs text-sec" style={{ letterSpacing: '1.5px' }}>ROOM</span>
                                        <span className="mono neon-amber" style={{ fontSize: '0.82rem' }}>{room?.roomId || roomCode}</span>
                                    </div>
                                    {/* Profit summary */}
                                    {isEnded && Object.values(submissions).some(s => s.status === "scored") && (
                                        <>
                                            <div className="stats-row-item">
                                                <span className="text-xs text-sec" style={{ letterSpacing: '1.5px' }}>TOTAL PROFIT</span>
                                                <span className="orbitron neon-green">
                                                    ₹{Object.values(submissions).filter(s => s.status === "scored").reduce((acc, s) => acc + (s.profit || 0), 0).toLocaleString()}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Submit Solution Modal */}
            {submitModal && (
                <div className="modal-overlay active">
                    <div className="modal-box" style={{ maxWidth: '560px', width: '90%' }}>
                        <h3 className="orbitron neon-blue" style={{ marginBottom: '8px' }}>📤 SUBMIT SOLUTION</h3>
                        <div className="text-xs text-sec" style={{ marginBottom: '20px' }}>
                            {submitModal.bugId} — {submitModal.bugName} · Paid: ₹{submitModal.purchasePrice?.toLocaleString()}
                        </div>

                        <div className="input-group">
                            <label className="input-label">Your Solution Code</label>
                            <textarea
                                className="input"
                                rows={10}
                                placeholder="Paste your solution code here..."
                                value={solutionCode}
                                onChange={(e) => setSolutionCode(e.target.value)}
                                style={{
                                    fontFamily: 'monospace',
                                    fontSize: '0.82rem',
                                    resize: 'vertical',
                                    minHeight: '180px',
                                    lineHeight: '1.5',
                                }}
                            />
                        </div>

                        {submitMsg && (
                            <div style={{ fontSize: '0.82rem', marginBottom: '12px', color: submitMsg.startsWith('✅') ? 'var(--neon-green)' : 'var(--neon-amber)' }}>
                                {submitMsg}
                            </div>
                        )}

                        <div className="btn-row mt-24">
                            <button
                                className="btn btn-green flex-1"
                                onClick={handleSubmit}
                                disabled={submitting || !solutionCode.trim()}
                            >
                                {submitting ? "SUBMITTING..." : "CONFIRM SUBMIT"}
                            </button>
                            <button className="btn btn-purple flex-1" onClick={() => { setSubmitModal(null); setSolutionCode(""); setSubmitMsg(""); }}>
                                CANCEL
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
