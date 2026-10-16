# Contributing to CHAOS.EXE

Thanks for helping with the Chaos Lab. The sandbox is deliberately split so you can add an element or a reaction without rewriting the canvas.

## Setup

```bash
npm install
npm run dev
```

Before you open a pull request:

```bash
npm run lint
npm run build
```

Keep pull requests focused. One element, one reaction, or one interface improvement is easier to review than a bundle of unrelated changes.

## Add an element

1. Copy `src/elements/fire.ts` to a new file, for example `src/elements/wind.ts`.
2. Change `id`, the palette copy, colors, shortcut, and motion. `stamp` runs on click. `brush` runs while dragging. `update` changes velocity and life only — the engine moves the particle and handles the edges.
3. Add the id to the `ElementId` union in `src/simulation/types.ts`.
4. Register the element in `src/elements/index.ts`. Palette order follows that array.
5. Add at least one reaction so the new element can be discovered. Until `ElementId` includes it, a reaction pair will not typecheck.

`boundary` chooses the edge behavior:

- `rise` — drifts upward and leaves through the top (fire)
- `pool` — falls and settles on the floor (water)
- `slide` — light gravity, soft bounce (ice)
- `bounce` — elastic walls (electricity)

## Add a reaction

1. Create `src/reactions/yourReaction.ts` that exports a `ReactionDefinition`.
2. Set `pair` to the two element ids. Order does not matter. The registry sorts them.
3. In `resolve`, edit the two particles or call the helpers: `spawn`, `damage`, `remove`, `burst`, and `nudge`.
4. Use `makeEffect` from `src/reactions/helpers.ts` for short-lived visuals: `steam`, `spark`, `shard`, `bubble`, `frost`, or `plasma`.
5. Register the reaction in `src/reactions/index.ts`.

If two reactions claim the same pair, the app throws at startup so the conflict is obvious.

A new visual kind also needs a motion case in `src/simulation/effects.ts` and a draw case in `src/simulation/render.ts`.

## Good first contributions

These are sized for a first pull request.

1. **Add Wind.** Create `src/elements/wind.ts`, register it, and give it a shortcut. Start with Wind’s own drifting particles. A later reaction can nudge neighbors; `update` should only change the wind mote itself.
2. **Add Wildfire.** Once Wind exists, add `src/reactions/wildfire.ts` for Wind + Fire: embers streak in the wind direction and the flame’s life drops faster.
3. **Draw a new effect.** Add an `ember` visual: a motion case in `src/simulation/effects.ts` and a small drawing function in `src/simulation/render.ts`. Use it from an existing reaction via `makeEffect`.
4. **Add a background theme.** A control that switches the canvas wash between Void, Ember, and Aurora. Keep the choice in component state and pass it into `renderLab`. Respect reduced motion.
5. **Filter the activity log.** Let people show placements, reactions, or system notes. The entries already have a `tone` field.
6. **Add a discovery toast.** When a reaction unlocks for the first time, show a short on-canvas message with the reaction title, then fade it. The log already records the unlock; this is the visual announcement.

## Notes for the lab

- No accounts, analytics, payment code, or API keys.
- Prefer the existing canvas renderer over new dependencies.
- Keep motion calmer when `reducedMotion` is true: fewer spawned particles and less flicker.
- Write visible labels for controls. Do not convey state by color alone.
- The engine caps the bench at 420 particles. Do not remove that cap to make an effect “bigger.”

## License

By contributing, you agree that your work is released under the [MIT License](LICENSE).
