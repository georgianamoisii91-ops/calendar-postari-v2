import { useMemo, useState, useEffect } from "react";

const months = [
  "Ianuarie","Februarie","Martie","Aprilie","Mai","Iunie",
  "Iulie","August","Septembrie","Octombrie","Noiembrie","Decembrie"
];

const dayNames = ["Lu","Ma","Mi","Jo","Vi","Sa","Du"];

function getDaysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(month, year) {
  let day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function storageKey(page) {
  return `calendar-${page}-2026`;
}

export default function App() {
  const [page, setPage] = useState("anxios");

  return (
    <div className="app-shell">
      <div className="top-header">
        <div className="top-title">Calendar 2026</div>
      </div>

      <div className="tabs">
        <button onClick={()=>setPage("anxios")} className={page==="anxios"?"active":""}>
          Anxios
        </button>
        <button onClick={()=>setPage("reset")} className={page==="reset"?"active":""}>
          Reset
        </button>
      </div>

      <CalendarPage page={page} />
    </div>
  );
}

function CalendarPage({ page }) {
  const year = 2026;

  const [currentMonth, setCurrentMonth] = useState(2);
  const [selectedDay, setSelectedDay] = useState(null);
  const [posted, setPosted] = useState({});
  const [dailyNotes, setDailyNotes] = useState({});
  const [videoLogs, setVideoLogs] = useState({});

  const key = storageKey(page);

  // 🔥 LOAD CORECT LA SCHIMBARE TAB
  useEffect(() => {
    const saved = localStorage.getItem(key);

    if (saved) {
      const data = JSON.parse(saved);

      setCurrentMonth(data.currentMonth ?? 2);
      setSelectedDay(data.selectedDay ?? null);
      setPosted(data.posted ?? {});
      setDailyNotes(data.dailyNotes ?? {});
      setVideoLogs(data.videoLogs ?? {});
    } else {
      setCurrentMonth(2);
      setSelectedDay(null);
      setPosted({});
      setDailyNotes({});
      setVideoLogs({});
    }
  }, [key]);

  // 🔥 AUTO SAVE
  useEffect(() => {
    const data = {
      currentMonth,
      selectedDay,
      posted,
      dailyNotes,
      videoLogs
    };

    localStorage.setItem(key, JSON.stringify(data));
  }, [currentMonth, selectedDay, posted, dailyNotes, videoLogs, key]);

  const dayKey = (m,d) => `${year}-${m}-${d}`;
  const platformKey = (m,d,p) => `${year}-${m}-${d}-${p}`;
  const selectedKey = selectedDay ? dayKey(currentMonth, selectedDay) : null;

  // 🔥 UPDATE SAFE
  const togglePosted = (platform) => {
    if (!selectedDay) return;

    const k = platformKey(currentMonth, selectedDay, platform);

    setPosted(prev => ({
      ...prev,
      [k]: !prev[k]
    }));
  };

  const updateNote = (field, value) => {
    if (!selectedKey) return;

    setDailyNotes(prev => ({
      ...prev,
      [selectedKey]: {
        ...(prev[selectedKey] || {}),
        [field]: value
      }
    }));
  };

  const updateLog = (field, value) => {
    if (!selectedKey) return;

    setVideoLogs(prev => ({
      ...prev,
      [selectedKey]: {
        ...(prev[selectedKey] || {}),
        [field]: value
      }
    }));
  };

  const daysInMonth = getDaysInMonth(currentMonth, year);
  const firstDay = getFirstDayOfMonth(currentMonth, year);

  const currentLog = selectedKey ? (videoLogs[selectedKey] || {}) : {};

  // 🔥 SAFE PARSE
  const retention = parseFloat(currentLog.retention) || 0;
  const saves = parseFloat(currentLog.saves) || 0;

  let score = 0;
  if (retention >= 40) score += 2;
  if (saves >= 5) score += 1;

  let verdict =
    score >= 3 ? "Repeta"
    : score >= 1 ? "Optimizeaza"
    : "Nu repeta";

  let diagnostic =
    retention < 30 ? "Retentie slaba"
    : saves < 3 ? "Nu genereaza salvare"
    : score >= 3 ? "Format bun"
    : "";

  return (
    <div className="card">

      {/* CALENDAR */}
      <div className="grid">
        {Array(firstDay).fill(null).map((_,i)=><div key={i}/> )}

        {Array.from({length: daysInMonth}).map((_,i)=>{
          const day=i+1;

          return (
            <div
              key={day}
              onClick={()=>setSelectedDay(day)}
              className={`day ${selectedDay===day ? "selected" : ""}`}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* DETALII */}
      {selectedDay && (
        <div>

          <h3>{selectedDay} {months[currentMonth]}</h3>

          <div>Scor: {score}</div>
          <div>{verdict}</div>
          <div>{diagnostic}</div>

          <input
            placeholder="retentie"
            value={currentLog.retention || ""}
            onChange={e=>updateLog("retention", e.target.value)}
          />

          <input
            placeholder="salvari"
            value={currentLog.saves || ""}
            onChange={e=>updateLog("saves", e.target.value)}
          />

          <textarea
            placeholder="note"
            value={(dailyNotes[selectedKey]||{}).log || ""}
            onChange={e=>updateNote("log", e.target.value)}
          />

        </div>
      )}
    </div>
  );
    }
