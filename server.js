const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'state.json');
const FIVE_HOURS = 5 * 60 * 60 * 1000;

app.use(express.json({ limit: '20kb' }));
app.use(express.static(path.join(__dirname, 'public')));

let state = {
  running: false,
  startedAt: null,
  endAt: null,
  players: [
    { id: 1, name: 'Main Account (demo)', chickens: 0 },
    { id: 2, name: 'Second Account (demo)', chickens: 0 }
  ],
  logs: []
};

function addLog(message) {
  state.logs.unshift({ time: new Date().toISOString(), message });
  state.logs = state.logs.slice(0, 40);
}

function saveState() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error('Could not save state:', err.message);
  }
}

function loadState() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const saved = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      state = { ...state, ...saved };
    }
  } catch (err) {
    console.error('Could not load saved state:', err.message);
  }
  if (state.running && state.endAt && Date.now() >= state.endAt) {
    state.running = false;
    addLog('Five-hour timer finished after server restart.');
    saveState();
  }
}

function updateTimer() {
  if (state.running && state.endAt && Date.now() >= state.endAt) {
    state.running = false;
    addLog('Five-hour timer completed. Demo task stopped.');
    saveState();
  }
}

function requirePassword(req, res, next) {
  if (!DASHBOARD_PASSWORD) {
    return res.status(503).json({ error: 'Set DASHBOARD_PASSWORD in the hosting service environment variables first.' });
  }
  const supplied = req.get('x-dashboard-password') || '';
  if (supplied !== DASHBOARD_PASSWORD) {
    return res.status(401).json({ error: 'Incorrect dashboard password.' });
  }
  next();
}

loadState();
setInterval(updateTimer, 1000);

app.get('/api/auth-check', requirePassword, (req, res) => res.json({ ok: true }));

app.get('/api/status', (req, res) => {
  updateTimer();
  const remainingMs = state.running ? Math.max(0, state.endAt - Date.now()) : 0;
  res.json({
    running: state.running,
    startedAt: state.startedAt,
    endAt: state.endAt,
    remainingMs,
    players: state.players,
    logs: state.logs,
    integration: 'demo-only'
  });
});

app.post('/api/start', requirePassword, (req, res) => {
  updateTimer();
  if (state.running) return res.status(409).json({ error: 'The five-hour timer is already running.' });
  state.running = true;
  state.startedAt = Date.now();
  state.endAt = state.startedAt + FIVE_HOURS;
  addLog('Five-hour demo timer started.');
  saveState();
  res.json({ ok: true, endAt: state.endAt });
});

app.post('/api/stop', requirePassword, (req, res) => {
  updateTimer();
  state.running = false;
  state.endAt = null;
  addLog('Demo timer stopped manually.');
  saveState();
  res.json({ ok: true });
});

app.post('/api/points', requirePassword, (req, res) => {
  const playerId = Number(req.body.playerId);
  const amount = Number(req.body.amount);
  if (!Number.isInteger(playerId) || !Number.isInteger(amount) || amount < 1 || amount > 1000) {
    return res.status(400).json({ error: 'Enter a whole number from 1 to 1000.' });
  }
  const player = state.players.find(p => p.id === playerId);
  if (!player) return res.status(404).json({ error: 'Demo account not found.' });
  player.chickens += amount;
  addLog(`${amount} demo points added to ${player.name}.`);
  saveState();
  res.json({ ok: true, player });
});

app.get('/health', (req, res) => res.status(200).send('ok'));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Demo dashboard listening on port ${PORT}`);
});
