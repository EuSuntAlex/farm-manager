import { useState } from "react";
import "./MagaziePages.css";

export default function AdaugareTipMagazie() {
    const [form, setForm] = useState({
        cod: "",
        denumire: "",
        unitateMasura: "kg",
        userId: 1 // Temporar, ideal ar veni din context/auth
    });

    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState({ text: "", type: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const unitatiMasura = ["kg", "litri", "bucati", "metri", "sac", "bax"];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!form.cod.trim()) {
            newErrors.cod = "Codul este obligatoriu";
        } else if (!/^[A-Z0-9_]+$/.test(form.cod)) {
            newErrors.cod = "Codul poate conține doar litere mari, cifre și underscore";
        }
        if (!form.denumire.trim()) {
            newErrors.denumire = "Denumirea este obligatorie";
        }
        if (!form.unitateMasura) {
            newErrors.unitateMasura = "Unitatea de măsură este obligatorie";
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
            const response = await fetch("http://localhost:8080/api/tip-magazie/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage({ text: data.error || "Eroare la salvare", type: "error" });
                return;
            }

            setMessage({ text: "Tip magazie adăugat cu succes!", type: "success" });
            setForm({ cod: "", denumire: "", unitateMasura: "kg", userId: 1 });
        } catch (err) {
            setMessage({ text: "Eroare de conexiune", type: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="magazie-page">
            <div className="page-header">
                <h1>Adăugare Tip Magazie</h1>
            </div>

            <form className="magazie-form" onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Cod *</label>
                        <input
                            type="text"
                            name="cod"
                            value={form.cod}
                            onChange={handleChange}
                            placeholder="ex: FURAJE, LAPTE, UTILAJE"
                            className={errors.cod ? "error" : ""}
                        />
                        {errors.cod && <span className="error-message">{errors.cod}</span>}
                    </div>

                    <div className="form-group">
                        <label>Denumire *</label>
                        <input
                            type="text"
                            name="denumire"
                            value={form.denumire}
                            onChange={handleChange}
                            placeholder="ex: Furaje, Lapte, Utilaje"
                            className={errors.denumire ? "error" : ""}
                        />
                        {errors.denumire && <span className="error-message">{errors.denumire}</span>}
                    </div>

                    <div className="form-group">
                        <label>Unitate de măsură *</label>
                        <select
                            name="unitateMasura"
                            value={form.unitateMasura}
                            onChange={handleChange}
                            className={errors.unitateMasura ? "error" : ""}
                        >
                            {unitatiMasura.map(u => (
                                <option key={u} value={u}>{u}</option>
                            ))}
                        </select>
                        {errors.unitateMasura && <span className="error-message">{errors.unitateMasura}</span>}
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Se salvează..." : "Salvează tip magazie"}
                    </button>
                </div>

                {message.text && (
                    <div className={`message ${message.type}`}>{message.text}</div>
                )}
            </form>
        </div>
    );
}