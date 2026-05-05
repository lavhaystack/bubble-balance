import { createServer, type IncomingMessage, type ServerResponse } from "http";

async function toRequest(req: IncomingMessage) {
  const url = `http://localhost${req.url ?? "/"}`;
  const headers = new Headers();
  Object.entries(req.headers).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }
    headers.set(key, Array.isArray(value) ? value.join(",") : value);
  });

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const body = chunks.length ? Buffer.concat(chunks) : undefined;

  return new Request(url, {
    method: req.method,
    headers,
    body,
  });
}

async function writeResponse(res: ServerResponse, response: Response) {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  const body = Buffer.from(await response.arrayBuffer());
  res.end(body);
}

export function createRouteServer(
  handler: any,
  params?: Record<string, string>,
) {
  return createServer(async (req, res) => {
    const request = await toRequest(req);
    const response = params
      ? await handler(request, { params: Promise.resolve(params) })
      : await handler(request, {});
    await writeResponse(res, response);
  });
}
