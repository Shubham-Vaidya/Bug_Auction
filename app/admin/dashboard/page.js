"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import BugDetailsModal from "@/components/BugDetailsModal";

export default function AdminDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [teams, setTeams] = useState([]);
    const [bugs, setBugs] = useState([]);
    const [powerCards, setPowerCards] = useState([]);
    const [feedLog, setFeedLog] = useState([]);
    const [auctionPhase, setAuctionPhase] = useState("WAITING");
    const [powerCardPhase, setPowerCardPhase] = useState("WAITING");

    // Create room form
    const [roomName, setRoomName] = useState("");
    const [coinsPerTeam, setCoinsPerTeam] = useState(5000);

    // Active (shown) bug
    const [activeBugId, setActiveBugId] = useState(null);
    const [activePowerCardId, setActivePowerCardId] = useState(null);

    // Allot modal
    const [allotModal, setAllotModal] = useState(null); // { type, ...item }
    const [allotPrice, setAllotPrice] = useState(0);
    const [allotTeamId, setAllotTeamId] = useState("");

    // Submissions tab
    const [centerTab, setCenterTab] = useState("auction"); // "auction" | "powercards" | "submissions" | "rebidding"
    const [submissions, setSubmissions] = useState([]);
    const [scoreInputs, setScoreInputs] = useState({}); // { submissionId: scoreValue }
    const [expandedCode, setExpandedCode] = useState(null); // submissionId with code visible
    const [viewingBug, setViewingBug] = useState(null);

    // Rebidding tab
    const [rebidPool, setRebidPool] = useState([]);
    const [rebidStatus, setRebidStatus] = useState("INACTIVE"); // INACTIVE | ACCEPTING | AUCTION

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

    // Fetch power cards
    const fetchPowerCards = useCallback(async () => {
        try {
            const res = await fetch("/api/power-cards/list");
            const data = await res.json();
            if (data.success) setPowerCards(data.powerCards);
        } catch (err) { console.error(err); }
    }, []);

    // Fetch submissions
    const fetchSubmissions = useCallback(async () => {
        if (!selectedRoom || !user) return;
        try {
            const res = await fetch(`/api/submissions/admin?roomCode=${selectedRoom.roomId}&adminId=${user._id}`);
            const data = await res.json();
            if (data.success) setSubmissions(data.submissions);
        } catch (err) { console.error(err); }
    }, [selectedRoom, user]);

    // Fetch rebid pool
    const fetchRebidPool = useCallback(async () => {
        if (!selectedRoom) return;
        try {
            const res = await fetch(`/api/rebid/pool?roomCode=${selectedRoom.roomId}`);
            const data = await res.json();
            if (data.success) setRebidPool(data.pool);
        } catch (err) { console.error(err); }
    }, [selectedRoom]);

    useEffect(() => { fetchRooms(); fetchBugs(); fetchPowerCards(); }, [fetchRooms, fetchBugs, fetchPowerCards]);
    useEffect(() => {
        if (!selectedRoom) return;
        fetchTeams();
        fetchSubmissions();
        fetchRebidPool();
        setRebidStatus(selectedRoom.rebiddingStatus || "INACTIVE");
        setPowerCardPhase(selectedRoom.powerCardStatus || "WAITING");
        setActiveBugId(selectedRoom.activeBug?.bugId || null);
        setActivePowerCardId(selectedRoom.activePowerCard?.cardId || null);
        const interval = setInterval(() => { fetchTeams(); fetchSubmissions(); fetchRebidPool(); }, 3000);
        return () => clearInterval(interval);
    }, [selectedRoom, fetchTeams, fetchSubmissions, fetchRebidPool]);

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

    const handleSeedPowerCards = async () => {
        try {
            const res = await fetch("/api/power-cards/seed", { method: "POST" });
            const data = await res.json();
            if (data.success) {
                addFeed(data.message, "green");
                fetchPowerCards();
            }
        } catch (err) { addFeed("Failed to seed power cards", "amber"); }
    };

    const handleShowBug = async (bug) => {
        if (!selectedRoom) return;
        try {
            const res = await fetch(`/api/rooms/${selectedRoom.roomId}/show`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user._id, bugId: bug.bugId }),
            });
            const data = await res.json();
            if (data.success) {
                setActiveBugId(bug.bugId);
                addFeed(`🔴 LIVE: ${bug.bugId} – ${bug.name}`, "blue");
            } else {
                addFeed(data.error, "amber");
            }
        } catch (err) { addFeed("Failed to reveal bug", "amber"); }
    };

    const handleShowPowerCard = async (card) => {
        if (!selectedRoom) return;
        try {
            const res = await fetch(`/api/rooms/${selectedRoom.roomId}/show-power-card`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user._id, cardId: card.cardId }),
            });
            const data = await res.json();
            if (data.success) {
                setActivePowerCardId(card.cardId);
                addFeed(`LIVE POWER CARD: ${card.cardId} - ${card.name}`, "blue");
            } else {
                addFeed(data.error, "amber");
            }
        } catch (err) { addFeed("Failed to reveal power card", "amber"); }
    };

    const handleAllot = async () => {
        if (!allotModal || !allotTeamId || !selectedRoom) return;
        const isPowerCard = allotModal.type === "powercard";
        try {
            const res = await fetch(`/api/rooms/${selectedRoom.roomId}/${isPowerCard ? "allot-power-card" : "allot"}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user._id,
                    teamPlayerId: allotTeamId,
                    ...(isPowerCard ? { cardId: allotModal.cardId } : { bugId: allotModal.bugId }),
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
        } catch (err) { addFeed(`Failed to allot ${isPowerCard ? "power card" : "bug"}`, "amber"); }
    };

    const updateRoomStatus = async (newStatus, scope = "BUG") => {
        if (!selectedRoom) return;
        try {
            const res = await fetch(`/api/rooms/${selectedRoom.roomId}/status`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus, userId: user._id, scope }),
            });
            const data = await res.json();
            if (data.success) {
                if (scope === "POWER") {
                    setPowerCardPhase(newStatus);
                    addFeed(`Power card phase: ${newStatus}`, newStatus === "LIVE" ? "green" : "blue");
                } else {
                    setAuctionPhase(newStatus);
                    addFeed(`Bug auction status: ${newStatus}`, newStatus === "LIVE" ? "green" : newStatus === "PAUSED" ? "amber" : "blue");
                }
                fetchRooms();
            } else {
                addFeed(data.error, "amber");
            }
        } catch (err) { addFeed("Failed to update status", "amber"); }
    };

    const handleScoreSubmit = async (submissionId) => {
        const score = scoreInputs[submissionId];
        if (score === undefined || score === "") return;
        try {
            const res = await fetch("/api/submissions/score", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ submissionId, adminScore: Number(score), adminId: user._id }),
            });
            const data = await res.json();
            if (data.success) {
                addFeed(data.message, "green");
                setScoreInputs((prev) => { const n = { ...prev }; delete n[submissionId]; return n; });
                fetchSubmissions();
            } else {
                addFeed(data.error, "amber");
            }
        } catch (err) { addFeed("Failed to score submission", "amber"); }
    };

    const handleUpdateRebidStatus = async (newStatus) => {
        if (!selectedRoom) return;
        try {
            const res = await fetch("/api/rebid/status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomCode: selectedRoom.roomId, userId: user._id, status: newStatus }),
            });
            const data = await res.json();
            if (data.success) {
                setRebidStatus(newStatus);
                addFeed(`Rebidding: ${newStatus}`, "blue");
            }
        } catch (err) { addFeed("Failed to update rebid status", "amber"); }
    };

    const handleStartRebidAuction = async (rebidId) => {
        if (!selectedRoom) return;
        try {
            const res = await fetch("/api/rebid/auction", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomCode: selectedRoom.roomId, userId: user._id, rebidId }),
            });
            const data = await res.json();
            if (data.success) {
                addFeed(data.message, "blue");
            }
        } catch (err) { addFeed("Failed to start rebid auction", "amber"); }
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
                                    <div className="text-xs text-sec mt-4">Bug Phase: {auctionPhase}</div>
                                    <div className="text-xs text-sec">Power Phase: {powerCardPhase}</div>
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
                                    <div key={r._id} className="team-item" style={{ cursor: 'pointer', border: selectedRoom?._id === r._id ? '1px solid var(--neon-green)' : '1px solid var(--border-subtle)' }} onClick={() => { setSelectedRoom(r); setAuctionPhase(r.status); setPowerCardPhase(r.powerCardStatus || 'WAITING'); }}>
                                        <div>
                                            <div className="mono" style={{ fontSize: '0.85rem', fontWeight: 600 }}>{r.roomId}</div>
                                            <div className="text-xs text-sec">{r.roomName}</div>
                                            <div className="text-xs text-sec">Power: {r.powerCardStatus || "WAITING"}</div>
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

                    {/* CENTER PANEL: Bug List + Allot / Submissions */}
                    <div className="panel">
                        <div className="card">
                            {/* Tab Header */}
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                                <button
                                    className={`btn btn-sm ${centerTab === 'auction' ? 'btn-blue' : ''}`}
                                    style={centerTab !== 'auction' ? { background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-sec)' } : {}}
                                    onClick={() => setCenterTab("auction")}
                                >
                                    🎯 Auction Control
                                </button>
                                <button
                                    className={`btn btn-sm ${centerTab === 'powercards' ? 'btn-green' : ''}`}
                                    style={centerTab !== 'powercards' ? { background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-sec)' } : {}}
                                    onClick={() => setCenterTab("powercards")}
                                >
                                    ⚡ Power Cards {powerCards.length > 0 && <span className="badge badge-green" style={{ marginLeft: '6px', fontSize: '0.6rem' }}>{powerCards.length}</span>}
                                </button>
                                <button
                                    className={`btn btn-sm ${centerTab === 'submissions' ? 'btn-purple' : ''}`}
                                    style={centerTab !== 'submissions' ? { background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-sec)' } : {}}
                                    onClick={() => setCenterTab("submissions")}
                                >
                                    📋 Submissions {submissions.length > 0 && <span className="badge badge-green" style={{ marginLeft: '6px', fontSize: '0.6rem' }}>{submissions.length}</span>}
                                </button>
                                <button
                                    className={`btn btn-sm ${centerTab === 'rebidding' ? 'btn-amber' : ''}`}
                                    style={centerTab !== 'rebidding' ? { background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-sec)' } : {}}
                                    onClick={() => setCenterTab("rebidding")}
                                >
                                    ♻️ Rebidding {rebidPool.length > 0 && <span className="badge badge-amber" style={{ marginLeft: '6px', fontSize: '0.6rem' }}>{rebidPool.length}</span>}
                                </button>
                            </div>

                            {centerTab === "auction" ? (
                                <>
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
                                                <div key={bug._id} className="bug-card" style={{ marginBottom: '16px', cursor: 'pointer' }} onClick={() => setViewingBug(bug)}>
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
                                                                    onClick={(e) => { e.stopPropagation(); handleShowBug(bug); }}
                                                                    style={activeBugId === bug.bugId ? { background: 'var(--neon-blue)', color: '#000' } : {}}
                                                                >
                                                                    {activeBugId === bug.bugId ? '🔴 LIVE' : '👁 SHOW'}
                                                                </button>
                                                            )}
                                                            {selectedRoom && teams.length > 0 && (
                                                                <button className="btn btn-purple btn-sm" onClick={(e) => { e.stopPropagation(); setAllotModal({ ...bug, type: "bug" }); setAllotPrice(bug.marketValue); setAllotTeamId(teams[0]?._id || ""); }}>
                                                                    🎯 ALLOT
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </>
                            ) : centerTab === "powercards" ? (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                        <h3 className="orbitron" style={{ fontSize: '0.95rem' }}>POWER CARD MARKET</h3>
                                        <button className="btn btn-green btn-sm" onClick={handleSeedPowerCards}>⚡ SEED POWER CARDS</button>
                                    </div>

                                    <div style={{ marginBottom: '16px' }}>
                                        <div className="panel-title mb-12">Power Card Phase</div>
                                        <div className="btn-row" style={{ marginBottom: '8px' }}>
                                            <button
                                                className="btn btn-green btn-sm"
                                                style={{ color: '#fff !important' }}
                                                onClick={() => updateRoomStatus("LIVE", "POWER")}
                                                disabled={auctionPhase !== "ENDED" || powerCardPhase === "LIVE"}
                                            >
                                                ▶ START
                                            </button>
                                            <button
                                                className="btn btn-blue btn-sm"
                                                style={{ color: '#fff !important' }}
                                                onClick={() => updateRoomStatus("ENDED", "POWER")}
                                                disabled={powerCardPhase === "ENDED"}
                                            >
                                                🏁 END
                                            </button>
                                        </div>
                                        {auctionPhase !== "ENDED" && (
                                            <div className="text-xs text-sec">End bug auction first to unlock this phase.</div>
                                        )}
                                    </div>

                                    <div className="section-divider"></div>

                                    {powerCards.length === 0 ? (
                                        <div className="text-xs text-sec text-center" style={{ padding: '24px' }}>
                                            No power cards loaded. Click "SEED POWER CARDS" to load the pool.
                                        </div>
                                    ) : (
                                        powerCards.map((card) => {
                                            const rarityColor = card.rarity === "Legendary" ? "neon-purple" : card.rarity === "Epic" ? "neon-amber" : card.rarity === "Rare" ? "neon-blue" : "neon-green";
                                            return (
                                                <div key={card._id} className="bug-card" style={{ marginBottom: '16px' }}>
                                                    <div className="bug-card-id">CARD ID: {card.cardId} &nbsp; {card.tag}</div>
                                                    <div className="bug-card-name">{card.name}</div>
                                                    <div className="text-xs text-sec mb-12">{card.description}</div>
                                                    <div className="bug-card-meta">
                                                        <div className="bug-meta-item">
                                                            <span className="bug-meta-label">Market Value</span>
                                                            <span className="bug-meta-value neon-green">₹{card.marketValue?.toLocaleString()}</span>
                                                        </div>
                                                        <div className="bug-meta-item">
                                                            <span className="bug-meta-label">Rarity</span>
                                                            <span className={`bug-meta-value ${rarityColor}`}>{card.rarity}</span>
                                                        </div>
                                                        <div className="bug-meta-item" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                                            {selectedRoom && (
                                                                <button
                                                                    className="btn btn-blue btn-sm"
                                                                    onClick={() => handleShowPowerCard(card)}
                                                                    style={activePowerCardId === card.cardId ? { background: 'var(--neon-blue)', color: '#000' } : {}}
                                                                    disabled={auctionPhase !== "ENDED" || powerCardPhase === "ENDED"}
                                                                >
                                                                    {activePowerCardId === card.cardId ? '🔴 LIVE' : '👁 SHOW'}
                                                                </button>
                                                            )}
                                                            {selectedRoom && teams.length > 0 && (
                                                                <button
                                                                    className="btn btn-purple btn-sm"
                                                                    onClick={() => { setAllotModal({ ...card, type: 'powercard' }); setAllotPrice(card.marketValue); setAllotTeamId(teams[0]?._id || ""); }}
                                                                    disabled={auctionPhase !== "ENDED" || powerCardPhase !== "LIVE"}
                                                                >
                                                                    🎯 ALLOT
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </>
                            ) : centerTab === "rebidding" ? (
                                /* Rebidding Tab */
                                <>
                                    <h3 className="orbitron mb-20" style={{ fontSize: '0.95rem' }}>REBIDDING MANAGEMENT</h3>
                                    {!selectedRoom ? (
                                        <div className="text-xs text-sec text-center" style={{ padding: '24px' }}>Select a room first.</div>
                                    ) : (
                                        <>
                                            <div style={{ marginBottom: '24px' }}>
                                                <div className="panel-title mb-12">Rebidding Control</div>
                                                <div className="btn-row">
                                                    <button
                                                        className={`btn btn-sm ${rebidStatus === 'ACCEPTING' ? 'btn-green' : ''}`}
                                                        style={rebidStatus !== 'ACCEPTING' ? { background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-sec)' } : {}}
                                                        onClick={() => handleUpdateRebidStatus("ACCEPTING")}
                                                    >
                                                        ACCEPT REBIDS
                                                    </button>
                                                    <button
                                                        className={`btn btn-sm ${rebidStatus === 'INACTIVE' ? 'btn-amber' : ''}`}
                                                        style={rebidStatus !== 'INACTIVE' ? { background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-sec)' } : {}}
                                                        onClick={() => handleUpdateRebidStatus("INACTIVE")}
                                                    >
                                                        STOP ACCEPTING
                                                    </button>
                                                    <button
                                                        className={`btn btn-sm ${rebidStatus === 'AUCTION' ? 'btn-blue' : ''}`}
                                                        style={rebidStatus !== 'AUCTION' ? { background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-sec)' } : {}}
                                                        onClick={() => handleUpdateRebidStatus("AUCTION")}
                                                    >
                                                        START REBID AUCTION
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="section-divider"></div>

                                            <div className="panel-title mb-16">Rebid Pool ({rebidPool.length})</div>
                                            {rebidPool.length === 0 ? (
                                                <div className="text-xs text-sec text-center" style={{ padding: '24px' }}>The rebid pool is empty.</div>
                                            ) : (
                                                <div style={{ overflowX: 'auto' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                                                        <thead>
                                                            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                                                <th style={{ textAlign: 'left', padding: '10px 8px', color: 'var(--text-sec)', fontSize: '0.68rem' }}>BUG</th>
                                                                <th style={{ textAlign: 'left', padding: '10px 8px', color: 'var(--text-sec)', fontSize: '0.68rem' }}>PREV OWNER</th>
                                                                <th style={{ textAlign: 'right', padding: '10px 8px', color: 'var(--text-sec)', fontSize: '0.68rem' }}>ORIG PRICE</th>
                                                                <th style={{ textAlign: 'center', padding: '10px 8px', color: 'var(--text-sec)', fontSize: '0.68rem' }}>STATUS</th>
                                                                <th style={{ textAlign: 'center', padding: '10px 8px', color: 'var(--text-sec)', fontSize: '0.68rem' }}>ACTION</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {rebidPool.map((item) => (
                                                                <tr key={item._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                                    <td style={{ padding: '10px 8px' }}>
                                                                        <div style={{ fontWeight: 600 }}>{item.bugId?.name}</div>
                                                                        <div className="text-xs text-sec">{item.bugId?.bugId}</div>
                                                                    </td>
                                                                    <td style={{ padding: '10px 8px' }}>{item.previousTeamName}</td>
                                                                    <td style={{ padding: '10px 8px', textAlign: 'right' }} className="neon-green">₹{item.originalPrice?.toLocaleString()}</td>
                                                                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                                                                        <span className={`badge ${item.status === 'SOLD' ? 'badge-green' : item.status === 'AUCTIONING' ? 'badge-blue' : 'badge-amber'}`}>
                                                                            {item.status}
                                                                        </span>
                                                                    </td>
                                                                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                                                                        {item.status === 'WAITING' && rebidStatus === 'AUCTION' && (
                                                                            <button
                                                                                className="btn btn-blue btn-sm"
                                                                                style={{ fontSize: '0.65rem' }}
                                                                                onClick={() => handleStartRebidAuction(item._id)}
                                                                            >
                                                                                🚀 AUCTION
                                                                            </button>
                                                                        )}
                                                                        {item.status === 'AUCTIONING' && (
                                                                            <button
                                                                                className="btn btn-purple btn-sm"
                                                                                style={{ fontSize: '0.65rem' }}
                                                                                onClick={() => { setAllotModal({ ...item.bugId, type: "bug" }); setAllotPrice(item.bugId.marketValue); setAllotTeamId(teams[0]?._id || ""); }}
                                                                            >
                                                                                🎯 ALLOT
                                                                            </button>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            ) : (
                                /* Submissions Tab */
                                <>
                                    <h3 className="orbitron mb-20" style={{ fontSize: '0.95rem' }}>TEAM SUBMISSIONS</h3>
                                    {!selectedRoom ? (
                                        <div className="text-xs text-sec text-center" style={{ padding: '24px' }}>Select a room first.</div>
                                    ) : submissions.length === 0 ? (
                                        <div className="text-center" style={{ padding: '32px 16px' }}>
                                            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📭</div>
                                            <div className="text-sec" style={{ fontSize: '0.85rem' }}>No submissions yet.</div>
                                        </div>
                                    ) : (
                                        <div style={{ overflowX: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                                        <th style={{ textAlign: 'left', padding: '10px 8px', color: 'var(--text-sec)', fontWeight: 500, letterSpacing: '1px', fontSize: '0.68rem' }}>TEAM</th>
                                                        <th style={{ textAlign: 'left', padding: '10px 8px', color: 'var(--text-sec)', fontWeight: 500, letterSpacing: '1px', fontSize: '0.68rem' }}>BUG</th>
                                                        <th style={{ textAlign: 'right', padding: '10px 8px', color: 'var(--text-sec)', fontWeight: 500, letterSpacing: '1px', fontSize: '0.68rem' }}>PAID</th>
                                                        <th style={{ textAlign: 'center', padding: '10px 8px', color: 'var(--text-sec)', fontWeight: 500, letterSpacing: '1px', fontSize: '0.68rem' }}>CODE</th>
                                                        <th style={{ textAlign: 'right', padding: '10px 8px', color: 'var(--text-sec)', fontWeight: 500, letterSpacing: '1px', fontSize: '0.68rem' }}>SCORE</th>
                                                        <th style={{ textAlign: 'right', padding: '10px 8px', color: 'var(--text-sec)', fontWeight: 500, letterSpacing: '1px', fontSize: '0.68rem' }}>PROFIT</th>
                                                        <th style={{ textAlign: 'center', padding: '10px 8px', color: 'var(--text-sec)', fontWeight: 500, letterSpacing: '1px', fontSize: '0.68rem' }}>ACTION</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {submissions.map((sub) => (
                                                        <>
                                                            <tr key={sub._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                                <td style={{ padding: '10px 8px', fontWeight: 600 }}>{sub.teamName}</td>
                                                                <td style={{ padding: '10px 8px' }}>
                                                                    <div className="text-xs" style={{ fontWeight: 600 }}>{sub.bugTitle}</div>
                                                                    <div className="text-xs text-sec">{sub.bugId?.bugId}</div>
                                                                </td>
                                                                <td style={{ padding: '10px 8px', textAlign: 'right' }} className="neon-green">₹{sub.purchasePrice?.toLocaleString()}</td>
                                                                <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                                                                    <button
                                                                        className="btn btn-sm"
                                                                        style={{ fontSize: '0.65rem', padding: '4px 10px', background: expandedCode === sub._id ? 'rgba(0,242,255,0.15)' : 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: 'var(--text-sec)' }}
                                                                        onClick={() => setExpandedCode(expandedCode === sub._id ? null : sub._id)}
                                                                    >
                                                                        {expandedCode === sub._id ? '🔼 Hide' : '👁 View'}
                                                                    </button>
                                                                </td>
                                                                <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                                                                    {sub.status === "scored" ? (
                                                                        <span className="neon-purple">{sub.adminScore} pts</span>
                                                                    ) : (
                                                                        <input
                                                                            type="number"
                                                                            className="input"
                                                                            style={{ width: '80px', padding: '5px 8px', fontSize: '0.78rem', textAlign: 'right' }}
                                                                            placeholder="0"
                                                                            value={scoreInputs[sub._id] ?? ""}
                                                                            onChange={(e) => setScoreInputs((prev) => ({ ...prev, [sub._id]: e.target.value }))}
                                                                        />
                                                                    )}
                                                                </td>
                                                                <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                                                                    {sub.status === "scored" ? (
                                                                        <span className={sub.profit >= 0 ? 'neon-green' : 'neon-amber'}>
                                                                            {sub.profit >= 0 ? '+' : ''}₹{sub.profit?.toLocaleString()}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-sec">—</span>
                                                                    )}
                                                                </td>
                                                                <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                                                                    {sub.status === "scored" ? (
                                                                        <span className="badge badge-green" style={{ fontSize: '0.6rem' }}>✅ SCORED</span>
                                                                    ) : (
                                                                        <button
                                                                            className="btn btn-green btn-sm"
                                                                            style={{ fontSize: '0.65rem', padding: '5px 12px' }}
                                                                            onClick={() => handleScoreSubmit(sub._id)}
                                                                            disabled={!scoreInputs[sub._id]}
                                                                        >
                                                                            SAVE
                                                                        </button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                            {/* Expanded code row */}
                                                            {expandedCode === sub._id && (
                                                                <tr key={`code-${sub._id}`}>
                                                                    <td colSpan={7} style={{ padding: '0 8px 12px 8px' }}>
                                                                        <pre style={{
                                                                            background: 'rgba(0,0,0,0.4)',
                                                                            border: '1px solid rgba(0,242,255,0.2)',
                                                                            borderRadius: '6px',
                                                                            padding: '14px',
                                                                            fontSize: '0.75rem',
                                                                            fontFamily: 'monospace',
                                                                            whiteSpace: 'pre-wrap',
                                                                            wordBreak: 'break-all',
                                                                            color: 'var(--neon-green)',
                                                                            maxHeight: '220px',
                                                                            overflowY: 'auto',
                                                                            lineHeight: '1.5',
                                                                        }}>
                                                                            {sub.solutionCode || "No code submitted."}
                                                                        </pre>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </>
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
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
                                    <span className="text-xs text-sec" style={{ letterSpacing: '1.5px' }}>POWER CARDS</span>
                                    <span className="orbitron neon-green">{powerCards.length}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
                                    <span className="text-xs text-sec" style={{ letterSpacing: '1.5px' }}>SUBMISSIONS</span>
                                    <span className="orbitron neon-amber">{submissions.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Allot Modal */}
            {
                allotModal && (
                    <div className="modal-overlay active">
                        <div className="modal-box">
                            <h3 className="orbitron neon-purple">{allotModal.type === "powercard" ? "ALLOT POWER CARD TO TEAM" : "ALLOT BUG TO TEAM"}</h3>
                            <div className="bug-card" style={{ marginBottom: '20px' }}>
                                <div className="bug-card-id">{allotModal.type === "powercard" ? allotModal.cardId : allotModal.bugId} {allotModal.tag}</div>
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
                )
            }

            {/* Bug Details Modal */}
            <BugDetailsModal
                bug={viewingBug}
                onClose={() => setViewingBug(null)}
                full={auctionPhase === "ENDED"}
            />
        </>
    );
}
