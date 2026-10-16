import type { CSSProperties } from "react";
import { elements } from "../elements/index.ts";
import type { ElementId } from "../simulation/types.ts";
import { ElementGlyph } from "./ElementGlyph.tsx";

interface ElementPaletteProps {
  selected: ElementId;
  onSelect: (id: ElementId) => void;
}

export function ElementPalette({ selected, onSelect }: ElementPaletteProps) {
  return (
    <section className="panel palette" aria-labelledby="palette-title">
      <div className="panel-head">
        <h2 id="palette-title">Elements</h2>
        <p>Choose one, then paint.</p>
      </div>
      <div className="palette-list" role="radiogroup" aria-label="Elements">
        {elements.map((element) => {
          const active = selected === element.id;
          return (
            <label
              key={element.id}
              className={active ? "element-card is-selected" : "element-card"}
              style={{ "--accent": element.accent, "--glow": element.glow } as CSSProperties}
            >
              <input
                type="radio"
                name="element"
                value={element.id}
                checked={active}
                onChange={() => onSelect(element.id)}
                aria-label={`${element.name}. ${element.blurb} Shortcut ${element.shortcut}.`}
                aria-keyshortcuts={element.shortcut}
              />
              <ElementGlyph id={element.id} />
              <span className="element-copy">
                <span className="element-name">{element.name}</span>
                <span className="element-blurb">{element.blurb}</span>
              </span>
              <kbd>{element.shortcut}</kbd>
            </label>
          );
        })}
      </div>
    </section>
  );
}
