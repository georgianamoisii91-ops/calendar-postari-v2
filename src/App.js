import { useMemo, useState, useEffect, useRef } from "react";

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

function createEmptyPlatform() {
  return {
    posted: false,

    // continut separat pe platforma
    fileName: "",
    videoLink: "",
    hookText: "",
    frames: "",
    caption: "",

    // metrics
    duration: "",
    views: "",
    avgTime: "",
    completions: "",
    retention: "",
    newFollowers: "",
    likes: "",
    shares: "",
    comments: "",
    saves: "",
    dropAt: "",
    eligible: "",
    postTime: "",
    zeroSecondReaction: ""
  };
}

function createEmptyVideo(index = 1) {
  return {
    id: `video-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: `Video ${index}`,
    videoNr: "",
    instagram: createEmptyPlatform(),
    tiktok: createEmptyPlatform()
  };
}

function normalizePlatform(raw) {
  const base = createEmptyPlatform();
  if (!raw || typeof raw !== "object") return base;

  return {
    ...base,
    ...raw,
    posted: !!raw.posted
  };
}

function normalizeVideoItem(raw, index = 1) {
  if (!raw || typeof raw !== "object") {
    return createEmptyVideo(index);
  }

  const hasSeparatedPlatforms = raw.instagram || raw.tiktok;

  if (hasSeparatedPlatforms) {
    return {
      id: raw.id || `video-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: raw.title || `Video ${index}`,
      videoNr: raw.videoNr || "",
      instagram: normalizePlatform(raw.instagram),
      tiktok: normalizePlatform(raw.tiktok)
    };
  }

  // migrare din structura veche
  // nu pot determina sigur platforma originala a campurilor comune vechi
  // pentru a nu pierde informatia, copiez campurile comune in ambele platforme
  const migratedContent = {
    fileName: raw.fileName || "",
    videoLink: raw.videoLink || "",
    hookText: raw.hookText || "",
    frames: raw.frames || "",
    caption: raw.caption || ""
  };

  return {
    id: raw.id || `video-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: raw.title || `Video ${index}`,
    videoNr: raw.videoNr || "",
    instagram: {
      ...createEmptyPlatform(),
      ...migratedContent
    },
    tiktok: {
      ...createEmptyPlatform(),
      ...migratedContent,
      duration: raw.duration || "",
      views: raw.views || "",
      avgTime: raw.avgTime || "",
      completions: raw.completions || "",
      retention: raw.retention || "",
      newFollowers: raw.newFollowers || "",
      likes: raw.likes || "",
      shares: raw.shares || "",
      comments: raw.comments || "",
      saves: raw.saves || "",
      dropAt: raw.dropAt || "",
      eligible: raw.eligible || "",
      postTime: raw.postTime || "",
      zeroSecondReaction: raw.zeroSecondReaction || ""
    }
  };
}

function normalizeVideoLogs(rawLogs) {
  if (!rawLogs || typeof rawLogs !== "object") return {};

  const normalized = {};

  Object.entries(rawLogs).forEach(([dayKey, value]) => {
    if (Array.isArray(value)) {
      normalized[dayKey] = value.map((item, index) =>
        normalizeVideoItem(item, index + 1)
      );
      return;
    }

    if (value && typeof value === "object") {
      normalized[dayKey] = [normalizeVideoItem(value, 1)];
      return;
    }

    normalized[dayKey] = [];
  });

  return normalized;
}

function getPlatformInsights(platformData) {
  const retentionValue = parseFloat(
    (platformData.retention || "").toString().replace("%", "").replace(",", ".")
  );
  const completionsValue = parseFloat(
    (platformData.completions || "").toString().replace("%", "").replace(",", ".")
  );
  const savesValue = parseFloat(
    (platformData.saves || "").toString().replace(",", ".")
  );
  const followersValue = parseFloat(
    (platformData.newFollowers || "").toString().replace(",", ".")
  );
  const dropValue = (platformData.dropAt || "").trim();

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

  return {
    score,
    isWinner,
    weakHook,
    verdict,
    diagnostic
  };
}

export default function App() {
  const [page, setPage] = useState("anxios");
  const fileInputRef = useRef(null);

  const exportData = () => {
    try {
      const payload = {
        exportedAt: new Date().toISOString(),
        data: {}
      };

      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("calendar-")) {
          const value = localStorage.getItem(key);
          if (value !== null) {
            payload.data[key] = value;
          }
        }
      });

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json"
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "calendar-postari-backup.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Exportul a esuat.");
    }
  };

  const importData = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (
        !parsed ||
        typeof parsed !== "object" ||
        !parsed.data ||
        typeof parsed.data !== "object"
      ) {
        alert("Fisier invalid.");
        return;
      }

      Object.entries(parsed.data).forEach(([key, value]) => {
        if (typeof value === "string") {
          localStorage.setItem(key, value);
        }
      });

      alert("Import reusit. Aplicatia se reincarca.");
      window.location.reload();
    } catch {
      alert("Importul a esuat.");
    } finally {
      event.target.value = "";
    }
  };

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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
          marginBottom: "16px"
        }}
      >
        <button onClick={exportData} className="tab">
          Export date
        </button>

        <button onClick={() => fileInputRef.current?.click()} className="tab">
          Import date
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          onChange={importData}
          style={{ display: "none" }}
        />
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
  const [loaded, setLoaded] = useState(false);
  const [openVideos, setOpenVideos] = useState({});

  useEffect(() => {
    setLoaded(false);

    const saved = safeLoad(page, year);

    if (saved) {
      setCurrentMonth(saved.currentMonth ?? 2);
      setSelectedDay(saved.selectedDay ?? 27);
      setPosted(saved.posted ?? {});
      setDailyNotes(saved.dailyNotes ?? {});
      setVideoLogs(normalizeVideoLogs(saved.videoLogs ?? {}));
    } else {
      setCurrentMonth(2);
      setSelectedDay(27);
      setPosted({});
      setDailyNotes({});
      setVideoLogs({});
    }

    setLoaded(true);
  }, [page, year]);

  useEffect(() => {
    if (!loaded) return;

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
  }, [loaded, page, year, currentMonth, selectedDay, posted, dailyNotes, videoLogs]);

  useEffect(() => {
    setOpenVideos({});
  }, [selectedDay, currentMonth, page]);

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

  const selectDay = (day) => {
    setSelectedDay((prev) => (prev === day ? null : day));
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

  const addVideo = () => {
    if (!selectedDayKey) return;

    setVideoLogs((prev) => {
      const currentVideos = prev[selectedDayKey] || [];
      const nextVideo = createEmptyVideo(currentVideos.length + 1);

      return {
        ...prev,
        [selectedDayKey]: [...currentVideos, nextVideo]
      };
    });
  };

  const removeVideo = (videoId) => {
    if (!selectedDayKey) return;

    setVideoLogs((prev) => {
      const currentVideos = prev[selectedDayKey] || [];
      return {
        ...prev,
        [selectedDayKey]: currentVideos.filter((video) => video.id !== videoId)
      };
    });
  };

  const updateVideoField = (videoId, field, value) => {
    if (!selectedDayKey) return;

    setVideoLogs((prev) => {
      const currentVideos = prev[selectedDayKey] || [];

      return {
        ...prev,
        [selectedDayKey]: currentVideos.map((video) =>
          video.id === videoId ? { ...video, [field]: value } : video
        )
      };
    });
  };

  const updatePlatformField = (videoId, platform, field, value) => {
    if (!selectedDayKey) return;

    setVideoLogs((prev) => {
      const currentVideos = prev[selectedDayKey] || [];

      return {
        ...prev,
        [selectedDayKey]: currentVideos.map((video) =>
          video.id === videoId
            ? {
                ...video,
                [platform]: {
                  ...video[platform],
                  [field]: value
                }
              }
            : video
        )
      };
    });
  };

  const togglePlatformPosted = (videoId, platform) => {
    if (!selectedDayKey) return;

    setVideoLogs((prev) => {
      const currentVideos = prev[selectedDayKey] || [];

      return {
        ...prev,
        [selectedDayKey]: currentVideos.map((video) =>
          video.id === videoId
            ? {
                ...video,
                [platform]: {
                  ...video[platform],
                  posted: !video[platform]?.posted
                }
              }
            : video
        )
      };
    });
  };

  const toggleVideo = (id) => {
    setOpenVideos((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getVideosForDay = (month, day) => {
    const key = dayKey(month, day);
    return videoLogs[key] || [];
  };

  const isPostedAnyDay = (month, day) => {
    const igManual = posted[platformKey(month, day, "insta")];
    const ttManual = posted[platformKey(month, day, "tiktok")];
    const videos = getVideosForDay(month, day);

    const igVideo = videos.some((video) => video.instagram?.posted);
    const ttVideo = videos.some((video) => video.tiktok?.posted);

    const ig = !!(igManual || igVideo);
    const tt = !!(ttManual || ttVideo);

    return { ig, tt, any: ig || tt };
  };

  const progress = useMemo(() => {
    let count = 0;

    for (let m = 0; m < 12; m++) {
      const dim = getDaysInMonth(m, year);
      for (let d = 1; d <= dim; d++) {
        if (isPostedAnyDay(m, d).any) count++;
      }
    }

    return Math.round((count / 365) * 100);
  }, [posted, videoLogs]);

  const streak = useMemo(() => {
    let count = 0;

    for (let m = 0; m < 12; m++) {
      const dim = getDaysInMonth(m, year);

      for (let d = 1; d <= dim; d++) {
        if (isPostedAnyDay(m, d).any) count++;
        else return count;
      }
    }

    return count;
  }, [posted, videoLogs]);

  const currentNote = selectedDayKey ? (dailyNotes[selectedDayKey] || {}) : {};
  const currentVideos = selectedDayKey ? (videoLogs[selectedDayKey] || []) : [];

  const dayScore = useMemo(() => {
    if (!currentVideos || currentVideos.length === 0) return 0;

    let total = 0;
    let count = 0;

    currentVideos.forEach((video) => {
      const ig = getPlatformInsights(video.instagram);
      const tt = getPlatformInsights(video.tiktok);

      if (video.instagram?.posted) {
        total += ig.score;
        count++;
      }

      if (video.tiktok?.posted) {
        total += tt.score;
        count++;
      }
    });

    if (count === 0) return 0;
    return Math.round(total / count);
  }, [currentVideos]);

  const getVideoHeader = (video, index) => {
    const ig = getPlatformInsights(video.instagram || createEmptyPlatform());
    const tt = getPlatformInsights(video.tiktok || createEmptyPlatform());

    const igPosted = video.instagram?.posted;
    const ttPosted = video.tiktok?.posted;

    return `Video ${index + 1} | IG ${igPosted ? "✓" : "✗"} ${ig.score} | TT ${ttPosted ? "✓" : "✗"} ${tt.score}`;
  };

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

          <div
            style={{
              marginTop: "10px",
              padding: "10px",
              borderRadius: "12px",
              background:
                dayScore >= 4 ? "#e4f3e8" : dayScore >= 2 ? "#fff3df" : "#fdeaea",
              textAlign: "center",
              fontWeight: "bold",
              marginBottom: "14px"
            }}
          >
            SCOR ZI: {dayScore}
          </div>

          <div className="platform-boxes">
            <div className="platform-box">
              <div>
                <div className="mini-label">📸 Instagram zi</div>
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
                <div className="mini-label">🎵 TikTok zi</div>
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
            <div className="mini-label">Log zi</div>
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

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "14px",
              gap: "10px"
            }}
          >
            <div style={{ fontWeight: "bold" }}>
              Video-uri: {currentVideos.length}
            </div>

            <button
              onClick={addVideo}
              className="tab"
              style={{ padding: "10px 14px" }}
            >
              + Adauga video
            </button>
          </div>

          {currentVideos.length === 0 && (
            <div
              style={{
                padding: "14px",
                borderRadius: "14px",
                background: "#fafaf8",
                border: "1px solid #ddd7cf",
                marginBottom: "14px",
                fontSize: "14px"
              }}
            >
              Nu exista video-uri pentru aceasta zi.
            </div>
          )}

          {currentVideos.map((video, index) => {
            const isOpen = !!openVideos[video.id];

            return (
              <div
                key={video.id}
                className="card"
                style={{
                  padding: "14px",
                  marginBottom: "14px",
                  boxShadow: "0 4px 16px rgba(93, 74, 55, 0.06)"
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleVideo(video.id)}
                  style={{
                    width: "100%",
                    border: "1px solid #e8ded2",
                    background: "#fffdfa",
                    borderRadius: "14px",
                    padding: "12px",
                    textAlign: "left",
                    fontWeight: "bold",
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: isOpen ? "12px" : "0"
                  }}
                >
                  <span>{getVideoHeader(video, index)}</span>
                  <span>{isOpen ? "▲" : "▼"}</span>
                </button>

                {isOpen && (
                  <>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "12px"
                      }}
                    >
                      <input
                        className="field"
                        value={video.title || ""}
                        onChange={(e) => updateVideoField(video.id, "title", e.target.value)}
                        placeholder={`Video ${index + 1}`}
                        style={{ marginBottom: 0 }}
                      />

                      <button
                        onClick={() => removeVideo(video.id)}
                        className="tab"
                        style={{
                          padding: "10px 12px",
                          whiteSpace: "nowrap"
                        }}
                      >
                        Sterge
                      </button>
                    </div>

                    <div className="field-block">
                      <div className="mini-label">VIDEO nr</div>
                      <input
                        className="field"
                        value={video.videoNr || ""}
                        onChange={(e) => updateVideoField(video.id, "videoNr", e.target.value)}
                        placeholder="3 / 4"
                      />
                    </div>

                    <PlatformSection
                      platformLabel="Instagram"
                      accentClass="insta"
                      data={video.instagram}
                      onTogglePosted={() => togglePlatformPosted(video.id, "instagram")}
                      onChange={(field, value) =>
                        updatePlatformField(video.id, "instagram", field, value)
                      }
                    />

                    <PlatformSection
                      platformLabel="TikTok"
                      accentClass="tiktok"
                      data={video.tiktok}
                      onTogglePosted={() => togglePlatformPosted(video.id, "tiktok")}
                      onChange={(field, value) =>
                        updatePlatformField(video.id, "tiktok", field, value)
                      }
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function PlatformSection({
  platformLabel,
  accentClass,
  data,
  onTogglePosted,
  onChange
}) {
  const insights = getPlatformInsights(data);

  return (
    <div
      style={{
        border: "1px solid #e8ded2",
        borderRadius: "16px",
        padding: "14px",
        marginBottom: "14px",
        background: "#fffdfa"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
          marginBottom: "12px"
        }}
      >
        <div style={{ fontWeight: "bold" }}>{platformLabel}</div>

        <button
          onClick={onTogglePosted}
          className={`toggle-circle ${accentClass} ${data.posted ? "on" : ""}`}
        >
          {data.posted ? "✓" : ""}
        </button>
      </div>

      <div className="field-block">
        <div className="mini-label">Nume fisier video</div>
        <input
          className="field"
          value={data.fileName || ""}
          onChange={(e) => onChange("fileName", e.target.value)}
          placeholder="video_27_platforma_01.mp4"
        />
      </div>

      <div className="field-block">
        <div className="mini-label">Link video</div>
        <input
          className="field"
          value={data.videoLink || ""}
          onChange={(e) => onChange("videoLink", e.target.value)}
          placeholder="link TikTok / Instagram"
        />
      </div>

      <div className="field-block">
        <div className="mini-label">Hook text (prima secunda)</div>
        <textarea
          className="field textarea"
          value={data.hookText || ""}
          onChange={(e) => onChange("hookText", e.target.value)}
          placeholder="textul exact din prima secunda"
        />
      </div>

      <div className="field-block">
        <div className="mini-label">Cadre</div>
        <textarea
          className="field textarea large"
          value={data.frames || ""}
          onChange={(e) => onChange("frames", e.target.value)}
          placeholder="cadre platforma"
        />
      </div>

      <div className="field-block">
        <div className="mini-label">Caption</div>
        <textarea
          className="field textarea"
          value={data.caption || ""}
          onChange={(e) => onChange("caption", e.target.value)}
          placeholder="caption platforma"
        />
      </div>

      <div className="badges">
        {insights.isWinner && <span className="badge badge-winner">WINNER</span>}
        {insights.weakHook && <span className="badge badge-weak">HOOK SLAB</span>}
        <span className="badge badge-score">SCOR {insights.score}</span>
      </div>

      <div
        style={{
          marginTop: "10px",
          fontWeight: "bold",
          padding: "12px",
          borderRadius: "14px",
          background:
            insights.score >= 4 ? "#e4f3e8" : insights.score >= 2 ? "#fff3df" : "#fdeaea",
          color:
            insights.score >= 4 ? "#2f6b42" : insights.score >= 2 ? "#9a6a1b" : "#a04646",
          textAlign: "center"
        }}
      >
        {insights.verdict}
      </div>

      <div
        style={{
          marginTop: "8px",
          fontSize: "13px",
          opacity: 0.8,
          textAlign: "center",
          marginBottom: "12px"
        }}
      >
        {insights.diagnostic}
      </div>

      <div className="metrics-grid">
        <MetricField
          label="Durata"
          value={data.duration || ""}
          onChange={(value) => onChange("duration", value)}
          placeholder="9.98 / 13.01"
        />
        <MetricField
          label="Vizualizari"
          value={data.views || ""}
          onChange={(value) => onChange("views", value)}
          placeholder="2404 / 518"
        />
        <MetricField
          label="Timp mediu"
          value={data.avgTime || ""}
          onChange={(value) => onChange("avgTime", value)}
          placeholder="5.2 / 3.8"
        />
        <MetricField
          label="Completari"
          value={data.completions || ""}
          onChange={(value) => onChange("completions", value)}
          placeholder="14.45 / 4.22"
        />
        <MetricField
          label="Retentie"
          value={data.retention || ""}
          onChange={(value) => onChange("retention", value)}
          placeholder="52 / 29"
        />
        <MetricField
          label="Urmatori noi"
          value={data.newFollowers || ""}
          onChange={(value) => onChange("newFollowers", value)}
          placeholder="11 / 0"
        />
        <MetricField
          label="Aprecieri"
          value={data.likes || ""}
          onChange={(value) => onChange("likes", value)}
          placeholder="23"
        />
        <MetricField
          label="Distribuiri"
          value={data.shares || ""}
          onChange={(value) => onChange("shares", value)}
          placeholder="-"
        />
        <MetricField
          label="Comentarii"
          value={data.comments || ""}
          onChange={(value) => onChange("comments", value)}
          placeholder="1"
        />
        <MetricField
          label="Salvari"
          value={data.saves || ""}
          onChange={(value) => onChange("saves", value)}
          placeholder="8"
        />
        <MetricField
          label="Drop la"
          value={data.dropAt || ""}
          onChange={(value) => onChange("dropAt", value)}
          placeholder="0:01"
        />
        <MetricField
          label="Eligibil"
          value={data.eligible || ""}
          onChange={(value) => onChange("eligible", value)}
          placeholder="da / nu"
        />
        <MetricField
          label="Ora postarii"
          value={data.postTime || ""}
          onChange={(value) => onChange("postTime", value)}
          placeholder="15:36"
        />
        <MetricField
          label="Reactii la 0:00"
          value={data.zeroSecondReaction || ""}
          onChange={(value) => onChange("zeroSecondReaction", value)}
          placeholder="71%"
        />
      </div>
    </div>
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
