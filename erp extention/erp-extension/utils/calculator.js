/**
 * ERP Enhancer — Calculator Utilities
 * Subject-wise bunk & attendance math.
 */

/**
 * How many more classes can be bunked while staying ≥ 75%?
 * Formula: floor(attended / 0.75 - total)
 */
function calculateSafeBunks(attended, total) {
  if (total === 0) return 0;
  const safeBunks = Math.floor(attended / 0.75 - total);
  return Math.max(0, safeBunks);
}

/**
 * How many consecutive classes must be attended to reach ≥ 75%?
 * (only relevant when attendance < 75%)
 * Formula: ceil((0.75 * total - attended) / 0.25)
 */
function calculateClassesNeeded(attended, total) {
  if (total === 0) return 0;
  const pct = attended / total;
  if (pct >= 0.75) return 0;
  const needed = Math.ceil((0.75 * total - attended) / 0.25);
  return Math.max(0, needed);
}

/**
 * Attendance percentage rounded to 2 decimal places.
 */
function getPercentage(attended, total) {
  if (total === 0) return 0;
  return ((attended / total) * 100).toFixed(2);
}

/**
 * Status label based on percentage.
 */
function getStatus(pct) {
  const p = parseFloat(pct);
  if (p >= 90) return { label: "Safe", cls: "status-safe" };
  if (p >= 75) return { label: "OK", cls: "status-ok" };
  if (p >= 60) return { label: "At Risk", cls: "status-risk" };
  return { label: "Danger", cls: "status-danger" };
}
