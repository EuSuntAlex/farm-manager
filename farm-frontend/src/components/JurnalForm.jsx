import { useState } from "react";
import "./JurnalForm.css";

export default function JurnalForm() {
  const [form, setForm] = useState({
    nrAnimale: "",
    mulsoare1: "",
    mulsoare2: "",
    valoarePredata: "",
    destinatar: "",
    lapteVitei: "",
    vanzareExterna: "",
    vanzareExternaDestinatar: "",
    day: "",
    month: "",
    year: "",
    userId: ""
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Funcție pentru a completa cu data de azi
  const setToday = () => {
    const today = new Date();
    setForm(prev => ({
      ...prev,
      day: today.getDate().toString(),
      month: (today.getMonth() + 1).toString(), // getMonth() returnează 0-11
      year: today.getFullYear().toString()
    }));

    // Ștergem eventualele erori pentru aceste câmpuri
    setErrors(prev => ({
      ...prev,
      day: null,
      month: null,
      year: null
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Șterge eroarea pentru câmpul curent când utilizatorul începe să scrie
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validări simple
    if (!form.day || form.day <= 0 || form.day > 31) {
      newErrors.day = "Ziua trebuie să fie între 1-31";
    }
    if (!form.month || form.month <= 0 || form.month > 12) {
      newErrors.month = "Luna trebuie să fie între 1-12";
    }
    if (!form.year || form.year < 2000 || form.year > 2100) {
      newErrors.year = "Anul trebuie să fie între 2000-2100";
    }
    if (!form.userId) {
      newErrors.userId = "ID-ul utilizatorului este obligatoriu";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage({ text: "", type: "" });

    // Validare înainte de submit
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setMessage({
        text: "Te rugăm să corectezi erorile din formular",
        type: "error"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Convertim câmpurile numerice la numere
      const payload = {
        ...form,
        nrAnimale: Number(form.nrAnimale) || 0,
        mulsoare1: Number(form.mulsoare1) || 0,
        mulsoare2: Number(form.mulsoare2) || 0,
        valoarePredata: Number(form.valoarePredata) || 0,
        lapteVitei: Number(form.lapteVitei) || 0,
        vanzareExterna: Number(form.vanzareExterna) || 0,
        day: Number(form.day),
        month: Number(form.month),
        year: Number(form.year),
        userId: Number(form.userId)
      };

      const response = await fetch("http://localhost:8080/api/jurnal/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors(data);
        setMessage({
          text: data.error || "A apărut o eroare la salvare",
          type: "error"
        });
        return;
      }

      setMessage({ text: "Jurnal adăugat cu succes!", type: "success" });

      // Resetăm formularul
      setForm({
        nrAnimale: "",
        mulsoare1: "",
        mulsoare2: "",
        valoarePredata: "",
        destinatar: "",
        lapteVitei: "",
        vanzareExterna: "",
        vanzareExternaDestinatar: "",
        day: "",
        month: "",
        year: "",
        userId: ""
      });

    } catch (err) {
      setMessage({
        text: "Eroare de conexiune la server",
        type: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Grupăm câmpurile pe secțiuni
  const dateFields = ["day", "month", "year", "userId"];
  const lapteFields = ["nrAnimale", "mulsoare1", "mulsoare2", "lapteVitei"];
  const vanzareFields = ["valoarePredata", "destinatar", "vanzareExterna", "vanzareExternaDestinatar"];

  const getFieldLabel = (field) => {
    const labels = {
      nrAnimale: "Număr animale",
      mulsoare1: "Mulsoare 1",
      mulsoare2: "Mulsoare 2",
      valoarePredata: "Valoare predată",
      destinatar: "Destinatar",
      lapteVitei: "Lapte viței",
      vanzareExterna: "Vânzare externă",
      vanzareExternaDestinatar: "Destinatar vânzare externă",
      day: "Zi",
      month: "Lună",
      year: "An",
      userId: "ID Utilizator"
    };
    return labels[field] || field;
  };

  const getFieldType = (field) => {
    const textFields = ["destinatar", "vanzareExternaDestinatar"];
    return textFields.includes(field) ? "text" : "number";
  };

  const getFieldPlaceholder = (field) => {
    if (field === "day") return "ex: 15";
    if (field === "month") return "ex: 3";
    if (field === "year") return "ex: 2024";
    if (field === "userId") return "ID-ul tău";
    if (field === "destinatar") return "Nume destinatar";
    if (field === "vanzareExternaDestinatar") return "Nume destinatar extern";
    return "0";
  };

  return (
    <div className="jurnal-form-container">
      <form className="jurnal-form" onSubmit={handleSubmit}>
        <div className="form-header">
          <h2>Adăugare Înregistrare Jurnal</h2>
          <p>Completează datele pentru o nouă înregistrare</p>
        </div>

        <div className="form-sections">
          {/* Secțiunea 1: Date de bază */}
          <div className="form-section">
            <div className="section-header">
              <h3 className="section-title">📅 Dată și Identificare</h3>
              <button
                type="button"
                className="today-button"
                onClick={setToday}
                title="Completează cu data de azi"
              >
                📅 Astăzi
              </button>
            </div>
            <div className="fields-grid">
              {dateFields.map((key) => (
                <div className="field-group" key={key}>
                  <label htmlFor={key}>{getFieldLabel(key)}</label>
                  <input
                    id={key}
                    type={getFieldType(key)}
                    name={key}
                    value={form[key]}
                    onChange={handleChange}
                    placeholder={getFieldPlaceholder(key)}
                    className={errors[key] ? "error" : ""}
                    min={
                      key === "day" ? 1 :
                        key === "month" ? 1 :
                          key === "year" ? 2000 :
                            undefined
                    }
                    max={
                      key === "day" ? 31 :
                        key === "month" ? 12 :
                          key === "year" ? 2100 :
                            undefined
                    }
                  />
                  {errors[key] && <span className="error-message">{errors[key]}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Secțiunea 2: Producție lapte */}
          <div className="form-section">
            <h3 className="section-title">🥛 Producție Lapte</h3>
            <div className="fields-grid">
              {lapteFields.map((key) => (
                <div className="field-group" key={key}>
                  <label htmlFor={key}>{getFieldLabel(key)}</label>
                  <input
                    id={key}
                    type="number"
                    name={key}
                    value={form[key]}
                    onChange={handleChange}
                    placeholder={getFieldPlaceholder(key)}
                    min="0"
                    step="0.01"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Secțiunea 3: Vânzări */}
          <div className="form-section">
            <h3 className="section-title">💰 Vânzări și Destinatari</h3>
            <div className="fields-grid">
              {vanzareFields.map((key) => (
                <div className="field-group" key={key}>
                  <label htmlFor={key}>{getFieldLabel(key)}</label>
                  <input
                    id={key}
                    type={getFieldType(key)}
                    name={key}
                    value={form[key]}
                    onChange={handleChange}
                    placeholder={getFieldPlaceholder(key)}
                    min={getFieldType(key) === "number" ? "0" : undefined}
                    step={getFieldType(key) === "number" ? "0.01" : undefined}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={isSubmitting}
            className={isSubmitting ? "submitting" : ""}
          >
            {isSubmitting ? "Se salvează..." : "Salvează înregistrarea"}
          </button>
        </div>

        {message.text && (
          <div className={`form-message ${message.type}`}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}