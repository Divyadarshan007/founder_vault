import { Request, Response, NextFunction } from "express";
import { AppError } from "../../middleware/errorHandler";

export async function transcribeAudio(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Prefer Groq (free) if available, otherwise fall back to OpenAI
    const groqKey = process.env.GROQ_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!groqKey && !openaiKey) {
      next(new AppError("Transcription not configured — set OPENAI_API_KEY or GROQ_API_KEY", 501));
      return;
    }

    const file = req.file;
    if (!file) {
      next(new AppError("No audio file provided", 400));
      return;
    }

    const { default: OpenAI, toFile } = await import("openai");

    const client = groqKey
      ? new OpenAI({ apiKey: groqKey, baseURL: "https://api.groq.com/openai/v1" })
      : new OpenAI({ apiKey: openaiKey });

    const model = groqKey ? "whisper-large-v3" : "whisper-1";

    const audioFile = await toFile(file.buffer, file.originalname ?? "audio.webm", {
      type: file.mimetype,
    });

    const result = await client.audio.transcriptions.create({
      file: audioFile,
      model,
      language: "en",
      prompt: "Founder, startup, investor, pitch, revenue, product, strategy, meeting, growth, equity, funding, MVP, roadmap, SaaS, B2B, B2C, GTM.",
    });

    res.json({ success: true, text: result.text });
  } catch (err) {
    next(err);
  }
}
