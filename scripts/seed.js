// scripts/seed.js
// Remplit la base avec des données FICTIVES pour développer et tester
// l'interface, en attendant l'intégration des vraies sources officielles
// (cf. cahier des charges, section 7 - Stratégie de collecte des données).
//
// Lancer avec : npm run seed

const db = require('../lib/db');

const exemples = [
  {
    examen: 'CEP',
    session: '2026',
    numero_table: '001234',
    nom: 'OUEDRAOGO',
    prenom: 'Awa',
    decision: 'non_admis',
    moyenne: 7.2,
    mention: null,
    serie: null,
    etablissement: 'École Primaire Publique de Zogona',
    province: 'Kadiogo',
    region: 'Kadiogo',
  },
  {
    examen: 'CEP',
    session: '2026',
    numero_table: '001235',
    nom: 'KABORE',
    prenom: 'Issa',
    decision: 'non_admis',
    moyenne: 4.1,
    mention: null,
    serie: null,
    etablissement: 'École Primaire Publique de Zogona',
    province: 'Kadiogo',
    region: 'Kadiogo',
  },
  {
    examen: 'BEPC',
    session: '2026',
    numero_table: '084521',
    nom: 'SAWADOGO',
    prenom: 'Fatimata',
    decision: 'admis',
    moyenne: 12.4,
    mention: 'Assez Bien',
    serie: null,
    etablissement: 'Collège Municipal de Bobo-Dioulasso',
    province: 'Houet',
    region: 'Guiriko',
  },
  {
    examen: 'BEPC',
    session: '2026',
    numero_table: '084522',
    nom: 'TRAORE',
    prenom: 'Boureima',
    decision: 'second_tour',
    moyenne: 9.4,
    mention: null,
    serie: null,
    etablissement: 'Collège Municipal de Bobo-Dioulasso',
    province: 'Houet',
    region: 'Guiriko',
  },
  {
    examen: 'BAC_GENERAL',
    session: '2026',
    numero_table: '210987',
    nom: 'ZONGO',
    prenom: 'Aminata',
    decision: 'admis',
    moyenne: 14.6,
    mention: 'Bien',
    serie: 'D',
    etablissement: 'Lycée Philippe Zinda Kaboré',
    province: 'Kadiogo',
    region: 'Kadiogo',
  },
  {
    examen: 'BAC_GENERAL',
    session: '2026',
    numero_table: '210988',
    nom: 'COMPAORE',
    prenom: 'Rasmane',
    decision: 'non_admis',
    moyenne: 6.9,
    mention: null,
    serie: 'C',
    etablissement: 'Lycée Philippe Zinda Kaboré',
    province: 'Kadiogo',
    region: 'Kadiogo',
  },
];

const insert = db.prepare(`
  INSERT INTO resultats
    (examen, session, numero_table, nom, prenom, decision, moyenne, mention, serie, etablissement, province, region)
  VALUES
    (@examen, @session, @numero_table, @nom, @prenom, @decision, @moyenne, @mention, @serie, @etablissement, @province, @region)
`);

const insertAll = db.transaction((lignes) => {
  for (const ligne of lignes) insert.run(ligne);
});

// On vide la table avant de réinsérer, pour pouvoir relancer le script sans doublons.
db.exec('DELETE FROM resultats');
insertAll(exemples);

console.log(`✅ ${exemples.length} résultats d'exemple insérés dans data/resultats.db`);
