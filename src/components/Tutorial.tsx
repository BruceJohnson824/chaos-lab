import { useEffect, useRef, useState } from "react";

const STEPS = [
  {
    title: "Welcome to the bench",
    body: "CHAOS.EXE is a collaborative experiment. Four elements share one canvas. Nothing here follows a textbook — when they touch, the lab records what happens.",
  },
  {
    title: "Choose an element",
    body: "Select Fire, Water, Ice, or Electricity from the palette. Keys 1 through 4 do the same thing.",
  },
  {
    title: "Paint the canvas",
    body: "Click for a cluster. Drag to leave a trail. With a keyboard, focus the canvas, move the reticle with the arrow keys, and press Enter to place.",
  },
  {
    title: "Discover a reaction",
    body: "Overlap two elements and watch the collision. The tracker starts locked. Pause, clear the canvas, or reset the whole experiment whenever the bench gets too loud.",
  },
];

interface TutorialProps {
  onClose: () => void;
}

export function Tutorial({ onClose }: TutorialProps) {
  const [step, setStep] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const current = STEPS[step] ?? STEPS[0];
  const last = step === STEPS.length - 1;

  useEffect(() => {
    nextRef.current?.focus();
  }, [step]);

  return (
    <div className="tutorial-backdrop">
      <div
        ref={dialogRef}
        className="tutorial-card panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-title"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            onClose();
            return;
          }
          if (event.key !== "Tab" || !dialogRef.current) return;
          const items = [...dialogRef.current.querySelectorAll<HTMLButtonElement>("button:not(:disabled)")];
          const first = items[0];
          const end = items[items.length - 1];
          if (!first || !end) return;
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            end.focus();
          } else if (!event.shiftKey && document.activeElement === end) {
            event.preventDefault();
            first.focus();
          }
        }}
      >
        <p className="eyebrow">First visit</p>
        <h2 id="tutorial-title">{current?.title}</h2>
        <p className="tutorial-body">{current?.body}</p>
        <p className="tutorial-progress">
          Step {step + 1} of {STEPS.length}
        </p>
        <div className="tutorial-actions">
          <button type="button" className="btn" onClick={onClose}>
            Skip
          </button>
          <div className="tutorial-nav">
            <button type="button" className="btn" onClick={() => setStep((value) => value - 1)} disabled={step === 0}>
              Back
            </button>
            <button
              ref={nextRef}
              type="button"
              className="btn btn-primary"
              onClick={() => {
                if (last) onClose();
                else setStep((value) => value + 1);
              }}
            >
              {last ? "Enter the lab" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
