"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [teams, setTeams] = useState([]);
    const [bugs, setBugs] = useState([]);
    const [feedLog, setFeedLog] = useState([]);
    const [auctionPhase, setAuctionPhase] = useState("WAITING");

    // Create room form
    const [roomName, setRoomName] = useState("");
    const [coinsPerTeam, setCoinsPerTeam] = useState(5000);

    // Active (shown) bug
    const [activeBugId, setActiveBugId] = useState(null);

    // Allot modal
    const [allotModal, setAllotModal] = useState(null); // { bug, teamPlayerId, price }
    const [allotPrice, setAllotPrice] = useState(0);
    const [allotTeamId, setAllotTeamId] = useState("");

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (!userData) { router.push("/admin/login"); return; }
        const parsed = JSON.parse(userData);
        if (parsed.role !== "admin") { router.push("/admin/login"); return; }
        setUser(parsed);
    }, [router]);

    const addFeed = useCallback((msg, type = "") => {
        const time = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
        setFeedLog((prev) => [{ msg, type, time }, ...prev].slice(0, 25));
    }, []);

    // Fetch rooms
    const fetchRooms = useCallback(async () => {
        if (!user) return;
        try {
            const res = await fetch(`/api/admin/rooms?userId=${user._id}`);
            const data = await res.json();
            if (data.success) setRooms(data.rooms);
        } catch (err) { console.error(err); }
    }, [user]);

    // Fetch teams
    const fetchTeams = useCallback(async () => {
        if (!selectedRoom) return;
        try {
            const res = await fetch(`/api/rooms/${selectedRoom.roomId}/teams`);
            const data = await res.json();
            if (data.success) setTeams(data.teams);
        } catch (err) { console.error(err); }
    }, [selectedRoom]);


    // Fetch bugs
    const fetchBugs = useCallback(async () => {
        try {
            const res = await fetch("/api/bugs/list");
            const data = await res.json();
            if (data.success) setBugs(data.bugs);
        } catch (err) { console.error(err); }
    }, []);

    useEffect(() => { fetchRooms(); fetchBugs(); }, [fetchRooms, fetchBugs]);
    useEffect(() => {
        if (!selectedRoom) return;
        fetchTeams();
        const interval = setInterval(fetchTeams, 3000);
        return () => clearInterval(interval);
    }, [selectedRoom, fetchTeams]);

    const handleCreateRoom = async () => {
        if (!roomName.trim()) return;
        try {
            const res = await fetch("/api/rooms/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomName, coinsPerTeam, userId: user._id }),
            });
            const data = await res.json();
            if (data.success) {
                addFeed(`Room created: ${data.room.roomCode}`, "green");
                setSelectedRoom(data.room);
                setRoomName("");
                fetchRooms();
            }
        } catch (err) { addFeed("Failed to create room", "amber"); }
    };

    const handleSeedBugs = async () => {
        try {
            const res = await fetch("/api/bugs/seed", { method: "POST" });
            const data = await res.json();
            if (data.success) {
                addFeed(data.message, "green");
                fetchBugs();
            }
        } catch (err) { addFeed("Failed to seed bugs", "amber"); }
    };

    const handleShowBug = async (bug) => {
        if (!selectedRoom) return;
        try {
            const res = await fetch(`/api/rooms/${selectedRoom.roomId}/show`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user._id, bugId: bug._id }),
            });
            const data = await res.json();
            if (data.success) {
                setActiveBugId(bug._id);
                addFeed(`🔴 LIVE: ${bug.bugId} – ${bug.name}`, "blue");
            } else {
                addFeed(data.error, "amber");
            }
        } catch (err) { addFeed("Failed to reveal bug", "amber"); }
    };

    const handleAllot = async () => {
        if (!allotModal || !allotTeamId) return;
        try {
            const res = await fetch(`/api/rooms/${selectedRoom.roomId}/allot`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user._id,
                    teamPlayerId: allotTeamId,
                    bugId: allotModal._id,
                    price: allotPrice,
                }),
            });

            const data = await res.json();
            if (data.success) {
                addFeed(data.message, "purple");
                setAllotModal(null);
                fetchTeams();
            } else {
                addFeed(data.error, "amber");
            }
        } catch (err) { addFeed("Failed to allot bug", "amber"); }
    };

    const updateRoomStatus = async (newStatus) => {
        if (!selectedRoom) return;
        try {
            const res = await fetch(`/api/rooms/${selectedRoom.roomId}/status`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus, userId: user._id }),
            });
            const data = await res.json();
            if (data.success) {
                setAuctionPhase(newStatus);
                addFeed(`Room status: ${newStatus}`, newStatus === "LIVE" ? "green" : newStatus === "PAUSED" ? "amber" : "blue");
                fetchRooms();
            } else {
                addFeed(data.error, "amber");
            }
        } catch (err) { addFeed("Failed to update status", "amber"); }
    };

    const PHASE_STYLE = {
        WAITING: { cls: "badge-gray", label: "⏳ WAITING" },
        LIVE: { cls: "badge-green", label: "🟢 LIVE" },
        PAUSED: { cls: "badge-amber", label: "⏸ PAUSED" },
        ENDED: { cls: "badge-blue", label: "🏁 ENDED" },
    };
    const phase = PHASE_STYLE[auctionPhase] || PHASE_STYLE.WAITING;

    if (!user) return null;

    return (
        <>
            {/* Top Bar */}
            <div className="top-bar">
                <div className="top-bar-title neon-green">⚡ BUG AUCTION ARENA</div>
                <div className="top-bar-center">
                    {selectedRoom && (
                        <div className="room-chip">
                            <div className="room-chip-dot"></div>
                            ROOM: {selectedRoom.roomId}
                        </div>
                    )}

                    <span className={`badge ${phase.cls}`} style={{ fontSize: '0.62rem', padding: '5px 13px', letterSpacing: '1px' }}>
                        STATUS: {phase.label}
                    </span>
                </div>
                <div className="btn-row">
                    <button className="btn btn-purple btn-sm" onClick={() => { localStorage.removeItem("user"); router.push("/"); }}>
                        LOGOUT
                    </button>
                </div>
            </div>

            {/* Page Content */}
            <div className="page">
                <div className="admin-grid">

                    {/* LEFT PANEL: Room Control */}
                    <div className="panel">
                        <div className="card border-green">
                            <div className="panel-title">Room Control</div>
                            <h3 className="orbitron mb-20" style={{ fontSize: '0.95rem' }}>ARENA MANAGER</h3>

                            <div className="input-group">
                                <label className="input-label">Room Name</label>
                                <input type="text" className="input" placeholder="Enter room name" value={roomName} onChange={(e) => setRoomName(e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Coins Per Team</label>
                                <input type="number" className="input" value={coinsPerTeam} onChange={(e) => setCoinsPerTeam(parseInt(e.target.value) || 0)} />
                            </div>
                            <button className="btn btn-green btn-full mb-16" onClick={handleCreateRoom} disabled={!roomName.trim()}>
                                ＋ CREATE NEW ROOM
                            </button>

                            {selectedRoom && (
                                <div style={{ padding: '14px 16px', borderRadius: '8px', background: 'rgba(0,255,65,0.06)', border: '1px solid rgba(0,255,65,0.2)', marginBottom: '24px' }}>
                                    <div className="text-xs text-sec mb-8" style={{ letterSpacing: '2px' }}>ACTIVE ROOM</div>
                                    <div className="orbitron neon-green" style={{ fontSize: '1.3rem', letterSpacing: '4px' }}>{selectedRoom.roomId}</div>
                                    <div className="text-xs text-sec mt-4">₹{selectedRoom.coinsPerTeam?.toLocaleString()} per team</div>
                                    <button
                                        className="btn btn-purple btn-full mt-16"
                                        onClick={() => window.open(`/leaderboard/${selectedRoom.roomId}`, "_blank")}
                                    >
                                        🏆 VIEW LEADERBOARD
                                    </button>
                                </div>
                            )}


                            <div className="section-divider"></div>

                            {/* Room List */}
                            <div className="panel-title mb-12">Your Rooms</div>
                            {rooms.length === 0 ? (
                                <div className="text-xs text-sec">No rooms created yet</div>
                            ) : (
                                rooms.map((r) => (
                                    <div key={r._id} className="team-item" style={{ cursor: 'pointer', border: selectedRoom?._id === r._id ? '1px solid var(--neon-green)' : '1px solid var(--border-subtle)' }} onClick={() => { setSelectedRoom(r); setAuctionPhase(r.status); }}>
                                        <div>
                                            <div className="mono" style={{ fontSize: '0.85rem', fontWeight: 600 }}>{r.roomId}</div>
                                            <div className="text-xs text-sec">{r.roomName}</div>
                                        </div>

                                        <span className={`badge ${r.status === 'LIVE' ? 'badge-green' : r.status === 'ENDED' ? 'badge-blue' : 'badge-gray'}`}>
                                            {r.status}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Joined Teams */}
                        {selectedRoom && (
                            <div className="card">
                                <div className="panel-title mb-16">Joined Teams ({teams.length})</div>
                                {teams.length === 0 ? (
                                    <div className="text-xs text-sec">No teams joined yet</div>
                                ) : (
                                    teams.map((t) => (
                                        <div key={t._id} className="team-item">
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <div className={`team-dot ${t.status === 'online' ? 'online' : 'idle'}`}></div>
                                                <div>
                                                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{t.teamName}</div>
                                                    <div className="text-xs text-sec">₹{t.coins?.toLocaleString()}</div>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="badge badge-green">{t.bugsWon} bugs</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* CENTER PANEL: Bug List + Allot */}
                    <div className="panel">
                        <div className="card">
                            <div className="panel-title">Auction Control</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 className="orbitron" style={{ fontSize: '0.95rem' }}>BUG MARKETPLACE</h3>
                                <button className="btn btn-blue btn-sm" onClick={handleSeedBugs}>🐛 SEED BUGS</button>
                            </div>

                            {/* Auction Phase Controls */}
                            <div style={{ marginBottom: '16px' }}>
                                <div className="panel-title mb-12">Auction Phase</div>
                                <div className="btn-row">
                                    <button className="btn btn-green btn-sm" style={{ color: '#fff !important' }} onClick={() => updateRoomStatus("LIVE")} disabled={auctionPhase === "LIVE"}>▶ START</button>
                                    <button className="btn btn-amber btn-sm" style={{ color: '#fff !important' }} onClick={() => updateRoomStatus("PAUSED")} disabled={auctionPhase !== "LIVE"}>⏸ PAUSE</button>
                                    <button className="btn btn-blue btn-sm" style={{ color: '#fff !important' }} onClick={() => updateRoomStatus("ENDED")} disabled={auctionPhase === "ENDED"}>🏁 END</button>
                                </div>
                            </div>

                            <div className="section-divider"></div>

                            {/* Bug Cards */}
                            {bugs.length === 0 ? (
                                <div className="text-xs text-sec text-center" style={{ padding: '24px' }}>
                                    No bugs loaded. Click &quot;SEED BUGS&quot; to load the bug pool.
                                </div>
                            ) : (
                                bugs.map((bug) => {
                                    const diffColor = bug.difficulty === "Expert" ? "neon-purple" : bug.difficulty === "Hard" ? "neon-amber" : bug.difficulty === "Medium" ? "neon-blue" : "neon-green";
                                    return (
                                        <div key={bug._id} className="bug-card" style={{ marginBottom: '16px' }}>
                                            <div className="bug-card-id">BUG ID: {bug.bugId} &nbsp; {bug.tag}</div>
                                            <div className="bug-card-name">{bug.name}</div>
                                            <div className="text-xs text-sec mb-12">{bug.description}</div>
                                            <div className="bug-card-meta">
                                                <div className="bug-meta-item">
                                                    <span className="bug-meta-label">Market Value</span>
                                                    <span className={`bug-meta-value neon-green`}>₹{bug.marketValue?.toLocaleString()}</span>
                                                </div>
                                                <div className="bug-meta-item">
                                                    <span className="bug-meta-label">Difficulty</span>
                                                    <span className={`bug-meta-value ${diffColor}`}>{bug.difficulty}</span>
                                                </div>
                                                <div className="bug-meta-item" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                                    {selectedRoom && (
                                                        <button
                                                            className="btn btn-blue btn-sm"
                                                            onClick={() => handleShowBug(bug)}
                                                            style={activeBugId === bug._id ? { background: 'var(--neon-blue)', color: '#000' } : {}}
                                                        >
                                                            {activeBugId === bug._id ? '🔴 LIVE' : '👁 SHOW'}
                                                        </button>
                                                    )}
                                                    {selectedRoom && teams.length > 0 && (
                                                        <button className="btn btn-purple btn-sm" onClick={() => { setAllotModal(bug); setAllotPrice(bug.marketValue); setAllotTeamId(teams[0]?._id || ""); }}>
                                                            🎯 ALLOT
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* RIGHT PANEL: Activity Feed */}
                    <div className="panel">
                        <div className="card" style={{ padding: '24px 22px' }}>
                            <div className="panel-title">Live Feed</div>
                            <h3 className="orbitron mb-20" style={{ fontSize: '0.9rem' }}>ACTIVITY LOG</h3>
                            <div className="feed" style={{ maxHeight: '480px', overflowY: 'auto' }}>
                                {feedLog.length === 0 ? (
                                    <div className="text-xs text-sec">Waiting for activity...</div>
                                ) : (
                                    feedLog.map((f, i) => (
                                        <div key={i} className={`feed-item ${f.type}`}>
                                            {f.msg}
                                            <div className="feed-time">{f.time}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="card">
                            <div className="panel-title mb-16">Session Stats</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
                                    <span className="text-xs text-sec" style={{ letterSpacing: '1.5px' }}>ROOMS</span>
                                    <span className="orbitron neon-green">{rooms.length}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
                                    <span className="text-xs text-sec" style={{ letterSpacing: '1.5px' }}>TEAMS</span>
                                    <span className="orbitron neon-purple">{teams.length}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
                                    <span className="text-xs text-sec" style={{ letterSpacing: '1.5px' }}>BUGS</span>
                                    <span className="orbitron neon-blue">{bugs.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Allot Modal */}
            {allotModal && (
                <div className="modal-overlay active">
                    <div className="modal-box">
                        <h3 className="orbitron neon-purple">ALLOT BUG TO TEAM</h3>
                        <div className="bug-card" style={{ marginBottom: '20px' }}>
                            <div className="bug-card-id">{allotModal.bugId} {allotModal.tag}</div>
                            <div className="bug-card-name">{allotModal.name}</div>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Select Team</label>
                            <select className="input" value={allotTeamId} onChange={(e) => setAllotTeamId(e.target.value)}>
                                {teams.map((t) => (
                                    <option key={t._id} value={t._id}>{t.teamName} — ₹{t.coins?.toLocaleString()}</option>
                                ))}
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Allot Price (₹)</label>
                            <input type="number" className="input" value={allotPrice} onChange={(e) => setAllotPrice(parseInt(e.target.value) || 0)} />
                        </div>
                        <div className="btn-row mt-24">
                            <button className="btn btn-green flex-1" onClick={handleAllot}>CONFIRM ALLOT</button>
                            <button className="btn btn-purple flex-1" onClick={() => setAllotModal(null)}>CANCEL</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
