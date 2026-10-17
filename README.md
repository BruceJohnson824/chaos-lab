# CHAOS.EXE | The Chaos Lab
Hello
CHAOS.EXE is an open-source experiment sandbox for a university Halloween hackathon. Pick Fire, Water, Ice, or Electricity, paint them onto a shared canvas, and discover what happens when they meet. The physics are playful on purpose: this is a visual laboratory, not a chemistry model.

There are no accounts or payments. Painting and reactions run entirely in the browser. CHAOS CORE, the optional experiment interpreter, calls Google's hosted Gemma model from a small Node server. The browser never sees the API key.

## Start it locally

You need Node.js 20 or newer.

```bash
cd Projects/chaos-lab
npm install
copy .env.example .env
npm run dev
```

On macOS or Linux, use `cp .env.example .env`. Put your Gemini API key in `.env` as `GEMINI_API_KEY` if you want live Gemma notes. Leave it blank to use the built-in preset experiments.

`npm run dev` starts two processes: the lab on [http://localhost:5173](http://localhost:5173) and the CHAOS CORE server on port 8787. The page talks only to `/api/chaos-core` on the lab origin. Vite proxies that path to the Node server.

## Server deployment

Static hosting is not enough for live Gemma. GitHub Pages, Netlify's static publish, and `npm run preview` serve the interface, and CHAOS CORE then falls back to preset experiments.

Live Gemma needs a Node.js process that can read `GEMINI_API_KEY` from the environment:

```bash
npm run build
npm start
```

`npm start` serves the built lab and `/api/chaos-core` together, on `127.0.0.1:8787` by default. Set `CHAOS_CORE_HOST=0.0.0.0` and `CHAOS_CORE_PORT` when the process should accept connections from outside the machine. Set `GEMINI_API_KEY` in the host's environment or in a `.env` file next to the server. Do not commit `.env`, and do not put the key in any `VITE_` variable.

Other commands:

```bash
npm run build    # typecheck and production build
npm run preview  # serve the production build
npm run lint
npm run test
```

The repo includes an `.npmrc` so `npm install` succeeds on npm 10, which otherwise crashes while reading Vite’s optional peer dependencies.

## How to use the lab

- Choose an element from the palette, or press `1`–`4`.
- Click the canvas for a cluster. Drag to paint a trail.
- Focus the canvas, move the reticle with the arrow keys, and press Enter to place.
- Overlap two elements to trigger a reaction. The first time you see one, it unlocks in Discoveries.
- **Chaos Core**, on the right, turns a written idea into a placement of those same elements. It never runs generated code. Without a server key, or when Gemma is busy, it places a preset instead.
- **Pause** freezes the simulation. **Clear** removes motes and keeps your discoveries. **Reset** asks you to confirm, then wipes the canvas, the log, and the discovery catalog.
- Press `?` to open the guide again. First-time visitors see it automatically.

Discoveries are remembered for the browser tab session. The guide is dismissed for later visits in this browser.

## Reactions

| Reaction | Pair | What you see |
| --- | --- | --- |
| Steam Burst | Fire + Water | A rising veil of vapor |
| Melt Shatter | Fire + Ice | Shards and meltwater |
| Frost Bloom | Water + Ice | Frost that can freeze a droplet |
| Storm Brew | Water + Electricity | Arcs and bubbles |
| Crystal Arc | Ice + Electricity | A violet shatter |
| Plasma Flare | Fire + Electricity | A white-hot ring |
| Inferno | Fire + Fire | Two flames fold into one |
| Tidewell | Water + Water | Droplets merge |
| Glacier | Ice + Ice | Crystals lock together |
| Arc Bridge | Electricity + Electricity | A jumping arc |

## Project layout

```text
src/
  components/     interface: canvas, palette, tracker, log, guide
  elements/       one file per element, registered in elements/index.ts
  reactions/      one file per reaction, registered in reactions/index.ts
  simulation/     particle engine and canvas renderer
```

New elements and reactions should not need changes to the renderer unless they introduce a new visual.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the file-by-file path and six beginner-sized ideas.

## License

[MIT](LICENSE)
