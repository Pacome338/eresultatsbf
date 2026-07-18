// data/contenu.js
// Contenu éditorial statique du MVP (Module 2 et Module 3).
// À terme, ce contenu pourra être déplacé en base de données ou dans un
// petit CMS pour être mis à jour sans redéploiement.

export const EXAMENS = [
  { code: 'CEP', label: 'CEP' },
  { code: 'BEPC', label: 'BEPC' },
  { code: 'BAC_GENERAL', label: 'BAC (séries générales)' },
];

// Séries du BAC général — à sélectionner en complément de l'examen/session
// pour affiner la recherche et l'affichage (un même numéro de table peut
// exister dans plusieurs séries selon les sessions).
export const SERIES_BAC = ['A', 'C', 'D', 'E', 'F1', 'F2', 'F3', 'F4', 'H'];

// Les 17 régions du Burkina Faso (nouveaux noms endogènes depuis le
// décret du 2 juillet 2025, remplaçant les 13 anciennes régions).
// Format : nom actuel (ancien nom — chef-lieu).
export const REGIONS = [
  'Bankui', 'Djôrô', 'Goulmou', 'Guiriko', 'Kadiogo', 'Kuilsé', 'Liptako',
  'Nando', 'Nakambé', 'Nazinon', 'Oubri', 'Sirba', 'Soum', 'Tannounyan',
  'Tapoa', 'Sourou', 'Yaadga',
];

export const FICHES_PRATIQUES = [
  {
    examen: 'CEP',
    structure: 'Direction Provinciale de l\'Éducation Préscolaire, Primaire et Non Formelle (DPEPPNF) — anciennement DPEBA',
    lieu: 'DPEPPNF de votre province de résidence ou de l\'établissement d\'origine — une DPEPPNF par province, coordonnées à demander auprès de votre établissement ou de la mairie (pas d\'annuaire centralisé en ligne à ce jour)',
    documents: [
      'Pièce d\'identité du candidat (ou d\'un parent/tuteur si mineur)',
      'Numéro de table de l\'examen',
      'Justificatif de scolarité si disponible',
    ],
    cout: 'Gratuit (confirmé par le portail officiel service-public.gov.bf, mis à jour juillet 2026)',
    delai: 'Variable (non précisé par la source officielle)',
    horaires: 'Lundi–vendredi, horaires administratifs classiques (à confirmer localement)',
  },
  {
    examen: 'BEPC',
    structure: 'OCECOS (Office Central des Examens et Concours du Secondaire)',
    lieu: 'Siège OCECOS — quartier Samandin, Ouagadougou (09 BP 644 Ouagadougou 09)',
    telephone: '25 38 65 14 / 25 38 65 15',
    documents: [
      'Pièce d\'identité du candidat',
      'Numéro de table et session d\'examen',
      'Formulaire de demande (voir checklist)',
    ],
    cout: 'Variable selon la structure, se renseigner sur place',
    delai: 'Variable, prévoir plusieurs jours à quelques semaines en période de forte affluence',
    horaires: 'Lundi–vendredi, horaires administratifs classiques (à confirmer au 25 38 65 14 avant de vous déplacer)',
  },
  {
    examen: 'BAC_GENERAL',
    structure: 'OCECOS (Office Central des Examens et Concours du Secondaire)',
    lieu: 'Siège OCECOS — quartier Samandin, Ouagadougou (09 BP 644 Ouagadougou 09)',
    telephone: '25 38 65 14 / 25 38 65 15',
    documents: [
      'Pièce d\'identité du candidat',
      'Numéro de table et session d\'examen',
      'Formulaire de demande (voir checklist)',
    ],
    cout: 'Variable selon la structure, se renseigner sur place',
    delai: 'Variable, prévoir plusieurs jours à quelques semaines en période de forte affluence',
    horaires: 'Lundi–vendredi, horaires administratifs classiques (à confirmer au 25 38 65 14 avant de vous déplacer)',
  },
];

