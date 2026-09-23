export type MoodCategory = "Core" | "Gaming" | "Cyber" | "Secret";

export type PopiEmotion =
  | "idle"
  | "curious"
  | "surprised"
  | "happy"
  | "sleepy"
  | "excited"
  | "thinking"
  // Gaming Core
  | "rage"
  | "gg"
  | "hyped"
  | "clutch"
  | "salty"
  | "ninja"
  | "toxic"
  | "godlike"
  | "afk"
  | "lagging"
  | "boss"
  // Cyber & Sci-Fi
  | "cyber"
  | "laser"
  | "glitch"
  | "matrix"
  | "cosmic"
  | "electric"
  | "alien"
  | "neon"
  | "stealth"
  | "overclocked"
  // Secret & Hidden Vault
  | "demon"
  | "angel"
  | "party"
  | "heart"
  | "retro"
  | "detective"
  | "zen"
  | "rainbow"
  | "pirate"
  | "vampire"
  | "derp"
  | "loading"
  | "money";

export interface PopiMoodConfig {
  id: PopiEmotion;
  label: string;
  category: MoodCategory;
  icon: string;
  quote: string;
  isSecret?: boolean;
  eyeBg: string;
  eyeBorder: string;
  pupilBg: string;
  pupilSecondary?: string;
  pupilShape?: "circle" | "square" | "slit" | "heart" | "pixel" | "loading" | "star";
  glow?: string;
  eyelids?: "none" | "happy" | "sleepy" | "angry" | "wink" | "zen" | "squint" | "pirate";
  jitter?: boolean;
  laserBeam?: boolean;
  frequency?: number; // Web Audio synth note Hz
}

