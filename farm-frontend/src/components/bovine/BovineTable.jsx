import React from 'react';

const BovineTable = ({
    bovine,
    rase,
    retete,
    onViewDetails,
    onViewEvents,
    onViewWeightHistory,
    onViewWeightChart,
    onAddEvent,
    onEdit,
    onDelete
}) => {
    const getRasaNume = (id) => {
        const rasa = rase.find(r => r.id === id);
        return rasa ? rasa.name : 'Necunoscută';
    };

    const getRetetaNume = (id) => {
        if (!id) return 'Fără rețetă';
        const reteta = retete.find(r => r.id === id);
        return reteta ? reteta.nume : 'Necunoscută';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    const calculateAge = (dateStr) => {
        if (!dateStr) return '-';
        const birth = new Date(dateStr);
        const today = new Date();
        const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 +
            (today.getMonth() - birth.getMonth());
        const years = Math.floor(ageInMonths / 12);
        const months = ageInMonths % 12;

        if (years > 0) {
            return `${years} ani ${months > 0 ? `și ${months} luni` : ''}`;
        }
        return `${months} luni`;
    };

    return (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Rasă</th>
                        <th>Sex</th>
                        <th>Vârstă</th>
                        <th>Greutate</th>
                        <th>Lapte/zi</th>
                        <th>Fătări</th>
                        <th>Locație</th>
                        <th>Status</th>
                        <th>Acțiuni</th>
                    </tr>
                </thead>
                <tbody>
                    {bovine.length === 0 ? (
                        <tr>
                            <td colSpan="10" className="no-data">
                                Nu există bovine. Adaugă prima bovină!
                            </td>
                        </tr>
                    ) : (
                        bovine.map((b) => (
                            <tr key={b.id}>
                                <td>{b.id}</td>
                                <td>{getRasaNume(b.tipBovinaId)}</td>
                                <td>{b.isMale ? '♂' : '♀'}</td>
                                <td>{calculateAge(b.dateBirth)}</td>
                                <td><strong>{b.greutate ? `${b.greutate} kg` : '-'}</strong></td>
                                <td>{b.productieLapte || '-'}</td>
                                <td>{b.nrFatari || 0}</td>
                                <td>{b.location || '-'}</td>
                                <td>
                                    {b.isObserved ? (
                                        <span className="badge" style={{ background: '#ff4444', color: 'white' }}>Atenție</span>
                                    ) : (
                                        <span className="badge" style={{ background: '#4CAF50', color: 'white' }}>Normal</span>
                                    )}
                                </td>
                                <td className="actions">
                                    <button
                                        className="btn-view"
                                        onClick={() => onViewDetails(b)}
                                        title="Vezi detalii"
                                    >
                                        👁️
                                    </button>
                                    <button
                                        className="btn-view"
                                        onClick={() => onViewEvents(b)}
                                        title="Vezi evenimente"
                                    >
                                        📅
                                    </button>
                                    <button
                                        className="btn-view"
                                        onClick={() => onViewWeightHistory(b)}
                                        title="Istoric greutate"
                                    >
                                        ⚖️
                                    </button>
                                    <button
                                        className="btn-view"
                                        onClick={() => onViewWeightChart(b)}
                                        title="Grafic greutate"
                                    >
                                        📈
                                    </button>
                                    <button
                                        className="btn-add"
                                        onClick={() => onAddEvent(b)}
                                        title="Adaugă eveniment"
                                    >
                                        ➕
                                    </button>
                                    <button
                                        className="btn-edit"
                                        onClick={() => onEdit(b)}
                                        title="Editează"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="btn-delete"
                                        onClick={() => onDelete(b.id)}
                                        title="Șterge"
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default BovineTable;