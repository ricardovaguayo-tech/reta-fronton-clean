import React, { useState, useEffect } from "react";

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
  const [mode, setMode] = useState("normal");
  const [theme, setTheme] = useState("dark");

  const [players, setPlayers] = useState([]);
  const [savedPlayers, setSavedPlayers] = useState([]);
  const [waiting, setWaiting] = useState([]);
  const [courts, setCourts] = useState({ teamA: [], teamB: [] });

  const [name, setName] = useState("");

  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);

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

    if (newResting && newResting.length === 0) newResting = null;

    setCourts({ teamA: newTeamA, teamB: newTeamB });
    setWaiting(newWaiting);
    setRestingTeam(newResting);
  };

  const addToList = () => {
    if (!name) return;
    if (!savedPlayers.includes(name)) {
      setSavedPlayers([...savedPlayers, name]);
    }
    setName("");
  };

  const removeSavedPlayer = (p) => {
    setSavedPlayers(savedPlayers.filter((x) => x !== p));
    removePlayer(p);
  };

  const resetScore = () => {
    setScoreA(0);
    setScoreB(0);
  };

  const winner = (side) => {
    const { teamA, teamB } = courts;
    if (teamA.length < 2 || teamB.length < 2) return;

    const winTeam = side === "A" ? teamA : teamB;
    const loseTeam = side === "A" ? teamB : teamA;

    let pool = [...waiting, ...loseTeam];

    if (restingTeam) {
      pool = [...restingTeam, ...pool];
      setRestingTeam(null);
    }

    if (mode === "king") {
      setCourts({
        teamA: winTeam,
        teamB: pool.slice(0, 2),
      });
      setWaiting(pool.slice(2));
      resetScore();
      return;
    }

    resetScore();

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

    const filtered = pool.filter((p) => !winTeam.includes(p));

    setCourts({
      teamA: winTeam,
      teamB: filtered.slice(0, 2),
    });

    setWaiting(filtered.slice(2));
    setCurrentChampion(winTeam);
    setConsecutiveWins(newWins);
  };

  const selected = (c, v) =>
    c === v ? { background: "#22c55e", color: "black" } : {};

  return (
    <div
      style={{
        padding: 20,
        maxWidth: "1100px",
        margin: "auto",
        minHeight: "100vh",
        color: "yellow",
        background: theme === "dark" ? "#111827" : "white",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <button onClick={() => setTheme("dark")} style={selected(theme, "dark")}>
            🌙 Oscuro
          </button>
          <button onClick={() => setTheme("light")} style={selected(theme, "light")}>
            ☀️ Claro
          </button>
        </div>

        <div>
          <button onClick={() => setMode("normal")} style={selected(mode, "normal")}>
            🎾 Modo Normal
          </button>
          <button onClick={() => setMode("king")} style={selected(mode, "king")}>
            👑 Rey de la Cancha
          </button>
        </div>
      </div>

      <h2 style={{ textAlign: "center" }}>🎾 Reta Frontón</h2>
      <h3>🔥 Racha: {consecutiveWins} / 2</h3>

      {/* ✅ LISTA (ya usa todas las funciones) */}
      <div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jugador"
        />
        <button style={{ marginLeft: 10 }} onClick={addToList}>
          Agregar
        </button>

        {savedPlayers.map((p, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <span style={{ marginRight: 12 }}>{p}</span>

            <button style={{ marginRight: 8 }} onClick={() => selectPlayer(p)}>
              ➕
            </button>

            <button onClick={() => removeSavedPlayer(p)}>❌</button>
          </div>
        ))}
      </div>

      {/* CANCHA */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Box color="#2563eb">
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <button onClick={() => setScoreA(0)}>🔄 Reset</button>
            <button disabled={scoreA <= scoreB} onClick={() => winner("A")}>
              ✅ Gana
            </button>
          </div>

          <h3>Equipo A</h3>
          {courts.teamA.map((p, i) => (
            <div key={i}>
              {p}
              <button style={{ marginLeft: 10 }} onClick={() => removePlayer(p)}>
                ❌
              </button>
            </div>
          ))}

          <div>{scoreA}</div>
          <button onClick={() => setScoreA(scoreA + 1)}>+ Punto</button>
        </Box>

        <Box color="#dc2626">
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <button onClick={() => setScoreB(0)}>🔄 Reset</button>
            <button disabled={scoreB <= scoreA} onClick={() => winner("B")}>
              ✅ Gana
            </button>
          </div>

          <h3>Equipo B</h3>
          {courts.teamB.map((p, i) => (
            <div key={i}>
              {p}
              <button style={{ marginLeft: 10 }} onClick={() => removePlayer(p)}>
                ❌
              </button>
            </div>
          ))}

          <div>{scoreB}</div>
          <button onClick={() => setScoreB(scoreB + 1)}>+ Punto</button>
        </Box>
      </div>

      <h3>🪑 Fila</h3>
      {waiting.map((p, i) => (
        <div key={i}>
          {p}
          <button style={{ marginLeft: 10 }} onClick={() => removePlayer(p)}>
            ❌
          </button>
        </div>
      ))}

      {restingTeam && (
        <div>
          💤 Descansando:
          {restingTeam.map((p, i) => (
            <div key={i}>
              {p}
              <button style={{ marginLeft: 10 }} onClick={() => removePlayer(p)}>
                ❌
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
