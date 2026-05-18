# Campionato GeolabGuessr

Pagina statica per gestire il campionato GeolabGuessr partendo dal file `GeolabGuessr.xlsx`.

## Uso

- Apri `index.html` in browser oppure pubblica il repo con GitHub Pages.
- I giocatori entrano dalla sezione `Inserisci` scegliendo il proprio nome.
- I nuovi giocatori possono registrarsi dalla stessa sezione e partono con score a zero.
- L'admin entra dalla sezione `Admin` con utente `admin` e password `papiropapiro`.
- Il mese corrente mostra solo le 4 settimane attive; i mesi chiusi restano in `Archivio` con podio e dettagli.
- I dati vengono salvati nel browser con `localStorage`.
- L'admin puo' esportare/importare un backup JSON dalla sezione `Dati`.

## Pubblicazione GitHub Pages

Il workflow in `.github/workflows/pages.yml` pubblica la cartella del repo come sito statico.
Nel repository GitHub abilita Pages da `Settings -> Pages -> GitHub Actions`.

## Nota

GitHub Pages non offre un database o una vera autenticazione lato server. La password admin e' quindi utile solo per separare l'interfaccia nella pagina, non per proteggere dati sensibili.
