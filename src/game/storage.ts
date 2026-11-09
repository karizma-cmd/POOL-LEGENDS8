/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlayerProfile, CueItem, TableSkin, BallSkin } from './types';

export const CUES_CATALOG: CueItem[] = [
  {
    id: 'cue_birch',
    name: 'Standard Birch',
    arabicName: 'خشب البتولا الكلاسيكي',
    price: 0,
    unlocked: true,
    power: 2,
    aimLength: 2,
    spinControl: 2,
    tier: 'starter',
    description: 'The reliable starter cue with balanced weight and smooth natural birch finish.',
    arabicDescription: 'عصا البداية المعتمدة بتوازن ممتاز وخشب بتولا طبيعي ناعم ومريح للمبتدئين.',
    primaryColor: '#b45309',
    accentColor: '#78350f',
    shaftMaterial: 'birch',
  },
  {
    id: 'cue_carbon',
    name: 'Tactical Shadow Carbon',
    arabicName: 'كاربون الظل التكتيكي',
    price: 20000,
    unlocked: false,
    power: 3,
    aimLength: 3,
    spinControl: 3,
    tier: 'common',
    description: 'Aerospace-grade carbon fiber composite shaft with vibration reduction technology.',
    arabicDescription: 'سبيكة ألياف الكربون المقاومة للانحناء مع تقليل ارتداد الضربة وتحسين الدقة.',
    primaryColor: '#18181b',
    accentColor: '#38bdf8',
    shaftMaterial: 'carbon',
  },
  {
    id: 'cue_falcon',
    name: 'Royal Arabian Falcon',
    arabicName: 'صقر الصحراء المذهب',
    price: 50000,
    unlocked: false,
    power: 4,
    aimLength: 4,
    spinControl: 4,
    tier: 'rare',
    description: 'Bespoke golden falcon filigree with premium genuine leather wrap for exquisite cue control.',
    arabicDescription: 'تصميم ملكي مستوحى من الصقر العربي بنقوش ذهبية ومقبض جلدي يوفر دوراناً استثنائياً للكرات.',
    primaryColor: '#d97706',
    accentColor: '#fbbf24',
    shaftMaterial: 'gold',
  },
  {
    id: 'cue_dragon',
    name: 'Volcanic Dragonfire',
    arabicName: 'لهب التنين البركاني',
    price: 95000,
    unlocked: false,
    power: 5,
    aimLength: 4,
    spinControl: 4,
    tier: 'epic',
    description: 'Tempered crimson maple with dragon scale grip for explosive break power.',
    arabicDescription: 'خشب القيقب الناري المعالج حرارياً لتوليد قوة كسر تفجيرية تشق رصّة الكرات بسهولة.',
    primaryColor: '#dc2626',
    accentColor: '#f59e0b',
    shaftMaterial: 'maple',
  },
  {
    id: 'cue_viper',
    name: 'Royal Viper Emerald',
    arabicName: 'أفعى الزمرد الملكية',
    price: 150000,
    unlocked: false,
    power: 4,
    aimLength: 5,
    spinControl: 5,
    tier: 'epic',
    description: 'Iridescent emerald viper wrap with precision counter-balance for razor-sharp spin shots.',
    arabicDescription: 'جلد ثعبان أخضر زمردي فاخر مع موازنة سحرية تسمح بإعطاء دوران جانبي حاد للكرات المعقدة.',
    primaryColor: '#065f46',
    accentColor: '#34d399',
    shaftMaterial: 'obsidian',
  },
  {
    id: 'cue_pharaoh',
    name: 'Golden Pharaoh Sovereign',
    arabicName: 'فرعون الذهب الخالص',
    price: 220000,
    unlocked: false,
    power: 5,
    aimLength: 5,
    spinControl: 5,
    tier: 'legendary',
    description: 'Legendary gold leaf wrapping with Egyptian lapis lazuli accents. Maximum tournament stats.',
    arabicDescription: 'مغطاة بالكامل بالذهب عيار 24 مع تطعيمات حجر اللازورد الملكي وإحصائيات بطولات كاملة.',
    primaryColor: '#ca8a04',
    accentColor: '#1e3a8a',
    shaftMaterial: 'gold',
  },
  {
    id: 'cue_obsidian',
    name: 'Black Diamond Eclipse',
    arabicName: 'كسوف الأوبسيديان الفضائي',
    price: 300000,
    unlocked: false,
    power: 5,
    aimLength: 5,
    spinControl: 5,
    tier: 'legendary',
    description: 'Carved from volcanic obsidian with deep amethyst reflections, striking fear on the felt.',
    arabicDescription: 'منحوتة من زجاج الأوبسيديان البركاني المصقول مع طاقة بنفسجية ترهب الخصوم على الطاولة.',
    primaryColor: '#1e1b4b',
    accentColor: '#c084fc',
    shaftMaterial: 'obsidian',
  },
  {
    id: 'cue_nebula',
    name: 'Cosmic Nebula Star',
    arabicName: 'سديم الفضاء الكوني',
    price: 390000,
    unlocked: false,
    power: 5,
    aimLength: 5,
    spinControl: 5,
    tier: 'mythic',
    description: 'Infused with starlight and interstellar matter, providing surreal hydrodynamic accuracy.',
    arabicDescription: 'عصا نيزكية تسخر طاقة النجوم لتوفير دقة تسديد وتحكم هيدروديناميكي لا يُضاهى.',
    primaryColor: '#4c1d95',
    accentColor: '#38bdf8',
    shaftMaterial: 'neon',
  },
  {
    id: 'cue_titan',
    name: 'Quantum Titan Apex',
    arabicName: 'تيتان الكم الخارق',
    price: 480000,
    unlocked: false,
    power: 5,
    aimLength: 5,
    spinControl: 5,
    tier: 'mythic',
    description: 'The pinnacle of high-tech pool engineering, titanium alloy shaft with anti-friction coating.',
    arabicDescription: 'أعظم إنجاز في تاريخ البلياردو الاحترافي، سبيكة تيتانيوم مضادة للجاذبية بقمة الأداء.',
    primaryColor: '#0369a1',
    accentColor: '#f8fafc',
    shaftMaterial: 'carbon',
  },
  {
    id: 'cue_frostbite',
    name: 'Valkyrie Frost Crystalline',
    arabicName: 'صقيع الفالكيري الكريستالي',
    price: 580000,
    unlocked: false,
    power: 5,
    aimLength: 5,
    spinControl: 5,
    tier: 'mythic',
    description: 'Carved from glacial sapphire with shimmering polar ice crystals that freeze the table.',
    arabicDescription: 'منحوتة من ياقوت القطب الجليدي مع بلورات متوهجة تجمد الطاولة بدقة توجيه خارقة.',
    primaryColor: '#0284c7',
    accentColor: '#bae6fd',
    shaftMaterial: 'neon',
  },
  {
    id: 'cue_katana',
    name: 'Samurai Katana Edge',
    arabicName: 'سيف الساموراي الإمبراطوري',
    price: 670000,
    unlocked: false,
    power: 5,
    aimLength: 5,
    spinControl: 5,
    tier: 'mythic',
    description: 'Folded Damascus steel shaft with braided crimson Tsuka grip and razor-honed balance.',
    arabicDescription: 'فولاذ دمشقي مطوي مع مقبض تسوكا ياباني مجدول باللون القرمزي لقطع زوايا الكرات بحدة السيف.',
    primaryColor: '#881337',
    accentColor: '#e11d48',
    shaftMaterial: 'carbon',
  },
  {
    id: 'cue_phoenix',
    name: 'Phoenix Sunburst Apex',
    arabicName: 'وهج العنقاء الأسطورية',
    price: 760000,
    unlocked: false,
    power: 5,
    aimLength: 5,
    spinControl: 5,
    tier: 'mythic',
    description: 'Forged in immortal solar flames, radiating solar flares and golden embers with every strike.',
    arabicDescription: 'مصنوعة من ريش ولهب طائر العنقاء الخالد، تشع شرارات ذهبية شمسية مع كل ضربة.',
    primaryColor: '#b45309',
    accentColor: '#fef08a',
    shaftMaterial: 'gold',
  },
  {
    id: 'cue_dark_matter',
    name: 'Dark Matter Singularity',
    arabicName: 'ثقب المادة المظلمة',
    price: 840000,
    unlocked: false,
    power: 5,
    aimLength: 5,
    spinControl: 5,
    tier: 'mythic',
    description: 'Harnesses a gravitational micro-singularity to pull object balls straight into the pockets.',
    arabicDescription: 'تسخر جاذبية الثقوب السوداء لسحب الكرات مباشرة إلى الجيوب بقوة جذب كونية مذهلة.',
    primaryColor: '#0f172a',
    accentColor: '#a855f7',
    shaftMaterial: 'obsidian',
  },
  {
    id: 'cue_excalibur',
    name: 'Excalibur Royal Sovereign',
    arabicName: 'إكسكاليبور الملكي الأعظم',
    price: 910000,
    unlocked: false,
    power: 5,
    aimLength: 5,
    spinControl: 5,
    tier: 'mythic',
    description: 'The legendary sword of kings reborn as an unrivaled cue stick crowned with flawless diamonds.',
    arabicDescription: 'سيف الملوك الأسطوري متجسد في عصا ملكية مرصعة بالماس والياقوت الأزرق الملكي.',
    primaryColor: '#1e3a8a',
    accentColor: '#fbbf24',
    shaftMaterial: 'gold',
  },
  {
    id: 'cue_cyberpunk',
    name: 'Cyberpunk Glitch Matrix',
    arabicName: 'ماتريكس السايبربانك المتوهج',
    price: 960000,
    unlocked: false,
    power: 5,
    aimLength: 5,
    spinControl: 5,
    tier: 'mythic',
    description: 'Holographic circuit boards pulsing with synthetic cyber neon code and hyper-reactive sensors.',
    arabicDescription: 'دوائر إلكترونية مجسمة بنبضات شيفرة الماتريكس الخضراء مع استجابة فائقة السرعة.',
    primaryColor: '#15803d',
    accentColor: '#4ade80',
    shaftMaterial: 'neon',
  },
  {
    id: 'cue_zeus',
    name: 'Thunderbolt Zeus Immortal',
    arabicName: 'صاعقة زيوس الرعدية',
    price: 985000,
    unlocked: false,
    power: 5,
    aimLength: 5,
    spinControl: 5,
    tier: 'mythic',
    description: 'Electrified Greek lightning bolt captured in crystalline ether, striking with thunderous impact.',
    arabicDescription: 'صاعقة برق إلهية محبوسة في زجاج نقي تضرب رصة الكرات بقوة زلزالية خارقة.',
    primaryColor: '#1d4ed8',
    accentColor: '#60a5fa',
    shaftMaterial: 'neon',
  },
  {
    id: 'cue_jade_dragon',
    name: 'Imperial Jade Dragon',
    arabicName: 'تنين الإمبراطور الزمردي',
    price: 995000,
    unlocked: false,
    power: 5,
    aimLength: 5,
    spinControl: 5,
    tier: 'mythic',
    description: 'Carved from an unbroken boulder of pure Imperial Jade with serpentine 24K gold dragon scales.',
    arabicDescription: 'منحوتة من حجر اليشم الإمبراطوري الخالص مع حراشف تنين ذهبية عيار 24 للملوك فقط.',
    primaryColor: '#047857',
    accentColor: '#fbbf24',
    shaftMaterial: 'gold',
  },
  {
    id: 'cue_grandmaster',
    name: 'Eternal Grandmaster Sovereign',
    arabicName: 'الملك الأسطوري الأبدي',
    price: 1000000,
    unlocked: false,
    power: 5,
    aimLength: 5,
    spinControl: 5,
    tier: 'mythic',
    description: 'The ultimate pool cue in existence. Solid mirror-polished platinum with red ruby inlays.',
    arabicDescription: 'أعظم وأثمن عصا في تاريخ لعبة البلياردو. بلاتين خالص مصقول بمرآة مع ياقوت أحمر ملكي نادر.',
    primaryColor: '#94a3b8',
    accentColor: '#ef4444',
    shaftMaterial: 'gold',
  },
];

