import axios from "axios";

// Paso 1: Convertir la bitácora a una matriz 8x8
function parseRadarData(radarData) {
  const rows = radarData.split("|");
  const grid = rows.map((row) => row.match(/.{3}/g)); // Dividir cada fila en bloques de 3 caracteres
  return grid;
}

// Paso 2: Determinar la posición inicial de la nave enemiga y la nave Hope
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

// Paso 3: Predecir el movimiento de la nave enemiga
function predictEnemyMovement(enemyPos, hopePos, grid) {
  let [x, y] = enemyPos;
  const [hx, hy] = hopePos;
  const path = [];

  for (let turn = 0; turn < 4; turn++) {
    if (x < hx && grid[x + 1][y].includes("$") === false) {
      x += 1;
    } else if (y < hy && grid[x][y + 1].includes("$") === false) {
      y += 1;
    } else if (x > hx && grid[x - 1][y].includes("$") === false) {
      x -= 1;
    } else if (y > hy && grid[x][y - 1].includes("$") === false) {
      y -= 1;
    }
    path.push([x, y]);
  }

  return path[path.length - 1];
}

// Paso 4: Ejecutar el ataque
async function executeAttack(finalPos) {
  const [x, y] = finalPos;
  const attackCoordinates = String.fromCharCode(97 + y) + (x + 1);

  try {
    const response = await axios.post(
      "https://makers-challenge.altscore.ai/v1/s1/e4/solution",
      {
        username: "Not all those who wander", // Reemplaza con el username correcto si es necesario
        password: "are lost", // Reemplaza con la contraseña correcta si es necesario
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
    console.error(
      "Error al ejecutar el ataque:",
      error.response ? error.response.data : error.message
    );
  }
}

// Ejecución del flujo
const radarData =
  "a01a02a03a04a05a06a07a08|b01b02b03b04b$5b06b07b08|c01c02c03c04c05c06c07c$8|d01d02d03d04d05d06d07d08|e01e02e03e04e$5e06e^7e08|f01f02f03f04f$5f06f07f08|g01g02g03g04g05g06g07g08|h01h02h03h04h05h#6h07h08|";

const grid = parseRadarData(radarData);
const { enemyPos, hopePos } = findPositions(grid);
const finalPos = predictEnemyMovement(enemyPos, hopePos, grid);

executeAttack(finalPos);
