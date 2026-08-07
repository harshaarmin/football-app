const now = new Date("2026-08-07T12:00:00.000Z");
const iso = (days, hour = 18) => {
  const date = new Date(now);
  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCHours(hour, 0, 0, 0);
  return date.toISOString();
};

const competitionMeta = {
  PL: { name: "Premier League", area: "England", season: "2025/26" },
  CL: { name: "Champions League", area: "Europe", season: "2025/26" },
  PD: { name: "La Liga", area: "Spain", season: "2025/26" },
  BL1: { name: "Bundesliga", area: "Germany", season: "2025/26" },
  SA: { name: "Serie A", area: "Italy", season: "2025/26" },
  FL1: { name: "Ligue 1", area: "France", season: "2025/26" }
};

const competitionSeeds = {
  PL: [
    ["Arsenal", "ARS"], ["Liverpool", "LIV"], ["Manchester City", "MCI"], ["Chelsea", "CHE"],
    ["Newcastle United", "NEW"], ["Tottenham Hotspur", "TOT"]
  ],
  CL: [
    ["Real Madrid", "RMA"], ["Bayern Munich", "BAY"], ["Paris Saint-Germain", "PSG"], ["Inter", "INT"],
    ["Arsenal", "ARS"], ["Barcelona", "BAR"]
  ],
  PD: [
    ["Barcelona", "BAR"], ["Real Madrid", "RMA"], ["Atletico Madrid", "ATM"], ["Athletic Club", "ATH"],
    ["Real Betis", "BET"], ["Villarreal", "VIL"]
  ],
  BL1: [
    ["Bayern Munich", "BAY"], ["Borussia Dortmund", "BVB"], ["RB Leipzig", "RBL"], ["Bayer Leverkusen", "B04"],
    ["Eintracht Frankfurt", "SGE"], ["Stuttgart", "VFB"]
  ],
  SA: [
    ["Inter", "INT"], ["Napoli", "NAP"], ["Juventus", "JUV"], ["Milan", "MIL"],
    ["Roma", "ROM"], ["Atalanta", "ATA"]
  ],
  FL1: [
    ["Paris Saint-Germain", "PSG"], ["Marseille", "OM"], ["Monaco", "ASM"], ["Lille", "LIL"],
    ["Lyon", "OL"], ["Nice", "OGC"]
  ]
};

const crestUrl = (code) => `https://placehold.co/96x96/101828/FFFFFF?text=${code}`;
const playerId = (teamId, index) => teamId * 100 + index;

function buildCompetitionSummary(code) {
  const meta = competitionMeta[code];
  const seed = competitionSeeds[code] || competitionSeeds.PL;
  const teams = seed.map(([name, tla], index) => ({
    id: Number(`${Object.keys(competitionMeta).indexOf(code) + 1}${index + 1}`),
    name,
    shortName: name.replace("United", "Utd").replace("Hotspur", ""),
    tla,
    crest: crestUrl(tla),
    area: { name: meta.area },
    runningCompetitions: [{ code, name: meta.name }],
    venue: `${name} Arena`,
    founded: 1880 + index,
    coach: { name: `${name.split(" ")[0]} Coach` },
    address: `${meta.area} Football District`,
    website: `https://${name.toLowerCase().replace(/\s+/g, "")}.example.com`,
    squad: [
      { id: playerId(index + 1, 1), name: `${name.split(" ")[0]} Captain`, position: "Midfielder", nationality: meta.area },
      { id: playerId(index + 1, 2), name: `${name.split(" ")[0]} Forward`, position: "Forward", nationality: meta.area },
      { id: playerId(index + 1, 3), name: `${name.split(" ")[0]} Defender`, position: "Defender", nationality: meta.area }
    ]
  }));

  const table = teams.map((team, index) => ({
    position: index + 1,
    team,
    playedGames: 38,
    won: 25 - index,
    draw: 8 - Math.min(index, 4),
    lost: 5 + index,
    goalDifference: 34 - index * 4,
    points: 83 - index * 4
  }));

  const scorers = teams.slice(0, 6).map((team, index) => ({
    player: { id: playerId(team.id, 9), name: `${team.shortName} Striker` },
    team: { id: team.id, name: team.name },
    goals: 24 - index * 2
  }));

  const matches = [
    {
      id: Number(`${Object.keys(competitionMeta).indexOf(code) + 1}001`),
      competition: { code, name: meta.name, emblem: crestUrl(code) },
      homeTeam: teams[0],
      awayTeam: teams[1],
      utcDate: iso(-3, 19),
      status: "FINISHED",
      stage: "REGULAR_SEASON",
      matchday: 34,
      venue: `${teams[0].name} Arena`,
      score: { fullTime: { home: 2, away: 1 } }
    },
    {
      id: Number(`${Object.keys(competitionMeta).indexOf(code) + 1}002`),
      competition: { code, name: meta.name, emblem: crestUrl(code) },
      homeTeam: teams[2],
      awayTeam: teams[3],
      utcDate: iso(2, 17),
      status: "SCHEDULED",
      stage: "REGULAR_SEASON",
      matchday: 35,
      venue: `${teams[2].name} Arena`,
      score: { fullTime: { home: null, away: null } }
    },
    {
      id: Number(`${Object.keys(competitionMeta).indexOf(code) + 1}003`),
      competition: { code, name: meta.name, emblem: crestUrl(code) },
      homeTeam: teams[4],
      awayTeam: teams[5],
      utcDate: iso(4, 20),
      status: "SCHEDULED",
      stage: "REGULAR_SEASON",
      matchday: 35,
      venue: `${teams[4].name} Arena`,
      score: { fullTime: { home: null, away: null } }
    }
  ];

  return {
    competition: {
      code,
      name: meta.name,
      displaySeason: meta.season,
      description: `${meta.name} fallback coverage while live providers are unavailable.`,
      note: "Showing curated fallback data while live feeds reconnect."
    },
    standings: [{ table }],
    teams,
    players: scorers,
    matches,
    insights: {
      totalTeams: teams.length,
      matchesPlayed: matches.filter((m) => m.status === "FINISHED").length,
      totalGoals: 3,
      averageGoals: "3.0"
    }
  };
}