export const TABLES_CATALOG: TableSkin[] = [
  {
    id: 'table_wildwest',
    name: 'Wild West Wanted 8BP',
    arabicName: 'طاولة الغرب الأمريكي (8BP)',
    price: 0,
    unlocked: true,
    feltColor: '#8f381c', // Warm rust/terracotta leather felt from reference image
    feltRoughness: 0.82,
    frameColor: '#78350f', // Antique carved mahogany wood
    frameMaterial: 'mahogany',
    accentColor: '#f59e0b',
  },
  {
    id: 'table_green',
    name: 'Classic Tournament Green',
    price: 0,
    unlocked: true,
    feltColor: '#15803d',
    feltRoughness: 0.8,
    frameColor: '#854d0e', // Warm luxury polished mahogany
    frameMaterial: 'mahogany',
    accentColor: '#eab308',
  },
  {
    id: 'table_midnight',
    name: 'Midnight Navy Blue',
    price: 600,
    unlocked: false,
    feltColor: '#1e3a8a',
    feltRoughness: 0.75,
    frameColor: '#09090b',
    frameMaterial: 'ebony',
    accentColor: '#38bdf8',
  },
  {
    id: 'table_ruby',
    name: 'Royal Ruby Crimson',
    price: 1200,
    unlocked: false,
    feltColor: '#881337',
    feltRoughness: 0.78,
    frameColor: '#451a03',
    frameMaterial: 'mahogany',
    accentColor: '#fbbf24',
  },
  {
    id: 'table_cyber',
    name: 'Cyberpunk Neon Table',
    price: 2500,
    unlocked: false,
    feltColor: '#312e81',
    feltRoughness: 0.7,
    frameColor: '#030712',
    frameMaterial: 'cyber',
    accentColor: '#a855f7',
  },
];

