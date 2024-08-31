import axios from "axios";

const API_KEY = "5000781e3339485ab9f50e25c773bc14";
const API_URL = "https://makers-challenge.altscore.ai/v1/s1/e8/actions/door";

async function openNextDoor(cookieValue, onGoingString = "") {
  const currentDate = new Date();

  const millisecondsUntilNextMinute =
    (60 - currentDate.getSeconds()) * 1000 - currentDate.getMilliseconds();

  await new Promise((resolve) =>
    setTimeout(resolve, millisecondsUntilNextMinute)
  );

  try {
    const response = await axios.post(
      API_URL,
      {},
      {
        headers: {
          Accept: "application/json",
          "API-KEY": API_KEY,
          ...(cookieValue && { Cookie: cookieValue }),
        },
      }
    );

    const setCookieHeader = response.headers["set-cookie"];
    console.log("Set-Cookie Header:", setCookieHeader);
    if (setCookieHeader && setCookieHeader.length > 0) {
      const gryffindorCookie = setCookieHeader[0].split(";")[0];

      let rawCookieValue = gryffindorCookie.split("=")[1];

      const decodedValue = Buffer.from(rawCookieValue, "base64").toString(
        "utf-8"
      );
      console.log("Decoded Next Cookie Value:", decodedValue);
      onGoingString += " " + decodedValue;

      console.log("On-Going String:", onGoingString);

      openNextDoor(gryffindorCookie, onGoingString);
    } else {
      console.log("No more cookies to process.");
    }
  } catch (error) {
    console.error("Failed:", error.response?.data || error.message);
    console.log("Error Headers:", error.response?.headers || {});
  }
}

openNextDoor();
