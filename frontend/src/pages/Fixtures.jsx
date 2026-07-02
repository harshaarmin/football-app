import { useEffect, useState } from 'react'
import axios from 'axios'
import MatchCard from '../components/MatchCard'

function Fixtures() {
    const [fixtures, setFixtures] = useState({ premierLeague: [], championsLeague: [] })
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('pl')

    useEffect(() => {
        axios.get('http://localhost:3000/api/matches/upcoming')
            .then(res => {
                setFixtures(res.data)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-green-400 animate-pulse">Loading fixtures...</div>
        </div>
    )

    const currentMatches = activeTab === 'pl'
        ? fixtures.premierLeague
        : fixtures.championsLeague

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold text-white mb-6">Upcoming Fixtures</h2>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('pl')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'pl'
                            ? 'bg-green-500 text-black'
                            : 'bg-gray-800 text-gray-400 hover:text-white'
                        }`}
                >
                    Premier League
                </button>
                <button
                    onClick={() => setActiveTab('cl')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'cl'
                            ? 'bg-green-500 text-black'
                            : 'bg-gray-800 text-gray-400 hover:text-white'
                        }`}
                >
                    Champions League
                </button>
            </div>

            {currentMatches.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">🗓️</div>
                    <p className="text-gray-400">No upcoming fixtures this week</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {currentMatches.map(match => (
                        <MatchCard key={match.id} match={match} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default Fixtures