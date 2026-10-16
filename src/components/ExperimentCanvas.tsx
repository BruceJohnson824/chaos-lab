import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import type { LabSimulation } from "../simulation/engine.ts";
import { renderLab } from "../simulation/render.ts";

interface ExperimentCanvasProps {
  sim: LabSimulation;
  running: boolean;
  particleCount: number;
  elementName: string;
}

export function ExperimentCanvas({ sim, running, particleCount, elementName }: ExperimentCanvasProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paint = useRef({ active: false, x: 0, y: 0 });

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let frame = 0;
    let last = performance.now();
    let simTime = 0;

    const resize = () => {
      const rect = stage.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      sim.setBounds(width, height);
    };

    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      if (sim.running) {
        sim.step(dt);
        simTime += dt;
      }
      renderLab(context, sim, simTime);
      frame = window.requestAnimationFrame(loop);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    frame = window.requestAnimationFrame(loop);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [sim]);

  const pointFromEvent = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  return (
    <div className="stage" ref={stageRef}>
      <canvas
        id="experiment-canvas"
        ref={canvasRef}
        role="application"
        tabIndex={0}
        aria-label="Experiment canvas"
        aria-describedby="canvas-help"
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          const canvas = event.currentTarget;
          canvas.setPointerCapture(event.pointerId);
          canvas.focus({ preventScroll: true });
          const point = pointFromEvent(event);
          paint.current.active = true;
          paint.current.x = point.x;
          paint.current.y = point.y;
          sim.place(point.x, point.y, "stamp");
        }}
        onPointerMove={(event) => {
          if (!paint.current.active) return;
          const point = pointFromEvent(event);
          if (Math.hypot(point.x - paint.current.x, point.y - paint.current.y) < 30) return;
          paint.current.x = point.x;
          paint.current.y = point.y;
          sim.place(point.x, point.y, "brush");
        }}
        onPointerUp={() => {
          paint.current.active = false;
        }}
        onPointerCancel={() => {
          paint.current.active = false;
        }}
        onFocus={() => sim.focusAim()}
        onBlur={() => sim.clearAim()}
        onKeyDown={(event) => {
          const stride = event.shiftKey ? 48 : 18;
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            sim.moveAim(-stride, 0);
          } else if (event.key === "ArrowRight") {
            event.preventDefault();
            sim.moveAim(stride, 0);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            sim.moveAim(0, -stride);
          } else if (event.key === "ArrowDown") {
            event.preventDefault();
            sim.moveAim(0, stride);
          } else if (event.key === "Enter") {
            event.preventDefault();
            const aim = sim.aim ?? { x: sim.width / 2, y: sim.height / 2 };
            sim.place(aim.x, aim.y, "stamp");
          }
        }}
      />
      <span className="mark mark-nw" />
      <span className="mark mark-ne" />
      <span className="mark mark-sw" />
      <span className="mark mark-se" />
      <p id="canvas-help" className="sr-only">
        Select an element, then click or drag to place it. With a keyboard, move the reticle with the
        arrow keys and press Enter.
      </p>
      {particleCount === 0 ? (
        <div className="empty-hint">
          <p>The bench is clear.</p>
          <p>
            Click or drag to place <strong>{elementName}</strong>.
          </p>
        </div>
      ) : null}
      {running ? null : <div className="pause-banner">Paused</div>}
    </div>
  );
}