const competitionSummaries = Object.fromEntries(
  Object.keys(competitionMeta).map((code) => [code, buildCompetitionSummary(code)])
);

const fallbackCompetitions = Object.entries(competitionMeta).map(([code, meta], index) => ({
  id: index + 1,
  code,
  name: meta.name,
  type: "LEAGUE",
  emblem: crestUrl(code),
  area: { name: meta.area },
  currentSeason: { startDate: "2025-08-01", endDate: "2026-05-31" }
}));

/*
|==========================================================================
| PREMIER LEAGUE — ARCHIVED 2025/26 FINAL SEASON DATA
| Final table and Golden Boot race from the completed 2025/26 campaign.
|==========================================================================
*/

const plCrest = (tla) => `https://crests.football-data.org/${tla}.png`;

const fallbackPLTable = [
  { position: 1, team: { id: 57, name: "Arsenal", shortName: "Arsenal", tla: "ARS", crest: plCrest("ARS") }, playedGames: 38, won: 26, draw: 7, lost: 5, goalsFor: 71, goalsAgainst: 27, goalDifference: 44, points: 85 },
  { position: 2, team: { id: 65, name: "Manchester City", shortName: "Man City", tla: "MCI", crest: plCrest("MCI") }, playedGames: 38, won: 23, draw: 9, lost: 6, goalsFor: 77, goalsAgainst: 35, goalDifference: 42, points: 78 },
  { position: 3, team: { id: 66, name: "Manchester United", shortName: "Man United", tla: "MUN", crest: plCrest("MUN") }, playedGames: 38, won: 20, draw: 11, lost: 7, goalsFor: 69, goalsAgainst: 50, goalDifference: 19, points: 71 },
  { position: 4, team: { id: 58, name: "Aston Villa", shortName: "Aston Villa", tla: "AVL", crest: plCrest("AVL") }, playedGames: 38, won: 19, draw: 8, lost: 11, goalsFor: 56, goalsAgainst: 49, goalDifference: 7, points: 65 },
  { position: 5, team: { id: 64, name: "Liverpool", shortName: "Liverpool", tla: "LIV", crest: plCrest("LIV") }, playedGames: 38, won: 17, draw: 9, lost: 12, goalsFor: 63, goalsAgainst: 53, goalDifference: 10, points: 60 },
  { position: 6, team: { id: 1044, name: "AFC Bournemouth", shortName: "Bournemouth", tla: "BOU", crest: plCrest("BOU") }, playedGames: 38, won: 13, draw: 18, lost: 7, goalsFor: 58, goalsAgainst: 54, goalDifference: 4, points: 57 },
  { position: 7, team: { id: 1067, name: "Sunderland", shortName: "Sunderland", tla: "SUN", crest: plCrest("SUN") }, playedGames: 38, won: 14, draw: 12, lost: 12, goalsFor: 42, goalsAgainst: 48, goalDifference: -6, points: 54 },
  { position: 8, team: { id: 397, name: "Brighton & Hove Albion", shortName: "Brighton", tla: "BHA", crest: plCrest("BHA") }, playedGames: 38, won: 14, draw: 11, lost: 13, goalsFor: 52, goalsAgainst: 46, goalDifference: 6, points: 53 },
  { position: 9, team: { id: 402, name: "Brentford", shortName: "Brentford", tla: "BRE", crest: plCrest("BRE") }, playedGames: 38, won: 14, draw: 11, lost: 13, goalsFor: 55, goalsAgainst: 52, goalDifference: 3, points: 53 },
  { position: 10, team: { id: 61, name: "Chelsea", shortName: "Chelsea", tla: "CHE", crest: plCrest("CHE") }, playedGames: 38, won: 14, draw: 10, lost: 14, goalsFor: 58, goalsAgainst: 52, goalDifference: 6, points: 52 },
  { position: 11, team: { id: 63, name: "Fulham", shortName: "Fulham", tla: "FUL", crest: plCrest("FUL") }, playedGames: 38, won: 15, draw: 7, lost: 16, goalsFor: 47, goalsAgainst: 51, goalDifference: -4, points: 52 },
  { position: 12, team: { id: 67, name: "Newcastle United", shortName: "Newcastle", tla: "NEW", crest: plCrest("NEW") }, playedGames: 38, won: 14, draw: 7, lost: 17, goalsFor: 53, goalsAgainst: 55, goalDifference: -2, points: 49 },
  { position: 13, team: { id: 62, name: "Everton", shortName: "Everton", tla: "EVE", crest: plCrest("EVE") }, playedGames: 38, won: 13, draw: 10, lost: 15, goalsFor: 47, goalsAgainst: 50, goalDifference: -3, points: 49 },
  { position: 14, team: { id: 341, name: "Leeds United", shortName: "Leeds", tla: "LEE", crest: plCrest("LEE") }, playedGames: 38, won: 11, draw: 14, lost: 13, goalsFor: 49, goalsAgainst: 56, goalDifference: -7, points: 47 },
  { position: 15, team: { id: 354, name: "Crystal Palace", shortName: "Crystal Palace", tla: "CRY", crest: plCrest("CRY") }, playedGames: 38, won: 11, draw: 12, lost: 15, goalsFor: 41, goalsAgainst: 51, goalDifference: -10, points: 45 },
  { position: 16, team: { id: 351, name: "Nottingham Forest", shortName: "Nottm Forest", tla: "NFO", crest: plCrest("NFO") }, playedGames: 38, won: 11, draw: 11, lost: 16, goalsFor: 48, goalsAgainst: 51, goalDifference: -3, points: 44 },
  { position: 17, team: { id: 73, name: "Tottenham Hotspur", shortName: "Spurs", tla: "TOT", crest: plCrest("TOT") }, playedGames: 38, won: 10, draw: 11, lost: 17, goalsFor: 48, goalsAgainst: 57, goalDifference: -9, points: 41 },
  { position: 18, team: { id: 563, name: "West Ham United", shortName: "West Ham", tla: "WHU", crest: plCrest("WHU") }, playedGames: 38, won: 10, draw: 9, lost: 19, goalsFor: 46, goalsAgainst: 65, goalDifference: -19, points: 39 },
  { position: 19, team: { id: 1132, name: "Burnley", shortName: "Burnley", tla: "BUR", crest: plCrest("BUR") }, playedGames: 38, won: 4, draw: 10, lost: 24, goalsFor: 38, goalsAgainst: 75, goalDifference: -37, points: 22 },
  { position: 20, team: { id: 76, name: "Wolverhampton Wanderers", shortName: "Wolves", tla: "WOL", crest: plCrest("WOL") }, playedGames: 38, won: 3, draw: 11, lost: 24, goalsFor: 27, goalsAgainst: 68, goalDifference: -41, points: 20 }
];

