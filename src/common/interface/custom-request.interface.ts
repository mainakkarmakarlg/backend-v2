import { Request } from 'express';

export interface CustomRequest extends Request {
  headers: {
    dauth?: string;
  } & Request['headers'];
  userid?: number;
  platformid?: number;
}

