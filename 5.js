import axios from "axios";

async function startChallenge() {
  try {
    console.log("Starting the challenge...");
    const response = await axios.post(
      "https://makers-challenge.altscore.ai/v1/s1/e5/actions/start",
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "API-KEY": "5000781e3339485ab9f50e25c773bc14",
        },
      }
    );
    console.log("Challenge started:", response.data);
  } catch (error) {
    if (
      error.response &&
      error.response.data.code === "ConflictError" &&
      error.response.data.details.message ===
        "Contestant already started the challenge"
    ) {
      console.log("Challenge already started, proceeding...");
    } else {
      console.error(
        "Error starting the challenge:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  }
}

async function readRadar() {
  try {
    console.log("Reading radar...");
    const response = await axios.post(
      "https://makers-challenge.altscore.ai/v1/s1/e5/actions/perform-turn",
      {
        action: "radar",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "API-KEY": "5000781e3339485ab9f50e25c773bc14",
        },
      }
    );
    console.log("Radar read:", response.data);
    return response.data.action_result;
  } catch (error) {
    if (error.response && error.response.status === 409) {
      console.error("Radar read conflict:", error.response.data);
    } else {
      console.error(
        "Error reading radar:",
        error.response ? error.response.data : error.message
      );
    }
    throw error;
  }
}

function parseRadarData(radarData) {
  const rows = radarData.split("|");
  const grid = rows.map((row) => row.match(/.{3}/g));
  return grid;
}

function findPositions(grid) {
  let enemyPos = null;
  let hopePos = null;

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (grid[i][j].includes("^")) {
        enemyPos = [i, j];
      } else if (grid[i][j].includes("#")) {
        hopePos = [i, j];
      }
    }
  }

  return { enemyPos, hopePos };
}

function predictEnemyMovement(enemyPos, hopePos, grid) {
  let [ex, ey] = enemyPos;
  const [hx, hy] = hopePos;

  // Predict based on simple movement: move towards Hope
  if (ex < hx && grid[ex + 1][ey] !== "$") {
    ex += 1;
  } else if (ex > hx && grid[ex - 1][ey] !== "$") {
    ex -= 1;
  } else if (ey < hy && grid[ex][ey + 1] !== "$") {
    ey += 1;
  } else if (ey > hy && grid[ex][ey - 1] !== "$") {
    ey -= 1;
  }

  return [ex, ey];
}

async function executeAttack(finalPos) {
  const [x, y] = finalPos;
  const attackCoordinates = {
    x: String.fromCharCode(97 + y), // Convert 0-7 to 'a'-'h'
    y: x + 1, // Convert 0-7 to 1-8
  };

  try {
    console.log("Attacking position:", attackCoordinates);
    const response = await axios.post(
      "https://makers-challenge.altscore.ai/v1/s1/e5/actions/perform-turn",
      {
        action: "attack",
        attack_position: attackCoordinates,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "API-KEY": "5000781e3339485ab9f50e25c773bc14",
        },
      }
    );

    console.log(response.data);
  } catch (error) {
    if (error.response && error.response.status === 409) {
      console.error("Attack conflict:", error.response.data);
    } else {
      console.error(
        "Error executing the attack:",
        error.response ? error.response.data : error.message
      );
    }
  }
}

async function runChallenge() {
  await startChallenge();

  try {
    const radarReading1 = await readRadar(); // First radar read
    const grid1 = parseRadarData(radarReading1);
    const { enemyPos, hopePos } = findPositions(grid1);

    const predictedPos = predictEnemyMovement(enemyPos, hopePos, grid1);

    await executeAttack(predictedPos); // Attack based on prediction
  } catch (error) {
    console.error("An error occurred during the challenge:", error.message);
  }
}

runChallenge();
