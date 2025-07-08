// Mock data for Inazuma Eleven Victory Road
export const mockCharacters = [
  {
    id: 1,
    name: "Riccardo Di Rigo",
    nickname: "Riccardo",
    title: "Divine Maestro",
    level: 30,
    rarity: "Legendary",
    position: "MF",
    element: "Fire",
    jerseyNumber: 18,
    portrait: "/api/placeholder/150/150",
    teamLogo: "/api/placeholder/40/40",
    stats: {
      kick: { main: 122, secondary: 180 },
      control: { main: 139, secondary: 202 },
      technique: { main: 154, secondary: 224 },
      intelligence: { main: 137, secondary: 199 },
      pressure: { main: 112, secondary: 163 },
      agility: { main: 104, secondary: 155 },
      physical: { main: 88, secondary: 139 }
    },
    description: "He guides his team so precisely it's as if he were conducting an orchestra. A genius playmaker known as the 'Virtuoso' by many.",
    equipment: [
      { name: "Omega Boots", rarity: "Legendary", category: "Boots", icon: "/api/placeholder/40/40" },
      { name: "Genesis Bangle", rarity: "Epic", category: "Bracelet", icon: "/api/placeholder/40/40" },
      { name: "Shiny Mascot", rarity: "Rare", category: "Pendant", icon: "/api/placeholder/40/40" },
      { name: "Professor Layton Accessory", rarity: "Special", category: "Special", icon: "/api/placeholder/40/40" }
    ],
    teamPassives: [
      { name: "Virtuoso Conduct", description: "Team's Focus value +25% when outside of Zone", icon: "/api/placeholder/30/30" },
      { name: "Orchestral Harmony", description: "When same-element player is nearby, gain Castle Wall DF +3%", icon: "/api/placeholder/30/30" },
      { name: "Divine Inspiration", description: "Focus value +5% to different position players", icon: "/api/placeholder/30/30" },
      { name: "Maestro's Guidance", description: "Team's Tension is below 50%, team's Shot AT +20%", icon: "/api/placeholder/30/30" },
      { name: "Perfect Pitch", description: "When opponent commits a foul, Shot Power increased by 4%", icon: "/api/placeholder/30/30" }
    ],
    tactics: [
      { name: "Flame Fortress", description: "Conjure a wall of blazing flame in front of the goal, temporarily doubling the potency of your defence.", effect: "DF +100%", icon: "/api/placeholder/40/40" },
      { name: "Sideline Spears", description: "Lightning-fast spear attacks from the sidelines", effect: "KP increase by 10%", icon: "/api/placeholder/40/40" },
      { name: "Mount Fuji", description: "Immovable mountain defense", effect: "Physical +15%", icon: "/api/placeholder/40/40" }
    ]
  },
  {
    id: 2,
    name: "Mark Evans",
    nickname: "Mark",
    title: "Legendary Keeper",
    level: 30,
    rarity: "Epic",
    position: "GK",
    element: "Earth",
    jerseyNumber: 1,
    portrait: "/api/placeholder/150/150",
    teamLogo: "/api/placeholder/40/40",
    stats: {
      kick: { main: 85, secondary: 125 },
      control: { main: 95, secondary: 140 },
      technique: { main: 110, secondary: 160 },
      intelligence: { main: 125, secondary: 180 },
      pressure: { main: 140, secondary: 200 },
      agility: { main: 115, secondary: 165 },
      physical: { main: 130, secondary: 185 }
    },
    description: "A passionate goalkeeper who never gives up. His determination inspires the entire team.",
    equipment: [
      { name: "Keeper Gloves", rarity: "Epic", category: "Boots", icon: "/api/placeholder/40/40" },
      { name: "Guardian Bangle", rarity: "Rare", category: "Bracelet", icon: "/api/placeholder/40/40" },
      { name: "Shield Pendant", rarity: "Common", category: "Pendant", icon: "/api/placeholder/40/40" },
      { name: "Captain's Armband", rarity: "Special", category: "Special", icon: "/api/placeholder/40/40" }
    ],
    teamPassives: [
      { name: "Goalkeeper's Spirit", description: "When goal is conceded, team's morale increases by 10%", icon: "/api/placeholder/30/30" },
      { name: "Last Stand", description: "Focus value +15% when team is losing", icon: "/api/placeholder/30/30" },
      { name: "Inspiring Presence", description: "Team's pressure +5% for all players", icon: "/api/placeholder/30/30" },
      { name: "Never Give Up", description: "Team recovers 20% faster from negative effects", icon: "/api/placeholder/30/30" },
      { name: "Guardian's Watch", description: "DF +25% when opponent is in critical zone", icon: "/api/placeholder/30/30" }
    ],
    tactics: [
      { name: "God Hand", description: "Divine protection blocks any shot", effect: "Block +200%", icon: "/api/placeholder/40/40" },
      { name: "Majin The Hand", description: "Demonic power crushes incoming attacks", effect: "Counter +150%", icon: "/api/placeholder/40/40" },
      { name: "Diamond Defense", description: "Unbreakable formation", effect: "Team DF +50%", icon: "/api/placeholder/40/40" }
    ]
  },
  {
    id: 3,
    name: "Axel Blaze",
    nickname: "Axel",
    title: "Flame Striker",
    level: 28,
    rarity: "Epic",
    position: "FW",
    element: "Fire",
    jerseyNumber: 10,
    portrait: "/api/placeholder/150/150",
    teamLogo: "/api/placeholder/40/40",
    stats: {
      kick: { main: 155, secondary: 220 },
      control: { main: 120, secondary: 175 },
      technique: { main: 135, secondary: 195 },
      intelligence: { main: 110, secondary: 160 },
      pressure: { main: 95, secondary: 140 },
      agility: { main: 125, secondary: 180 },
      physical: { main: 105, secondary: 150 }
    },
    description: "A striker with blazing passion. His fire burns brightest when the team needs him most.",
    equipment: [
      { name: "Flame Boots", rarity: "Epic", category: "Boots", icon: "/api/placeholder/40/40" },
      { name: "Striker's Band", rarity: "Rare", category: "Bracelet", icon: "/api/placeholder/40/40" },
      { name: "Fire Pendant", rarity: "Common", category: "Pendant", icon: "/api/placeholder/40/40" },
      { name: "Ace Number", rarity: "Special", category: "Special", icon: "/api/placeholder/40/40" }
    ],
    teamPassives: [
      { name: "Burning Spirit", description: "Shot power +20% when HP is below 50%", icon: "/api/placeholder/30/30" },
      { name: "Ace Striker", description: "Critical hit rate +15% for all shots", icon: "/api/placeholder/30/30" },
      { name: "Fire Element", description: "Fire-based moves deal +25% damage", icon: "/api/placeholder/30/30" },
      { name: "Leader's Call", description: "Team's morale +10% when scoring", icon: "/api/placeholder/30/30" },
      { name: "Blazing Path", description: "Movement speed +20% when chasing ball", icon: "/api/placeholder/30/30" }
    ],
    tactics: [
      { name: "Fire Tornado", description: "Blazing whirlwind of destruction", effect: "Shot +180%", icon: "/api/placeholder/40/40" },
      { name: "Flame Fortress", description: "Defensive wall of fire", effect: "DF +100%", icon: "/api/placeholder/40/40" },
      { name: "Heat Wave", description: "Overwhelming offensive pressure", effect: "Team AT +30%", icon: "/api/placeholder/40/40" }
    ]
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

export const mockTactics = [
  { id: 1, name: "Flame Fortress", description: "Conjure a wall of blazing flame in front of the goal", effect: "DF +100%", icon: "/api/placeholder/40/40" },
  { id: 2, name: "Sideline Spears", description: "Lightning-fast spear attacks from the sidelines", effect: "KP +10%", icon: "/api/placeholder/40/40" },
  { id: 3, name: "Mount Fuji", description: "Immovable mountain defense", effect: "Physical +15%", icon: "/api/placeholder/40/40" },
  { id: 4, name: "Waxing Moon", description: "Crescent moon slicing technique", effect: "Technique +20%", icon: "/api/placeholder/40/40" },
  { id: 5, name: "Diamond Defense", description: "Unbreakable formation", effect: "Team DF +50%", icon: "/api/placeholder/40/40" },
  { id: 6, name: "Bond Protocol", description: "Team synchronization boost", effect: "Control +25%", icon: "/api/placeholder/40/40" },
  { id: 7, name: "Bull Horns", description: "Charging attack formation", effect: "Shot +40%", icon: "/api/placeholder/40/40" },
  { id: 8, name: "Claymore", description: "Devastating single strike", effect: "Kick +60%", icon: "/api/placeholder/40/40" },
  { id: 9, name: "Three-Pronged Attack", description: "Triple threat offensive", effect: "Team AT +35%", icon: "/api/placeholder/40/40" }
];

export const mockEquipment = [
  // Boots
  { id: 1, name: "Omega Boots", rarity: "Legendary", category: "Boots", icon: "/api/placeholder/40/40", stats: { kick: 15, agility: 10 } },
  { id: 2, name: "Genesis Boots", rarity: "Epic", category: "Boots", icon: "/api/placeholder/40/40", stats: { kick: 12, agility: 8 } },
  { id: 3, name: "Flame Boots", rarity: "Rare", category: "Boots", icon: "/api/placeholder/40/40", stats: { kick: 8, agility: 6 } },
  { id: 4, name: "Basic Boots", rarity: "Common", category: "Boots", icon: "/api/placeholder/40/40", stats: { kick: 5, agility: 3 } },
  
  // Bracelets
  { id: 5, name: "Genesis Bangle", rarity: "Legendary", category: "Bracelet", icon: "/api/placeholder/40/40", stats: { control: 15, technique: 10 } },
  { id: 6, name: "Striker's Band", rarity: "Epic", category: "Bracelet", icon: "/api/placeholder/40/40", stats: { control: 12, technique: 8 } },
  { id: 7, name: "Guardian Bangle", rarity: "Rare", category: "Bracelet", icon: "/api/placeholder/40/40", stats: { control: 8, technique: 6 } },
  { id: 8, name: "Simple Band", rarity: "Common", category: "Bracelet", icon: "/api/placeholder/40/40", stats: { control: 5, technique: 3 } },
  
  // Pendants
  { id: 9, name: "Shiny Mascot", rarity: "Legendary", category: "Pendant", icon: "/api/placeholder/40/40", stats: { intelligence: 15, pressure: 10 } },
  { id: 10, name: "Fire Pendant", rarity: "Epic", category: "Pendant", icon: "/api/placeholder/40/40", stats: { intelligence: 12, pressure: 8 } },
  { id: 11, name: "Shield Pendant", rarity: "Rare", category: "Pendant", icon: "/api/placeholder/40/40", stats: { intelligence: 8, pressure: 6 } },
  { id: 12, name: "Lucky Charm", rarity: "Common", category: "Pendant", icon: "/api/placeholder/40/40", stats: { intelligence: 5, pressure: 3 } },
  
  // Special
  { id: 13, name: "Professor Layton Accessory", rarity: "Legendary", category: "Special", icon: "/api/placeholder/40/40", stats: { physical: 15, agility: 10 } },
  { id: 14, name: "Captain's Armband", rarity: "Epic", category: "Special", icon: "/api/placeholder/40/40", stats: { physical: 12, agility: 8 } },
  { id: 15, name: "Ace Number", rarity: "Rare", category: "Special", icon: "/api/placeholder/40/40", stats: { physical: 8, agility: 6 } },
  { id: 16, name: "Team Badge", rarity: "Common", category: "Special", icon: "/api/placeholder/40/40", stats: { physical: 5, agility: 3 } }
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
    level: Math.floor(Math.random() * 100) + 1,
    rarity: randomRarity,
    position: randomPosition,
    element: randomElement,
    jerseyNumber: Math.floor(Math.random() * 99) + 1,
    portrait: "/api/placeholder/150/150",
    teamLogo: "/api/placeholder/40/40",
    stats: {
      kick: { main: Math.floor(Math.random() * 100) + 50, secondary: Math.floor(Math.random() * 100) + 100 },
      control: { main: Math.floor(Math.random() * 100) + 50, secondary: Math.floor(Math.random() * 100) + 100 },
      technique: { main: Math.floor(Math.random() * 100) + 50, secondary: Math.floor(Math.random() * 100) + 100 },
      intelligence: { main: Math.floor(Math.random() * 100) + 50, secondary: Math.floor(Math.random() * 100) + 100 },
      pressure: { main: Math.floor(Math.random() * 100) + 50, secondary: Math.floor(Math.random() * 100) + 100 },
      agility: { main: Math.floor(Math.random() * 100) + 50, secondary: Math.floor(Math.random() * 100) + 100 },
      physical: { main: Math.floor(Math.random() * 100) + 50, secondary: Math.floor(Math.random() * 100) + 100 }
    },
    description: `A talented ${randomPosition} player with ${randomElement} element abilities.`,
    equipment: [
      mockEquipment[Math.floor(Math.random() * 4)],
      mockEquipment[Math.floor(Math.random() * 4) + 4],
      mockEquipment[Math.floor(Math.random() * 4) + 8],
      mockEquipment[Math.floor(Math.random() * 4) + 12]
    ],
    teamPassives: [
      { name: "Passive 1", description: "Sample passive ability", icon: "/api/placeholder/30/30" },
      { name: "Passive 2", description: "Sample passive ability", icon: "/api/placeholder/30/30" },
      { name: "Passive 3", description: "Sample passive ability", icon: "/api/placeholder/30/30" },
      { name: "Passive 4", description: "Sample passive ability", icon: "/api/placeholder/30/30" },
      { name: "Passive 5", description: "Sample passive ability", icon: "/api/placeholder/30/30" }
    ],
    tactics: [
      mockTactics[Math.floor(Math.random() * mockTactics.length)],
      mockTactics[Math.floor(Math.random() * mockTactics.length)],
      mockTactics[Math.floor(Math.random() * mockTactics.length)]
    ]
  });
}

export const getCharactersByElement = (element) => {
  return mockCharacters.filter(char => char.element === element);
};

export const getCharactersByPosition = (position) => {
  return mockCharacters.filter(char => char.position === position);
};

export const getCharactersByRarity = (rarity) => {
  return mockCharacters.filter(char => char.rarity === rarity);
};

export const searchCharacters = (query) => {
  return mockCharacters.filter(char => 
    char.name.toLowerCase().includes(query.toLowerCase()) ||
    char.nickname.toLowerCase().includes(query.toLowerCase())
  );
};