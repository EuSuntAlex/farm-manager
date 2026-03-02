import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BovineTable from './BovineTable';
import BovineForm from './BovineForm';
import BovineDetailsModal from './BovineDetailsModal';
import BovineEventsModal from './BovineEventsModal';
import BovineWeightModal from './BovineWeightModal';
import BovineWeightChart from './BovineWeightChart';
import './BovinePage.css';

const API_URL = 'http://localhost:8080/api';

const BovinePage = ({ initialShowForm = false }) => {
    const [bovine, setBovine] = useState([]);
    const [rase, setRase] = useState([]);
    const [retete, setRetete] = useState([]);
    const [evenimente, setEvenimente] = useState([]);
    const [greutateIstoric, setGreutateIstoric] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(initialShowForm);
    const [editMode, setEditMode] = useState(false);
    const [currentBovina, setCurrentBovina] = useState(null);
    const [selectedBovina, setSelectedBovina] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [showEvents, setShowEvents] = useState(false);
    const [showWeightHistory, setShowWeightHistory] = useState(false);
    const [showWeightChart, setShowWeightChart] = useState(false);
    const [showOnlyObserved, setShowOnlyObserved] = useState(false);

    useEffect(() => {
        fetchBovine();
        fetchRase();
        fetchRetete();
    }, []);

    const fetchBovine = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/bovine/all?userId=1`);
            setBovine(response.data);
            setError(null);
        } catch (err) {
            setError('Eroare la încărcarea bovinelor');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRase = async () => {
        try {
            const response = await axios.get(`${API_URL}/tip-bovina/all?userId=1`);
            setRase(response.data);
        } catch (err) {
            console.error('Eroare la încărcarea raselor:', err);
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

    const fetchEvenimenteBovina = async (bovinaId) => {
        try {
            const response = await axios.get(`${API_URL}/eveniment/by-bovine/${bovinaId}?userId=1`);
            setEvenimente(response.data);
        } catch (err) {
            console.error('Eroare la încărcarea evenimentelor:', err);
        }
    };

    const fetchGreutateIstoric = async (bovinaId) => {
        try {
            const response = await axios.get(`${API_URL}/bovine/greutate/istoric/${bovinaId}?userId=1`);
            setGreutateIstoric(response.data);
        } catch (err) {
            console.error('Eroare la încărcarea istoricului greutate:', err);
        }
    };

    const handleEdit = (bovina) => {
        setCurrentBovina(bovina);
        setEditMode(true);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Sigur vrei să ștergi această bovină?')) {
            return;
        }

        try {
            await axios.delete(`${API_URL}/bovine/delete/${id}?userId=1`);
            fetchBovine();
        } catch (err) {
            alert('Eroare la ștergere!');
            console.error(err);
        }
    };

    const handleViewDetails = (bovina) => {
        setSelectedBovina(bovina);
        fetchEvenimenteBovina(bovina.id);
        setShowDetails(true);
    };

    const handleViewEvents = (bovina) => {
        setSelectedBovina(bovina);
        fetchEvenimenteBovina(bovina.id);
        setShowEvents(true);
    };

    const handleViewWeightHistory = (bovina) => {
        setSelectedBovina(bovina);
        fetchGreutateIstoric(bovina.id);
        setShowWeightHistory(true);
        setShowWeightChart(false);
    };

    const handleViewWeightChart = (bovina) => {
        setSelectedBovina(bovina);
        fetchGreutateIstoric(bovina.id);
        setShowWeightChart(true);
    };

    const handleAddEvent = (bovina) => {
        window.location.href = `/evenimente?bovinaId=${bovina.id}&add=true`;
    };

    const handleAddWeight = async (weightData) => {
        try {
            await axios.post(`${API_URL}/bovine/greutate/add`, weightData);
            fetchGreutateIstoric(selectedBovina.id);
            fetchBovine();
        } catch (err) {
            alert('Eroare la salvarea greutății!');
            console.error(err);
        }
    };

    const handleDeleteWeight = async (masuratoareId) => {
        if (!window.confirm('Sigur vrei să ștergi această măsurătoare?')) {
            return;
        }

        try {
            await axios.delete(
                `${API_URL}/bovine/greutate/delete/${masuratoareId}?bovinaId=${selectedBovina.id}&userId=1`
            );
            fetchGreutateIstoric(selectedBovina.id);
            fetchBovine();
        } catch (err) {
            alert('Eroare la ștergere!');
            console.error(err);
        }
    };

    const handleFormSubmit = async (formData, isEdit, id) => {
        try {
            if (isEdit) {
                await axios.put(`${API_URL}/bovine/update/${id}?userId=1`, formData);
            } else {
                await axios.post(`${API_URL}/bovine/add`, formData);
            }
            fetchBovine();
            setShowForm(false);
            setEditMode(false);
            setCurrentBovina(null);
        } catch (err) {
            alert('Eroare la salvare!');
            console.error(err);
        }
    };

    const getRasaNume = (id) => {
        const rasa = rase.find(r => r.id === id);
        return rasa ? rasa.name : 'Necunoscută';
    };

    const getRetetaNume = (id) => {
        if (!id) return 'Fără rețetă';
        const reteta = retete.find(r => r.id === id);
        return reteta ? reteta.nume : 'Necunoscută';
    };

    const getFilteredBovine = () => {
        if (showOnlyObserved) {
            return bovine.filter(b => b.isObserved);
        }
        return bovine;
    };

    if (loading) return <div className="loading">Se încarcă...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Bovine</h1>
                <button
                    className="btn-primary"
                    onClick={() => {
                        setEditMode(false);
                        setCurrentBovina(null);
                        setShowForm(!showForm);
                    }}
                >
                    {showForm ? 'Anulează' : '+ Adăugare Bovină'}
                </button>
            </div>

            {/* Filtre */}
            {!showForm && (
                <div className="filters-section">
                    <button
                        className={`filter-btn ${showOnlyObserved ? 'active' : ''}`}
                        onClick={() => setShowOnlyObserved(!showOnlyObserved)}
                    >
                        {showOnlyObserved ? '🔴 Arată toate bovinele' : '👁️ Arată doar bovine cu observații'}
                    </button>
                </div>
            )}

            {error && <div className="error-message">{error}</div>}

            {/* Formular */}
            {showForm && (
                <BovineForm
                    editMode={editMode}
                    currentBovina={currentBovina}
                    rase={rase}
                    retete={retete}
                    onSubmit={handleFormSubmit}
                    onCancel={() => {
                        setShowForm(false);
                        setEditMode(false);
                        setCurrentBovina(null);
                    }}
                />
            )}

            {/* Modaluri */}
            {showDetails && selectedBovina && (
                <BovineDetailsModal
                    bovina={selectedBovina}
                    rase={rase}
                    retete={retete}
                    onClose={() => setShowDetails(false)}
                />
            )}

            {showEvents && selectedBovina && (
                <BovineEventsModal
                    bovina={selectedBovina}
                    evenimente={evenimente}
                    onClose={() => setShowEvents(false)}
                />
            )}

            {showWeightHistory && selectedBovina && (
                <BovineWeightModal
                    bovina={selectedBovina}
                    istoric={greutateIstoric}
                    onClose={() => setShowWeightHistory(false)}
                    onAddWeight={handleAddWeight}
                    onDeleteWeight={handleDeleteWeight}
                    onViewChart={() => {
                        setShowWeightHistory(false);
                        setShowWeightChart(true);
                    }}
                />
            )}

            {showWeightChart && selectedBovina && greutateIstoric.length > 0 && (
                <BovineWeightChart
                    bovina={selectedBovina}
                    istoric={greutateIstoric}
                    onClose={() => setShowWeightChart(false)}
                    onViewTable={() => {
                        setShowWeightChart(false);
                        setShowWeightHistory(true);
                    }}
                />
            )}

            {/* Tabel */}
            <BovineTable
                bovine={getFilteredBovine()}
                rase={rase}
                retete={retete}
                onViewDetails={handleViewDetails}
                onViewEvents={handleViewEvents}
                onViewWeightHistory={handleViewWeightHistory}
                onViewWeightChart={handleViewWeightChart}
                onAddEvent={handleAddEvent}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default BovinePage;