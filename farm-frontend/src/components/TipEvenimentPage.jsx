import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TipEvenimentPage.css';

const API_URL = 'http://localhost:8080/api';

const TipEvenimentPage = () => {
    const [tipuri, setTipuri] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentTip, setCurrentTip] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        nume: '',
        duration: '',
        userId: 1
    });

    useEffect(() => {
        fetchTipuri();
    }, []);

    const fetchTipuri = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/tip-eveniment/all?userId=1`);
            setTipuri(response.data);
            setError(null);
        } catch (err) {
            setError('Eroare la încărcarea tipurilor de evenimente');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'duration' ? parseInt(value) || '' : value
        });
    };

    const resetForm = () => {
        setFormData({
            nume: '',
            duration: '',
            userId: 1
        });
        setEditMode(false);
        setCurrentTip(null);
        setShowAddForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Convertește duration la număr (0 pentru string gol)
            const durationValue = formData.duration === '' ? 0 : parseFloat(formData.duration);

            const dataToSend = {
                ...formData,
                duration: durationValue
            };

            if (editMode && currentTip) {
                // UPDATE
                await axios.put(
                    `${API_URL}/tip-eveniment/update/${currentTip.id}?userId=1`,
                    {
                        nume: formData.nume,
                        duration: durationValue
                    }
                );
            } else {
                // CREATE
                await axios.post(`${API_URL}/tip-eveniment/add`, dataToSend);
            }

            fetchTipuri();
            resetForm();
        } catch (err) {
            if (err.response?.status === 409) {
                alert('Există deja un tip cu acest nume!');
            } else {
                alert('Eroare la salvare!');
            }
            console.error(err);
        }
    };;

    const handleEdit = (tip) => {
        setFormData({
            nume: tip.nume,
            duration: tip.duration,
            userId: tip.userId
        });
        setEditMode(true);
        setCurrentTip(tip);
        setShowAddForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Sigur vrei să ștergi acest tip de eveniment?')) {
            return;
        }

        try {
            await axios.delete(`${API_URL}/tip-eveniment/delete/${id}?userId=1`);
            fetchTipuri();
        } catch (err) {
            if (err.response?.status === 409) {
                alert('Nu poți șterge acest tip pentru că există evenimente asociate!');
            } else {
                alert('Eroare la ștergere!');
            }
            console.error(err);
        }
    };

    // Funcție specială pentru a permite "0" la început
    const handleDurationChange = (e) => {
        const { value } = e.target;

        // Permite șir gol, "0", "0.5", numere
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setFormData({
                ...formData,
                duration: value
            });
        }
    };

    const handleInitializeDefault = async () => {
        if (!window.confirm('Această operațiune va adăuga tipurile implicite (dacă nu există deja). Continui?')) {
            return;
        }

        try {
            await axios.post(`${API_URL}/tip-eveniment/initializeaza-implicite?userId=1`);
            fetchTipuri();
            alert('Tipurile implicite au fost adăugate cu succes!');
        } catch (err) {
            alert('Eroare la inițializare!');
            console.error(err);
        }
    };

    if (loading) return <div className="loading">Se încarcă...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Tipuri de Evenimente</h1>
                <div className="header-actions">
                    <button
                        className="btn-primary"
                        onClick={() => setShowAddForm(!showAddForm)}
                    >
                        {showAddForm ? 'Anulează' : '+ Adaugă Tip Nou'}
                    </button>
                    <button
                        className="btn-secondary"
                        onClick={handleInitializeDefault}
                    >
                        Inițializează Tipuri Implicite
                    </button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {showAddForm && (
                <div className="form-container">
                    <h2>{editMode ? 'Editează Tip' : 'Adaugă Tip Nou'}</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Nume Eveniment:</label>
                            <input
                                type="text"
                                name="nume"
                                value={formData.nume}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        {/* În locul input-ului de tip number, folosește input text */}
                        <div className="form-group">
                            <label>Durată (zile):</label>
                            <input
                                type="text"
                                name="duration"
                                value={formData.duration}
                                onChange={handleDurationChange}
                                placeholder="0 = eveniment instant"
                                className="form-control"
                            />
                            <small>0 = eveniment punctual (se termină în aceeași zi)</small>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-success">
                                {editMode ? 'Actualizează' : 'Salvează'}
                            </button>
                            <button type="button" className="btn-secondary" onClick={resetForm}>
                                Reset
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nume Eveniment</th>
                            <th>Durată (zile)</th>
                            <th>Acțiuni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tipuri.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="no-data">
                                    Nu există tipuri de evenimente. Adaugă primul tip!
                                </td>
                            </tr>
                        ) : (
                            tipuri.map((tip) => (
                                <tr key={tip.id}>
                                    <td>{tip.id}</td>
                                    <td>{tip.nume}</td>
                                    <td>
                                        {tip.duration === 0 ? 'Punctual' : `${tip.duration} zile`}
                                    </td>
                                    <td className="actions">
                                        <button
                                            className="btn-edit"
                                            onClick={() => handleEdit(tip)}
                                        >
                                            Editează
                                        </button>
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDelete(tip.id)}
                                        >
                                            Șterge
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TipEvenimentPage;