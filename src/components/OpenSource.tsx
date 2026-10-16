import { useEffect, useRef } from "react";

const POINTS = [
  {
    title: "MIT license",
    body: "Anyone can use the lab, change it, and share their version. The license is in the repository.",
  },
  {
    title: "Open stack",
    body: "The interface is React, TypeScript, and Vite. The simulation runs in the browser.",
  },
  {
    title: "A file you can own",
    body: "Each element lives in src/elements. Each reaction lives in src/reactions. A first contribution can be a single new file.",
  },
];

interface OpenSourceProps {
  onClose: () => void;
}

export function OpenSource({ onClose }: OpenSourceProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  return (
    <div className="tutorial-backdrop">
      <div
        className="tutorial-card panel source-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="source-title"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            onClose();
          }
        }}
      >
        <p className="eyebrow">For the room</p>
        <h2 id="source-title">Open source</h2>
        <p className="tutorial-body">
          CHAOS.EXE is a public lab bench. The experiment on screen is the project people can clone and extend.
        </p>
        <ul className="source-list">
          {POINTS.map((point) => (
            <li key={point.title}>
              <p className="discovery-title">{point.title}</p>
              <p className="discovery-copy">{point.body}</p>
            </li>
          ))}
        </ul>
        <div className="tutorial-actions">
          <p className="tutorial-progress">CONTRIBUTING.md lists six beginner-sized ideas.</p>
          <button ref={closeRef} type="button" className="btn btn-primary" onClick={onClose}>
            Back to the bench
          </button>
        </div>
      </div>
    </div>
  );
}
