import React, { useState } from 'react';

const BovineWeightModal = ({ bovina, istoric, onClose, onAddWeight, onDeleteWeight, onViewChart }) => {
    const [showAddWeight, setShowAddWeight] = useState(false);
    const [weightDay, setWeightDay] = useState('');
    const [weightMonth, setWeightMonth] = useState('');
    const [weightYear, setWeightYear] = useState('');
    const [weightData, setWeightData] = useState({
        greutate: '',
        nota: ''
    });

    const setCurrentWeightDate = () => {
        const now = new Date();
        setWeightDay(String(now.getDate()).padStart(2, '0'));
        setWeightMonth(String(now.getMonth() + 1).padStart(2, '0'));
        setWeightYear(now.getFullYear());
    };

    const handleWeightInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'greutate') {
            if (value === '' || /^\d*\.?\d*$/.test(value)) {
                setWeightData({
                    ...weightData,
                    [name]: value
                });
            }
        } else {
            setWeightData({
                ...weightData,
                [name]: value
            });
        }
    };

    const handleAddWeightSubmit = (e) => {
        e.preventDefault();

        if (!weightData.greutate || !weightDay || !weightMonth || !weightYear) {
            alert('Te rog completează greutatea și data!');
            return;
        }

        const dataMasuratoare = `${weightYear}-${weightMonth.padStart(2, '0')}-${weightDay.padStart(2, '0')}`;

        onAddWeight({
            bovinaId: bovina.id,
            greutate: parseFloat(weightData.greutate),
            dataMasuratoare: dataMasuratoare,
            nota: weightData.nota,
            userId: 1
        });

        setShowAddWeight(false);
        setWeightData({ greutate: '', nota: '' });
        setWeightDay('');
        setWeightMonth('');
        setWeightYear('');
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    // 🔥 Verificăm dacă istoric există și are elemente
    const hasIstoric = istoric && istoric.length > 0;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
                <div className="modal-header-with-buttons">
                    <h2>Istoric Greutate - Bovină #{bovina?.id || '?'}</h2>
                    {hasIstoric && (
                        <button className="btn-chart" onClick={onViewChart}>
                            📈 Vezi Grafic
                        </button>
                    )}
                </div>

                <div style={{ marginBottom: '20px', textAlign: 'right' }}>
                    <button
                        className="btn-primary"
                        onClick={() => setShowAddWeight(!showAddWeight)}
                    >
                        {showAddWeight ? 'Anulează' : '+ Adaugă Măsurătoare'}
                    </button>
                </div>

                {showAddWeight && (
                    <div className="form-container" style={{ marginBottom: '20px' }}>
                        <h3>Adaugă Măsurătoare Nouă</h3>
                        <form onSubmit={handleAddWeightSubmit}>
                            <div className="form-group">
                                <label>Greutate (kg):</label>
                                <input
                                    type="text"
                                    name="greutate"
                                    value={weightData.greutate}
                                    onChange={handleWeightInputChange}
                                    placeholder="ex: 450.5"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Data Măsurătorii (ZZ/LL/AAAA):</label>
                                <div className="date-selects">
                                    <select
                                        value={weightDay}
                                        onChange={(e) => setWeightDay(e.target.value)}
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
                                        value={weightMonth}
                                        onChange={(e) => setWeightMonth(e.target.value)}
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
                                        value={weightYear}
                                        onChange={(e) => setWeightYear(e.target.value)}
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

                                    <button
                                        type="button"
                                        onClick={setCurrentWeightDate}
                                        className="btn-today"
                                    >
                                        📅 Astăzi
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Notițe (opțional):</label>
                                <textarea
                                    name="nota"
                                    value={weightData.nota}
                                    onChange={handleWeightInputChange}
                                    rows="2"
                                />
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn-success">
                                    Salvează
                                </button>
                                <button type="button" className="btn-secondary" onClick={() => setShowAddWeight(false)}>
                                    Anulează
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {!hasIstoric ? (
                    <p className="no-data">Nu există măsurători de greutate pentru această bovină</p>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Greutate (kg)</th>
                                <th>Vârsta</th>
                                <th>Creștere totală</th>
                                <th>Creștere/zi</th>
                                <th>Notițe</th>
                                <th>Acțiuni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {istoric.map((m, index) => {
                                const diferentaFataDeInceput = index > 0
                                    ? (m.greutate - istoric[0].greutate).toFixed(1)
                                    : '-';

                                return (
                                    <tr key={m.id}>
                                        <td>{formatDate(m.dataMasuratoare)}</td>
                                        <td><strong>{m.greutate} kg</strong></td>
                                        <td>
                                            {m.zileDeLaNastere
                                                ? `${Math.floor(m.zileDeLaNastere / 30)} luni ${m.zileDeLaNastere % 30} zile`
                                                : '-'}
                                        </td>
                                        <td style={{ color: diferentaFataDeInceput !== '-' && parseFloat(diferentaFataDeInceput) > 0 ? '#4CAF50' : '#ff4444' }}>
                                            {diferentaFataDeInceput !== '-' ? `${diferentaFataDeInceput} kg` : '-'}
                                        </td>
                                        <td>
                                            {m.castigMediuZilnic ? (
                                                <span style={{ color: m.castigMediuZilnic > 0 ? '#4CAF50' : '#ff4444' }}>
                                                    {m.castigMediuZilnic > 0 ? '+' : ''}{m.castigMediuZilnic} kg/zi
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td>{m.nota || '-'}</td>
                                        <td>
                                            <button
                                                className="btn-delete"
                                                onClick={() => onDeleteWeight(m.id)}
                                                title="Șterge măsurătoarea"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}

                <div className="modal-actions">
                    <button className="btn-secondary" onClick={onClose}>
                        Închide
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BovineWeightModal;