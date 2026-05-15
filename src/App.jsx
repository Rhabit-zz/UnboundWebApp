import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import HomePage from "./pages/home.jsx";
import SpeciesPage from "./pages/species.jsx";
import CharactersPage from "./pages/character.jsx";
import GatheringPage from "./pages/gathering.jsx";
import CraftingPage from "./pages/crafting.jsx";
import ArenaPage from "./pages/arena.jsx";
import MarketPage from "./pages/market.jsx";
import AdminPage from "./pages/admin.jsx";
import ProfilePage from "./pages/main.jsx";
import ReferencesPage from "./pages/reference.jsx";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/species" element={<SpeciesPage />} />
          <Route path="/characters" element={<CharactersPage />} />
          <Route path="/gathering" element={<GatheringPage />} />
          <Route path="/crafting" element={<CraftingPage />} />
          <Route path="/arena" element={<ArenaPage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/references" element={<ReferencesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