export const POPI_MOODS: PopiMoodConfig[] = [
  // --- CORE MOODS ---
  {
    id: "idle",
    label: "Idle",
    category: "Core",
    icon: "👀",
    quote: "Ready for your next game match!",
    eyeBg: "bg-white",
    eyeBorder: "border-slate-200",
    pupilBg: "bg-[#0F172A]",
    eyelids: "none",
    frequency: 440,
  },
  {
    id: "curious",
    label: "Curious",
    category: "Core",
    icon: "🧐",
    quote: "What game strategy are we testing today?",
    eyeBg: "bg-white",
    eyeBorder: "border-blue-200",
    pupilBg: "bg-[#1E293B]",
    eyelids: "none",
    frequency: 520,
  },
  {
    id: "happy",
    label: "Happy",
    category: "Core",
    icon: "😊",
    quote: "Team synergy level: 100%!",
    eyeBg: "bg-white",
    eyeBorder: "border-amber-200",
    pupilBg: "bg-[#0F172A]",
    eyelids: "happy",
    frequency: 660,
  },
  {
    id: "surprised",
    label: "Surprised",
    category: "Core",
    icon: "😲",
    quote: "Did you just land that impossible headshot?!",
    eyeBg: "bg-white",
    eyeBorder: "border-orange-300",
    pupilBg: "bg-[#0F172A]",
    eyelids: "none",
    glow: "shadow-[0_0_30px_rgba(249,115,22,0.3)]",
    frequency: 740,
  },
  {
    id: "sleepy",
    label: "Sleepy",
    category: "Core",
    icon: "😴",
    quote: "Just 5 more minutes of farming XP...",
    eyeBg: "bg-slate-100",
    eyeBorder: "border-slate-300",
    pupilBg: "bg-slate-700",
    eyelids: "sleepy",
    frequency: 330,
  },
  {
    id: "excited",
    label: "Excited",
    category: "Core",
    icon: "⚡",
    quote: "Match found! Let's lock in and carry!",
    eyeBg: "bg-amber-50",
    eyeBorder: "border-amber-400",
    pupilBg: "bg-amber-950",
    eyelids: "none",
    glow: "shadow-[0_0_35px_rgba(251,191,36,0.5)]",
    frequency: 880,
  },
  {
    id: "thinking",
    label: "Thinking",
    category: "Core",
    icon: "🤔",
    quote: "Calculating optimal flanking trajectory...",
    eyeBg: "bg-white",
    eyeBorder: "border-indigo-200",
    pupilBg: "bg-[#1E1B4B]",
    eyelids: "none",
    frequency: 587,
  },

  // --- GAMING CORE MOODS ---
  {
    id: "rage",
    label: "Rage / Berserk",
    category: "Gaming",
    icon: "🤬",
    quote: "WHO FED THE ENEMY MID LANER?!",
    eyeBg: "bg-red-50",
    eyeBorder: "border-red-500",
    pupilBg: "bg-red-600",
    eyelids: "angry",
    glow: "shadow-[0_0_40px_rgba(239,68,68,0.7)]",
    jitter: true,
    frequency: 220,
  },
  {
    id: "gg",
    label: "GG Victory",
    category: "Gaming",
    icon: "🏆",
    quote: "GG WP! Victory royale secured!",
    eyeBg: "bg-yellow-50",
    eyeBorder: "border-yellow-400",
    pupilBg: "bg-amber-500",
    pupilShape: "star",
    eyelids: "happy",
    glow: "shadow-[0_0_45px_rgba(234,179,8,0.6)]",
    frequency: 990,
  },
  {
    id: "hyped",
    label: "Hyped AF",
    category: "Gaming",
    icon: "🔥",
    quote: "LET'S GOOO! UNSTOPPABLE STREAK!",
    eyeBg: "bg-orange-50",
    eyeBorder: "border-orange-500",
    pupilBg: "bg-[#FF4625]",
    eyelids: "none",
    glow: "shadow-[0_0_40px_rgba(255,70,37,0.7)]",
    frequency: 830,
  },
  {
    id: "clutch",
    label: "1v5 Clutch",
    category: "Gaming",
    icon: "🎯",
    quote: "Everyone quiet... I hear footsteps on A site.",
    eyeBg: "bg-sky-50",
    eyeBorder: "border-sky-500",
    pupilBg: "bg-sky-950",
    eyelids: "squint",
    glow: "shadow-[0_0_35px_rgba(14,165,233,0.5)]",
    frequency: 620,
  },
  {
    id: "salty",
    label: "Salty",
    category: "Gaming",
    icon: "🧂",
    quote: "That hit-registration was completely rigged!",
    eyeBg: "bg-blue-50",
    eyeBorder: "border-blue-400",
    pupilBg: "bg-blue-900",
    eyelids: "sleepy",
    glow: "shadow-[0_0_25px_rgba(59,130,246,0.3)]",
    frequency: 370,
  },
  {
    id: "ninja",
    label: "Ninja Stealth",
    category: "Gaming",
    icon: "🥷",
    quote: "Moving like a shadow through the smoke.",
    eyeBg: "bg-slate-900",
    eyeBorder: "border-emerald-500",
    pupilBg: "bg-emerald-400",
    pupilShape: "slit",
    eyelids: "squint",
    glow: "shadow-[0_0_35px_rgba(16,185,129,0.5)]",
    frequency: 490,
  },
  {
    id: "toxic",
    label: "Toxic Biohazard",
    category: "Gaming",
    icon: "☣️",
    quote: "Uninstall the game bro, my grandma aims better.",
    eyeBg: "bg-lime-50",
    eyeBorder: "border-lime-500",
    pupilBg: "bg-lime-600",
    eyelids: "angry",
    glow: "shadow-[0_0_40px_rgba(132,204,22,0.6)]",
    frequency: 310,
  },
  {
    id: "godlike",
    label: "Godlike Rank",
    category: "Gaming",
    icon: "👑",
    quote: "Top 0.01% on the global leaderboard!",
    eyeBg: "bg-purple-50",
    eyeBorder: "border-purple-500",
    pupilBg: "bg-purple-900",
    pupilShape: "star",
    eyelids: "none",
    glow: "shadow-[0_0_50px_rgba(168,85,247,0.7)]",
    frequency: 1046,
  },
  {
    id: "afk",
    label: "AFK Snack",
    category: "Gaming",
    icon: "🥪",
    quote: "BRB, grabbing energy drink and Doritos...",
    eyeBg: "bg-slate-200",
    eyeBorder: "border-slate-400",
    pupilBg: "bg-slate-500",
    eyelids: "sleepy",
    frequency: 290,
  },
  {
    id: "lagging",
    label: "999ms Lag",
    category: "Gaming",
    icon: "📶",
    quote: "Ping 999ms... teleporting across the map!",
    eyeBg: "bg-red-50",
    eyeBorder: "border-red-400",
    pupilBg: "bg-red-900",
    jitter: true,
    eyelids: "none",
    frequency: 350,
  },
  {
    id: "boss",
    label: "Final Boss",
    category: "Gaming",
    icon: "👹",
    quote: "Phase 2 health bar has entered the arena.",
    eyeBg: "bg-neutral-950",
    eyeBorder: "border-red-600",
    pupilBg: "bg-amber-500",
    pupilShape: "slit",
    eyelids: "angry",
    glow: "shadow-[0_0_50px_rgba(220,38,38,0.8)]",
    frequency: 180,
  },

  // --- CYBER & SCI-FI MOODS ---
  {
    id: "cyber",
    label: "Cyberpunk",
    category: "Cyber",
    icon: "🤖",
    quote: "Neural firmware sync complete. V 2.4.9 loaded.",
    eyeBg: "bg-[#050D1A]",
    eyeBorder: "border-cyan-400",
    pupilBg: "bg-cyan-400",
    eyelids: "none",
    glow: "shadow-[0_0_40px_rgba(6,182,212,0.7)]",
    frequency: 784,
  },
  {
    id: "laser",
    label: "Laser Eyes",
    category: "Cyber",
    icon: "🚨",
    quote: "Target acquired. Thermal laser locked on!",
    eyeBg: "bg-red-950",
    eyeBorder: "border-red-500",
    pupilBg: "bg-red-500",
    laserBeam: true,
    glow: "shadow-[0_0_50px_rgba(239,68,68,0.9)]",
    frequency: 920,
  },
  {
    id: "glitch",
    label: "System Glitch",
    category: "Cyber",
    icon: "👾",
    quote: "E-R-R-0-R: Matrix overflow detected...",
    eyeBg: "bg-fuchsia-950",
    eyeBorder: "border-fuchsia-500",
    pupilBg: "bg-emerald-400",
    jitter: true,
    eyelids: "wink",
    glow: "shadow-[0_0_40px_rgba(217,70,239,0.7)]",
    frequency: 415,
  },
  {
    id: "matrix",
    label: "The Matrix",
    category: "Cyber",
    icon: "🟩",
    quote: "Wake up, gamer. Follow the white rabbit.",
    eyeBg: "bg-black",
    eyeBorder: "border-emerald-500",
    pupilBg: "bg-emerald-500",
    pupilShape: "pixel",
    glow: "shadow-[0_0_45px_rgba(16,185,129,0.8)]",
    frequency: 554,
  },
  {
    id: "cosmic",
    label: "Cosmic Nebula",
    category: "Cyber",
    icon: "🌌",
    quote: "Observing game physics across the multiverse.",
    eyeBg: "bg-[#0b032d]",
    eyeBorder: "border-violet-500",
    pupilBg: "bg-pink-500",
    pupilShape: "star",
    glow: "shadow-[0_0_45px_rgba(236,72,153,0.7)]",
    frequency: 698,
  },
  {
    id: "electric",
    label: "High Voltage",
    category: "Cyber",
    icon: "⚡",
    quote: "100,000 Volts overclocking your GPU!",
    eyeBg: "bg-cyan-950",
    eyeBorder: "border-yellow-400",
    pupilBg: "bg-yellow-300",
    glow: "shadow-[0_0_45px_rgba(250,204,21,0.8)]",
    jitter: true,
    frequency: 880,
  },
  {
    id: "alien",
    label: "Extraterrestrial",
    category: "Cyber",
    icon: "👽",
    quote: "Greetings human. Show me your best esports meta.",
    eyeBg: "bg-black",
    eyeBorder: "border-lime-400",
    pupilBg: "bg-lime-400",
    pupilShape: "slit",
    glow: "shadow-[0_0_40px_rgba(163,230,53,0.7)]",
    frequency: 370,
  },
  {
    id: "neon",
    label: "Synthwave Neon",
    category: "Cyber",
    icon: "🌆",
    quote: "Cruising down the 1984 vaporwave highway.",
    eyeBg: "bg-[#18042B]",
    eyeBorder: "border-pink-500",
    pupilBg: "bg-cyan-400",
    glow: "shadow-[0_0_40px_rgba(236,72,153,0.7)]",
    frequency: 740,
  },
  {
    id: "stealth",
    label: "Optical Camo",
    category: "Cyber",
    icon: "🛡️",
    quote: "Camo index: 98.4%. Completely invisible.",
    eyeBg: "bg-slate-900",
    eyeBorder: "border-teal-500",
    pupilBg: "bg-teal-400",
    eyelids: "squint",
    glow: "shadow-[0_0_30px_rgba(20,184,166,0.4)]",
    frequency: 466,
  },
  {
    id: "overclocked",
    label: "Overclock 6.0GHz",
    category: "Cyber",
    icon: "🏎️",
    quote: "Fans spinning at 10,000 RPM! Maximum FPS!",
    eyeBg: "bg-orange-950",
    eyeBorder: "border-orange-500",
    pupilBg: "bg-amber-400",
    jitter: true,
    glow: "shadow-[0_0_45px_rgba(249,115,22,0.8)]",
    frequency: 932,
  },

  // --- HIDDEN & SECRET VAULT MOODS ---
  {
    id: "demon",
    label: "Demon Horns",
    category: "Secret",
    isSecret: true,
    icon: "😈",
    quote: "Unlocked Secret: Netherworld gaming demon!",
    eyeBg: "bg-black",
    eyeBorder: "border-red-600",
    pupilBg: "bg-red-600",
    pupilShape: "slit",
    eyelids: "angry",
    glow: "shadow-[0_0_50px_rgba(220,38,38,0.9)]",
    frequency: 246,
  },
  {
    id: "angel",
    label: "Seraphim Angel",
    category: "Secret",
    isSecret: true,
    icon: "😇",
    quote: "Unlocked Secret: Guardian Angel of your winrate.",
    eyeBg: "bg-white",
    eyeBorder: "border-amber-300",
    pupilBg: "bg-sky-400",
    pupilShape: "circle",
    eyelids: "zen",
    glow: "shadow-[0_0_50px_rgba(56,189,248,0.8)]",
    frequency: 1174,
  },
  {
    id: "party",
    label: "Disco Party",
    category: "Secret",
    isSecret: true,
    icon: "🎉",
    quote: "Unlocked Secret: Dance floor drop the bass!",
    eyeBg: "bg-fuchsia-900",
    eyeBorder: "border-yellow-400",
    pupilBg: "bg-yellow-300",
    pupilShape: "star",
    glow: "shadow-[0_0_45px_rgba(234,179,8,0.8)]",
    frequency: 1046,
  },
  {
    id: "heart",
    label: "Love & Waifu",
    category: "Secret",
    isSecret: true,
    icon: "💖",
    quote: "Unlocked Secret: POPI loves playing with you!",
    eyeBg: "bg-pink-50",
    eyeBorder: "border-pink-400",
    pupilBg: "bg-rose-500",
    pupilShape: "heart",
    eyelids: "happy",
    glow: "shadow-[0_0_40px_rgba(244,63,94,0.7)]",
    frequency: 784,
  },
  {
    id: "retro",
    label: "8-Bit Arcade",
    category: "Secret",
    isSecret: true,
    icon: "🕹️",
    quote: "Unlocked Secret: Insert Coin to Continue (9... 8...)",
    eyeBg: "bg-[#101018]",
    eyeBorder: "border-green-400",
    pupilBg: "bg-green-400",
    pupilShape: "pixel",
    frequency: 440,
  },
  {
    id: "detective",
    label: "Sherlock Detective",
    category: "Secret",
    isSecret: true,
    icon: "🕵️",
    quote: "Unlocked Secret: The imposter vented in electrical.",
    eyeBg: "bg-amber-100",
    eyeBorder: "border-amber-800",
    pupilBg: "bg-stone-900",
    eyelids: "squint",
    frequency: 523,
  },
  {
    id: "zen",
    label: "Zen Grandmaster",
    category: "Secret",
    isSecret: true,
    icon: "🧘",
    quote: "Unlocked Secret: Inner peace counters all tilting.",
    eyeBg: "bg-emerald-50",
    eyeBorder: "border-emerald-300",
    pupilBg: "bg-emerald-800",
    eyelids: "zen",
    glow: "shadow-[0_0_35px_rgba(16,185,129,0.4)]",
    frequency: 432,
  },
  {
    id: "rainbow",
    label: "RGB Gamer Light",
    category: "Secret",
    isSecret: true,
    icon: "🌈",
    quote: "Unlocked Secret: +15% FPS from RGB lighting!",
    eyeBg: "bg-slate-900",
    eyeBorder: "border-fuchsia-500",
    pupilBg: "bg-gradient-to-r from-red-500 via-green-500 to-blue-500",
    glow: "shadow-[0_0_50px_rgba(168,85,247,0.8)]",
    frequency: 880,
  },
  {
    id: "pirate",
    label: "Pirate Captain",
    category: "Secret",
    isSecret: true,
    icon: "🏴‍☠️",
    quote: "Unlocked Secret: Ahoy matey! Loot the supply crate!",
    eyeBg: "bg-amber-50",
    eyeBorder: "border-amber-700",
    pupilBg: "bg-stone-900",
    eyelids: "pirate",
    frequency: 392,
  },
  {
    id: "vampire",
    label: "Gothic Vampire",
    category: "Secret",
    isSecret: true,
    icon: "🧛",
    quote: "Unlocked Secret: Stealing the enemy team's lifesteal!",
    eyeBg: "bg-black",
    eyeBorder: "border-red-700",
    pupilBg: "bg-red-500",
    pupilShape: "slit",
    glow: "shadow-[0_0_40px_rgba(185,28,28,0.8)]",
    frequency: 261,
  },
  {
    id: "derp",
    label: "Derpy Silly",
    category: "Secret",
    isSecret: true,
    icon: "🤪",
    quote: "Unlocked Secret: No thoughts, head completely empty.",
    eyeBg: "bg-white",
    eyeBorder: "border-pink-300",
    pupilBg: "bg-slate-900",
    pupilShape: "circle",
    frequency: 330,
  },
  {
    id: "loading",
    label: "Buffering...",
    category: "Secret",
    isSecret: true,
    icon: "⏳",
    quote: "Unlocked Secret: Loading assets... 99% stuck forever.",
    eyeBg: "bg-slate-900",
    eyeBorder: "border-blue-400",
    pupilBg: "bg-blue-400",
    pupilShape: "loading",
    frequency: 600,
  },
  {
    id: "money",
    label: "Loot & Gold",
    category: "Secret",
    isSecret: true,
    icon: "💰",
    quote: "Unlocked Secret: Max gold cap reached in 10 minutes!",
    eyeBg: "bg-amber-50",
    eyeBorder: "border-amber-500",
    pupilBg: "bg-amber-500",
    pupilShape: "star",
    glow: "shadow-[0_0_45px_rgba(245,158,11,0.7)]",
    frequency: 1108,
  },
];

export const MOOD_MAP: Record<PopiEmotion, PopiMoodConfig> = POPI_MOODS.reduce(
  (acc, mood) => {
    acc[mood.id] = mood;
    return acc;
  },
  {} as Record<PopiEmotion, PopiMoodConfig>,
);

/** Synthesizes a subtle, pleasant gaming UI sound using Web Audio */
export function playMoodChime(freq = 520) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.35, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.19);
  } catch {
    // Gracefully ignore audio autoplay policies
  }
}
