import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import "./Menu.css";

export default function Menu() {
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState({
    jurnal: false,
    magazie: false,
    centralizator: false
  });

  const toggleSubmenu = (menu) => {
    setOpenSubmenu(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  return (
    <nav className="menu">
      <div className="menu-logo">
        <h2>FarmManager</h2>
      </div>
      <ul className="menu-items">
        {/* Jurnal Section */}
        <li className={`has-submenu ${openSubmenu.jurnal ? "open" : ""}`}>
          <div className="menu-item-header" onClick={() => toggleSubmenu("jurnal")}>
            <span className="menu-icon">📝</span>
            <span className="menu-label">Jurnal</span>
            <span className="submenu-arrow">{openSubmenu.jurnal ? "▼" : "▶"}</span>
          </div>
          {openSubmenu.jurnal && (
            <ul className="submenu">
              <li className={location.pathname === "/jurnal/adaugare" ? "active" : ""}>
                <Link to="/jurnal/adaugare">
                  <span className="menu-icon">➕</span>
                  <span className="menu-label">Adăugare Mulsoare</span>
                </Link>
              </li>
              <li className={location.pathname === "/jurnal/vizualizare" ? "active" : ""}>
                <Link to="/jurnal/vizualizare">
                  <span className="menu-icon">👁️</span>
                  <span className="menu-label">Vizualizare/Editare</span>
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Magazie Section */}
        <li className={`has-submenu ${openSubmenu.magazie ? "open" : ""}`}>
          <div className="menu-item-header" onClick={() => toggleSubmenu("magazie")}>
            <span className="menu-icon">📦</span>
            <span className="menu-label">Magazie</span>
            <span className="submenu-arrow">{openSubmenu.magazie ? "▼" : "▶"}</span>
          </div>
          {openSubmenu.magazie && (
            <ul className="submenu">
              <li className={location.pathname === "/magazie/tip-adaugare" ? "active" : ""}>
                <Link to="/magazie/tip-adaugare">
                  <span className="menu-icon">➕</span>
                  <span className="menu-label">Adăugare Tip Magazie</span>
                </Link>
              </li>
              <li className={location.pathname === "/magazie/tip-vizualizare" ? "active" : ""}>
                <Link to="/magazie/tip-vizualizare">
                  <span className="menu-icon">👁️</span>
                  <span className="menu-label">Vizualizare/Edit Tip</span>
                </Link>
              </li>
              <li className={location.pathname === "/magazie/miscare-adaugare" ? "active" : ""}>
                <Link to="/magazie/miscare-adaugare">
                  <span className="menu-icon">📥</span>
                  <span className="menu-label">Adăugare Mișcare</span>
                </Link>
              </li>
              <li className={location.pathname === "/magazie/miscare-vizualizare" ? "active" : ""}>
                <Link to="/magazie/miscare-vizualizare">
                  <span className="menu-icon">📊</span>
                  <span className="menu-label">Vizualizare/Edit Mișcări</span>
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Centralizator Section */}
        <li className={`has-submenu ${openSubmenu.centralizator ? "open" : ""}`}>
          <div className="menu-item-header" onClick={() => toggleSubmenu("centralizator")}>
            <span className="menu-icon">📊</span>
            <span className="menu-label">Centralizator</span>
            <span className="submenu-arrow">{openSubmenu.centralizator ? "▼" : "▶"}</span>
          </div>
          {openSubmenu.centralizator && (
            <ul className="submenu">
              <li className={location.pathname === "/centralizator/adaugare" ? "active" : ""}>
                <Link to="/centralizator/adaugare">
                  <span className="menu-icon">➕</span>
                  <span className="menu-label">Adăugare Centralizator</span>
                </Link>
              </li>
              <li className={location.pathname === "/centralizator/vizualizare" ? "active" : ""}>
                <Link to="/centralizator/vizualizare">
                  <span className="menu-icon">👁️</span>
                  <span className="menu-label">Vizualizare/Editare</span>
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Alte meniuri */}
        <li className={location.pathname === "/clienti" ? "active" : ""}>
          <Link to="/clienti">
            <span className="menu-icon">👥</span>
            <span className="menu-label">Clienți</span>
          </Link>
        </li>
        <li className={location.pathname === "/statistici" ? "active" : ""}>
          <Link to="/statistici">
            <span className="menu-icon">📊</span>
            <span className="menu-label">Statistici</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}