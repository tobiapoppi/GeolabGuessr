# Campionato GeolabGuessr

Pagina statica per gestire il campionato GeolabGuessr partendo dal file `GeolabGuessr.xlsx`.

## Uso

- Apri `index.html` in browser oppure pubblica il repo con GitHub Pages.
- I giocatori vanno nella sezione `Inserisci`, scelgono un nome dalla lista e aggiornano gli score.
- I nuovi giocatori si aggiungono dalla sezione `Admin` e partono con score a zero nel mese corrente.
- La sezione `Admin` non richiede credenziali: e' pensata per un gruppo chiuso.
- Il mese corrente mostra solo le 4 settimane attive; i mesi chiusi restano in `Archivio` con podio e dettagli.
- I dati condivisi vengono salvati su Supabase. Se `supabase-config.js` e' vuoto, l'app ricade in modalita locale con `localStorage`.
- L'admin puo' esportare/importare un backup JSON dalla sezione `Dati`.

## Supabase

1. Crea o apri il progetto Supabase.
2. Vai in `SQL Editor` e lancia il file `supabase/schema.sql`.
3. Verifica che `supabase-config.js` contenga `url` e `anonKey`.
4. Non serve configurare login email/password: l'app usa Supabase solo come database condiviso.

La `anonKey` puo' stare nel frontend: e' pubblica per design. In questa versione le policy RLS permettono scrittura anonima perche' il campionato e' chiuso al vostro gruppo. Non mettere mai la `service_role key` nel sito o nel repo.

Per cancellare l'utente di prova `tobi1modna@gmail.com`, esegui `supabase/delete-test-user.sql` nel SQL Editor di Supabase.

## Pubblicazione GitHub Pages

Il workflow in `.github/workflows/pages.yml` pubblica la cartella del repo come sito statico.
Nel repository GitHub abilita Pages da `Settings -> Pages -> GitHub Actions`.

## Nota

GitHub Pages ospita solo il sito statico. Supabase gestisce database, login e permessi.
