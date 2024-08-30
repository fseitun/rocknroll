import axios from "axios";

// List of types to process
const types = [
  "bug",
  "dark",
  "dragon",
  "electric",
  "fairy",
  "fighting",
  "fire",
  "flying",
  "ghost",
  "grass",
  "ground",
  "ice",
  "normal",
  "poison",
  "psychic",
  "rock",
  "steel",
  "water",
];

// Function to fetch all types and their associated Pokémon
async function fetchAllTypes() {
  try {
    const response = await axios.get(
      "https://pokeapi.co/api/v2/type/?limit=10000"
    );
    console.log("Fetched all types");
    return response.data.results;
  } catch (error) {
    console.error("Error fetching all types:", error.message);
    return [];
  }
}

// Function to fetch Pokémon for a specific type and calculate average height
async function fetchPokemonAndCalculateAverageHeight(typeUrl) {
  try {
    const response = await axios.get(typeUrl);
    const pokemonList = response.data.pokemon;

    let totalHeight = 0;
    let count = 0;

    for (const entry of pokemonList) {
      try {
        const pokemonData = await axios.get(entry.pokemon.url);
        const height = pokemonData.data.height;
        if (height === 0 || height === "0" || Number.isNaN(height)) {
          console.log(`Skipping ${entry.pokemon.name} as height is 0 or NaN`);
          continue;
        }
        totalHeight += height;
        count += 1;
        console.log(`Fetched data for ${entry.pokemon.name}: height=${height}`);
        console.log(`Total height=${totalHeight}, count=${count}`);
      } catch (error) {
        console.error(
          `Error fetching data for ${entry.pokemon.name}:`,
          error.message
        );
      }
    }

    const averageHeight = count > 0 ? (totalHeight / count).toFixed(3) : 0;
    return parseFloat(averageHeight);
  } catch (error) {
    console.error("Error processing type:", error.message);
    return 0;
  }
}

// Main function to process all types and calculate average heights
async function main() {
  const allTypes = await fetchAllTypes();

  const heights = {};

  for (const typeName of types) {
    const type = allTypes.find((t) => t.name === typeName);
    if (type) {
      console.log("-------------------------------");
      console.log(`Processing type: ${typeName}`);
      const averageHeight = await fetchPokemonAndCalculateAverageHeight(
        type.url
      );
      heights[typeName] = averageHeight;
      console.log(`Average height for ${typeName}: ${averageHeight}`);
      console.log("-------------------------------");
    } else {
      console.log(`Type ${typeName} not found`);
      heights[typeName] = 0;
    }
  }

  // Sorting keys alphabetically
  const sortedHeights = Object.keys(heights)
    .sort()
    .reduce((obj, key) => {
      obj[key] = heights[key];
      return obj;
    }, {});

  console.log(JSON.stringify({ heights: sortedHeights }, null, 2));
}

main();
