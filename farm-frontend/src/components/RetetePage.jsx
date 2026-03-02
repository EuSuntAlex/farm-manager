import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RetetaFormModal from './RetetaFormModal';
import './RetetePage.css';

const API_URL = 'http://localhost:8080/api';

const RetetePage = ({ initialShowForm = false }) => {
    const [retete, setRetete] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(initialShowForm);
    const [editMode, setEditMode] = useState(false);
    const [currentReteta, setCurrentReteta] = useState(null);
    const [selectedReteta, setSelectedReteta] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        fetchRetete();
    }, []);

    const fetchRetete = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/retete/all?userId=1`);
            setRetete(response.data);
            setError(null);
        } catch (err) {
            setError('Eroare la încărcarea rețetelor');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (reteta) => {
        setCurrentReteta(reteta);
        setEditMode(true);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Sigur vrei să ștergi această rețetă?')) {
            return;
        }

        try {
            await axios.delete(`${API_URL}/retete/delete/${id}?userId=1`);
            fetchRetete();
        } catch (err) {
            alert('Eroare la ștergere!');
            console.error(err);
        }
    };

    const handleViewDetails = (reteta) => {
        setSelectedReteta(reteta);
        setShowDetails(true);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: 'RON',
            minimumFractionDigits: 2
        }).format(price);
    };

    if (loading) return <div className="loading">Se încarcă...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Rețete</h1>
                <button
                    className="btn-primary"
                    onClick={() => {
                        setEditMode(false);
                        setCurrentReteta(null);
                        setShowForm(!showForm);
                    }}
                >
                    {showForm ? 'Anulează' : '+ Adaugă Rețetă'}
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* Formular pentru adăugare/editare rețetă */}
            {showForm && (
                <RetetaFormModal
                    editMode={editMode}
                    currentReteta={currentReteta}
                    onClose={() => {
                        setShowForm(false);
                        setEditMode(false);
                        setCurrentReteta(null);
                    }}
                    onSave={fetchRetete}
                />
            )}

            {/* Modal pentru detalii rețetă */}
            {showDetails && selectedReteta && (
                <div className="modal-overlay" onClick={() => setShowDetails(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2>{selectedReteta.nume}</h2>
                        <p className="reteta-descriere">{selectedReteta.descriere}</p>

                        <h3>Ingrediente:</h3>
                        <table className="ingrediente-table">
                            <thead>
                                <tr>
                                    <th>Ingredient</th>
                                    <th>Cantitate</th>
                                    <th>UM</th>
                                    <th>Preț/UM</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedReteta.ingrediente?.map((ing, index) => (
                                    <tr key={index}>
                                        <td>{ing.numeIngredient}</td>
                                        <td>{ing.cantitate}</td>
                                        <td>{ing.unitateMasura}</td>
                                        <td>{formatPrice(ing.pretPerUnitate)}</td>
                                        <td>{formatPrice(ing.pretTotal)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                        Cost Total:
                                    </td>
                                    <td style={{ fontWeight: 'bold', color: '#4CAF50' }}>
                                        {formatPrice(selectedReteta.costTotal)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>

                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowDetails(false)}>
                                Închide
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabel rețete */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nume Rețetă</th>
                            <th>Descriere</th>
                            <th>Nr. Ingrediente</th>
                            <th>Cost Total</th>
                            <th>Data Creare</th>
                            <th>Acțiuni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {retete.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="no-data">
                                    Nu există rețete. Adaugă prima rețetă!
                                </td>
                            </tr>
                        ) : (
                            retete.map((reteta) => (
                                <tr key={reteta.id}>
                                    <td>{reteta.id}</td>
                                    <td>{reteta.nume}</td>
                                    <td>{reteta.descriere || '-'}</td>
                                    <td>{reteta.ingrediente?.length || 0}</td>
                                    <td>{formatPrice(reteta.costTotal || 0)}</td>
                                    <td>{new Date(reteta.dataCreare).toLocaleDateString('ro-RO')}</td>
                                    <td className="actions">
                                        <button
                                            className="btn-view"
                                            onClick={() => handleViewDetails(reteta)}
                                        >
                                            👁️ Detalii
                                        </button>
                                        <button
                                            className="btn-edit"
                                            onClick={() => handleEdit(reteta)}
                                        >
                                            Editează
                                        </button>
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDelete(reteta.id)}
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

export default RetetePage;