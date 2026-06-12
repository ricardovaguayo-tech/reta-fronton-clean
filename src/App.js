
import { useState, useEffect } from "react";

const Box = ({ children, color }) => (
  <div
    style={{
      border: "2px solid black",
      padding: "12px",
      borderRadius: "14px",
      background: color,
      color: "white",
      minHeight: "100px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    {children}
  </div>
);

export default function App() {
  const [players, setPlayers] = useState([]);
  const [savedPlayers, setSavedPlayers] = useState([]);
  const [waiting, setWaiting] = useState([]);
  const [courts, setCourts] = useState({ teamA: [], teamB: [] });

  const [name, setName] = useState("");
  const [streak, setStreak] = useState(0);
  const [restingTeam, setRestingTeam] = useState(null);
  const [showList, setShowList] = useState(false);

  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);

  const [wins, setWins] = useState({});

  useEffect(() => {
    const data = localStorage.getItem("players");
    if (data) setSavedPlayers(JSON.parse(data));
  }, []);

  useEffect(() => {
    localStorage.setItem("players", JSON.stringify(savedPlayers));
  }, [savedPlayers]);

  const buildTeams = (list) => {
    if (list.length < 4) {
      return { teamA: [], teamB: [], rest: list };
    }

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

  const addToList = () => {
    if (!name) return;

    if (!savedPlayers.includes(name)) {
      setSavedPlayers([...savedPlayers, name]);
    }

    setName("");
  };

  const addWin = (team) => {
    const copy = { ...wins };

    team.forEach((p) => {
      copy[p] = (copy[p] || 0) + 1;
    });

    setWins(copy);
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

    addWin(winTeam);

    let pool = [...waiting, ...loseTeam];

    if (restingTeam) {
      pool = [...restingTeam, ...pool];
      setRestingTeam(null);
    }

    const newStreak = streak + 1;

    resetScore();

    if (pool.length >= 4) {
      if (newStreak >= 2) {
        setRestingTeam(winTeam);

        const { teamA, teamB, rest } = buildTeams(pool);

        setCourts({ teamA, teamB });
        setWaiting(rest);
        setStreak(0);
        return;
      }

      const { teamA, teamB, rest } = buildTeams(pool);

      setCourts({ teamA, teamB });
      setWaiting(rest);
      setStreak(newStreak);
    } else {
      setWaiting(pool);
      setStreak(newStreak);
    }
  };

  const ranking = Object.entries(wins).sort((a, b) => b[1] - a[1]);

  return (
    <div style={{ padding: 20 }}>
      <h2>🎾 Reta Frontón</h2>

      <h3>🔥 Racha: {streak} / 2</h3>

      <h3 onClick={() => setShowList(!showList)}>
        📋 Jugadores {showList ? "▲" : "▼"}
      </h3>

      {showList && (
        <>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nuevo jugador"
          />

          <button onClick={addToList}>Agregar</button>

          {savedPlayers.map((p, i) => (
            <div key={i}>
              <button onClick={() => selectPlayer(p)}>{p}</button>
            </div>
          ))}
        </>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <Box color="blue">
          <h3>Equipo A</h3>
          {courts.teamA.map((p, i) => (
            <div key={i}>{p}</div>
          ))}

          <div>{scoreA}</div>

          <button onClick={() => setScoreA(scoreA + 1)}>
            + Punto
          </button>

          <button
            disabled={scoreA <= scoreB}
            onClick={() => winner("A")}
          >
            Gana
          </button>
        </Box>

        <Box color="red">
          <h3>Equipo B</h3>
          {courts.teamB.map((p, i) => (
            <div key={i}>{p}</div>
          ))}

          <div>{scoreB}</div>

          <button onClick={() => setScoreB(scoreB + 1)}>
            + Punto
          </button>

          <button
            disabled={scoreB <= scoreA}
            onClick={() => winner("B")}
          >
            Gana
          </button>
        </Box>
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>🪑 Fila</h3>

        {waiting.length === 0 ? (
          <div>Sin espera</div>
        ) : (
          waiting.map((p, i) => <div key={i}>{p}</div>)
        )}
      </div>

      <div>
        <h3>🏆 Ranking</h3>

        {ranking.map(([p, w], i) => (
          <div key={i}>
            {i + 1}. {p} - {w}
          </div>
        ))}
      </div>

      {restingTeam && (
        <div>💤 Descansando: {restingTeam.join(", ")}</div>
      )}
    </div>
  );
}
