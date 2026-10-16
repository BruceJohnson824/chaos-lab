import { GoogleGenAI } from "@google/genai";
import { catalogPrompt, extractJson, presetFor, validatePlan } from "../src/chaos-core/plan.ts";
import type { ExperimentPlan } from "../src/chaos-core/plan.ts";

export const GEMMA_MODEL = "gemma-4-26b-a4b-it";

export interface CoreResult {
  source: "gemma" | "preset";
  notice: string;
  plan: ExperimentPlan;
}

function isRateLimit(error: unknown): boolean {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as { status?: unknown }).status;
    if (status === 429) return true;
  }
  const message = error instanceof Error ? error.message : "";
  return /429|RESOURCE_EXHAUSTED|rate.?limit/i.test(message);
}

export function gemmaConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

/** Ask hosted Gemma, then keep only a plan the lab already knows how to run. */
export async function interpretExperiment(idea: string): Promise<CoreResult> {
  const preset = presetFor(idea);
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return {
      source: "preset",
      notice: "Gemma is not configured on the server, so a preset experiment was used.",
      plan: preset,
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: GEMMA_MODEL,
      contents: catalogPrompt(idea),
    });
    const plan = validatePlan(extractJson(response.text ?? ""));
    if (!plan) {
      return {
        source: "preset",
        notice: "Gemma's reply did not match the lab, so a preset experiment was used.",
        plan: preset,
      };
    }
    return { source: "gemma", notice: "Gemma prepared this from the lab catalog.", plan };
  } catch (error) {
    return {
      source: "preset",
      notice: isRateLimit(error)
        ? "Gemma is rate-limited, so a preset experiment was used."
        : "Gemma is unavailable, so a preset experiment was used.",
      plan: preset,
    };
  }
}
