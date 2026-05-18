# Campionato GeolabGuessr

Pagina statica per gestire il campionato GeolabGuessr partendo dal file `GeolabGuessr.xlsx`.

## Uso

- Apri `index.html` in browser oppure pubblica il repo con GitHub Pages.
- I giocatori entrano dalla sezione `Inserisci` con email e password Supabase.
- I nuovi giocatori possono registrarsi dalla stessa sezione e partono con score a zero nel mese corrente.
- L'admin entra dalla sezione `Admin` con un account Supabase che ha `is_admin = true` in `profiles`.
- Il mese corrente mostra solo le 4 settimane attive; i mesi chiusi restano in `Archivio` con podio e dettagli.
- I dati condivisi vengono salvati su Supabase. Se `supabase-config.js` e' vuoto, l'app ricade in modalita locale con `localStorage`.
- L'admin puo' esportare/importare un backup JSON dalla sezione `Dati`.

## Supabase

1. Crea o apri il progetto Supabase.
2. Vai in `SQL Editor` e lancia il file `supabase/schema.sql`.
3. Verifica che `supabase-config.js` contenga `url` e `anonKey`.
4. Crea il tuo account dalla pagina `Inserisci`.
5. Promuovi il tuo account ad admin da SQL:

```sql
update public.profiles
set is_admin = true
where user_id = (
  select id from auth.users where email = 'LA_TUA_EMAIL'
);
```

La `anonKey` puo' stare nel frontend: e' pubblica per design e viene protetta dalle policy RLS. Non mettere mai la `service_role key` nel sito o nel repo.

## Pubblicazione GitHub Pages

Il workflow in `.github/workflows/pages.yml` pubblica la cartella del repo come sito statico.
Nel repository GitHub abilita Pages da `Settings -> Pages -> GitHub Actions`.

## Nota

GitHub Pages ospita solo il sito statico. Supabase gestisce database, login e permessi.
