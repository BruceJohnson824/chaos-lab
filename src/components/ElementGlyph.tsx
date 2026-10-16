import type { ElementId } from "../simulation/types.ts";

export function ElementGlyph({ id }: { id: ElementId }) {
  if (id === "fire") {
    return (
      <svg className="glyph" viewBox="0 0 32 32" aria-hidden="true">
        <path
          d="M16 4c2 4 2.2 6.2.6 8.2 1.8-.6 3-2.2 3.4-4.2 2.8 2.4 4.5 5.6 4.5 9.2 0 5-3.6 8.8-8.5 8.8S7.5 22.2 7.5 17.2c0-3.2 1.4-5.6 3.2-8 0 2.2 1.2 3.6 2.6 4.4C12.6 10.2 13.4 7 16 4z"
          fill="currentColor"
        />
      </svg>
    );
  }
  if (id === "water") {
    return (
      <svg className="glyph" viewBox="0 0 32 32" aria-hidden="true">
        <path
          d="M16 4s7 8.2 7 13.2A7 7 0 0 1 9 17.2C9 12.2 16 4 16 4z"
          fill="currentColor"
        />
      </svg>
    );
  }
  if (id === "ice") {
    return (
      <svg className="glyph" viewBox="0 0 32 32" aria-hidden="true">
        <path
          d="M16 5 25 10.2v11.6L16 27 7 21.8V10.2L16 5z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path d="M16 5v22M7 10.2 25 21.8M25 10.2 7 21.8" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  }
  return (
    <svg className="glyph" viewBox="0 0 32 32" aria-hidden="true">
      <path d="M18 3 8.5 17.2h6.2L13.2 29 24 13.6h-6.4L18 3z" fill="currentColor" />
    </svg>
  );
}
