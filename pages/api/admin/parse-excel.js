// pages/api/admin/parse-excel.js
// Lit un fichier .xlsx / .xls / .csv envoyé par l'admin, tente de faire
// correspondre les en-têtes de colonnes à nos champs internes, et
// renvoie les lignes structurées (SANS les insérer en base : la
// vérification manuelle se fait ensuite côté interface, cf. section 7
// du cahier des charges).

import { formidable } from 'formidable';
import fs from 'fs';
import * as XLSX from 'xlsx';
import { exigerAdmin } from '../../../lib/requireAdmin';

export const config = {
  api: { bodyParser: false },
};

const CORRESPONDANCES = {
  numero_table: ['numero_table', 'numero de table', 'n° table', 'numtable', 'num_table', 'table'],
  nom: ['nom'],
  prenom: ['prenom', 'prénom', 'prenoms', 'prénoms', 'prenom(s)', 'prénom(s)'],
  decision: ['decision', 'décision', 'decision du jury', 'décision du jury', 'statut', 'resultat', 'résultat'],
  moyenne: ['moyenne', 'moyenne/20', 'moy'],
  mention: ['mention'],
  serie: ['serie', 'série', 'filiere', 'filière'],
  etablissement: ['etablissement', 'établissement', 'ecole', 'école'],
  province: ['province'],
  region: ['region', 'région'],
};

function normaliserEntete(entete) {
  return String(entete || '').trim().toLowerCase();
}

function trouverChamp(entete) {
  const e = normaliserEntete(entete);
  for (const [champ, variantes] of Object.entries(CORRESPONDANCES)) {
    if (variantes.includes(e)) return champ;
  }
  return null;
}

// Décision du jury : exactement 3 valeurs possibles.
function normaliserDecision(valeur) {
  const v = String(valeur || '').trim().toLowerCase();
  if (['admis', 'admise', 'a', 'oui', 'reussi', 'réussi'].includes(v)) return 'admis';
  if (['second_tour', 'second tour', '2nd tour', 'rattrapage'].includes(v)) return 'second_tour';
  if (['non_admis', 'non admis', 'ajourne', 'ajourné', 'na', 'non', 'echoue', 'échoué'].includes(v)) return 'non_admis';
  return '';
}

function validerLigne(ligne) {
  const erreurs = [];
  if (!ligne.numero_table) erreurs.push('numéro de table manquant');
  if (!ligne.nom) erreurs.push('nom manquant');
  if (!ligne.prenom) erreurs.push('prénom manquant');
  if (!ligne.decision) erreurs.push('décision invalide (attendu : admis / second_tour / non_admis)');
  if (ligne.moyenne !== '' && ligne.moyenne != null && Number.isNaN(Number(ligne.moyenne))) {
    erreurs.push('moyenne non numérique');
  }
  return erreurs;
}

export default async function handler(req, res) {
  if (!exigerAdmin(req, res)) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ erreur: 'Méthode non autorisée' });
  }

  const form = formidable({ maxFileSize: 15 * 1024 * 1024 });

  let files;
  try {
    const resultat = await form.parse(req);
    files = resultat[1];
  } catch (err) {
    return res.status(400).json({ erreur: 'Impossible de lire le fichier envoyé.' });
  }

  const fichier = files.fichier?.[0];
  if (!fichier) {
    return res.status(400).json({ erreur: 'Aucun fichier reçu (champ "fichier" attendu).' });
  }

  let classeur;
  try {
    const tampon = fs.readFileSync(fichier.filepath);
    classeur = XLSX.read(tampon, { type: 'buffer' });
  } catch (err) {
    return res.status(400).json({
      erreur: "Fichier illisible. Vérifie qu'il s'agit bien d'un .xlsx, .xls ou .csv valide.",
    });
  }

  const feuille = classeur.Sheets[classeur.SheetNames[0]];
  const lignesBrutes = XLSX.utils.sheet_to_json(feuille, { defval: '' });

  if (lignesBrutes.length === 0) {
    return res.status(400).json({ erreur: 'Le fichier ne contient aucune ligne de données.' });
  }

  const entetesOriginales = Object.keys(lignesBrutes[0]);
  const correspondance = {};
  for (const entete of entetesOriginales) {
    const champ = trouverChamp(entete);
    if (champ) correspondance[entete] = champ;
  }

  const lignes = lignesBrutes.map((ligneBrute, index) => {
    const ligne = {
      numero_table: '', nom: '', prenom: '', decision: '', moyenne: '',
      mention: '', serie: '', etablissement: '', province: '', region: '',
    };

    for (const [entete, valeur] of Object.entries(ligneBrute)) {
      const champ = correspondance[entete];
      if (!champ) continue;

      if (champ === 'decision') {
        ligne.decision = normaliserDecision(valeur);
      } else {
        ligne[champ] = String(valeur).trim();
      }
    }

    return { id: index, ...ligne, erreurs: validerLigne(ligne) };
  });

  return res.status(200).json({ lignes });
}
