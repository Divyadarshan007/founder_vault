import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  if (err instanceof Error) {
    if (err.message.includes("E11000")) {
      res.status(409).json({ success: false, message: "Duplicate entry" });
      return;
    }
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
    return;
  }

  res.status(500).json({ success: false, message: "Internal server error" });
}
