import { NextRequest } from 'next/server';

declare module 'next/server' {
  interface RouteContext {
    params: Record<string, string>;
  }

  export type RouteHandler = (
    request: NextRequest | Request,
    context: { params: Record<string, string> }
  ) => Promise<Response> | Response;
}
