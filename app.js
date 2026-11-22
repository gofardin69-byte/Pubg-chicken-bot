const $ = (id) => document.getElementById(id);
let password = sessionStorage.getItem('dashboardPassword') || '';
let endAt = null;
let running = false;
let clock = null;

$('password').value = password;

function headers() {
  return { 'Content-Type': 'application/json', 'x-dashboard-password': password };
}
function formatTime(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, '0');
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}
function renderTimer() {
  const remaining = running && endAt ? Math.max(0, endAt - Date.now()) : 5 * 60 * 60 * 1000;
  $('countdown').textContent = formatTime(remaining);
  $('stateLabel').textContent = running ? 'RUNNING' : 'STOPPED';
  $('stateLabel').classList.toggle('running', running);
  $('timerNote').textContent = running ? `Scheduled end: ${new Date(endAt).toLocaleString()}` : 'Ready to start a five-hour demo session.';
  $('startBtn').disabled = running;
  $('stopBtn').disabled = !running;
}
function renderPlayers(players) {
  $('players').replaceChildren();
  players.forEach(p => {
    const row = document.createElement('div'); row.className = 'player';
    const name = document.createElement('strong'); name.textContent = p.name;
    const score = document.createElement('span'); score.className = 'score'; score.textContent = `🐔 ${p.chickens} demo points`;
    row.append(name, score); $('players').append(row);
  });
}
function renderLogs(logs) {
  const list = $('logs'); list.replaceChildren();
  if (!logs.length) { const li = document.createElement('li'); li.className = 'muted'; li.textContent = 'No activity yet.'; list.append(li); return; }
  logs.forEach(item => {
    const li = document.createElement('li');
    const time = document.createElement('time'); time.textContent = new Date(item.time).toLocaleString();
    const msg = document.createElement('span'); msg.textContent = item.message;
    li.append(time, msg); list.append(li);
  });
}
async function refresh() {
  try {
    const response = await fetch('/api/status');
    const data = await response.json();
    running = data.running; endAt = data.endAt;
    renderTimer(); renderPlayers(data.players); renderLogs(data.logs);
  } catch { $('timerNote').textContent = 'Cannot reach the server. Check the deployment.'; }
}
async function post(path, body = {}) {
  const response = await fetch(path, { method: 'POST', headers: headers(), body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}
$('savePassword').addEventListener('click', async () => {
  password = $('password').value;
  sessionStorage.setItem('dashboardPassword', password);
  try { const r = await fetch('/api/auth-check', { headers: headers() }); const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Password check failed'); $('authMessage').textContent = 'Password accepted.'; await refresh(); }
  catch (err) { $('authMessage').textContent = err.message; }
});
$('startBtn').addEventListener('click', async () => {
  try { await post('/api/start'); $('authMessage').textContent = 'Five-hour demo timer started.'; await refresh(); }
  catch (err) { $('authMessage').textContent = err.message; }
});
$('stopBtn').addEventListener('click', async () => {
  try { await post('/api/stop'); $('authMessage').textContent = 'Timer stopped.'; await refresh(); }
  catch (err) { $('authMessage').textContent = err.message; }
});
$('addPoints').addEventListener('click', async () => {
  const amount = Number($('amount').value);
  try { await post('/api/points', { playerId: Number($('playerSelect').value), amount }); $('pointsMessage').textContent = 'Demo points updated.'; await refresh(); }
  catch (err) { $('pointsMessage').textContent = err.message; }
});
$('refreshBtn').addEventListener('click', refresh);
refresh();
clock = setInterval(() => { if (running && endAt) renderTimer(); }, 1000);
setInterval(refresh, 10000);
