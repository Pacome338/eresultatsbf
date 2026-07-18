// pages/api/admin/login.js
const { creerCookieSession, verifierMotDePasse } = require('../../../lib/auth');
const { estBloque, enregistrerEchec, reinitialiser } = require('../../../lib/rateLimit');

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ erreur: 'Méthode non autorisée' });
  }

  const blocage = estBloque(req);
  if (blocage.bloque) {
    return res.status(429).json({
      erreur: `Trop de tentatives échouées. Réessaie dans ${blocage.minutesRestantes} minute(s).`,
    });
  }

  const { mot_de_passe } = req.body || {};

  try {
    if (!verifierMotDePasse(mot_de_passe)) {
      enregistrerEchec(req);
      return res.status(401).json({ erreur: 'Mot de passe incorrect.' });
    }

    reinitialiser(req);
    res.setHeader('Set-Cookie', creerCookieSession());
    return res.status(200).json({ ok: true });
  } catch (err) {
    // Erreur de configuration (ADMIN_PASSWORD absent/par défaut, ou
    // ADMIN_SECRET absent/trop court) : ce n'est pas à l'admin de deviner,
    // on lui montre le message tel quel.
    return res.status(500).json({ erreur: err.message });
  }
}
