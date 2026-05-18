(function () {
  "use strict";

  var STORAGE_KEY = "geolabguessr-state-v1";
  var SESSION_KEY = "geolabguessr-session-v1";
  var supabaseClient = null;
  var remoteStatus = {enabled: false, loading: false, error: ""};
  var profileByName = {};
  var dayIdByWeekDay = {};

  var DEFAULT_STATE = {
    seasonName: "Campionato GeolabGuessr",
    rules: "VIETATO fare ricerche su internet, VIETATO aprire google maps, VIETATO reperire qualsiasi informazione al di fuori della pagina di GeoGuessr.",
    scoring: [25, 20, 16, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1, 1, 1, 1, 1],
    players: [
      "Bigaz",
      "Buccia",
      "Evelyn",
      "Fede Melis",
      "Fede Putamorsi",
      "Leo",
      "Matti Berna",
      "Nello",
      "Ricky Salami",
      "Tobi",
      "Carmine",
      "Thomas"
    ],
    weeks: [
      {
        id: "w1",
        name: "Settimana 1",
        range: "20/04-24/04",
        days: ["20/04", "21/04", "22/04", "23/04", "24/04"],
        scores: {
          Bigaz: {"20/04": 15299, "21/04": 20969, "22/04": 19007, "23/04": 0, "24/04": 18202},
          Buccia: {"20/04": 23159, "21/04": 21014, "22/04": 22842, "23/04": 19692, "24/04": 22192},
          Evelyn: {"20/04": 12250, "21/04": 21063, "22/04": 11848, "23/04": 17628, "24/04": 9814},
          "Fede Melis": {"20/04": 15320, "21/04": 13196, "22/04": 10103, "23/04": 0, "24/04": 12948},
          "Fede Putamorsi": {"20/04": 19542, "21/04": 17874, "22/04": 16981, "23/04": 10018, "24/04": 15375},
          Leo: {"20/04": 0, "21/04": 0, "22/04": 16318, "23/04": 18456, "24/04": 13604},
          "Matti Berna": {"20/04": 11801, "21/04": 17772, "22/04": 19527, "23/04": 0, "24/04": 0},
          Nello: {"20/04": 14371, "21/04": 23253, "22/04": 16164, "23/04": 16245, "24/04": 22846},
          "Ricky Salami": {"20/04": 0, "21/04": 0, "22/04": 0, "23/04": 0, "24/04": 0},
          Tobi: {"20/04": 14721, "21/04": 20075, "22/04": 11783, "23/04": 13340, "24/04": 18496},
          Carmine: {"20/04": 0, "21/04": 0, "22/04": 0, "23/04": 14112, "24/04": 0},
          Thomas: {"20/04": 0, "21/04": 0, "22/04": 0, "23/04": 0, "24/04": 0}
        }
      },
      {
        id: "w2",
        name: "Settimana 2",
        range: "27/04-01/05",
        days: ["27/04", "28/04", "29/04", "30/04", "01/05"],
        scores: {
          Bigaz: {"27/04": 19486, "28/04": 13443, "29/04": 0, "30/04": 23961, "01/05": 0},
          Buccia: {"27/04": 13785, "28/04": 20098, "29/04": 16140, "30/04": 16060, "01/05": 24347},
          Evelyn: {"27/04": 16711, "28/04": 16549, "29/04": 19994, "30/04": 14962, "01/05": 8802},
          "Fede Melis": {"27/04": 0, "28/04": 0, "29/04": 0, "30/04": 0, "01/05": 0},
          "Fede Putamorsi": {"27/04": 10316, "28/04": 14314, "29/04": 15327, "30/04": 11313, "01/05": 7520},
          Leo: {"27/04": 11662, "28/04": 18778, "29/04": 16958, "30/04": 13457, "01/05": 19233},
          "Matti Berna": {"27/04": 0, "28/04": 0, "29/04": 0, "30/04": 0, "01/05": 0},
          Nello: {"27/04": 0, "28/04": 16799, "29/04": 0, "30/04": 0, "01/05": 0},
          "Ricky Salami": {"27/04": 0, "28/04": 0, "29/04": 0, "30/04": 0, "01/05": 0},
          Tobi: {"27/04": 14882, "28/04": 14076, "29/04": 17706, "30/04": 14743, "01/05": 19922},
          Carmine: {"27/04": 0, "28/04": 0, "29/04": 0, "30/04": 0, "01/05": 0},
          Thomas: {"27/04": 0, "28/04": 0, "29/04": 0, "30/04": 0, "01/05": 0}
        }
      },
      {
        id: "w3",
        name: "Settimana 3",
        range: "04/05-08/05",
        days: ["04/05", "05/05", "06/05", "07/05", "08/05"],
        scores: {
          Bigaz: {"04/05": 17189, "05/05": 18677, "06/05": 0, "07/05": 0, "08/05": 23633},
          Buccia: {"04/05": 21667, "05/05": 15332, "06/05": 18321, "07/05": 19906, "08/05": 20208},
          Evelyn: {"04/05": 19898, "05/05": 11227, "06/05": 7581, "07/05": 18882, "08/05": 0},
          "Fede Melis": {"04/05": 0, "05/05": 0, "06/05": 0, "07/05": 0, "08/05": 0},
          "Fede Putamorsi": {"04/05": 14568, "05/05": 10560, "06/05": 9800, "07/05": 13589, "08/05": 13895},
          Leo: {"04/05": 13814, "05/05": 13000, "06/05": 0, "07/05": 18734, "08/05": 0},
          "Matti Berna": {"04/05": 0, "05/05": 0, "06/05": 0, "07/05": 0, "08/05": 0},
          Nello: {"04/05": 0, "05/05": 0, "06/05": 0, "07/05": 0, "08/05": 0},
          "Ricky Salami": {"04/05": 0, "05/05": 0, "06/05": 0, "07/05": 0, "08/05": 0},
          Tobi: {"04/05": 15332, "05/05": 16967, "06/05": 13109, "07/05": 17291, "08/05": 16894},
          Carmine: {"04/05": 0, "05/05": 0, "06/05": 0, "07/05": 0, "08/05": 0},
          Thomas: {"04/05": 0, "05/05": 0, "06/05": 0, "07/05": 0, "08/05": 16368}
        }
      },
      {
        id: "w4",
        name: "Settimana 4",
        range: "11/05-15/05",
        days: ["11/05", "12/05", "13/05", "14/05", "15/05"],
        scores: {
          Bigaz: {"11/05": 0, "12/05": 0, "13/05": 0, "14/05": 0, "15/05": 0},
          Buccia: {"11/05": 20968, "12/05": 20242, "13/05": 20682, "14/05": 19368, "15/05": 16332},
          Evelyn: {"11/05": 15897, "12/05": 21198, "13/05": 16214, "14/05": 19200, "15/05": 18113},
          "Fede Melis": {"11/05": 0, "12/05": 0, "13/05": 0, "14/05": 0, "15/05": 0},
          "Fede Putamorsi": {"11/05": 12000, "12/05": 12000, "13/05": 12000, "14/05": 14500, "15/05": 12256},
          Leo: {"11/05": 17581, "12/05": 10585, "13/05": 12059, "14/05": 14048, "15/05": 15101},
          "Matti Berna": {"11/05": 0, "12/05": 0, "13/05": 0, "14/05": 0, "15/05": 0},
          Nello: {"11/05": 0, "12/05": 0, "13/05": 0, "14/05": 0, "15/05": 0},
          "Ricky Salami": {"11/05": 0, "12/05": 0, "13/05": 0, "14/05": 0, "15/05": 0},
          Tobi: {"11/05": 18945, "12/05": 22182, "13/05": 21268, "14/05": 18190, "15/05": 18649},
          Carmine: {"11/05": 0, "12/05": 0, "13/05": 0, "14/05": 0, "15/05": 0},
          Thomas: {"11/05": 14638, "12/05": 0, "13/05": 16904, "14/05": 8971, "15/05": 8847}
        }
      }
    ]
  };

  var MONTH_ONE_WEEKS = clone(DEFAULT_STATE.weeks);
  var MONTH_TWO_WEEKS = createBlankWeeks([
    {id: "m2w1", name: "Settimana 1", range: "18/05-22/05", days: ["18/05", "19/05", "20/05", "21/05", "22/05"]},
    {id: "m2w2", name: "Settimana 2", range: "25/05-29/05", days: ["25/05", "26/05", "27/05", "28/05", "29/05"]},
    {id: "m2w3", name: "Settimana 3", range: "01/06-05/06", days: ["01/06", "02/06", "03/06", "04/06", "05/06"]},
    {id: "m2w4", name: "Settimana 4", range: "08/06-12/06", days: ["08/06", "09/06", "10/06", "11/06", "12/06"]}
  ], DEFAULT_STATE.players);

  DEFAULT_STATE.currentMonth = {
    id: "mese-2",
    name: "Mese 2",
    range: "18/05-12/06"
  };
  DEFAULT_STATE.archives = [{
    id: "mese-1",
    name: "Mese 1",
    range: "20/04-16/05",
    weeks: MONTH_ONE_WEEKS
  }];
  DEFAULT_STATE.weeks = MONTH_TWO_WEEKS;

  var app = document.getElementById("app");
  var state = loadState();
  var session = loadSession();
  var currentWeekId = state.weeks[0] ? state.weeks[0].id : "";

  window.addEventListener("hashchange", render);
  document.addEventListener("submit", handleSubmit);
  document.addEventListener("click", handleClick);
  document.addEventListener("input", handleInput);
  document.addEventListener("change", handleChange);

  setupSupabase();
  render();
  initRemote();

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function createBlankWeeks(weeks, players) {
    return weeks.map(function (week) {
      var scores = {};
      players.forEach(function (player) {
        scores[player] = {};
        week.days.forEach(function (day) {
          scores[player][day] = 0;
        });
      });
      return {
        id: week.id,
        name: week.name,
        range: week.range,
        days: week.days.slice(),
        scores: scores
      };
    });
  }

  function loadState() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      var normalized = normalizeState(saved || clone(DEFAULT_STATE));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      return normalized;
    } catch (error) {
      var fallback = normalizeState(clone(DEFAULT_STATE));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
      return fallback;
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function loadSession() {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || {player: "", isAdmin: false};
    } catch (error) {
      return {player: "", isAdmin: false};
    }
  }

  function saveSession() {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function setupSupabase() {
    var config = window.GEOLAB_SUPABASE || {};
    if (!config.url || !config.anonKey || !window.supabase) return;
    supabaseClient = window.supabase.createClient(config.url, config.anonKey);
    remoteStatus.enabled = true;
  }

  async function initRemote() {
    if (!supabaseClient) return;
    remoteStatus.loading = true;
    render();
    try {
      await loadRemoteState();
      remoteStatus.error = "";
    } catch (error) {
      remoteStatus.error = error.message;
    } finally {
      remoteStatus.loading = false;
      render();
    }
  }

  async function loadRemoteState() {
    if (!supabaseClient) return;
    remoteStatus.loading = true;

    var results = await Promise.all([
      supabaseClient.from("profiles").select("id, display_name, is_admin").order("display_name"),
      supabaseClient.from("months").select("id, name, range_text, is_active, sort_order").order("sort_order"),
      supabaseClient.from("weeks").select("id, month_id, name, range_text, sort_order").order("sort_order"),
      supabaseClient.from("days").select("id, week_id, label, sort_order").order("sort_order"),
      supabaseClient.from("scores").select("day_id, player_id, score")
    ]);

    results.forEach(function (result) {
      if (result.error) throw result.error;
    });

    var profiles = results[0].data || [];
    var months = results[1].data || [];
    var weeks = results[2].data || [];
    var days = results[3].data || [];
    var scores = results[4].data || [];

    if (!months.length || !weeks.length || !days.length) {
      remoteStatus.error = "Database Supabase vuoto: esegui supabase/schema.sql.";
      return;
    }

    profileByName = {};
    profiles.forEach(function (profile) {
      profileByName[profile.display_name] = profile.id;
    });

    var playerById = {};
    profiles.forEach(function (profile) {
      playerById[profile.id] = profile.display_name;
    });

    var scoreByDayPlayer = {};
    scores.forEach(function (score) {
      scoreByDayPlayer[score.day_id + "::" + score.player_id] = score.score;
    });

    dayIdByWeekDay = {};
    var daysByWeek = groupBy(days, "week_id");
    var weeksByMonth = groupBy(weeks, "month_id");

    function buildWeeks(monthId) {
      return (weeksByMonth[monthId] || []).map(function (week) {
        var sortedDays = (daysByWeek[week.id] || []).slice().sort(sortByOrder);
        var weekScores = {};
        profiles.forEach(function (profile) {
          weekScores[profile.display_name] = {};
          sortedDays.forEach(function (day) {
            dayIdByWeekDay[week.id + "::" + day.label] = day.id;
            weekScores[profile.display_name][day.label] = scoreValue(scoreByDayPlayer[day.id + "::" + profile.id]);
          });
        });
        return {
          id: week.id,
          name: week.name,
          range: week.range_text || "",
          days: sortedDays.map(function (day) { return day.label; }),
          scores: weekScores
        };
      }).sort(sortByOrder);
    }

    var activeMonth = months.find(function (month) { return month.is_active; }) || months[months.length - 1];
    state = normalizeState({
      seasonName: DEFAULT_STATE.seasonName,
      rules: DEFAULT_STATE.rules,
      scoring: DEFAULT_STATE.scoring,
      players: profiles.map(function (profile) { return profile.display_name; }),
      currentMonth: {
        id: activeMonth.id,
        name: activeMonth.name,
        range: activeMonth.range_text || ""
      },
      weeks: buildWeeks(activeMonth.id),
      archives: months.filter(function (month) {
        return month.id !== activeMonth.id;
      }).map(function (month) {
        return {
          id: month.id,
          name: month.name,
          range: month.range_text || "",
          weeks: buildWeeks(month.id)
        };
      }).reverse()
    });
    saveState();
    remoteStatus.error = "";
  }

  function groupBy(rows, key) {
    return rows.reduce(function (groups, row) {
      groups[row[key]] = groups[row[key]] || [];
      groups[row[key]].push(row);
      return groups;
    }, {});
  }

  function sortByOrder(a, b) {
    return (a.sort_order || 0) - (b.sort_order || 0);
  }

  function normalizeState(next) {
    var base = Object.assign(clone(DEFAULT_STATE), next || {});
    base.players = Array.from(new Set((base.players || []).filter(Boolean)));
    base.scoring = (base.scoring || DEFAULT_STATE.scoring).map(function (value) {
      return Math.max(0, parseInt(value, 10) || 0);
    });
    base.archives = base.archives || [];
    if (!base.currentMonth) {
      base.currentMonth = clone(DEFAULT_STATE.currentMonth);
    }
    if (isMonthOneWeeks(base.weeks || [])) {
      base.archives = base.archives.filter(function (archive) {
        return archive.id !== "mese-1";
      });
      base.archives.unshift({
        id: "mese-1",
        name: "Mese 1",
        range: "20/04-16/05",
        weeks: clone(base.weeks)
      });
      base.currentMonth = clone(DEFAULT_STATE.currentMonth);
      base.weeks = createBlankWeeks(DEFAULT_STATE.weeks, base.players);
    }
    base.weeks = (base.weeks || []).map(function (week, index) {
      return normalizeWeek(week, index, base.players);
    });
    base.archives = base.archives.map(function (archive) {
      return {
        id: archive.id || slug(archive.name || "archivio"),
        name: archive.name || "Archivio",
        range: archive.range || "",
        weeks: (archive.weeks || []).map(function (week, index) {
          return normalizeWeek(week, index, base.players);
        })
      };
    });
    return base;
  }

  function normalizeWeek(week, index, players) {
    var normalized = {
      id: week.id || "w" + (index + 1),
      name: week.name || "Settimana " + (index + 1),
      range: week.range || "",
      days: (week.days || []).filter(Boolean),
      scores: week.scores || {}
    };

    players.forEach(function (player) {
      normalized.scores[player] = normalized.scores[player] || {};
      normalized.days.forEach(function (day) {
        normalized.scores[player][day] = scoreValue(normalized.scores[player][day]);
      });
    });

    return normalized;
  }

  function isMonthOneWeeks(weeks) {
    return weeks.length && weeks[0].range === "20/04-24/04";
  }

  function route() {
    return (window.location.hash || "#classifica").replace("#", "") || "classifica";
  }

  function render() {
    var activeRoute = route().split("/")[0];
    document.querySelectorAll("[data-route]").forEach(function (link) {
      link.setAttribute("aria-current", link.dataset.route === activeRoute ? "page" : "false");
    });

    if (!state.weeks.length || !state.players.length) {
      app.innerHTML = document.getElementById("empty-state-template").innerHTML;
      return;
    }

    if (activeRoute === "inserisci") {
      renderInsert();
    } else if (activeRoute === "archivio") {
      renderArchive();
    } else if (activeRoute === "admin") {
      renderAdmin();
    } else if (activeRoute === "dati") {
      renderData();
    } else {
      renderLeaderboard();
    }
    app.focus({preventScroll: true});
  }

  function renderLeaderboard() {
    var rows = leaderboard();
    var week = getWeek(currentWeekId) || state.weeks[0];
    currentWeekId = week.id;
    var weekRows = leaderboard(week.id);
    var submitted = countSubmittedScores();
    var leader = rows[0];

    app.innerHTML = [
      hero("Classifica", state.currentMonth.name + " · " + state.currentMonth.range, escapeHtml(state.rules)),
      '<section class="stat-row" aria-label="Statistiche">',
      stat(leader ? leader.player : "-", "Leader"),
      stat(leader ? leader.points : 0, "Punti leader"),
      stat(leader ? formatNumber(leader.score) : 0, "Score leader"),
      stat(submitted, "Score inseriti"),
      "</section>",
      '<section class="grid">',
      '<div class="stack">',
      remoteStatus.error ? panel("Database", '<p class="toast error">' + escapeHtml(remoteStatus.error) + "</p>") : "",
      panel("Classifica generale", leaderboardTable(rows, true), "tight"),
      panel(
        "Classifica settimanale",
        segmentedWeeks() + leaderboardTable(weekRows, false),
        "tight"
      ),
      panel(
        "Score di giornata",
        weeklyScoresTable(week),
        "tight"
      ),
      "</div>",
      '<aside class="stack">',
      panel("Accesso rapido", quickLogin()),
      panel("Recap mese chiuso", archiveRecap()),
      panel("Calcolo punti", scoringExplanation()),
      panel("Giornate", daysOverview()),
      "</aside>",
      "</section>"
    ].join("");
  }

  function renderInsert() {
    var player = session.player && state.players.includes(session.player) ? session.player : state.players[0];
    session.player = player;
    saveSession();
    var activeWeek = getWeek(currentWeekId) || state.weeks[0];
    currentWeekId = activeWeek.id;
    app.innerHTML = [
      pageHead("Inserisci", "Inserisci punteggi", "Scegli un giocatore e aggiorna i suoi score. I punti vengono ricalcolati in automatico."),
      '<section class="stack">',
      '<div class="panel-head">',
      '<div class="segmented" role="group" aria-label="Settimane disponibili">',
      state.weeks.map(function (week) {
        var pressed = week.id === currentWeekId ? "true" : "false";
        return '<button type="button" data-week="' + escapeAttr(week.id) + '" aria-pressed="' + pressed + '">' + escapeHtml(week.name) + "</button>";
      }).join(""),
      "</div>",
      "</div>",
      playerPicker(player),
      scoreForm(player),
      "</section>"
    ].join("");
  }

  function renderAdmin() {
    app.innerHTML = [
      pageHead("Admin", "Pannello admin", "Gestisci il campionato e prepara i dati da pubblicare."),
      '<section class="grid">',
      '<div class="stack">',
      panel("Giocatori", playersAdmin()),
      panel("Settimane", weeksAdmin()),
      panel("Punti", scoringAdmin()),
      "</div>",
      '<aside class="stack">',
      panel("Dati", adminDataTools()),
      "</aside>",
      "</section>"
    ].join("");
  }

  function renderData() {
    var payload = escapeHtml(JSON.stringify(state, null, 2));
    app.innerHTML = [
      pageHead("Dati", "Backup JSON", "Esporta, importa o controlla lo stato pubblicato nella pagina."),
      '<section class="grid">',
      '<div class="panel">',
      '<div class="panel-head"><h2>JSON corrente</h2><button class="button secondary" type="button" data-action="copy-json">Copia</button></div>',
      '<textarea id="json-state" spellcheck="false">' + payload + "</textarea>",
      '<div class="actions">',
      '<button class="button" type="button" data-action="load-json-text">Carica JSON</button>',
      '<button class="button secondary" type="button" data-action="download-json">Scarica</button>',
      "</div>",
      '<p class="toast" id="data-toast" aria-live="polite"></p>',
      "</div>",
      '<aside class="panel">',
      '<h2>Pubblicazione</h2>',
      '<p class="muted">' + (remoteStatus.enabled ? "Supabase e' configurato: i salvataggi sono condivisi nel database." : "Supabase non e' configurato: i salvataggi restano locali al browser.") + "</p>",
      "</aside>",
      "</section>"
    ].join("");
  }

  function renderArchive() {
    var archive = state.archives[0];
    if (!archive) {
      app.innerHTML = [
        pageHead("Archivio", "Nessun mese chiuso", "Quando un mese finisce, il podio e i risultati dettagliati finiscono qui.")
      ].join("");
      return;
    }

    var activeArchiveId = (window.location.hash.split("/")[1] || archive.id);
    archive = state.archives.find(function (item) { return item.id === activeArchiveId; }) || archive;
    var firstWeek = archive.weeks[0];
    var archiveWeek = getWeek(currentWeekId, archive.weeks) || firstWeek;
    currentWeekId = archiveWeek.id;

    app.innerHTML = [
      pageHead("Archivio", archive.name + " · " + archive.range, "Risultati dettagliati del mese chiuso. La classifica principale resta sul mese corrente."),
      '<section class="grid">',
      '<div class="stack">',
      panel("Classifica finale", leaderboardTable(leaderboard(null, archive.weeks), true), "tight"),
      panel(
        "Dettaglio settimane",
        segmentedWeeks(archive.weeks) + leaderboardTable(leaderboard(archiveWeek.id, archive.weeks), false),
        "tight"
      ),
      panel("Score di giornata", weeklyScoresTable(archiveWeek, archive.weeks), "tight"),
      "</div>",
      '<aside class="stack">',
      panel("Podio", podiumList(leaderboard(null, archive.weeks))),
      panel("Mesi archiviati", archiveList(activeArchiveId)),
      "</aside>",
      "</section>"
    ].join("");
  }

  function hero(eyebrowText, title, body) {
    return [
      '<section class="hero-strip">',
      '<div class="hero-strip-inner">',
      "<div>",
      '<p class="eyebrow">' + escapeHtml(eyebrowText) + "</p>",
      "<h1>" + escapeHtml(title) + "</h1>",
      '<div class="rule-alert" role="note"><strong>Regolamento</strong><span>' + body + "</span></div>",
      "</div>",
      "</div>",
      "</section>"
    ].join("");
  }

  function pageHead(eyebrowText, title, body) {
    return [
      '<section class="page-head">',
      "<div>",
      '<p class="eyebrow">' + escapeHtml(eyebrowText) + "</p>",
      "<h1>" + escapeHtml(title) + "</h1>",
      '<p class="lead">' + escapeHtml(body) + "</p>",
      "</div>",
      session.player ? '<span class="badge">' + escapeHtml(session.player) + "</span>" : "",
      "</section>"
    ].join("");
  }

  function stat(value, label) {
    return '<div class="stat"><strong>' + escapeHtml(String(value)) + '</strong><span>' + escapeHtml(label) + "</span></div>";
  }

  function panel(title, body, extraClass) {
    return '<section class="panel ' + (extraClass || "") + '"><div class="panel-head"><h2>' + escapeHtml(title) + "</h2></div>" + body + "</section>";
  }

  function quickLogin() {
    return '<p class="muted">Chiunque del gruppo puo\' aggiornare gli score scegliendo un giocatore.</p><div class="actions"><a class="button" href="#inserisci">Inserisci score</a></div>';
  }

  function dataStatus() {
    if (!remoteStatus.enabled) {
      return '<p class="muted">Modalita locale: configura Supabase in <code>supabase-config.js</code> per condividere i dati tra tutti.</p>';
    }
    if (remoteStatus.loading) {
      return '<p class="muted">Sincronizzazione Supabase in corso...</p>';
    }
    if (remoteStatus.error) {
      return '<p class="toast error">' + escapeHtml(remoteStatus.error) + "</p>";
    }
    return '<p class="muted">Database Supabase attivo. I dati sono condivisi tra tutti i giocatori.</p>';
  }

  function archiveRecap() {
    if (!state.archives.length) {
      return '<p class="muted">Nessun mese chiuso.</p>';
    }
    var archive = state.archives[0];
    return [
      '<p class="muted"><strong>' + escapeHtml(archive.name) + '</strong> · ' + escapeHtml(archive.range) + "</p>",
      podiumList(leaderboard(null, archive.weeks)),
      '<div class="actions"><a class="button secondary" href="#archivio">Apri dettagli</a></div>'
    ].join("");
  }

  function podiumList(rows) {
    return [
      '<ol class="podium-list">',
      rows.slice(0, 3).map(function (row, index) {
        return '<li><span class="podium-rank">' + (index + 1) + '</span><span><strong>' + escapeHtml(row.player) + '</strong><small>' + row.points + ' punti · ' + formatNumber(row.score) + ' score</small></span></li>';
      }).join(""),
      "</ol>"
    ].join("");
  }

  function archiveList(activeArchiveId) {
    return '<div class="admin-list">' + state.archives.map(function (archive) {
      var label = archive.id === activeArchiveId ? "Aperto" : "Apri";
      return '<div class="admin-row"><span><strong>' + escapeHtml(archive.name) + '</strong><br><span class="muted">' + escapeHtml(archive.range) + '</span></span><a class="button secondary" href="#archivio/' + escapeAttr(archive.id) + '">' + label + '</a></div>';
    }).join("") + "</div>";
  }

  function playerPicker(selectedPlayer) {
    return [
      '<section class="panel">',
      '<form data-form="select-player">',
      '<div class="field">',
      '<label for="player-name">Giocatore da modificare</label>',
      '<select id="player-name" name="player" required>',
      state.players.map(function (player) {
        var selected = player === selectedPlayer ? " selected" : "";
        return '<option value="' + escapeAttr(player) + '"' + selected + ">" + escapeHtml(player) + "</option>";
      }).join(""),
      "</select>",
      "</div>",
      "</form>",
      "</section>"
    ].join("");
  }

  function scoringExplanation() {
    return [
      '<p class="muted">Per ogni giornata si ordinano solo gli score maggiori di zero. Il primo prende 25 punti, poi 20, 16, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2 e 1 punto per le posizioni successive.</p>',
      '<p class="muted">La classifica generale somma i punti di tutte le giornate. A parita\' di punti passa avanti chi ha piu\' score totale.</p>'
    ].join("");
  }

  function scoreForm(player) {
    var week = getWeek(currentWeekId) || state.weeks[0];
    var playerScores = week.scores[player] || {};
    return [
      '<form class="panel" data-form="scores">',
      '<input type="hidden" name="weekId" value="' + escapeAttr(week.id) + '">',
      '<input type="hidden" name="player" value="' + escapeAttr(player) + '">',
      '<div class="panel-head">',
      '<div><h2>' + escapeHtml(week.name) + '</h2><p class="muted">' + escapeHtml(week.range) + "</p></div>",
      '<span class="badge">' + escapeHtml(String(totalForPlayer(player, week.id).points)) + " punti</span>",
      "</div>",
      '<div class="day-grid">',
      week.days.map(function (day) {
        var id = "score-" + slug(week.id + "-" + day);
        return [
          '<div class="day-card">',
          '<label for="' + id + '">' + escapeHtml(day) + "</label>",
          '<input id="' + id + '" name="' + escapeAttr(day) + '" type="number" inputmode="numeric" min="0" max="25000" step="1" value="' + escapeAttr(playerScores[day] || 0) + '">',
          '<span class="muted">' + escapeHtml(pointsForDay(player, week.id, day)) + " punti</span>",
          "</div>"
        ].join("");
      }).join(""),
      "</div>",
      '<div class="actions"><button class="button" type="submit">Salva score</button></div>',
      '<p class="toast" id="score-toast" aria-live="polite"></p>',
      "</form>"
    ].join("");
  }

  function leaderboardTable(rows, includeWeeks) {
    return [
      '<div class="table-wrap"><table>',
      '<thead><tr><th scope="col">Pos</th><th scope="col">Giocatore</th><th class="number" scope="col">Punti</th><th class="number" scope="col">Score</th>',
      includeWeeks ? '<th class="number" scope="col">Giornate</th>' : "",
      "</tr></thead><tbody>",
      rows.map(function (row, index) {
        return [
          "<tr>",
          '<td class="rank">' + (index + 1) + "</td>",
          '<td><span class="player-cell"><span class="avatar" aria-hidden="true">' + initials(row.player) + "</span>" + escapeHtml(row.player) + "</span></td>",
          '<td class="number"><strong>' + row.points + "</strong></td>",
          '<td class="number">' + formatNumber(row.score) + "</td>",
          includeWeeks ? '<td class="number">' + row.played + "</td>" : "",
          "</tr>"
        ].join("");
      }).join(""),
      "</tbody></table></div>"
    ].join("");
  }

  function weeklyScoresTable(week, weeks) {
    var sourceWeeks = weeks || state.weeks;
    return [
      '<div class="table-wrap"><table class="scores-table">',
      '<thead><tr><th scope="col">Giocatore</th>',
      week.days.map(function (day) {
        return '<th class="number" scope="col">' + escapeHtml(day) + "</th>";
      }).join(""),
      '<th class="number" scope="col">Tot. punti</th><th class="number" scope="col">Tot. score</th></tr></thead>',
      "<tbody>",
      leaderboard(week.id, sourceWeeks).map(function (row) {
        return [
          "<tr>",
          '<td><span class="player-cell"><span class="avatar" aria-hidden="true">' + initials(row.player) + "</span>" + escapeHtml(row.player) + "</span></td>",
          week.days.map(function (day) {
            var score = getScore(week, row.player, day);
            var points = pointsForDayInWeek(week, row.player, day);
            return [
              '<td class="number score-cell">',
              '<span class="score-entry">',
              '<strong>' + (score ? formatNumber(score) : "-") + "</strong>",
              '<span class="points-chip">' + points + " pt</span>",
              "</span>",
              "</td>"
            ].join("");
          }).join(""),
          '<td class="number"><strong>' + row.points + "</strong></td>",
          '<td class="number">' + formatNumber(row.score) + "</td>",
          "</tr>"
        ].join("");
      }).join(""),
      "</tbody></table></div>"
    ].join("");
  }

  function segmentedWeeks(weeks) {
    var sourceWeeks = weeks || state.weeks;
    return [
      '<div class="segmented" role="group" aria-label="Scegli settimana">',
      sourceWeeks.map(function (week) {
        var pressed = week.id === currentWeekId ? "true" : "false";
        return '<button type="button" data-week="' + escapeAttr(week.id) + '" aria-pressed="' + pressed + '">' + escapeHtml(week.name) + "</button>";
      }).join(""),
      "</div>"
    ].join("");
  }

  function daysOverview() {
    return state.weeks.map(function (week) {
      return [
        '<h3>' + escapeHtml(week.name) + '</h3>',
        '<div class="admin-list">',
        week.days.map(function (day) {
          var best = bestForDay(week.id, day);
          return '<div class="admin-row"><span>' + escapeHtml(day) + '</span><span class="badge">' + escapeHtml(best.player || "-") + " " + formatNumber(best.score || 0) + "</span></div>";
        }).join(""),
        "</div>"
      ].join("");
    }).join("");
  }

  function playersAdmin() {
    return [
      '<form data-form="add-player" class="form-grid">',
      '<div class="field"><label for="new-player">Nuovo giocatore</label><input id="new-player" name="player" required></div>',
      '<div class="field"><label class="sr-only" for="add-player-button">Aggiungi</label><button id="add-player-button" class="button" type="submit">Aggiungi</button></div>',
      "</form>",
      '<div class="admin-list" aria-label="Lista giocatori">',
      state.players.map(function (player) {
        return '<div class="admin-row"><strong>' + escapeHtml(player) + '</strong><button class="button danger" type="button" data-remove-player="' + escapeAttr(player) + '">Rimuovi</button></div>';
      }).join(""),
      "</div>"
    ].join("");
  }

  function weeksAdmin() {
    return [
      '<form data-form="add-week" class="form-grid">',
      '<div class="field"><label for="week-name">Nome</label><input id="week-name" name="name" placeholder="Settimana 5" required></div>',
      '<div class="field"><label for="week-range">Periodo</label><input id="week-range" name="range" placeholder="18/05-22/05"></div>',
      '<div class="field full"><label for="week-days">Giornate</label><input id="week-days" name="days" placeholder="18/05, 19/05, 20/05, 21/05, 22/05" required></div>',
      '<div class="field full"><button class="button" type="submit">Aggiungi settimana</button></div>',
      "</form>",
      '<div class="admin-list">',
      state.weeks.map(function (week) {
        return '<div class="admin-row"><span><strong>' + escapeHtml(week.name) + '</strong><br><span class="muted">' + escapeHtml(week.days.join(", ")) + '</span></span><button class="button danger" type="button" data-remove-week="' + escapeAttr(week.id) + '">Rimuovi</button></div>';
      }).join(""),
      "</div>"
    ].join("");
  }

  function scoringAdmin() {
    return [
      '<form data-form="scoring">',
      '<div class="field">',
      '<label for="scoring-values">Punti per posizione</label>',
      '<input id="scoring-values" name="scoring" value="' + escapeAttr(state.scoring.join(", ")) + '">',
      "</div>",
      '<div class="actions"><button class="button" type="submit">Salva punti</button></div>',
      "</form>"
    ].join("");
  }

  function adminDataTools() {
    return [
      '<div class="actions">',
      '<button class="button" type="button" data-action="download-json">Scarica JSON</button>',
      '<button class="button secondary" type="button" data-action="reset-default">Ripristina foglio</button>',
      "</div>",
      '<form data-form="import-file">',
      '<div class="field"><label for="import-json">Importa JSON</label><input class="file-input" id="import-json" name="file" type="file" accept="application/json"></div>',
      "</form>"
    ].join("");
  }

  async function handleSubmit(event) {
    var form = event.target.closest("form");
    if (!form) return;
    var type = form.dataset.form;
    if (!type) return;
    event.preventDefault();

    if (type === "select-player") {
      var player = form.elements.player.value;
      if (!state.players.includes(player)) return;
      session.player = player;
      saveSession();
      window.location.hash = "#inserisci";
      render();
    }

    if (type === "register-player") {
      var newPlayer = form.elements.player.value.trim();
      if (!newPlayer) return showToast("register-toast", "Inserisci un nome.", true);
      if (!(await addPlayer(newPlayer))) return showToast("register-toast", "Questo giocatore esiste gia'.", true);
      session.player = newPlayer;
      saveSession();
      window.location.hash = "#inserisci";
      render();
    }

    if (type === "scores") {
      var week = getWeek(form.elements.weekId.value);
      var scorePlayer = form.elements.player.value;
      if (!week || !scorePlayer || !state.players.includes(scorePlayer)) return;
      session.player = scorePlayer;
      saveSession();
      week.scores[scorePlayer] = week.scores[scorePlayer] || {};
      week.days.forEach(function (day) {
        week.scores[scorePlayer][day] = scoreValue(form.elements[day].value);
      });
      saveState();
      if (remoteStatus.enabled) {
        for (var i = 0; i < week.days.length; i += 1) {
          var day = week.days[i];
          await saveScoreRemote(week, scorePlayer, day, scoreValue(form.elements[day].value));
        }
        await loadRemoteState();
      }
      render();
      showToast("score-toast", "Score salvati.");
    }

    if (type === "add-player") {
      if (await addPlayer(form.elements.player.value.trim())) {
        form.reset();
        render();
      }
    }

    if (type === "add-week") {
      await addWeek(form.elements.name.value.trim(), form.elements.range.value.trim(), form.elements.days.value);
      form.reset();
      render();
    }

    if (type === "scoring") {
      var values = parseNumberList(form.elements.scoring.value);
      if (values.length) {
        state.scoring = values;
        saveState();
        render();
      }
    }
  }

  async function handleClick(event) {
    var target = event.target.closest("button, a");
    if (!target) return;

    if (target.dataset.week) {
      currentWeekId = target.dataset.week;
      render();
    }

    if (target.dataset.removePlayer) {
      await removePlayer(target.dataset.removePlayer);
      render();
    }

    if (target.dataset.removeWeek) {
      await removeWeek(target.dataset.removeWeek);
      render();
    }

    if (target.dataset.action === "download-json") {
      downloadJson();
    }

    if (target.dataset.action === "copy-json") {
      copyJson();
    }

    if (target.dataset.action === "load-json-text") {
      loadJsonFromTextarea();
    }

    if (target.dataset.action === "reset-default") {
      state = normalizeState(clone(DEFAULT_STATE));
      saveState();
      render();
    }
  }

  function handleInput(event) {
    if (event.target.matches('input[type="number"]')) {
      event.target.value = event.target.value.replace(/[^\d]/g, "");
    }
  }

  function handleChange(event) {
    var playerSelect = event.target.closest('form[data-form="select-player"] select[name="player"]');
    if (playerSelect) {
      session.player = playerSelect.value;
      saveSession();
      render();
      return;
    }

    var fileInput = event.target.closest('input[type="file"]');
    if (!fileInput || !fileInput.files.length) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        state = normalizeState(JSON.parse(reader.result));
        saveState();
        render();
      } catch (error) {
        alert("JSON non valido.");
      }
    };
    reader.readAsText(fileInput.files[0]);
  }

  async function addPlayer(player) {
    if (!player || state.players.includes(player)) return false;
    if (supabaseClient) {
      var result = await supabaseClient.from("profiles").insert({display_name: player});
      if (result.error) {
        remoteStatus.error = result.error.message;
        return false;
      }
      await loadRemoteState();
      return true;
    }
    state.players.push(player);
    state.weeks.forEach(function (week) {
      week.scores[player] = {};
      week.days.forEach(function (day) {
        week.scores[player][day] = 0;
      });
    });
    saveState();
    return true;
  }

  async function removePlayer(player) {
    if (supabaseClient) {
      var profileId = profileByName[player];
      if (!profileId) return;
      var result = await supabaseClient.from("profiles").delete().eq("id", profileId);
      if (result.error) {
        remoteStatus.error = result.error.message;
        return;
      }
      await loadRemoteState();
      return;
    }
    state.players = state.players.filter(function (name) { return name !== player; });
    state.weeks.forEach(function (week) {
      delete week.scores[player];
    });
    if (session.player === player) session.player = "";
    saveSession();
    saveState();
  }

  async function removeWeek(weekId) {
    if (supabaseClient) {
      var result = await supabaseClient.from("weeks").delete().eq("id", weekId);
      if (result.error) {
        remoteStatus.error = result.error.message;
        return;
      }
      await loadRemoteState();
      if (!getWeek(currentWeekId) && state.weeks[0]) currentWeekId = state.weeks[0].id;
      return;
    }
    state.weeks = state.weeks.filter(function (week) { return week.id !== weekId; });
    if (!getWeek(currentWeekId) && state.weeks[0]) currentWeekId = state.weeks[0].id;
    saveState();
  }

  async function saveScoreRemote(week, player, day, score) {
    if (!supabaseClient) return;
    var playerId = profileByName[player];
    if (!playerId) {
      remoteStatus.error = "Giocatore non trovato nel database.";
      return;
    }
    var dayId = dayIdByWeekDay[week.id + "::" + day];
    if (!dayId) {
      remoteStatus.error = "Giornata non trovata nel database.";
      return;
    }
    var result = await supabaseClient
      .from("scores")
      .upsert({
        day_id: dayId,
        player_id: playerId,
        score: score
      }, {onConflict: "day_id,player_id"});
    if (result.error) {
      remoteStatus.error = result.error.message;
    }
  }

  async function addWeek(name, range, daysText) {
    var days = daysText.split(",").map(function (day) { return day.trim(); }).filter(Boolean);
    if (!name || !days.length) return;
    if (supabaseClient) {
      var activeMonthId = state.currentMonth.id;
      var weekResult = await supabaseClient
        .from("weeks")
        .insert({
          month_id: activeMonthId,
          name: name,
          range_text: range,
          sort_order: state.weeks.length + 1
        })
        .select("id")
        .single();
      if (weekResult.error) {
        remoteStatus.error = weekResult.error.message;
        return;
      }
      var dayRows = days.map(function (day, index) {
        return {week_id: weekResult.data.id, label: day, sort_order: index + 1};
      });
      var dayResult = await supabaseClient.from("days").insert(dayRows);
      if (dayResult.error) {
        remoteStatus.error = dayResult.error.message;
        return;
      }
      await loadRemoteState();
      currentWeekId = weekResult.data.id;
      return;
    }
    var id = slug(name) + "-" + Date.now().toString(36);
    var scores = {};
    state.players.forEach(function (player) {
      scores[player] = {};
      days.forEach(function (day) {
        scores[player][day] = 0;
      });
    });
    state.weeks.push({id: id, name: name, range: range, days: days, scores: scores});
    currentWeekId = id;
    saveState();
  }

  function leaderboard(weekId, weeks) {
    var sourceWeeks = weeks || state.weeks;
    return state.players.map(function (player) {
      return weekId ? totalForPlayer(player, weekId, sourceWeeks) : totalForPlayer(player, null, sourceWeeks);
    }).sort(function (a, b) {
      return b.points - a.points || b.score - a.score || a.player.localeCompare(b.player);
    });
  }

  function totalForPlayer(player, weekId, weeks) {
    var sourceWeeks = weeks || state.weeks;
    var selectedWeeks = weekId ? sourceWeeks.filter(function (week) { return week.id === weekId; }) : sourceWeeks;
    return selectedWeeks.reduce(function (acc, week) {
      week.days.forEach(function (day) {
        var score = getScore(week, player, day);
        acc.score += score;
        acc.points += pointsForDayInWeek(week, player, day);
        if (score > 0) acc.played += 1;
      });
      return acc;
    }, {player: player, points: 0, score: 0, played: 0});
  }

  function pointsForDay(player, weekId, day) {
    var week = getWeek(weekId);
    if (!week) return 0;
    return pointsForDayInWeek(week, player, day);
  }

  function pointsForDayInWeek(week, player, day) {
    var score = getScore(week, player, day);
    if (score <= 0) return 0;
    var betterScores = state.players.filter(function (other) {
      return getScore(week, other, day) > score;
    }).length;
    var rank = betterScores + 1;
    return state.scoring[rank - 1] || state.scoring[state.scoring.length - 1] || 0;
  }

  function bestForDay(weekId, day) {
    var week = getWeek(weekId);
    if (!week) return {player: "", score: 0};
    return state.players.reduce(function (best, player) {
      var score = getScore(week, player, day);
      return score > best.score ? {player: player, score: score} : best;
    }, {player: "", score: 0});
  }

  function getWeek(id, weeks) {
    return (weeks || state.weeks).find(function (week) { return week.id === id; });
  }

  function getScore(week, player, day) {
    return scoreValue(week.scores[player] && week.scores[player][day]);
  }

  function countSubmittedScores() {
    return state.weeks.reduce(function (total, week) {
      return total + state.players.reduce(function (sum, player) {
        return sum + week.days.filter(function (day) { return getScore(week, player, day) > 0; }).length;
      }, 0);
    }, 0);
  }

  function scoreValue(value) {
    return Math.max(0, parseInt(value, 10) || 0);
  }

  function parseNumberList(value) {
    return value.split(",").map(function (item) {
      return parseInt(item.trim(), 10);
    }).filter(function (item) {
      return Number.isFinite(item) && item >= 0;
    });
  }

  function formatNumber(value) {
    return Number(value || 0).toLocaleString("it-IT");
  }

  function initials(name) {
    return escapeHtml(name.split(/\s+/).map(function (part) { return part[0] || ""; }).join("").slice(0, 2).toUpperCase());
  }

  function slug(value) {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "item";
  }

  function showToast(id, message, isError) {
    setTimeout(function () {
      var el = document.getElementById(id);
      if (!el) return;
      el.textContent = message;
      el.classList.toggle("error", Boolean(isError));
    }, 0);
  }

  function downloadJson() {
    var blob = new Blob([JSON.stringify(state, null, 2)], {type: "application/json"});
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "geolabguessr-data.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function copyJson() {
    var text = JSON.stringify(state, null, 2);
    navigator.clipboard.writeText(text).then(function () {
      showToast("data-toast", "JSON copiato.");
    }).catch(function () {
      showToast("data-toast", "Copia non disponibile in questo browser.", true);
    });
  }

  function loadJsonFromTextarea() {
    var textarea = document.getElementById("json-state");
    if (!textarea) return;
    try {
      state = normalizeState(JSON.parse(textarea.value));
      saveState();
      render();
      showToast("data-toast", "JSON caricato.");
    } catch (error) {
      showToast("data-toast", "JSON non valido.", true);
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"}[char];
    });
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
  }
})();
