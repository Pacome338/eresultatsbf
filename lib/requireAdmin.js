// lib/requireAdmin.js
const { sessionValide } = require('./auth');

function exigerAdmin(req, res) {
  let valide;
  try {
    valide = sessionValide(req);
  } catch (err) {
    // Erreur de configuration (ADMIN_SECRET manquant/trop court) plutôt
    // qu'un problème d'authentification : on le dit clairement au lieu
    // de renvoyer un 401 trompeur.
    res.status(500).json({ erreur: err.message });
    return false;
  }

  if (!valide) {
    res.status(401).json({ erreur: 'Non authentifié. Reconnectez-vous.' });
    return false;
  }
  return true;
}

module.exports = { exigerAdmin };
