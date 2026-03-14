"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
    const [confirmDeleteRoomId, setConfirmDeleteRoomId] = useState(null);
    const [isDeletingRoomId, setIsDeletingRoomId] = useState(null);

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

    const handleDeleteRoom = async (room) => {
        if (!user || !room?._id) return;
        setIsDeletingRoomId(room._id);
        try {
            const res = await fetch("/api/admin/rooms", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomId: room._id, userId: user._id }),
            });
            const data = await res.json();
            if (data.success) {
                addFeed(`Room deleted permanently: ${room.roomId}`, "amber");
                if (selectedRoom?._id === room._id) {
                    setSelectedRoom(null);
                    setTeams([]);
                    setSubmissions([]);
                    setRebidPool([]);
                    setAuctionPhase("WAITING");
                    setPowerCardPhase("WAITING");
                    setActiveBugId(null);
                    setActivePowerCardId(null);
                }
                fetchRooms();
            } else {
                addFeed(data.error || "Failed to delete room", "amber");
            }
        } catch (err) {
            addFeed("Failed to delete room", "amber");
        } finally {
            setConfirmDeleteRoomId(null);
            setIsDeletingRoomId(null);
        }
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
    const inactiveTabClass = "border border-white/15 bg-transparent text-slate-300";

    if (!user) return null;

    return (
        <div className="admin-theme">
            <Image
                src="/TeamBackground.png"
                alt="Team arena background"
                width={1920}
                height={1080}
                className="pointer-events-none fixed inset-0 h-screen w-screen object-cover"
                priority
            />
            <div className="pointer-events-none fixed inset-0 h-screen bg-black/60" />

            <div className="relative z-20">
                {/* Top Bar */}
                <div className="mx-4 mt-3 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/20 bg-black/40 px-5 py-4 backdrop-blur-md">
                    <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">⚡ BUG AUCTION ARENA</div>
                    <div className="flex items-center gap-3">
                        {selectedRoom && (
                            <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-300/60 bg-fuchsia-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.06em] text-fuchsia-200">
                                <div className="h-1.5 w-1.5 rounded-full bg-fuchsia-300"></div>
                                ROOM: {selectedRoom.roomId}
                            </div>
                        )}

                        <span className={`badge ${phase.cls}`}>
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
                <div className="w-screen px-4 py-4 sm:px-6">
                    <div className="grid gap-6 xl:grid-cols-[minmax(280px,0.95fr)_minmax(0,1.7fr)_minmax(260px,0.9fr)]">

                    {/* LEFT PANEL: Room Control */}
                    <div className="space-y-5">
                        <div className="card border-green">
                            <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500">Room Control</div>
                            <h3 className="mb-5 text-2xl font-bold uppercase tracking-wide text-white">ARENA MANAGER</h3>

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
                                <div className="mb-6 rounded-lg border border-emerald-300/25 bg-emerald-400/10 px-4 py-3">
                                    <div className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-300">ACTIVE ROOM</div>
                                    <div className="text-2xl font-bold tracking-[0.2em] text-emerald-300">{selectedRoom.roomId}</div>
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
                            <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Your Rooms</div>
                            {rooms.length === 0 ? (
                                <div className="text-xs text-sec">No rooms created yet</div>
                            ) : (
                                rooms.map((r) => (
                                    <div
                                        key={r._id}
                                        className={`flex items-center justify-between rounded-lg border border-white/15 bg-black/30 px-4 py-3 ${selectedRoom?._id === r._id ? "border-emerald-400/60!" : ""}`}
                                        onClick={() => { setSelectedRoom(r); setAuctionPhase(r.status); setPowerCardPhase(r.powerCardStatus || 'WAITING'); }}
                                    >
                                        <div>
                                            <div className="mono text-sm font-semibold">{r.roomId}</div>
                                            <div className="text-xs text-sec">{r.roomName}</div>
                                            <div className="text-xs text-sec">Power: {r.powerCardStatus || "WAITING"}</div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className={`badge ${r.status === 'LIVE' ? 'badge-green' : r.status === 'ENDED' ? 'badge-blue' : 'badge-gray'}`}>
                                                {r.status}
                                            </span>
                                            {confirmDeleteRoomId === r._id ? (
                                                <>
                                                    <button
                                                        className="btn btn-sm btn-amber"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteRoom(r);
                                                        }}
                                                        disabled={isDeletingRoomId === r._id}
                                                    >
                                                        {isDeletingRoomId === r._id ? "DELETING..." : "CONFIRM"}
                                                    </button>
                                                    <button
                                                        className="btn btn-sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setConfirmDeleteRoomId(null);
                                                        }}
                                                        disabled={isDeletingRoomId === r._id}
                                                    >
                                                        CANCEL
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    className="btn btn-sm"
                                                    title="Delete room permanently"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setConfirmDeleteRoomId(r._id);
                                                    }}
                                                >
                                                    🗑
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Joined Teams */}
                        {selectedRoom && (
                            <div className="card">
                                <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">Joined Teams ({teams.length})</div>
                                {teams.length === 0 ? (
                                    <div className="text-xs text-sec">No teams joined yet</div>
                                ) : (
                                    teams.map((t) => (
                                        <div key={t._id} className="flex items-center justify-between rounded-lg border border-white/15 bg-black/30 px-4 py-3">
                                            <div className="flex items-center">
                                                <div className={`team-dot ${t.status === 'online' ? 'online' : 'idle'}`}></div>
                                                <div>
                                                    <div className="text-sm font-semibold">{t.teamName}</div>
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
                    <div className="space-y-5">
                        <div className="card">
                            {/* Tab Header */}
                            <div className="mb-5 flex flex-wrap gap-2 border-b border-white/15 pb-3">
                                <button
                                    className={centerTab === 'auction' ? 'btn btn-sm btn-blue' : `btn btn-sm ${inactiveTabClass}`}
                                    onClick={() => setCenterTab("auction")}
                                >
                                    🎯 Auction Control
                                </button>
                                <button
                                    className={centerTab === 'powercards' ? 'btn btn-sm btn-green' : `btn btn-sm ${inactiveTabClass}`}
                                    onClick={() => setCenterTab("powercards")}
                                >
                                    ⚡ Power Cards {powerCards.length > 0 && <span className="badge badge-green ml-1.5 text-[0.6rem]">{powerCards.length}</span>}
                                </button>
                                <button
                                    className={centerTab === 'submissions' ? 'btn btn-sm btn-purple' : `btn btn-sm ${inactiveTabClass}`}
                                    onClick={() => setCenterTab("submissions")}
                                >
                                    📋 Submissions {submissions.length > 0 && <span className="badge badge-green ml-1.5 text-[0.6rem]">{submissions.length}</span>}
                                </button>
                                <button
                                    className={centerTab === 'rebidding' ? 'btn btn-sm btn-amber' : `btn btn-sm ${inactiveTabClass}`}
                                    onClick={() => setCenterTab("rebidding")}
                                >
                                    ♻️ Rebidding {rebidPool.length > 0 && <span className="badge badge-amber ml-1.5 text-[0.6rem]">{rebidPool.length}</span>}
                                </button>
                            </div>

                            {centerTab === "auction" ? (
                                <>
                                    <div className="mb-6 flex items-center justify-between">
                                        <h3 className="text-2xl font-bold uppercase tracking-wide text-white">BUG MARKETPLACE</h3>
                                        <button className="btn btn-blue btn-sm" onClick={handleSeedBugs}>🐛 SEED BUGS</button>
                                    </div>

                                    {/* Auction Phase Controls */}
                                    <div className="mb-4">
                                        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Auction Phase</div>
                                        <div className="btn-row">
                                            <button className="btn btn-green btn-sm text-white" onClick={() => updateRoomStatus("LIVE")} disabled={auctionPhase === "LIVE"}>▶ START</button>
                                            <button className="btn btn-amber btn-sm text-white" onClick={() => updateRoomStatus("PAUSED")} disabled={auctionPhase !== "LIVE"}>⏸ PAUSE</button>
                                            <button className="btn btn-blue btn-sm text-white" onClick={() => updateRoomStatus("ENDED")} disabled={auctionPhase === "ENDED"}>🏁 END</button>
                                        </div>
                                    </div>

                                    <div className="section-divider"></div>

                                    {/* Bug Cards */}
                                    {bugs.length === 0 ? (
                                        <div className="p-6 text-center text-xs text-sec">
                                            No bugs loaded. Click &quot;SEED BUGS&quot; to load the bug pool.
                                        </div>
                                    ) : (
                                        bugs.map((bug) => {
                                            const diffColor = bug.difficulty === "Expert" ? "neon-purple" : bug.difficulty === "Hard" ? "neon-amber" : bug.difficulty === "Medium" ? "neon-blue" : "neon-green";
                                            return (
                                                <div key={bug._id} className="mb-4 cursor-pointer rounded-xl border border-white/25 bg-black/35 p-4" onClick={() => setViewingBug(bug)}>
                                                    <div className="text-xs uppercase tracking-widest text-slate-400">BUG ID: {bug.bugId} &nbsp; {bug.tag}</div>
                                                    <div className="mt-1 text-xl font-bold text-white">{bug.name}</div>
                                                    <div className="text-xs text-sec mb-12">{bug.description}</div>
                                                    <div className="mt-3 flex flex-wrap gap-4">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-xs uppercase tracking-[0.08em] text-slate-400">Market Value</span>
                                                            <span className="text-base font-semibold text-emerald-300">₹{bug.marketValue?.toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-xs uppercase tracking-[0.08em] text-slate-400">Difficulty</span>
                                                            <span className={`text-base font-semibold ${diffColor}`}>{bug.difficulty}</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2.5">
                                                            {selectedRoom && (
                                                                <button
                                                                    className="btn btn-blue btn-sm"
                                                                    onClick={(e) => { e.stopPropagation(); handleShowBug(bug); }}
                                                                    disabled={activeBugId === bug.bugId}
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
                                    <div className="mb-6 flex items-center justify-between">
                                        <h3 className="text-2xl font-bold uppercase tracking-wide text-white">POWER CARD MARKET</h3>
                                        <button className="btn btn-green btn-sm" onClick={handleSeedPowerCards}>⚡ SEED POWER CARDS</button>
                                    </div>

                                    <div className="mb-4">
                                        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Power Card Phase</div>
                                        <div className="btn-row mb-2">
                                            <button
                                                className="btn btn-green btn-sm text-white"
                                                onClick={() => updateRoomStatus("LIVE", "POWER")}
                                                disabled={auctionPhase !== "ENDED" || powerCardPhase === "LIVE"}
                                            >
                                                ▶ START
                                            </button>
                                            <button
                                                className="btn btn-blue btn-sm text-white"
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
                                        <div className="p-6 text-center text-xs text-sec">
                                            No power cards loaded. Click "SEED POWER CARDS" to load the pool.
                                        </div>
                                    ) : (
                                        powerCards.map((card) => {
                                            const rarityColor = card.rarity === "Legendary" ? "neon-purple" : card.rarity === "Epic" ? "neon-amber" : card.rarity === "Rare" ? "neon-blue" : "neon-green";
                                            return (
                                                <div key={card._id} className="mb-4 rounded-xl border border-white/25 bg-black/35 p-4">
                                                    <div className="text-xs uppercase tracking-widest text-slate-400">CARD ID: {card.cardId} &nbsp; {card.tag}</div>
                                                    <div className="mt-1 text-xl font-bold text-white">{card.name}</div>
                                                    <div className="text-xs text-sec mb-12">{card.description}</div>
                                                    <div className="mt-3 flex flex-wrap gap-4">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-xs uppercase tracking-[0.08em] text-slate-400">Market Value</span>
                                                            <span className="text-base font-semibold text-emerald-300">₹{card.marketValue?.toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-xs uppercase tracking-[0.08em] text-slate-400">Rarity</span>
                                                            <span className={`text-base font-semibold ${rarityColor}`}>{card.rarity}</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2.5">
                                                            {selectedRoom && (
                                                                <button
                                                                    className="btn btn-blue btn-sm"
                                                                    onClick={() => handleShowPowerCard(card)}
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
                                    <h3 className="mb-5 text-2xl font-bold uppercase tracking-wide text-white">REBIDDING MANAGEMENT</h3>
                                    {!selectedRoom ? (
                                        <div className="p-6 text-center text-xs text-sec">Select a room first.</div>
                                    ) : (
                                        <>
                                            <div className="mb-6">
                                                <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Rebidding Control</div>
                                                <div className="btn-row">
                                                    <button
                                                        className={rebidStatus === 'ACCEPTING' ? 'btn btn-sm btn-green' : `btn btn-sm ${inactiveTabClass}`}
                                                        onClick={() => handleUpdateRebidStatus("ACCEPTING")}
                                                    >
                                                        ACCEPT REBIDS
                                                    </button>
                                                    <button
                                                        className={rebidStatus === 'INACTIVE' ? 'btn btn-sm btn-amber' : `btn btn-sm ${inactiveTabClass}`}
                                                        onClick={() => handleUpdateRebidStatus("INACTIVE")}
                                                    >
                                                        STOP ACCEPTING
                                                    </button>
                                                    <button
                                                        className={rebidStatus === 'AUCTION' ? 'btn btn-sm btn-blue' : `btn btn-sm ${inactiveTabClass}`}
                                                        onClick={() => handleUpdateRebidStatus("AUCTION")}
                                                    >
                                                        START REBID AUCTION
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="section-divider"></div>

                                            <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">Rebid Pool ({rebidPool.length})</div>
                                            {rebidPool.length === 0 ? (
                                                <div className="p-6 text-center text-xs text-sec">The rebid pool is empty.</div>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full border-collapse text-[0.8rem]">
                                                        <thead>
                                                            <tr className="border-b border-white/15">
                                                                <th className="px-2 py-2.5 text-left text-[0.68rem] text-slate-300">BUG</th>
                                                                <th className="px-2 py-2.5 text-left text-[0.68rem] text-slate-300">PREV OWNER</th>
                                                                <th className="px-2 py-2.5 text-right text-[0.68rem] text-slate-300">ORIG PRICE</th>
                                                                <th className="px-2 py-2.5 text-center text-[0.68rem] text-slate-300">STATUS</th>
                                                                <th className="px-2 py-2.5 text-center text-[0.68rem] text-slate-300">ACTION</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {rebidPool.map((item) => (
                                                                <tr key={item._id} className="border-b border-white/10">
                                                                    <td className="px-2 py-2.5">
                                                                        <div className="font-semibold">{item.bugId?.name}</div>
                                                                        <div className="text-xs text-sec">{item.bugId?.bugId}</div>
                                                                    </td>
                                                                    <td className="px-2 py-2.5">{item.previousTeamName}</td>
                                                                    <td className="neon-green px-2 py-2.5 text-right">₹{item.originalPrice?.toLocaleString()}</td>
                                                                    <td className="px-2 py-2.5 text-center">
                                                                        <span className={`badge ${item.status === 'SOLD' ? 'badge-green' : item.status === 'AUCTIONING' ? 'badge-blue' : 'badge-amber'}`}>
                                                                            {item.status}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-2 py-2.5 text-center">
                                                                        {item.status === 'WAITING' && rebidStatus === 'AUCTION' && (
                                                                            <button
                                                                                className="btn btn-blue btn-sm"
                                                                                onClick={() => handleStartRebidAuction(item._id)}
                                                                            >
                                                                                🚀 AUCTION
                                                                            </button>
                                                                        )}
                                                                        {item.status === 'AUCTIONING' && (
                                                                            <button
                                                                                className="btn btn-purple btn-sm"
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
                                    <h3 className="mb-5 text-2xl font-bold uppercase tracking-wide text-white">TEAM SUBMISSIONS</h3>
                                    {!selectedRoom ? (
                                        <div className="p-6 text-center text-xs text-sec">Select a room first.</div>
                                    ) : submissions.length === 0 ? (
                                        <div className="px-4 py-8 text-center">
                                            <div className="mb-3 text-[2rem]">📭</div>
                                            <div className="text-sec text-sm">No submissions yet.</div>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse text-[0.8rem]">
                                                <thead>
                                                    <tr className="border-b border-white/15">
                                                        <th className="px-2 py-2.5 text-left text-[0.68rem] font-medium tracking-[1px] text-slate-300">TEAM</th>
                                                        <th className="px-2 py-2.5 text-left text-[0.68rem] font-medium tracking-[1px] text-slate-300">BUG</th>
                                                        <th className="px-2 py-2.5 text-right text-[0.68rem] font-medium tracking-[1px] text-slate-300">PAID</th>
                                                        <th className="px-2 py-2.5 text-center text-[0.68rem] font-medium tracking-[1px] text-slate-300">CODE</th>
                                                        <th className="px-2 py-2.5 text-right text-[0.68rem] font-medium tracking-[1px] text-slate-300">SCORE</th>
                                                        <th className="px-2 py-2.5 text-right text-[0.68rem] font-medium tracking-[1px] text-slate-300">PROFIT</th>
                                                        <th className="px-2 py-2.5 text-center text-[0.68rem] font-medium tracking-[1px] text-slate-300">ACTION</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {submissions.map((sub) => (
                                                        <>
                                                            <tr key={sub._id} className="border-b border-white/10">
                                                                <td className="px-2 py-2.5 font-semibold">{sub.teamName}</td>
                                                                <td className="px-2 py-2.5">
                                                                    <div className="text-xs font-semibold">{sub.bugTitle}</div>
                                                                    <div className="text-xs text-sec">{sub.bugId?.bugId}</div>
                                                                </td>
                                                                <td className="neon-green px-2 py-2.5 text-right">₹{sub.purchasePrice?.toLocaleString()}</td>
                                                                <td className="px-2 py-2.5 text-center">
                                                                    <button
                                                                        className={`btn btn-sm ${expandedCode === sub._id ? 'btn-blue' : inactiveTabClass}`}
                                                                        onClick={() => setExpandedCode(expandedCode === sub._id ? null : sub._id)}
                                                                    >
                                                                        {expandedCode === sub._id ? '🔼 Hide' : '👁 View'}
                                                                    </button>
                                                                </td>
                                                                <td className="px-2 py-2.5 text-right">
                                                                    {sub.status === "scored" ? (
                                                                        <span className="neon-purple">{sub.adminScore} pts</span>
                                                                    ) : (
                                                                        <input
                                                                            type="number"
                                                                            className="input w-20 px-2 py-1 text-right text-xs"
                                                                            placeholder="0"
                                                                            value={scoreInputs[sub._id] ?? ""}
                                                                            onChange={(e) => setScoreInputs((prev) => ({ ...prev, [sub._id]: e.target.value }))}
                                                                        />
                                                                    )}
                                                                </td>
                                                                <td className="px-2 py-2.5 text-right">
                                                                    {sub.status === "scored" ? (
                                                                        <span className={sub.profit >= 0 ? 'neon-green' : 'neon-amber'}>
                                                                            {sub.profit >= 0 ? '+' : ''}₹{sub.profit?.toLocaleString()}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-sec">—</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-2 py-2.5 text-center">
                                                                    {sub.status === "scored" ? (
                                                                        <span className="badge badge-green text-[0.6rem]">✅ SCORED</span>
                                                                    ) : (
                                                                        <button
                                                                            className="btn btn-green btn-sm"
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
                                                                    <td colSpan={7} className="px-2 pb-3">
                                                                        <pre className="max-h-55 overflow-y-auto whitespace-pre-wrap break-all rounded-md border border-cyan-300/30 bg-black/40 p-3.5 font-mono text-xs leading-6 text-emerald-300">
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
                    <div className="space-y-5">
                        <div className="card px-6 py-6">
                            <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500">Live Feed</div>
                            <h3 className="mb-5 text-2xl font-bold uppercase tracking-wide text-white">ACTIVITY LOG</h3>
                            <div className="feed max-h-120 overflow-y-auto">
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
                            <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">Session Stats</div>
                            <div className="flex flex-col gap-3.5">
                                <div className="flex items-center justify-between rounded-lg border border-white/15 bg-white/5 px-3.5 py-3">
                                    <span className="text-xs uppercase tracking-[1.5px] text-sec">ROOMS</span>
                                    <span className="orbitron neon-green">{rooms.length}</span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg border border-white/15 bg-white/5 px-3.5 py-3">
                                    <span className="text-xs uppercase tracking-[1.5px] text-sec">TEAMS</span>
                                    <span className="orbitron neon-purple">{teams.length}</span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg border border-white/15 bg-white/5 px-3.5 py-3">
                                    <span className="text-xs uppercase tracking-[1.5px] text-sec">BUGS</span>
                                    <span className="orbitron neon-blue">{bugs.length}</span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg border border-white/15 bg-white/5 px-3.5 py-3">
                                    <span className="text-xs uppercase tracking-[1.5px] text-sec">POWER CARDS</span>
                                    <span className="orbitron neon-green">{powerCards.length}</span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg border border-white/15 bg-white/5 px-3.5 py-3">
                                    <span className="text-xs uppercase tracking-[1.5px] text-sec">SUBMISSIONS</span>
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
                            <div className="mb-5 rounded-xl border border-white/25 bg-black/35 p-4">
                                <div className="text-xs uppercase tracking-widest text-slate-400">{allotModal.type === "powercard" ? allotModal.cardId : allotModal.bugId} {allotModal.tag}</div>
                                <div className="mt-1 text-xl font-bold text-white">{allotModal.name}</div>
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
            </div>
        </div>
    );
}
