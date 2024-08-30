import axios from "axios";

const API_KEY = "5000781e3339485ab9f50e25c773bc14";
const ORACLE_URL =
  "https://makers-challenge.altscore.ai/v1/s1/e3/resources/oracle-rolodex";
const HEADERS = { accept: "application/json", "API-KEY": API_KEY };

// Function to fetch characters from SWAPI
async function fetchCharacters() {
  let characters = [];
  let url = "https://swapi.dev/api/people/";

  while (url) {
    const response = await axios.get(url);
    characters = characters.concat(response.data.results);
    url = response.data.next;
  }

  return characters;
}

// Function to query the Oracle Rolodex for character alignment
async function queryOracle(characterName) {
  try {
    const response = await axios.get(ORACLE_URL, {
      headers: HEADERS,
      params: { name: characterName },
    });
    const oracleNotes = response.data.oracle_notes;
    const decodedNotes = decodeBase64(oracleNotes);
    return decodeAlignment(decodedNotes);
  } catch (error) {
    console.error(`Error querying oracle for ${characterName}:`, error.message);
    return null;
  }
}

// Function to decode Base64 Oracle notes
function decodeBase64(encodedString) {
  return Buffer.from(encodedString, "base64").toString("utf-8");
}

// Function to determine the alignment based on the decoded notes
function decodeAlignment(decodedNotes) {
  if (decodedNotes.includes("Light Side")) {
    return "light";
  } else if (decodedNotes.includes("Dark Side")) {
    return "dark";
  }
  return null;
}

// Function to calculate IBF for each planet
function calculateIBF(planetData) {
  const ibfValues = [];

  for (const planet in planetData) {
    console.log(planet);
    const data = planetData[planet];
    const ibf = (data.light - data.dark) / data.total;
    ibfValues.push({ planet, ibf });
  }

  return ibfValues;
}

// Main function to find the planet with balanced IBF
async function findBalancePlanet() {
  const characters = await fetchCharacters();
  const planetData = {};

  for (const character of characters) {
    const alignment = await queryOracle(character.name);
    const planet = character.homeworld;

    if (!planetData[planet]) {
      planetData[planet] = { light: 0, dark: 0, total: 0, planetId: planet };
    }

    if (alignment === "light") {
      planetData[planet].light += 1;
    } else if (alignment === "dark") {
      planetData[planet].dark += 1;
    }
    planetData[planet].total += 1;
  }

  const ibfValues = calculateIBF(planetData);
  console.log("Planet Data:", planetData);
  console.log("IBF Values:", ibfValues);
  const balancedPlanet = ibfValues.reduce((closest, current) => {
    return Math.abs(current.ibf) < Math.abs(closest.ibf) ? current : closest;
  }, ibfValues[0]);

  return balancedPlanet.planet;
}

// Submit the solution (functionality to be added based on API requirements)
async function submitSolution(planet) {
  const SOLUTION_URL = "https://makers-challenge.altscore.ai/v1/s1/e3/solution";

  try {
    const response = await axios.post(
      SOLUTION_URL,
      { planet },
      { headers: HEADERS }
    );
    console.log(`Submitted Planet: ${planet}`);
    console.log("Response:", response.data);
  } catch (error) {
    console.error("Error submitting solution:", error.message);
  }
}

async function main() {
  const balancedPlanet = await findBalancePlanet();
  await submitSolution(balancedPlanet);
}

main();
