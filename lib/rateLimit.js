// lib/rateLimit.js
// Protection simple contre le brute-force sur /admin : après plusieurs
// mots de passe erronés depuis la même IP, on bloque temporairement les
// nouvelles tentatives. Stockage en mémoire (suffisant pour un seul
// processus / un seul admin — pas de Redis à ce stade du projet).

const MAX_TENTATIVES = 5;
const DUREE_BLOCAGE_MS = 15 * 60 * 1000; // 15 minutes
const FENETRE_MS = 15 * 60 * 1000; // fenêtre de comptage des échecs

const tentatives = new Map(); // ip -> { echecs: number, premierEchec: number, bloqueJusqua: number|null }

function obtenirIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (xff) return String(xff).split(',')[0].trim();
  return req.socket?.remoteAddress || 'inconnu';
}

function estBloque(req) {
  const ip = obtenirIp(req);
  const etat = tentatives.get(ip);
  if (!etat) return { bloque: false };

  if (etat.bloqueJusqua && Date.now() < etat.bloqueJusqua) {
    const minutesRestantes = Math.ceil((etat.bloqueJusqua - Date.now()) / 60000);
    return { bloque: true, minutesRestantes };
  }

  return { bloque: false };
}

function enregistrerEchec(req) {
  const ip = obtenirIp(req);
  const maintenant = Date.now();
  const etat = tentatives.get(ip) || { echecs: 0, premierEchec: maintenant, bloqueJusqua: null };

  // Réinitialise le compteur si la fenêtre de temps est dépassée.
  if (maintenant - etat.premierEchec > FENETRE_MS) {
    etat.echecs = 0;
    etat.premierEchec = maintenant;
  }

  etat.echecs += 1;
  if (etat.echecs >= MAX_TENTATIVES) {
    etat.bloqueJusqua = maintenant + DUREE_BLOCAGE_MS;
  }

  tentatives.set(ip, etat);
}

function reinitialiser(req) {
  tentatives.delete(obtenirIp(req));
}

module.exports = { estBloque, enregistrerEchec, reinitialiser };
