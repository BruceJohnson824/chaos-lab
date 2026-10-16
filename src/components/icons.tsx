export function PlayIcon() {
  return (
    <svg className="icon" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M5 3.2v9.6L13 8 5 3.2z" fill="currentColor" />
    </svg>
  );
}

export function PauseIcon() {
  return (
    <svg className="icon" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4.5 3h2.2v10H4.5V3zm4.8 0H11.5v10H9.3V3z" fill="currentColor" />
    </svg>
  );
}

export function ClearIcon() {
  return (
    <svg className="icon" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M3 4.5h10M6.2 4.4V3.2h3.6v1.2M4.6 4.5l.6 8.2h5.6l.6-8.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}

export function ResetIcon() {
  return (
    <svg className="icon" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M13 8a5 5 0 1 1-1.4-3.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path d="M12.8 2.6v3.2H9.6" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function SourceIcon() {
  return (
    <svg className="icon" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M5.2 4.2 2.4 8l2.8 3.8M10.8 4.2 13.6 8l-2.8 3.8M9 3.2 7 12.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}

export function HelpIcon() {
  return (
    <svg className="icon" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="5.2" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6.4 6.3a1.6 1.6 0 1 1 2.3 1.4c-.5.3-.7.6-.7 1.1" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="8" cy="11.2" r="0.7" fill="currentColor" />
    </svg>
  );
}
