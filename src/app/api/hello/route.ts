export async function GET() {
  return new Response(JSON.stringify({ message: "Hello, world!" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return new Response(
    JSON.stringify({ message: "Hello, world!", received: body || null }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
