import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useLocation,
} from "react-router-dom";

import Home from "./pages/Home";

import WorldCupHome from "./pages/worldcup/WorldCupHome";
import WorldCupStandings from "./pages/worldcup/WorldCupStandings";
import WorldCupFixtures from "./pages/worldcup/WorldCupFixtures";
import WorldCupPlayers from "./pages/worldcup/WorldCupPlayers";

import MatchDetail from "./pages/MatchDetail";

import PLHome from "./pages/pl/PLHome";
import PLFixtures from "./pages/pl/PLFixtures";

function App() {
  return (
    <BrowserRouter>

      <div className="min-h-screen bg-[#050816] text-white">

        <TopNav />

        <Routes>

          {/* Home */}

          <Route path="/" element={<Home />} />

          {/* World Cup */}

          <Route path="/worldcup" element={<WorldCupHome />} />

          <Route
            path="/worldcup/standings"
            element={<WorldCupStandings />}
          />

          <Route
            path="/worldcup/fixtures"
            element={<WorldCupFixtures />}
          />

          <Route
            path="/worldcup/players"
            element={<WorldCupPlayers />}
          />

          {/* Premier League */}

          <Route
            path="/pl"
            element={<PLHome />}
          />

          <Route
            path="/pl/fixtures"
            element={<PLFixtures />}
          />

          {/* Match Details */}

          <Route
            path="/match/:id"
            element={<MatchDetail />}
          />

        </Routes>

      </div>

    </BrowserRouter>
  );
}

function TopNav() {

  const location = useLocation();

  const isWC = location.pathname.startsWith("/worldcup");

  const isPL = location.pathname.startsWith("/pl");

  return (

    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0A1022]/90 backdrop-blur-xl">

      <div className="max-w-[1600px] mx-auto px-6">

        {/* Main Navigation */}

        <div className="flex items-center justify-between h-16">

          <NavLink
            to="/"
            className="text-2xl font-black text-white"
          >
            ⚽ KickOff
          </NavLink>

          <div className="flex items-center gap-2">

            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-5 py-2 rounded-xl transition ${
                  isActive
                    ? "bg-cyan-500 text-white"
                    : "text-white/60 hover:text-white"
                }`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/worldcup"
              className={() =>
                `px-5 py-2 rounded-xl transition ${
                  isWC
                    ? "bg-yellow-500 text-black"
                    : "text-white/60 hover:text-white"
                }`
              }
            >
              🏆 World Cup
            </NavLink>

            <NavLink
              to="/pl"
              className={() =>
                `px-5 py-2 rounded-xl transition ${
                  isPL
                    ? "bg-purple-600 text-white"
                    : "text-white/60 hover:text-white"
                }`
              }
            >
              🏴 Premier League
            </NavLink>

          </div>

        </div>

        {/* World Cup Sub Navigation */}

        {isWC && (

          <div className="flex gap-2 pb-4">

            {[
              {
                to: "/worldcup",
                label: "🏠 Overview",
                end: true,
              },
              {
                to: "/worldcup/standings",
                label: "📊 Groups",
              },
              {
                to: "/worldcup/fixtures",
                label: "📅 Fixtures",
              },
              {
                to: "/worldcup/players",
                label: "⭐ Players",
              },
            ].map((link) => (

              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm transition ${
                    isActive
                      ? "bg-yellow-500/20 border border-yellow-500/30 text-yellow-300"
                      : "text-white/50 hover:text-white"
                  }`
                }
              >
                {link.label}
              </NavLink>

            ))}

          </div>

        )}

        {/* Premier League Sub Navigation */}

        {isPL && (

          <div className="flex gap-2 pb-4">

            {[
              {
                to: "/pl",
                label: "🏠 Overview",
                end: true,
              },
              {
                to: "/pl/fixtures",
                label: "📅 Fixtures",
              },
            ].map((link) => (

              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm transition ${
                    isActive
                      ? "bg-purple-500/20 border border-purple-500/30 text-purple-300"
                      : "text-white/50 hover:text-white"
                  }`
                }
              >
                {link.label}
              </NavLink>

            ))}

          </div>

        )}

      </div>

    </header>

  );

}

export default App;