import express, { Request, Response } from "express";

const app = express();
const port = process.env.PORT || 3000;

interface PhaseChangePoint {
  pressure: number;
  specific_volume_liquid: number;
  specific_volume_vapor: number;
}

function calculateSpecificVolumes(pressure: number): PhaseChangePoint | null {
  // Pressure out of range
  if (pressure > 10 || pressure < 0.05) {
    return null;
  }

  const specific_volume_liquid = (2450 * pressure + 10325) / 9950000;
  const specific_volume_vapor = (299999825 - 29996500 * pressure) / 9950000;
  return { pressure, specific_volume_liquid, specific_volume_vapor };
}

app.get("/phase-change-diagram", (req: Request, res: Response) => {
  const pressure = parseFloat(req.query.pressure as string);

  if (isNaN(pressure)) {
    return res.status(400).json({ error: "Invalid pressure value" });
  }

  const data = calculateSpecificVolumes(pressure);

  if (!data) {
    return res.status(404).json({ error: "Pressure out of range" });
  }

  res.status(200).json({
    specific_volume_liquid: data.specific_volume_liquid,
    specific_volume_vapor: data.specific_volume_vapor,
  });
});

app.listen(port, () => {
  console.log(`API is running on http://localhost:${port}`);
});