const fallbackPLScorers = [
  { player: { id: 8194, name: "Erling Haaland" }, team: { id: 65, name: "Manchester City" }, goals: 27 },
  { player: { id: 42966, name: "Igor Thiago" }, team: { id: 402, name: "Brentford" }, goals: 22 },
  { player: { id: 8450, name: "Antoine Semenyo" }, team: { id: 65, name: "Manchester City" }, goals: 17 },
  { player: { id: 3797, name: "Ollie Watkins" }, team: { id: 58, name: "Aston Villa" }, goals: 16 },
  { player: { id: 3094, name: "Joao Pedro" }, team: { id: 61, name: "Chelsea" }, goals: 15 },
  { player: { id: 4241, name: "Morgan Gibbs-White" }, team: { id: 351, name: "Nottingham Forest" }, goals: 15 },
  { player: { id: 11771, name: "Dominic Calvert-Lewin" }, team: { id: 341, name: "Leeds United" }, goals: 14 }
];

const fallbackPLHome = {
  competition: {
    code: "PL",
    name: "Premier League",
    emblem: plCrest("ARS"),
    currentSeason: { startDate: "2025-08-01", endDate: "2026-05-24" },
    displaySeason: "2025/26",
    dataMode: "fallback",
    note: "Live Premier League data is temporarily unavailable. Showing the archived 2025/26 final season."
  },
  standings: [{ table: fallbackPLTable }],
  players: fallbackPLScorers,
  clubs: fallbackPLTable.map((row) => row.team),
  matches: []
};

/*
|==========================================================================
| FIFA WORLD CUP 2026 — ARCHIVED COMPLETE RESULTS
| 48 teams, 12 groups, 104 matches. Tournament completed on 19 July 2026
| with Spain beating Argentina 1-0 (a.e.t.) in the final at MetLife Stadium.
|==========================================================================
*/

const flag = (code) => `https://flagcdn.com/w320/${code}.png`;

// id, code, name
const wcTeamRows = [
  [1, "mx", "Mexico"], [2, "za", "South Africa"], [3, "kr", "South Korea"], [4, "cz", "Czechia"],
  [5, "ch", "Switzerland"], [6, "ca", "Canada"], [7, "ba", "Bosnia and Herzegovina"], [8, "qa", "Qatar"],
  [9, "br", "Brazil"], [10, "ma", "Morocco"], [11, "gb-sct", "Scotland"], [12, "ht", "Haiti"],
  [13, "us", "United States"], [14, "au", "Australia"], [15, "py", "Paraguay"], [16, "tr", "Turkiye"],
  [17, "de", "Germany"], [18, "ci", "Ivory Coast"], [19, "ec", "Ecuador"], [20, "cw", "Curacao"],
  [21, "nl", "Netherlands"], [22, "jp", "Japan"], [23, "se", "Sweden"], [24, "tn", "Tunisia"],
  [25, "be", "Belgium"], [26, "eg", "Egypt"], [27, "ir", "Iran"], [28, "nz", "New Zealand"],
  [29, "es", "Spain"], [30, "cv", "Cape Verde"], [31, "uy", "Uruguay"], [32, "sa", "Saudi Arabia"],
  [33, "fr", "France"], [34, "no", "Norway"], [35, "sn", "Senegal"], [36, "iq", "Iraq"],
  [37, "ar", "Argentina"], [38, "at", "Austria"], [39, "dz", "Algeria"], [40, "jo", "Jordan"],
  [41, "co", "Colombia"], [42, "pt", "Portugal"], [43, "cd", "DR Congo"], [44, "uz", "Uzbekistan"],
  [45, "gb-eng", "England"], [46, "hr", "Croatia"], [47, "gh", "Ghana"], [48, "pa", "Panama"]
];

const wcTeams = wcTeamRows.map(([id, code, name]) => ({ id, name_en: name, flag: flag(code) }));
const wcTeamMap = Object.fromEntries(wcTeams.map((t) => [t.id, t]));

