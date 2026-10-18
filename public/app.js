const $ = (id) => document.getElementById(id);
let allEvents = [];
let saved = new Set(JSON.parse(localStorage.getItem("radar-saved") || "[]"));

const escapeHtml = (s = "") => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function guessCategory(item) {
  const t = `${item.title || ""} ${item.description || ""}`.toLowerCase();
  if (/flower|floryst|kwiat|bukiet|rękodzie|handmade/.test(t)) return "Florystyka i rękodzieło";
  if (/ceramik|glin|garncar|warsztat diy/.test(t)) return "Ceramika i warsztaty DIY";
  if (/jazz|koncert|muzyk|sax|saksofon/.test(t)) return "Koncerty i jazz";
  if (/fotograf|photo|plener fotograficzny/.test(t)) return "Fotografia i sztuka";
  if (/grafik|ilustr|rysun|komiks/.test(t)) return "Grafika i ilustracja";
  if (/wernisa|wystaw|galeria|muzeum|spotkanie/.test(t)) return "Spotkania, wystawy i wernisaże";
  if (/spacer|przyrod|las|natura|ptak/.test(t)) return "Spacery fotograficzne i natura";
  return "Inne ciekawe wydarzenia";
}
function render() {
  const city = $("city").value, cat = $("category").value, q = $("search").value.toLowerCase().trim();
  const filtered = allEvents.filter(e => (city === "Wszystkie" || e.city === city) &&
    (cat === "Wszystkie" || (e.category || guessCategory(e)) === cat) &&
    (!q || `${e.title} ${e.description} ${e.city} ${e.category}`.toLowerCase().includes(q)));
  $("count").textContent = filtered.length;
  $("events").innerHTML = filtered.length ? filtered.map(e => `
    <article class="event">
      <div class="event-top"><div><div class="city">${escapeHtml(e.city || "Miasto do sprawdzenia")}</div><h3>${escapeHtml(e.title || "Wydarzenie do sprawdzenia")}</h3></div>
      <button class="save ${saved.has(e.id)?"active":""}" data-save="${escapeHtml(e.id)}" aria-label="Zapisz wydarzenie">${saved.has(e.id)?"★":"☆"}</button></div>
      <span class="chip">${escapeHtml(e.category || guessCategory(e))}</span>
      <p>${escapeHtml(e.description || "Otwórz źródło, aby sprawdzić szczegóły wydarzenia.")}</p>
      <p class="muted small">${escapeHtml(e.dateText || "Termin do potwierdzenia")} · ${escapeHtml(e.price || "Cena do sprawdzenia")}</p>
      <div class="source"><a href="${escapeHtml(e.url)}" target="_blank" rel="noopener noreferrer">Sprawdź źródło ↗</a><span class="muted small">${escapeHtml(e.source || "Wynik wyszukiwania")}</span></div>
    </article>`).join("") : `<div class="empty"><strong>Na razie brak propozycji.</strong><br>Spróbuj zmienić filtry albo odświeżyć wyniki później.</div>`;
}
async function loadEvents(force = false) {
  $("refresh").disabled = true; $("status").textContent = force ? "Sprawdzam dostępne wyniki…" : "Pobieram ostatnie wyniki…";
  try {
    const res = await fetch("/api/events" + (force ? "?refresh=1" : ""), {cache:"no-store"});
    if (!res.ok) throw new Error("API returned " + res.status);
    const data = await res.json();
    allEvents = (data.events || []).map((e, i) => ({...e, id:e.id || `${e.url}-${i}`, category:e.category || guessCategory(e)}));
    $("updated").textContent = data.updatedAt ? "Aktualizacja: " + new Date(data.updatedAt).toLocaleString("pl-PL") : "Brak daty aktualizacji";
    $("status").textContent = data.configured === false ? "Aplikacja działa, ale wyszukiwarka nie jest jeszcze skonfigurowana. Wykonaj kroki z pliku README." : (allEvents.length ? "Gotowe — sprawdź źródła i potwierdź szczegóły u organizatora." : "Nie znaleziono jeszcze wyników. Sprawdź konfigurację i spróbuj później.");
    render();
  } catch (err) {
    $("status").textContent = "Nie udało się pobrać wyników. Sprawdź, czy aplikacja jest opublikowana na Netlify i ma skonfigurowane klucze API.";
    $("events").innerHTML = `<div class="empty">Brak połączenia z bazą wydarzeń.<br>Po wdrożeniu skonfiguruj zmienne środowiskowe opisane w README.</div>`;
    $("count").textContent = "0";
  } finally { $("refresh").disabled = false; }
}
$("events").addEventListener("click", e => {
  const b = e.target.closest("[data-save]"); if (!b) return;
  const id = b.dataset.save; saved.has(id) ? saved.delete(id) : saved.add(id);
  localStorage.setItem("radar-saved", JSON.stringify([...saved])); render();
});
["city","category"].forEach(id => $(id).addEventListener("change", render));
$("search").addEventListener("input", render);
$("refresh").addEventListener("click", () => loadEvents(true));
loadEvents();
