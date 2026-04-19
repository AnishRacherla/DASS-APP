import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  samplePath,
  getClosestPointOnPath,
  isNearStartPoint,
  isStrokeComplete,
  clientToSVGCoords,
} from '../../akshara-utils/tracingHelpers';
import './TracingCanvas.css';

const HIT_TOLERANCE = 30; // px — how far from path before "off path"
const START_RADIUS = 35;  // px — radius around start point to begin tracing
const COMPLETION_THRESHOLD = 0.80;

/**
 * TracingCanvas — SVG-based guided tracing component.
 *
 * Props:
 *   vowelData   — { letter, viewBox, strokes: [{ id, path, direction, startPoint }] }
 *   onComplete  — callback when all strokes are done; receives { accuracies }
 *   showHint    — boolean trigger to animate a hint on the active stroke
 *   resetKey    — changing this value resets the canvas
 */
export default function TracingCanvas({ vowelData, onComplete, showHint, resetKey }) {
  const svgRef = useRef(null);
  const pathRefs = useRef({}); // strokeId → SVG path element
  const sampledPaths = useRef({}); // strokeId → sampled points array
  const isDrawing = useRef(false);
  const tracedLengthRef = useRef({}); // strokeId → traced length (number)
  const accuracySum = useRef({}); // strokeId → sum of distances
  const accuracyCount = useRef({}); // strokeId → count of samples

  const [activeStrokeIndex, setActiveStrokeIndex] = useState(0);
  const [completedStrokes, setCompletedStrokes] = useState(new Set());
  const [tracedLengths, setTracedLengths] = useState({}); // strokeId → traced length for rendering
  const [totalLengths, setTotalLengths] = useState({}); // strokeId → total length
  const [shakeClass, setShakeClass] = useState('');
  const [offPath, setOffPath] = useState(false);
  const [sparkles, setSparkles] = useState([]); // { id, x, y, dx, dy }

  // Hint animation state
  const [hintProgress, setHintProgress] = useState(0);
  const hintAnimRef = useRef(null);

  const strokes = useMemo(() => vowelData?.strokes || [], [vowelData?.strokes]);

  // ─── Initialize / Reset ──────────────────────────────────
  useEffect(() => {
    setActiveStrokeIndex(0);
    setCompletedStrokes(new Set());
    setTracedLengths({});
    setShakeClass('');
    setOffPath(false);
    setSparkles([]);
    tracedLengthRef.current = {};
    accuracySum.current = {};
    accuracyCount.current = {};
    isDrawing.current = false;

    // Wait for SVG paths to mount, then sample them
    const timer = setTimeout(() => {
      const lengths = {};
      sampledPaths.current = {};
      strokes.forEach((s) => {
        const el = pathRefs.current[s.id];
        if (el) {
          const total = el.getTotalLength();
          lengths[s.id] = total;
          sampledPaths.current[s.id] = samplePath(el, 300);
          tracedLengthRef.current[s.id] = 0;
          accuracySum.current[s.id] = 0;
          accuracyCount.current[s.id] = 0;
        }
      });
      setTotalLengths(lengths);
    }, 50);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vowelData, resetKey]);

  // ─── Hint Animation ──────────────────────────────────────
  useEffect(() => {
    if (!showHint) {
      if (hintAnimRef.current) cancelAnimationFrame(hintAnimRef.current);
      setHintProgress(0);
      return;
    }

    let start = null;
    const duration = 1500; // ms

    const animate = (ts) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(1, elapsed / duration);
      setHintProgress(progress);
      if (progress < 1) {
        hintAnimRef.current = requestAnimationFrame(animate);
      } else {
        // Reset after a pause
        setTimeout(() => setHintProgress(0), 500);
      }
    };

    hintAnimRef.current = requestAnimationFrame(animate);
    return () => {
      if (hintAnimRef.current) cancelAnimationFrame(hintAnimRef.current);
    };
  }, [showHint]);

  // ─── Pointer Handlers ────────────────────────────────────
  const getActiveStroke = useCallback(() => {
    if (activeStrokeIndex >= strokes.length) return null;
    return strokes[activeStrokeIndex];
  }, [activeStrokeIndex, strokes]);

  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    const svg = svgRef.current;
    const stroke = getActiveStroke();
    if (!svg || !stroke) return;

    const { x, y } = clientToSVGCoords(svg, e.clientX, e.clientY);

    // Check if starting near the start point OR anywhere on already-traced portion
    const nearStart = isNearStartPoint(x, y, stroke.startPoint, START_RADIUS);
    const sampled = sampledPaths.current[stroke.id];
    const closest = sampled ? getClosestPointOnPath(sampled, x, y) : null;
    const onPath = closest && closest.distance <= HIT_TOLERANCE;

    if (nearStart || (onPath && tracedLengthRef.current[stroke.id] > 0)) {
      isDrawing.current = true;
      setOffPath(false);
    }
  }, [getActiveStroke]);

  const handlePointerMove = useCallback((e) => {
    e.preventDefault();
    if (!isDrawing.current) return;

    const svg = svgRef.current;
    const stroke = getActiveStroke();
    if (!svg || !stroke) return;

    const { x, y } = clientToSVGCoords(svg, e.clientX, e.clientY);
    const sampled = sampledPaths.current[stroke.id];
    if (!sampled) return;

    const closest = getClosestPointOnPath(sampled, x, y);
    if (!closest) return;

    // Off-path detection
    if (closest.distance > HIT_TOLERANCE) {
      setOffPath(true);
      setShakeClass('shake');
      setTimeout(() => setShakeClass(''), 350);
      return;
    }

    setOffPath(false);

    // Only allow forward progress (prevent going backward)
    const currentTraced = tracedLengthRef.current[stroke.id] || 0;
    const totalLen = totalLengths[stroke.id] || 1;

    // Allow slight backward movement (5% of total) for natural hand motion
    if (closest.t >= currentTraced - totalLen * 0.05) {
      const newTraced = Math.max(currentTraced, closest.t);
      tracedLengthRef.current[stroke.id] = newTraced;

      // Track accuracy
      accuracySum.current[stroke.id] += closest.distance;
      accuracyCount.current[stroke.id] += 1;

      // Update rendered state (throttled by React batching)
      setTracedLengths((prev) => ({ ...prev, [stroke.id]: newTraced }));

      // Check completion
      if (isStrokeComplete(newTraced, totalLen, COMPLETION_THRESHOLD)) {
        completeStroke(stroke.id);
      }
    }
  }, [getActiveStroke, totalLengths]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePointerUp = useCallback((e) => {
    e.preventDefault();
    isDrawing.current = false;
    setOffPath(false);
  }, []);

  // ─── Stroke Completion ───────────────────────────────────
  const completeStroke = useCallback((strokeId) => {
    isDrawing.current = false;

    // Mark as complete
    setCompletedStrokes((prev) => {
      const next = new Set(prev);
      next.add(strokeId);
      return next;
    });

    // Snap traced length to full
    const total = totalLengths[strokeId] || 0;
    tracedLengthRef.current[strokeId] = total;
    setTracedLengths((prev) => ({ ...prev, [strokeId]: total }));

    // Spawn sparkles
    const pathEl = pathRefs.current[strokeId];
    if (pathEl) {
      const midPt = pathEl.getPointAtLength(total / 2);
      const newSparkles = [];
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        newSparkles.push({
          id: `${strokeId}-sparkle-${i}`,
          x: midPt.x,
          y: midPt.y,
          dx: Math.cos(angle) * 40,
          dy: Math.sin(angle) * 40,
        });
      }
      setSparkles((prev) => [...prev, ...newSparkles]);
      setTimeout(() => {
        setSparkles((prev) =>
          prev.filter((s) => !s.id.startsWith(`${strokeId}-sparkle-`))
        );
      }, 900);
    }

    // Advance to next stroke or complete
    const nextIndex = activeStrokeIndex + 1;
    if (nextIndex >= strokes.length) {
      // All strokes done!
      setTimeout(() => {
        const accuracies = {};
        strokes.forEach((s) => {
          const count = accuracyCount.current[s.id] || 1;
          accuracies[s.id] = (accuracySum.current[s.id] || 0) / count;
        });
        onComplete?.({ accuracies });
      }, 600);
    } else {
      setActiveStrokeIndex(nextIndex);
    }
  }, [activeStrokeIndex, strokes, totalLengths, onComplete]);

  // ─── Render ──────────────────────────────────────────────
  if (!vowelData) return null;

  const activeStroke = getActiveStroke();

  return (
    <div
      className={`tracing-canvas-wrapper ${shakeClass} ${offPath ? 'off-path' : ''}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <svg
        ref={svgRef}
        className="tracing-svg"
        viewBox={vowelData.viewBox}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Defs — gradients and filters */}
        <defs>
          <linearGradient id="tracedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="50%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <filter id="glowFilter">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background Guide Character */}
        <text
          x="125"
          y="160"
          className="background-guide-char"
        >
          {vowelData.letter}
        </text>

        {/* Ghost outlines — all strokes as light dotted lines */}
        {strokes.map((s) => (
          <path
            key={`ghost-${s.id}`}
            d={s.path}
            className="stroke-ghost"
          />
        ))}

        {/* Individual stroke layers */}
        {strokes.map((s, i) => {
          const isCompleted = completedStrokes.has(s.id);
          const isActive = i === activeStrokeIndex && !isCompleted;
          const isLocked = i > activeStrokeIndex && !isCompleted;
          const traced = tracedLengths[s.id] || 0;
          const total = totalLengths[s.id] || 1;

          return (
            <g key={`stroke-group-${s.id}`}>
              {/* Invisible path for geometry calculations */}
              <path
                ref={(el) => { if (el) pathRefs.current[s.id] = el; }}
                d={s.path}
                fill="none"
                stroke="transparent"
                strokeWidth="1"
                data-stroke-id={s.id}
              />

              {/* Locked stroke */}
              {isLocked && (
                <path d={s.path} className="stroke-locked" />
              )}

              {/* Active stroke guide */}
              {isActive && (
                <path d={s.path} className="stroke-active-guide" />
              )}

              {/* Traced progress */}
              {(isActive || isCompleted) && (
                <path
                  d={s.path}
                  className={isCompleted ? 'stroke-completed' : 'stroke-traced'}
                  strokeDasharray={total}
                  strokeDashoffset={isCompleted ? 0 : total - traced}
                />
              )}

              {/* Start point pulsing dot — only for active stroke */}
              {isActive && traced < total * 0.1 && (
                <circle
                  className="start-dot"
                  cx={s.startPoint.x}
                  cy={s.startPoint.y}
                  r="10"
                />
              )}

              {/* Stroke number label */}
              <g className={isCompleted ? 'stroke-number-completed' : ''}>
                <circle
                  className="stroke-number-bg"
                  cx={s.startPoint.x + (s.direction === '→' ? -18 : 18)}
                  cy={s.startPoint.y - 18}
                  r="11"
                />
                <text
                  className="stroke-number-text"
                  x={s.startPoint.x + (s.direction === '→' ? -18 : 18)}
                  y={s.startPoint.y - 18}
                >
                  {isCompleted ? '✓' : s.id}
                </text>
              </g>

              {/* Direction arrow at start */}
              {isActive && !isCompleted && (
                <text
                  x={s.startPoint.x + (s.direction === '→' ? 15 : -16)}
                  y={s.startPoint.y + 5}
                  fontSize="16"
                  fill="#7c3aed"
                  opacity="0.7"
                  textAnchor="middle"
                  pointerEvents="none"
                >
                  {s.direction}
                </text>
              )}
            </g>
          );
        })}

        {/* Hint animation */}
        {showHint && activeStroke && hintProgress > 0 && (
          <g>
            <path
              d={activeStroke.path}
              className="hint-trace"
              strokeDasharray={totalLengths[activeStroke.id] || 1}
              strokeDashoffset={
                (totalLengths[activeStroke.id] || 1) * (1 - hintProgress)
              }
            />
            {(() => {
              const pathEl = pathRefs.current[activeStroke.id];
              if (!pathEl) return null;
              const total = totalLengths[activeStroke.id] || 1;
              const pt = pathEl.getPointAtLength(hintProgress * total);
              return (
                <circle className="hint-dot" cx={pt.x} cy={pt.y} r="8" />
              );
            })()}
          </g>
        )}

        {/* Sparkle particles */}
        {sparkles.map((s) => (
          <circle
            key={s.id}
            className="sparkle-particle"
            cx={s.x}
            cy={s.y}
            r="4"
            fill="#fbbf24"
            style={{ '--dx': `${s.dx}px`, '--dy': `${s.dy}px` }}
          />
        ))}
      </svg>
    </div>
  );
}
