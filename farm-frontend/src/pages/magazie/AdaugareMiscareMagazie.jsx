import { useState, useEffect } from "react";
import "./MagaziePages.css";

export default function AdaugareMiscareMagazie() {
    const [tipuri, setTipuri] = useState([]);
    const [loadingTipuri, setLoadingTipuri] = useState(true);
    const [stocCurent, setStocCurent] = useState(null);
    const [form, setForm] = useState({
        tipMagazieId: "",
        furnizor: "",
        day: "",
        month: "",
        year: "",
        intrari: "",
        iesiri: "",
        userId: 1
    });

    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState({ text: "", type: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadTipuri();
    }, []);

    useEffect(() => {
        if (form.tipMagazieId) {
            loadStocCurent();
        }
    }, [form.tipMagazieId]);

    const loadTipuri = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/tip-magazie/all?userId=1`);
            const data = await response.json();
            setTipuri(data);
        } catch (error) {
            setMessage({ text: "Eroare la încărcarea tipurilor", type: "error" });
        } finally {
            setLoadingTipuri(false);
        }
    };

    const loadStocCurent = async () => {
        try {
            const response = await fetch(
                `http://localhost:8080/api/magazie-miscari/stoc-curent?userId=1&tipMagazieId=${form.tipMagazieId}`
            );
            const data = await response.json();
            setStocCurent(data);
        } catch (error) {
            console.error("Eroare la încărcare stoc");
        }
    };

    const setToday = () => {
        const today = new Date();
        setForm(prev => ({
            ...prev,
            day: today.getDate().toString(),
            month: (today.getMonth() + 1).toString(),
            year: today.getFullYear().toString()
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!form.tipMagazieId) newErrors.tipMagazieId = "Selectează un tip";
        if (!form.day || form.day < 1 || form.day > 31) newErrors.day = "Zi invalidă";
        if (!form.month || form.month < 1 || form.month > 12) newErrors.month = "Lună invalidă";
        if (!form.year || form.year < 2000) newErrors.year = "An invalid";

        const intrari = parseFloat(form.intrari) || 0;
        const iesiri = parseFloat(form.iesiri) || 0;

        if (intrari === 0 && iesiri === 0) {
            newErrors.general = "Completează cel puțin o intrare sau o ieșire";
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                ...form,
                tipMagazieId: parseInt(form.tipMagazieId),
                day: parseInt(form.day),
                month: parseInt(form.month),
                year: parseInt(form.year),
                intrari: parseFloat(form.intrari) || 0,
                iesiri: parseFloat(form.iesiri) || 0
            };

            const response = await fetch("http://localhost:8080/api/magazie-miscari/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage({ text: data.error || "Eroare la salvare", type: "error" });
                return;
            }

            setMessage({ text: "Mișcare adăugată cu succes!", type: "success" });
            setForm(prev => ({
                ...prev,
                furnizor: "",
                intrari: "",
                iesiri: ""
            }));
            loadStocCurent();
        } catch (err) {
            setMessage({ text: "Eroare de conexiune", type: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingTipuri) return <div className="loading">Se încarcă tipurile...</div>;

    return (
        <div className="magazie-page">
            <div className="page-header">
                <h1>Adăugare Mișcare Magazie</h1>
            </div>

            {stocCurent && (
                <div className="stoc-curent-card">
                    <h3>Stoc curent: <strong>{stocCurent.stocCurent}</strong></h3>
                    <p>Ultima actualizare: {stocCurent.ultimaActualizare}</p>
                </div>
            )}

            <form className="magazie-form" onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group full-width">
                        <label>Tip Magazie *</label>
                        <select
                            name="tipMagazieId"
                            value={form.tipMagazieId}
                            onChange={handleChange}
                            className={errors.tipMagazieId ? "error" : ""}
                        >
                            <option value="">Selectează tip...</option>
                            {tipuri.map(tip => (
                                <option key={tip.id} value={tip.id}>
                                    {tip.cod} - {tip.denumire} ({tip.unitateMasura})
                                </option>
                            ))}
                        </select>
                        {errors.tipMagazieId && <span className="error-message">{errors.tipMagazieId}</span>}
                    </div>

                    <div className="form-group">
                        <label>Furnizor/Destinatar</label>
                        <input
                            type="text"
                            name="furnizor"
                            value={form.furnizor}
                            onChange={handleChange}
                            placeholder="ex: Ferma X, Client Y"
                        />
                    </div>

                    <div className="form-group date-group">
                        <div className="date-header">
                            <label>Data *</label>
                            <button type="button" className="today-btn" onClick={setToday}>
                                📅 Azi
                            </button>
                        </div>
                        <div className="date-inputs">
                            <input
                                type="number"
                                name="day"
                                value={form.day}
                                onChange={handleChange}
                                placeholder="Zi"
                                min="1"
                                max="31"
                            />
                            <input
                                type="number"
                                name="month"
                                value={form.month}
                                onChange={handleChange}
                                placeholder="Lună"
                                min="1"
                                max="12"
                            />
                            <input
                                type="number"
                                name="year"
                                value={form.year}
                                onChange={handleChange}
                                placeholder="An"
                                min="2000"
                            />
                        </div>
                        {(errors.day || errors.month || errors.year) && (
                            <span className="error-message">Completează data corect</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Intrări</label>
                        <input
                            type="number"
                            name="intrari"
                            value={form.intrari}
                            onChange={handleChange}
                            placeholder="0"
                            min="0"
                            step="0.01"
                        />
                    </div>

                    <div className="form-group">
                        <label>Ieșiri</label>
                        <input
                            type="number"
                            name="iesiri"
                            value={form.iesiri}
                            onChange={handleChange}
                            placeholder="0"
                            min="0"
                            step="0.01"
                        />
                    </div>
                </div>

                {errors.general && <div className="error-message general">{errors.general}</div>}

                <div className="form-actions">
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Se salvează..." : "Adaugă mișcare"}
                    </button>
                </div>

                {message.text && (
                    <div className={`message ${message.type}`}>{message.text}</div>
                )}
            </form>
        </div>
    );
}