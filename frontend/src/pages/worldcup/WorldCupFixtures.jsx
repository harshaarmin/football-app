import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_BASE_URL from '../../utils/api'

export default function WorldCupFixtures() {
    const [matches, setMatches] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const navigate = useNavigate()

    useEffect(() => {
        axios.get(`${API_BASE_URL}/worldcup/matches`)
            .then(res => { setMatches(res.data); setLoading(false) })
            .catch(() => setLoading(false))
    }, [])

    const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

    const filtered = filter === 'all'
        ? matches
        : matches.filter(m => m.group === filter)

    const finished = filtered.filter(m => m.finished === 'TRUE')
        .sort((a, b) => new Date(b.local_date) - new Date(a.local_date))
    const upcoming = filtered.filter(m => m.finished !== 'TRUE')
        .sort((a, b) => new Date(a.local_date) - new Date(b.local_date))

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-yellow-400 animate-pulse">Loading fixtures...</div>
        </div>
    )

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold text-white mb-6">📅 Fixtures & Results</h2>

            {/* Group filter */}
            <div className="flex gap-2 flex-wrap mb-6">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === 'all' ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                >
                    All Groups
                </button>
                {groups.map(g => (
                    <button
                        key={g}
                        onClick={() => setFilter(g)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === g ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                    >
                        Group {g}
                    </button>
                ))}
            </div>

            {/* Upcoming */}
            {upcoming.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Upcoming</h3>
                    <div className="flex flex-col gap-3">
                        {upcoming.map((m, i) => (
                            <FixtureRow key={i} match={m} onClick={() => navigate(`/match/${m.id}`)} />
                        ))}
                    </div>
                </div>
            )}

            {/* Results */}
            {finished.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Results</h3>
                    <div className="flex flex-col gap-3">
                        {finished.map((m, i) => (
                            <FixtureRow key={i} match={m} onClick={() => navigate(`/match/${m.id}`)} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

function FixtureRow({ match, onClick }) {
    const isFinished = match.finished === 'TRUE'
    const [, timePart] = (match.local_date || '').split(' ')

    return (
        <div
            onClick={onClick}
            className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 flex items-center justify-between cursor-pointer hover:border-yellow-500/40 transition-all"
        >
            <div className="flex items-center gap-3 flex-1">
                {match.home_team?.flag && <img src={match.home_team.flag} className="w-8 h-5 object-cover rounded" />}
                <span className="text-white text-sm font-semibold">{match.home_team_name_en}</span>
            </div>
            <div className="text-center min-w-[100px]">
                {isFinished ? (
                    <span className="text-white font-black text-lg">{match.home_score} – {match.away_score}</span>
                ) : (
                    <div>
                        <div className="text-green-400 font-bold text-sm">{timePart}</div>
                        <div className="text-xs text-gray-600">Group {match.group}</div>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-3 flex-1 justify-end">
                <span className="text-white text-sm font-semibold">{match.away_team_name_en}</span>
                {match.away_team?.flag && <img src={match.away_team.flag} className="w-8 h-5 object-cover rounded" />}
            </div>
        </div>
    )
}