// Final group standings: [teamId, mp, w, d, l, gd, pts]
const wcGroupRows = {
  A: [[1, 3, 3, 0, 0, 6, 9], [2, 3, 1, 1, 1, -1, 4], [3, 3, 1, 0, 2, -1, 3], [4, 3, 0, 1, 2, -4, 1]],
  B: [[5, 3, 2, 1, 0, 4, 7], [6, 3, 1, 1, 1, 5, 4], [7, 3, 1, 1, 1, -1, 4], [8, 3, 0, 1, 2, -8, 1]],
  C: [[9, 3, 2, 1, 0, 6, 7], [10, 3, 2, 1, 0, 3, 7], [11, 3, 1, 0, 2, -3, 3], [12, 3, 0, 0, 3, -6, 0]],
  D: [[13, 3, 2, 0, 1, 4, 6], [14, 3, 1, 1, 1, 0, 4], [15, 3, 1, 1, 1, -2, 4], [16, 3, 1, 0, 2, -2, 3]],
  E: [[17, 3, 2, 0, 1, 6, 6], [18, 3, 2, 0, 1, 2, 6], [19, 3, 1, 1, 1, 0, 4], [20, 3, 0, 1, 2, -8, 1]],
  F: [[21, 3, 2, 1, 0, 6, 7], [22, 3, 1, 2, 0, 4, 5], [23, 3, 1, 1, 1, 0, 4], [24, 3, 0, 0, 3, -10, 0]],
  G: [[25, 3, 1, 2, 0, 4, 5], [26, 3, 1, 2, 0, 2, 5], [27, 3, 0, 3, 0, 0, 3], [28, 3, 0, 1, 2, -6, 1]],
  H: [[29, 3, 2, 1, 0, 5, 7], [30, 3, 0, 3, 0, 0, 3], [31, 3, 0, 2, 1, -1, 2], [32, 3, 0, 2, 1, -4, 2]],
  I: [[33, 3, 3, 0, 0, 8, 9], [34, 3, 2, 0, 1, 1, 6], [35, 3, 1, 0, 2, 2, 3], [36, 3, 0, 0, 3, -11, 0]],
  J: [[37, 3, 3, 0, 0, 7, 9], [38, 3, 1, 1, 1, 0, 4], [39, 3, 1, 1, 1, -2, 4], [40, 3, 0, 0, 3, -5, 0]],
  K: [[41, 3, 2, 1, 0, 3, 7], [42, 3, 1, 2, 0, 5, 5], [43, 3, 1, 1, 1, 1, 4], [44, 3, 0, 0, 3, -8, 0]],
  L: [[45, 3, 2, 1, 0, 4, 7], [46, 3, 2, 0, 1, 0, 6], [47, 3, 1, 1, 1, 0, 4], [48, 3, 0, 0, 3, -4, 0]]
};

