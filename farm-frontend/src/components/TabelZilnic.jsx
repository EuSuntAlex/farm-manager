import "./TabelZilnic.css";

export default function TabelZilnic({ entries, onEntryChange }) {
  if (!entries || entries.length === 0) {
    return <div className="no-data">Nu există date pentru această lună</div>;
  }

  return (
    <div className="tabel-container">
      <table className="jurnal-table">
        <thead>
          <tr>
            <th>Zi</th>
            <th>Nr. Animale</th>
            <th>Mulsoare 1</th>
            <th>Mulsoare 2</th>
            <th>Total Lapte</th>
            <th>Lapte Viței</th>
            <th>Valoare Predată</th>
            <th>Destinatar</th>
            <th>Vânzare Externă</th>
            <th>Dest. Extern</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const totalLapte = (entry.mulsoare1 || 0) + (entry.mulsoare2 || 0);
            
            return (
              <tr key={entry.day} className={entry.exists ? "" : "new-entry"}>
                <td className="day-cell">{entry.day}</td>
                <td>
                  <input
                    type="number"
                    value={entry.nrAnimale}
                    onChange={(e) => onEntryChange(entry.day, "nrAnimale", parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={entry.mulsoare1}
                    onChange={(e) => onEntryChange(entry.day, "mulsoare1", parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={entry.mulsoare2}
                    onChange={(e) => onEntryChange(entry.day, "mulsoare2", parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </td>
                <td className="total-cell">{totalLapte}</td>
                <td>
                  <input
                    type="number"
                    value={entry.lapteVitei}
                    onChange={(e) => onEntryChange(entry.day, "lapteVitei", parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={entry.valoarePredata}
                    onChange={(e) => onEntryChange(entry.day, "valoarePredata", parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={entry.destinatar}
                    onChange={(e) => onEntryChange(entry.day, "destinatar", e.target.value)}
                    placeholder="Destinatar"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={entry.vanzareExterna}
                    onChange={(e) => onEntryChange(entry.day, "vanzareExterna", parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={entry.vanzareExternaDestinatar}
                    onChange={(e) => onEntryChange(entry.day, "vanzareExternaDestinatar", e.target.value)}
                    placeholder="Dest. extern"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}