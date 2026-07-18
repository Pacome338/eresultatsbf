// pages/api/admin/extract-pdf.js
// Extrait le texte brut d'un PDF (communiqué de résultats). On ne tente
// PAS de reconstruire un tableau structuré automatiquement : la mise en
// page des communiqués varie trop d'une structure à l'autre pour qu'un
// parsing générique soit fiable, et une extraction silencieusement fausse
// serait pire que pas d'extraction du tout sur des résultats d'examens.
// Le texte brut sert de référence pour une saisie manuelle assistée.

import { formidable } from 'formidable';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import { exigerAdmin } from '../../../lib/requireAdmin';

export const config = {
  api: { bodyParser: false },
};

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

  try {
    const tampon = fs.readFileSync(fichier.filepath);
    const donnees = await pdfParse(tampon);
    return res.status(200).json({ texte: donnees.text });
  } catch (err) {
    return res.status(400).json({ erreur: "Impossible d'extraire le texte de ce PDF." });
  }
}
