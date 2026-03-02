import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RasePage.css';

const API_URL = 'http://localhost:8080/api';

const RasePage = ({ initialShowForm = false }) => {
    const [rase, setRase] = useState([]);
    const [retete, setRetete] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(initialShowForm);
    const [editMode, setEditMode] = useState(false);
    const [currentRasa, setCurrentRasa] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        defaultRetetaId: '',
        userId: 1
    });

    useEffect(() => {
        fetchRase();
        fetchRetete();
    }, []);

    const fetchRase = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/tip-bovina/all?userId=1`);
            setRase(response.data);
            setError(null);
        } catch (err) {
            setError('Eroare la încărcarea raselor');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRetete = async () => {
        try {
            const response = await axios.get(`${API_URL}/retete/all?userId=1`);
            setRetete(response.data);
        } catch (err) {
            console.error('Eroare la încărcarea rețetelor:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const resetForm = () => {
        setFormData({
            name: '',
            defaultRetetaId: '',
            userId: 1
        });
        setEditMode(false);
        setCurrentRasa(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode && currentRasa) {
                // UPDATE
                await axios.put(
                    `${API_URL}/tip-bovina/update/${currentRasa.id}?userId=1`,
                    {
                        name: formData.name,
                        defaultRetetaId: formData.defaultRetetaId || null
                    }
                );
            } else {
                // CREATE
                await axios.post(`${API_URL}/tip-bovina/add`, formData);
            }

            fetchRase();
            resetForm();
        } catch (err) {
            if (err.response?.status === 409) {
                alert('Există deja o rasă cu acest nume!');
            } else {
                alert('Eroare la salvare!');
            }
            console.error(err);
        }
    };

    const handleEdit = (rasa) => {
        setFormData({
            name: rasa.name,
            defaultRetetaId: rasa.defaultRetetaId || '',
            userId: rasa.userId
        });
        setEditMode(true);
        setCurrentRasa(rasa);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Sigur vrei să ștergi această rasă?')) {
            return;
        }

        try {
            await axios.delete(`${API_URL}/tip-bovina/delete/${id}?userId=1`);
            fetchRase();
        } catch (err) {
            if (err.response?.status === 409) {
                alert('Nu poți șterge această rasă pentru că există bovine înregistrate cu această rasă!');
            } else {
                alert('Eroare la ștergere!');
            }
            console.error(err);
        }
    };

    const getRetetaNume = (id) => {
        if (!id) return 'Fără rețetă default';
        const reteta = retete.find(r => r.id === id);
        return reteta ? reteta.nume : 'Rețetă inexistentă';
    };

    if (loading) return <div className="loading">Se încarcă...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Rase de Bovine</h1>
                <button
                    className="btn-primary"
                    onClick={() => {
                        setEditMode(false);
                        setCurrentRasa(null);
                        setShowForm(!showForm);
                    }}
                >
                    {showForm ? 'Anulează' : '+ Adăugare Rasă'}
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {showForm && (
                <div className="form-container">
                    <h2>{editMode ? 'Editare Rasă' : 'Adăugare Rasă Nouă'}</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Nume Rasă:</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Rețetă Default (opțional):</label>
                            <select
                                name="defaultRetetaId"
                                value={formData.defaultRetetaId}
                                onChange={handleInputChange}
                            >
                                <option value="">Fără rețetă default</option>
                                {retete.map(reteta => (
                                    <option key={reteta.id} value={reteta.id}>
                                        {reteta.nume}
                                    </option>
                                ))}
                            </select>
                            <small>Această rețetă va fi asignată automat la bovinele noi din această rasă</small>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-success">
                                {editMode ? 'Actualizează' : 'Salvează'}
                            </button>
                            <button type="button" className="btn-secondary" onClick={resetForm}>
                                Anulează
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
                            <th>Nume Rasă</th>
                            <th>Rețetă Default</th>
                            <th>Acțiuni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rase.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="no-data">
                                    Nu există rase. Adaugă prima rasă!
                                </td>
                            </tr>
                        ) : (
                            rase.map((rasa) => (
                                <tr key={rasa.id}>
                                    <td>{rasa.id}</td>
                                    <td>{rasa.name}</td>
                                    <td>{getRetetaNume(rasa.defaultRetetaId)}</td>
                                    <td className="actions">
                                        <button
                                            className="btn-edit"
                                            onClick={() => handleEdit(rasa)}
                                        >
                                            Editează
                                        </button>
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDelete(rasa.id)}
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

export default RasePage;