"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="screen-center">
      <div className="card landing-card border-green pulse-green slide-up">
        <h1 className="orbitron landing-logo neon-green">
          BUG AUCTION<br />ARENA
        </h1>
        <div className="landing-divider"></div>
        <p className="landing-sub">LIVE AUCTION · CODING BATTLE · REAL-TIME CHAOS</p>

        <div className="landing-btn-group">
          <button className="btn btn-green btn-lg btn-full" onClick={() => router.push("/admin/login")}>
            ⚡ ENTER AS ADMIN
          </button>
          <button className="btn btn-purple btn-lg btn-full" onClick={() => router.push("/signup")}>
            👥 REGISTER AS TEAM
          </button>
          <button className="btn btn-blue btn-lg btn-full" onClick={() => router.push("/join-room")}>
            🔗 JOIN ROOM
          </button>
        </div>

        <div className="mt-32" style={{ paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', textAlign: 'center' }}>
            <div>
              <div className="orbitron neon-green" style={{ fontSize: '1.4rem' }}>10</div>
              <div className="text-xs text-sec mt-4">BUGS IN POOL</div>
            </div>
            <div>
              <div className="orbitron neon-purple" style={{ fontSize: '1.4rem' }}>∞</div>
              <div className="text-xs text-sec mt-4">TEAMS WELCOME</div>
            </div>
            <div>
              <div className="orbitron neon-blue" style={{ fontSize: '1.4rem' }}>LIVE</div>
              <div className="text-xs text-sec mt-4">AUCTION MODE</div>
            </div>
          </div>
        </div>

        <p className="mt-24 text-xs text-sec" style={{ textAlign: 'center' }}>
          Powered by Bug Auction Engine v3.0
        </p>
      </div>
    </div>
  );
}
