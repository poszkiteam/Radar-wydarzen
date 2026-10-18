import { getStore } from "@netlify/blobs";

const CITIES = [
  { name: "Zielona Góra", query: "wydarzenia warsztaty koncert wystawa Zielona Góra okolice" },
  { name: "Wrocław", query: "wydarzenia warsztaty koncert wystawa Wrocław okolice" },
  { name: "Poznań", query: "wydarzenia warsztaty koncert wystawa Poznań okolice" }
];

const EXTRA_QUERIES = [
  "warsztaty florystyczne flower box rękodzieło ceramika fotografia",
  "koncert jazz wernisaż wystawa grafika ilustracja spacer fotograficzny"
];

function classify(text) {
  const t = text.toLowerCase();
  if (/flower|floryst|kwiat|bukiet|rękodzie|handmade/.test(t)) return "Florystyka i rękodzieło";
  if (/ceramik|glin|garncar|diy/.test(t)) return "Ceramika i warsztaty DIY";
  if (/jazz|koncert|muzyk|saksofon/.test(t)) return "Koncerty i jazz";
  if (/fotograf|photo/.test(t)) return "Fotografia i sztuka";
  if (/grafik|ilustr|rysun|komiks/.test(t)) return "Grafika i ilustracja";
  if (/wernisa|wystaw|galeria|muzeum|spotkanie/.test(t)) return "Spotkania, wystawy i wernisaże";
  if (/spacer|przyrod|natura|las/.test(t)) return "Spacery fotograficzne i natura";
  return "Inne ciekawe wydarzenia";
}

export default async () => {
  const apiKey = Netlify.env.get("BRAVE_SEARCH_API_KEY");
  if (!apiKey) {
    console.error("Missing BRAVE_SEARCH_API_KEY; skipping scheduled scan.");
    return new Response("Missing BRAVE_SEARCH_API_KEY", { status: 500 });
  }

  const events = [];
  const queries = [];
  for (const city of CITIES) {
    queries.push({ city: city.name, q: `${city.query} site:facebook.com/events OR site:goingapp.pl OR site:ebilet.pl OR site: biletyna.pl` });
    queries.push({ city: city.name, q: `${EXTRA_QUERIES[0]} ${city.name}` });
    queries.push({ city: city.name, q: `${EXTRA_QUERIES[1]} ${city.name}` });
  }

  for (const item of queries) {
    try {
      const url = new URL("https://api.search.brave.com/res/v1/web/search");
      url.searchParams.set("q", item.q);
      url.searchParams.set("count", "10");
      url.searchParams.set("country", "pl");
      url.searchParams.set("search_lang", "pl");
      const res = await fetch(url, { headers: { "X-Subscription-Token": apiKey, "Accept": "application/json" } });
      if (!res.ok) {
        console.error("Brave search failed", res.status, item.city);
        continue;
      }
      const data = await res.json();
      for (const result of (data.web?.results || [])) {
        if (!result.url || !/^https?:\/\//i.test(result.url)) continue;
        const title = result.title || "Wynik do sprawdzenia";
        const description = result.description || "";
        const text = `${title} ${description}`;
        const id = result.url.split("#")[0].replace(/\/$/, "");
        if (events.some(e => e.id === id)) continue;
        events.push({
          id,
          title,
          description,
          city: item.city,
          category: classify(text),
          dateText: "Termin do potwierdzenia",
          price: "Cena do sprawdzenia",
          url: result.url,
          source: (() => { try { return new URL(result.url).hostname.replace(/^www\./, ""); } catch { return "Źródło internetowe"; } })(),
          foundAt: new Date().toISOString()
        });
      }
    } catch (e) {
      console.error("Search query failed", item.city, e);
    }
  }

  const payload = { events: events.slice(0, 150), updatedAt: new Date().toISOString(), configured: true, source: "Brave Search API" };
  const store = getStore("radar-wydarzen");
  await store.setJSON("events.json", payload);
  console.log(`Saved ${payload.events.length} unique search results.`);
  return new Response(`Saved ${payload.events.length} results`, { status: 200 });
};

export const config = { schedule: "0 6 * * *" };
