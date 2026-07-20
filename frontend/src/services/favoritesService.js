import API_BASE_URL from "../utils/api";

const authHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`
});

export const getFavorites = async (token) => {
  const response = await fetch(`${API_BASE_URL}/favorites`, {
    headers: authHeaders(token)
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Could not load favorites");
  return data;
};

export const saveFavoriteTeam = async (token, team) => {
  const response = await fetch(`${API_BASE_URL}/favorites/teams`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      teamId: team.id,
      teamName: team.shortName || team.name,
      teamLogo: team.crest
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Could not save team");
  return data;
};

export const removeFavorite = async (token, type, id) => {
  const response = await fetch(`${API_BASE_URL}/favorites/${type}/${id}`, {
    method: "DELETE",
    headers: authHeaders(token)
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Could not remove favorite");
  return data;
};

export const saveFavoritePlayer = async (token, player, teamName) => {
  const response = await fetch(`${API_BASE_URL}/favorites/players`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      playerId: player.id,
      playerName: player.name,
      playerPhoto: player.photo || null,
      teamName: teamName
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Could not save player");
  return data;
};

export const saveFavoriteMatch = async (token, match) => {
  const homeName = match.homeTeam?.name || match.homeTeam?.shortName || match.home_team_name_en;
  const awayName = match.awayTeam?.name || match.awayTeam?.shortName || match.away_team_name_en;
  const kickoffTime = match.utcDate || match.local_date;

  const response = await fetch(`${API_BASE_URL}/favorites/matches`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      matchId: match.id,
      homeTeam: homeName,
      awayTeam: awayName,
      kickoff: kickoffTime
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Could not save match");
  return data;
};
