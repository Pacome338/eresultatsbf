// lib/auth.js
// Authentification minimale pour l'espace admin : un mot de passe unique
// (variable d'environnement ADMIN_PASSWORD) protège l'accès. Une session
// est matérialisée par un cookie signé par HMAC contenant une date
// d'expiration — pas de base d'utilisateurs, volontairement, pour rester
// dans le périmètre MVP (cf. décisions d'architecture : Docker/CI-CD/etc.
// reportés aux phases suivantes).
//
// ATTENTION avant une mise en production réelle : ce mécanisme est
// suffisant pour un usage interne à faible nombre d'administrateurs,
// mais devrait être renforcé (mots de passe individuels hashés,
// limitation du nombre de tentatives, HTTPS obligatoire) si le site
// gère un vrai volume de données sensibles.

const crypto = require('crypto');
const { serialize } = require('cookie');

const NOM_COOKIE = 'admin_session';
const DUREE_SESSION_SEC = 60 * 60 * 8; // 8 heures

function secret() {
  const s = process.env.ADMIN_SECRET;
  if (!s) {
    throw new Error(
      "ADMIN_SECRET n'est pas défini. Copie .env.local.example vers .env.local et complète les valeurs."
    );
  }
  if (s.length < 32) {
    throw new Error(
      'ADMIN_SECRET est trop court (minimum 32 caractères). Génère-en un avec : ' +
      `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
    );
  }
  return s;
}

function egaliteConstante(a, b) {
  // Compare deux chaînes en temps constant (évite qu'un attaquant déduise
  // le mot de passe correct en mesurant le temps de réponse). On hache
  // d'abord les deux valeurs à une longueur fixe pour que
  // crypto.timingSafeEqual ne lève pas d'erreur si les longueurs diffèrent.
  const hashA = crypto.createHash('sha256').update(String(a)).digest();
  const hashB = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

function verifierMotDePasse(saisi) {
  const attendu = process.env.ADMIN_PASSWORD;
  if (!attendu) {
    throw new Error("ADMIN_PASSWORD n'est pas défini (voir .env.local.example).");
  }
  if (attendu === 'change-moi') {
    throw new Error(
      'ADMIN_PASSWORD est encore la valeur par défaut ("change-moi"). ' +
      'Modifie .env.local avec un vrai mot de passe avant de continuer.'
    );
  }
  return egaliteConstante(saisi || '', attendu);
}

function signer(valeur) {
  return crypto.createHmac('sha256', secret()).update(valeur).digest('hex');
}

function creerCookieSession() {
  const expire = Date.now() + DUREE_SESSION_SEC * 1000;
  const charge = String(expire);
  const signature = signer(charge);
  const jeton = `${charge}.${signature}`;

  return serialize(NOM_COOKIE, jeton, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: DUREE_SESSION_SEC,
  });
}

function cookieDeconnexion() {
  return serialize(NOM_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

function sessionValide(req) {
  const jeton = req.cookies?.[NOM_COOKIE];
  if (!jeton) return false;

  const [charge, signature] = jeton.split('.');
  if (!charge || !signature) return false;

  if (!egaliteConstante(signer(charge), signature)) return false;

  const expire = Number(charge);
  if (Number.isNaN(expire) || Date.now() > expire) return false;

  return true;
}

module.exports = { creerCookieSession, cookieDeconnexion, sessionValide, verifierMotDePasse, NOM_COOKIE };
