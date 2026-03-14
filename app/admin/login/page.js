"use client";

import Image from "next/image";
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
        <main
            className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-8 md:justify-end md:px-10"
            style={{
                backgroundImage: "url('/Loginback.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            <div className="absolute inset-0 bg-black/20" />

            <Image
                className="pointer-events-none absolute bottom-0 left-0 z-0 h-auto w-[min(320px,62vw)] sm:w-[min(420px,54vw)] lg:w-[min(540px,42vw)]"
                src="/Character3.png"
                alt="Arena character"
                width={820}
                height={1180}
                priority
            />

            <section className="slide-up relative z-10 w-full max-w-115 rounded-[28px] border border-white/22 bg-white/14 p-7 text-white shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-9 md:mr-8">
                <button
                    type="button"
                    className="mb-5 text-left text-sm tracking-[0.22em] text-white/78 transition hover:text-white"
                    onClick={() => router.push("/")}
                >
                    ← BACK TO PORTAL
                </button>

                <h1 className="text-4xl tracking-[0.08em] text-white sm:text-5xl">ADMIN ACCESS</h1>
                <p className="mt-2 text-sm tracking-[0.24em] text-white/72">INITIALIZE SECURE SESSION</p>

                {error && (
                    <div className="mt-6 rounded-lg border border-red-300/35 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="mt-8 space-y-5">
                    <div>
                        <label className="mb-2 block text-sm tracking-[0.18em] text-white/78">Admin Username</label>
                        <input
                            type="text"
                            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base text-white outline-none backdrop-blur-md placeholder:text-white/40 focus:border-white/35"
                            placeholder="Enter admin ID"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm tracking-[0.18em] text-white/78">Key Phrase / Password</label>
                        <input
                            type="password"
                            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base text-white outline-none backdrop-blur-md placeholder:text-white/40 focus:border-white/35"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full rounded-xl border border-white/25 bg-white/18 px-4 py-3 text-lg tracking-[0.08em] text-white transition hover:bg-white/24 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={loading}
                    >
                        {loading ? "AUTHENTICATING..." : "INITIALIZE SESSION"}
                    </button>
                </form>

                <p className="mt-6 cursor-pointer text-center text-sm tracking-[0.12em] text-white/76 transition hover:text-white" onClick={() => router.push("/signup")}>
                    Switch to Team Access →
                </p>
            </section>
        </main>
    );
}
