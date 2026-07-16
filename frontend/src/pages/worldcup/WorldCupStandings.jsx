import { useEffect, useState } from 'react'
import axios from 'axios'
import API_BASE_URL from '../../utils/api'

export default function WorldCupStandings() {
    const [groups, setGroups] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        axios.get(`${API_BASE_URL}/worldcup/groups`)
            .then(res => {
                setGroups(res.data)
                setLoading(false)
            })
            .catch(() => {
                setError('Failed to load World Cup data')
                setLoading(false)
            })
    }, [])

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-yellow-400 text-lg animate-pulse">Loading Groups...</div>
        </div>
    )

    if (error) return (
        <div className="text-center text-red-400 mt-20">{error}</div>
    )

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold text-white mb-2">📊 Group Stage Standings</h2>
            <p className="text-gray-500 text-sm mb-8">Top 2 from each group advance to Round of 32</p>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {groups.map(group => (
                    <div key={group.name} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-yellow-500 transition-colors">
                        <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
                            <span className="text-white font-bold text-lg">Group {group.name}</span>
                            <span className="text-xs text-gray-400 uppercase tracking-wide">P W D L Pts</span>
                        </div>

                        <div className="divide-y divide-gray-800">
                            {group.teams.map((entry, index) => (
                                <div
                                    key={entry.team_id}
                                    className={`flex items-center px-4 py-3 gap-3 ${index < 2 ? 'bg-gray-900' : 'bg-gray-950'
                                        }`}
                                >
                                    <div className={`w-1 h-8 rounded-full flex-shrink-0 ${index < 2 ? 'bg-yellow-400' : 'bg-gray-700'
                                        }`} />

                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        {entry.team?.flag ? (
                                            <img
                                                src={entry.team.flag}
                                                alt={entry.team.name_en}
                                                className="w-6 h-4 object-cover rounded-sm flex-shrink-0"
                                            />
                                        ) : (
                                            <span className="text-lg flex-shrink-0">🏳️</span>
                                        )}
                                        <span className="text-white text-sm font-medium truncate">
                                            {entry.team?.name_en || `Team ${entry.team_id}`}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3 text-sm flex-shrink-0">
                                        <span className="text-gray-400 w-4 text-center">{entry.mp}</span>
                                        <span className="text-gray-400 w-4 text-center">{entry.w}</span>
                                        <span className="text-gray-400 w-4 text-center">{entry.d}</span>
                                        <span className="text-gray-400 w-4 text-center">{entry.l}</span>
                                        <span className="text-white font-bold w-6 text-center">{entry.pts}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="px-4 py-2 bg-gray-900 border-t border-gray-800">
                            <div className="flex justify-between text-xs text-gray-600">
                                <span>Top 2 qualify</span>
                                <span className="text-yellow-500">🟡 = qualified</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 flex gap-6 text-xs text-gray-500">
                <span><span className="inline-block w-2 h-2 bg-yellow-400 rounded-sm mr-1"></span>Qualifies to Round of 32</span>
                <span><span className="inline-block w-2 h-2 bg-gray-700 rounded-sm mr-1"></span>Eliminated</span>
            </div>
        </div>
    )
}
