"use client";

import React from 'react';

const rarityStyles = {
  Legendary: {
    border: 'border-yellow-500/50',
    bg: 'bg-gradient-to-br from-yellow-900/40 via-yellow-600/20 to-orange-900/40',
    text: 'text-yellow-400',
    shadow: 'shadow-[0_0_20px_rgba(234,179,8,0.3)]',
    accent: 'bg-yellow-500',
    glow: 'group-hover:shadow-[0_0_30px_rgba(234,179,8,0.5)]',
  },
  Epic: {
    border: 'border-purple-500/50',
    bg: 'bg-gradient-to-br from-purple-900/40 via-purple-600/20 to-fuchsia-900/40',
    text: 'text-purple-400',
    shadow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]',
    accent: 'bg-purple-500',
    glow: 'group-hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]',
  },
  Rare: {
    border: 'border-cyan-500/50',
    bg: 'bg-gradient-to-br from-cyan-900/40 via-cyan-600/20 to-blue-900/40',
    text: 'text-cyan-400',
    shadow: 'shadow-[0_0_20px_rgba(6,182,212,0.3)]',
    accent: 'bg-cyan-500',
    glow: 'group-hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]',
  },
  Common: {
    border: 'border-green-500/50',
    bg: 'bg-gradient-to-br from-green-900/40 via-green-600/20 to-emerald-900/40',
    text: 'text-green-400',
    shadow: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]',
    accent: 'bg-green-500',
    glow: 'group-hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]',
  },
};

const cardThemes = {
  "Gold Rush": {
    border: 'border-yellow-500/50',
    bg: 'bg-gradient-to-br from-yellow-900/40 via-yellow-600/20 to-orange-900/40',
    text: 'text-yellow-400',
    shadow: 'shadow-[0_0_20px_rgba(234,179,8,0.3)]',
    accent: 'bg-yellow-500',
    asset: '/PowerCard/goldRush.png'
  },
  "Insider Deal": {
    border: 'border-indigo-500/50',
    bg: 'bg-gradient-to-br from-indigo-900/40 via-indigo-600/20 to-blue-900/40',
    text: 'text-indigo-400',
    shadow: 'shadow-[0_0_20px_rgba(99,102,241,0.3)]',
    accent: 'bg-indigo-500',
    asset: '/PowerCard/dealing.png'
  },
  "Hostile Takeover": {
    border: 'border-rose-600/50',
    bg: 'bg-gradient-to-br from-rose-950/60 via-rose-900/30 to-red-950/60',
    text: 'text-rose-400',
    shadow: 'shadow-[0_0_20px_rgba(225,29,72,0.3)]',
    accent: 'bg-rose-600',
    asset: '/PowerCard/Hostile.png'
  },
  "Debug Vision": {
    border: 'border-emerald-500/50',
    bg: 'bg-gradient-to-br from-emerald-900/40 via-emerald-600/20 to-green-900/40',
    text: 'text-emerald-400',
    shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]',
    accent: 'bg-emerald-500',
    asset: '/PowerCard/debug.png'
  },
  "System Freeze": {
    border: 'border-cyan-400/50',
    bg: 'bg-gradient-to-br from-cyan-900/40 via-blue-800/20 to-sky-900/40',
    text: 'text-cyan-300',
    shadow: 'shadow-[0_0_20px_rgba(34,211,238,0.3)]',
    accent: 'bg-cyan-400',
    asset: '/PowerCard/freeze.png'
  },
  "Firewall": {
    border: 'border-red-500/50',
    bg: 'bg-gradient-to-br from-red-900/40 via-red-700/20 to-orange-900/40',
    text: 'text-red-400',
    shadow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',
    accent: 'bg-red-500',
    asset: '/PowerCard/firewall.png'
  }
};

const rarityDefaults = {
  Legendary: cardThemes["Gold Rush"],
  Epic: cardThemes["Hostile Takeover"],
  Rare: cardThemes["System Freeze"],
  Common: cardThemes["Firewall"]
};

const PowerCard = ({ card, onClick, disabled = false, showAction = true }) => {
  const theme = cardThemes[card.name] || rarityDefaults[card.rarity] || rarityDefaults.Common;

  return (
    <div 
      className={`group relative overflow-hidden rounded-xl border ${theme.border} ${theme.bg} ${theme.shadow} transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]
        ${showAction ? 'min-h-[180px]' : 'min-h-[220px]'}`}
      style={{ fontFamily: "'Space Mono', monospace" }}
    >
      {/* Background Masked Image */}
      {theme.asset && (
        <div className="absolute inset-0 z-0 opacity-20 mix-blend-overlay">
            <img src={theme.asset} alt="" className="h-full w-full object-cover grayscale brightness-50" />
        </div>
      )}

      {/* Decorative Glows (for non-asset cards if any) */}
      {!theme.asset && (
        <>
            <div className={`absolute -right-4 -top-4 h-16 w-16 rounded-full ${theme.accent} opacity-10 blur-2xl`} />
            <div className={`absolute -bottom-4 -left-4 h-16 w-16 rounded-full ${theme.accent} opacity-10 blur-2xl`} />
        </>
      )}

      {/* Character Overlay Asset */}
      {theme.asset && (
        <div className="absolute bottom-0 right-0 z-10 w-32 opacity-70 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500">
            <img src={theme.asset} alt={card.name} className="w-full object-contain" />
        </div>
      )}
      
      {/* Scanline Effect */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]" 
           style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, #fff 1px, #fff 2px)' }} />

      <div className={`relative z-20 transition-all duration-300 ${showAction ? 'p-5' : 'p-8'}`}>
        <div className="mb-3 flex items-start justify-between">
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${theme.text} opacity-80`}>
              {card.rarity}
            </span>
            <h3 className="text-lg font-bold uppercase text-white tracking-tight">
              {card.name}
            </h3>
          </div>
          <span className="text-xl">{card.tag}</span>
        </div>

        <p className={`mb-6 text-xs leading-relaxed text-gray-400 ${!showAction ? 'max-w-[70%]' : 'max-w-[85%]'}`}>
          {card.description}
        </p>

        {showAction && (
          <div className="flex items-center justify-between mt-auto">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-gray-500">Value</span>
              <span className={`text-sm font-bold ${theme.text}`}>₹{card.marketValue}</span>
            </div>
            
            <button
              onClick={() => onClick && onClick(card)}
              disabled={disabled}
              className={`relative z-30 rounded-md px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 
                ${disabled 
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                  : `${theme.accent} text-black hover:scale-105 active:scale-95 shadow-lg shadow-${theme.accent}/20`
                }`}
            >
              Buy Now
            </button>
          </div>
        )}
      </div>

      {/* Rarity Corner Glow */}
      <div className={`absolute top-0 right-0 h-1 w-1 ${theme.accent} shadow-[0_0_15px_rgba(255,255,255,0.8)]`} />
    </div>
  );
};

export default PowerCard;
