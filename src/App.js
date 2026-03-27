import { useState } from "react";

export default function App() {
  const [selectedDay, setSelectedDay] = useState(27);
  const [page, setPage] = useState("anxios");

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div
      style={{
        maxWidth: "560px",
        margin: "0 auto",
        fontFamily: "Georgia, serif",
        padding: "20px"
      }}
    >
      {/* HEADER */}
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <div style={{ fontSize: "24px", fontWeight: "bold" }}>
          Calendar Postari 2026
        </div>
        <div style={{ fontSize: "12px", color: "#888" }}>
          tracking separat pe nise
        </div>
      </div>

      {/* TABS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
          marginBottom: "16px"
        }}
      >
        <button
          onClick={() => setPage("anxios")}
          style={{
            padding: "12px",
            borderRadius: "14px",
            border: "none",
            background:
              page === "anxios"
                ? "linear-gradient(180deg, #2d2a26 0%, #463f38 100%)"
                : "#ece5dc",
            color: page === "anxios" ? "#fff" : "#2d2a26",
            fontWeight: "bold"
          }}
        >
          Anxios
        </button>

        <button
          onClick={() => setPage("reset")}
          style={{
            padding: "12px",
            borderRadius: "14px",
            border: "none",
            background:
              page === "reset"
                ? "linear-gradient(180deg, #2d2a26 0%, #463f38 100%)"
                : "#ece5dc",
            color: page === "reset" ? "#fff" : "#2d2a26",
            fontWeight: "bold"
          }}
        >
          Reset Bland
        </button>
      </div>

      {/* CALENDAR */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "6px",
          marginBottom: "20px"
        }}
      >
        {days.map((day) => {
          const isSelected = selectedDay === day;

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              style={{
                aspectRatio: "1",
                borderRadius: "14px",
                border: isSelected
                  ? "1px solid #2d2a26"
                  : "1px solid #e8ded2",
                background: isSelected
                  ? "linear-gradient(180deg, #2d2a26 0%, #463f38 100%)"
                  : "#fffdfa",
                color: isSelected ? "#fff" : "#2d2a26",
                cursor: "pointer",
                boxShadow: isSelected
                  ? "0 6px 14px rgba(45,42,38,0.18)"
                  : "0 1px 4px rgba(45,42,38,0.05)"
              }}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* DETAILS */}
      <div
        style={{
          background: "#fff",
          borderRadius: "18px",
          padding: "16px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)"
        }}
      >
        <div style={{ marginBottom: "10px", fontWeight: "bold" }}>
          Ziua {selectedDay}
        </div>

        <div style={{ marginBottom: "10px" }}>
          <div style={{ fontSize: "12px", color: "#888" }}>
            TikTok
          </div>
          <button
            style={{
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #ddd"
            }}
          >
            Toggle TikTok
          </button>
        </div>

        <div>
          <div style={{ fontSize: "12px", color: "#888" }}>
            Log video
          </div>
          <textarea
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #ddd"
            }}
          />
        </div>
      </div>
    </div>
  );
}
