"use client";

import { useState, useRef, useEffect } from "react";

export default function CodeEditor({ code, onChange, language, onLanguageChange, onSubmit, submitting, submitMsg, bugInfo }) {
    const textareaRef = useRef(null);
    const lineNumbersRef = useRef(null);

    const languages = [
        { id: "python", name: "Python" },
        { id: "javascript", name: "JavaScript" },
        { id: "java", name: "Java" },
        { id: "cpp", name: "C++" },
        { id: "c", name: "C" },
    ];

    const lineCount = code.split("\n").length;

    const syncScroll = () => {
        if (lineNumbersRef.current && textareaRef.current) {
            lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
        }
    };

    return (
        <div className="code-editor-container">
            {/* Editor Header */}
            <div className="editor-header">
                <div className="editor-header-left">
                    <select
                        className="lang-select"
                        value={language}
                        onChange={(e) => onLanguageChange(e.target.value)}
                    >
                        {languages.map((lang) => (
                            <option key={lang.id} value={lang.id}>
                                {lang.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="editor-header-right">
                    <button
                        className="btn btn-green btn-sm"
                        onClick={onSubmit}
                        disabled={submitting || !code.trim()}
                    >
                        {submitting ? "SUBMITTING..." : "SUBMIT SOLUTION"}
                    </button>
                </div>
            </div>

            {/* Main Editor Section */}
            <div className="editor-main">
                <div className="line-numbers" ref={lineNumbersRef}>
                    {Array.from({ length: Math.max(lineCount, 1) }).map((_, i) => (
                        <div key={i} className="line-number">
                            {i + 1}
                        </div>
                    ))}
                </div>
                <textarea
                    ref={textareaRef}
                    className="code-textarea"
                    value={code}
                    onChange={(e) => onChange(e.target.value)}
                    onScroll={syncScroll}
                    placeholder="Write your solution here..."
                    spellCheck="false"
                />
            </div>

            {submitMsg && (
                <div className={`editor-footer ${submitMsg.startsWith('✅') ? 'success' : 'error'}`}>
                    {submitMsg}
                </div>
            )}

            <style jsx>{`
                .code-editor-container {
                    display: flex;
                    flex-direction: column;
                    background: #0d0d1a;
                    border: 1px solid rgba(0, 255, 65, 0.3);
                    border-radius: 12px;
                    overflow: hidden;
                    height: 500px;
                    box-shadow: 0 0 30px rgba(0, 255, 65, 0.1);
                }

                .editor-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 20px;
                    background: #1a1a35;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .lang-select {
                    background: #0d0d1a;
                    color: var(--neon-green);
                    border: 1px solid rgba(0, 255, 65, 0.4);
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-family: 'Orbitron', sans-serif;
                    font-size: 0.75rem;
                    outline: none;
                    cursor: pointer;
                }

                .lang-select:focus {
                    border-color: var(--neon-green);
                    box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
                }

                .editor-main {
                    display: flex;
                    flex: 1;
                    position: relative;
                    overflow: hidden;
                }

                .line-numbers {
                    width: 50px;
                    background: #15152a;
                    color: rgba(255, 255, 255, 0.3);
                    font-family: 'Space Mono', monospace;
                    font-size: 0.82rem;
                    text-align: right;
                    padding: 16px 12px;
                    user-select: none;
                    overflow: hidden;
                    line-height: 1.5;
                }

                .line-number {
                    height: 1.5em;
                }

                .code-textarea {
                    flex: 1;
                    background: transparent;
                    color: #e0e0ff;
                    border: none;
                    padding: 16px;
                    font-family: 'Space Mono', monospace;
                    font-size: 0.82rem;
                    line-height: 1.5;
                    resize: none;
                    outline: none;
                    overflow-y: auto;
                    white-space: pre;
                }

                .editor-footer {
                    padding: 10px 20px;
                    font-size: 0.8rem;
                    background: rgba(0, 0, 0, 0.4);
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                }

                .editor-footer.success {
                    color: var(--neon-green);
                }

                .editor-footer.error {
                    color: var(--neon-amber);
                }
            `}</style>
        </div>
    );
}
