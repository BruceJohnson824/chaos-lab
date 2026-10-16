import { useEffect, useState } from "react";
import { presetFor, SAMPLE_PROMPTS, validatePlan } from "../chaos-core/plan.ts";
import type { ExperimentPlan } from "../chaos-core/plan.ts";
import type { LabSimulation } from "../simulation/engine.ts";
import type { ElementId } from "../simulation/types.ts";

interface CoreResponse {
  source?: unknown;
  notice?: unknown;
  plan?: unknown;
  error?: unknown;
}

interface ChaosCoreProps {
  sim: LabSimulation;
  onSelect: (element: ElementId) => void;
}

export function ChaosCore({ sim, onSelect }: ChaosCoreProps) {
  const [prompt, setPrompt] = useState(SAMPLE_PROMPTS[0] ?? "");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("Describe an experiment. CHAOS CORE will use only the elements already on the bench.");
  const [tone, setTone] = useState<"idle" | "error" | "ok">("idle");
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      for (let attempt = 0; attempt < 5; attempt += 1) {
        try {
          const response = await fetch("/api/chaos-core");
          if (!response.ok) throw new Error("status");
          const body: unknown = await response.json();
          if (cancelled) return;
          const ready =
            typeof body === "object" &&
            body !== null &&
            "configured" in body &&
            Boolean((body as { configured?: unknown }).configured);
          setConfigured(ready);
          return;
        } catch {
          await new Promise((resolve) => setTimeout(resolve, 400));
        }
      }
      if (!cancelled) setConfigured(null);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function runExperiment(): Promise<void> {
    const idea = prompt.trim();
    if (!idea || loading) return;
    setLoading(true);
    setTone("idle");
    setNotice(configured === false ? "Using a preset experiment." : "Asking Gemma…");
    try {
      const response = await fetch("/api/chaos-core", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: idea }),
      });
      const body = (await response.json()) as CoreResponse;
      if (!response.ok) {
        if (response.status === 400) {
          setTone("error");
          setNotice(typeof body.error === "string" ? body.error : "CHAOS CORE could not read that idea.");
          return;
        }
        throw new Error(typeof body.error === "string" ? body.error : "CHAOS CORE is unavailable.");
      }
      const plan = validatePlan(body.plan);
      if (!plan) throw new Error("The server returned an experiment the lab cannot run.");
      applyPlan(sim, plan, onSelect);
      setTone(body.source === "gemma" ? "ok" : "idle");
      setNotice(typeof body.notice === "string" && body.notice ? body.notice : plan.summary);
    } catch (error) {
      const plan = presetFor(idea);
      applyPlan(sim, plan, onSelect);
      setTone("error");
      const reason = error instanceof Error ? error.message : "CHAOS CORE is unavailable.";
      setNotice(`${reason} A preset experiment was placed instead.`);
    } finally {
      setLoading(false);
    }
  }

  const availability =
    configured === null ? "Core server offline. Presets still run." : configured ? "Gemma is available on the server." : "Server preset mode.";

  return (
    <section className="panel chaos-core" aria-labelledby="core-title">
      <div className="panel-head">
        <h2 id="core-title">Chaos Core</h2>
        <p>{availability}</p>
      </div>
      <label className="core-label" htmlFor="chaos-core-prompt">
        Describe an experiment
      </label>
      <textarea
        id="chaos-core-prompt"
        className="core-prompt"
        value={prompt}
        maxLength={400}
        rows={3}
        onChange={(event) => setPrompt(event.target.value)}
      />
      <div className="core-samples" role="group" aria-label="Sample experiments">
        {SAMPLE_PROMPTS.map((sample) => (
          <button key={sample} type="button" className="chip" onClick={() => setPrompt(sample)}>
            {sample}
          </button>
        ))}
      </div>
      <button type="button" className="btn btn-primary" onClick={() => void runExperiment()} disabled={loading || prompt.trim().length === 0}>
        {loading ? "Asking Gemma…" : "Run experiment"}
      </button>
      <p className={tone === "error" ? "core-status is-error" : "core-status"} role="status">
        {notice}
      </p>
    </section>
  );
}

function applyPlan(sim: LabSimulation, plan: ExperimentPlan, onSelect: (element: ElementId) => void): void {
  if (sim.width < 20 || sim.height < 20) {
    sim.announce("The canvas is not ready yet. Run the experiment again in a moment.");
    return;
  }
  const paused = !sim.running;
  for (const placement of plan.placements) {
    sim.placeElement(placement.element, placement.x * sim.width, placement.y * sim.height, placement.mode);
  }
  const first = plan.placements[0];
  if (first) onSelect(first.element);
  sim.announce(`CHAOS CORE · ${plan.title}. ${plan.summary}`);
  if (paused) sim.announce("The bench is paused. Press Play to watch this experiment.");
}