export const BALLS_CATALOG: BallSkin[] = [
  {
    id: 'balls_classic',
    name: 'Official Tournament Resin',
    price: 0,
    unlocked: true,
    style: 'classic',
  },
  {
    id: 'balls_pearl',
    name: 'High-Gloss Pearl Finish',
    price: 800,
    unlocked: false,
    style: 'pearl',
  },
  {
    id: 'balls_neon',
    name: 'Cyber Glow Neon Set',
    price: 1800,
    unlocked: false,
    style: 'neon',
  },
];

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  rewardCoins: number;
  unlocked: boolean;
}

export const ACHIEVEMENTS_LIST: Achievement[] = [
  { id: 'first_break', title: 'Opening Break', desc: 'Take your first break shot in any mode', icon: '🎱', rewardCoins: 100, unlocked: false },
  { id: 'first_win', title: 'First Victory', desc: 'Win your first match against AI or a friend', icon: '🏆', rewardCoins: 250, unlocked: false },
  { id: 'pot_10', title: 'Sharpshooter', desc: 'Pot 10 object balls in your career', icon: '🎯', rewardCoins: 300, unlocked: false },
  { id: 'pot_50', title: 'Billiards Master', desc: 'Pot 50 object balls', icon: '💎', rewardCoins: 800, unlocked: false },
  { id: 'tournament_champ', title: 'Grand Champion', desc: 'Win an 8-player bracket tournament', icon: '👑', rewardCoins: 1500, unlocked: false },
  { id: 'bank_shot', title: 'Bank Shot Wizard', desc: 'Pot a ball via cushion rebound', icon: '⚡', rewardCoins: 400, unlocked: false },
  { id: 'streak_3', title: 'On Fire', desc: 'Win 3 matches in a row', icon: '🔥', rewardCoins: 600, unlocked: false },
  { id: 'hotspot_connect', title: 'Local Legend', desc: 'Play an offline hotspot multiplayer match', icon: '📡', rewardCoins: 500, unlocked: false },
];

