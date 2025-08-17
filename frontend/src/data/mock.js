// Mock data for Inazuma Eleven Victory Road
export const mockCharacters = [
  {
    id: 1,
    name: "Riccardo Di Rigo",
    nickname: "Riccardo",
    title: "Divine Maestro",
    baseLevel: 30,
    baseRarity: "Legendary",
    position: "MF",
    element: "Fire",
    jerseyNumber: 18,
    portrait: "/api/placeholder/150/150",
    teamLogo: "/api/placeholder/40/40",
    baseStats: {
      kick: { main: 122, secondary: 180 },
      control: { main: 139, secondary: 202 },
      technique: { main: 154, secondary: 224 },
      intelligence: { main: 137, secondary: 199 },
      pressure: { main: 112, secondary: 163 },
      agility: { main: 104, secondary: 155 },
      physical: { main: 88, secondary: 139 }
    },
    description: "He guides his team so precisely it's as if he were conducting an orchestra. A genius playmaker known as the 'Virtuoso' by many.",
    hissatsu: [
      { name: "Orchestral Conduct", description: "Divine control technique that guides the ball with perfect precision", type: "Dribble", icon: "/api/placeholder/40/40" },
      { name: "Maestro's Shot", description: "A shooting technique that finds the perfect angle every time", type: "Shot", icon: "/api/placeholder/40/40" },
      { name: "Virtuoso Pass", description: "A passing technique that creates perfect opportunities", type: "Pass", icon: "/api/placeholder/40/40" }
    ],
    teamPassives: [
      { name: "Virtuoso Conduct", description: "Team's Focus value +25% when outside of Zone", icon: "/api/placeholder/30/30" },
      { name: "Orchestral Harmony", description: "When same-element player is nearby, gain Castle Wall DF +3%", icon: "/api/placeholder/30/30" },
      { name: "Divine Inspiration", description: "Focus value +5% to different position players", icon: "/api/placeholder/30/30" },
      { name: "Maestro's Guidance", description: "Team's Tension is below 50%, team's Shot AT +20%", icon: "/api/placeholder/30/30" },
      { name: "Perfect Pitch", description: "When opponent commits a foul, Shot Power increased by 4%", icon: "/api/placeholder/30/30" }
    ]
  },
  {
    id: 2,
    name: "Mark Evans",
    nickname: "Mark",
    title: "Legendary Keeper",
    baseLevel: 30,
    baseRarity: "Epic",
    position: "GK",
    element: "Earth",
    jerseyNumber: 1,
    portrait: "/api/placeholder/150/150",
    teamLogo: "/api/placeholder/40/40",
    baseStats: {
      kick: { main: 85, secondary: 125 },
      control: { main: 95, secondary: 140 },
      technique: { main: 110, secondary: 160 },
      intelligence: { main: 125, secondary: 180 },
      pressure: { main: 140, secondary: 200 },
      agility: { main: 115, secondary: 165 },
      physical: { main: 130, secondary: 185 }
    },
    description: "A passionate goalkeeper who never gives up. His determination inspires the entire team.",
    hissatsu: [
      { name: "God Hand", description: "Divine protection that blocks any shot", type: "Block", icon: "/api/placeholder/40/40" },
      { name: "Majin The Hand", description: "Demonic power that crushes incoming attacks", type: "Block", icon: "/api/placeholder/40/40" },
      { name: "Keeper's Punch", description: "Powerful punch that clears dangerous situations", type: "Punch", icon: "/api/placeholder/40/40" }
    ],
    teamPassives: [
      { name: "Goalkeeper's Spirit", description: "When goal is conceded, team's morale increases by 10%", icon: "/api/placeholder/30/30" },
      { name: "Last Stand", description: "Focus value +15% when team is losing", icon: "/api/placeholder/30/30" },
      { name: "Inspiring Presence", description: "Team's pressure +5% for all players", icon: "/api/placeholder/30/30" },
      { name: "Never Give Up", description: "Team recovers 20% faster from negative effects", icon: "/api/placeholder/30/30" },
      { name: "Guardian's Watch", description: "DF +25% when opponent is in critical zone", icon: "/api/placeholder/30/30" }
    ]
  },
  {
    id: 3,
    name: "Axel Blaze",
    nickname: "Axel",
    title: "Flame Striker",
    baseLevel: 28,
    baseRarity: "Epic",
    position: "FW",
    element: "Fire",
    jerseyNumber: 10,
    portrait: "/api/placeholder/150/150",
    teamLogo: "/api/placeholder/40/40",
    baseStats: {
      kick: { main: 155, secondary: 220 },
      control: { main: 120, secondary: 175 },
      technique: { main: 135, secondary: 195 },
      intelligence: { main: 110, secondary: 160 },
      pressure: { main: 95, secondary: 140 },
      agility: { main: 125, secondary: 180 },
      physical: { main: 105, secondary: 150 }
    },
    description: "A striker with blazing passion. His fire burns brightest when the team needs him most.",
    hissatsu: [
      { name: "Fire Tornado", description: "Blazing whirlwind of destruction", type: "Shot", icon: "/api/placeholder/40/40" },
      { name: "Flame Dance", description: "Elegant dribbling technique with fire", type: "Dribble", icon: "/api/placeholder/40/40" },
      { name: "Blazing Pass", description: "High-speed pass that burns through defenses", type: "Pass", icon: "/api/placeholder/40/40" }
    ],
    teamPassives: [
      { name: "Burning Spirit", description: "Shot power +20% when HP is below 50%", icon: "/api/placeholder/30/30" },
      { name: "Ace Striker", description: "Critical hit rate +15% for all shots", icon: "/api/placeholder/30/30" },
      { name: "Fire Element", description: "Fire-based moves deal +25% damage", icon: "/api/placeholder/30/30" },
      { name: "Leader's Call", description: "Team's morale +10% when scoring", icon: "/api/placeholder/30/30" },
      { name: "Blazing Path", description: "Movement speed +20% when chasing ball", icon: "/api/placeholder/30/30" }
    ]
  }
];

