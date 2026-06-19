
import { useState, useEffect } from "react";

const Box = ({ children, color, darkMode }) => (
  <div
    style={{
      border: darkMode ? "1px solid #444" : "2px solid black",
      padding: "12px",
      borderRadius: "14px",
      background: darkMode ? "rgba(0,0,0,0.6)" : color,
      color: "white",
      minHeight: "160px",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: "center",
      backdropFilter: "blur(4px)",
    }}
  >
    {children}
  </div>
);

export default function App() {
  const [darkMode, setDarkMode] = useState(true);

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

    setCourts({
      teamA: newTeamA,
      teamB: newTeamB,
    });

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
    const updated = savedPlayers.filter((x) => x !== p);
    setSavedPlayers(updated);
    removePlayer(p);
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

    const filteredPool = pool.filter((p) => !winTeam.includes(p));

    const challengers = filteredPool.slice(0, 2);
    const rest = filteredPool.slice(2);

    setCourts({
      teamA: winTeam,
      teamB: challengers,
    });

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
        color: "white",
        backgroundImage: darkMode
          ? "url('/fronton.png')"
          : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: darkMode ? "rgba(0,0,0,0.7)" : "white",
        backgroundBlendMode: "darken",
      }}
    >
      <h2 style={{ textAlign: "center" }}>🎾 Reta Frontón</h2>

      <button onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "☀️ Claro" : "🌙 Oscuro"}
      </button>

      <h3>🔥 Racha: {consecutiveWins} / 2</h3>

      <div style={{ marginBottom: "40px" }}>
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
                {p}
                <button onClick={() => selectPlayer(p)}>➕</button>
                <button onClick={() => removeSavedPlayer(p)}>❌</button>
              </div>
            ))}
          </>
        )}
      </div>

      <h2 style={{ textAlign: "center" }}>🎾 CANCHA</h2>

      {/* Equipos igual que antes */}
    </div>
  );
}
