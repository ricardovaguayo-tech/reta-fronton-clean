import { useState, useEffect } from "react";

const Box = ({ children, color }) => (
  <div
    style={{
      border: "2px solid black",
      padding: "12px",
      borderRadius: "14px",
      background: color,
      color: "yellow",
      minHeight: "160px",
      width: "100%",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    {children}
  </div>
);

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [mode, setMode] = useState("normal");

  const [players, setPlayers] = useState([]);
  const [savedPlayers, setSavedPlayers] = useState([]);
  const [waiting, setWaiting] = useState([]);
  const [courts, setCourts] = useState({ teamA: [], teamB: [] });

  const [name, setName] = useState("");
  const [showList, setShowList] = useState(false);

  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);

  const [wins, setWins] = useState({});
  const [consecutiveWins, setConsecutiveWins] = useState(0);
  const [currentChampion, setCurrentChampion] = useState(null);
  const [restingTeam, setRestingTeam] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("players");
    if (data) setSavedPlayers(JSON.parse(data));
  }, []);

  useEffect(() => {
    localStorage.setItem("players", JSON.stringify(savedPlayers));
  }, [savedPlayers]);

  const buildTeams = (list) => {
    if (list.length < 4) return { teamA: [], teamB: [], rest: list };
    return {
      teamA: [list[0], list[1]],
      teamB: [list[2], list[3]],
      rest: list.slice(4),
    };
  };

  const selectPlayer = (p) => {
    if (players.includes(p)) return;

    const updated = [...players, p];
    setPlayers(updated);

    const { teamA, teamB, rest } = buildTeams(updated);
    setCourts({ teamA, teamB });
    setWaiting(rest);
  };

  const removePlayer = (p) => {
    const updatedPlayers = players.filter((x) => x !== p);
    setPlayers(updatedPlayers);

    let newTeamA = courts.teamA.filter((x) => x !== p);
    let newTeamB = courts.teamB.filter((x) => x !== p);
    let newWaiting = waiting.filter((x) => x !== p);

    let newResting = restingTeam
      ? restingTeam.filter((x) => x !== p)
      : null;

    if (newTeamA.length < 2 && newWaiting.length > 0) {
      newTeamA.push(newWaiting[0]);
      newWaiting = newWaiting.slice(1);
    }

    if (newTeamB.length < 2 && newWaiting.length > 0) {
      newTeamB.push(newWaiting[0]);
      newWaiting = newWaiting.slice(1);
    }

    if (newResting && newResting.length < 2 && newWaiting.length > 0) {
      newResting.push(newWaiting[0]);
      newWaiting = newWaiting.slice(1);
    }

    if (newResting && newResting.length === 0) {
      newResting = null;
    }

    setCourts({ teamA: newTeamA, teamB: newTeamB });
    setWaiting(newWaiting);
    setRestingTeam(newResting);
  };

  const winner = (side) => {
    const { teamA, teamB } = courts;
    const winTeam = side === "A" ? teamA : teamB;
    const loseTeam = side === "A" ? teamB : teamA;

    // ✅ MODO REY
    if (mode === "king" && players.length === 6) {
      const pool = [...waiting, ...loseTeam];

      const challengers = pool.slice(0, 2);
      const rest = pool.slice(2);

      setCourts({
        teamA: winTeam,
        teamB: challengers,
      });

      setWaiting(rest);
      return;
    }

    // ✅ lógica normal (sin cambios)
    let pool = [...waiting, ...loseTeam];

    if (restingTeam) {
      pool = [...restingTeam, ...pool];
      setRestingTeam(null);
    }

    setScoreA(0);
    setScoreB(0);

    const sameChampion =
      currentChampion &&
      JSON.stringify(currentChampion) === JSON.stringify(winTeam);

    let newWins = sameChampion ? consecutiveWins + 1 : 1;

    if (newWins >= 2) {
      setRestingTeam(winTeam);
      setCurrentChampion(null);
      setConsecutiveWins(0);

      const { teamA, teamB, rest } = buildTeams(pool);
      setCourts({ teamA, teamB });
      setWaiting(rest);
      return;
    }

    const filteredPool = pool.filter((p) => !winTeam.includes(p));

    const challengers = filteredPool.slice(0, 2);
    const rest = filteredPool.slice(2);

    setCourts({ teamA: winTeam, teamB: challengers });
    setWaiting(rest);
    setCurrentChampion(winTeam);
    setConsecutiveWins(newWins);
  };

  return (
    <div
      style={{
        padding: 20,
        maxWidth: "1100px",
        margin: "auto",
        minHeight: "100vh",
        color: "yellow",
        background: darkMode ? "#111827" : "white",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "☀️ Claro" : "🌙 Oscuro"}
        </button>

        <button onClick={() => setMode(mode === "normal" ? "king" : "normal")}>
          {mode === "normal" ? "👑 Rey de la cancha" : "🎾 Modo normal"}
        </button>
      </div>

      <h2 style={{ textAlign: "center" }}>🎾 Reta Frontón</h2>

      <h3>🔥 Racha: {consecutiveWins} / 2</h3>

      <div style={{ marginBottom: "40px" }}>
        <h3 onClick={() => setShowList(!showList)}>
          📋 Jugadores {showList ? "▲" : "▼"}
        </h3>

        {showList &&
          savedPlayers.map((p, i) => (
            <div key={i} style={{ marginBottom: "8px" }}>
              <span style={{ marginRight: "10px" }}>{p}</span>

              <button
                style={{ marginRight: "8px" }}
                onClick={() => selectPlayer(p)}
              >
                ➕
              </button>

              <button onClick={() => removePlayer(p)}>❌</button>
            </div>
          ))}
      </div>

      <h2 style={{ textAlign: "center" }}>🎾 CANCHA</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
        <Box color="#2563eb">
          <h3>Equipo A</h3>
          {courts.teamA.map((p, i) => (
            <div key={i}>
              {p} <button onClick={() => removePlayer(p)}>❌</button>
            </div>
          ))}
          <div>{scoreA}</div>
          <button onClick={() => setScoreA(scoreA + 1)}>+ Punto</button>
          <button onClick={() => winner("A")}>Gana</button>
        </Box>

        <Box color="#dc2626">
          <h3>Equipo B</h3>
          {courts.teamB.map((p, i) => (
            <div key={i}>
              {p} <button onClick={() => removePlayer(p)}>❌</button>
            </div>
          ))}
          <div>{scoreB}</div>
          <button onClick={() => setScoreB(scoreB + 1)}>+ Punto</button>
          <button onClick={() => winner("B")}>Gana</button>
        </Box>
      </div>

      <h3>🪑 Fila</h3>
      {waiting.map((p, i) => (
        <div key={i}>
          {p} <button onClick={() => removePlayer(p)}>❌</button>
        </div>
      ))}

      {restingTeam && (
        <div>
          💤 Descansando:
          {restingTeam.map((p, i) => (
            <div key={i}>
              {p}
              <button
                style={{ marginLeft: "10px" }}
                onClick={() => removePlayer(p)}
              >
                ❌
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}