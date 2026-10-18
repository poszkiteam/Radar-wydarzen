import { getStore } from "@netlify/blobs";

export default async () => {
  try {
    const store = getStore("radar-wydarzen");
    const data = await store.get("events.json", { type: "json" });
    if (!data) return Response.json({ events: [], updatedAt: null, configured: Boolean(Netlify.env.get("BRAVE_SEARCH_API_KEY")) });
    return Response.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("Unable to load event store", e);
    return Response.json({ events: [], updatedAt: null, error: "store_unavailable" }, { status: 200 });
  }
};

export const config = { path: "/api/events" };
