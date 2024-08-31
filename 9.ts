import express, { Request, Response } from "express";

const app = express();
const port = process.env.PORT || 3000;

interface PhaseChangePoint {
  pressure: number;
  specific_volume_liquid: number;
  specific_volume_vapor: number;
}

const criticalPoint: PhaseChangePoint = {
  pressure: 10, // MPa
  specific_volume_liquid: 0.0035, // m³/kg
  specific_volume_vapor: 0.0035, // m³/kg
};

const lowerPoint: PhaseChangePoint = {
  pressure: 7, // MPa
  specific_volume_liquid: 0.00105, // m³/kg
  specific_volume_vapor: 0.0035, // m³/kg
};

function interpolate(
  x: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return y1 + ((y2 - y1) * (x - x1)) / (x2 - x1);
}

function calculateSpecificVolumes(pressure: number): PhaseChangePoint | null {
  if (pressure > criticalPoint.pressure || pressure < lowerPoint.pressure) {
    return null;
  }

  const specific_volume_liquid = interpolate(
    pressure,
    lowerPoint.pressure,
    lowerPoint.specific_volume_liquid,
    criticalPoint.pressure,
    criticalPoint.specific_volume_liquid
  );

  const specific_volume_vapor = interpolate(
    pressure,
    lowerPoint.pressure,
    lowerPoint.specific_volume_vapor,
    criticalPoint.pressure,
    criticalPoint.specific_volume_vapor
  );

  return { pressure, specific_volume_liquid, specific_volume_vapor };
}

app.get("/phase-change-diagram", (req: Request, res: Response) => {
  const pressure = parseFloat(req.query.pressure as string);

  if (isNaN(pressure)) {
    return res.status(400).json({ error: "Invalid pressure value" });
  }

  const data = calculateSpecificVolumes(pressure);

  if (!data) {
    return res
      .status(404)
      .json({ error: "Pressure out of range or data not found" });
  }

  res.json({
    specific_volume_liquid: data.specific_volume_liquid,
    specific_volume_vapor: data.specific_volume_vapor,
  });
});

app.listen(port, () => {
  console.log(`API is running on http://localhost:${port}`);
});
