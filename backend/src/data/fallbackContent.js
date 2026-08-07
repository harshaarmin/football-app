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

const fallbackWorldCup = {
  teams: [
    { id: 201, name_en: "Brazil", flag: "https://flagcdn.com/w320/br.png" },
    { id: 202, name_en: "Argentina", flag: "https://flagcdn.com/w320/ar.png" },
    { id: 203, name_en: "France", flag: "https://flagcdn.com/w320/fr.png" },
    { id: 204, name_en: "Japan", flag: "https://flagcdn.com/w320/jp.png" },
    { id: 205, name_en: "England", flag: "https://flagcdn.com/w320/gb-eng.png" },
    { id: 206, name_en: "Spain", flag: "https://flagcdn.com/w320/es.png" }
  ],
  groups: [
    {
      name: "Group A",
      teams: [
        { team_id: 201, mp: 3, w: 3, d: 0, l: 0, gd: 6, pts: 9, team: { name_en: "Brazil", flag: "https://flagcdn.com/w320/br.png" } },
        { team_id: 204, mp: 3, w: 2, d: 0, l: 1, gd: 2, pts: 6, team: { name_en: "Japan", flag: "https://flagcdn.com/w320/jp.png" } }
      ]
    },
    {
      name: "Group B",
      teams: [
        { team_id: 202, mp: 3, w: 2, d: 1, l: 0, gd: 4, pts: 7, team: { name_en: "Argentina", flag: "https://flagcdn.com/w320/ar.png" } },
        { team_id: 203, mp: 3, w: 1, d: 1, l: 1, gd: 1, pts: 4, team: { name_en: "France", flag: "https://flagcdn.com/w320/fr.png" } }
      ]
    },
    {
      name: "Group C",
      teams: [
        { team_id: 206, mp: 3, w: 2, d: 1, l: 0, gd: 5, pts: 7, team: { name_en: "Spain", flag: "https://flagcdn.com/w320/es.png" } },
        { team_id: 205, mp: 3, w: 2, d: 0, l: 1, gd: 3, pts: 6, team: { name_en: "England", flag: "https://flagcdn.com/w320/gb-eng.png" } }
      ]
    }
  ],
  matches: [
    {
      id: 9001,
      home_team_id: 201,
      away_team_id: 204,
      home_team_name_en: "Brazil",
      away_team_name_en: "Japan",
      home_team: { flag: "https://flagcdn.com/w320/br.png" },
      away_team: { flag: "https://flagcdn.com/w320/jp.png" },
      home_score: 3,
      away_score: 1,
      home_scorers: "{Vinicius 22', Rodrygo 61', Endrick 89'}",
      away_scorers: "{Mitoma 45'}",
      local_date: iso(-15, 16),
      venue: "New York Stadium",
      group: "A",
      finished: "TRUE"
    },
    {
      id: 9002,
      home_team_id: 202,
      away_team_id: 203,
      home_team_name_en: "Argentina",
      away_team_name_en: "France",
      home_team: { flag: "https://flagcdn.com/w320/ar.png" },
      away_team: { flag: "https://flagcdn.com/w320/fr.png" },
      home_score: 2,
      away_score: 1,
      home_scorers: "{Messi 23', Alvarez 75'}",
      away_scorers: "{Mbappe 80'}",
      local_date: iso(-14, 19),
      venue: "Dallas Stadium",
      group: "B",
      finished: "TRUE"
    },
    {
      id: 9003,
      home_team_id: 206,
      away_team_id: 205,
      home_team_name_en: "Spain",
      away_team_name_en: "England",
      home_team: { flag: "https://flagcdn.com/w320/es.png" },
      away_team: { flag: "https://flagcdn.com/w320/gb-eng.png" },
      home_score: 2,
      away_score: 2,
      home_scorers: "{Yamal 12', Morata 55'}",
      away_scorers: "{Kane 33', Bellingham 88'}",
      local_date: iso(-13, 19),
      venue: "Miami Stadium",
      group: "C",
      finished: "TRUE"
    },
    {
      id: 9004,
      home_team_id: 201,
      away_team_id: 202,
      home_team_name_en: "Brazil",
      away_team_name_en: "Argentina",
      home_team: { flag: "https://flagcdn.com/w320/br.png" },
      away_team: { flag: "https://flagcdn.com/w320/ar.png" },
      home_score: 1,
      away_score: 0,
      home_scorers: "{Vinicius 78'}",
      away_scorers: null,
      local_date: iso(-5, 20),
      venue: "Los Angeles Stadium",
      group: "Final",
      finished: "TRUE"
    }
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
  findFallbackMatch,
  findFallbackTeam,
  searchFallbackContent
};
