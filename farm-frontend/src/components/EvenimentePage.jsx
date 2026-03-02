import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import './EvenimentePage.css';

const API_URL = 'http://localhost:8080/api';

const EvenimentePage = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const bovinaIdFromUrl = queryParams.get('bovinaId');
    const addMode = queryParams.get('add') === 'true';

    const [evenimente, setEvenimente] = useState([]);
    const [tipuriEveniment, setTipuriEveniment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(addMode);
    const [editMode, setEditMode] = useState(false);
    const [currentEveniment, setCurrentEveniment] = useState(null);
    const [filter, setFilter] = useState('toate');
    const [selectedBovina, setSelectedBovina] = useState(null);

    // State pentru input-uri separate (dată și oră)
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [hour, setHour] = useState('');
    const [minute, setMinute] = useState('');

    const [formData, setFormData] = useState({
        tipEvenimentId: '',
        title: '',
        userId: 1
    });

    useEffect(() => {
        fetchTipuri();

        // Dacă avem bovinaId în URL, încărcăm datele bovinei
        if (bovinaIdFromUrl) {
            fetchBovinaInfo(bovinaIdFromUrl);
        }
    }, [bovinaIdFromUrl]);

    useEffect(() => {
        fetchEvenimente();
    }, [filter]);

    const fetchTipuri = async () => {
        try {
            const response = await axios.get(`${API_URL}/tip-eveniment/all?userId=1`);
            setTipuriEveniment(response.data);
        } catch (err) {
            console.error('Eroare la încărcarea tipurilor:', err);
        }
    };

    const fetchEvenimente = async () => {
        try {
            setLoading(true);
            let url = `${API_URL}/eveniment/all?userId=1`;

            if (filter === 'viitoare') {
                url = `${API_URL}/eveniment/viitoare?userId=1`;
            } else if (filter === 'desfasurare') {
                url = `${API_URL}/eveniment/in-desfasurare?userId=1`;
            } else if (filter === 'trecute') {
                url = `${API_URL}/eveniment/ultimele-30-zile?userId=1`;
            }

            const response = await axios.get(url);
            setEvenimente(response.data);
            setError(null);
        } catch (err) {
            setError('Eroare la încărcarea evenimentelor');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchBovinaInfo = async (id) => {
        try {
            const response = await axios.get(`${API_URL}/bovine/${id}?userId=1`);
            setSelectedBovina(response.data);

            // Precompletează titlul evenimentului
            setFormData(prev => ({
                ...prev,
                title: `Eveniment - Bovină #${id}`
            }));
        } catch (err) {
            console.error('Eroare la încărcarea bovinei:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Funcție pentru a seta data și ora curentă
    const setCurrentDateTime = () => {
        const now = new Date();

        setDay(String(now.getDate()).padStart(2, '0'));
        setMonth(String(now.getMonth() + 1).padStart(2, '0'));
        setYear(now.getFullYear());
        setHour(String(now.getHours()).padStart(2, '0'));
        setMinute(String(now.getMinutes()).padStart(2, '0'));
    };

    const resetForm = () => {
        setFormData({
            tipEvenimentId: '',
            title: bovinaIdFromUrl ? `Eveniment - Bovină #${bovinaIdFromUrl}` : '',
            userId: 1
        });
        setDay('');
        setMonth('');
        setYear('');
        setHour('');
        setMinute('');
        setEditMode(false);
        setCurrentEveniment(null);
        setShowAddForm(false);

        // Dacă avem bovinaId, după reset redirecționăm înapoi
        if (bovinaIdFromUrl) {
            setTimeout(() => {
                window.location.href = '/bovine';
            }, 100);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validează data
        if (!day || !month || !year || !hour || !minute) {
            alert('Te rog completează data și ora complet!');
            return;
        }

        const dateTimeStr = `${year}-${month}-${day}T${hour}:${minute}:00`;

        try {
            const dataToSend = {
                tipEvenimentId: parseInt(formData.tipEvenimentId),
                title: formData.title,
                dateStart: dateTimeStr,
                userId: 1
            };

            // Adaugă bovinaId dacă există în URL
            if (bovinaIdFromUrl) {
                dataToSend.bovinaId = parseInt(bovinaIdFromUrl);
            }

            if (editMode && currentEveniment) {
                // UPDATE
                await axios.put(
                    `${API_URL}/eveniment/update/${currentEveniment.id}?userId=1`,
                    dataToSend
                );
            } else {
                // CREATE - fără duration, vine din tipEveniment în backend
                await axios.post(`${API_URL}/eveniment/add`, dataToSend);
            }

            fetchEvenimente();

            // Dacă am venit de la bovine, după salvare ne întoarcem
            if (bovinaIdFromUrl) {
                alert('Eveniment adăugat cu succes!');
                setTimeout(() => {
                    window.location.href = '/bovine';
                }, 1500);
            } else {
                resetForm();
            }
        } catch (err) {
            alert('Eroare la salvare!');
            console.error(err);
        }
    };

    const handleEdit = (eveniment) => {
        // Desparte data și ora
        if (eveniment.dateStart) {
            const [data, oraFull] = eveniment.dateStart.split('T');
            const [an, luna, zi] = data.split('-');
            const [ore, minute] = oraFull.split(':');

            setYear(an);
            setMonth(luna);
            setDay(zi);
            setHour(ore);
            setMinute(minute);
        }

        setFormData({
            tipEvenimentId: eveniment.tipEvenimentId,
            title: eveniment.title,
            userId: eveniment.userId
        });
        setEditMode(true);
        setCurrentEveniment(eveniment);
        setShowAddForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Sigur vrei să ștergi acest eveniment?')) {
            return;
        }

        try {
            await axios.delete(`${API_URL}/eveniment/delete/${id}?userId=1`);
            fetchEvenimente();
        } catch (err) {
            alert('Eroare la ștergere!');
            console.error(err);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            'VIITOR': 'badge-future',
            'IN_DESFASURARE': 'badge-ongoing',
            'INCHIS': 'badge-closed'
        };
        return <span className={`badge ${badges[status] || ''}`}>{status}</span>;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';

        try {
            if (dateStr.includes('T')) {
                const [data, ora] = dateStr.split('T');
                const [an, luna, zi] = data.split('-');
                const [ore, minute] = ora.split(':');

                return `${zi}/${luna}/${an} ${ore}:${minute}`;
            }
            return dateStr;
        } catch (error) {
            console.error('Eroare la formatare data:', error);
            return dateStr;
        }
    };

    if (loading) return <div className="loading">Se încarcă...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Evenimente</h1>
                <button
                    className="btn-primary"
                    onClick={() => {
                        setEditMode(false);
                        setCurrentEveniment(null);
                        setShowAddForm(!showAddForm);
                        // Dacă închidem formularul și avem bovinaId, ne întoarcem
                        if (!showAddForm && bovinaIdFromUrl) {
                            window.location.href = '/bovine';
                        }
                    }}
                >
                    {showAddForm ? 'Anulează' : '+ Adaugă Eveniment'}
                </button>
            </div>

            {/* Filtre */}
            {!bovinaIdFromUrl && (
                <div className="filters">
                    <button
                        className={`filter-btn ${filter === 'toate' ? 'active' : ''}`}
                        onClick={() => setFilter('toate')}
                    >
                        Toate
                    </button>
                    <button
                        className={`filter-btn ${filter === 'viitoare' ? 'active' : ''}`}
                        onClick={() => setFilter('viitoare')}
                    >
                        Viitoare
                    </button>
                    <button
                        className={`filter-btn ${filter === 'desfasurare' ? 'active' : ''}`}
                        onClick={() => setFilter('desfasurare')}
                    >
                        În Desfășurare
                    </button>
                    <button
                        className={`filter-btn ${filter === 'trecute' ? 'active' : ''}`}
                        onClick={() => setFilter('trecute')}
                    >
                        Ultimele 30 zile
                    </button>
                </div>
            )}

            {error && <div className="error-message">{error}</div>}

            {showAddForm && (
                <div className="form-container">
                    <h2>{editMode ? 'Editează Eveniment' : 'Adaugă Eveniment Nou'}</h2>

                    {/* Buton Astăzi */}
                    <div style={{ marginBottom: '20px', textAlign: 'right' }}>
                        <button
                            type="button"
                            onClick={setCurrentDateTime}
                            className="btn-today"
                        >
                            📅 Astăzi
                        </button>
                    </div>

                    {/* Mesaj informativ dacă evenimentul e pentru o bovină */}
                    {bovinaIdFromUrl && (
                        <div className="info-message">
                            <p>📌 Adaugi eveniment pentru: <strong>Bovină #{bovinaIdFromUrl}</strong></p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Tip Eveniment:</label>
                            <select
                                name="tipEvenimentId"
                                value={formData.tipEvenimentId}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Selectează tip</option>
                                {tipuriEveniment.map((tip) => (
                                    <option key={tip.id} value={tip.id}>
                                        {tip.nume} ({tip.duration === 0 ? 'instant' : `${tip.duration} zile`})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Titlu:</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        {/* Data - select-uri separate */}
                        <div className="form-group">
                            <label>Data Început (ZZ/LL/AAAA):</label>
                            <div className="date-selects">
                                <select
                                    value={day}
                                    onChange={(e) => setDay(e.target.value)}
                                    required
                                    className="date-select"
                                >
                                    <option value="">Zi</option>
                                    {[...Array(31)].map((_, i) => {
                                        const zi = String(i + 1).padStart(2, '0');
                                        return (
                                            <option key={zi} value={zi}>
                                                {zi}
                                            </option>
                                        );
                                    })}
                                </select>

                                <select
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    required
                                    className="date-select"
                                >
                                    <option value="">Lună</option>
                                    <option value="01">Ianuarie (01)</option>
                                    <option value="02">Februarie (02)</option>
                                    <option value="03">Martie (03)</option>
                                    <option value="04">Aprilie (04)</option>
                                    <option value="05">Mai (05)</option>
                                    <option value="06">Iunie (06)</option>
                                    <option value="07">Iulie (07)</option>
                                    <option value="08">August (08)</option>
                                    <option value="09">Septembrie (09)</option>
                                    <option value="10">Octombrie (10)</option>
                                    <option value="11">Noiembrie (11)</option>
                                    <option value="12">Decembrie (12)</option>
                                </select>

                                <select
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    required
                                    className="date-select"
                                >
                                    <option value="">An</option>
                                    {[...Array(21)].map((_, i) => {
                                        const an = 2010 + i;
                                        return (
                                            <option key={an} value={an}>
                                                {an}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        </div>

                        {/* Ora - select-uri separate */}
                        <div className="form-group">
                            <label>Ora Început (HH:MM - format 24h):</label>
                            <div className="time-selects">
                                <select
                                    value={hour}
                                    onChange={(e) => setHour(e.target.value)}
                                    required
                                    className="time-select"
                                >
                                    <option value="">Ora</option>
                                    {[...Array(24)].map((_, i) => {
                                        const ora = String(i).padStart(2, '0');
                                        return (
                                            <option key={ora} value={ora}>
                                                {ora}
                                            </option>
                                        );
                                    })}
                                </select>
                                <span className="time-separator">:</span>
                                <select
                                    value={minute}
                                    onChange={(e) => setMinute(e.target.value)}
                                    required
                                    className="time-select"
                                >
                                    <option value="">Min</option>
                                    {[...Array(60)].map((_, i) => {
                                        const minut = String(i).padStart(2, '0');
                                        return (
                                            <option key={minut} value={minut}>
                                                {minut}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        </div>

                        {/* Câmp ascuns pentru bovinaId */}
                        {bovinaIdFromUrl && (
                            <input type="hidden" name="bovinaId" value={bovinaIdFromUrl} />
                        )}

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

            {/* Tabel evenimente - ascundem tabelul dacă suntem în modul adăugare pentru o bovină */}
            {!bovinaIdFromUrl && (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tip</th>
                                <th>Titlu</th>
                                <th>Început</th>
                                <th>Sfârșit</th>
                                <th>Status</th>
                                <th>Zile Rămase</th>
                                <th>Acțiuni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {evenimente.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="no-data">
                                        Nu există evenimente.
                                    </td>
                                </tr>
                            ) : (
                                evenimente.map((ev) => (
                                    <tr key={ev.id}>
                                        <td>{ev.id}</td>
                                        <td>{ev.tipEvenimentNume || ev.tipEvenimentId}</td>
                                        <td>{ev.title}</td>
                                        <td>{formatDate(ev.dateStart)}</td>
                                        <td>{ev.dateEnd ? formatDate(ev.dateEnd) : '-'}</td>
                                        <td>{getStatusBadge(ev.status)}</td>
                                        <td>{ev.zileRamase > 0 ? ev.zileRamase : '-'}</td>
                                        <td className="actions">
                                            <button
                                                className="btn-edit"
                                                onClick={() => handleEdit(ev)}
                                            >
                                                Editează
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDelete(ev.id)}
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
            )}
        </div>
    );
};

export default EvenimentePage;