export const mockHissatsu = [
  // Shot Techniques
  { id: 1, name: "Fire Tornado", description: "Blazing whirlwind of destruction", type: "Shot", icon: "/api/placeholder/40/40" },
  { id: 2, name: "Megaton Head", description: "Powerful header technique", type: "Shot", icon: "/api/placeholder/40/40" },
  { id: 3, name: "Inazuma Break", description: "Lightning-fast strike", type: "Shot", icon: "/api/placeholder/40/40" },
  { id: 4, name: "Dragon Crash", description: "Devastating dragon-powered shot", type: "Shot", icon: "/api/placeholder/40/40" },
  { id: 5, name: "Bakunetsu Screw", description: "Spinning flame shot", type: "Shot", icon: "/api/placeholder/40/40" },
  { id: 6, name: "Gigant Wall", description: "Powerful defensive shot", type: "Shot", icon: "/api/placeholder/40/40" },
  { id: 7, name: "Excalibur", description: "Legendary sword technique", type: "Shot", icon: "/api/placeholder/40/40" },
  { id: 8, name: "Big Bang", description: "Explosive finishing move", type: "Shot", icon: "/api/placeholder/40/40" },
  { id: 9, name: "Galaxy Eleven", description: "Stellar power shot", type: "Shot", icon: "/api/placeholder/40/40" },
  { id: 10, name: "Omega Phoenix", description: "Phoenix fire technique", type: "Shot", icon: "/api/placeholder/40/40" },
  
  // Dribble Techniques
  { id: 11, name: "Sonic Dash", description: "Lightning-fast dribbling", type: "Dribble", icon: "/api/placeholder/40/40" },
  { id: 12, name: "Spiral Draw", description: "Spinning evasion technique", type: "Dribble", icon: "/api/placeholder/40/40" },
  { id: 13, name: "Flame Dance", description: "Elegant fire dribbling", type: "Dribble", icon: "/api/placeholder/40/40" },
  { id: 14, name: "Shadow Clone", description: "Illusion dribbling technique", type: "Dribble", icon: "/api/placeholder/40/40" },
  { id: 15, name: "Rolling Kick", description: "Acrobatic dribbling move", type: "Dribble", icon: "/api/placeholder/40/40" },
  { id: 16, name: "Spinning Cut", description: "Spinning breakthrough technique", type: "Dribble", icon: "/api/placeholder/40/40" },
  { id: 17, name: "Magnum Force", description: "Powerful breakthrough move", type: "Dribble", icon: "/api/placeholder/40/40" },
  { id: 18, name: "Illusion Ball", description: "Deceptive dribbling technique", type: "Dribble", icon: "/api/placeholder/40/40" },
  { id: 19, name: "Wind Dash", description: "Wind-powered speed technique", type: "Dribble", icon: "/api/placeholder/40/40" },
  { id: 20, name: "Earth Breaker", description: "Ground-shaking dribble", type: "Dribble", icon: "/api/placeholder/40/40" },
  
  // Pass Techniques
  { id: 21, name: "Killer Pass", description: "Devastating pass technique", type: "Pass", icon: "/api/placeholder/40/40" },
  { id: 22, name: "Spinning Pass", description: "Curved ball pass", type: "Pass", icon: "/api/placeholder/40/40" },
  { id: 23, name: "Thunder Pass", description: "Lightning-fast pass", type: "Pass", icon: "/api/placeholder/40/40" },
  { id: 24, name: "Astro Pass", description: "Stellar trajectory pass", type: "Pass", icon: "/api/placeholder/40/40" },
  { id: 25, name: "Flame Pass", description: "Fire-powered pass", type: "Pass", icon: "/api/placeholder/40/40" },
  { id: 26, name: "Wind Pass", description: "Wind-assisted pass", type: "Pass", icon: "/api/placeholder/40/40" },
  { id: 27, name: "Drill Pass", description: "Piercing pass technique", type: "Pass", icon: "/api/placeholder/40/40" },
  { id: 28, name: "Magnet Pass", description: "Magnetic attraction pass", type: "Pass", icon: "/api/placeholder/40/40" },
  { id: 29, name: "Quantum Pass", description: "Quantum mechanics pass", type: "Pass", icon: "/api/placeholder/40/40" },
  { id: 30, name: "Galaxy Pass", description: "Cosmic power pass", type: "Pass", icon: "/api/placeholder/40/40" },
  
  // Block Techniques
  { id: 31, name: "God Hand", description: "Divine protection technique", type: "Block", icon: "/api/placeholder/40/40" },
  { id: 32, name: "Majin The Hand", description: "Demonic blocking power", type: "Block", icon: "/api/placeholder/40/40" },
  { id: 33, name: "Fist of Justice", description: "Righteous blocking technique", type: "Block", icon: "/api/placeholder/40/40" },
  { id: 34, name: "Diamond Hand", description: "Unbreakable defense", type: "Block", icon: "/api/placeholder/40/40" },
  { id: 35, name: "Burning Catch", description: "Flame-powered catch", type: "Block", icon: "/api/placeholder/40/40" },
  { id: 36, name: "Omega Wall", description: "Ultimate defensive barrier", type: "Block", icon: "/api/placeholder/40/40" },
  { id: 37, name: "Thunder Block", description: "Lightning-fast block", type: "Block", icon: "/api/placeholder/40/40" },
  { id: 38, name: "Iron Wall", description: "Immovable defense", type: "Block", icon: "/api/placeholder/40/40" },
  { id: 39, name: "Phantom Block", description: "Ghostly defensive technique", type: "Block", icon: "/api/placeholder/40/40" },
  { id: 40, name: "Galaxy Block", description: "Cosmic defensive power", type: "Block", icon: "/api/placeholder/40/40" },
  
  // Catch Techniques
  { id: 41, name: "Keeper's Catch", description: "Basic goalkeeping technique", type: "Catch", icon: "/api/placeholder/40/40" },
  { id: 42, name: "Super Catch", description: "Enhanced catching ability", type: "Catch", icon: "/api/placeholder/40/40" },
  { id: 43, name: "Flame Catch", description: "Fire-powered catch", type: "Catch", icon: "/api/placeholder/40/40" },
  { id: 44, name: "Wind Catch", description: "Wind-assisted catch", type: "Catch", icon: "/api/placeholder/40/40" },
  { id: 45, name: "Earth Catch", description: "Ground-based catch", type: "Catch", icon: "/api/placeholder/40/40" },
  { id: 46, name: "Thunder Catch", description: "Lightning-fast catch", type: "Catch", icon: "/api/placeholder/40/40" },
  { id: 47, name: "Ice Catch", description: "Freezing catch technique", type: "Catch", icon: "/api/placeholder/40/40" },
  { id: 48, name: "Magnet Catch", description: "Magnetic attraction catch", type: "Catch", icon: "/api/placeholder/40/40" },
  { id: 49, name: "Quantum Catch", description: "Quantum mechanics catch", type: "Catch", icon: "/api/placeholder/40/40" },
  { id: 50, name: "Galaxy Catch", description: "Cosmic power catch", type: "Catch", icon: "/api/placeholder/40/40" },

  // Mixi Max Techniques - Special fusion techniques with legendary beings
  { id: 51, name: "Shindou Keshin Mix Max", description: "Fusion with ancient warrior spirit", type: "mixi-max", icon: "/api/placeholder/40/40" },
  { id: 52, name: "Kirino Beast Mix Max", description: "Fusion with prehistoric beast", type: "mixi-max", icon: "/api/placeholder/40/40" },
  { id: 53, name: "Shinsuke Void Mix Max", description: "Fusion with dimensional keeper", type: "mixi-max", icon: "/api/placeholder/40/40" },
  { id: 54, name: "Tenma Dragon Mix Max", description: "Fusion with legendary dragon spirit", type: "mixi-max", icon: "/api/placeholder/40/40" },
  { id: 55, name: "Tsurugi Lightning Mix Max", description: "Fusion with thunder deity", type: "mixi-max", icon: "/api/placeholder/40/40" },
  { id: 56, name: "Aoi Forest Mix Max", description: "Fusion with nature guardian", type: "mixi-max", icon: "/api/placeholder/40/40" },
  { id: 57, name: "Kariya Shadow Mix Max", description: "Fusion with shadow assassin", type: "mixi-max", icon: "/api/placeholder/40/40" },
  { id: 58, name: "Minaho Ice Mix Max", description: "Fusion with ice empress", type: "mixi-max", icon: "/api/placeholder/40/40" }
];

