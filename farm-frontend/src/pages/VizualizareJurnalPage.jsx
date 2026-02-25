import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import "./VizualizareJurnalPage.css";

export default function VizualizareJurnalPage() {
  const [userId, setUserId] = useState(1); // Poate veni din context/auth
  const [selectedDate, setSelectedDate] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Funcție pentru a obține numărul de zile dintr-o lună
  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  // Încarcă datele când se schimbă luna/anul
  useEffect(() => {
    loadMonthData();
  }, [selectedDate.year, selectedDate.month, userId]);

  const loadMonthData = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch(
        `http://localhost:8080/api/jurnal/cauta?userId=${userId}&year=${selectedDate.year}&month=${selectedDate.month}`
      );

      if (!response.ok) {
        throw new Error("Eroare la încărcare");
      }

      const data = await response.json();

      // Creează un array cu toate zilele lunii
      const daysInMonth = getDaysInMonth(selectedDate.year, selectedDate.month);
      const completeMonthData = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const existingEntry = data.find(entry => entry.day === day);

        if (existingEntry) {
          // Există deja o înregistrare pentru această zi
          completeMonthData.push({
            id: existingEntry.id,
            day,
            nrAnimale: existingEntry.nrAnimale || 0,
            mulsoare1: existingEntry.mulsoare1 || 0,
            mulsoare2: existingEntry.mulsoare2 || 0,
            valoarePredata: existingEntry.valoarePredata || 0,
            destinatar: existingEntry.destinatar || "",
            lapteVitei: existingEntry.lapteVitei || 0,
            vanzareExterna: existingEntry.vanzareExterna || 0,
            vanzareExternaDestinatar: existingEntry.vanzareExternaDestinatar || "",
            userId: existingEntry.userId,
            year: existingEntry.year,
            month: existingEntry.month,
            exists: true
          });
        } else {
          // Zi fără înregistrare - o creăm cu valori default
          completeMonthData.push({
            id: null,
            day,
            nrAnimale: 0,
            mulsoare1: 0,
            mulsoare2: 0,
            valoarePredata: 0,
            destinatar: "",
            lapteVitei: 0,
            vanzareExterna: 0,
            vanzareExternaDestinatar: "",
            userId: userId,
            year: selectedDate.year,
            month: selectedDate.month,
            exists: false
          });
        }
      }

      setEntries(completeMonthData);
    } catch (error) {
      setMessage({ text: "Eroare la încărcarea datelor", type: "error" });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEntryChange = (day, field, value) => {
    setEntries(prev =>
      prev.map(entry =>
        entry.day === day
          ? { ...entry, [field]: value }
          : entry
      )
    );
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setMessage({ text: "", type: "" });

    const results = {
      success: 0,
      errors: 0
    };

    for (const entry of entries) {
      // Salvăm doar zilele care au date completate
      if (entry.nrAnimale > 0 || entry.mulsoare1 > 0 || entry.mulsoare2 > 0 ||
        entry.valoarePredata > 0 || entry.destinatar !== "" || entry.lapteVitei > 0 ||
        entry.vanzareExterna > 0 || entry.vanzareExternaDestinatar !== "") {

        try {
          if (entry.exists) {
            // UPDATE pentru intrări existente
            const response = await fetch(`http://localhost:8080/api/jurnal/update/${entry.id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                nrAnimale: entry.nrAnimale,
                mulsoare1: entry.mulsoare1,
                mulsoare2: entry.mulsoare2,
                valoarePredata: entry.valoarePredata,
                destinatar: entry.destinatar,
                lapteVitei: entry.lapteVitei,
                vanzareExterna: entry.vanzareExterna,
                vanzareExternaDestinatar: entry.vanzareExternaDestinatar,
                day: entry.day,
                month: entry.month,
                year: entry.year,
                userId: entry.userId
              })
            });

            if (response.ok) {
              results.success++;
            } else {
              results.errors++;
            }
          } else {
            // CREATE pentru intrări noi
            const response = await fetch("http://localhost:8080/api/jurnal/add", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                nrAnimale: entry.nrAnimale,
                mulsoare1: entry.mulsoare1,
                mulsoare2: entry.mulsoare2,
                valoarePredata: entry.valoarePredata,
                destinatar: entry.destinatar,
                lapteVitei: entry.lapteVitei,
                vanzareExterna: entry.vanzareExterna,
                vanzareExternaDestinatar: entry.vanzareExternaDestinatar,
                day: entry.day,
                month: entry.month,
                year: entry.year,
                userId: entry.userId
              })
            });

            if (response.ok) {
              results.success++;
            } else {
              results.errors++;
            }
          }
        } catch (error) {
          results.errors++;
        }
      }
    }

    if (results.errors === 0) {
      setMessage({ text: `Toate cele ${results.success} înregistrări au fost salvate!`, type: "success" });
      // Reîncărcăm datele pentru a avea ID-uri la noile intrări
      loadMonthData();
    } else {
      setMessage({
        text: `${results.success} salvări reușite, ${results.errors} erori`,
        type: "error"
      });
    }

    setSaving(false);
  };

  const handleSetCurrentMonth = () => {
    const today = new Date();
    setSelectedDate({
      year: today.getFullYear(),
      month: today.getMonth() + 1
    });
  };

  const exportToExcel = () => {
    try {
      // Pregătim datele pentru export
      const exportData = entries.map(entry => {
        const totalLapte = (entry.mulsoare1 || 0) + (entry.mulsoare2 || 0);

        return {
          "Ziua": entry.day,
          "Data": `${entry.day}.${selectedDate.month}.${selectedDate.year}`,
          "Nr. Animale": entry.nrAnimale || 0,
          "Mulsoare 1 (L)": entry.mulsoare1 || 0,
          "Mulsoare 2 (L)": entry.mulsoare2 || 0,
          "Total Lapte (L)": totalLapte,
          "Lapte Viței (L)": entry.lapteVitei || 0,
          "Valoare Predată (RON)": entry.valoarePredata || 0,
          "Destinatar": entry.destinatar || "-",
          "Vânzare Externă (L)": entry.vanzareExterna || 0,
          "Destinatar Extern": entry.vanzareExternaDestinatar || "-"
        };
      });

      // Creăm worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Ajustăm lățimea coloanelor
      const colWidths = [
        { wch: 8 },  // Ziua
        { wch: 12 }, // Data
        { wch: 12 }, // Nr. Animale
        { wch: 14 }, // Mulsoare 1
        { wch: 14 }, // Mulsoare 2
        { wch: 14 }, // Total Lapte
        { wch: 14 }, // Lapte Viței
        { wch: 16 }, // Valoare Predată
        { wch: 20 }, // Destinatar
        { wch: 16 }, // Vânzare Externă
        { wch: 20 }  // Destinatar Extern
      ];
      ws['!cols'] = colWidths;

      // Creăm workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Jurnal");

      // Generăm numele fișierului
      const monthName = new Date(selectedDate.year, selectedDate.month - 1).toLocaleString('ro', { month: 'long' });
      const fileName = `jurnal_${monthName}_${selectedDate.year}.xlsx`;

      // Salvăm fișierul
      XLSX.writeFile(wb, fileName);

      setMessage({ text: "Export realizat cu succes!", type: "success" });
    } catch (error) {
      setMessage({ text: "Eroare la export", type: "error" });
      console.error(error);
    }
  };

  const months = [
    "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
    "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"
  ];

  if (loading) {
    return <div className="loading">Se încarcă datele pentru luna {months[selectedDate.month - 1]} {selectedDate.year}...</div>;
  }

  return (
    <div className="vizualizare-jurnal-page">
      <div className="page-header">
        <h1>Jurnal Zilnic - Vizualizare/Editare</h1>
        <div className="header-actions">
          <div className="month-selector">
            <select
              value={selectedDate.month}
              onChange={(e) => setSelectedDate({ ...selectedDate, month: parseInt(e.target.value) })}
              className="month-select"
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>

            <input
              type="number"
              value={selectedDate.year}
              onChange={(e) => setSelectedDate({ ...selectedDate, year: parseInt(e.target.value) })}
              className="year-input"
              min="2000"
              max="2100"
            />

            <button className="current-month-btn" onClick={handleSetCurrentMonth}>
              📅 Luna curentă
            </button>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {entries.length > 0 && (
        <>
          <div className="table-actions">
            <button className="export-btn" onClick={exportToExcel}>
              📥 Exportă în Excel
            </button>
          </div>

          <div className="table-container">
            <table className="jurnal-table">
              <thead>
                <tr>
                  <th>Ziua</th>
                  <th>Data</th>
                  <th>Nr. Animale</th>
                  <th>Mulsoare 1 (L)</th>
                  <th>Mulsoare 2 (L)</th>
                  <th>Total Lapte (L)</th>
                  <th>Lapte Viței (L)</th>
                  <th>Valoare Predată (RON)</th>
                  <th>Destinatar</th>
                  <th>Vânzare Externă (L)</th>
                  <th>Destinatar Extern</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const totalLapte = (entry.mulsoare1 || 0) + (entry.mulsoare2 || 0);

                  return (
                    <tr key={entry.day} className={entry.exists ? "" : "new-entry"}>
                      <td className="day-cell">{entry.day}</td>
                      <td className="date-cell">{entry.day}.{selectedDate.month}.{selectedDate.year}</td>
                      <td>
                        <input
                          type="number"
                          value={entry.nrAnimale}
                          onChange={(e) => handleEntryChange(entry.day, "nrAnimale", parseInt(e.target.value) || 0)}
                          min="0"
                          step="1"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={entry.mulsoare1}
                          onChange={(e) => handleEntryChange(entry.day, "mulsoare1", parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.1"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={entry.mulsoare2}
                          onChange={(e) => handleEntryChange(entry.day, "mulsoare2", parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.1"
                        />
                      </td>
                      <td className="total-cell">{totalLapte.toFixed(1)}</td>
                      <td>
                        <input
                          type="number"
                          value={entry.lapteVitei}
                          onChange={(e) => handleEntryChange(entry.day, "lapteVitei", parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.1"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={entry.valoarePredata}
                          onChange={(e) => handleEntryChange(entry.day, "valoarePredata", parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={entry.destinatar}
                          onChange={(e) => handleEntryChange(entry.day, "destinatar", e.target.value)}
                          placeholder="Destinatar"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={entry.vanzareExterna}
                          onChange={(e) => handleEntryChange(entry.day, "vanzareExterna", parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.1"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={entry.vanzareExternaDestinatar}
                          onChange={(e) => handleEntryChange(entry.day, "vanzareExternaDestinatar", e.target.value)}
                          placeholder="Destinatar extern"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="save-actions">
            <button
              className="save-button"
              onClick={handleSaveAll}
              disabled={saving}
            >
              {saving ? "Se salvează modificările..." : "Salvează toate modificările"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}