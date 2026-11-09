/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RefreshCw, Home, Coins } from 'lucide-react';
import { sounds } from '../game/audio';
import { i18n, Language } from '../game/i18n';

interface GameOverModalProps {
  isOpen: boolean;
  isVictory: boolean;
  winnerName: string;
  reason: string;
  coinsEarned: number;
  xpEarned: number;
  onRematch: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  isVictory,
  winnerName,
  reason,
  coinsEarned,
  xpEarned,
  onRematch,
  onMainMenu,
}) => {
  const [lang, setLang] = useState<Language>(() => i18n.getLanguage());

  useEffect(() => {
    return i18n.subscribe(l => setLang(l));
  }, []);

  useEffect(() => {
    if (isOpen && isVictory) {
      sounds.playVictory();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    }
  }, [isOpen, isVictory]);

  if (!isOpen) return null;

  const isAr = lang === 'ar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm select-none" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/90 shadow-2xl p-6 text-center animate-fade-in">
        {/* Victory/Defeat Icon */}
        <div className="flex justify-center mb-3">
          <div
            className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-xl border-2 ${
              isVictory
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            {isVictory ? '🏆' : '🎱'}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black text-white tracking-wide mb-1">
          {isVictory ? i18n.t('victory') : i18n.t('defeat')}
        </h2>
        <p className="text-sm font-bold text-amber-400 mb-2">
          {winnerName} {isAr ? 'فاز بالمباراة!' : 'Wins the match!'}
        </p>
        <p className="text-xs text-slate-400 mb-5 px-2">
          {reason}
        </p>

        {/* Rewards Box */}
        {coinsEarned > 0 && (
          <div className="flex items-center justify-around p-3.5 rounded-2xl bg-slate-950 border border-slate-800 mb-6 font-mono-numbers">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">{i18n.t('coinsWon')}</div>
              <div className="text-base font-extrabold text-amber-400 flex items-center gap-1 justify-center">
                <Coins size={16} /> +{coinsEarned.toLocaleString()}
              </div>
              <div className="text-[9px] text-emerald-400 font-bold mt-0.5">
                {isAr ? '⚡ ضعف مبلغ الرهان' : '⚡ 2x Double Bet'}
              </div>
            </div>
            <div className="w-[1px] h-8 bg-slate-800" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">XP</div>
              <div className="text-base font-extrabold text-sky-400">
                +{xpEarned} XP
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2.5">
          <button
            onClick={() => { sounds.playClick(); onRematch(); }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 text-white font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer"
          >
            <RefreshCw size={16} /> {i18n.t('rematch')}
          </button>
          <button
            onClick={() => { sounds.playClick(); onMainMenu(); }}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Home size={16} /> {i18n.t('mainMenu')}
          </button>
        </div>
      </div>
    </div>
  );
};