export const mockTactics = [
  { id: 1, name: "Flame Fortress", description: "Conjure a wall of blazing flame in front of the goal", effect: "DF +100%", icon: "🔥" },
  { id: 2, name: "Sideline Spears", description: "Lightning-fast spear attacks from the sidelines", effect: "KP +10%", icon: "⚡" },
  { id: 3, name: "Mount Fuji", description: "Immovable mountain defense", effect: "Physical +15%", icon: "🏔️" },
  { id: 4, name: "Waxing Moon", description: "Crescent moon slicing technique", effect: "Technique +20%", icon: "🌙" },
  { id: 5, name: "Diamond Defense", description: "Unbreakable formation", effect: "Team DF +50%", icon: "💎" },
  { id: 6, name: "Bond Protocol", description: "Team synchronization boost", effect: "Control +25%", icon: "🤝" },
  { id: 7, name: "Bull Horns", description: "Charging attack formation", effect: "Shot +40%", icon: "🐂" },
  { id: 8, name: "Claymore", description: "Devastating single strike", effect: "Kick +60%", icon: "⚔️" },
  { id: 9, name: "Three-Pronged Attack", description: "Triple threat offensive", effect: "Team AT +35%", icon: "🔱" }
];

export const mockEquipment = {
  boots: [
    { id: 1, name: "Omega Boots", rarity: "Legendary", category: "Boots", icon: "https://images.unsplash.com/photo-1612387048732-1840c48c0976?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwyfHxzb2NjZXIlMjBib290c3xlbnwwfHx8fDE3NTQxMDcxNjF8MA&ixlib=rb-4.1.0&q=85", stats: { kick: 15, agility: 10 } },
    { id: 2, name: "Genesis Boots", rarity: "Epic", category: "Boots", icon: "https://images.unsplash.com/photo-1612387049695-637b743f80ad?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwzfHxzb2NjZXIlMjBib290c3xlbnwwfHx8fDE3NTQxMDcxNjF8MA&ixlib=rb-4.1.0&q=85", stats: { kick: 12, agility: 8 } },
    { id: 3, name: "Flame Boots", rarity: "Rare", category: "Boots", icon: "https://images.unsplash.com/photo-1511426463457-0571e247d816?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwxfHxzb2NjZXIlMjBib290c3xlbnwwfHx8fDE3NTQxMDcxNjF8MA&ixlib=rb-4.1.0&q=85", stats: { kick: 8, agility: 6 } },
    { id: 4, name: "Basic Boots", rarity: "Common", category: "Boots", icon: "https://images.unsplash.com/photo-1653681498612-37ec55093e29?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwyfHxzcG9ydHMlMjBlcXVpcG1lbnR8ZW58MHx8fHwxNzU0MTA3MTc4fDA&ixlib=rb-4.1.0&q=85", stats: { kick: 5, agility: 3 } },
  ],
  bracelets: [
    { id: 5, name: "Genesis Bangle", rarity: "Legendary", category: "Bracelet", icon: "https://images.pexels.com/photos/358042/pexels-photo-358042.jpeg", stats: { control: 15, technique: 10 } },
    { id: 6, name: "Striker's Band", rarity: "Epic", category: "Bracelet", icon: "https://images.unsplash.com/photo-1653590501805-cce7dec267e0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwyfHxnYW1lJTIwY29pbnN8ZW58MHx8fHwxNzU0MTA3MjA5fDA&ixlib=rb-4.1.0&q=85", stats: { control: 12, technique: 8 } },
    { id: 7, name: "Guardian Bangle", rarity: "Rare", category: "Bracelet", icon: "https://images.unsplash.com/photo-1521133573892-e44906baee46?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwzfHxnZW1zfGVufDB8fHx8MTc1NDEwNzIxNXww&ixlib=rb-4.1.0&q=85", stats: { control: 8, technique: 6 } },
    { id: 8, name: "Simple Band", rarity: "Common", category: "Bracelet", icon: "https://images.pexels.com/photos/1147946/pexels-photo-1147946.jpeg", stats: { control: 5, technique: 3 } },
  ],
  pendants: [
    { id: 9, name: "Shiny Mascot", rarity: "Legendary", category: "Pendant", icon: "https://images.unsplash.com/photo-1637597384601-61e937e8bc15?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwyfHxjdXJyZW5jeSUyMHRva2Vuc3xlbnwwfHx8fDE3NTQxMDcyMjF8MA&ixlib=rb-4.1.0&q=85", stats: { intelligence: 15, pressure: 10 } },
    { id: 10, name: "Fire Pendant", rarity: "Epic", category: "Pendant", icon: "https://images.unsplash.com/photo-1653590501805-cce7dec267e0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwyfHxnYW1lJTIwY29pbnN8ZW58MHx8fHwxNzU0MTA3MjA5fDA&ixlib=rb-4.1.0&q=85", stats: { intelligence: 12, pressure: 8 } },
    { id: 11, name: "Shield Pendant", rarity: "Rare", category: "Pendant", icon: "https://images.unsplash.com/photo-1521133573892-e44906baee46?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwzfHxnZW1zfGVufDB8fHx8MTc1NDEwNzIxNXww&ixlib=rb-4.1.0&q=85", stats: { intelligence: 8, pressure: 6 } },
    { id: 12, name: "Lucky Charm", rarity: "Common", category: "Pendant", icon: "https://images.pexels.com/photos/1147946/pexels-photo-1147946.jpeg", stats: { intelligence: 5, pressure: 3 } },
  ],
  special: [
    { id: 13, name: "Professor Layton Accessory", rarity: "Legendary", category: "Special", icon: "https://images.unsplash.com/photo-1637597384601-61e937e8bc15?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwyfHxjdXJyZW5jeSUyMHRva2Vuc3xlbnwwfHx8fDE3NTQxMDcyMjF8MA&ixlib=rb-4.1.0&q=85", stats: { physical: 15, agility: 10 } },
    { id: 14, name: "Captain's Armband", rarity: "Epic", category: "Special", icon: "https://images.pexels.com/photos/358042/pexels-photo-358042.jpeg", stats: { physical: 12, agility: 8 } },
    { id: 15, name: "Ace Number", rarity: "Rare", category: "Special", icon: "https://images.unsplash.com/photo-1653590501805-cce7dec267e0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwyfHxnYW1lJTIwY29pbnN8ZW58MHx8fHwxNzU0MTA3MjA5fDA&ixlib=rb-4.1.0&q=85", stats: { physical: 8, agility: 6 } },
    { id: 16, name: "Team Badge", rarity: "Common", category: "Special", icon: "https://images.unsplash.com/photo-1521133573892-e44906baee46?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwzfHxnZW1zfGVufDB8fHx8MTc1NDEwNzIxNXww&ixlib=rb-4.1.0&q=85", stats: { physical: 5, agility: 3 } },
  ]
};

