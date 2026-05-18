# Campionato GeolabGuessr

Pagina statica per gestire il campionato GeolabGuessr partendo dal file `GeolabGuessr.xlsx`.

## Uso

- Apri `index.html` in browser oppure pubblica il repo con GitHub Pages.
- I giocatori vanno nella sezione `Inserisci`, scelgono un nome dalla lista e aggiornano gli score.
- I nuovi giocatori possono aggiungersi dalla sezione `Inserisci` e partono con score a zero nel mese corrente.
- La sezione `Admin` richiede utente `admin`; la password e' salvata su Supabase, non nel codice GitHub.
- Il mese corrente mostra solo le 4 settimane attive; i mesi chiusi restano in `Archivio` con podio e dettagli.
- I dati condivisi vengono salvati su Supabase. Se `supabase-config.js` e' vuoto, l'app ricade in modalita locale con `localStorage`.
- L'admin puo' esportare/importare un backup JSON dalla sezione `Dati`.

## Supabase

1. Crea o apri il progetto Supabase.
2. Vai in `SQL Editor` e lancia il file `supabase/schema.sql`.
3. Lancia anche `supabase/admin-password.sql` dal tuo workspace locale per impostare la password admin. Questo file e' ignorato da Git.
4. Verifica che `supabase-config.js` contenga `url` e `anonKey`.
5. Non serve configurare login email/password: l'app usa Supabase solo come database condiviso.

La `anonKey` puo' stare nel frontend: e' pubblica per design. In questa versione le policy RLS permettono scrittura anonima sugli score perche' il campionato e' chiuso al vostro gruppo. Non mettere mai la `service_role key` nel sito o nel repo.

Per cancellare l'utente di prova `tobi1modna@gmail.com`, esegui `supabase/delete-test-user.sql` nel SQL Editor di Supabase.

## Pubblicazione GitHub Pages

Il workflow in `.github/workflows/pages.yml` pubblica la cartella del repo come sito statico.
Nel repository GitHub abilita Pages da `Settings -> Pages -> GitHub Actions`.

## Nota

GitHub Pages ospita solo il sito statico. Supabase gestisce database, login e permessi.
