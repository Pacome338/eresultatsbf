// pages/api/admin/logout.js
const { cookieDeconnexion } = require('../../../lib/auth');

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ erreur: 'Méthode non autorisée' });
  }

  res.setHeader('Set-Cookie', cookieDeconnexion());
  return res.status(200).json({ ok: true });
}