export const mockCoaches = [
  {
    id: 1,
    name: "Mark Evans Sr.",
    title: "Veteran Coach",
    portrait: "/api/placeholder/150/150",
    bonuses: {
      teamStats: { kick: 10, control: 8, technique: 12 },
      description: "Increases team's offensive capabilities"
    },
    specialties: ["Offensive Training", "Team Spirit", "Shot Power"]
  },
  {
    id: 2,
    name: "Ray Dark",
    title: "Tactical Genius",
    portrait: "/api/placeholder/150/150",
    bonuses: {
      teamStats: { intelligence: 15, pressure: 10, control: 5 },
      description: "Enhances team's tactical awareness"
    },
    specialties: ["Tactical Analysis", "Defense Formation", "Mental Training"]
  },
  {
    id: 3,
    name: "Hibiki Seigou",
    title: "Legendary Coach",
    portrait: "/api/placeholder/150/150",
    bonuses: {
      teamStats: { physical: 12, agility: 8, technique: 10 },
      description: "Balanced training for all aspects"
    },
    specialties: ["Physical Training", "Endurance", "Technique Mastery"]
  }
];

export const mockFormations = [
  {
    id: 1,
    name: "4-4-2 Diamond",
    positions: [
      { id: 'gk', x: 50, y: 85, position: 'GK' },
      { id: 'lb', x: 15, y: 65, position: 'DF' },
      { id: 'cb1', x: 35, y: 70, position: 'DF' },
      { id: 'cb2', x: 65, y: 70, position: 'DF' },
      { id: 'rb', x: 85, y: 65, position: 'DF' },
      { id: 'dm', x: 50, y: 50, position: 'MF' },
      { id: 'lm', x: 25, y: 40, position: 'MF' },
      { id: 'rm', x: 75, y: 40, position: 'MF' },
      { id: 'am', x: 50, y: 30, position: 'MF' },
      { id: 'lf', x: 40, y: 15, position: 'FW' },
      { id: 'rf', x: 60, y: 15, position: 'FW' }
    ]
  },
  {
    id: 2,
    name: "4-3-3",
    positions: [
      { id: 'gk', x: 50, y: 85, position: 'GK' },
      { id: 'lb', x: 15, y: 65, position: 'DF' },
      { id: 'cb1', x: 35, y: 70, position: 'DF' },
      { id: 'cb2', x: 65, y: 70, position: 'DF' },
      { id: 'rb', x: 85, y: 65, position: 'DF' },
      { id: 'cm1', x: 30, y: 45, position: 'MF' },
      { id: 'cm2', x: 50, y: 45, position: 'MF' },
      { id: 'cm3', x: 70, y: 45, position: 'MF' },
      { id: 'lw', x: 25, y: 15, position: 'FW' },
      { id: 'st', x: 50, y: 10, position: 'FW' },
      { id: 'rw', x: 75, y: 15, position: 'FW' }
    ]
  }
];

