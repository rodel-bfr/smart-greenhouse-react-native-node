// frontend/utils/dateAdjustment.js

/**
 * DATE NORMALIZATION UTILITY
 * Shifts historical data timestamps so the most recent point aligns with "Right Now".
 * This ensures static demo data always looks fresh and populates "Last 24h" charts.
 *
 * @param {Array} data - Array of objects containing a 'timestamp' field (ISO string)
 * @returns {Array} - New array with shifted timestamps
 */
export const normalizeDataToToday = (data) => {
  // 1. Basic Input Validation
  if (!data || !Array.isArray(data) || data.length === 0) return [];

  try {
    // 2. Extract valid timestamps only
    // This prevents the app from crashing if one database row has a bad date
    const timestamps = data
      .map((d) => new Date(d.timestamp).getTime())
      .filter((t) => !isNaN(t));

    // If no valid dates found, return original data
    if (timestamps.length === 0) return data;

    // 3. Find the latest date in the fake data
    const latestTimestamp = Math.max(...timestamps);

    // 4. Calculate the time difference (offset) between NOW and that date
    const now = new Date().getTime();
    const timeOffset = now - latestTimestamp;

    // 5. SAFETY CHECK: If data is already fresh (e.g. < 1 hour old), don't shift it.
    // This protects the logic if you connect to a real live sensor later.
    if (Math.abs(timeOffset) < 1000 * 60 * 60) {
      return data;
    }

    // 6. Apply the offset to every single data point
    return data.map((item) => {
      const originalTime = new Date(item.timestamp).getTime();
      
      // Skip invalid dates inside the loop too
      if (isNaN(originalTime)) return item; 

      return {
        ...item,
        // Create a new date shifted by the offset, and convert back to ISO string
        timestamp: new Date(originalTime + timeOffset).toISOString(),
      };
    });

  } catch (error) {
    console.error("[DateAdjustment] Error normalizing data:", error);
    return data; // Fallback: return original data on error
  }
};