/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Trophy, Award, ChevronRight, X, Play } from 'lucide-react';
import { TournamentMatch, PlayerProfile } from '../game/types';
import { sounds } from '../game/audio';

interface TournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  currentRound: 1 | 2 | 3;
  matches: TournamentMatch[];
  onStartTournamentMatch: (opponentName: string, round: 1 | 2 | 3) => void;
}

export const TournamentModal: React.FC<TournamentModalProps> = ({
  isOpen,
  onClose,
  profile,
  currentRound,
  matches,
  onStartTournamentMatch,
}) => {
  if (!isOpen) return null;

  const currentMatch = matches.find(m => m.round === currentRound && (m.player1.isUser || m.player2.isUser));
  const opponent = currentMatch ? (currentMatch.player1.isUser ? currentMatch.player2 : currentMatch.player1) : null;

  const roundName = currentRound === 1 ? 'Quarter-Finals' : currentRound === 2 ? 'Semi-Finals' : 'Championship Grand Final';
  const prizePool = currentRound === 1 ? 500 : currentRound === 2 ? 1200 : 2500;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-5 sm:p-6 my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Trophy size={24} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">Legends Tournament Cup</h2>
              <p className="text-xs text-amber-400 font-medium">Prize Pool: ${prizePool} Coins + Trophy</p>
            </div>
          </div>
          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current Round Banner */}
        <div className="my-4 p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900 border border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-black text-amber-400">Current Stage</span>
            <div className="text-base font-extrabold text-white">{roundName}</div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <Award size={15} /> Round {currentRound} of 3
          </div>
        </div>

        {/* 8-Player Bracket View */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tournament Bracket</div>

          <div className="space-y-2">
            {matches.map((m, idx) => {
              const isUserMatch = m.player1.isUser || m.player2.isUser;
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border transition ${
                    isUserMatch
                      ? 'bg-slate-800/90 border-sky-500/50 shadow-lg ring-1 ring-sky-500/30'
                      : 'bg-slate-950/60 border-slate-800 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-400">
                      {m.round === 1 ? 'Quarter' : m.round === 2 ? 'Semi' : 'Final'} #{m.matchIndex + 1}
                    </span>
                    {m.winner && (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Trophy size={12} /> Winner: {m.winner}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className={`p-2 rounded-xl flex items-center gap-2 ${m.player1.isUser ? 'bg-sky-600/20 border border-sky-500/40' : 'bg-slate-900'}`}>
                      <span className="text-lg">{m.player1.avatar}</span>
                      <span className="text-xs font-bold text-white truncate">{m.player1.name} {m.player1.isUser && '(You)'}</span>
                    </div>
                    <div className={`p-2 rounded-xl flex items-center gap-2 ${m.player2.isUser ? 'bg-sky-600/20 border border-sky-500/40' : 'bg-slate-900'}`}>
                      <span className="text-lg">{m.player2.avatar}</span>
                      <span className="text-xs font-bold text-white truncate">{m.player2.name} {m.player2.isUser && '(You)'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        {opponent && (
          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                sounds.playClick();
                onStartTournamentMatch(opponent.name, currentRound);
                onClose();
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-extrabold text-sm sm:text-base shadow-xl flex items-center justify-center gap-2 transition active:scale-[0.98]"
            >
              <Play size={18} fill="currentColor" /> Play {roundName} vs {opponent.name}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
