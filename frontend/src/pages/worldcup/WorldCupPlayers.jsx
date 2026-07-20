import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import API_BASE_URL from '../../utils/api'

const parseScorerNames = (str) => {
    if (!str || str === 'null') return []
    return str.replace(/[{}"]/g, '').split(',').map(s => {
        const raw = s.trim()
        const name = raw.replace(/\s\d+['+]?.*/, '').trim()
        return name || raw
    }).filter(Boolean)
}

export default function WorldCupPlayers() {
    const [matches, setMatches] = useState([])
    const [selectedTeam, setSelectedTeam] = useState('all')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get(`${API_BASE_URL}/worldcup/home`)
            .then(res => {
                setMatches(res.data.matches || [])
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    const playerData = useMemo(() => {
        const map = {}
        const teamStats = {}

        matches.forEach(match => {
            const addTeam = (name, flag) => {
                if (!name) return
                if (!teamStats[name]) teamStats[name] = { name, flag, goals: 0, players: 0, matches: 0 }
            }

            addTeam(match.home_team_name_en, match.home_team?.flag)
            addTeam(match.away_team_name_en, match.away_team?.flag)

            if (match.finished === 'TRUE') {
                teamStats[match.home_team_name_en].matches += 1
                teamStats[match.away_team_name_en].matches += 1
                teamStats[match.home_team_name_en].goals += Number(match.home_score || 0)
                teamStats[match.away_team_name_en].goals += Number(match.away_score || 0)
            }

            const addScorers = (str, teamName, teamFlag) => {
                parseScorerNames(str).forEach(name => {
                    const key = `${name}-${teamName}`
                    if (!map[key]) map[key] = { name, teamName, teamFlag, goals: 0, matches: 0 }
                    map[key].goals += 1
                    map[key].matches += 1
                })
            }

            addScorers(match.home_scorers, match.home_team_name_en, match.home_team?.flag)
            addScorers(match.away_scorers, match.away_team_name_en, match.away_team?.flag)
        })

        Object.values(map).forEach(player => {
            if (teamStats[player.teamName]) teamStats[player.teamName].players += 1
        })

        return {
            players: Object.values(map).sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name)),
            teams: Object.values(teamStats).sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name))
        }
    }, [matches])

    const selectedPlayers = selectedTeam === 'all'
        ? playerData.players
        : playerData.players.filter(player => player.teamName === selectedTeam)

    const selectedTeamInfo = playerData.teams.find(team => team.name === selectedTeam)
    const topTeams = playerData.teams.slice(0, 12)
    const totalGoals = matches
        .filter(match => match.finished === 'TRUE')
        .reduce((sum, match) => sum + Number(match.home_score || 0) + Number(match.away_score || 0), 0)

    if (loading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center bg-[#06070a] px-4">
                <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-7 text-center">
                    <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-yellow-300 border-t-transparent" />
                    <p className="text-sm font-black uppercase tracking-[0.28em] text-yellow-300">Loading players</p>
                </div>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-[#06070a] text-white">
            <section className="relative overflow-hidden border-b border-white/10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(250,204,21,0.16),transparent_30%),radial-gradient(circle_at_88%_8%,rgba(16,185,129,0.16),transparent_32%),linear-gradient(135deg,#100d05_0%,#0d1320_48%,#050608_100%)]" />
                <div className="relative mx-auto max-w-7xl px-4 py-8 sm:py-10 lg:px-6">
                    <span className="rounded-full bg-yellow-300 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-gray-950">
                        World Cup Players
                    </span>
                    <h1 className="mt-5 max-w-3xl text-[2rem] font-black leading-[0.94] sm:text-5xl lg:text-6xl">
                        Pick a flag. See the players shaping the tournament.
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-6 text-white/65 sm:text-base sm:leading-7 lg:text-lg">
                        This page uses available free match data, so player lists are built from recorded scorer events rather than fake full squads.
                    </p>

                    <div className="mt-7 grid max-w-4xl gap-3 sm:grid-cols-3">
                        {[
                            { label: 'Recorded players', value: playerData.players.length, color: 'text-yellow-300' },
                            { label: 'Countries with goals', value: playerData.teams.filter(team => team.players > 0).length, color: 'text-emerald-300' },
                            { label: 'Total goals', value: totalGoals, color: 'text-red-300' }
                        ].map(item => (
                            <div key={item.label} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                                <div className={`text-3xl font-black ${item.color}`}>{item.value}</div>
                                <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/40">{item.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
                <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.26em] text-yellow-300">Countries</p>
                        <h2 className="mt-1 text-3xl font-black">Filter by flag</h2>
                    </div>
                    <button
                        onClick={() => setSelectedTeam('all')}
                        className={`rounded-xl px-4 py-2 text-sm font-black transition ${
                            selectedTeam === 'all'
                                ? 'bg-yellow-300 text-gray-950'
                                : 'border border-white/10 bg-white/5 text-white/60 hover:text-white'
                        }`}
                    >
                        All players
                    </button>
                </div>

                <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-3">
                    {topTeams.map(team => (
                        <button
                            key={team.name}
                            onClick={() => setSelectedTeam(team.name)}
                            className={`min-w-[160px] rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${
                                selectedTeam === team.name
                                    ? 'border-yellow-300 bg-yellow-300/15'
                                    : 'border-white/10 bg-white/[0.045] hover:border-yellow-300/40'
                            }`}
                        >
                            {team.flag && <img src={team.flag} alt="" className="h-9 w-12 rounded-lg object-cover" />}
                            <p className="mt-3 truncate text-sm font-black">{team.name}</p>
                            <p className="mt-1 text-xs font-bold text-white/40">{team.players} scorers · {team.goals} goals</p>
                        </button>
                    ))}
                </div>

                <div className="mt-8 grid gap-6 xl:grid-cols-12">
                    <div className="lg:col-span-8">
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.26em] text-yellow-300">
                                    {selectedTeam === 'all' ? 'Golden boot' : selectedTeam}
                                </p>
                                <h2 className="mt-1 text-3xl font-black">
                                    {selectedTeam === 'all' ? 'Recorded Tournament Scorers' : 'Country Players'}
                                </h2>
                            </div>
                            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-widest text-white/50">
                                {selectedPlayers.length} players
                            </span>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045]">
                            <div className="overflow-x-auto hide-scrollbar">
                            <div className="min-w-[720px]">
                            <div className="grid grid-cols-12 border-b border-white/10 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-white/40">
                                <span className="col-span-1">#</span>
                                <span className="col-span-6">Player</span>
                                <span className="col-span-3">Country</span>
                                <span className="col-span-2 text-center text-white">Goals</span>
                            </div>

                            {selectedPlayers.slice(0, 30).map((player, index) => (
                                <div key={`${player.name}-${player.teamName}`} className="grid grid-cols-12 items-center border-b border-white/5 px-4 py-3 hover:bg-white/5">
                                    <span className={`col-span-1 text-sm font-black ${index < 3 ? 'text-yellow-300' : 'text-white/40'}`}>{index + 1}</span>
                                    <span className="col-span-6 truncate text-sm font-black">{player.name}</span>
                                    <div className="col-span-3 flex min-w-0 items-center gap-2">
                                        {player.teamFlag && <img src={player.teamFlag} alt="" className="h-5 w-7 rounded object-cover" />}
                                        <span className="truncate text-xs font-bold text-white/55">{player.teamName}</span>
                                    </div>
                                    <span className="col-span-2 text-center text-lg font-black text-yellow-300">{player.goals}</span>
                                </div>
                            ))}
                            </div>
                            </div>

                            {selectedPlayers.length === 0 && (
                                <div className="p-6 text-center text-sm font-bold text-white/45">
                                    No recorded scorer data for this country yet.
                                </div>
                            )}
                        </div>
                    </div>

                    <aside className="space-y-6 xl:col-span-4">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
                            <p className="text-xs font-black uppercase tracking-[0.26em] text-yellow-300">Country card</p>
                            {selectedTeamInfo ? (
                                <>
                                    <div className="mt-4 flex items-center gap-3">
                                        {selectedTeamInfo.flag && <img src={selectedTeamInfo.flag} alt="" className="h-12 w-16 rounded-xl object-cover" />}
                                        <div>
                                            <h3 className="text-2xl font-black">{selectedTeamInfo.name}</h3>
                                            <p className="text-sm font-bold text-white/40">{selectedTeamInfo.matches} finished matches</p>
                                        </div>
                                    </div>
                                    <div className="mt-5 grid grid-cols-2 gap-3">
                                        <div className="rounded-xl bg-black/25 p-4 text-center">
                                            <div className="text-3xl font-black text-yellow-300">{selectedTeamInfo.goals}</div>
                                            <div className="text-[10px] uppercase tracking-widest text-white/35">Goals</div>
                                        </div>
                                        <div className="rounded-xl bg-black/25 p-4 text-center">
                                            <div className="text-3xl font-black text-emerald-300">{selectedTeamInfo.players}</div>
                                            <div className="text-[10px] uppercase tracking-widest text-white/35">Scorers</div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p className="mt-4 text-sm leading-6 text-white/55">
                                    Select any country flag to focus the player table.
                                </p>
                            )}
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
                            <p className="text-xs font-black uppercase tracking-[0.26em] text-yellow-300">Data note</p>
                            <p className="mt-3 text-sm leading-6 text-white/55">
                                Free World Cup endpoint gives teams, matches and scorer strings. So this section shows real recorded scorers, not invented squad lists.
                            </p>
                        </div>
                    </aside>
                </div>
            </section>
        </main>
    )
}
