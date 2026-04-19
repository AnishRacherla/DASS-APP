// tracingHelpers.js — Math utilities for the tracing engine
// Used by TracingCanvas to project cursor onto SVG paths, calculate completion, and score.

/**
 * Sample N points along an SVG path element.
 * Returns an array of { x, y, t } where t is the length-along-path.
 */
export function samplePath(pathEl, numSamples = 200) {
  const totalLen = pathEl.getTotalLength();
  const points = [];
  for (let i = 0; i <= numSamples; i++) {
    const t = (i / numSamples) * totalLen;
    const pt = pathEl.getPointAtLength(t);
    points.push({ x: pt.x, y: pt.y, t });
  }
  return points;
}

/**
 * Find the closest point on a sampled path to a given cursor point.
 * Returns { x, y, t, distance } where t is the length-along-path.
 */
export function getClosestPointOnPath(sampledPoints, cursorX, cursorY) {
  let best = null;
  let bestDist = Infinity;

  for (const p of sampledPoints) {
    const dx = p.x - cursorX;
    const dy = p.y - cursorY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < bestDist) {
      bestDist = dist;
      best = p;
    }
  }

  return best ? { x: best.x, y: best.y, t: best.t, distance: bestDist } : null;
}

/**
 * Check if a cursor point is near the start point of a stroke.
 */
export function isNearStartPoint(cursorX, cursorY, startPoint, radius = 35) {
  const dx = cursorX - startPoint.x;
  const dy = cursorY - startPoint.y;
  return Math.sqrt(dx * dx + dy * dy) <= radius;
}

/**
 * Calculate the completion percentage of a stroke based on traced length.
 */
export function getCompletionPercentage(tracedLength, totalLength) {
  if (totalLength <= 0) return 0;
  return Math.min(1, Math.max(0, tracedLength / totalLength));
}

/**
 * Determine if a stroke is "complete" (child has traced enough of it).
 * Threshold is intentionally generous for young children.
 */
export function isStrokeComplete(tracedLength, totalLength, threshold = 0.80) {
  return getCompletionPercentage(tracedLength, totalLength) >= threshold;
}

/**
 * Calculate star rating based on overall accuracy and time.
 * @param {number} avgAccuracy - Average distance from path (lower = better)
 * @param {number} totalTimeMs - Total time taken in milliseconds
 * @param {number} strokeCount - Number of strokes in the letter
 * @returns {number} 1, 2, or 3 stars
 */
export function calculateStarRating(avgAccuracy, totalTimeMs, strokeCount) {
  // Generous scoring for young children
  const timePerStroke = totalTimeMs / (strokeCount || 1) / 1000; // seconds per stroke
  
  let stars = 3;

  // Accuracy penalty (avgAccuracy is avg distance from path in px)
  if (avgAccuracy > 20) stars--;
  if (avgAccuracy > 35) stars--;

  // Time penalty (very generous — only penalize if extremely slow)
  if (timePerStroke > 15) stars--;

  return Math.max(1, Math.min(3, stars));
}

/**
 * Load tracing progress from localStorage.
 */
export function loadProgress() {
  try {
    const raw = localStorage.getItem('traceVowel_progress');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Save tracing progress to localStorage.
 */
export function saveProgress(progress) {
  try {
    localStorage.setItem('traceVowel_progress', JSON.stringify(progress));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

/**
 * Convert client/page coordinates to SVG coordinates.
 * This is essential because the SVG may be scaled to fit the container.
 */
export function clientToSVGCoords(svgElement, clientX, clientY) {
  const pt = svgElement.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svgElement.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const svgPt = pt.matrixTransform(ctm.inverse());
  return { x: svgPt.x, y: svgPt.y };
}
