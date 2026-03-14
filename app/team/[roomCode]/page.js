"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import CodeEditor from "@/components/CodeEditor";
import BugDetailsModal from "@/components/BugDetailsModal";

const panelCardClass = "rounded-2xl border border-white/20 bg-black/40 p-6 backdrop-blur-md sm:p-7";

const badgeClass = {
    live: "border-emerald-400/60 bg-emerald-400/15 text-emerald-200",
    ended: "border-sky-400/60 bg-sky-400/15 text-sky-200",
    waiting: "border-white/30 bg-white/10 text-slate-200",
};

const difficultyTextClass = {
    Expert: "text-fuchsia-300",
    Hard: "text-amber-300",
    Medium: "text-sky-300",
    Easy: "text-emerald-300",
};

const rarityTextClass = {
    Legendary: "text-fuchsia-300",
    Epic: "text-amber-300",
    Rare: "text-sky-300",
    Common: "text-emerald-300",
};

const liveBadgeTone = (status, powerCardStatus) => {
    if (powerCardStatus === "LIVE" || status === "LIVE") return badgeClass.live;
    if (powerCardStatus === "ENDED" || status === "ENDED") return badgeClass.ended;
    return badgeClass.waiting;
};

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
    const [selectedLanguage, setSelectedLanguage] = useState("javascript");
    const [submitting, setSubmitting] = useState(false);
    const [submitMsg, setSubmitMsg] = useState("");
    const [viewingBug, setViewingBug] = useState(null);

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
                    language: selectedLanguage,
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

    const handleSellForRebid = async (bugId, purchasePrice) => {
        if (!confirm(`Are you sure you want to sell ${bugId} for a refund of ₹${purchasePrice.toLocaleString()}?`)) return;
        try {
            const res = await fetch("/api/rebid/sell", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user._id, roomCode, bugId }),
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                // The interval fetch will update the UI
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to sell bug.");
        }
    };

    if (loading) {
        return (
            <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white">
                <Image src="/TeamBackground.png" alt="Team arena background" fill className="object-cover" priority />
                <div className="absolute inset-0 bg-black/60" />
                <div className="relative z-10 rounded-2xl border border-white/20 bg-black/40 px-6 py-4 text-xl tracking-wide backdrop-blur-md sm:text-2xl">
                    Connecting to arena...
                </div>
            </div>
        );
    }

    const leaderboard = [...allTeams].sort((a, b) => {
        if (b.bugsWon !== a.bugsWon) return b.bugsWon - a.bugsWon;
        return b.coins - a.coins;
    });

    const isEnded = room?.status === "ENDED";

    return (
        <div className="relative min-h-screen overflow-hidden text-white">
            <Image src="/TeamBackground.png" alt="Team arena background" fill className="object-cover" priority />
            <div className="absolute inset-0 bg-black/60" />

            <Image
                src="/Character2.png"
                alt="Character"
                width={300}
                height={460}
                className="pointer-events-none absolute bottom-0 right-0 z-10 hidden w-48 select-none drop-shadow-2xl md:block lg:w-56 xl:w-72"
                priority
            />

            <div className="relative z-20 mx-auto w-screen px-4 py-4 sm:px-6 lg:pr-64 lg:pl-8 xl:pr-80">
                <div className="mb-6 rounded-2xl border border-white/20 bg-black/40 px-4 py-5 backdrop-blur-md sm:px-6">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">Hunter Control Panel</div>
                        <div className="flex items-center gap-2 self-start rounded-full border border-white/20 bg-black/40 px-4 py-2 text-sm font-semibold tracking-[0.08em] text-slate-100 sm:self-auto sm:text-base">
                            AREA-5YMC
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-2">
                            <div className="text-3xl font-semibold leading-none text-white sm:text-4xl">HOPES</div>
                            {myData && (
                                <div className="rounded-full border border-emerald-400/60 bg-emerald-400/20 px-3 py-1.5 text-sm font-semibold uppercase tracking-[0.06em] text-emerald-200">
                                    {myData.teamName}
                                </div>
                            )}
                            <button
                                className="rounded-lg border border-yellow-300/60 bg-yellow-400 px-4 py-2 text-sm font-bold uppercase tracking-[0.05em] text-black transition hover:bg-yellow-300"
                                onClick={() => router.push("/")}
                            >
                                DISCONNECT
                            </button>
                        </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-300/60 bg-fuchsia-400/10 px-3 py-1.5 text-sm font-semibold uppercase tracking-[0.06em] text-fuchsia-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-300" />
                            {roomCode}
                        </div>
                        {room && (
                            <span className={`rounded-full border px-3 py-1.5 text-sm font-semibold uppercase tracking-[0.06em] ${liveBadgeTone(room.status, room.powerCardStatus)}`}>
                                {room.powerCardStatus === "LIVE" ? "POWER LIVE" : room.powerCardStatus === "ENDED" ? "POWER ENDED" : room.status}
                            </span>
                        )}
                    </div>
                </div>

                {myData && (
                    <div className="mb-6 inline-flex items-center gap-4 rounded-2xl border border-emerald-300/40 bg-black/40 px-6 py-5 backdrop-blur-md">
                        <Image src="/currency.png" alt="Currency" width={40} height={40} className="h-9 w-9 object-contain" />
                        <div>
                            <div className="text-sm uppercase tracking-[0.06em] text-slate-300">Wallet Balance</div>
                            <div className="text-4xl font-semibold leading-none text-emerald-300 sm:text-5xl">₹{myData.coins?.toLocaleString()}</div>
                        </div>
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-12">
                    <div className="space-y-5 lg:col-span-8">
                        <div className={panelCardClass}>
                            <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-sky-300/50">Live Auction</div>
                            <h3 className="mb-5 text-2xl font-bold uppercase tracking-wide text-sky-300 sm:text-3xl">LIVE BUG</h3>

                            {room?.activeBug && (room.status === "LIVE" || room.rebiddingStatus === "AUCTION") ? (() => {
                                const ab = room.activeBug;
                                return (
                                    <div
                                        className="cursor-pointer rounded-xl border border-sky-300/40 bg-sky-400/10 p-3 sm:p-4"
                                        onClick={() => setViewingBug(ab)}
                                    >
                                        <div className="text-xs uppercase tracking-widest text-slate-500">BUG ID: {ab.bugId} {ab.tag}</div>
                                        <div className="mt-1 text-xl font-bold text-white">{ab.name}</div>
                                        <div className="mt-2 text-sm text-slate-300">
                                            {ab.description?.includes("PREVIEW:") ? ab.description.split("FULL:")[0].replace("PREVIEW:", "").trim() : ab.description}
                                        </div>
                                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                            <div className="rounded-lg border border-white/20 bg-black/30 px-3 py-2">
                                                <div className="text-sm uppercase tracking-[0.05em] text-slate-300">Market Value</div>
                                                <div className="text-lg font-semibold text-emerald-300">₹{ab.marketValue?.toLocaleString()}</div>
                                            </div>
                                            <div className="rounded-lg border border-white/20 bg-black/30 px-3 py-2">
                                                <div className="text-sm uppercase tracking-[0.05em] text-slate-300">Difficulty</div>
                                                <div className={`text-lg font-semibold ${difficultyTextClass[ab.difficulty] || "text-emerald-300"}`}>{ab.difficulty}</div>
                                            </div>
                                        </div>
                                        <div className="mt-3 text-center text-sm font-semibold uppercase tracking-[0.05em] text-sky-200">[ ANALYSIS PREVIEW ]</div>
                                    </div>
                                );
                            })() : (
                                <div className="rounded-xl border border-white/15 bg-black/25 px-4 py-8 text-center">
                                    <div className="mb-2 text-2xl">🔍</div>
                                    <div className="text-base text-slate-200">
                                        {room?.rebiddingStatus === "ACCEPTING" ? "Rebidding phase active. You can sell bugs now." :
                                            room?.rebiddingStatus === "AUCTION" ? "Rebidding auction is live!" :
                                                room?.powerCardStatus === "LIVE" ? "Power card auction is live below." :
                                                    isEnded ? "Auction has ended." : "Waiting for admin to reveal a bug..."}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={panelCardClass}>
                            <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-emerald-300/50">Live Auction</div>
                            <h3 className="mb-5 text-2xl font-bold uppercase tracking-wide text-emerald-300 sm:text-3xl">LIVE POWER CARD</h3>

                            {room?.activePowerCard && room.powerCardStatus === "LIVE" ? (() => {
                                const pc = room.activePowerCard;
                                return (
                                    <div className="rounded-xl border border-emerald-300/40 bg-emerald-400/10 p-3 sm:p-4">
                                        <div className="text-xs uppercase tracking-widest text-slate-500">POWER CARD: {pc.cardId} {pc.tag}</div>
                                        <div className="mt-1 text-xl font-bold text-white">{pc.name}</div>
                                        <div className="mt-2 text-sm text-slate-300">{pc.description}</div>
                                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                            <div className="rounded-lg border border-white/20 bg-black/30 px-3 py-2">
                                                <div className="text-sm uppercase tracking-[0.05em] text-slate-300">Market Value</div>
                                                <div className="text-lg font-semibold text-emerald-300">₹{pc.marketValue?.toLocaleString()}</div>
                                            </div>
                                            <div className="rounded-lg border border-white/20 bg-black/30 px-3 py-2">
                                                <div className="text-sm uppercase tracking-[0.05em] text-slate-300">Rarity</div>
                                                <div className={`text-lg font-semibold ${rarityTextClass[pc.rarity] || "text-emerald-300"}`}>{pc.rarity}</div>
                                            </div>
                                        </div>
                                        <div className="mt-3 text-center text-sm font-semibold uppercase tracking-[0.05em] text-emerald-200">[ POWER CARD AUCTION LIVE ]</div>
                                    </div>
                                );
                            })() : (
                                <div className="rounded-xl border border-white/15 bg-black/25 px-4 py-8 text-center">
                                    <div className="mb-2 text-2xl">⚡</div>
                                    <div className="text-base text-slate-200">
                                        {room?.status !== "ENDED"
                                            ? "Power card auction will unlock after bug auction ends."
                                            : room?.powerCardStatus === "WAITING"
                                                ? "Waiting for admin to start power card auction."
                                                : room?.powerCardStatus === "ENDED"
                                                    ? "Power card auction has ended."
                                                    : "Waiting for admin to reveal a power card..."}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={panelCardClass}>
                            <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-fuchsia-300/50">Your Portfolio</div>
                            <h3 className="mb-5 text-2xl font-bold uppercase tracking-wide text-fuchsia-300 sm:text-3xl">BUGS ACQUIRED</h3>

                            {!myData || myData.purchases?.length === 0 ? (
                                <div className="rounded-xl border border-white/15 bg-black/25 px-4 py-10 text-center">
                                    <div className="mb-2 text-3xl">🕐</div>
                                    <div className="text-base text-slate-200">No bugs acquired yet. Wait for admin to allot bugs from the auction.</div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {myData.purchases?.map((p, i) => {
                                        const submissionEntry = submissions[p.bugId];

                                        return (
                                            <div
                                                key={i}
                                                className="cursor-pointer rounded-xl border border-white/25 bg-black/35 p-3 sm:p-4"
                                                onClick={() => setViewingBug(p)}
                                            >
                                                <div className="text-xs uppercase tracking-widest text-slate-500">{p.bugId} {p.tag}</div>
                                                <div className="mt-1 text-xl font-bold text-white">{p.bugName}</div>
                                                <div className="mt-2 text-sm text-slate-300">
                                                    {!isEnded ? (
                                                        p.description?.includes("PREVIEW:") ? p.description.split("FULL:")[0].replace("PREVIEW:", "").trim() : p.description
                                                    ) : (
                                                        <span className="text-sm font-semibold uppercase tracking-[0.05em] text-emerald-300">🔓 DATA DECRYPTED — CLICK TO VIEW</span>
                                                    )}
                                                </div>
                                                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                                    <div className="rounded-lg border border-white/20 bg-black/30 px-3 py-2">
                                                        <div className="text-sm uppercase tracking-[0.05em] text-slate-300">Price Paid</div>
                                                        <div className="text-lg font-semibold text-emerald-300">₹{p.price?.toLocaleString()}</div>
                                                    </div>
                                                    <div className="rounded-lg border border-white/20 bg-black/30 px-3 py-2">
                                                        <div className="text-sm uppercase tracking-[0.05em] text-slate-300">Difficulty</div>
                                                        <div className={`text-lg font-semibold ${difficultyTextClass[p.difficulty] || "text-emerald-300"}`}>{p.difficulty}</div>
                                                    </div>
                                                </div>

                                                {isEnded && (
                                                    <div className="mt-3 border-t border-white/20 pt-3" onClick={(e) => e.stopPropagation()}>
                                                        {!submissionEntry ? (
                                                            <button
                                                                className="w-full rounded-full border border-sky-300/50 bg-sky-400/20 px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.05em] text-sky-100 transition hover:bg-sky-400/30"
                                                                onClick={() => {
                                                                    setSubmitModal({ bugId: p.bugId, bugStringId: p.bugId, bugName: p.bugName, purchasePrice: p.price });
                                                                    setSolutionCode("");
                                                                    setSubmitMsg("");
                                                                }}
                                                            >
                                                                📤 SUBMIT SOLUTION
                                                            </button>
                                                        ) : submissionEntry.status === "pending" ? (
                                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                                <span className="rounded-full border border-amber-300/60 bg-amber-400/20 px-3 py-1.5 text-sm font-semibold uppercase tracking-[0.05em] text-amber-100">⏳ SUBMITTED — AWAITING SCORE</span>
                                                                <button
                                                                    className="rounded-full border border-sky-300/50 bg-sky-400/20 px-3 py-1.5 text-sm font-semibold uppercase tracking-[0.05em] text-sky-100 transition hover:bg-sky-400/30"
                                                                    onClick={() => {
                                                                        setSubmitModal({ bugId: p.bugId, bugStringId: p.bugId, bugName: p.bugName, purchasePrice: p.price });
                                                                        setSolutionCode(submissionEntry.solutionCode || "");
                                                                        setSubmitMsg("");
                                                                    }}
                                                                >
                                                                    ✏️ Edit
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                <div className="flex items-center justify-between text-sm">
                                                                    <span className="uppercase tracking-[0.05em] text-slate-300">Admin Score</span>
                                                                    <span className="font-semibold text-fuchsia-300">{submissionEntry.adminScore} pts</span>
                                                                </div>
                                                                <div className="flex items-center justify-between text-sm">
                                                                    <span className="uppercase tracking-[0.05em] text-slate-300">Profit</span>
                                                                    <span className={`font-semibold ${submissionEntry.profit >= 0 ? "text-emerald-300" : "text-amber-300"}`}>
                                                                        {submissionEntry.profit >= 0 ? "+" : ""}₹{submissionEntry.profit?.toLocaleString()}
                                                                    </span>
                                                                </div>
                                                                <span className="inline-flex rounded-full border border-emerald-300/60 bg-emerald-400/20 px-3 py-1.5 text-sm font-semibold uppercase tracking-[0.05em] text-emerald-100">✅ SCORED</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {room?.rebiddingStatus === "ACCEPTING" && !submissionEntry && (
                                                    <div className="mt-3 border-t border-white/20 pt-3">
                                                        <button
                                                            className="w-full rounded-full border border-amber-300/60 bg-amber-400/20 px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.05em] text-amber-100 transition hover:bg-amber-400/30"
                                                            onClick={(e) => { e.stopPropagation(); handleSellForRebid(p.bugId, p.price); }}
                                                        >
                                                            ♻️ SELL FOR REBID (₹{p.price?.toLocaleString()} Refund)
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className={panelCardClass}>
                            <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-emerald-300/50">Your Power Cards</div>
                            <h3 className="mb-5 text-2xl font-bold uppercase tracking-wide text-emerald-300 sm:text-3xl">POWER PORTFOLIO</h3>

                            {!myData || myData.powerCardPurchases?.length === 0 ? (
                                <div className="rounded-xl border border-white/15 bg-black/25 px-4 py-8 text-center">
                                    <div className="mb-2 text-2xl">⚡</div>
                                    <div className="text-base text-slate-200">No power cards purchased yet.</div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {myData.powerCardPurchases?.map((pc, i) => (
                                        <div key={`${pc.cardId}-${i}`} className="rounded-xl border border-white/25 bg-black/35 p-3 sm:p-4">
                                            <div className="text-xs uppercase tracking-widest text-slate-500">{pc.cardId} {pc.tag}</div>
                                            <div className="mt-1 text-xl font-bold text-white">{pc.cardName}</div>
                                            <div className="mt-2 text-sm text-slate-300">{pc.description}</div>
                                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                                <div className="rounded-lg border border-white/20 bg-black/30 px-3 py-2">
                                                    <div className="text-sm uppercase tracking-[0.05em] text-slate-300">Price Paid</div>
                                                    <div className="text-lg font-semibold text-emerald-300">₹{pc.price?.toLocaleString()}</div>
                                                </div>
                                                <div className="rounded-lg border border-white/20 bg-black/30 px-3 py-2">
                                                    <div className="text-sm uppercase tracking-[0.05em] text-slate-300">Rarity</div>
                                                    <div className={`text-lg font-semibold ${rarityTextClass[pc.rarity] || "text-emerald-300"}`}>{pc.rarity}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-5 lg:col-span-4">
                        <div className={panelCardClass}>
                            <div className="mb-4 border-b border-white/20 pb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Live Rankings</div>
                            <div className="space-y-2.5">
                                {leaderboard.map((t, i) => {
                                    const isMe = t.odid === user?._id;
                                    const rankEmoji = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
                                    return (
                                        <div
                                            key={t._id}
                                            className={`flex items-center justify-between rounded-xl border p-3 ${isMe ? "border-fuchsia-300/50 bg-fuchsia-400/15" : "border-white/20 bg-black/30"}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="w-8 text-center text-lg">{rankEmoji}</span>
                                                <div>
                                                    <div className="text-base font-semibold text-white sm:text-lg">
                                                        {t.teamName} {isMe && <span className="text-sm uppercase tracking-[0.05em] text-fuchsia-200">(YOU)</span>}
                                                    </div>
                                                    <div className="text-sm text-slate-300">{t.bugsWon} bugs · ₹{t.coins?.toLocaleString()} remaining</div>
                                                </div>
                                            </div>
                                            <span className="rounded-full border border-emerald-300/60 bg-emerald-400/20 px-2.5 py-1 text-sm font-semibold uppercase tracking-[0.05em] text-emerald-100">
                                                {t.status}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {myData && (
                            <div className={panelCardClass}>
                                <div className="mb-4 border-b border-white/20 pb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Your Stats</div>
                                <div className="space-y-2.5 text-base">
                                    <div className="flex items-center justify-between rounded-lg border border-white/20 bg-black/30 px-3 py-2">
                                        <span className="text-sm uppercase tracking-[0.05em] text-slate-300">TEAM</span>
                                        <span className="font-semibold text-sky-300">{myData.teamName}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border border-white/20 bg-black/30 px-3 py-2">
                                        <span className="text-sm uppercase tracking-[0.05em] text-slate-300">WALLET</span>
                                        <span className="font-semibold text-emerald-300">₹{myData.coins?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border border-white/20 bg-black/30 px-3 py-2">
                                        <span className="text-sm uppercase tracking-[0.05em] text-slate-300">BUGS WON</span>
                                        <span className="font-semibold text-fuchsia-300">{myData.bugsWon}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border border-white/20 bg-black/30 px-3 py-2">
                                        <span className="text-sm uppercase tracking-[0.05em] text-slate-300">POWER CARDS</span>
                                        <span className="font-semibold text-emerald-300">{myData.powerCardPurchases?.length || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border border-white/20 bg-black/30 px-3 py-2">
                                        <span className="text-sm uppercase tracking-[0.05em] text-slate-300">ROOM</span>
                                        <span className="font-semibold text-amber-300">{room?.roomId || roomCode}</span>
                                    </div>
                                    {isEnded && Object.values(submissions).some((s) => s.status === "scored") && (
                                        <div className="flex items-center justify-between rounded-lg border border-white/20 bg-black/30 px-3 py-2">
                                            <span className="text-sm uppercase tracking-[0.05em] text-slate-300">TOTAL PROFIT</span>
                                            <span className="font-semibold text-emerald-300">
                                                ₹{Object.values(submissions).filter((s) => s.status === "scored").reduce((acc, s) => acc + (s.profit || 0), 0).toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {submitModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-6">
                    <div className="w-full max-w-5xl rounded-2xl border border-white/20 bg-black/40 p-4 backdrop-blur-md sm:p-6">
                        <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                            <div>
                                <h3 className="text-2xl font-semibold uppercase tracking-[0.05em] text-sky-200">📤 SUBMIT SOLUTION</h3>
                                <div className="text-sm text-slate-200">
                                    {submitModal.bugId} — {submitModal.bugName} · Paid: ₹{submitModal.purchasePrice?.toLocaleString()}
                                </div>
                            </div>
                            <button
                                className="rounded-full border border-fuchsia-300/50 bg-fuchsia-400/20 px-4 py-2 text-sm font-semibold uppercase tracking-[0.05em] text-fuchsia-100 transition hover:bg-fuchsia-400/30"
                                onClick={() => { setSubmitModal(null); setSolutionCode(""); setSubmitMsg(""); }}
                            >
                                CLOSE
                            </button>
                        </div>

                        <CodeEditor
                            code={solutionCode}
                            onChange={setSolutionCode}
                            language={selectedLanguage}
                            onLanguageChange={setSelectedLanguage}
                            onSubmit={handleSubmit}
                            submitting={submitting}
                            submitMsg={submitMsg}
                            bugInfo={submitModal}
                        />
                    </div>
                </div>
            )}

            <BugDetailsModal
                bug={viewingBug}
                onClose={() => setViewingBug(null)}
                full={isEnded && myData?.purchases?.some((p) => p.bugId === viewingBug?.bugId || p.bugName === viewingBug?.name)}
            />
        </div>
    );
}
