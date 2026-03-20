import arcjet, { detectBot, shield } from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE",
        "CATEGORY:MONITOR",
        "CATEGORY:PREVIEW",
      ],
    }),
  ],
});

export async function POST(req) {
  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    return new Response("Forbidden", { status: 403 });
  }

  return new Response("Success");
}