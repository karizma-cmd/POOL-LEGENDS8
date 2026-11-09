/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Smile, 
  X, 
  Check, 
  Sparkles, 
  Shield, 
  User, 
  Zap, 
  Star,
  RefreshCw
} from 'lucide-react';
import { PlayerProfile } from '../game/types';
import { storage } from '../game/storage';
import { CARTOON_CHARACTERS, CartoonCharacter } from '../game/characters';
import { CartoonAvatar } from './CartoonAvatar';
import { sounds } from '../game/audio';
import { i18n, Language } from '../game/i18n';

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  onProfileUpdate: (updatedProfile: PlayerProfile) => void;
}

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  isOpen,
  onClose,
  profile,
  onProfileUpdate,
}) => {
  const [lang, setLang] = useState<Language>(() => i18n.getLanguage());
  const [selectedAvatar, setSelectedAvatar] = useState<string>(profile.avatar);
  const [successToast, setSuccessToast] = useState<string>('');

  useEffect(() => {
    return i18n.subscribe(l => setLang(l));
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelectedAvatar(profile.avatar);
    }
  }, [isOpen, profile.avatar]);

  if (!isOpen) return null;

  const isAr = lang === 'ar';
  const activeChar = CARTOON_CHARACTERS.find(c => c.avatar === selectedAvatar) || CARTOON_CHARACTERS[0];

  const handleSelectCharacter = (char: CartoonCharacter) => {
    sounds.playClick();
    setSelectedAvatar(char.avatar);
    const updated = { ...profile, avatar: char.avatar };
    storage.saveProfile(updated);
    onProfileUpdate(updated);

    const charName = isAr ? char.nameAr : char.nameEn;
    setSuccessToast(isAr ? `تم اختيار صورة: ${charName} بنجاح!` : `Avatar updated to: ${charName}!`);
    setTimeout(() => setSuccessToast(''), 2500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto select-none"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700/90 shadow-[0_0_50px_rgba(0,0,0,0.85)] p-4 sm:p-6 my-auto max-h-[92vh] flex flex-col overflow-hidden animate-fade-in">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 shadow-inner">
              <Smile size={24} />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-black text-white tracking-wide flex items-center gap-2">
                <span>{isAr ? 'تعديل صورة البروفيل المصغرة' : 'Edit Profile Avatar'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  {CARTOON_CHARACTERS.length} {isAr ? 'شخصيات كرتونية' : 'Cartoons'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                {isAr ? 'اختر شخصيتك الكرتونية المفضلة لوضعها كصورة مصغرة لبروفايلك' : 'Choose your favorite cartoon character avatar for your profile'}
              </p>
            </div>
          </div>

          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Selected Character Preview Banner */}
        <div className="my-3 p-3.5 rounded-2xl bg-gradient-to-r from-slate-850 via-slate-900 to-slate-950 border border-slate-700/80 shadow-lg flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Big Active Avatar Preview */}
            <div className="relative shrink-0">
              <CartoonAvatar
                characterId={activeChar.id}
                avatar={activeChar.avatar}
                size="xl"
                className="border-3 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
              />
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md bg-emerald-500 text-slate-950 text-[9px] font-black shadow flex items-center gap-0.5">
                <Check size={10} />
                <span>{isAr ? 'نشط' : 'Active'}</span>
              </span>
            </div>

            {/* Character Info */}
            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white truncate">
                  {isAr ? activeChar.nameAr : activeChar.nameEn}
                </h3>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {isAr ? 'صورة مصغرة' : 'Thumbnail'}
                </span>
              </div>
              <div className="text-xs text-amber-400 font-semibold truncate mt-0.5">
                {isAr ? activeChar.titleAr : activeChar.specialty}
              </div>
              <div className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                {isAr ? 'الإكسسوار:' : 'Accessory:'} <span className="text-slate-300">{activeChar.accessory}</span>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-[11px] text-slate-400">{isAr ? 'اسم اللاعب:' : 'Player Name:'}</span>
            <span className="text-sm font-black text-emerald-400">{profile.name}</span>
            <span className="text-[10px] text-amber-400 font-bold">{isAr ? 'المستوى' : 'Level'} {profile.level} ⭐</span>
          </div>
        </div>

        {/* Success Feedback Toast */}
        {successToast && (
          <div className="mb-2.5 p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold text-center animate-fade-in flex items-center justify-center gap-1.5 shrink-0">
            <span>✓</span>
            <span>{successToast}</span>
          </div>
        )}

        {/* Cartoon Characters Gallery Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="text-[11px] font-bold text-slate-400 mb-2 px-1 flex items-center justify-between">
            <span>{isAr ? 'انقر على أي شخصية كرتونية لتطبيقها فوراً كصورة لبروفايلك:' : 'Click any cartoon character to immediately apply as your profile picture:'}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {CARTOON_CHARACTERS.map((char) => {
              const isSelected = selectedAvatar === char.avatar;

              return (
                <div
                  key={char.id}
                  onClick={() => handleSelectCharacter(char)}
                  className={`relative p-2.5 rounded-2xl border transition-all duration-200 flex items-center gap-2.5 cursor-pointer group ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-500/25 to-slate-900 border-emerald-400 ring-2 ring-emerald-400/60 shadow-lg scale-102'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  {/* Cartoon Avatar */}
                  <div className="relative shrink-0">
                    <CartoonAvatar
                      characterId={char.id}
                      avatar={char.avatar}
                      size="md"
                      className="shadow group-hover:scale-105 transition-transform"
                    />
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-black shadow">
                        ✓
                      </span>
                    )}
                  </div>

                  {/* Character Details */}
                  <div className="overflow-hidden flex-1">
                    <div className="text-xs font-black text-white truncate flex items-center justify-between">
                      <span>{isAr ? char.nameAr : char.nameEn}</span>
                      {isSelected && (
                        <span className="text-[8px] px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-300 font-bold">
                          {isAr ? 'مختار' : 'Equipped'}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-amber-400 font-semibold truncate">
                      {isAr ? char.titleAr : char.specialty}
                    </div>
                    <div className="text-[9px] text-slate-400 font-medium truncate mt-0.5">
                      {char.accessory}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-3 mt-2 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 text-white font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
          >
            <Check size={16} />
            <span>{isAr ? 'تم وحفظ الصورة المصغرة' : 'Done & Apply Avatar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
