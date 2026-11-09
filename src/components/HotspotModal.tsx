/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Wifi, 
  WifiOff, 
  QrCode, 
  Smartphone, 
  Copy, 
  Check, 
  ArrowRight, 
  X, 
  Users, 
  RefreshCw,
  HelpCircle,
  Play
} from 'lucide-react';
import { multiplayer } from '../game/multiplayer';
import { sounds } from '../game/audio';

interface HotspotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartHotspotGame: (role: 'host' | 'guest') => void;
  onStartPassAndPlay: (p1Name: string, p2Name: string) => void;
}

export const HotspotModal: React.FC<HotspotModalProps> = ({
  isOpen,
  onClose,
  onStartHotspotGame,
  onStartPassAndPlay,
}) => {
  const [activeTab, setActiveTab] = useState<'hotspot' | 'pass_play' | 'guide'>('hotspot');
  
  // Host state
  const [hostOfferCode, setHostOfferCode] = useState<string>('');
  const [hostQrUrl, setHostQrUrl] = useState<string>('');
  const [guestAnswerInput, setGuestAnswerInput] = useState<string>('');
  const [isCreatingRoom, setIsCreatingRoom] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Guest state
  const [guestInputOffer, setGuestInputOffer] = useState<string>('');
  const [guestAnswerCode, setGuestAnswerCode] = useState<string>('');
  const [guestQrUrl, setGuestQrUrl] = useState<string>('');
  const [isJoining, setIsJoining] = useState<boolean>(false);

  // Pass and Play names
  const [p1Name, setP1Name] = useState<string>('Player 1');
  const [p2Name, setP2Name] = useState<string>('Player 2');

  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  // 1. Host creates room
  const handleCreateRoom = async () => {
    try {
      sounds.playClick();
      setIsCreatingRoom(true);
      setErrorMessage('');
      const { offerCode, qrUrl } = await multiplayer.createRoom();
      setHostOfferCode(offerCode);
      setHostQrUrl(qrUrl);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to initialize local hotspot room');
    } finally {
      setIsCreatingRoom(false);
    }
  };

  // 2. Guest connects to Host's room code
  const handleJoinRoom = async () => {
    if (!guestInputOffer.trim()) return;
    try {
      sounds.playClick();
      setIsJoining(true);
      setErrorMessage('');
      const { answerCode, qrUrl } = await multiplayer.joinRoom(guestInputOffer);
      setGuestAnswerCode(answerCode);
      setGuestQrUrl(qrUrl);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Invalid room code. Please verify and try again.');
    } finally {
      setIsJoining(false);
    }
  };

  // 3. Host confirms Guest Answer
  const handleAcceptGuestAnswer = async () => {
    if (!guestAnswerInput.trim()) return;
    try {
      sounds.playClick();
      setErrorMessage('');
      await multiplayer.acceptGuestAnswer(guestAnswerInput);
      onStartHotspotGame('host');
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to complete direct connection.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    sounds.playClick();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-5 sm:p-6 my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Wifi size={22} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">Offline Local Multiplayer</h2>
              <p className="text-xs text-slate-400">Play together anywhere with zero internet</p>
            </div>
          </div>
          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex rounded-2xl bg-slate-950 p-1 my-4 border border-slate-800 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => { sounds.playClick(); setActiveTab('hotspot'); }}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'hotspot' ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone size={15} /> 2 Phones Hotspot
          </button>
          <button
            onClick={() => { sounds.playClick(); setActiveTab('pass_play'); }}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'pass_play' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users size={15} /> Pass & Play (1 Phone)
          </button>
          <button
            onClick={() => { sounds.playClick(); setActiveTab('guide'); }}
            className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1 ${
              activeTab === 'guide' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle size={15} /> Guide
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Tab 1: Hotspot Direct P2P */}
        {activeTab === 'hotspot' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Mode selection: Host or Guest */}
            <div className="grid grid-cols-2 gap-3">
              {/* Host Box */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-sky-400 text-sm font-bold mb-1">
                    <Wifi size={16} /> Phone 1 (Host)
                  </div>
                  <p className="text-xs text-slate-400 mb-3">Create an offline room for your friend to join</p>
                </div>
                <button
                  onClick={handleCreateRoom}
                  disabled={isCreatingRoom}
                  className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold shadow-md transition"
                >
                  {isCreatingRoom ? 'Creating Room...' : hostOfferCode ? 'Regenerate Code' : 'Create Room'}
                </button>
              </div>

              {/* Guest Box */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-bold mb-1">
                    <QrCode size={16} /> Phone 2 (Friend)
                  </div>
                  <p className="text-xs text-slate-400 mb-3">Connect to Host via hotspot code or QR</p>
                </div>
                <button
                  onClick={() => {
                    setGuestAnswerCode('');
                    sounds.playClick();
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition"
                >
                  Join Room
                </button>
              </div>
            </div>

            {/* Host Section active */}
            {hostOfferCode && (
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-sky-500/30 text-center">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[11px] font-bold uppercase tracking-wider mb-2">
                  Host Room Active
                </span>
                <p className="text-xs text-slate-300 mb-3">
                  Have Phone 2 scan this QR Code or paste the code below:
                </p>

                {hostQrUrl && (
                  <div className="flex justify-center mb-3">
                    <div className="p-2.5 bg-white rounded-2xl shadow-xl">
                      <img src={hostQrUrl} alt="Room QR Code" className="w-48 h-48 sm:w-52 sm:h-52 object-contain" />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="text"
                    readOnly
                    value={hostOfferCode}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 font-mono truncate"
                  />
                  <button
                    onClick={() => copyToClipboard(hostOfferCode)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1"
                  >
                    {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    {copiedCode ? 'Copied' : 'Copy'}
                  </button>
                </div>

                {/* Accept guest answer step */}
                <div className="pt-3 border-t border-slate-800 text-left">
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    Step 2: Paste Friend's Answer Code:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Paste answer code from Phone 2..."
                      value={guestAnswerInput}
                      onChange={(e) => setGuestAnswerInput(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                    <button
                      onClick={handleAcceptGuestAnswer}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1"
                    >
                      Connect <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Guest Section active */}
            {!hostOfferCode && (
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-2">
                  Join Host Room
                </span>
                <p className="text-xs text-slate-400 mb-3">
                  Paste the Room Code shown on Phone 1:
                </p>

                <div className="flex flex-col gap-2 mb-3">
                  <textarea
                    rows={2}
                    placeholder="Paste Phone 1 room code here..."
                    value={guestInputOffer}
                    onChange={(e) => setGuestInputOffer(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono"
                  />
                  <button
                    onClick={handleJoinRoom}
                    disabled={isJoining || !guestInputOffer.trim()}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition"
                  >
                    {isJoining ? 'Generating Answer...' : 'Join & Generate Answer Code'}
                  </button>
                </div>

                {guestAnswerCode && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-emerald-500/30 text-center">
                    <p className="text-xs text-emerald-300 font-bold mb-2">
                      Answer Generated! Show QR to Phone 1 or copy code:
                    </p>
                    {guestQrUrl && (
                      <div className="flex justify-center mb-2">
                        <div className="p-2 bg-white rounded-xl">
                          <img src={guestQrUrl} alt="Answer QR" className="w-40 h-40 object-contain" />
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={guestAnswerCode}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-400 font-mono truncate"
                      />
                      <button
                        onClick={() => copyToClipboard(guestAnswerCode)}
                        className="px-3 py-1 bg-slate-800 rounded-lg text-xs text-white font-medium"
                      >
                        Copy
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        onStartHotspotGame('guest');
                        onClose();
                      }}
                      className="w-full mt-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition"
                    >
                      I Showed / Sent Code to Host — Start Match
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Pass & Play (Same Phone Hotseat) */}
        {activeTab === 'pass_play' && (
          <div className="flex-1 space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <h3 className="text-sm font-bold text-white mb-1">Play on 1 Phone</h3>
              <p className="text-xs text-slate-400 mb-4">
                Take turns shooting on the same screen. Perfect for playing with a friend anywhere without any setup!
              </p>

              <div className="space-y-3 mb-5">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Player 1 Name</label>
                  <input
                    type="text"
                    value={p1Name}
                    onChange={(e) => setP1Name(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Player 2 Name</label>
                  <input
                    type="text"
                    value={p2Name}
                    onChange={(e) => setP2Name(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  sounds.playClick();
                  onStartPassAndPlay(p1Name, p2Name);
                  onClose();
                }}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition"
              >
                <Play size={16} fill="currentColor" /> Start Pass & Play Match
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Easy Step-by-Step Guide */}
        {activeTab === 'guide' && (
          <div className="flex-1 overflow-y-auto space-y-3 py-2 text-xs text-slate-300 pr-1">
            <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700">
              <span className="font-bold text-sky-400 text-sm block mb-1">Step 1: Turn on Hotspot</span>
              Player 1 goes to Android Settings &gt; Network &gt; <strong>Hotspot & Tethering</strong> and turns on Portable Hotspot. (No mobile data or internet is required!).
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700">
              <span className="font-bold text-emerald-400 text-sm block mb-1">Step 2: Friend Connects</span>
              Player 2 opens Wi-Fi settings and connects to Player 1's hotspot network.
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700">
              <span className="font-bold text-amber-400 text-sm block mb-1">Step 3: Scan QR Code</span>
              Both players open <strong>Pool Legends</strong>. Player 1 taps "Create Room" and Player 2 scans the QR code. You're now connected peer-to-peer!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
