import React from 'react';

const BovineDetailsModal = ({ bovina, rase, retete, onClose }) => {
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
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>Detalii Bovină</h2>
                <div className="details-grid">
                    <div><strong>ID:</strong> {bovina.id}</div>
                    <div><strong>Rasă:</strong> {getRasaNume(bovina.tipBovinaId)}</div>
                    <div><strong>Data nașterii:</strong> {formatDate(bovina.dateBirth)}</div>
                    <div><strong>Vârstă:</strong> {calculateAge(bovina.dateBirth)}</div>
                    <div><strong>Sex:</strong> {bovina.isMale ? 'Mascul' : 'Femelă'}</div>
                    <div><strong>Număr fătări:</strong> {bovina.nrFatari || 0}</div>
                    <div><strong>Producție lapte:</strong> {bovina.productieLapte ? `${bovina.productieLapte} L/zi` : '-'}</div>
                    <div><strong>Greutate curentă:</strong> {bovina.greutate ? `${bovina.greutate} kg` : '-'}</div>
                    <div><strong>Rețetă curentă:</strong> {getRetetaNume(bovina.retetaId)}</div>
                    <div><strong>Locație:</strong> {bovina.location || '-'}</div>
                    <div><strong>Status:</strong> {bovina.isObserved ? '🔴 Necesită atenție' : '🟢 Normal'}</div>
                    {bovina.nota && (
                        <div className="full-width">
                            <strong>Notițe:</strong>
                            <p>{bovina.nota}</p>
                        </div>
                    )}
                </div>
                <div className="modal-actions">
                    <button className="btn-secondary" onClick={onClose}>
                        Închide
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BovineDetailsModal;