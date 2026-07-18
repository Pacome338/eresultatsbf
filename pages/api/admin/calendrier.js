// pages/api/admin/calendrier.js
const db = require('../../../lib/db');
import { exigerAdmin } from '../../../lib/requireAdmin';

export default function handler(req, res) {
  if (!exigerAdmin(req, res)) return;

  if (req.method === 'GET') {
    const lignes = db.prepare('SELECT * FROM calendrier ORDER BY session DESC, id ASC').all();
    return res.status(200).json({ lignes });
  }

  if (req.method === 'POST') {
    const { examen, session, epreuves, resultats } = req.body || {};
    if (!examen || !session) return res.status(400).json({ erreur: 'examen et session obligatoires.' });
    const info = db.prepare('INSERT INTO calendrier (examen, session, epreuves, resultats) VALUES (?, ?, ?, ?)')
      .run(examen, String(session), epreuves || null, resultats || null);
    return res.status(200).json({ id: info.lastInsertRowid });
  }

  if (req.method === 'PUT') {
    const { id, examen, session, epreuves, resultats } = req.body || {};
    if (!id) return res.status(400).json({ erreur: 'id manquant' });
    db.prepare('UPDATE calendrier SET examen=?, session=?, epreuves=?, resultats=? WHERE id=?')
      .run(examen, String(session), epreuves || null, resultats || null, id);
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ erreur: 'id manquant' });
    db.prepare('DELETE FROM calendrier WHERE id = ?').run(id);
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).json({ erreur: 'Méthode non autorisée' });
}
