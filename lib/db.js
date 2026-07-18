// lib/db.js
// Connexion unique à la base SQLite locale (fichier data/resultats.db).
// En dev, Next.js recharge les modules à chaud : on garde l'instance
// sur `global` pour ne pas rouvrir la base à chaque requête.

const path = require('path');
const Database = require('better-sqlite3');

// Le chemin de la base est configurable via DATABASE_PATH (utile en
// production, ex: Railway, pour pointer vers un disque persistant monté
// EN DEHORS du dossier data/ — ce dossier contient aussi contenu.js,
// du code source qui doit rester livré avec l'application). En local,
// par défaut : data/resultats.db à la racine du projet.
const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'resultats.db');

function colonneExiste(db, table, colonne) {
  return db.prepare(`PRAGMA table_info(${table})`).all().some((c) => c.name === colonne);
}

function createConnection() {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  // --- Résultats individuels ---
  db.exec(`
    CREATE TABLE IF NOT EXISTS resultats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      examen TEXT NOT NULL,              -- 'CEP' | 'BEPC' | 'BAC_GENERAL'
      session TEXT NOT NULL,              -- année, ex: '2026'
      numero_table TEXT NOT NULL,
      nom TEXT NOT NULL,
      prenom TEXT NOT NULL,
      moyenne REAL,
      mention TEXT,
      etablissement TEXT,
      province TEXT,
      region TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_recherche
      ON resultats (examen, session, numero_table);
  `);

  // Migration : ajoute "serie" si absente (BAC : A, D, C, F1, F2, F3, F4, H, E...)
  if (!colonneExiste(db, 'resultats', 'serie')) {
    db.exec('ALTER TABLE resultats ADD COLUMN serie TEXT');
  }

  // Migration : remplace statut + second_tour par un champ unique "decision"
  // ('admis' | 'second_tour' | 'non_admis'). "second_tour" représente un
  // résultat pas encore final (moyenne 8,00-9,99, en attente des épreuves
  // de rattrapage) — cf. vrai fonctionnement du BEPC (résultats 1er tour
  // puis résultats du second tour publiés séparément).
  if (!colonneExiste(db, 'resultats', 'decision')) {
    db.exec("ALTER TABLE resultats ADD COLUMN decision TEXT");

    if (colonneExiste(db, 'resultats', 'statut')) {
      db.exec(`
        UPDATE resultats SET decision = CASE
          WHEN second_tour = 1 THEN 'second_tour'
          WHEN statut = 'admis' THEN 'admis'
          ELSE 'non_admis'
        END
      `);
    }
  }
  if (colonneExiste(db, 'resultats', 'statut')) {
    db.exec('ALTER TABLE resultats DROP COLUMN statut');
  }
  if (colonneExiste(db, 'resultats', 'second_tour')) {
    db.exec('ALTER TABLE resultats DROP COLUMN second_tour');
  }

  // --- Statistiques agrégées (national ou par région), gérées par l'admin ---
  db.exec(`
    CREATE TABLE IF NOT EXISTS statistiques (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      examen TEXT NOT NULL,
      session TEXT NOT NULL,
      portee TEXT NOT NULL,      -- 'national' | 'region'
      region TEXT,               -- rempli seulement si portee = 'region'
      zone TEXT,                 -- précision optionnelle (ex: ancien nom, province)
      candidats INTEGER,
      admis INTEGER,
      taux REAL,
      note TEXT
    );
  `);

  // --- Établissements (pour suggestions à l'import + future recherche) ---
  db.exec(`
    CREATE TABLE IF NOT EXISTS etablissements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      type TEXT,          -- ex: 'Primaire', 'Collège', 'Lycée'
      province TEXT,
      region TEXT
    );
  `);

  // --- Annuaire des structures ---
  db.exec(`
    CREATE TABLE IF NOT EXISTS annuaire (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      structure TEXT NOT NULL,
      role TEXT,
      contact TEXT
    );
  `);

  // --- Calendrier des examens ---
  db.exec(`
    CREATE TABLE IF NOT EXISTS calendrier (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      examen TEXT NOT NULL,
      session TEXT NOT NULL,
      epreuves TEXT,
      resultats TEXT
    );
  `);

  preremplirSiVide(db);

  return db;
}

// Au tout premier lancement (tables vides), on reprend le contenu déjà
// vérifié qu'on avait en dur dans data/contenu.js, pour ne rien perdre.
// Ensuite tout se gère depuis l'admin.
function preremplirSiVide(db) {
  const { STATS_NATIONALES, STATS_REGIONS_PAR_SESSION, STATS_PROVINCES_DETAIL, ANNUAIRE, CALENDRIER } = require('../data/contenu');

  try {
    const nbStats = db.prepare('SELECT COUNT(*) AS n FROM statistiques').get().n;
    if (nbStats === 0) {
      const insererStat = db.prepare(`
        INSERT INTO statistiques (examen, session, portee, region, zone, candidats, admis, taux, note)
        VALUES (@examen, @session, @portee, @region, @zone, @candidats, @admis, @taux, @note)
      `);
      const tx = db.transaction(() => {
        for (const s of STATS_NATIONALES) {
          insererStat.run({
            examen: s.examen, session: s.session, portee: 'national', region: null,
            zone: null, candidats: s.candidats, admis: s.admis, taux: s.taux, note: s.note || null,
          });
        }
        for (const [session, regions] of Object.entries(STATS_REGIONS_PAR_SESSION)) {
          for (const r of regions) {
            for (const examenCode of ['CEP', 'BEPC', 'BAC']) {
              const taux = r[examenCode];
              if (taux == null) continue;
              const examenLabel = examenCode === 'BAC' ? 'BAC (séries générales)' : examenCode;
              insererStat.run({
                examen: examenLabel, session, portee: 'region', region: r.region,
                zone: r.zone, candidats: null, admis: null, taux, note: null,
              });
            }
          }
        }
        for (const p of STATS_PROVINCES_DETAIL) {
          insererStat.run({
            examen: p.examen, session: p.session, portee: 'region', region: p.region,
            zone: `Province du ${p.province}`, candidats: null, admis: null, taux: p.taux, note: null,
          });
        }
      });
      tx();
    }
  } catch (err) {
    console.error('Pré-remplissage "statistiques" échoué (non bloquant) :', err.message);
  }

  try {
    const nbAnnuaire = db.prepare('SELECT COUNT(*) AS n FROM annuaire').get().n;
    if (nbAnnuaire === 0) {
      const insererAnnuaire = db.prepare('INSERT INTO annuaire (structure, role, contact) VALUES (@structure, @role, @contact)');
      const tx = db.transaction(() => { for (const a of ANNUAIRE) insererAnnuaire.run(a); });
      tx();
    }
  } catch (err) {
    console.error('Pré-remplissage "annuaire" échoué (non bloquant) :', err.message);
  }

  try {
    const nbCalendrier = db.prepare('SELECT COUNT(*) AS n FROM calendrier').get().n;
    if (nbCalendrier === 0) {
      const insererCalendrier = db.prepare('INSERT INTO calendrier (examen, session, epreuves, resultats) VALUES (@examen, @session, @epreuves, @resultats)');
      const tx = db.transaction(() => { for (const c of CALENDRIER) insererCalendrier.run(c); });
      tx();
    }
  } catch (err) {
    console.error('Pré-remplissage "calendrier" échoué (non bloquant) :', err.message);
  }
}

let db;
if (process.env.NODE_ENV === 'production') {
  db = createConnection();
} else {
  if (!global._db) {
    global._db = createConnection();
  }
  db = global._db;
}

module.exports = db;
