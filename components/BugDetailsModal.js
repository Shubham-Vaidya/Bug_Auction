"use client";

export default function BugDetailsModal({ bug, onClose, full = false }) {
    if (!bug) return null;

    const diffColors = {
        Easy: "neon-green",
        Medium: "neon-blue",
        Hard: "neon-amber",
        Expert: "neon-purple"
    };

    const colorClass = diffColors[bug.difficulty] || "neon-blue";
    const colorVar = `var(--${colorClass})`;

    // Parse description
    let previewPart = bug.description || "";
    let fullPart = "";

    if (bug.description?.includes("PREVIEW:") && bug.description?.includes("FULL:")) {
        const parts = bug.description.split("FULL:");
        previewPart = parts[0].replace("PREVIEW:", "").trim();
        fullPart = parts[1].trim();
    } else {
        previewPart = bug.description || "";
        fullPart = bug.description || "";
    }

    const displayContent = full ? (fullPart || previewPart) : previewPart;
    const isCode = full && (fullPart.includes("def ") || fullPart.includes("class ") || fullPart.includes("{") || fullPart.includes(";") || fullPart.includes("import "));

    return (
        <div className="modal-overlay active" onClick={onClose}>
            <div className="bug-dossier modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="dossier-header" style={{ borderBottomColor: colorVar, background: `rgba(255,255,255,0.03)` }}>
                    <div className="dossier-id" style={{ color: colorVar }}>TECHNICAL DOSSIER // {bug.bugId}</div>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="dossier-content">
                    <div className="dossier-title-row">
                        <h2 className={`orbitron ${colorClass}`}>{bug.bugName || bug.name}</h2>
                        <div className={`badge badge-${bug.difficulty.toLowerCase()}`}>
                            {bug.difficulty}
                        </div>
                    </div>

                    <div className="scanner-line" style={{ background: `linear-gradient(90deg, transparent, ${colorVar}, transparent)` }}></div>

                    <div className="dossier-grid">
                        <div className="dossier-main">
                            <div className="section-label">{full ? "LOGICAL ANALYSIS (FULL ACCESS)" : "PRELIMINARY SIGNATURE (ENCRYPTED)"}</div>

                            {isCode ? (
                                <pre className="dossier-code-block">
                                    {displayContent}
                                </pre>
                            ) : (
                                <p className="dossier-desc" style={{ borderLeftColor: colorVar }}>
                                    {displayContent}
                                </p>
                            )}

                            {!full && (
                                <div className="encryption-notice">
                                    <span className="blink">⚠️</span> FULL DATA ENCRYPTED. PURCHASE BUG AND END AUCTION FOR ACCESS.
                                </div>
                            )}

                            <div className="section-label mt-24">SYSTEM SPECIFICATIONS</div>
                            <div className="specs-grid">
                                <div className="spec-item">
                                    <div className="spec-label">TAG</div>
                                    <div className="spec-value">{bug.tag}</div>
                                </div>
                                <div className="spec-item">
                                    <div className="spec-label">MARKET VALUE</div>
                                    <div className="spec-value">₹{bug.marketValue?.toLocaleString() || bug.price?.toLocaleString()}</div>
                                </div>
                                <div className="spec-item">
                                    <div className="spec-label">LEVEL</div>
                                    <div className={`spec-value ${colorClass}`}>{bug.difficulty}</div>
                                </div>
                            </div>
                        </div>

                        <div className="dossier-side">
                            <div className="hologram-box">
                                <div className="hologram-icon">{full ? "🔓" : "🔬"}</div>
                                <div className="hologram-waves"></div>
                            </div>
                            <div className={`status-indicator ${colorClass}`}>
                                <div className="status-dot pulse"></div>
                                <span className="orbitron">{full ? "DECRYPTED" : "SIGNATURE FOUND"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dossier-footer">
                    <div className="timestamp">PROTOCOL: v3.0 // {new Date().toLocaleDateString()}</div>
                    <button className={`btn btn-sm btn-${colorClass === 'neon-purple' ? 'purple' : colorClass === 'neon-green' ? 'green' : colorClass === 'neon-amber' ? 'amber' : 'blue'}`} onClick={onClose}>
                        {full ? "DISMISS DOSSIER" : "CLOSE PREVIEW"}
                    </button>
                </div>

                <style jsx>{`
                    .bug-dossier {
                        max-width: 800px;
                        padding: 0;
                        border: 1px solid var(--neon-blue);
                        background: #08081a;
                        overflow: hidden;
                        box-shadow: 0 0 50px rgba(0, 255, 255, 0.15);
                        position: relative;
                        width: 90vw;
                    }

                    .dossier-header {
                        padding: 12px 24px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    }

                    .dossier-id {
                        font-family: 'Space Mono', monospace;
                        font-size: 0.75rem;
                        letter-spacing: 2px;
                    }

                    .close-btn {
                        background: none;
                        border: none;
                        color: #fff;
                        font-size: 1.5rem;
                        cursor: pointer;
                        opacity: 0.6;
                        transition: opacity 0.2s;
                    }

                    .close-btn:hover {
                        opacity: 1;
                    }

                    .dossier-content {
                        padding: 32px 40px;
                    }

                    .dossier-title-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 20px;
                        flex-wrap: wrap;
                        gap: 16px;
                    }

                    .dossier-title-row h2 {
                        margin: 0;
                        font-size: 1.6rem;
                    }

                    .scanner-line {
                        height: 2px;
                        margin: 24px 0;
                        position: relative;
                        animation: scan 3s linear infinite;
                    }

                    @keyframes scan {
                        0% { opacity: 0.3; transform: translateX(-20%); }
                        50% { opacity: 1; transform: translateX(20%); }
                        100% { opacity: 0.3; transform: translateX(-20%); }
                    }

                    .dossier-grid {
                        display: grid;
                        grid-template-columns: 1fr 220px;
                        gap: 32px;
                    }

                    .section-label {
                        font-family: 'Orbitron', sans-serif;
                        font-size: 0.7rem;
                        letter-spacing: 2px;
                        color: rgba(255, 255, 255, 0.4);
                        margin-bottom: 12px;
                    }

                    .dossier-desc {
                        font-size: 0.95rem;
                        line-height: 1.6;
                        color: #e0e0ff;
                        background: rgba(255,255,255,0.03);
                        padding: 20px;
                        border-radius: 8px;
                        border-left: 2px solid var(--neon-blue);
                        margin: 0;
                    }

                    .dossier-code-block {
                        font-family: 'Space Mono', monospace;
                        font-size: 0.82rem;
                        line-height: 1.5;
                        color: var(--neon-green);
                        background: rgba(0, 0, 0, 0.4);
                        padding: 24px;
                        border-radius: 12px;
                        border: 1px solid rgba(0, 255, 65, 0.2);
                        overflow-x: auto;
                        white-space: pre;
                        box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5);
                        margin: 0;
                    }

                    .encryption-notice {
                        margin-top: 16px;
                        font-size: 0.7rem;
                        color: var(--neon-amber);
                        letter-spacing: 1px;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }

                    .blink {
                        animation: blink-anim 1s step-end infinite;
                    }

                    @keyframes blink-anim {
                        50% { opacity: 0; }
                    }

                    .specs-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 16px;
                    }

                    .spec-item {
                        padding: 12px;
                        background: rgba(255,255,255,0.05);
                        border-radius: 6px;
                    }

                    .spec-label {
                        font-size: 0.6rem;
                        color: rgba(255, 255, 255, 0.5);
                        margin-bottom: 4px;
                    }

                    .spec-value {
                        font-family: 'Space Mono', monospace;
                        font-size: 0.85rem;
                    }

                    .hologram-box {
                        width: 100%;
                        height: 180px;
                        background: rgba(255, 255, 255, 0.02);
                        border: 1px dashed rgba(255, 255, 255, 0.1);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: relative;
                        margin-bottom: 20px;
                        border-radius: 12px;
                    }

                    .hologram-icon {
                        font-size: 4rem;
                        filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.2));
                        animation: float 3s ease-in-out infinite;
                    }

                    @keyframes float {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-10px); }
                    }

                    .status-indicator {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        justify-content: center;
                        padding: 10px;
                        background: rgba(255,255,255,0.03);
                        border-radius: 6px;
                    }

                    .status-dot {
                        width: 8px;
                        height: 8px;
                        border-radius: 50%;
                        background: currentColor;
                    }

                    .status-dot.pulse {
                        animation: blink-anim 1.5s infinite;
                    }

                    .status-indicator span {
                        font-size: 0.65rem;
                    }

                    .dossier-footer {
                        padding: 20px 40px;
                        background: rgba(255, 255, 255, 0.02);
                        border-top: 1px solid rgba(255, 255, 255, 0.05);
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }

                    .timestamp {
                        font-family: 'Space Mono', monospace;
                        font-size: 0.65rem;
                        color: rgba(255, 255, 255, 0.3);
                    }

                    @media (max-width: 700px) {
                        .dossier-grid {
                            grid-template-columns: 1fr;
                        }
                        .dossier-side {
                            display: none;
                        }
                        .dossier-content {
                            padding: 20px;
                        }
                    }
                `}</style>
            </div>
        </div>
    );
}
