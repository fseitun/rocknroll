import axios from "axios";

const API_URL =
  "https://makers-challenge.altscore.ai/v1/s1/e1/resources/measurement";
const SOLUTION_URL = "https://makers-challenge.altscore.ai/v1/s1/e1/solution";
const HEADERS = {
  accept: "application/json",
  "API-KEY": "5000781e3339485ab9f50e25c773bc14",
};

async function main() {
    const { distance, time } = await getMeasurement();
    const speed = calculateSpeed(distance, time);
    await submitSolution(speed);
  }

async function getMeasurement() {
  while (true) {
    try {
      const response = await axios.get(API_URL, { headers: HEADERS });
      const data = response.data;

      if (
        data.distance !== "failed to measure, try again" &&
        data.time !== "failed to measure, try again"
      ) {
        return {
          distance: parseFloat(data.distance),
          time: parseFloat(data.time),
        };
      } else {
        console.log("Failed to measure. Retrying...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error("Error fetching measurement:", error);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

function calculateSpeed(distance, time) {
  return Math.round(distance / time);
}

async function submitSolution(speed) {
  try {
    const response = await axios.post(
      SOLUTION_URL,
      { speed: speed },
      { headers: HEADERS }
    );
    console.log(`Submitted Speed: ${speed}`);
    console.log(`Response Code: ${response.status}`);
    console.log(`Response Body:`, response.data);
  } catch (error) {
    console.error(
      "Error submitting solution:",
      error.response ? error.response.data : error.message
    );
  }
}



main();
