import { useState, useEffect } from "react";
import "./CentralizatorPages.css";

export default function AdaugareCentralizator() {
    const [tipuri, setTipuri] = useState([]);
    const [loadingTipuri, setLoadingTipuri] = useState(true);
    const [selectedTip, setSelectedTip] = useState(null);
    const [previousMonthStoc, setPreviousMonthStoc] = useState(null);
    const [validationMessage, setValidationMessage] = useState("");

    const [form, setForm] = useState({
        tipMagazieId: "",
        stocInitial: "",
        intrari: "",
        vaciLapte: "",
        vaciGestante: "",
        juniciGestante: "",
        alteVaci: "",
        viteleMontate: "",
        junici: "",
        vitele6_12Luni: "",
        vitele3_6Luni: "",
        vitele0_3Luni: "",
        taurasi: "",
        observatii: "",
        month: "",
        year: "",
        userId: 1
    });

    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState({ text: "", type: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const months = [
        "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
        "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

    // Încărcăm tipurile de furaje la inițializare
    useEffect(() => {
        loadTipuri();
    }, []);

    // Când se schimbă tipul, luna sau anul, verificăm stocul din luna precedentă
    useEffect(() => {
        if (form.tipMagazieId && form.month && form.year) {
            checkPreviousMonthStoc();

            // Dacă avem un tip selectat, îl salvăm în state
            const tip = tipuri.find(t => t.id === parseInt(form.tipMagazieId));
            setSelectedTip(tip);
        }
    }, [form.tipMagazieId, form.month, form.year]);

    const loadTipuri = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/tip-magazie/all?userId=1`);
            if (response.ok) {
                const data = await response.json();
                setTipuri(data);
            }
        } catch (error) {
            console.error("Eroare la încărcare tipuri:", error);
        } finally {
            setLoadingTipuri(false);
        }
    };

    const checkPreviousMonthStoc = async () => {
        try {
            const response = await fetch(
                `http://localhost:8080/api/centralizator/stoc-precedent?` +
                `userId=1&tipMagazieId=${form.tipMagazieId}&month=${form.month}&year=${form.year}`
            );

            if (response.ok) {
                const data = await response.json();
                setPreviousMonthStoc(data.stocPrecedent);

                if (data.stocPrecedent > 0) {
                    setValidationMessage(`Stocul din luna precedentă: ${data.stocPrecedent} ${selectedTip?.unitateMasura || ''}`);
                    // Setăm automat stocul inițial
                    setForm(prev => ({ ...prev, stocInitial: data.stocPrecedent.toString() }));
                } else {
                    setValidationMessage("Nu există date pentru luna precedentă. Stocul inițial poate fi 0.");
                }
            }
        } catch (error) {
            console.error("Eroare la verificare stoc precedent");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const setCurrentMonth = () => {
        const today = new Date();
        setForm(prev => ({
            ...prev,
            month: (today.getMonth() + 1).toString(),
            year: today.getFullYear().toString()
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!form.tipMagazieId) {
            newErrors.tipMagazieId = "Selectează un tip de furaj";
        }
        if (!form.month) {
            newErrors.month = "Selectează luna";
        }
        if (!form.year) {
            newErrors.year = "Selectează anul";
        }

        return newErrors;
    };

    const calculateTotalConsum = () => {
        return (parseInt(form.vaciLapte) || 0) +
            (parseInt(form.vaciGestante) || 0) +
            (parseInt(form.juniciGestante) || 0) +
            (parseInt(form.alteVaci) || 0) +
            (parseInt(form.viteleMontate) || 0) +
            (parseInt(form.junici) || 0) +
            (parseInt(form.vitele6_12Luni) || 0) +
            (parseInt(form.vitele3_6Luni) || 0) +
            (parseInt(form.vitele0_3Luni) || 0) +
            (parseInt(form.taurasi) || 0);
    };

    const calculateStocFinal = () => {
        const stocInitial = parseInt(form.stocInitial) || 0;
        const intrari = parseInt(form.intrari) || 0;
        const totalConsum = calculateTotalConsum();

        return stocInitial + intrari - totalConsum;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setMessage({ text: "Completează toate câmpurile obligatorii", type: "error" });
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                tipMagazieId: parseInt(form.tipMagazieId),
                stocInitial: parseInt(form.stocInitial) || 0,
                intrari: parseInt(form.intrari) || 0,
                vaciLapte: parseInt(form.vaciLapte) || 0,
                vaciGestante: parseInt(form.vaciGestante) || 0,
                juniciGestante: parseInt(form.juniciGestante) || 0,
                alteVaci: parseInt(form.alteVaci) || 0,
                viteleMontate: parseInt(form.viteleMontate) || 0,
                junici: parseInt(form.junici) || 0,
                vitele6_12Luni: parseInt(form.vitele6_12Luni) || 0,
                vitele3_6Luni: parseInt(form.vitele3_6Luni) || 0,
                vitele0_3Luni: parseInt(form.vitele0_3Luni) || 0,
                taurasi: parseInt(form.taurasi) || 0,
                observatii: form.observatii || "",
                month: parseInt(form.month),
                year: parseInt(form.year),
                userId: 1
            };

            const response = await fetch("http://localhost:8080/api/centralizator/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage({ text: data.error || "Eroare la salvare", type: "error" });
                return;
            }

            setMessage({ text: "Înregistrare adăugată cu succes!", type: "success" });

            // Resetăm formularul păstrând tipul selectat
            setForm(prev => ({
                tipMagazieId: prev.tipMagazieId,
                stocInitial: "",
                intrari: "",
                vaciLapte: "",
                vaciGestante: "",
                juniciGestante: "",
                alteVaci: "",
                viteleMontate: "",
                junici: "",
                vitele6_12Luni: "",
                vitele3_6Luni: "",
                vitele0_3Luni: "",
                taurasi: "",
                observatii: "",
                month: prev.month,
                year: prev.year,
                userId: 1
            }));

        } catch (error) {
            setMessage({ text: "Eroare de conexiune", type: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingTipuri) {
        return <div className="loading">Se încarcă tipurile de furaje...</div>;
    }

    return (
        <div className="centralizator-page">
            <div className="page-header">
                <h1>Adăugare Centralizator Furaje</h1>
            </div>

            <form className="centralizator-form" onSubmit={handleSubmit}>
                {/* Secțiunea 1: Selecție tip și perioadă */}
                <div className="form-section">
                    <h3>📋 Tip furaj și perioadă</h3>

                    <div className="form-row">
                        <div className="form-group full-width">
                            <label>Tip furaj *</label>
                            <select
                                name="tipMagazieId"
                                value={form.tipMagazieId}
                                onChange={handleChange}
                                className={errors.tipMagazieId ? "error" : ""}
                            >
                                <option value="">Selectează tip furaj...</option>
                                {tipuri.map(tip => (
                                    <option key={tip.id} value={tip.id}>
                                        {tip.cod} - {tip.denumire} ({tip.unitateMasura})
                                    </option>
                                ))}
                            </select>
                            {errors.tipMagazieId && (
                                <span className="error-message">{errors.tipMagazieId}</span>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Luna *</label>
                            <select
                                name="month"
                                value={form.month}
                                onChange={handleChange}
                                className={errors.month ? "error" : ""}
                            >
                                <option value="">Selectează luna...</option>
                                {months.map((month, index) => (
                                    <option key={index} value={index + 1}>{month}</option>
                                ))}
                            </select>
                            {errors.month && <span className="error-message">{errors.month}</span>}
                        </div>

                        <div className="form-group">
                            <label>Anul *</label>
                            <select
                                name="year"
                                value={form.year}
                                onChange={handleChange}
                                className={errors.year ? "error" : ""}
                            >
                                <option value="">Selectează anul...</option>
                                {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                            {errors.year && <span className="error-message">{errors.year}</span>}
                        </div>

                        <div className="form-group">
                            <label>&nbsp;</label>
                            <button type="button" className="today-btn" onClick={setCurrentMonth}>
                                📅 Luna curentă
                            </button>
                        </div>
                    </div>

                    {validationMessage && (
                        <div className="validation-message">
                            ℹ️ {validationMessage}
                        </div>
                    )}
                </div>

                {/* Secțiunea 2: Stocuri */}
                <div className="form-section">
                    <h3>📊 Stocuri</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Stoc inițial {selectedTip && `(${selectedTip.unitateMasura})`}</label>
                            <input
                                type="number"
                                name="stocInitial"
                                value={form.stocInitial}
                                onChange={handleChange}
                                placeholder="0"
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Intrări {selectedTip && `(${selectedTip.unitateMasura})`}</label>
                            <input
                                type="number"
                                name="intrari"
                                value={form.intrari}
                                onChange={handleChange}
                                placeholder="0"
                                min="0"
                            />
                        </div>
                    </div>
                </div>

                {/* Secțiunea 3: Consum pe categorii */}
                <div className="form-section">
                    <h3>🐄 Consum pe categorii de animale</h3>
                    <div className="consum-grid">
                        <div className="form-group">
                            <label>Vaci de lapte</label>
                            <input
                                type="number"
                                name="vaciLapte"
                                value={form.vaciLapte}
                                onChange={handleChange}
                                placeholder="0"
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Vaci gestante</label>
                            <input
                                type="number"
                                name="vaciGestante"
                                value={form.vaciGestante}
                                onChange={handleChange}
                                placeholder="0"
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Junici gestante</label>
                            <input
                                type="number"
                                name="juniciGestante"
                                value={form.juniciGestante}
                                onChange={handleChange}
                                placeholder="0"
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Alte vaci</label>
                            <input
                                type="number"
                                name="alteVaci"
                                value={form.alteVaci}
                                onChange={handleChange}
                                placeholder="0"
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Vițele montate</label>
                            <input
                                type="number"
                                name="viteleMontate"
                                value={form.viteleMontate}
                                onChange={handleChange}
                                placeholder="0"
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Juninci (&gt;12 luni)</label>
                            <input
                                type="number"
                                name="junici"
                                value={form.junici}
                                onChange={handleChange}
                                placeholder="0"
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Viței 6-12 luni</label>
                            <input
                                type="number"
                                name="vitele6_12Luni"
                                value={form.vitele6_12Luni}
                                onChange={handleChange}
                                placeholder="0"
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Viței 3-6 luni</label>
                            <input
                                type="number"
                                name="vitele3_6Luni"
                                value={form.vitele3_6Luni}
                                onChange={handleChange}
                                placeholder="0"
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Viței 0-3 luni</label>
                            <input
                                type="number"
                                name="vitele0_3Luni"
                                value={form.vitele0_3Luni}
                                onChange={handleChange}
                                placeholder="0"
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Tăurași</label>
                            <input
                                type="number"
                                name="taurasi"
                                value={form.taurasi}
                                onChange={handleChange}
                                placeholder="0"
                                min="0"
                            />
                        </div>
                    </div>
                </div>

                {/* Secțiunea 4: Observații */}
                <div className="form-section">
                    <h3>📝 Observații</h3>
                    <div className="form-group">
                        <textarea
                            name="observatii"
                            value={form.observatii}
                            onChange={handleChange}
                            placeholder="Observații (opțional)"
                            rows="3"
                        />
                    </div>
                </div>

                {/* Totaluri calculate */}
                {selectedTip && (
                    <div className="totals-card">
                        <div className="total-item">
                            <span>Total consum:</span>
                            <strong>{calculateTotalConsum()} {selectedTip.unitateMasura}</strong>
                        </div>
                        <div className="total-item">
                            <span>Stoc final:</span>
                            <strong className={calculateStocFinal() < 0 ? "negative" : "positive"}>
                                {calculateStocFinal()} {selectedTip.unitateMasura}
                            </strong>
                        </div>
                    </div>
                )}

                <div className="form-actions">
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Se salvează..." : "Salvează înregistrare"}
                    </button>
                </div>

                {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}
            </form>
        </div>
    );
}