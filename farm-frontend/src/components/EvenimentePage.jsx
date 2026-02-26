import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EvenimentePage.css';

const API_URL = 'http://localhost:8080/api';

const EvenimentePage = () => {
    const [evenimente, setEvenimente] = useState([]);
    const [tipuriEveniment, setTipuriEveniment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentEveniment, setCurrentEveniment] = useState(null);
    const [filter, setFilter] = useState('toate');

    // State pentru input-uri separate
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
    }, []);

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

        // Ajustează fusul orar (opțional - dacă e nevoie)
        // now.setHours(now.getHours() + 2); // pentru fusul orar românesc

        const currentDay = String(now.getDate()).padStart(2, '0');
        const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
        const currentYear = now.getFullYear();
        const currentHour = String(now.getHours()).padStart(2, '0');
        const currentMinute = String(now.getMinutes()).padStart(2, '0');

        setDay(currentDay);
        setMonth(currentMonth);
        setYear(currentYear);
        setHour(currentHour);
        setMinute(currentMinute);
    };

    const resetForm = () => {
        setFormData({
            tipEvenimentId: '',
            title: '',
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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validare - asigură-te că toate câmpurile sunt completate
        if (!day || !month || !year || !hour || !minute) {
            alert('Te rog completează data și ora complet!');
            return;
        }

        // Combină data și ora în formatul cerut de backend (YYYY-MM-DDTHH:MM:00)
        const dateTimeStr = `${year}-${month}-${day}T${hour}:${minute}:00`;

        try {
            if (editMode && currentEveniment) {
                // UPDATE
                await axios.put(
                    `${API_URL}/eveniment/update/${currentEveniment.id}?userId=1`,
                    {
                        title: formData.title,
                        dateStart: dateTimeStr,
                        tipEvenimentId: parseInt(formData.tipEvenimentId)
                    }
                );
            } else {
                // CREATE
                await axios.post(`${API_URL}/eveniment/add`, {
                    tipEvenimentId: parseInt(formData.tipEvenimentId),
                    title: formData.title,
                    dateStart: dateTimeStr,
                    userId: 1
                });
            }

            fetchEvenimente();
            resetForm();
        } catch (err) {
            alert('Eroare la salvare!');
            console.error(err);
        }
    };

    const handleEdit = (eveniment) => {
        // Desparte data și ora din string-ul primit de la backend
        const [data, oraFull] = eveniment.dateStart.split('T');
        const [an, luna, zi] = data.split('-');
        const [ore, minute] = oraFull.split(':');

        setYear(an);
        setMonth(luna);
        setDay(zi);
        setHour(ore);
        setMinute(minute);

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
            // Dacă e string în format ISO (ex: "2026-02-26T10:30:00")
            if (dateStr.includes('T')) {
                const [data, ora] = dateStr.split('T');
                const [an, luna, zi] = data.split('-');
                const [ore, minute] = ora.split(':');

                // Format: DD/MM/YYYY HH:MM
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
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    {showAddForm ? 'Anulează' : '+ Adaugă Eveniment'}
                </button>
            </div>

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

            {error && <div className="error-message">{error}</div>}

            {showAddForm && (
                <div className="form-container">
                    <h2>{editMode ? 'Editează Eveniment' : 'Adaugă Eveniment Nou'}</h2>

                    {/* Butonul Astăzi */}
                    <div style={{ marginBottom: '20px', textAlign: 'right' }}>
                        <button
                            type="button"
                            onClick={setCurrentDateTime}
                            style={{
                                backgroundColor: '#2196F3',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}
                        >
                            <span>📅</span>
                            Astăzi (data și ora curentă)
                        </button>
                    </div>

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
                                        {tip.nume} ({tip.duration === 0 ? 'punctual' : `${tip.duration} zile`})
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

                        {/* Data - select-uri separate pentru control total */}
                        <div className="form-group">
                            <label>Data Început (ZZ/LL/AAAA):</label>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <select
                                    value={day}
                                    onChange={(e) => setDay(e.target.value)}
                                    required
                                    style={{ flex: 1, minWidth: '70px' }}
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
                                    style={{ flex: 1, minWidth: '90px' }}
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
                                    style={{ flex: 1, minWidth: '80px' }}
                                >
                                    <option value="">An</option>
                                    {[...Array(10)].map((_, i) => {
                                        const an = 2026 + i;
                                        return (
                                            <option key={an} value={an}>
                                                {an}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        </div>

                        {/* Ora - select-uri separate pentru format 24h */}
                        <div className="form-group">
                            <label>Ora Început (HH:MM - format 24h):</label>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <select
                                    value={hour}
                                    onChange={(e) => setHour(e.target.value)}
                                    required
                                    style={{ flex: 1, minWidth: '70px' }}
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
                                <span style={{ fontSize: '1.2em', fontWeight: 'bold' }}>:</span>
                                <select
                                    value={minute}
                                    onChange={(e) => setMinute(e.target.value)}
                                    required
                                    style={{ flex: 1, minWidth: '70px' }}
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
                            <small>Ora în format 24h (ex: 13 pentru 1 PM, 08 pentru 8 AM)</small>
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
        </div>
    );
};

export default EvenimentePage;