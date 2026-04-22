import Groq from "groq-sdk"

export const createGroqClient = (apiKey: string): Groq => {
  return new Groq({ apiKey, dangerouslyAllowBrowser: false })
}