export interface DailyChallenge {
  id: string;
  title: string;
  desc: string;
  target: number;
  current: number;
  reward: number;
  completed: boolean;
}

const STORAGE_KEY_PROFILE = 'pool_legends_profile_v1';
const STORAGE_KEY_CUES = 'pool_legends_cues_v1';
const STORAGE_KEY_TABLES = 'pool_legends_tables_v1';
const STORAGE_KEY_BALLS = 'pool_legends_balls_v1';
const STORAGE_KEY_ACHIEVEMENTS = 'pool_legends_achievements_v1';
const STORAGE_KEY_DAILY = 'pool_legends_daily_v1';

class StorageManager {
  public getProfile(): PlayerProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (data) return JSON.parse(data);
    } catch {}

    const defaultProfile: PlayerProfile = {
      id: 'player_' + Math.random().toString(36).substring(2, 8),
      name: 'Cue Master',
      avatar: '🎱',
      level: 1,
      xp: 0,
      coins: 1000, // Generous starting balance
      selectedCueId: 'cue_birch',
      selectedTableFelt: 'table_wildwest',
      selectedTableFrame: 'table_wildwest',
      selectedBallSkin: 'balls_classic',
      matchesWon: 0,
      matchesLost: 0,
      ballsPottedTotal: 0,
      tournamentsWon: 0,
      highestStreak: 0,
      currentStreak: 0,
    };
    this.saveProfile(defaultProfile);
    return defaultProfile;
  }

  public saveProfile(profile: PlayerProfile) {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
    } catch {}
  }

  public addCoins(amount: number): number {
    const profile = this.getProfile();
    profile.coins += amount;
    this.saveProfile(profile);
    return profile.coins;
  }

  public addXP(amount: number): { level: number; leveledUp: boolean } {
    const profile = this.getProfile();
    profile.xp += amount;
    const requiredXP = profile.level * 250;
    let leveledUp = false;

    if (profile.xp >= requiredXP) {
      profile.level++;
      profile.xp -= requiredXP;
      profile.coins += profile.level * 100;
      leveledUp = true;
    }
    this.saveProfile(profile);
    return { level: profile.level, leveledUp };
  }

  public getCues(): CueItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CUES);
      if (data) {
        const parsed: CueItem[] = JSON.parse(data);
        const merged = CUES_CATALOG.map(cat => {
          const stored = parsed.find(p => p.id === cat.id);
          if (stored) {
            return {
              ...cat,
              unlocked: stored.unlocked || cat.unlocked,
            };
          }
          return cat;
        });
        return merged;
      }
    } catch {}
    return CUES_CATALOG;
  }

  public saveCues(cues: CueItem[]) {
    try {
      localStorage.setItem(STORAGE_KEY_CUES, JSON.stringify(cues));
    } catch {}
  }

  public unlockCue(cueId: string): boolean {
    const cues = this.getCues();
    const cue = cues.find(c => c.id === cueId);
    const profile = this.getProfile();
    if (!cue || cue.unlocked || profile.coins < cue.price) return false;

    profile.coins -= cue.price;
    cue.unlocked = true;
    this.saveProfile(profile);
    this.saveCues(cues);
    return true;
  }

  public getTables(): TableSkin[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_TABLES);
      if (data) {
        const parsed: TableSkin[] = JSON.parse(data);
        return parsed.map(t => (t.id === 'table_green' && (t.frameColor === '#3d1d11' || t.frameColor === '#000000')) ? { ...t, frameColor: '#854d0e' } : t);
      }
    } catch {}
    return TABLES_CATALOG;
  }

  public saveTables(tables: TableSkin[]) {
    try {
      localStorage.setItem(STORAGE_KEY_TABLES, JSON.stringify(tables));
    } catch {}
  }

  public unlockTable(tableId: string): boolean {
    const tables = this.getTables();
    const table = tables.find(t => t.id === tableId);
    const profile = this.getProfile();
    if (!table || table.unlocked || profile.coins < table.price) return false;

    profile.coins -= table.price;
    table.unlocked = true;
    this.saveProfile(profile);
    this.saveTables(tables);
    return true;
  }

  public getAchievements(): Achievement[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_ACHIEVEMENTS);
      if (data) return JSON.parse(data);
    } catch {}
    return ACHIEVEMENTS_LIST;
  }

  public unlockAchievement(id: string): Achievement | null {
    const list = this.getAchievements();
    const ach = list.find(a => a.id === id);
    if (ach && !ach.unlocked) {
      ach.unlocked = true;
      try {
        localStorage.setItem(STORAGE_KEY_ACHIEVEMENTS, JSON.stringify(list));
      } catch {}
      this.addCoins(ach.rewardCoins);
      return ach;
    }
    return null;
  }

  public getDailyChallenges(): DailyChallenge[] {
    const today = new Date().toISOString().slice(0, 10);
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DAILY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === today) {
          return parsed.challenges;
        }
      }
    } catch {}

    const newChallenges: DailyChallenge[] = [
      { id: 'daily_pot_5', title: 'Daily Potter', desc: 'Pot 5 object balls today', target: 5, current: 0, reward: 250, completed: false },
      { id: 'daily_win_1', title: 'Daily Champion', desc: 'Win 1 match in 8-Ball or 9-Ball', target: 1, current: 0, reward: 350, completed: false },
      { id: 'daily_clean', title: 'Precision Game', desc: 'Finish a match without scratching', target: 1, current: 0, reward: 300, completed: false },
    ];

    try {
      localStorage.setItem(STORAGE_KEY_DAILY, JSON.stringify({ date: today, challenges: newChallenges }));
    } catch {}

    return newChallenges;
  }
}

export const storage = new StorageManager();
