// pages/api/admin/import.js
// Insère en base les lignes déjà relues et corrigées par l'admin dans
// l'aperçu (étape de vérification manuelle, cf. section 7 du cahier
// des charges). N'insère jamais de ligne incomplète.

const db = require('../../../lib/db');
import { exigerAdmin } from '../../../lib/requireAdmin';

export default function handler(req, res) {
  if (!exigerAdmin(req, res)) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ erreur: 'Méthode non autorisée' });
  }

  const { examen, session, lignes } = req.body || {};

  if (!examen || !session || !Array.isArray(lignes) || lignes.length === 0) {
    return res.status(400).json({ erreur: 'Données incomplètes (examen, session, lignes requis).' });
  }

  const insert = db.prepare(`
    INSERT INTO resultats
      (examen, session, numero_table, nom, prenom, decision, moyenne, mention, serie, etablissement, province, region)
    VALUES
      (@examen, @session, @numero_table, @nom, @prenom, @decision, @moyenne, @mention, @serie, @etablissement, @province, @region)
  `);

  const DECISIONS_VALIDES = ['admis', 'second_tour', 'non_admis'];

  let inseres = 0;
  const echecs = [];

  const transaction = db.transaction((lignesAInserer) => {
    for (const ligne of lignesAInserer) {
      if (!ligne.numero_table || !ligne.nom || !ligne.prenom || !DECISIONS_VALIDES.includes(ligne.decision)) {
        echecs.push({ ligne, raison: 'champs obligatoires manquants ou décision invalide' });
        continue;
      }

      insert.run({
        examen,
        session: String(session),
        numero_table: String(ligne.numero_table).trim(),
        nom: String(ligne.nom).trim().toUpperCase(),
        prenom: String(ligne.prenom).trim(),
        decision: ligne.decision,
        moyenne: ligne.moyenne === '' || ligne.moyenne == null ? null : Number(ligne.moyenne),
        mention: ligne.mention || null,
        serie: ligne.serie || null,
        etablissement: ligne.etablissement || null,
        province: ligne.province || null,
        region: ligne.region || null,
      });
      inseres++;
    }
  });

  try {
    transaction(lignes);
  } catch (err) {
    return res.status(500).json({ erreur: "Erreur lors de l'insertion en base." });
  }

  return res.status(200).json({ inseres, echecs });
}
