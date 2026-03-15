"use client";

import React, { useState, useEffect } from 'react';
import PowerCard from '@/components/PowerCard';
import powerCardData from '@/data/powerCardData.json';

export default function PowerCardTestPage() {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    // In a real app, this might come from an API
    setCards(powerCardData);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0c] p-10 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-12 border-b border-white/10 pb-8">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white" style={{ fontFamily: "Bebas Neue, sans-serif" }}>
            Power Card <span className="text-cyan-500">Design Lab</span>
          </h1>
          <p className="mt-2 text-gray-400 font-mono text-sm">
            Visual verification of all power card rarity tiers and unique designs.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div key={card.cardId} className="flex flex-col gap-4">
              <PowerCard 
                card={card} 
                onClick={(c) => alert(`Buying ${c.name}`)}
              />
              
              {/* Variant: Small / Owned style */}
              <div className="rounded-lg border border-dashed border-white/20 p-4">
                <p className="mb-3 text-[10px] uppercase tracking-widest text-gray-500 font-mono">Owned Variant (No Action)</p>
                <div className="w-64">
                    <PowerCard 
                        card={card} 
                        showAction={false}
                    />
                </div>
              </div>
            </div>
          ))}
        </div>

        <footer className="mt-20 border-t border-white/10 pt-10 text-center">
          <p className="text-xs text-gray-600 font-mono uppercase tracking-[0.2em]">
            Bug Auction Arena // System UI v2.0
          </p>
        </footer>
      </div>
    </div>
  );
}
