// pages/api/admin/annuaire.js
const db = require('../../../lib/db');
import { exigerAdmin } from '../../../lib/requireAdmin';

export default function handler(req, res) {
  if (!exigerAdmin(req, res)) return;

  if (req.method === 'GET') {
    const lignes = db.prepare('SELECT * FROM annuaire ORDER BY id ASC').all();
    return res.status(200).json({ lignes });
  }

  if (req.method === 'POST') {
    const { structure, role, contact } = req.body || {};
    if (!structure) return res.status(400).json({ erreur: 'structure obligatoire.' });
    const info = db.prepare('INSERT INTO annuaire (structure, role, contact) VALUES (?, ?, ?)')
      .run(structure, role || null, contact || null);
    return res.status(200).json({ id: info.lastInsertRowid });
  }

  if (req.method === 'PUT') {
    const { id, structure, role, contact } = req.body || {};
    if (!id) return res.status(400).json({ erreur: 'id manquant' });
    db.prepare('UPDATE annuaire SET structure=?, role=?, contact=? WHERE id=?')
      .run(structure, role || null, contact || null, id);
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ erreur: 'id manquant' });
    db.prepare('DELETE FROM annuaire WHERE id = ?').run(id);
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).json({ erreur: 'Méthode non autorisée' });
}
