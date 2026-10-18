# Radar Wydarzeń — pakiet startowy

Prosta aplikacja internetowa w języku polskim, przygotowana do publikacji na Netlify. Zawiera:
- interfejs z filtrowaniem według miasta i kategorii;
- zapisywanie ulubionych w przeglądarce;
- codzienną funkcję wyszukującą wyniki przez Brave Search API;
- przechowywanie ostatnich wyników w Netlify Blobs.

## Ważne ograniczenia wersji startowej

To jest działający szkielet do wdrożenia, ale **nie gwarantuje wykrycia wszystkich wydarzeń**. Wyszukiwarka internetowa zwraca strony pasujące do zapytań, nie ustrukturyzowany, kompletny kalendarz wydarzeń. Daty i ceny należy sprawdzić na stronie organizatora. Wstępna lokalizacja przypisuje wynik do miasta zapytania, nie potwierdza promienia 30 km geograficznie.

Integracja z Facebook Events jest ograniczona przez Meta. Ten pakiet nie loguje się na prywatne konto ani nie obchodzi ograniczeń API. Integracji z Messengerem jeszcze tu nie ma.

## Publikacja — krok po kroku

### 1. Załóż konto w Brave Search API
1. Wejdź na https://api-dashboard.search.brave.com/
2. Załóż konto i utwórz klucz API dla planu Search.
3. Brave podaje obecnie 5 USD miesięcznych darmowych kredytów; może wymagać karty do weryfikacji. Sprawdź bieżące warunki przed aktywacją.

### 2. Wgraj projekt do GitHub
Najprościej:
1. Załóż konto na https://github.com/
2. Utwórz nowe repozytorium, np. `radar-wydarzen`.
3. Wgraj wszystkie pliki z tego folderu, zachowując strukturę folderów.

### 3. Połącz z Netlify
1. Wejdź na https://app.netlify.com/
2. Wybierz **Add new site** / **Import an existing project**.
3. Połącz konto GitHub i wybierz repozytorium `radar-wydarzen`.
4. Ustaw katalog publikacji na `public`. Plik `netlify.toml` już zawiera tę konfigurację.
5. Kliknij Deploy.

### 4. Dodaj klucz API
W Netlify otwórz:
**Site configuration → Environment variables → Add a variable**
- Key: `BRAVE_SEARCH_API_KEY`
- Value: wklej swój klucz z Brave.

Nie wpisuj klucza w `public/app.js` ani w plikach HTML. Klucz ma być wyłącznie zmienną środowiskową po stronie serwera.

Po dodaniu zmiennej wykonaj ponowne wdrożenie (Deploys → Trigger deploy).

### 5. Uruchom pierwsze wyszukiwanie
Funkcja `daily-scan` uruchamia się automatycznie o 06:00 UTC, czyli zwykle o 08:00 w Polsce latem i 07:00 zimą. Harmonogram Netlify działa w UTC.
Aby przetestować ręcznie, otwórz panel Netlify → Functions → `daily-scan` → Run now (jeśli opcja jest dostępna dla wdrożenia).

Pierwsze uruchomienie może potrwać kilka sekund. Potem odśwież stronę aplikacji.

### 6. Sprawdź wyniki
- Otwórz adres `.netlify.app`.
- Użyj filtrów miasta i kategorii.
- Kliknij **Sprawdź źródło**.
- Potwierdź datę, cenę, lokalizację i informacje o zapisach u organizatora.

## Koszty

- Netlify: funkcje harmonogramu są dostępne we wszystkich planach, ale obowiązują limity planu i zasobów.
- Brave Search API: oficjalnie 5 USD kredytów miesięcznie. Ten projekt wykonuje 9 zapytań na dzień (około 270 miesięcznie), jeśli wszystkie przejdą poprawnie; sprawdź aktualny cennik i zużycie w panelu.
- Nie ma tu jeszcze płatnego modelu AI — kategoryzacja odbywa się prostymi regułami, aby ograniczyć koszty.

## Co warto dodać w wersji 2
1. Osobne źródła RSS i oficjalne kalendarze instytucji.
2. Dokładniejsze wyodrębnianie dat i cen oraz filtr odległości 30 km.
3. Przycisk „zgłoś nieaktualne wydarzenie”.
4. Powiadomienia przeglądarkowe lub e-mail.
5. Opcjonalna integracja z Messengerem po sprawdzeniu wymogów Meta.
6. Bezpieczne konto użytkownika i synchronizacja zapisanych wydarzeń między urządzeniami.