// [id, date, time, homeId, awayId, homeScore, awayScore, group, venue, homeScorers, awayScorers]
const wcMatchRows = [
  // ---------------- GROUP STAGE ----------------
  // Group A
  [9001, "06/11/2026", "21:00", 1, 2, 2, 0, "A", "Mexico City Stadium", "{Quinones 12', Reyes 88'}", null],
  [9002, "06/11/2026", "15:00", 3, 4, 2, 1, "A", "New York New Jersey Stadium", "{Lee Kang-in 34', Son Heung-min 71'}", "{Kuchta 60'}"],
  [9003, "06/18/2026", "15:00", 4, 2, 1, 1, "A", "Boston Stadium", "{Soucek 22'}", "{Mokoena 78'}"],
  [9004, "06/18/2026", "18:00", 1, 3, 1, 0, "A", "Mexico City Stadium", "{Quinones 64'}", null],
  [9005, "06/24/2026", "18:00", 1, 4, 3, 0, "A", "Mexico City Stadium", "{Quinones 9', Reyes 55', Vega 82'}", null],
  [9006, "06/24/2026", "21:00", 2, 3, 1, 0, "A", "Los Angeles Stadium", "{Aubas 90'}", null],
  // Group B
  [9007, "06/12/2026", "15:00", 6, 7, 1, 1, "B", "Toronto Stadium", "{David 30'}", "{Dzeko 67'}"],
  [9008, "06/13/2026", "18:00", 8, 5, 1, 1, "B", "Dallas Stadium", "{Afif 44'}", "{Embolo 81'}"],
  [9009, "06/18/2026", "21:00", 5, 7, 4, 1, "B", "Seattle Stadium", "{Vargas 12', Embolo 39', Shaqiri 70', Amdouni 84'}", "{Dzeko 52'}"],
  [9010, "06/18/2026", "18:00", 6, 8, 6, 0, "B", "Vancouver Stadium", "{Buchanan 12', David 21', Larin 45', Eustachio 33', Davies 56', Buchanan 71'}", null],
  [9011, "06/24/2026", "15:00", 5, 6, 2, 1, "B", "Boston Stadium", "{Embolo 19', Ndoye 74'}", "{David 55'}"],
  [9012, "06/24/2026", "21:00", 7, 8, 3, 1, "B", "Kansas City Stadium", "{Dzeko 8', Visca 34', Hajradinovic 77'}", "{Almoez 90'}"],
  // Group C
  [9013, "06/13/2026", "18:00", 9, 10, 1, 1, "C", "Houston Stadium", "{Vinicius Junior 45'}", "{En-Nesyri 62'}"],
  [9014, "06/13/2026", "15:00", 11, 12, 1, 0, "C", "San Francisco Bay Area Stadium", "{Adams 76'}", null],
  [9015, "06/19/2026", "18:00", 10, 11, 1, 0, "C", "Estadio Monterrey", "{Brahim 68'}", null],
  [9016, "06/19/2026", "21:00", 9, 12, 3, 0, "C", "Houston Stadium", "{Vinicius Junior 23', Vinicius Junior 55', Rodrygo 79'}", null],
  [9017, "06/24/2026", "18:00", 10, 12, 4, 2, "C", "Estadio Monterrey", "{En-Nesyri 17', Amallah 40', Ziyech 61', Harit 88'}", "{Cantor 30', Fils-Aime 72'}"],
  [9018, "06/24/2026", "21:00", 9, 11, 3, 0, "C", "Houston Stadium", "{Rodrygo 50', Cunha 71', Endrick 85'}", null],
  // Group D
  [9019, "06/12/2026", "21:00", 13, 15, 4, 1, "D", "Los Angeles Stadium", "{Pulisic 9', Weah 27', Balogun 55', Weah 85'}", "{Sanabria 40'}"],
  [9020, "06/13/2026", "15:00", 14, 16, 2, 0, "D", "Atlanta Stadium", "{Irvine 32', Duke 80'}", null],
  [9021, "06/19/2026", "18:00", 13, 14, 2, 0, "D", "Seattle Stadium", "{Pulisic 24', Balogun 68'}", null],
  [9022, "06/19/2026", "15:00", 16, 15, 0, 1, "D", "Mexico City Stadium", null, "{Almiron 62'}"],
  [9023, "06/25/2026", "18:00", 16, 13, 3, 2, "D", "Mexico City Stadium", "{Akturkoglu 30', Yildiz 54', Kahveci 90'}", "{Pulisic 41', Balogun 75'}"],
  [9024, "06/25/2026", "21:00", 15, 14, 0, 0, "D", "Kansas City Stadium", null, null],
  // Group E
  [9025, "06/14/2026", "15:00", 17, 20, 7, 1, "E", "Philadelphia Stadium", "{Musiala 11', Wirtz 24', Havertz 33', Musiala 45', Havertz 58', Goretzka 74', Wirtz 90'}", "{Bacuna 66'}"],
  [9026, "06/14/2026", "18:00", 18, 19, 1, 0, "E", "Dallas Stadium", "{Haller 44'}", null],
  [9027, "06/20/2026", "18:00", 17, 18, 2, 1, "E", "Philadelphia Stadium", "{Wirtz 28', Musiala 69'}", "{Haller 52'}"],
  [9028, "06/20/2026", "21:00", 19, 20, 0, 0, "E", "Miami Stadium", null, null],
  [9029, "06/25/2026", "21:00", 18, 20, 2, 0, "E", "Dallas Stadium", "{Haller 39', Kessie 71'}", null],
  [9030, "06/25/2026", "15:00", 19, 17, 2, 1, "E", "Atlanta Stadium", "{Plata 25', Valencia 82'}", "{Gnabry 61'}"],
  // Group F
  [9031, "06/14/2026", "18:00", 21, 22, 2, 2, "F", "New York New Jersey Stadium", "{Depay 31', Gakpo 66'}", "{Kubo 12', Mitoma 77'}"],
  [9032, "06/14/2026", "21:00", 23, 24, 5, 1, "F", "Boston Stadium", "{Gyokeres 7', Isak 38', Kulusevski 54', Berg 81', Nanasi 90'}", "{Sassi 45'}"],
  [9033, "06/20/2026", "15:00", 21, 23, 5, 1, "F", "Houston Stadium", "{Depay 18', Simons 34', Simons 52', Brobbey 66', Brobbey 81'}", "{Isak 74'}"],
  [9034, "06/20/2026", "18:00", 24, 22, 0, 4, "F", "Miami Stadium", null, "{Kubo 10', Mitoma 44', Ueda 63', Doan 77'}"],
  [9035, "06/25/2026", "15:00", 22, 23, 1, 1, "F", "San Francisco Bay Area Stadium", "{Mitoma 38'}", "{Isak 90'}"],
  [9036, "06/25/2026", "21:00", 21, 24, 3, 1, "F", "Seattle Stadium", "{Gakpo 29', Depay 55', Simons 87'}", "{Ltaief 12'}"],
  // Group G
  [9037, "06/13/2026", "18:00", 25, 26, 0, 0, "G", "Philadelphia Stadium", null, null],
  [9038, "06/13/2026", "21:00", 27, 28, 1, 1, "G", "Kansas City Stadium", "{Taremi 41'}", "{Wood 66'}"],
  [9039, "06/19/2026", "15:00", 25, 27, 0, 0, "G", "Estadio Monterrey", null, null],
  [9040, "06/19/2026", "18:00", 26, 28, 3, 1, "G", "Miami Stadium", "{Salah 28', Marmoush 50', Trezeguet 77'}", "{Wood 62'}"],
  [9041, "06/25/2026", "21:00", 25, 28, 6, 2, "G", "Boston Stadium", "{Lukaku 15', De Bruyne 31', Openda 44', Trossard 55', Doku 68', Fofana 84'}", "{Wood 23', Rojas 90'}"],
  [9042, "06/25/2026", "15:00", 26, 27, 2, 2, "G", "Toronto Stadium", "{Salah 39', Marmoush 71'}", "{Taremi 55', Azmoun 80'}"],
  // Group H
  [9043, "06/13/2026", "15:00", 29, 30, 0, 0, "H", "Los Angeles Stadium", null, null],
  [9044, "06/13/2026", "18:00", 31, 32, 1, 1, "H", "Houston Stadium", "{Nunez 45'}", "{Al-Dawsari 62'}"],
  [9045, "06/19/2026", "18:00", 29, 31, 1, 0, "H", "Seattle Stadium", "{Yamal 56'}", null],
  [9046, "06/19/2026", "21:00", 30, 32, 0, 0, "H", "Vancouver Stadium", null, null],
  [9047, "06/26/2026", "18:00", 29, 32, 4, 0, "H", "Mexico City Stadium", "{Oyarzabal 21', Nico Williams 44', Pedri 66', Morata 82'}", null],
  [9048, "06/26/2026", "15:00", 30, 31, 2, 2, "H", "Miami Stadium", "{Mendes 33', Andrade 79'}", "{Nunez 27', De Arrascaeta 68'}"],
  // Group I
  [9049, "06/14/2026", "15:00", 33, 35, 3, 1, "I", "New York New Jersey Stadium", "{Mbappe 18', Mbappe 44', Dembele 71'}", "{Sarr 61'}"],
  [9050, "06/14/2026", "18:00", 34, 36, 4, 1, "I", "Dallas Stadium", "{Haaland 12', Odegaard 39', Sorloth 61', Berg 84'}", "{Aymen 90'}"],
  [9051, "06/20/2026", "18:00", 33, 36, 3, 0, "I", "Boston Stadium", "{Mbappe 25', Mbappe 57', Dembele 80'}", null],
  [9052, "06/20/2026", "15:00", 35, 34, 2, 3, "I", "Miami Stadium", "{Sarr 22', Diallo 68'}", "{Haaland 30', Odegaard 63', Haaland 76'}"],
  [9053, "06/25/2026", "21:00", 33, 34, 4, 1, "I", "Philadelphia Stadium", "{Dembele 12', Griezmann 34', Digne 60', Thuram 77'}", "{Haaland 55'}"],
  [9054, "06/25/2026", "15:00", 36, 35, 0, 5, "I", "Kansas City Stadium", null, "{Sarr 24', Diallo 40', El-Hadj 52', Sarr 71', Mane 89'}"],
  // Group J
  [9055, "06/14/2026", "18:00", 37, 38, 1, 0, "J", "Mexico City Stadium", "{Messi 63'}", null],
  [9056, "06/14/2026", "15:00", 39, 40, 2, 0, "J", "Atlanta Stadium", "{Mahrez 33', Gouiri 77'}", null],
  [9057, "06/20/2026", "18:00", 37, 39, 4, 0, "J", "Houston Stadium", "{Messi 17', Di Maria 38', Messi 58', Lautaro 76'}", null],
  [9058, "06/20/2026", "21:00", 38, 40, 3, 2, "J", "Toronto Stadium", "{Arnautovic 14', Sabitzer 48', Arnautovic 70'}", "{Al-Tamari 29', Al-Naimat 88'}"],
  [9059, "06/26/2026", "15:00", 37, 40, 3, 1, "J", "Miami Stadium", "{Alvarez 27', Lautaro 54', Alvarez 81'}", "{Al-Tamari 90'}"],
  [9060, "06/26/2026", "18:00", 38, 39, 3, 3, "J", "Philadelphia Stadium", "{Arnautovic 11', Baumgartner 45', Sabitzer 79'}", "{Mahrez 23', Gouiri 51', Bounedjah 90'}"],
  // Group K
  [9061, "06/15/2026", "15:00", 41, 42, 0, 0, "K", "Seattle Stadium", null, null],
  [9062, "06/15/2026", "18:00", 44, 43, 1, 3, "K", "Vancouver Stadium", "{Fayzullaev 40'}", "{Mbemba 25', Bakambu 58', Mayele 75'}"],
  [9063, "06/21/2026", "18:00", 41, 43, 1, 0, "K", "Los Angeles Stadium", "{Luis Diaz 66'}", null],
  [9064, "06/21/2026", "21:00", 42, 44, 5, 0, "K", "Estadio Monterrey", "{Ronaldo 12', Jota 33', Leao 52', Ronaldo 60', Felix 87'}", null],
  [9065, "06/26/2026", "21:00", 41, 44, 3, 1, "K", "Miami Stadium", "{Luis Diaz 31', James Rodriguez 58', Borre 89'}", "{Shomurodov 77'}"],
  [9066, "06/26/2026", "15:00", 42, 43, 1, 1, "K", "Toronto Stadium", "{Fernandes 48'}", "{Bakambu 63'}"],
  // Group L
  [9067, "06/17/2026", "18:00", 45, 46, 4, 2, "L", "New York New Jersey Stadium", "{Kane 22', Saka 40', Foden 58', Rashford 77'}", "{Kramaric 33', Modric 71'}"],
  [9068, "06/17/2026", "15:00", 47, 48, 1, 0, "L", "Houston Stadium", "{Kudus 51'}", null],
  [9069, "06/23/2026", "18:00", 45, 47, 0, 0, "L", "Boston Stadium", null, null],
  [9070, "06/23/2026", "21:00", 46, 48, 1, 0, "L", "Seattle Stadium", "{Kramaric 68'}", null],
  [9071, "06/27/2026", "15:00", 45, 48, 2, 0, "L", "Philadelphia Stadium", "{Bellingham 31', Rashford 74'}", null],
  [9072, "06/27/2026", "18:00", 46, 47, 2, 1, "L", "Atlanta Stadium", "{Kramaric 29', Budimir 85'}", "{Kudus 57'}"],
  // ---------------- ROUND OF 32 ----------------
  [9073, "06/28/2026", "15:00", 2, 6, 0, 1, "R32", "Los Angeles Stadium", null, "{Larin 72'}"],
  [9074, "06/29/2026", "15:00", 17, 15, 1, 1, "R32", "Boston Stadium", "{Havertz 48'}", "{Sanabria 77'}"],
  [9075, "06/29/2026", "18:00", 21, 10, 1, 1, "R32", "Estadio Monterrey", "{Gakpo 38'}", "{Hakimi 63'}"],
  [9076, "06/29/2026", "21:00", 9, 22, 2, 1, "R32", "Houston Stadium", "{Rodrygo 41', Endrick 74'}", "{Kubo 66'}"],
  [9077, "06/30/2026", "15:00", 33, 23, 3, 0, "R32", "New York New Jersey Stadium", "{Mbappe 21', Mbappe 58', Dembele 76'}", null],
  [9078, "06/30/2026", "18:00", 18, 34, 1, 2, "R32", "Dallas Stadium", "{Kessie 64'}", "{Haaland 27', Berg 81'}"],
  [9079, "06/30/2026", "21:00", 1, 19, 2, 0, "R32", "Mexico City Stadium", "{Gimenez 44', Vega 71'}", null],
  [9080, "07/01/2026", "15:00", 45, 43, 2, 1, "R32", "Atlanta Stadium", "{Bellingham 33', Kane 62'}", "{Mbemba 79'}"],
  [9081, "07/01/2026", "18:00", 13, 7, 2, 0, "R32", "San Francisco Bay Area Stadium", "{Weah 24', Tessmann 66'}", null],
  [9082, "07/01/2026", "21:00", 25, 35, 3, 2, "R32", "Seattle Stadium", "{Lukaku 29', De Bruyne 61', Openda 98'}", "{Diallo 44', Mane 88'}"],
  [9083, "07/02/2026", "15:00", 42, 46, 2, 1, "R32", "Toronto Stadium", "{Fernandes 51', Ronaldo 78'}", "{Majer 90'}"],
  [9084, "07/02/2026", "18:00", 29, 38, 3, 0, "R32", "Los Angeles Stadium", "{Oyarzabal 19', Yamal 55', Morata 81'}", null],
  [9085, "07/02/2026", "21:00", 5, 39, 2, 0, "R32", "Vancouver Stadium", "{Vargas 31', Amdouni 66'}", null],
  [9086, "07/03/2026", "15:00", 37, 30, 3, 2, "R32", "Miami Stadium", "{Messi 22', Di Maria 92', Alvarez 115'}", "{Mendes 40', Andrade 102'}"],
  [9087, "07/03/2026", "18:00", 41, 47, 1, 0, "R32", "Kansas City Stadium", "{Luis Diaz 57'}", null],
  [9088, "07/03/2026", "21:00", 26, 14, 1, 1, "R32", "Dallas Stadium", "{Marmoush 44'}", "{Duke 81'}"],
  // ---------------- ROUND OF 16 ----------------
  [9089, "07/04/2026", "15:00", 33, 15, 1, 0, "R16", "Philadelphia Stadium", "{Mbappe 70'}", null],
  [9090, "07/04/2026", "18:00", 10, 6, 3, 0, "R16", "Houston Stadium", "{En-Nesyri 12', Hakimi 47', Ziyech 84'}", null],
  [9091, "07/05/2026", "15:00", 34, 9, 2, 1, "R16", "New York New Jersey Stadium", "{Haaland 39', Odegaard 77'}", "{Vinicius Junior 63'}"],
  [9092, "07/05/2026", "18:00", 1, 45, 2, 3, "R16", "Mexico City Stadium", "{Quinones 8', Reyes 40'}", "{Bellingham 23', Kane 52', Saka 81'}"],
  [9093, "07/06/2026", "15:00", 29, 42, 1, 0, "R16", "Dallas Stadium", "{Morata 66'}", null],
  [9094, "07/06/2026", "18:00", 25, 13, 4, 1, "R16", "Seattle Stadium", "{Lukaku 19', De Bruyne 45', Doku 63', Openda 88'}", "{Musah 30'}"],
  [9095, "07/07/2026", "15:00", 37, 26, 3, 2, "R16", "Atlanta Stadium", "{Messi 33', Messi 71', Mac Allister 87'}", "{Salah 25', Trezeguet 90'}"],
  [9096, "07/07/2026", "18:00", 5, 41, 0, 0, "R16", "Vancouver Stadium", null, null],
  // ---------------- QUARTER-FINALS ----------------
  [9097, "07/09/2026", "15:00", 10, 33, 0, 2, "QF", "Boston Stadium", null, "{Mbappe 48', Dembele 77'}"],
  [9098, "07/10/2026", "18:00", 29, 25, 2, 1, "QF", "Los Angeles Stadium", "{Oyarzabal 36', Yamal 58'}", "{De Ketelaere 74'}"],
  [9099, "07/11/2026", "15:00", 34, 45, 1, 2, "QF", "Miami Stadium", "{Haaland 41'}", "{Bellingham 55', Kane 102'}"],
  [9100, "07/11/2026", "18:00", 37, 5, 3, 1, "QF", "Kansas City Stadium", "{Messi 66', Lautaro 98', Di Maria 109'}", "{Vargas 115'}"],
  // ---------------- SEMI-FINALS ----------------
  [9101, "07/14/2026", "15:00", 29, 33, 2, 0, "SF", "Dallas Stadium", "{Oyarzabal 34', Oyarzabal 71'}", null],
  [9102, "07/15/2026", "15:00", 37, 45, 2, 1, "SF", "Atlanta Stadium", "{Messi 49', Mac Allister 83'}", "{Bellingham 62'}"],
  // ---------------- THIRD PLACE ----------------
  [9103, "07/18/2026", "15:00", 33, 45, 4, 6, "3rd Place", "Miami Stadium", "{Mbappe 52', Dembele 61', Mbappe 84', Thuram 90'}", "{Kane 19', Bellingham 28', Bellingham 36', Saka 42', Foden 58', Kane 75'}"],
  // ---------------- FINAL ----------------
  [9104, "07/19/2026", "15:00", 29, 37, 1, 0, "Final", "New York New Jersey Stadium", "{Torres 106'}", null]
];

