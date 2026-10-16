import { ClearIcon, HelpIcon, PauseIcon, PlayIcon, ResetIcon, SourceIcon } from "./icons.tsx";

interface HeaderProps {
  running: boolean;
  particleCount: number;
  armedReset: boolean;
  onToggle: () => void;
  onClear: () => void;
  onReset: () => void;
  onHelp: () => void;
  onSource: () => void;
}

export function Header({
  running,
  particleCount,
  armedReset,
  onToggle,
  onClear,
  onReset,
  onHelp,
  onSource,
}: HeaderProps) {
  return (
    <header className="topbar">
      <div className="brand">
        <p className="eyebrow">Open source · MIT</p>
        <h1>
          <span className="wordmark-chaos">CHAOS</span>
          <span className="wordmark-exe">.EXE</span>
        </h1>
        <p className="subtitle">The Chaos Lab</p>
      </div>
      <p className="status">
        <span className={running ? "live-dot" : "live-dot is-paused"} />
        <span role="status">{running ? "Live" : "Paused"}</span>
        <span className="status-count">
          {particleCount === 1 ? "1 mote" : `${particleCount} motes`}
        </span>
      </p>
      <div className="controls">
        <button type="button" className="btn btn-primary" onClick={onToggle} aria-pressed={running}>
          {running ? <PauseIcon /> : <PlayIcon />}
          {running ? "Pause" : "Play"}
        </button>
        <button type="button" className="btn" onClick={onClear}>
          <ClearIcon />
          Clear
        </button>
        <button
          type="button"
          className={armedReset ? "btn is-armed" : "btn"}
          onClick={onReset}
          aria-describedby="reset-hint"
        >
          <ResetIcon />
          {armedReset ? "Confirm reset" : "Reset"}
        </button>
        <button type="button" className="btn" onClick={onSource}>
          <SourceIcon />
          Source
        </button>
        <button type="button" className="btn" onClick={onHelp}>
          <HelpIcon />
          Guide
        </button>
      </div>
      <p id="reset-hint" className="shortcuts">
        1–4 select an element · click or drag to paint · arrows and Enter to place · Space pauses · C
        clears · Shift+R resets
      </p>
    </header>
  );
}
