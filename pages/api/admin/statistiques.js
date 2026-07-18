// pages/api/admin/statistiques.js
// CRUD des statistiques agrégées (national ou par région).

const db = require('../../../lib/db');
import { exigerAdmin } from '../../../lib/requireAdmin';

export default function handler(req, res) {
  if (!exigerAdmin(req, res)) return;

  if (req.method === 'GET') {
    const lignes = db.prepare('SELECT * FROM statistiques ORDER BY session DESC, examen ASC, region ASC').all();
    return res.status(200).json({ lignes });
  }

  if (req.method === 'POST') {
    const { examen, session, portee, region, zone, candidats, admis, taux, note } = req.body || {};
    if (!examen || !session || !portee) {
      return res.status(400).json({ erreur: 'examen, session et portee sont obligatoires.' });
    }
    if (portee === 'region' && !region) {
      return res.status(400).json({ erreur: 'region est obligatoire quand portee = "region".' });
    }
    const info = db.prepare(`
      INSERT INTO statistiques (examen, session, portee, region, zone, candidats, admis, taux, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      examen, String(session), portee, portee === 'region' ? region : null, zone || null,
      candidats === '' || candidats == null ? null : Number(candidats),
      admis === '' || admis == null ? null : Number(admis),
      taux === '' || taux == null ? null : Number(taux),
      note || null
    );
    return res.status(200).json({ id: info.lastInsertRowid });
  }

  if (req.method === 'PUT') {
    const { id, examen, session, portee, region, zone, candidats, admis, taux, note } = req.body || {};
    if (!id) return res.status(400).json({ erreur: 'id manquant' });
    db.prepare(`
      UPDATE statistiques SET examen=?, session=?, portee=?, region=?, zone=?, candidats=?, admis=?, taux=?, note=?
      WHERE id=?
    `).run(
      examen, String(session), portee, portee === 'region' ? region : null, zone || null,
      candidats === '' || candidats == null ? null : Number(candidats),
      admis === '' || admis == null ? null : Number(admis),
      taux === '' || taux == null ? null : Number(taux),
      note || null, id
    );
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ erreur: 'id manquant' });
    db.prepare('DELETE FROM statistiques WHERE id = ?').run(id);
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).json({ erreur: 'Méthode non autorisée' });
}