const wcMatch = (row) => {
  const [id, date, time, homeId, awayId, homeScore, awayScore, group, venue, homeScorers, awayScorers] = row;
  return {
    id,
    local_date: `${date} ${time}`,
    home_team_id: homeId,
    away_team_id: awayId,
    home_team_name_en: wcTeamMap[homeId].name_en,
    away_team_name_en: wcTeamMap[awayId].name_en,
    home_team: { flag: wcTeamMap[homeId].flag },
    away_team: { flag: wcTeamMap[awayId].flag },
    home_score: homeScore,
    away_score: awayScore,
    home_scorers: homeScorers ? `{${homeScorers.replace(/^\{|\}$/g, "")}}` : null,
    away_scorers: awayScorers ? `{${awayScorers.replace(/^\{|\}$/g, "")}}` : null,
    venue,
    group,
    finished: "TRUE"
  };
};

const fallbackWorldCup = {
  teams: wcTeams,
  groups: Object.entries(wcGroupRows).map(([letter, rows]) => ({
    name: letter,
    teams: rows
      .map(([teamId, mp, w, d, l, gd, pts]) => ({
        team_id: teamId,
        mp, w, d, l, gd, pts,
        team: { name_en: wcTeamMap[teamId].name_en, flag: wcTeamMap[teamId].flag }
      }))
      .sort((a, b) => Number(b.pts) - Number(a.pts) || Number(b.gd) - Number(a.gd))
  })),
  matches: wcMatchRows.map(wcMatch),
  scorers: [
    { player: "Kylian Mbappe", team: "France", flag: flag("fr"), goals: 10, assists: 4 },
    { player: "Lionel Messi", team: "Argentina", flag: flag("ar"), goals: 8, assists: 4 },
    { player: "Jude Bellingham", team: "England", flag: flag("gb-eng"), goals: 7, assists: 1 },
    { player: "Erling Haaland", team: "Norway", flag: flag("no"), goals: 7, assists: 0 },
    { player: "Ousmane Dembele", team: "France", flag: flag("fr"), goals: 6, assists: 2 },
    { player: "Harry Kane", team: "England", flag: flag("gb-eng"), goals: 6, assists: 1 },
    { player: "Mikel Oyarzabal", team: "Spain", flag: flag("es"), goals: 5, assists: 1 },
    { player: "Ismaila Sarr", team: "Senegal", flag: flag("sn"), goals: 4, assists: 1 },
    { player: "Julian Quinones", team: "Mexico", flag: flag("mx"), goals: 4, assists: 1 },
    { player: "Vinicius Junior", team: "Brazil", flag: flag("br"), goals: 4, assists: 1 }
  ]
};

