import { useState, useEffect } from "react";
import "./MagaziePages.css";

export default function VizualizareTipMagazie() {
    const [tipuri, setTipuri] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [message, setMessage] = useState({ text: "", type: "" });
    const userId = 1; // Temporar

    useEffect(() => {
        loadTipuri();
    }, []);

    const loadTipuri = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/tip-magazie/all?userId=${userId}`);
            const data = await response.json();
            setTipuri(data);
        } catch (error) {
            setMessage({ text: "Eroare la încărcare", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (tip) => {
        setEditingId(tip.id);
        setEditForm({
            cod: tip.cod,
            denumire: tip.denumire,
            unitateMasura: tip.unitateMasura
        });
    };

    const handleUpdate = async (id) => {
        try {
            const response = await fetch(
                `http://localhost:8080/api/tip-magazie/update/${id}?userId=${userId}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(editForm)
                }
            );

            if (!response.ok) {
                const data = await response.json();
                setMessage({ text: data.error || "Eroare la actualizare", type: "error" });
                return;
            }

            setMessage({ text: "Tip actualizat cu succes!", type: "success" });
            setEditingId(null);
            loadTipuri();
        } catch (error) {
            setMessage({ text: "Eroare de conexiune", type: "error" });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Ești sigur că vrei să ștergi acest tip?")) return;

        try {
            const response = await fetch(
                `http://localhost:8080/api/tip-magazie/delete/${id}?userId=${userId}`,
                { method: "DELETE" }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage({ text: data.error || "Eroare la ștergere", type: "error" });
                return;
            }

            setMessage({ text: "Tip șters cu succes!", type: "success" });
            loadTipuri();
        } catch (error) {
            setMessage({ text: "Eroare de conexiune", type: "error" });
        }
    };

    if (loading) return <div className="loading">Se încarcă...</div>;

    return (
        <div className="magazie-page">
            <div className="page-header">
                <h1>Vizualizare/Editare Tipuri Magazie</h1>
            </div>

            {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

            <div className="tipuri-grid">
                {tipuri.map(tip => (
                    <div key={tip.id} className="tip-card">
                        {editingId === tip.id ? (
                            <div className="edit-form">
                                <input
                                    type="text"
                                    value={editForm.cod}
                                    onChange={e => setEditForm({ ...editForm, cod: e.target.value })}
                                    placeholder="Cod"
                                />
                                <input
                                    type="text"
                                    value={editForm.denumire}
                                    onChange={e => setEditForm({ ...editForm, denumire: e.target.value })}
                                    placeholder="Denumire"
                                />
                                <select
                                    value={editForm.unitateMasura}
                                    onChange={e => setEditForm({ ...editForm, unitateMasura: e.target.value })}
                                >
                                    <option value="kg">kg</option>
                                    <option value="litri">litri</option>
                                    <option value="bucati">bucati</option>
                                </select>
                                <div className="edit-actions">
                                    <button onClick={() => handleUpdate(tip.id)}>Salvează</button>
                                    <button onClick={() => setEditingId(null)}>Anulează</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="tip-header">
                                    <span className="tip-cod">{tip.cod}</span>
                                    <span className="tip-unitate">{tip.unitateMasura}</span>
                                </div>
                                <div className="tip-denumire">{tip.denumire}</div>
                                <div className="tip-actions">
                                    <button className="edit-btn" onClick={() => handleEdit(tip)}>✏️ Edit</button>
                                    <button className="delete-btn" onClick={() => handleDelete(tip.id)}>🗑️ Șterge</button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}