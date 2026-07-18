// pages/api/admin/etablissements.js
const db = require('../../../lib/db');
import { exigerAdmin } from '../../../lib/requireAdmin';

export default function handler(req, res) {
  if (!exigerAdmin(req, res)) return;

  if (req.method === 'GET') {
    const lignes = db.prepare('SELECT * FROM etablissements ORDER BY nom ASC').all();
    return res.status(200).json({ lignes });
  }

  if (req.method === 'POST') {
    const { nom, type, province, region } = req.body || {};
    if (!nom) return res.status(400).json({ erreur: 'nom obligatoire.' });
    const info = db.prepare('INSERT INTO etablissements (nom, type, province, region) VALUES (?, ?, ?, ?)')
      .run(nom, type || null, province || null, region || null);
    return res.status(200).json({ id: info.lastInsertRowid });
  }

  if (req.method === 'PUT') {
    const { id, nom, type, province, region } = req.body || {};
    if (!id) return res.status(400).json({ erreur: 'id manquant' });
    db.prepare('UPDATE etablissements SET nom=?, type=?, province=?, region=? WHERE id=?')
      .run(nom, type || null, province || null, region || null, id);
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ erreur: 'id manquant' });
    db.prepare('DELETE FROM etablissements WHERE id = ?').run(id);
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).json({ erreur: 'Méthode non autorisée' });
}
