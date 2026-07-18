// pages/api/admin/resultats.js
// Liste les résultats déjà en base (pour vérification/gestion) et
// permet d'en supprimer un en cas d'erreur d'import.

const db = require('../../../lib/db');
import { exigerAdmin } from '../../../lib/requireAdmin';

export default function handler(req, res) {
  if (!exigerAdmin(req, res)) return;

  if (req.method === 'GET') {
    const lignes = db.prepare('SELECT * FROM resultats ORDER BY id DESC LIMIT 100').all();
    return res.status(200).json({ lignes });
  }

  if (req.method === 'DELETE') {
    const { id, examen, session } = req.query;

    if (id) {
      db.prepare('DELETE FROM resultats WHERE id = ?').run(id);
      return res.status(200).json({ ok: true });
    }

    if (examen && session) {
      const info = db.prepare('DELETE FROM resultats WHERE examen = ? AND session = ?').run(examen, session);
      return res.status(200).json({ ok: true, supprimes: info.changes });
    }

    return res.status(400).json({ erreur: 'Fournis soit "id", soit "examen" + "session".' });
  }

  res.setHeader('Allow', ['GET', 'DELETE']);
  return res.status(405).json({ erreur: 'Méthode non autorisée' });
}
