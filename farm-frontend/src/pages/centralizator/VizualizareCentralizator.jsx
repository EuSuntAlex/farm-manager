import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import "./CentralizatorPages.css";

export default function VizualizareCentralizator() {
    const [entries, setEntries] = useState([]);
    const [tipuri, setTipuri] = useState([]);
    const [selectedDate, setSelectedDate] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [stats, setStats] = useState(null);
    const userId = 1;

    const months = [
        "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
        "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

    // Încărcăm tipurile la inițializare
    useEffect(() => {
        loadTipuri();
    }, []);

    // Încărcăm datele când se schimbă luna/anul
    useEffect(() => {
        if (selectedDate.month && selectedDate.year) {
            loadMonthData();
        }
    }, [selectedDate.year, selectedDate.month]);

    const loadTipuri = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/tip-magazie/all?userId=${userId}`);
            if (response.ok) {
                const data = await response.json();
                setTipuri(data);
            }
        } catch (error) {
            console.error("Eroare la încărcare tipuri:", error);
        }
    };

    const loadMonthData = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:8080/api/centralizator/luna?` +
                `userId=${userId}&month=${selectedDate.month}&year=${selectedDate.year}`
            );

            if (!response.ok) {
                throw new Error("Eroare la încărcare");
            }

            const data = await response.json();
            setEntries(data);

            // Încărcăm și statisticile
            loadStatistics();

        } catch (error) {
            setMessage({ text: "Eroare la încărcarea datelor", type: "error" });
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadStatistics = async () => {
        try {
            const response = await fetch(
                `http://localhost:8080/api/centralizator/statistici?` +
                `userId=${userId}&month=${selectedDate.month}&year=${selectedDate.year}`
            );

            if (response.ok) {
                const data = await response.json();
                if (!data.message) {
                    setStats(data);
                }
            }
        } catch (error) {
            console.error("Eroare la încărcare statistici");
        }
    };

    const initializeMonth = async () => {
        if (!window.confirm(`Vrei să inițializezi luna ${months[selectedDate.month - 1]} ${selectedDate.year} cu toate tipurile de furaje?`)) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:8080/api/centralizator/initializeaza-luna?` +
                `userId=${userId}&month=${selectedDate.month}&year=${selectedDate.year}`,
                { method: "POST" }
            );

            if (!response.ok) {
                throw new Error("Eroare la inițializare");
            }

            setMessage({ text: "Lună inițializată cu succes!", type: "success" });
            loadMonthData();
        } catch (error) {
            setMessage({ text: "Eroare la inițializare", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleEntryChange = (id, field, value) => {
        setEntries(prev =>
            prev.map(entry =>
                entry.id === id
                    ? { ...entry, [field]: parseInt(value) || 0 }
                    : entry
            )
        );
    };

    const handleSave = async (id) => {
        const entry = entries.find(e => e.id === id);
        if (!entry) return;

        setSaving(true);
        try {
            const response = await fetch(`http://localhost:8080/api/centralizator/update/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...entry,
                    userId: userId
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Eroare la salvare");
            }

            setMessage({ text: "Înregistrare actualizată!", type: "success" });
            loadMonthData();
        } catch (error) {
            setMessage({ text: error.message, type: "error" });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Ești sigur că vrei să ștergi această înregistrare?")) return;

        try {
            const response = await fetch(
                `http://localhost:8080/api/centralizator/delete/${id}?userId=${userId}`,
                { method: "DELETE" }
            );

            if (!response.ok) {
                throw new Error("Eroare la ștergere");
            }

            setMessage({ text: "Înregistrare ștearsă!", type: "success" });
            loadMonthData();
        } catch (error) {
            setMessage({ text: "Eroare la ștergere", type: "error" });
        }
    };

    const handleSetCurrentMonth = () => {
        const today = new Date();
        setSelectedDate({
            year: today.getFullYear(),
            month: today.getMonth() + 1
        });
    };

    const exportToExcel = () => {
        const exportData = entries.map((entry, index) => ({
            "Nr. crt": index + 1,
            "Cod": entry.cod || "",
            "Denumire furaj": entry.denumire || "",
            "UM": entry.unitateMasura || "",
            "Stoc inițial": entry.stocInitial,
            "Intrări": entry.intrari,
            "Vaci lapte": entry.vaciLapte,
            "Vaci gestante": entry.vaciGestante,
            "Juninci gestante": entry.juniciGestante,
            "Alte vaci": entry.alteVaci,
            "Vițele montate": entry.viteleMontate,
            "Juninci (>12 luni)": entry.junici,
            "Viței 6-12 luni": entry.vitele6_12Luni,
            "Viței 3-6 luni": entry.vitele3_6Luni,
            "Viței 0-3 luni": entry.vitele0_3Luni,
            "Tăurași": entry.taurasi,
            "Total consum": entry.totalConsum,
            "Stoc final": entry.stocFinal
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);

        // Ajustăm lățimea coloanelor
        const colWidths = [
            { wch: 8 },  // Nr. crt
            { wch: 10 }, // Cod
            { wch: 25 }, // Denumire
            { wch: 6 },  // UM
            { wch: 12 }, // Stoc inițial
            { wch: 10 }, // Intrări
            { wch: 12 }, // Vaci lapte
            { wch: 14 }, // Vaci gestante
            { wch: 16 }, // Juninci gestante
            { wch: 12 }, // Alte vaci
            { wch: 14 }, // Vițele montate
            { wch: 16 }, // Juninci >12 luni
            { wch: 14 }, // Viței 6-12
            { wch: 14 }, // Viței 3-6
            { wch: 14 }, // Viței 0-3
            { wch: 10 }, // Tăurași
            { wch: 12 }, // Total consum
            { wch: 12 }  // Stoc final
        ];
        ws['!cols'] = colWidths;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Centralizator");

        const fileName = `centralizator_${selectedDate.month}_${selectedDate.year}.xlsx`;
        XLSX.writeFile(wb, fileName);

        setMessage({ text: "Export realizat cu succes!", type: "success" });
    };

    return (
        <div className="centralizator-page">
            <div className="page-header">
                <h1>Centralizator Furaje - {months[selectedDate.month - 1]} {selectedDate.year}</h1>
                <div className="header-actions">
                    <div className="period-selector">
                        <select
                            value={selectedDate.month}
                            onChange={(e) => setSelectedDate({ ...selectedDate, month: parseInt(e.target.value) })}
                        >
                            {months.map((month, index) => (
                                <option key={index} value={index + 1}>{month}</option>
                            ))}
                        </select>

                        <select
                            value={selectedDate.year}
                            onChange={(e) => setSelectedDate({ ...selectedDate, year: parseInt(e.target.value) })}
                        >
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>

                        <button className="current-month-btn" onClick={handleSetCurrentMonth}>
                            📅 Luna curentă
                        </button>

                        <button className="initialize-btn" onClick={initializeMonth}>
                            🚀 Inițializează lună
                        </button>
                    </div>
                </div>
            </div>

            {loading && <div className="loading">Se încarcă...</div>}

            {stats && (
                <div className="stats-card">
                    <h3>Statistici lunare</h3>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span>Total înregistrări:</span>
                            <strong>{stats.totalInregistrari}</strong>
                        </div>
                        <div className="stat-item">
                            <span>Total stoc inițial:</span>
                            <strong>{stats.totalStocInitial}</strong>
                        </div>
                        <div className="stat-item">
                            <span>Total intrări:</span>
                            <strong>{stats.totalIntrari}</strong>
                        </div>
                        <div className="stat-item highlight">
                            <span>Total consum:</span>
                            <strong>{stats.totalConsum}</strong>
                        </div>
                        <div className="stat-item highlight">
                            <span>Total stoc final:</span>
                            <strong>{stats.totalStocFinal}</strong>
                        </div>
                    </div>
                </div>
            )}

            {entries.length > 0 ? (
                <>
                    <div className="table-actions">
                        <button className="export-btn" onClick={exportToExcel}>
                            📥 Exportă în Excel
                        </button>
                    </div>

                    <div className="table-container">
                        <table className="centralizator-table">
                            <thead>
                                <tr>
                                    <th>Nr.</th>
                                    <th>Cod</th>
                                    <th>Denumire furaj</th>
                                    <th>UM</th>
                                    <th>Stoc inițial</th>
                                    <th>Intrări</th>
                                    <th>Vaci lapte</th>
                                    <th>Vaci gest.</th>
                                    <th>Junici gest.</th>
                                    <th>Alte vaci</th>
                                    <th>Viț. mont.</th>
                                    <th>Junici 12l</th>
                                    <th>Viței 6-12l</th>
                                    <th>Viței 3-6l</th>
                                    <th>Viței 0-3l</th>
                                    <th>Tăurași</th>
                                    <th>Total consum</th>
                                    <th>Stoc final</th>
                                    <th>Acțiuni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map((entry, index) => (
                                    <tr key={entry.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <input
                                                type="text"
                                                value={entry.cod || ''}
                                                disabled
                                                className="readonly"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                value={entry.denumire || ''}
                                                disabled
                                                className="readonly"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                value={entry.unitateMasura || ''}
                                                disabled
                                                className="readonly"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                value={entry.stocInitial}
                                                onChange={(e) => handleEntryChange(entry.id, "stocInitial", e.target.value)}
                                                min="0"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                value={entry.intrari}
                                                onChange={(e) => handleEntryChange(entry.id, "intrari", e.target.value)}
                                                min="0"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                value={entry.vaciLapte}
                                                onChange={(e) => handleEntryChange(entry.id, "vaciLapte", e.target.value)}
                                                min="0"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                value={entry.vaciGestante}
                                                onChange={(e) => handleEntryChange(entry.id, "vaciGestante", e.target.value)}
                                                min="0"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                value={entry.juniciGestante}
                                                onChange={(e) => handleEntryChange(entry.id, "juniciGestante", e.target.value)}
                                                min="0"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                value={entry.alteVaci}
                                                onChange={(e) => handleEntryChange(entry.id, "alteVaci", e.target.value)}
                                                min="0"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                value={entry.viteleMontate}
                                                onChange={(e) => handleEntryChange(entry.id, "viteleMontate", e.target.value)}
                                                min="0"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                value={entry.junici}
                                                onChange={(e) => handleEntryChange(entry.id, "junici", e.target.value)}
                                                min="0"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                value={entry.vitele6_12Luni}
                                                onChange={(e) => handleEntryChange(entry.id, "vitele6_12Luni", e.target.value)}
                                                min="0"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                value={entry.vitele3_6Luni}
                                                onChange={(e) => handleEntryChange(entry.id, "vitele3_6Luni", e.target.value)}
                                                min="0"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                value={entry.vitele0_3Luni}
                                                onChange={(e) => handleEntryChange(entry.id, "vitele0_3Luni", e.target.value)}
                                                min="0"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                value={entry.taurasi}
                                                onChange={(e) => handleEntryChange(entry.id, "taurasi", e.target.value)}
                                                min="0"
                                            />
                                        </td>
                                        <td className="total-cell">{entry.totalConsum}</td>
                                        <td className={entry.stocFinal < 0 ? "negative" : "positive"}>
                                            {entry.stocFinal}
                                        </td>
                                        <td className="actions-cell">
                                            <button
                                                className="save-btn"
                                                onClick={() => handleSave(entry.id)}
                                                disabled={saving}
                                                title="Salvează modificările"
                                            >
                                                💾
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={() => handleDelete(entry.id)}
                                                title="Șterge înregistrarea"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                !loading && (
                    <div className="no-data">
                        <p>Nu există înregistrări pentru {months[selectedDate.month - 1]} {selectedDate.year}</p>
                        <button className="initialize-btn" onClick={initializeMonth}>
                            🚀 Inițializează luna cu toate tipurile de furaje
                        </button>
                    </div>
                )
            )}

            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}
        </div>
    );
}