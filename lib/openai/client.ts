import "server-only"
import OpenAI from "openai"

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.")
  }
  return new OpenAI({ apiKey })
}

export function hasOpenAI() {
  return Boolean(process.env.OPENAI_API_KEY)
}

export const EXTRACTION_MODEL = process.env.OPENAI_EXTRACTION_MODEL ?? "gpt-4o-mini"
export const REPORT_MODEL = process.env.OPENAI_REPORT_MODEL ?? "gpt-4o-mini"
