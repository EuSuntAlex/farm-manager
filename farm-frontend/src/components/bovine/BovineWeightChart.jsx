import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';

const BovineWeightChart = ({ bovina, istoric, onClose, onViewTable }) => {
    // Verifică dacă avem date
    if (!istoric || istoric.length === 0) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <h2>Evoluție Greutate - Bovină #{bovina?.id || '?'}</h2>
                    <p className="no-data">Nu există date pentru a afișa graficul</p>
                    <div className="modal-actions">
                        <button className="btn-secondary" onClick={onClose}>
                            Închide
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Pregătește datele pentru grafic
    const chartData = istoric.map(m => ({
        data: new Date(m.dataMasuratoare).toLocaleDateString('ro-RO'),
        greutate: m.greutate,
        varsta: m.zileDeLaNastere ? `${Math.floor(m.zileDeLaNastere / 30)} luni` : '-',
        nota: m.nota || ''
    }));

    // Calculează statistici
    const firstWeight = istoric[0]?.greutate || 0;
    const lastWeight = istoric[istoric.length - 1]?.greutate || 0;
    const totalGain = (lastWeight - firstWeight).toFixed(1);
    const totalGainNumber = parseFloat(totalGain);
    const totalDays = istoric.length > 1
        ? (istoric[istoric.length - 1]?.zileDeLaNastere - istoric[0]?.zileDeLaNastere)
        : 0;
    const avgDailyGain = totalDays > 0 ? (totalGainNumber / totalDays).toFixed(2) : 0;
    const avgDailyGainNumber = parseFloat(avgDailyGain);

    // Găsește greutatea minimă și maximă pentru linii de referință
    const minWeight = Math.min(...istoric.map(m => m.greutate));
    const maxWeight = Math.max(...istoric.map(m => m.greutate));

    // Determină culoarea și semnul pentru creștere
    const getGrowthDisplay = (value) => {
        if (value > 0) {
            return { sign: '+', color: '#4CAF50', class: 'positive' };
        } else if (value < 0) {
            return { sign: '-', color: '#ff4444', class: 'negative' };
        } else {
            return { sign: '', color: '#666', class: 'zero' };
        }
    };

    const totalGrowth = getGrowthDisplay(totalGainNumber);
    const avgGrowth = getGrowthDisplay(avgDailyGainNumber);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
                <div className="modal-header-with-buttons">
                    <h2>Evoluție Greutate - Bovină #{bovina.id}</h2>
                    <button className="btn-view" onClick={onViewTable}>
                        📋 Vezi Tabel
                    </button>
                </div>

                {/* Statistici - cu semn vizibil */}
                <div className="stats-container">
                    <div className="stat-card">
                        <span className="stat-label">Prima măsurătoare</span>
                        <span className="stat-value">{firstWeight} kg</span>
                        <span className="stat-date">{new Date(istoric[0]?.dataMasuratoare).toLocaleDateString('ro-RO')}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Ultima măsurătoare</span>
                        <span className="stat-value">{lastWeight} kg</span>
                        <span className="stat-date">{new Date(istoric[istoric.length - 1]?.dataMasuratoare).toLocaleDateString('ro-RO')}</span>
                    </div>
                    <div className={`stat-card stat-card-total ${totalGrowth.class}`}>
                        <span className="stat-label">Creștere totală</span>
                        <span className="stat-value-total" style={{ color: totalGrowth.color }}>
                            {totalGrowth.sign}{Math.abs(totalGainNumber)} kg
                        </span>
                    </div>
                    <div className={`stat-card stat-card-average ${avgGrowth.class}`}>
                        <span className="stat-label">Creștere medie/zi</span>
                        <span className="stat-value-average" style={{ color: avgGrowth.color }}>
                            {avgGrowth.sign}{Math.abs(avgDailyGainNumber)} kg
                        </span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Perioada</span>
                        <span className="stat-value">{totalDays} zile</span>
                    </div>
                </div>

                {/* Graficul principal */}
                <div className="chart-main-container">
                    <h3>📈 Evoluția în timp</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart
                            data={chartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                            <XAxis
                                dataKey="data"
                                angle={-45}
                                textAnchor="end"
                                height={60}
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis
                                yAxisId="left"
                                label={{ value: 'Greutate (kg)', angle: -90, position: 'insideLeft' }}
                                domain={[Math.max(0, minWeight - 10), maxWeight + 10]}
                            />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="custom-tooltip">
                                                <p className="tooltip-date">{label}</p>
                                                <p className="tooltip-weight">
                                                    <strong>{data.greutate} kg</strong>
                                                </p>
                                                {data.varsta !== '-' && (
                                                    <p className="tooltip-age">Vârstă: {data.varsta}</p>
                                                )}
                                                {data.nota && (
                                                    <p className="tooltip-note">📝 {data.nota}</p>
                                                )}
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Legend />
                            <ReferenceLine
                                y={firstWeight}
                                label="Start"
                                stroke="#666"
                                strokeDasharray="3 3"
                                yAxisId="left"
                            />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="greutate"
                                name="Greutate (kg)"
                                stroke="#4CAF50"
                                strokeWidth={3}
                                dot={{ r: 6, fill: "#4CAF50" }}
                                activeDot={{ r: 8, fill: "#ff4444" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Graficul secundar - rata de creștere */}
                {istoric.length > 1 && (
                    <div className="chart-secondary-container">
                        <h3>📊 Rata de creștere</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart
                                data={istoric.slice(1).map((m, index) => ({
                                    data: new Date(m.dataMasuratoare).toLocaleDateString('ro-RO'),
                                    crestere: m.castigMediuZilnic || 0,
                                    perioada: `${new Date(istoric[index].dataMasuratoare).toLocaleDateString('ro-RO')} - ${new Date(m.dataMasuratoare).toLocaleDateString('ro-RO')}`
                                }))}
                                margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                <XAxis dataKey="data" angle={-45} textAnchor="end" height={60} />
                                <YAxis
                                    label={{ value: 'kg/zi', angle: -90, position: 'insideLeft' }}
                                    domain={['auto', 'auto']}
                                />
                                <Tooltip
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            const value = payload[0].value;
                                            const growth = getGrowthDisplay(value);
                                            return (
                                                <div className="custom-tooltip">
                                                    <p className="tooltip-date">{payload[0].payload.perioada}</p>
                                                    <p className="tooltip-weight" style={{ color: growth.color }}>
                                                        <strong>{growth.sign}{Math.abs(value)} kg/zi</strong>
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="crestere"
                                    name="Creștere (kg/zi)"
                                    stroke="#2196F3"
                                    strokeWidth={2}
                                    dot={{ r: 4, fill: "#2196F3" }}
                                />
                                <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Butoane acțiuni */}
                <div className="modal-actions">
                    <button className="btn-secondary" onClick={onClose}>
                        Închide
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BovineWeightChart;