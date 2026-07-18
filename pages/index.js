import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { EXAMENS } from '../data/contenu';
const db = require('../lib/db');

const SESSIONS = ['2026', '2025', '2024'];

export async function getServerSideProps() {
  const sessionsCalendrier = db.prepare(
    'SELECT * FROM calendrier ORDER BY session DESC, id ASC LIMIT 6'
  ).all();
  return { props: { sessionsCalendrier } };
}

export default function Accueil({ sessionsCalendrier }) {
  const [examen, setExamen] = useState('');
  const [session, setSession] = useState('');
  const [numero, setNumero] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');

  const [resultat, setResultat] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErreur(null);
    setResultat(null);

    if (!examen || !session) {
      setErreur('Merci de sélectionner un examen et une session.');
      return;
    }
    if (!numero.trim()) {
      setErreur('Merci de saisir votre numéro de table.');
      return;
    }

    setChargement(true);
    try {
      const params = new URLSearchParams({ examen, session, numero: numero.trim() });
      if (nom.trim()) params.set('nom', nom.trim());

      const res = await fetch(`/api/resultats?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setErreur(data.erreur || 'Une erreur est survenue.');
      } else {
        setResultat(data);
      }
    } catch (err) {
      setErreur('Impossible de contacter le serveur. Vérifiez votre connexion.');
    } finally {
      setChargement(false);
    }
  }

  return (
    <>
      <Head>
        <title>eRésultatsbf — Résultats d&apos;examens du Burkina Faso</title>
      </Head>

      <section className="hero">
        <div className="hero-forme" aria-hidden="true">
          <IconeMotifExamen />
        </div>
        <div className="container hero-contenu">
          <span className="hero-badge">Plateforme d&apos;information indépendante</span>
          <h1>Vos résultats d&apos;examens, en un seul endroit</h1>
          <p>
            CEP, BEPC, BAC — retrouvez votre résultat en quelques secondes,
            et toutes les infos pratiques pour vos démarches.
          </p>
        </div>
      </section>

      <div className="container">
        <div className="card">
          <h2 style={{ fontSize: '1.3rem' }}>Rechercher un résultat</h2>
          <p style={{ color: 'var(--texte-clair)', marginBottom: 22 }}>
            Veuillez renseigner les informations du candidat
          </p>

          <form className="form-recherche" onSubmit={onSubmit}>
            <div className="form-row">
              <label htmlFor="examen">Type d&apos;examen</label>
              <select id="examen" value={examen} onChange={(e) => setExamen(e.target.value)}>
                <option value="">Sélectionnez un examen</option>
                {EXAMENS.map((ex) => (
                  <option key={ex.code} value={ex.code}>
                    {ex.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <label htmlFor="session">Session / année</label>
              <select id="session" value={session} onChange={(e) => setSession(e.target.value)}>
                <option value="">Sélectionnez une session</option>
                {SESSIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <label htmlFor="numero">Numéro de table</label>
              <input
                id="numero"
                type="text"
                inputMode="numeric"
                className="numero-table"
                placeholder="Saisissez le numéro de table"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
              />
            </div>

            <div className="form-row">
              <label htmlFor="nom">Nom <span className="optionnel">(optionnel)</span></label>
              <input
                id="nom"
                type="text"
                placeholder="Saisissez le nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
              />
            </div>

            <div className="form-row">
              <label htmlFor="prenom">Prénom(s) <span className="optionnel">(optionnel)</span></label>
              <input
                id="prenom"
                type="text"
                placeholder="Saisissez le / les prénoms"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
              />
            </div>

            <button type="submit" className="btn" disabled={chargement}>
              <IconeRecherche />
              {chargement ? 'Recherche en cours…' : 'Rechercher le résultat'}
            </button>
          </form>

          {erreur && <div className="alerte erreur">{erreur}</div>}
        </div>

        {resultat && <ResultatCard resultat={resultat} />}

        <div className="raccourcis-grid">
          <Link href="/etablissements" className="raccourci-card">
            <IconeEtablissement />
            <div className="raccourci-texte">
              <h3>Recherche par établissement</h3>
              <p>Consulter les résultats par école ou établissement</p>
            </div>
            <span className="raccourci-fleche">›</span>
          </Link>
          <Link href="/statistiques" className="raccourci-card">
            <IconeRegion />
            <div className="raccourci-texte">
              <h3>Statistiques par région</h3>
              <p>Consulter les statistiques des résultats par région</p>
            </div>
            <span className="raccourci-fleche">›</span>
          </Link>
        </div>

        {sessionsCalendrier.length > 0 && (
          <div className="card">
            <h2 style={{ fontSize: '1.1rem' }}>Examens et sessions</h2>
            <div className="sessions-liste">
              {sessionsCalendrier.map((s) => (
                <div className="session-item" key={s.id}>
                  <span className="session-numero">{s.session}</span>
                  <div>
                    <h3>{s.examen}</h3>
                    <p>{s.epreuves || 'Dates à confirmer'}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/calendrier" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              Voir le calendrier complet →
            </Link>
          </div>
        )}

        <div className="alerte-info">
          <IconeAvertissement />
          <span>
            Les résultats affichés sont donnés à titre indicatif et ne
            constituent pas un document officiel.
          </span>
        </div>
      </div>
    </>
  );
}

function ResultatCard({ resultat }) {
  const examenLabel = EXAMENS.find((e) => e.code === resultat.examen)?.label || resultat.examen;

  const DECISIONS = {
    admis: { label: 'Admis', classe: 'admis', icone: <IconeCheck /> },
    second_tour: { label: 'Second tour', classe: 'second-tour', icone: <IconeHorloge /> },
    non_admis: { label: 'Non admis', classe: 'non-admis', icone: <IconeCroix /> },
  };
  const decision = DECISIONS[resultat.decision] || { label: resultat.decision, classe: '', icone: null };

  return (
    <div className="card">
      <h2 style={{ fontSize: '1.15rem' }}>Aperçu du résultat</h2>

      <div className="resultat-tampon-ligne">
        <span style={{ fontSize: '0.76rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--texte-clair)' }}>
          Décision du jury
        </span>
        <span key={resultat.numero_table} className={`tampon ${decision.classe}`}>
          {decision.icone}
          {decision.label}
        </span>
      </div>
      {resultat.decision === 'second_tour' && (
        <p style={{ fontSize: '0.78rem', color: 'var(--texte-clair)', marginTop: -10, marginBottom: 4 }}>
          Résultat pas encore final — épreuves de rattrapage en attente.
        </p>
      )}

      <dl className="resultat-liste">
        {resultat.moyenne != null && (
          <div className="ligne-resultat">
            <dt>Moyenne</dt>
            <dd>{resultat.moyenne} / 20</dd>
          </div>
        )}

        {resultat.mention && (
          <div className="ligne-resultat">
            <dt>Mention</dt>
            <dd>{resultat.mention}</dd>
          </div>
        )}

        {resultat.serie && (
          <div className="ligne-resultat">
            <dt>Série</dt>
            <dd>{resultat.serie}</dd>
          </div>
        )}

        <div className="ligne-resultat">
          <dt>Candidat(e)</dt>
          <dd>{resultat.prenom} {resultat.nom}</dd>
        </div>

        <div className="ligne-resultat">
          <dt>Examen</dt>
          <dd>{examenLabel}</dd>
        </div>

        <div className="ligne-resultat">
          <dt>Session</dt>
          <dd>{resultat.session}</dd>
        </div>
      </dl>
    </div>
  );
}

function IconeRecherche() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconeCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#1a7a41" />
      <path d="M8 12.5l2.5 2.5L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconeCroix() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#b5342a" />
      <path d="M9 9l6 6M15 9l-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconeHorloge() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#c98a2c" />
      <path d="M12 7v5l3.5 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconeMotifExamen() {
  // Grille de "bulles à cocher" — référence directe aux grilles de
  // réponses des épreuves à choix multiples. Quelques bulles "remplies"
  // suggèrent une copie en cours de correction.
  const remplies = new Set(['1-2', '2-0', '3-4', '5-1', '6-3']);
  const lignes = 7;
  const colonnes = 6;
  const cercles = [];
  for (let l = 0; l < lignes; l++) {
    for (let c = 0; c < colonnes; c++) {
      const cle = `${l}-${c}`;
      cercles.push(
        <circle
          key={cle}
          cx={40 + c * 62}
          cy={30 + l * 42}
          r={remplies.has(cle) ? 9 : 8}
          fill={remplies.has(cle) ? '#ffffff' : 'none'}
          stroke="#ffffff"
          strokeWidth="1.6"
          opacity={remplies.has(cle) ? 0.22 : 0.09}
        />
      );
    }
  }
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
      {cercles}
    </svg>
  );
}

function IconeEtablissement() {
  return (
    <svg className="raccourci-icone" viewBox="0 0 40 40" fill="none">
      <path d="M20 6l14 8v4H6v-4l14-8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8 18v14M32 18v14M14 32V22h12v10" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M6 34h28" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconeRegion() {
  return (
    <svg className="raccourci-icone" viewBox="0 0 40 40" fill="none">
      <path d="M8 12l7-4 6 3 6-4 5 3-2 9-6 3-6-3-7 4-6-3 3-8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M15 8v16M27 10v16" stroke="currentColor" strokeWidth="1.4" opacity="0.6" />
    </svg>
  );
}

function IconeAvertissement() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 3.5L2.5 20h19L12 3.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 10v4.5M12 17.2v.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
