import React from 'react';

const BovineEventsModal = ({ bovina, evenimente, onClose }) => {
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const [year, month, day] = dateStr.split('T')[0].split('-');
        return `${day}/${month}/${year}`;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
                <h2>Evenimente - {bovina.nume || `Bovină #${bovina.id}`}</h2>

                {evenimente.length === 0 ? (
                    <p className="no-data">Nu există evenimente pentru această bovină</p>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Eveniment</th>
                                <th>Detalii</th>
                            </tr>
                        </thead>
                        <tbody>
                            {evenimente.map(ev => (
                                <tr key={ev.id}>
                                    <td>{formatDate(ev.dateStart)}</td>
                                    <td>{ev.tipEvenimentNume}</td>
                                    <td>{ev.title}</td>
                                </tr>
                            ))}
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

export default BovineEventsModal;