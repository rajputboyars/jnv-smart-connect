import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { ApiError } from "@/lib/utils/api-error";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5";
const MAX_TOKENS = 1024;

let client: Anthropic | null = null;

export function isAiConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw ApiError.badRequest(
      "AI features aren't configured for this deployment (ANTHROPIC_API_KEY is not set)."
    );
  }
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export interface AiChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * A single grounded call to Claude: `system` carries real school-record
 * context assembled by the caller (never fabricated), `messages` is the
 * conversation. Every AI controller function goes through this one
 * function so the graceful-degradation check and model/token settings live
 * in exactly one place.
 */
export async function askClaude(system: string, messages: AiChatMessage[]): Promise<string> {
  const anthropic = getClient();

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system,
    messages,
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw ApiError.internal("AI response did not contain any text");
  }
  return textBlock.text;
}