export const FAQ = [
  {
    question: 'J\'ai perdu mon diplôme, que faire ?',
    reponse:
      'Il faut s\'adresser directement à la structure compétente pour votre examen (DPEBA pour le CEP, OCECOS pour le BEPC/BAC) afin de demander un duplicata ou une attestation de réussite. Ce site vous oriente vers la bonne structure mais ne délivre aucun document.',
  },
  {
    question: 'Il y a une erreur sur mon nom ou ma date de naissance, comment la corriger ?',
    reponse:
      'Une correction d\'identité se fait uniquement auprès de la structure émettrice, sur présentation de pièces justificatives (extrait de naissance, pièce d\'identité). Ce site ne peut pas modifier les données affichées ; il reflète les informations publiées par les autorités.',
  },
  {
    question: 'Puis-je retirer un document pour quelqu\'un d\'autre ?',
    reponse:
      'Le retrait pour un tiers est en général possible avec une procuration et la pièce d\'identité du mandant et du mandataire, mais les règles précises dépendent de la structure. Renseignez-vous directement auprès d\'elle avant de vous déplacer.',
  },
  {
    question: 'Les résultats affichés sur ce site sont-ils officiels ?',
    reponse:
      'Non. Ce site centralise et présente des informations à titre indicatif, à partir de sources publiques (communiqués officiels, presse agréée). En cas de doute, la seule source faisant foi reste la structure organisatrice de l\'examen.',
  },
  {
    question: 'Qu\'est-ce que le "second tour" ?',
    reponse:
      'Les candidats ayant obtenu une moyenne générale comprise entre 8,00 et 9,99 au premier tour sont convoqués à des épreuves de rattrapage (second tour), à l\'issue desquelles ils peuvent être déclarés admis ou non admis. En dessous de 8,00, ou à partir de 10,00, il n\'y a pas de second tour : le résultat du premier tour est définitif.',
  },
];

// Dates réelles de la session 2026 (déjà déroulée au moment de la
// rédaction — conservée à titre de référence pour la forme du calendrier).
// Les dates de la session suivante seront ajoutées dès leur annonce
// officielle par le MEBAPLN / MESFPT (généralement fin mai).
export const CALENDRIER = [
  {
    examen: 'CEP + concours d\'entrée en 6e',
    session: '2026',
    epreuves: '2 juin – 18 juillet 2026 (341 732 candidats inscrits)',
    resultats: 'Publication progressive par DPEBA, juin-juillet 2026',
  },
  {
    examen: 'BEPC',
    session: '2026',
    epreuves: '2–3 juin 2026 (218 049 candidats inscrits) — écrites : langue, expression, SVT, anglais/arabe le 2 ; maths, histoire-géo, physique-chimie le 3',
    resultats: '1er tour : 9 juin 2026 · Second tour (épreuves le 12 juin) : résultats le 15 juin 2026',
  },
  {
    examen: 'BAC (séries générales)',
    session: '2026',
    epreuves: 'Juin 2026 (105 984 candidats inscrits) — dates précises non trouvées dans les sources consultées',
    resultats: 'Juillet 2026 (à confirmer auprès de l\'OCECOS)',
  },
];

export const ANNUAIRE = [
  {
    structure: 'OCECOS — Office Central des Examens et Concours du Secondaire (renommé DGEC — Direction Générale des Examens et Concours)',
    role: 'BEPC, BAC, BAC pro, CAP, BEP',
    contact: 'Quartier Samandin, Ouagadougou (8FQC+W9W) · 09 BP 644 Ouagadougou 09 · Tél : 25 38 65 14 / 25 38 65 15 · Horaires (source Google Maps, à confirmer par téléphone) : lun 08h–19h, mar 07h–12h, mer 07h–09h, jeu 07h–12h, ven 07h–09h, fermé sam-dim · Carte : https://maps.app.goo.gl/ALW1RkPDP3mciCnY8',
  },
  {
    structure: 'MENAPLN — Ministère de l\'Éducation Nationale, de l\'Alphabétisation et de la Promotion des Langues Nationales (anciennement MEBAPLN)',
    role: 'CEP',
    contact: 'Immeuble de l\'éducation, Avenue de l\'Indépendance, Koulouba, Ouagadougou · 03 BP 7032 Ouagadougou 03 · Tél : 25 48 09 08 / 25 32 48 70-71-72 / 25 31 80 52 · Fax : 25 25 25 25 · Email : dcpmmena@gmail.com · education.gov.bf · Carte : https://maps.app.goo.gl/RXqwsyrfVQci2HUU7',
  },
  {
    structure: 'MESFPT — Ministère de l\'Enseignement Secondaire, de la Formation Professionnelle et Technique',
    role: 'Tutelle BEPC/BAC/BAC pro/CAP/BEP',
    contact: '891 Avenue de la Grande Mosquée, Ouagadougou · 01 BP 6249 Ouagadougou 01 · Tél : 53 70 54 80 · Email : contact@formationpro.gov.bf · Carte : https://maps.app.goo.gl/CtV1RhcUo8ei9RV29 · Horaires non trouvées de façon fiable (la page Facebook indique "toujours ouvert", ce qui reflète un réglage de page, pas les horaires réelles du siège — à confirmer par téléphone)',
  },
];

// Statistiques agrégées (taux de réussite), collectées depuis des sources
// officielles/presse agréée (ministère MEBAPLN, Agence d'Information du
// Burkina). Couverture PARTIELLE et non exhaustive — voir mention légale
// affichée sur la page. Ce ne sont PAS des données individuelles.
//
// Note sur les régions : le Burkina Faso est passé de 13 à 17 régions le
// 2 juillet 2025, avec de nouveaux noms endogènes (ex : Centre → Kadiogo,
// Hauts-Bassins → Guiriko, Nord → Yaadga). Les noms ci-dessous reprennent
// ceux utilisés par chaque source (certaines encore en transition).

