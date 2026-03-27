import { useMemo, useState } from "react";

const months = [
  "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
  "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"
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

function storageKey(year) {
  return `calendar-postari-${year}`;
}

function safeLoad(year) {
  try {
    const raw = localStorage.getItem(storageKey(year));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function safeSave(year, value) {
  try {
    localStorage.setItem(storageKey(year), JSON.stringify(value));
  } catch {}
}

export default function App() {
  const year = 2026;

  const initialSaved = safeLoad(year);

  const [currentMonth, setCurrentMonth] = useState(
    initialSaved?.currentMonth ?? 2
  );
  const [selectedDay, setSelectedDay] = useState(
    initialSaved?.selectedDay ?? 27
  );

  const [posted, setPosted] = useState(initialSaved?.posted ?? {});
  const [dailyNotes, setDailyNotes] = useState(initialSaved?.dailyNotes ?? {});
  const [videoLogs, setVideoLogs] = useState(initialSaved?.videoLogs ?? {});

  const daysInMonth = getDaysInMonth(currentMonth, year);
  const firstDay = getFirstDayOfMonth(currentMonth, year);

  const getPostingTime = (month, day) => {
    const weekend = isWeekend(month, day, year);
    return {
      insta: weekend ? "20:30" : "21:00",
      tiktok: weekend ? "21:00" : "21:30"
    };
  };

  const dayKey = (month, day) => `${year}-${month + 1}-${day}`;
  const platformKey = (month, day, platform) =>
    `${year}-${month + 1}-${day}-${platform}`;

  const selectedDayKey = selectedDay
    ? dayKey(currentMonth, selectedDay)
    : null;

  const persist = (nextPartial) => {
    const next = {
      currentMonth,
      selectedDay,
      posted,
      dailyNotes,
      videoLogs,
      ...nextPartial
    };
    safeSave(year, next);
  };

  const togglePosted = (platform) => {
    if (!selectedDay) return;
    const key = platformKey(currentMonth, selectedDay, platform);
    const nextPosted = {
      ...posted,
      [key]: !posted[key]
    };
    setPosted(nextPosted);
    persist({ posted: nextPosted });
  };

  const updateDailyNote = (field, value) => {
    if (!selectedDayKey) return;
    const next = {
      ...dailyNotes,
      [selectedDayKey]: {
        ...(dailyNotes[selectedDayKey] || {}),
        [field]: value
      }
    };
    setDailyNotes(next);
    persist({ dailyNotes: next });
  };

  const updateVideoLog = (field, value) => {
    if (!selectedDayKey) return;
    const next = {
      ...videoLogs,
      [selectedDayKey]: {
        ...(videoLogs[selectedDayKey] || {}),
        [field]: value
      }
    };
    setVideoLogs(next);
    persist({ videoLogs: next });
  };

  const selectDay = (day) => {
    const next = selectedDay === day ? null : day;
    setSelectedDay(next);
    persist({ selectedDay: next });
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

  return (
    <div style={{ padding: 20 }}>
      <h2>Calendar Postari 2026</h2>

      <div>Streak: {streak}</div>
      <div>Progress: {progress}%</div>

      <div style={{ marginTop: 20 }}>
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          return (
            <button key={day} onClick={() => selectDay(day)}>
              {day}
            </button>
          );
        })}
      </div>

      {selectedDay && (
        <div style={{
