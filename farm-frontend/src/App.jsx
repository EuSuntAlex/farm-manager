import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Menu from "./components/Menu";
import JurnalForm from "./components/JurnalForm";
import VizualizareJurnalPage from "./pages/VizualizareJurnalPage";
import AdaugareTipMagazie from "./pages/magazie/AdaugareTipMagazie";
import VizualizareTipMagazie from "./pages/magazie/VizualizareTipMagazie";
import AdaugareMiscareMagazie from "./pages/magazie/AdaugareMiscareMagazie";
import VizualizareMiscariMagazie from "./pages/magazie/VizualizareMiscariMagazie";
import AdaugareCentralizator from "./pages/centralizator/AdaugareCentralizator";
import VizualizareCentralizator from "./pages/centralizator/VizualizareCentralizator";
import ClientiPage from "./pages/ClientiPage";
import StatisticiPage from "./pages/StatisticiPage";
import TipEvenimentPage from './components/TipEvenimentPage';
import EvenimentePage from './components/EvenimentePage';
import IngredientePage from "./components/IngredientePage";

import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Menu />
        <div className="content">
          <Routes>
            {/* Jurnal routes */}
            <Route path="/jurnal/adaugare" element={<JurnalForm />} />
            <Route path="/jurnal/vizualizare" element={<VizualizareJurnalPage />} />

            {/* Magazie routes */}
            <Route path="/magazie/tip-adaugare" element={<AdaugareTipMagazie />} />
            <Route path="/magazie/tip-vizualizare" element={<VizualizareTipMagazie />} />
            <Route path="/magazie/miscare-adaugare" element={<AdaugareMiscareMagazie />} />
            <Route path="/magazie/miscare-vizualizare" element={<VizualizareMiscariMagazie />} />

            {/* Centralizator routes */}
            <Route path="/centralizator/adaugare" element={<AdaugareCentralizator />} />
            <Route path="/centralizator/vizualizare" element={<VizualizareCentralizator />} />

            {/* Other routes */}
            <Route path="/clienti" element={<ClientiPage />} />
            <Route path="/statistici" element={<StatisticiPage />} />
            <Route path="/" element={<JurnalForm />} />
            <Route path="/tip-eveniment" element={<TipEvenimentPage />} />
            <Route path="/evenimente" element={<EvenimentePage />} />
            <Route path="/ingrediente" element={<IngredientePage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;