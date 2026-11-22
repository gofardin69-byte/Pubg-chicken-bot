const playersBox = document.getElementById("players");
const playerSelect = document.getElementById("player");
const amountInput = document.getElementById("amount");
const addButton = document.getElementById("addButton");
const message = document.getElementById("message");

async function loadPlayers() {
  try {
    const response = await fetch("/api/players");
    if (!response.ok) throw new Error("Server error");

    const players = await response.json();

    playersBox.innerHTML = "";

    players.forEach(player => {
      const card = document.createElement("div");
      card.className = "player";

      const name = document.createElement("strong");
      name.textContent = player.name;

      const score = document.createElement("span");
      score.className = "score";
      score.textContent = `🐔 ${player.chickens}`;

      card.append(name, score);
      playersBox.appendChild(card);
    });
  } catch (error) {
    playersBox.textContent = "Could not load scores.";
  }
}

addButton.addEventListener("click", async () => {
  const playerId = Number(playerSelect.value);
  const amount = Number(amountInput.value);

  if (!Number.isInteger(amount) || amount < 1 || amount > 1000) {
    message.textContent = "Enter a number from 1 to 1000.";
    return;
  }

  addButton.disabled = true;
  message.textContent = "Updating...";

  try {
    const response = await fetch("/api/chickens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId, amount })
    });

    const result = await response.json();

    if (!response.ok) throw new Error(result.error);

    message.textContent = "Demo points added successfully!";
    amountInput.value = 1;
    await loadPlayers();
  } catch (error) {
    message.textContent = "Error: " + error.message;
  } finally {
    addButton.disabled = false;
  }
});

loadPlayers();