// Generate more mock characters to reach a good sample size
for (let i = 4; i <= 54; i++) {
  const elements = ['Fire', 'Earth', 'Wind', 'Wood', 'Void'];
  const positions = ['FW', 'MF', 'DF', 'GK'];
  const rarities = ['Common', 'Rare', 'Epic', 'Legendary'];
  const names = [
    'Jude Sharp', 'Nathan Swift', 'Jack Wallside', 'Jim Wraith', 'Tod Ironside',
    'Steve Grim', 'Sammy Wright', 'Timmy Sanders', 'Bobby Shearer', 'Darren Lachance',
    'Kevin Dragonfly', 'Shawn Froste', 'Byron Love', 'Caleb Stonewall', 'Ray Dark',
    'Gazelle', 'Tsunami', 'Fudou Akio', 'Kidou Yuuto', 'Gouenji Shuuya',
    'Endou Mamoru', 'Kazemaru Ichirouta', 'Someoka Ryuugo', 'Kabeyama Heigorou', 'Kurimatsu Teppei',
    'Shishido Sakichi', 'Handa Shinichi', 'Matsuno Kunimi', 'Kageno Jin', 'Shourinji Ayumu',
    'Ichinose Kazuya', 'Domon Asuka', 'Kira Hiroto', 'Midorikawa Ryuuji', 'Suzuno Fuusuke',
    'Nagumo Haruya', 'Fubuki Shirou', 'Afuro Terumi', 'Kiyama Hiroto', 'Toramaru Utsunomiya',
    'Tobitaka Seiya', 'Hiroto Kira', 'Midorikawa Ryuuji', 'Suzuno Fuusuke', 'Nagumo Haruya',
    'Fubuki Shirou', 'Afuro Terumi', 'Kiyama Hiroto', 'Toramaru Utsunomiya', 'Tobitaka Seiya'
  ];
  
  const randomElement = elements[Math.floor(Math.random() * elements.length)];
  const randomPosition = positions[Math.floor(Math.random() * positions.length)];
  const randomRarity = rarities[Math.floor(Math.random() * rarities.length)];
  const randomName = names[Math.floor(Math.random() * names.length)];
  
  mockCharacters.push({
    id: i,
    name: `${randomName} ${i}`,
    nickname: randomName,
    title: `${randomElement} ${randomPosition}`,
    baseLevel: Math.floor(Math.random() * 100) + 1,
    baseRarity: randomRarity,
    position: randomPosition,
    element: randomElement,
    jerseyNumber: Math.floor(Math.random() * 99) + 1,
    portrait: "/api/placeholder/150/150",
    teamLogo: "/api/placeholder/40/40",
    baseStats: {
      kick: { main: Math.floor(Math.random() * 100) + 50, secondary: Math.floor(Math.random() * 100) + 100 },
      control: { main: Math.floor(Math.random() * 100) + 50, secondary: Math.floor(Math.random() * 100) + 100 },
      technique: { main: Math.floor(Math.random() * 100) + 50, secondary: Math.floor(Math.random() * 100) + 100 },
      intelligence: { main: Math.floor(Math.random() * 100) + 50, secondary: Math.floor(Math.random() * 100) + 100 },
      pressure: { main: Math.floor(Math.random() * 100) + 50, secondary: Math.floor(Math.random() * 100) + 100 },
      agility: { main: Math.floor(Math.random() * 100) + 50, secondary: Math.floor(Math.random() * 100) + 100 },
      physical: { main: Math.floor(Math.random() * 100) + 50, secondary: Math.floor(Math.random() * 100) + 100 }
    },
    description: `A talented ${randomPosition} player with ${randomElement} element abilities.`,
    hissatsu: [
      { name: "Technique 1", description: "Sample technique", type: "Shot", icon: "/api/placeholder/40/40" },
      { name: "Technique 2", description: "Sample technique", type: "Dribble", icon: "/api/placeholder/40/40" },
      { name: "Technique 3", description: "Sample technique", type: "Pass", icon: "/api/placeholder/40/40" }
    ],
    teamPassives: [
      { name: "Passive 1", description: "Sample passive ability", icon: "/api/placeholder/30/30" },
      { name: "Passive 2", description: "Sample passive ability", icon: "/api/placeholder/30/30" },
      { name: "Passive 3", description: "Sample passive ability", icon: "/api/placeholder/30/30" },
      { name: "Passive 4", description: "Sample passive ability", icon: "/api/placeholder/30/30" },
      { name: "Passive 5", description: "Sample passive ability", icon: "/api/placeholder/30/30" }
    ]
  });
}

