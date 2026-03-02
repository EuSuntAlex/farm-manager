import React, { useState, useEffect } from 'react';

const BovineForm = ({ editMode, currentBovina, rase, retete, onSubmit, onCancel }) => {
    const [birthDay, setBirthDay] = useState('');
    const [birthMonth, setBirthMonth] = useState('');
    const [birthYear, setBirthYear] = useState('');

    const [formData, setFormData] = useState({
        isMale: 'false',
        nrFatari: 0,
        productieLapte: '',
        greutate: '',
        nota: '',
        location: '',
        isObserved: false,
        tipBovinaId: '',
        retetaId: '',
        userId: 1
    });

    useEffect(() => {
        if (editMode && currentBovina) {
            // Desparte data în zi, lună, an
            if (currentBovina.dateBirth) {
                const [yearStr, monthStr, dayStr] = currentBovina.dateBirth.split('-');
                setBirthYear(yearStr);
                setBirthMonth(monthStr);
                setBirthDay(dayStr);
            }

            setFormData({
                isMale: currentBovina.isMale ? 'true' : 'false',
                nrFatari: currentBovina.nrFatari || 0,
                productieLapte: currentBovina.productieLapte || '',
                greutate: currentBovina.greutate || '',
                nota: currentBovina.nota || '',
                location: currentBovina.location || '',
                isObserved: currentBovina.isObserved || false,
                tipBovinaId: currentBovina.tipBovinaId,
                retetaId: currentBovina.retetaId || '',
                userId: currentBovina.userId
            });
        }
    }, [editMode, currentBovina]);

    const setCurrentDate = () => {
        const now = new Date();
        setBirthDay(String(now.getDate()).padStart(2, '0'));
        setBirthMonth(String(now.getMonth() + 1).padStart(2, '0'));
        setBirthYear(now.getFullYear());
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!birthDay || !birthMonth || !birthYear) {
            alert('Te rog completează data nașterii!');
            return;
        }

        const dateBirth = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;

        const dataToSend = {
            ...formData,
            dateBirth: dateBirth,
            isMale: formData.isMale === 'true',
            nrFatari: parseInt(formData.nrFatari) || 0,
            productieLapte: formData.productieLapte ? parseInt(formData.productieLapte) : null,
            greutate: formData.greutate ? parseFloat(formData.greutate) : null,
            tipBovinaId: parseInt(formData.tipBovinaId),
            retetaId: formData.retetaId ? parseInt(formData.retetaId) : null
        };

        onSubmit(dataToSend, editMode, editMode ? currentBovina.id : null);
    };

    const resetForm = () => {
        setFormData({
            isMale: 'false',
            nrFatari: 0,
            productieLapte: '',
            greutate: '',
            nota: '',
            location: '',
            isObserved: false,
            tipBovinaId: '',
            retetaId: '',
            userId: 1
        });
        setBirthDay('');
        setBirthMonth('');
        setBirthYear('');
    };

    return (
        <div className="form-container">
            <h2>{editMode ? 'Editare Bovină' : 'Adăugare Bovină Nouă'}</h2>

            <div style={{ marginBottom: '20px', textAlign: 'right' }}>
                <button type="button" onClick={setCurrentDate} className="btn-today">
                    📅 Astăzi
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Rasă:</label>
                    <select
                        name="tipBovinaId"
                        value={formData.tipBovinaId}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Selectează rasa</option>
                        {rase.map(rasa => (
                            <option key={rasa.id} value={rasa.id}>
                                {rasa.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Data Nașterii (ZZ/LL/AAAA):</label>
                    <div className="date-selects">
                        <select
                            value={birthDay}
                            onChange={(e) => setBirthDay(e.target.value)}
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
                            value={birthMonth}
                            onChange={(e) => setBirthMonth(e.target.value)}
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
                            value={birthYear}
                            onChange={(e) => setBirthYear(e.target.value)}
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

                <div className="form-group">
                    <label>Sex:</label>
                    <select
                        name="isMale"
                        value={formData.isMale}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="false">Femelă</option>
                        <option value="true">Mascul</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Număr Fătări:</label>
                    <input
                        type="number"
                        name="nrFatari"
                        value={formData.nrFatari}
                        onChange={handleInputChange}
                        min="0"
                    />
                </div>

                <div className="form-group">
                    <label>Producție Lapte (litri/zi):</label>
                    <input
                        type="number"
                        name="productieLapte"
                        value={formData.productieLapte}
                        onChange={handleInputChange}
                        min="0"
                        step="0.1"
                    />
                </div>

                <div className="form-group">
                    <label>Greutate (kg):</label>
                    <input
                        type="number"
                        name="greutate"
                        value={formData.greutate}
                        onChange={handleInputChange}
                        min="0"
                        step="0.1"
                        placeholder="Greutate inițială"
                    />
                </div>

                <div className="form-group">
                    <label>Rețetă Asignată:</label>
                    <select
                        name="retetaId"
                        value={formData.retetaId}
                        onChange={handleInputChange}
                    >
                        <option value="">Fără rețetă</option>
                        {retete.map(reteta => (
                            <option key={reteta.id} value={reteta.id}>
                                {reteta.nume}
                            </option>
                        ))}
                    </select>
                    <small>Dacă lași gol, se va folosi rețeta default a rasei</small>
                </div>

                <div className="form-group">
                    <label>Locație:</label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="ex: Sector A, Stâna 3"
                    />
                </div>

                <div className="form-group">
                    <label>Notițe:</label>
                    <textarea
                        name="nota"
                        value={formData.nota}
                        onChange={handleInputChange}
                        rows="3"
                    />
                </div>

                <div className="form-group checkbox">
                    <label>
                        <input
                            type="checkbox"
                            name="isObserved"
                            checked={formData.isObserved}
                            onChange={handleInputChange}
                        />
                        Necesită observație specială
                    </label>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-success">
                        {editMode ? 'Actualizează' : 'Salvează'}
                    </button>
                    <button type="button" className="btn-secondary" onClick={resetForm}>
                        Reset
                    </button>
                    <button type="button" className="btn-secondary" onClick={onCancel}>
                        Anulează
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BovineForm;