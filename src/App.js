import { useMemo, useState, useEffect } from "react";

const months = [
  "Ianuarie",
  "Februarie",
  "Martie",
  "Aprilie",
  "Mai",
  "Iunie",
  "Iulie",
  "August",
  "Septembrie",
  "Octombrie",
  "Noiembrie",
  "Decembrie"
];

const dayNames = ["Lu", "Ma", "Mi", "Jo", "Vi", "Sa", "Du"];

function getDaysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(month, year) {
  let day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function isWeekend(month, day, year) {
  const d = new Date(year, month, day).getDay();
  return d === 0 || d === 5 || d === 6;
}

function getDayName(month, day, year) {
  const d = new Date(year, month, day).getDay();
  const names = ["Duminica", "Luni", "Marti", "Miercuri", "Joi", "Vineri", "Sambata"];
  return names[d];
}

function storageKey(page, year) {
  return `calendar-${page}-${year}`;
}

function safeLoad(page, year) {
  try {
    const raw = localStorage.getItem(storageKey(page, year));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [page, setPage] = useState("anxios");

  return (
    <div className="app-shell">
      <div className="top-header">
        <div className="top-icon">🔴🌿</div>
        <div className="top-title">Calendar Postari 2026</div>
        <div className="top-subtitle">tracking separat pe nise</div>
      </div>

      <div className="tabs">
        <button
          onClick={() => setPage("anxios")}
          className={page === "anxios" ? "tab active" : "tab"}
        >
          🔴 Anxios & Evitant
        </button>

        <button
          onClick={() => setPage("reset")}
          className={page === "reset" ? "tab active" : "tab"}
        >
          🌿 Reset Bland
        </button>
      </div>

      <CalendarPage
        key={page}
        page={page}
        title={page === "anxios" ? "Anxios & Evitant" : "Reset Bland"}
        subtitle={page === "anxios" ? "anxios.si.evitant" : "reset.bland"}
      />
    </div>
  );
}

function CalendarPage({ page, title, subtitle }) {
  const year = 2026;

  const [currentMonth, setCurrentMonth] = useState(2);
const [selectedDay, setSelectedDay] = useState(27);
const [posted, setPosted] = useState({});
const [dailyNotes, setDailyNotes] = useState({});
const [videoLogs, setVideoLogs] = useState({});
  useEffect(() => {
  const saved = safeLoad(page, year);

  if (!saved) return;

  setCurrentMonth(saved.currentMonth ?? 2);
  setSelectedDay(saved.selectedDay ?? 27);
  setPosted(saved.posted ?? {});
  setDailyNotes(saved.dailyNotes ?? {});
  setVideoLogs(saved.videoLogs ?? {});
}, [page]);

  useEffect(() => {
    try {
      const data = {
        currentMonth,
        selectedDay,
        posted,
        dailyNotes,
        videoLogs
      };

      localStorage.setItem(
        storageKey(page, year),
        JSON.stringify(data)
      );
    } catch {}
  }, [page, year, currentMonth, selectedDay, posted, dailyNotes, videoLogs]);

  const daysInMonth = getDaysInMonth(currentMonth, year);
  const firstDay = getFirstDayOfMonth(currentMonth, year);

  const dayKey = (month, day) => `${year}-${month + 1}-${day}`;
  const platformKey = (month, day, platform) =>
    `${year}-${month + 1}-${day}-${platform}`;

  const selectedDayKey = selectedDay ? dayKey(currentMonth, selectedDay) : null;

  const getPostingTime = (month, day) => {
    const weekend = isWeekend(month, day, year);
    return {
      insta: weekend ? "20:30" : "21:00",
      tiktok: weekend ? "21:00" : "21:30"
    };
  };

  const togglePosted = (platform) => {
    if (!selectedDay) return;

    const key = platformKey(currentMonth, selectedDay, platform);

    setPosted((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const updateDailyNote = (field, value) => {
    if (!selectedDayKey) return;

    setDailyNotes((prev) => ({
      ...prev,
      [selectedDayKey]: {
        ...(prev[selectedDayKey] || {}),
        [field]: value
      }
    }));
  };

  const updateVideoLog = (field, value) => {
    if (!selectedDayKey) return;

    setVideoLogs((prev) => ({
      ...prev,
      [selectedDayKey]: {
        ...(prev[selectedDayKey] || {}),
        [field]: value
      }
    }));
  };

  const selectDay = (day) => {
    setSelectedDay((prev) => (prev === day ? null : day));
  };

  const isPostedAnyDay = (month, day) => {
    const ig = posted[platformKey(month, day, "insta")];
    const tt = posted[platformKey(month, day, "tiktok")];
    return { ig, tt, any: ig || tt };
  };

  const progress = useMemo(() => {
    const uniqueDays = new Set(
      Object.keys(posted)
        .filter((key) => posted[key])
        .map((key) => key.split("-").slice(0, 3).join("-"))
    );
    return Math.round((uniqueDays.size / 365) * 100);
  }, [posted]);

  const streak = useMemo(() => {
    let count = 0;
    for (let m = 0; m < 12; m++) {
      const dim = getDaysInMonth(m, year);
      for (let d = 1; d <= dim; d++) {
        const ig = posted[platformKey(m, d, "insta")];
        const tt = posted[platformKey(m, d, "tiktok")];
        if (ig || tt) count++;
        else return count;
      }
    }
    return count;
  }, [posted]);

  const currentNote = selectedDayKey ? (dailyNotes[selectedDayKey] || {}) : {};
  const currentLog = selectedDayKey ? (videoLogs[selectedDayKey] || {}) : {};

  const retentionValue = parseFloat(
    (currentLog.retention || "").toString().replace("%", "").replace(",", ".")
  );
  const completionsValue = parseFloat(
    (currentLog.completions || "").toString().replace("%", "").replace(",", ".")
  );
  const savesValue = parseFloat(
    (currentLog.saves || "").toString().replace(",", ".")
  );
  const followersValue = parseFloat(
    (currentLog.newFollowers || "").toString().replace(",", ".")
  );
  const dropValue = (currentLog.dropAt || "").trim();

  let score = 0;
  if (!isNaN(retentionValue) && retentionValue >= 40) score += 2;
  if (!isNaN(completionsValue) && completionsValue >= 10) score += 2;
  if (!isNaN(savesValue) && savesValue >= 5) score += 1;
  if (!isNaN(followersValue) && followersValue > 0) score += 1;
  if (dropValue === "0:01") score -= 1;

  const isWinner =
    (!isNaN(retentionValue) && retentionValue >= 40) ||
    (!isNaN(savesValue) && savesValue >= 5);

  const weakHook = dropValue === "0:01";

  let verdict = "";
  if (score >= 4) verdict = "Repeta stilul – asta functioneaza";
  else if (score >= 2) verdict = "Optimizeaza hook-ul";
  else verdict = "Nu repeta – schimba abordarea";

  let diagnostic = "";
  if (weakHook) {
    diagnostic = "Problema: Hook slab (pierdere in primele secunde)";
  } else if (!isNaN(savesValue) && savesValue < 3) {
    diagnostic = "Problema: Continutul nu genereaza salvari";
  } else if (!isNaN(retentionValue) && retentionValue < 30) {
    diagnostic = "Problema: Retentie scazuta (nu tine atentia)";
  } else if (score >= 4) {
    diagnostic = "Format validat – merita repetat";
  }

  return (
    <>
      <div className="page-head">
        <div className="page-title">{title}</div>
        <div className="page-subtitle">{subtitle}</div>
      </div>

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="mini-label">Streak</div>
          <div className="big-stat">{streak}</div>
        </div>

        <div className="card stat-card">
          <div className="mini-label">Progress</div>
          <div className="big-stat">{progress}%</div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="card calendar-card">
        <div className="month-nav">
          <button
            className="nav-btn"
            onClick={() => {
              setCurrentMonth((prev) => Math.max(0, prev - 1));
              setSelectedDay(null);
            }}
          >
            ‹
          </button>

          <div className="month-title">
            {months[currentMonth]} {year}
          </div>

          <button
            className="nav-btn"
            onClick={() => {
              setCurrentMonth((prev) => Math.min(11, prev + 1));
              setSelectedDay(null);
            }}
          >
            ›
          </button>
        </div>

        <div className="days-row">
          {dayNames.map((d) => (
            <div key={d} className="day-name">
              {d}
            </div>
          ))}
        </div>

        <div className="calendar-grid">
          {Array(firstDay)
            .fill(null)
            .map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isSelected = selectedDay === day;
            const weekend = isWeekend(currentMonth, day, year);
            const { ig, tt, any } = isPostedAnyDay(currentMonth, day);

            return (
              <button
                key={day}
                onClick={() => selectDay(day)}
                className={`day-cell ${isSelected ? "selected" : ""} ${
                  weekend ? "weekend" : ""
                }`}
              >
                <div className="day-number">{day}</div>

                {any && (
                  <div className="dots">
                    <span className={`dot ${ig ? "ig-on" : ""}`} />
                    <span className={`dot ${tt ? "tt-on" : ""}`} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <div className="card details-card">
          <div className="date-block">
            <div className="mini-label">
              {getDayName(currentMonth, selectedDay, year)}
            </div>
            <div className="date-title">
              {selectedDay} {months[currentMonth]} {year}
            </div>
          </div>

          <div className="badges">
            {isWinner && <span className="badge badge-winner">WINNER</span>}
            {weakHook && <span className="badge badge-weak">HOOK SLAB</span>}
            <span className="badge badge-score">SCOR {score}</span>
          </div>

          <div
            style={{
              marginTop: "10px",
              fontWeight: "bold",
              padding: "12px",
              borderRadius: "14px",
              background:
                score >= 4 ? "#e4f3e8" : score >= 2 ? "#fff3df" : "#fdeaea",
              color:
                score >= 4 ? "#2f6b42" : score >= 2 ? "#9a6a1b" : "#a04646",
              textAlign: "center"
            }}
          >
            {verdict}
          </div>

          <div
            style={{
              marginTop: "8px",
              fontSize: "13px",
              opacity: 0.8,
              textAlign: "center"
            }}
          >
            {diagnostic}
          </div>

          <div className="platform-boxes">
            <div className="platform-box">
              <div>
                <div className="mini-label">📸 Instagram</div>
                <div className="time-value">
                  {getPostingTime(currentMonth, selectedDay).insta}
                </div>
              </div>

              <button
                onClick={() => togglePosted("insta")}
                className={`toggle-circle insta ${
                  posted[platformKey(currentMonth, selectedDay, "insta")] ? "on" : ""
                }`}
              >
                {posted[platformKey(currentMonth, selectedDay, "insta")] ? "✓" : ""}
              </button>
            </div>

            <div className="platform-box">
              <div>
                <div className="mini-label">🎵 TikTok</div>
                <div className="time-value">
                  {getPostingTime(currentMonth, selectedDay).tiktok}
                </div>
              </div>

              <button
                onClick={() => togglePosted("tiktok")}
                className={`toggle-circle tiktok ${
                  posted[platformKey(currentMonth, selectedDay, "tiktok")] ? "on" : ""
                }`}
              >
                {posted[platformKey(currentMonth, selectedDay, "tiktok")] ? "✓" : ""}
              </button>
            </div>
          </div>

          <div className="field-block">
            <div className="mini-label">Comenzi</div>
            <input
              className="field"
              value={currentNote.commands || ""}
              onChange={(e) => updateDailyNote("commands", e.target.value)}
              placeholder={page === "anxios" ? "tt v3, tt v4" : "ig rb1, tt rb1"}
            />
          </div>

          <div className="field-block">
            <div className="mini-label">Log</div>
            <textarea
              className="field textarea"
              value={currentNote.log || ""}
              onChange={(e) => updateDailyNote("log", e.target.value)}
              placeholder={
                page === "anxios"
                  ? "VIDEO 3\n2404 views | 5.2 sec | 52% retentie..."
                  : "video calm, hook bland, salvari bune..."
              }
            />
          </div>

          <div className="field-block">
            <div className="mini-label">VIDEO nr</div>
            <input
              className="field"
              value={currentLog.videoNr || ""}
              onChange={(e) => updateVideoLog("videoNr", e.target.value)}
              placeholder="3 / 4"
            />
          </div>

          <div className="field-block">
            <div className="mini-label">Cadre</div>
            <textarea
              className="field textarea large"
              value={currentLog.frames || ""}
              onChange={(e) => updateVideoLog("frames", e.target.value)}
              placeholder="VIDEO 1: ..."
            />
          </div>

          <div className="field-block">
            <div className="mini-label">Caption</div>
            <textarea
              className="field textarea"
              value={currentLog.caption || ""}
              onChange={(e) => updateVideoLog("caption", e.target.value)}
              placeholder="caption video"
            />
          </div>

          <div className="metrics-grid">
            <MetricField
              label="Durata"
              value={currentLog.duration || ""}
              onChange={(value) => updateVideoLog("duration", value)}
              placeholder="9.98 / 13.01"
            />
            <MetricField
              label="Vizualizari"
              value={currentLog.views || ""}
              onChange={(value) => updateVideoLog("views", value)}
              placeholder="2404 / 518"
            />
            <MetricField
              label="Timp mediu"
              value={currentLog.avgTime || ""}
              onChange={(value) => updateVideoLog("avgTime", value)}
              placeholder="5.2 / 3.8"
            />
            <MetricField
              label="Completari"
              value={currentLog.completions || ""}
              onChange={(value) => updateVideoLog("completions", value)}
              placeholder="14.45 / 4.22"
            />
            <MetricField
              label="Retentie"
              value={currentLog.retention || ""}
              onChange={(value) => updateVideoLog("retention", value)}
              placeholder="52 / 29"
            />
            <MetricField
              label="Urmatori noi"
              value={currentLog.newFollowers || ""}
              onChange={(value) => updateVideoLog("newFollowers", value)}
              placeholder="11 / 0"
            />
            <MetricField
              label="Aprecieri"
              value={currentLog.likes || ""}
              onChange={(value) => updateVideoLog("likes", value)}
              placeholder="23"
            />
            <MetricField
              label="Distribuiri"
              value={currentLog.shares || ""}
              onChange={(value) => updateVideoLog("shares", value)}
              placeholder="-"
            />
            <MetricField
              label="Comentarii"
              value={currentLog.comments || ""}
              onChange={(value) => updateVideoLog("comments", value)}
              placeholder="1"
            />
            <MetricField
              label="Salvari"
              value={currentLog.saves || ""}
              onChange={(value) => updateVideoLog("saves", value)}
              placeholder="8"
            />
            <MetricField
              label="Drop la"
              value={currentLog.dropAt || ""}
              onChange={(value) => updateVideoLog("dropAt", value)}
              placeholder="0:01"
            />
            <MetricField
              label="Eligibil"
              value={currentLog.eligible || ""}
              onChange={(value) => updateVideoLog("eligible", value)}
              placeholder="da / nu"
            />
            <MetricField
              label="Ora postarii"
              value={currentLog.postTime || ""}
              onChange={(value) => updateVideoLog("postTime", value)}
              placeholder="15:36"
            />
            <MetricField
              label="Reactii la 0:00"
              value={currentLog.zeroSecondReaction || ""}
              onChange={(value) => updateVideoLog("zeroSecondReaction", value)}
              placeholder="71%"
            />
          </div>
        </div>
      )}
    </>
  );
}

function MetricField({ label, value, onChange, placeholder }) {
  return (
    <div className="metric-field">
      <div className="mini-label">{label}</div>
      <input
        className="field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
          }