export const getCharactersByElement = (element) => {
  return mockCharacters.filter(char => char.element === element);
};

export const getCharactersByPosition = (position) => {
  return mockCharacters.filter(char => char.position === position);
};

export const searchCharacters = (query) => {
  return mockCharacters.filter(char => 
    char.name.toLowerCase().includes(query.toLowerCase()) ||
    char.nickname.toLowerCase().includes(query.toLowerCase())
  );
};

// Default stat template used when loaded players lack baseStats
export const getDefaultBaseStats = () => ({
  kick: { main: 50, secondary: 100 },
  control: { main: 50, secondary: 100 },
  technique: { main: 50, secondary: 100 },
  intelligence: { main: 50, secondary: 100 },
  pressure: { main: 50, secondary: 100 },
  agility: { main: 50, secondary: 100 },
  physical: { main: 50, secondary: 100 }
});

// Helper function to calculate stats with equipment bonuses (robust to missing fields)
export const calculateStats = (character, equipment, userLevel = 1, userRarity = 'Common') => {
  const safeCharacter = character || {};
  const baseStatsSource = safeCharacter.baseStats && typeof safeCharacter.baseStats === 'object'
    ? safeCharacter.baseStats
    : getDefaultBaseStats();

  // Shallow copy is enough for our numeric structure
  const baseStats = { ...baseStatsSource };

  // Calculate level difference and apply 4 stats per level
  const baseLevel = Number.isFinite(safeCharacter.baseLevel) ? safeCharacter.baseLevel : 1;
  const levelDifference = (Number.isFinite(userLevel) ? userLevel : 1) - baseLevel;
  const levelModifier = levelDifference * 4;
  
  // Calculate rarity difference and apply 10 stats per rarity
  const rarityValues = { 'Common': 0, 'Rare': 1, 'Epic': 2, 'Legendary': 3 };
  const currentRarityValue = rarityValues[safeCharacter.baseRarity] ?? 0;
  const userRarityValue = rarityValues[userRarity] ?? 0;
  const rarityDifference = userRarityValue - currentRarityValue;
  const rarityModifier = rarityDifference * 10;
  
  // Ensure all expected stat keys exist
  const statKeys = ['kick','control','technique','intelligence','pressure','agility','physical'];
  const adjustedBaseStats = {};
  statKeys.forEach(stat => {
    const src = baseStats[stat] || { main: 50, secondary: 100 };
    const adjustedMain = Math.max(1, (src.main || 0) + levelModifier + rarityModifier);
    const adjustedSecondary = Math.max(1, (src.secondary || 0) + levelModifier + rarityModifier);
    adjustedBaseStats[stat] = { main: adjustedMain, secondary: adjustedSecondary };
  });
  
  // Calculate equipment bonuses
  const equipmentBonuses = {};
  statKeys.forEach(stat => { equipmentBonuses[stat] = 0; });
  
  if (equipment && typeof equipment === 'object') {
    Object.keys(equipment).forEach(slot => {
      const item = equipment[slot];
      if (item && item.stats && typeof item.stats === 'object') {
        Object.keys(item.stats).forEach(stat => {
          if (equipmentBonuses[stat] !== undefined) {
            const bonus = Number(item.stats[stat]) || 0;
            equipmentBonuses[stat] += bonus;
          }
        });
      }
    });
  }
  
  // Calculate final stats with equipment bonuses
  const finalStats = {};
  statKeys.forEach(stat => {
    finalStats[stat] = {
      main: adjustedBaseStats[stat].main + equipmentBonuses[stat],
      secondary: adjustedBaseStats[stat].secondary + equipmentBonuses[stat],
      base: adjustedBaseStats[stat].main,
      equipmentBonus: equipmentBonuses[stat]
    };
  });
  
  return finalStats;
};