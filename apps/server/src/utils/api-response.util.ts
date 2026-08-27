import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: any;
  errors?: any[];
}

export class AppError extends Error {
  public statusCode: number;
  public errors?: any[];

  constructor(message: string, statusCode = 400, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
  meta?: any
) => {
  const response: ApiResponse<T> = {
    success: true,
    statusCode,
    message,
    data,
  };
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  errors?: any[]
) => {
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: errors || [],
  });
};
