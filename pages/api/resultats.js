// pages/api/resultats.js
// Endpoint de recherche : GET /api/resultats?examen=CEP&session=2026&numero=001234&nom=OUEDRAOGO
//
// Le nom est utilisé comme vérification complémentaire (pas une recherche
// par nom seul), conformément à la section 3.1 du cahier des charges.

const db = require('../../lib/db');

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ erreur: 'Méthode non autorisée' });
  }

  const { examen, session, numero, nom } = req.query;

  if (!examen || !session || !numero) {
    return res.status(400).json({
      erreur: 'Les champs examen, session et numero sont obligatoires.',
    });
  }

  const numeroNormalise = String(numero).trim();

  const ligne = db
    .prepare(
      `SELECT * FROM resultats
       WHERE examen = ? AND session = ? AND numero_table = ?`
    )
    .get(examen, session, numeroNormalise);

  if (!ligne) {
    return res.status(404).json({
      erreur:
        "Aucun résultat trouvé pour ce numéro de table et cette session. Vérifiez votre saisie ou consultez les canaux officiels.",
    });
  }

  // Vérification complémentaire par le nom, si fourni (insensible à la casse).
  if (nom) {
    const nomNormalise = String(nom).trim().toLowerCase();
    if (ligne.nom.toLowerCase() !== nomNormalise) {
      return res.status(404).json({
        erreur:
          'Le nom saisi ne correspond pas au numéro de table indiqué. Vérifiez votre saisie.',
      });
    }
  }

  return res.status(200).json({
    examen: ligne.examen,
    session: ligne.session,
    numero_table: ligne.numero_table,
    nom: ligne.nom,
    prenom: ligne.prenom,
    decision: ligne.decision,
    moyenne: ligne.moyenne,
    mention: ligne.mention,
    serie: ligne.serie,
    etablissement: ligne.etablissement,
    province: ligne.province,
    region: ligne.region,
  });
}
