import axios from "axios";

const API_URL = "https://makers-challenge.altscore.ai/v1/s1/e2/resources/stars";
const SOLUTION_URL = "https://makers-challenge.altscore.ai/v1/s1/e2/solution";
const HEADERS = {
  accept: "application/json",
  "API-KEY": "5000781e3339485ab9f50e25c773bc14",
};

function calculateDistance(position) {
  return Math.sqrt(position.x ** 2 + position.y ** 2 + position.z ** 2);
}

async function fetchStarData(page = 1, sortBy = "id", sortDirection = "desc") {
  try {
    const response = await axios.get(API_URL, {
      headers: HEADERS,
      params: { page, "sort-by": sortBy, "sort-direction": sortDirection },
    });

    // const cloudTrace = response.headers["x-cloud-trace-context"];
    // console.log("x-cloud-trace-context:", cloudTrace);
    consolee.log("headers:", response.headers);

    return response.data.map((star) => {
      const distance = calculateDistance(star.position);
      const adjustedResonance = star.resonance * distance;
      return {
        ...star,
        resonance: adjustedResonance,
      };
    });
  } catch (error) {
    console.error(`Error fetching data on page ${page}:`, error.message);
    return [];
  }
}

async function collectAllStars() {
  const allStars = [];
  //   const sortByOptions = ["id", "resonance"];
  const sortByOptions = ["id"];
  //   const sortDirections = ["asc", "desc"];
  const sortDirections = ["asc"];
  const seenStars = new Set();

  for (const sortBy of sortByOptions) {
    for (const direction of sortDirections) {
      let page = 1;
      while (true) {
        const stars = await fetchStarData(page, sortBy, direction);
        // console.log(
        //   "page",
        //   page,
        //   "sortBy",
        //   sortBy,
        //   "direction",
        //   direction,
        //   "stars",
        //   stars.length
        // );
        if (stars.length === 0) break;

        stars.forEach((star) => {
          if (!seenStars.has(star.id)) {
            seenStars.add(star.id);
            allStars.push(star);
          }
        });

        if (stars.length < 3) {
          break;
        }

        page++;
      }
    }
  }

  return allStars;
}

async function calculateAverageResonance() {
  const allStars = await collectAllStars();
  const totalResonance = allStars.reduce(
    (sum, star) => sum + star.resonance,
    0
  );
  return allStars.length > 0 ? Math.round(totalResonance / allStars.length) : 0;
}

async function submitSolution(averageResonance) {
  try {
    const response = await axios.post(
      SOLUTION_URL,
      { average_resonance: averageResonance },
      { headers: HEADERS }
    );
    console.log(`Submitted Average Resonance: ${averageResonance}`);
    console.log(`Response:`, response.data);
  } catch (error) {
    console.error(
      "Error submitting solution:",
      error.response ? error.response.data : error.message
    );
  }
}

async function main2() {
  for (let averageResonance = 0; averageResonance <= 1000; averageResonance++) {
    await submitSolution(averageResonance);
  }
//   await submitSolution(averageResonance);
}

main2();
