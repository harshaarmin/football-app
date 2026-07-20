import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import WorldCupHome from "./pages/worldcup/WorldCupHome";
import WorldCupStandings from "./pages/worldcup/WorldCupStandings";
import WorldCupFixtures from "./pages/worldcup/WorldCupFixtures";
import WorldCupPlayers from "./pages/worldcup/WorldCupPlayers";

import PLHome from "./pages/pl/PLHome";
import PLFixtures from "./pages/pl/PLFixtures";
import CompetitionsHub from "./pages/CompetitionsHub";
import CompetitionDetail from "./pages/CompetitionDetail";
import TeamPage from "./pages/TeamPage";
import Dashboard from "./pages/Dashboard";
import MatchDetail from "./pages/MatchDetail";
import Matches from "./pages/Matches";
import Search from "./pages/Search";

function Layout() {
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip bg-[#050816] text-white">

      {!hideNavbar && <Navbar />}

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/competitions" element={<CompetitionsHub />} />

        <Route path="/competitions/:code" element={<CompetitionDetail />} />

        <Route path="/teams/:id" element={<TeamPage />} />

        <Route path="/matches" element={<Matches />} />

        <Route path="/search" element={<Search />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

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

        <Route path="/pl" element={<PLHome />} />

        <Route
          path="/pl/fixtures"
          element={<PLFixtures />}
        />

        <Route
          path="/match/:id"
          element={<MatchDetail />}
        />

      </Routes>

    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
