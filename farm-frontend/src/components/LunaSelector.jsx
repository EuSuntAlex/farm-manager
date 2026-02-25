import "./LunaSelector.css";

export default function LunaSelector({ selectedDate, onDateChange, onSetCurrent }) {
  const months = [
    "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
    "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="luna-selector">
      <div className="selector-controls">
        <select 
          value={selectedDate.month}
          onChange={(e) => onDateChange({ ...selectedDate, month: parseInt(e.target.value) })}
        >
          {months.map((month, index) => (
            <option key={index} value={index + 1}>
              {month}
            </option>
          ))}
        </select>

        <select 
          value={selectedDate.year}
          onChange={(e) => onDateChange({ ...selectedDate, year: parseInt(e.target.value) })}
        >
          {years.map(year => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <button className="current-month-btn" onClick={onSetCurrent}>
          📅 Luna curentă
        </button>
      </div>
    </div>
  );
}