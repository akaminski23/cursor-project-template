import type { NextApiRequest, NextApiResponse } from 'next';

type MockResponse<T> = NextApiResponse<T> & {
  statusCode: number;
  jsonData?: T;
  headers: Record<string, string>;
};

export function createMockRequest<T>(method: string, body?: T): NextApiRequest {
  return {
    method,
    body,
    headers: {},
    query: {},
    cookies: {}
  } as unknown as NextApiRequest;
}

export function createMockResponse<T>() {
  const mock: Partial<MockResponse<T>> = {
    statusCode: 200,
    headers: {}
  };

  mock.setHeader = (name: string, value: string | string[]) => {
    mock.headers![name] = Array.isArray(value) ? value.join(', ') : value;
    return mock as MockResponse<T>;
  };

  mock.status = (code: number) => {
    mock.statusCode = code;
    return mock as MockResponse<T>;
  };

  mock.json = (data: T) => {
    mock.jsonData = data;
    return mock as MockResponse<T>;
  };

  mock.end = () => mock as MockResponse<T>;

  return mock as MockResponse<T>;
}
