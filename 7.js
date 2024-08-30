import express from "express";
const app = express();
const port = 3000;

// Define the damaged system
const damagedSystems = [
  "navigation",
  "communications",
  "life_support",
  "engines",
  "deflector_shield",
];

// Randomly select a damaged system
const damagedSystem =
  damagedSystems[Math.floor(Math.random() * damagedSystems.length)];

// Route: GET /status
app.get("/status", (req, res) => {
  res.json({ damaged_system: damagedSystem });
});

// Route: GET /repair-bay
app.get("/repair-bay", (req, res) => {
  const repairCodes = {
    navigation: "NAV-01",
    communications: "COM-02",
    life_support: "LIFE-03",
    engines: "ENG-04",
    deflector_shield: "SHLD-05",
  };

  const repairCode = repairCodes[damagedSystem];

  const htmlResponse = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Repair</title>
    </head>
    <body>
        <div class="anchor-point">${repairCode}</div>
    </body>
    </html>
  `;

  res.send(htmlResponse);
});

// Route: POST /teapot
app.post("/teapot", (req, res) => {
  res.status(418).send("I'm a teapot");
});

// Start the server
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
