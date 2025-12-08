// services/mockWeather.js

export const getSimulatedWeather = (location) => {
  console.log(`⚠️ [Demo Mode] Serving simulated weather for: ${location}`);

  // We generate a "perfect" day for the demo
  return {
    resolvedAddress: location || "Demo Greenhouse Location",
    currentConditions: {
      conditions: "Partially cloudy",
      temp: 24.5, // Ideal temp for graphs
      humidity: 45.0,
      winddir: 140,
      windspeed: 12.5,
    },
    days: [
      {
        // Today
        hours: Array.from({ length: 24 }, (_, i) => ({
          datetime: `${i.toString().padStart(2, '0')}:00:00`,
          temp: 22 + Math.sin(i / 4) * 5, // Creates a nice curve for charts
          conditions: i > 6 && i < 20 ? "Partially cloudy" : "Clear",
        })),
      },
      {
        // Tomorrow (needed for the forecast logic)
        hours: Array.from({ length: 24 }, (_, i) => ({
          datetime: `${i.toString().padStart(2, '0')}:00:00`,
          temp: 20 + Math.sin(i / 4) * 5,
          conditions: "Clear",
        })),
      },
    ],
  };
};