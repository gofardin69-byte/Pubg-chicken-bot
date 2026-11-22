const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let players = [
  { id: 1, name: "Main Account", chickens: 0 },
  { id: 2, name: "Second Account", chickens: 0 }
];

app.get("/api/players", (req, res) => {
  res.json(players);
});

app.post("/api/chickens", (req, res) => {
  const { playerId, amount } = req.body;

  if (!Number.isInteger(playerId) ||
      !Number.isInteger(amount) ||
      amount < 1 || amount > 1000) {
    return res.status(400).json({ error: "Invalid data" });
  }

  const player = players.find(p => p.id === playerId);

  if (!player) {
    return res.status(404).json({ error: "Player not found" });
  }

  player.chickens += amount;

  res.json({
    message: "Demo score updated",
    player
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