// Trié par année, puis par examen (CEP, BEPC, BAC) au sein de chaque année.
// Les cases "null" signifient : donnée non trouvée dans les sources
// consultées (pas "zéro candidat") — affichées comme "—" sur la page.
export const STATS_NATIONALES = [
  { examen: 'CEP', session: '2024', candidats: 351627, admis: 288882, taux: 82.16, note: null },
  { examen: 'BEPC', session: '2024', candidats: null, admis: null, taux: null, note: null },
  { examen: 'BAC (séries générales)', session: '2024', candidats: null, admis: null, taux: null, note: null },

  { examen: 'CEP', session: '2025', candidats: 329979, admis: 294555, taux: 89.26, note: null },
  { examen: 'BEPC', session: '2025', candidats: null, admis: null, taux: null, note: null },
  { examen: 'BAC (séries générales)', session: '2025', candidats: null, admis: null, taux: 56.45, note: null },

  { examen: 'CEP', session: '2026', candidats: 333900, admis: 317982, taux: 95.23, note: null },
  { examen: 'BEPC', session: '2026', candidats: null, admis: null, taux: null, note: null },
  { examen: 'BAC (séries générales)', session: '2026', candidats: 105984, admis: null, taux: 63.93, note: '1er tour uniquement, taux estimé (+7,48 points vs 2025)' },
];

// Détail par région, organisé PAR SESSION : pour une année donnée, on
// affiche les 17 régions avec le taux de réussite de chaque examen
// (CEP / BEPC / BAC) quand la donnée a été trouvée dans les sources
// consultées. "null" = donnée non trouvée (affichée "—"), pas "0%".
// Seule la session 2025 a des données régionales pour l'instant.
export const STATS_REGIONS_PAR_SESSION = {
  '2025': [
    { region: 'Bankui', zone: 'ex-Boucle du Mouhoun', CEP: null, BEPC: null, BAC: null },
    { region: 'Djôrô', zone: 'ex-Sud-Ouest', CEP: null, BEPC: null, BAC: null },
    { region: 'Goulmou', zone: 'ex-Est', CEP: null, BEPC: null, BAC: null },
    { region: 'Guiriko', zone: 'ex-Hauts-Bassins', CEP: null, BEPC: null, BAC: 50.72 },
    { region: 'Kadiogo', zone: 'ex-Centre', CEP: null, BEPC: null, BAC: null },
    { region: 'Kuilsé', zone: 'ex-Centre-Nord', CEP: null, BEPC: null, BAC: null },
    { region: 'Liptako', zone: 'ex-Sahel', CEP: null, BEPC: null, BAC: 65.76 },
    { region: 'Nando', zone: 'ex-Centre-Ouest', CEP: null, BEPC: null, BAC: null },
    { region: 'Nakambé', zone: 'ex-Centre-Est', CEP: null, BEPC: null, BAC: null },
    { region: 'Nazinon', zone: 'ex-Centre-Sud', CEP: null, BEPC: null, BAC: null },
    { region: 'Oubri', zone: 'ex-Plateau-Central', CEP: null, BEPC: null, BAC: null },
    { region: 'Sirba', zone: 'ex-Est', CEP: null, BEPC: null, BAC: null },
    { region: 'Soum', zone: 'ex-Sahel', CEP: null, BEPC: null, BAC: null },
    { region: 'Tannounyan', zone: 'ex-Cascades', CEP: null, BEPC: null, BAC: null },
    { region: 'Tapoa', zone: 'ex-Est', CEP: null, BEPC: null, BAC: null },
    { region: 'Sourou', zone: 'ex-Boucle du Mouhoun', CEP: null, BEPC: null, BAC: null },
    { region: 'Yaadga', zone: 'ex-Nord', CEP: 88.58, BEPC: 50.07, BAC: null },
  ],
};

// Détail complémentaire au niveau province, quand disponible (en plus
// du niveau région ci-dessus).
export const STATS_PROVINCES_DETAIL = [
  { session: '2025', examen: 'CEP', region: 'Yaadga', province: 'Zondoma', taux: 93.49 },
  { session: '2025', examen: 'CEP', region: 'Yaadga', province: 'Loroum', taux: 92.32 },
  { session: '2025', examen: 'CEP', region: 'Yaadga', province: 'Passoré', taux: 87.95 },
  { session: '2025', examen: 'CEP', region: 'Yaadga', province: 'Yatenga', taux: 87.38 },
];

export const STATS_SOURCES = [
  { nom: 'Ministère de l\'Éducation nationale (MEBAPLN) — actualités officielles', url: 'https://www.education.gov.bf' },
  { nom: 'Agence d\'Information du Burkina (AIB) — dépêche du 17 juin 2025', url: 'https://www.aib.media' },
];
