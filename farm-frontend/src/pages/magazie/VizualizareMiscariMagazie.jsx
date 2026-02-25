import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import "./MagaziePages.css";

export default function VizualizareMiscariMagazie() {
    const [tipuri, setTipuri] = useState([]);
    const [selectedTip, setSelectedTip] = useState("");
    const [selectedDate, setSelectedDate] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1
    });
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [stats, setStats] = useState(null);
    const [selectedTipDetails, setSelectedTipDetails] = useState(null);
    const userId = 1;

    useEffect(() => {
        loadTipuri();
    }, []);

    useEffect(() => {
        if (selectedTip) {
            loadMonthData();
        }
    }, [selectedTip, selectedDate.year, selectedDate.month]);

    const loadTipuri = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/tip-magazie/all?userId=${userId}`);
            const data = await response.json();
            setTipuri(data);
        } catch (error) {
            setMessage({ text: "Eroare la încărcarea tipurilor", type: "error" });
        }
    };

    // Funcție pentru a obține numărul de zile dintr-o lună
    const getDaysInMonth = (year, month) => {
        return new Date(year, month, 0).getDate();
    };

    const loadMonthData = async () => {
        setLoading(true);
        try {
            // Încărcăm datele existente pentru luna respectivă
            const response = await fetch(
                `http://localhost:8080/api/magazie-miscari/raport?` +
                `userId=${userId}&tipMagazieId=${selectedTip}&` +
                `year=${selectedDate.year}&month=${selectedDate.month}`
            );

            const data = await response.json();

            // Obținem detaliile tipului selectat
            const tip = tipuri.find(t => t.id === parseInt(selectedTip));
            setSelectedTipDetails(tip);

            const daysInMonth = getDaysInMonth(selectedDate.year, selectedDate.month);
            const completeMonthData = [];
            let stocCurent = 0;

            // Calculăm stocul de la începutul lunii
            // Aici ar trebui să faci un API call pentru stocul la începutul lunii
            // Pentru moment, folosim 0 ca stoc inițial

            for (let day = 1; day <= daysInMonth; day++) {
                if (data.miscari) {
                    const existingEntry = data.miscari.find(m => m.day === day);

                    if (existingEntry) {
                        // Există o mișcare pentru această zi
                        completeMonthData.push({
                            id: existingEntry.id,
                            day,
                            furnizor: existingEntry.furnizor || "",
                            intrari: existingEntry.intrari || 0,
                            iesiri: existingEntry.iesiri || 0,
                            stocFinal: existingEntry.stocFinal || 0,
                            exists: true
                        });
                        stocCurent = existingEntry.stocFinal;
                    } else {
                        // Nu există mișcare pentru această zi
                        completeMonthData.push({
                            id: null,
                            day,
                            furnizor: "",
                            intrari: 0,
                            iesiri: 0,
                            stocFinal: stocCurent, // Stocul rămâne același ca în ziua precedentă
                            exists: false
                        });
                    }
                } else {
                    // Nu există nici o mișcare în această lună
                    completeMonthData.push({
                        id: null,
                        day,
                        furnizor: "",
                        intrari: 0,
                        iesiri: 0,
                        stocFinal: 0,
                        exists: false
                    });
                }
            }

            setEntries(completeMonthData);

            // Calculăm statistici pe baza datelor complete
            if (data.miscari && data.miscari.length > 0) {
                setStats({
                    stocInitial: data.stocInitial || 0,
                    totalIntrari: data.totalIntrari || 0,
                    totalIesiri: data.totalIesiri || 0,
                    stocFinal: data.stocFinal || 0
                });
            } else {
                setStats(null);
            }

        } catch (error) {
            console.error(error);
            setMessage({ text: "Eroare la încărcare", type: "error" });
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
        setLoading(true);
        let successCount = 0;
        let errorCount = 0;

        for (const entry of entries) {
            // Salvăm doar zilele care au modificări (intrări/ieșiri diferite de 0 sau furnizor completat)
            if (entry.intrari > 0 || entry.iesiri > 0 || entry.furnizor.trim() !== "") {
                try {
                    const payload = {
                        tipMagazieId: parseInt(selectedTip),
                        userId: userId,
                        furnizor: entry.furnizor,
                        day: entry.day,
                        month: selectedDate.month,
                        year: selectedDate.year,
                        intrari: entry.intrari || 0,
                        iesiri: entry.iesiri || 0
                    };

                    if (entry.exists) {
                        // UPDATE pentru intrări existente
                        const response = await fetch(
                            `http://localhost:8080/api/magazie-miscari/update/${entry.id}?userId=${userId}`,
                            {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(payload)
                            }
                        );

                        if (response.ok) {
                            successCount++;
                        } else {
                            errorCount++;
                        }
                    } else {
                        // CREATE pentru intrări noi
                        const response = await fetch("http://localhost:8080/api/magazie-miscari/add", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload)
                        });

                        if (response.ok) {
                            successCount++;
                        } else {
                            errorCount++;
                        }
                    }
                } catch (error) {
                    errorCount++;
                }
            }
        }

        if (errorCount === 0) {
            setMessage({
                text: `Toate cele ${successCount} modificări au fost salvate!`,
                type: "success"
            });
        } else {
            setMessage({
                text: `${successCount} salvări reușite, ${errorCount} erori`,
                type: "error"
            });
        }

        loadMonthData(); // Reîncărcăm datele
        setLoading(false);
    };

    const handleSetCurrentMonth = () => {
        const today = new Date();
        setSelectedDate({
            year: today.getFullYear(),
            month: today.getMonth() + 1
        });
    };

    const exportToExcel = () => {
        if (!selectedTipDetails) return;

        // Pregătim datele pentru export
        const exportData = entries.map(entry => ({
            Ziua: entry.day,
            Data: `${entry.day}.${selectedDate.month}.${selectedDate.year}`,
            Furnizor: entry.furnizor || "-",
            Intrări: entry.intrari || 0,
            Ieșiri: entry.iesiri || 0,
            Stoc: entry.stocFinal,
            "UM": selectedTipDetails.unitateMasura
        }));

        // Creăm worksheet
        const ws = XLSX.utils.json_to_sheet(exportData);

        // Creăm workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Mișcări");

        // Generăm numele fișierului
        const fileName = `magazie_${selectedTipDetails.cod}_${selectedDate.month}_${selectedDate.year}.xlsx`;

        // Salvăm fișierul
        XLSX.writeFile(wb, fileName);

        setMessage({ text: "Export realizat cu succes!", type: "success" });
    };

    const months = [
        "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
        "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"
    ];

    if (!selectedTip) {
        return (
            <div className="magazie-page">
                <div className="page-header">
                    <h1>Vizualizare Mișcări Magazie</h1>
                </div>
                <div className="filters-section">
                    <div className="filter-row">
                        <div className="filter-group">
                            <label>Tip Magazie:</label>
                            <select
                                value={selectedTip}
                                onChange={(e) => setSelectedTip(e.target.value)}
                            >
                                <option value="">Selectează tip...</option>
                                {tipuri.map(tip => (
                                    <option key={tip.id} value={tip.id}>
                                        {tip.cod} - {tip.denumire} ({tip.unitateMasura})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="magazie-page">
            <div className="page-header">
                <h1>Vizualizare Mișcări Magazie</h1>
            </div>

            <div className="filters-section">
                <div className="filter-row">
                    <div className="filter-group">
                        <label>Tip Magazie:</label>
                        <select
                            value={selectedTip}
                            onChange={(e) => setSelectedTip(e.target.value)}
                        >
                            {tipuri.map(tip => (
                                <option key={tip.id} value={tip.id}>
                                    {tip.cod} - {tip.denumire} ({tip.unitateMasura})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Lună:</label>
                        <select
                            value={selectedDate.month}
                            onChange={(e) => setSelectedDate({ ...selectedDate, month: parseInt(e.target.value) })}
                        >
                            {months.map((month, index) => (
                                <option key={index} value={index + 1}>{month}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>An:</label>
                        <input
                            type="number"
                            value={selectedDate.year}
                            onChange={(e) => setSelectedDate({ ...selectedDate, year: parseInt(e.target.value) })}
                            min="2000"
                        />
                    </div>

                    <button className="current-month-btn" onClick={handleSetCurrentMonth}>
                        📅 Luna curentă
                    </button>
                </div>
            </div>

            {loading && <div className="loading">Se încarcă...</div>}

            {!loading && entries.length > 0 && (
                <>
                    {stats && (
                        <div className="stats-card">
                            <div className="stat-item">
                                <span>Stoc inițial:</span>
                                <strong>{stats.stocInitial} {selectedTipDetails?.unitateMasura}</strong>
                            </div>
                            <div className="stat-item">
                                <span>Total intrări:</span>
                                <strong className="text-success">{stats.totalIntrari} {selectedTipDetails?.unitateMasura}</strong>
                            </div>
                            <div className="stat-item">
                                <span>Total ieșiri:</span>
                                <strong className="text-danger">{stats.totalIesiri} {selectedTipDetails?.unitateMasura}</strong>
                            </div>
                            <div className="stat-item">
                                <span>Stoc final:</span>
                                <strong>{stats.stocFinal} {selectedTipDetails?.unitateMasura}</strong>
                            </div>
                        </div>
                    )}

                    <div className="table-actions">
                        <button className="export-btn" onClick={exportToExcel}>
                            📥 Exportă în Excel
                        </button>
                    </div>

                    <div className="miscari-table-container">
                        <table className="miscari-table">
                            <thead>
                                <tr>
                                    <th>Ziua</th>
                                    <th>Data</th>
                                    <th>Furnizor/Destinatar</th>
                                    <th>Intrări ({selectedTipDetails?.unitateMasura})</th>
                                    <th>Ieșiri ({selectedTipDetails?.unitateMasura})</th>
                                    <th>Stoc final ({selectedTipDetails?.unitateMasura})</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map(entry => (
                                    <tr key={entry.day} className={entry.exists ? "" : "new-entry"}>
                                        <td className="day-cell">{entry.day}</td>
                                        <td>{entry.day}.{selectedDate.month}.{selectedDate.year}</td>
                                        <td>
                                            <input
                                                type="text"
                                                value={entry.furnizor}
                                                onChange={(e) => handleEntryChange(entry.day, "furnizor", e.target.value)}
                                                placeholder="Furnizor"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                value={entry.intrari}
                                                onChange={(e) => handleEntryChange(entry.day, "intrari", parseFloat(e.target.value) || 0)}
                                                min="0"
                                                step="0.01"
                                                className={entry.intrari > 0 ? "text-success" : ""}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                value={entry.iesiri}
                                                onChange={(e) => handleEntryChange(entry.day, "iesiri", parseFloat(e.target.value) || 0)}
                                                min="0"
                                                step="0.01"
                                                className={entry.iesiri > 0 ? "text-danger" : ""}
                                            />
                                        </td>
                                        <td className="text-bold">
                                            {entry.stocFinal} {selectedTipDetails?.unitateMasura}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="save-actions">
                        <button
                            className="save-button"
                            onClick={handleSaveAll}
                            disabled={loading}
                        >
                            {loading ? "Se salvează..." : "Salvează modificările"}
                        </button>
                    </div>
                </>
            )}

            {message.text && (
                <div className={`message ${message.text}`}>
                    {message.text}
                </div>
            )}
        </div>
    );
}