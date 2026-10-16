import { useCallback, useEffect, useState } from "react";
import { ActivityLog } from "./components/ActivityLog.tsx";
import { ChaosCore } from "./components/ChaosCore.tsx";
import { DiscoveryTracker } from "./components/DiscoveryTracker.tsx";
import { ElementPalette } from "./components/ElementPalette.tsx";
import { ExperimentCanvas } from "./components/ExperimentCanvas.tsx";
import { Header } from "./components/Header.tsx";
import { OpenSource } from "./components/OpenSource.tsx";
import { Tutorial } from "./components/Tutorial.tsx";
import { elements } from "./elements/index.ts";
import { useLabSimulation } from "./hooks/useLabSimulation.ts";
import { useReducedMotion } from "./hooks/useReducedMotion.ts";
import type { ElementId } from "./simulation/types.ts";

const TUTORIAL_KEY = "chaos-exe-tutorial-dismissed";

function tutorialShouldOpen(): boolean {
  try {
    return localStorage.getItem(TUTORIAL_KEY) !== "1";
  } catch {
    return true;
  }
}

export default function App() {
  const reducedMotion = useReducedMotion();
  const [selected, setSelected] = useState<ElementId>("fire");
  const active = elements.find((element) => element.id === selected) ?? elements[0];
  const { sim, snapshot } = useLabSimulation(reducedMotion, selected, active?.accent ?? "#ff7a3c");
  const [tutorialOpen, setTutorialOpen] = useState(tutorialShouldOpen);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [armedReset, setArmedReset] = useState(false);

  useEffect(() => {
    if (!armedReset) return;
    const timer = window.setTimeout(() => setArmedReset(false), 2600);
    return () => window.clearTimeout(timer);
  }, [armedReset]);

  const closeTutorial = useCallback(() => {
    try {
      localStorage.setItem(TUTORIAL_KEY, "1");
    } catch {
      // Ignore private-mode storage failures.
    }
    setTutorialOpen(false);
  }, []);

  const requestReset = useCallback(() => {
    if (!armedReset) {
      setArmedReset(true);
      return;
    }
    sim.resetExperiment();
    setArmedReset(false);
  }, [armedReset, sim]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea, select")) return;
      if (tutorialOpen) {
        if (event.key === "Escape") closeTutorial();
        return;
      }
      if (sourceOpen) {
        if (event.key === "Escape") setSourceOpen(false);
        return;
      }
      const fromCode = event.code.startsWith("Digit") || event.code.startsWith("Numpad")
        ? event.code.replace("Digit", "").replace("Numpad", "")
        : "";
      const shortcut = fromCode || event.key;
      const match = elements.find((element) => element.shortcut === shortcut);
      if (match) {
        setSelected(match.id);
        return;
      }
      if (event.code === "Space") {
        if (target instanceof HTMLElement && target.closest("button, a")) return;
        event.preventDefault();
        sim.toggleRunning();
        return;
      }
      if ((event.key === "c" || event.key === "C") && !event.metaKey && !event.ctrlKey && !event.altKey) {
        sim.clearCanvas();
        return;
      }
      if (event.key === "?" || event.key === "F1") {
        event.preventDefault();
        setTutorialOpen(true);
        return;
      }
      if (event.key === "R" && event.shiftKey && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        requestReset();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeTutorial, requestReset, sim, sourceOpen, tutorialOpen]);

  return (
    <div className="lab">
      <a className="skip-link" href="#experiment-canvas">
        Skip to experiment canvas
      </a>
      <Header
        running={snapshot.running}
        particleCount={snapshot.particleCount}
        armedReset={armedReset}
        onToggle={() => sim.toggleRunning()}
        onClear={() => sim.clearCanvas()}
        onReset={requestReset}
        onHelp={() => setTutorialOpen(true)}
        onSource={() => setSourceOpen(true)}
      />
      <main className="workspace">
        <ElementPalette selected={selected} onSelect={setSelected} />
        <ExperimentCanvas
          sim={sim}
          running={snapshot.running}
          particleCount={snapshot.particleCount}
          elementName={active?.name ?? "Fire"}
        />
        <aside className="intel">
          <ChaosCore sim={sim} onSelect={setSelected} />
          <DiscoveryTracker discovered={snapshot.discoveries} />
          <ActivityLog entries={snapshot.log} />
        </aside>
      </main>
      {tutorialOpen ? <Tutorial onClose={closeTutorial} /> : null}
      {sourceOpen ? <OpenSource onClose={() => setSourceOpen(false)} /> : null}
    </div>
  );
}
