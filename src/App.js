import { useState } from "react";
import "./style.css";

export default function App() {
  const [selectedDay, setSelectedDay] = useState(null);
  const [page, setPage] = useState("calendar");

  const [logs, setLogs] = useState({});

  const updateLog = (field, value) => {
    setLogs((prev) => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        [field]: value,
      },
    }));
  };

  const currentLog = logs[selectedDay] || {};

  const calculateScore = () => {
    const retention = parseFloat(currentLog.retention || 0);
    const watch = parseFloat(currentLog.watchTime || 0);

    if (retention > 40) return "🔥 viral";
    if (retention > 25) return "⚠️ ok";
    return "❌ slab";
  };

  return (
    <div className="container">
      <h1>Calendar Postari</h1>

      {/* NAV */}
      <div className="nav">
        <button onClick={() => setPage("calendar")}>Calendar</button>
        <button onClick={() => setPage("reset")}>Reset bland</button>
      </div>

      {page === "calendar" && (
        <>
          {/* ZILE */}
          <div className="grid">
            {Array.from({ length: 31 }, (_, i) => (
              <div
                key={i}
                className="day"
                onClick={() => setSelectedDay(i + 1)}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* LOG */}
          {selectedDay && (
            <div className="log">
              <h3>Ziua {selectedDay}</h3>

              <input
                placeholder="Cadre"
                value={currentLog.frames || ""}
                onChange={(e) => updateLog("frames", e.target.value)}
              />

              <input
                placeholder="Caption"
                value={currentLog.caption || ""}
                onChange={(e) => updateLog("caption", e.target.value)}
              />

              <input
                placeholder="Ora postarii"
                value={currentLog.hour || ""}
                onChange={(e) => updateLog("hour", e.target.value)}
              />

              <input
                placeholder="Vizualizari"
                value={currentLog.views || ""}
                onChange={(e) => updateLog("views", e.target.value)}
              />

              <input
                placeholder="Watch time"
                value={currentLog.watchTime || ""}
                onChange={(e) => updateLog("watchTime", e.target.value)}
              />

              <input
                placeholder="Retentie (%)"
                value={currentLog.retention || ""}
                onChange={(e) => updateLog("retention", e.target.value)}
              />

              <input
                placeholder="Reactii la 0:00"
                value={currentLog.hook || ""}
                onChange={(e) => updateLog("hook", e.target.value)}
              />

              <input
                placeholder="Like-uri"
                value={currentLog.likes || ""}
                onChange={(e) => updateLog("likes", e.target.value)}
              />

              <input
                placeholder="Salvari"
                value={currentLog.saves || ""}
                onChange={(e) => updateLog("saves", e.target.value)}
              />

              <input
                placeholder="Comentarii"
                value={currentLog.comments || ""}
                onChange={(e) => updateLog("comments", e.target.value)}
              />

              <input
                placeholder="Eligibil (da/nu)"
                value={currentLog.eligible || ""}
                onChange={(e) => updateLog("eligible", e.target.value)}
              />

              <textarea
                placeholder="Observatii / log"
                value={currentLog.notes || ""}
                onChange={(e) => updateLog("notes", e.target.value)}
              />

              {/* SCORE */}
              <div className="score">
                Scor: {calculateScore()}
              </div>
            </div>
          )}
        </>
      )}

      {page === "reset" && (
        <div className="reset">
          <h2>Reset Bland</h2>
          <p>Zi de pauza / reechilibrare</p>
        </div>
      )}
    </div>
  );
                                           }