function findFallbackTeam(id) {
  const numericId = Number(id);
  for (const summary of Object.values(competitionSummaries)) {
    const team = summary.teams.find((entry) => entry.id === numericId);
    if (team) {
      return {
        team,
        matches: summary.matches.filter(
          (match) => match.homeTeam.id === numericId || match.awayTeam.id === numericId
        ),
        leagueStanding: summary.standings[0].table.find((row) => row.team.id === numericId) || null
      };
    }
  }
  return null;
}

function findFallbackMatch(id) {
  const numericId = Number(id);
  for (const summary of Object.values(competitionSummaries)) {
    const match = summary.matches.find((entry) => entry.id === numericId);
    if (match) {
      return {
        id: match.id,
        utcDate: match.utcDate,
        status: match.status,
        stage: match.stage,
        matchday: match.matchday,
        venue: match.venue,
        attendance: 55000,
        referees: [],
        competition: match.competition,
        season: { startDate: "2025-08-01", endDate: "2026-05-31" },
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        score: match.score,
        odds: {},
        lastUpdated: iso(0)
      };
    }
  }
  return null;
}

function searchFallbackContent(query) {
  const q = String(query || "").toLowerCase();
  const competitions = fallbackCompetitions.filter((entry) =>
    entry.name.toLowerCase().includes(q) || entry.area.name.toLowerCase().includes(q)
  );

  const teams = Object.values(competitionSummaries)
    .flatMap((summary) => summary.teams.map((team) => ({ ...team, league: summary.competition.code })))
    .filter((team) => team.name.toLowerCase().includes(q))
    .slice(0, 8)
    .map((team) => ({
      id: team.id,
      name: team.name,
      crest: team.crest,
      league: team.league
    }));

  const players = Object.values(competitionSummaries)
    .flatMap((summary) => summary.players)
    .filter((entry) => entry.player.name.toLowerCase().includes(q) || entry.team.name.toLowerCase().includes(q))
    .slice(0, 8)
    .map((entry) => ({
      id: entry.player.id,
      name: entry.player.name,
      team: entry.team.name,
      goals: entry.goals
    }));

  const wcTeamsHit = fallbackWorldCup.teams
    .filter((team) => team.name_en.toLowerCase().includes(q))
    .slice(0, 8)
    .map((team) => ({
      id: team.id,
      name: team.name_en,
      crest: team.flag,
      league: "World Cup"
    }));

  teams.push(...wcTeamsHit);
  teams.sort((a, b) => b.name.length - a.name.length);

  const news = [
    {
      title: "Fallback football briefing",
      link: "#",
      contentSnippet: "Live providers are temporarily unavailable, so curated portfolio data is being shown."
    }
  ].filter((article) => article.title.toLowerCase().includes(q) || article.contentSnippet.toLowerCase().includes(q));

  return { competitions, teams, players, news };
}

module.exports = {
  competitionSummaries,
  fallbackCompetitions,
  fallbackWorldCup,
  fallbackPLTable,
  fallbackPLScorers,
  fallbackPLHome,
  findFallbackMatch,
  findFallbackTeam,
  searchFallbackContent
};
