import Head from 'next/head';
const db = require('../lib/db');
const { REGIONS } = require('../data/contenu');

function formatNombre(n) {
  return n == null ? '—' : n.toLocaleString('fr-FR');
}

function formatTaux(taux) {
  return taux == null ? '—' : `${taux}%`;
}

export async function getServerSideProps() {
  const nationales = db.prepare(`
    SELECT * FROM statistiques WHERE portee = 'national'
    ORDER BY session ASC, examen ASC
  `).all();

  const regionales = db.prepare(`
    SELECT * FROM statistiques WHERE portee = 'region'
    ORDER BY session DESC
  `).all();

  const sessions = [...new Set(regionales.map((r) => r.session))].sort().reverse();

  // Pour chaque session : grille des 17 régions (lignes "ensemble de la
  // région") + détail provincial séparé (zone commençant par "Province du").
  const grillesParSession = sessions.map((session) => {
    const lignesSession = regionales.filter((r) => r.session === session);

    const grille = REGIONS.map((nomRegion) => {
      const ligne = { region: nomRegion, zone: '', CEP: null, BEPC: null, BAC: null };
      const correspondantes = lignesSession.filter(
        (r) => r.region === nomRegion && !(r.zone || '').startsWith('Province du')
      );
      for (const r of correspondantes) {
        const cle = r.examen.startsWith('BAC') ? 'BAC' : r.examen;
        ligne[cle] = r.taux;
        if (r.zone) ligne.zone = r.zone;
      }
      return ligne;
    });

    const detailProvincial = lignesSession.filter((r) => (r.zone || '').startsWith('Province du'));

    return { session, grille, detailProvincial };
  });

  return { props: { nationales, grillesParSession } };
}

export default function Statistiques({ nationales, grillesParSession }) {
  return (
    <>
      <Head>
        <title>Statistiques par région — eRésultatsbf</title>
      </Head>
      <div className="container">
        <div className="page-title-block">
          <h1>Statistiques des résultats</h1>
          <p>Taux de réussite agrégés, gérés depuis l&apos;espace admin.</p>
        </div>

        <div className="alerte-info">
          <span>
            Couverture <strong>partielle</strong> — ces chiffres ne couvrent pas encore
            toutes les régions ni toutes les sessions. Ce sont des statistiques
            agrégées, pas des résultats individuels : utilise la recherche sur la
            page d&apos;accueil pour un résultat par candidat.
          </span>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.05rem' }}>Évolution nationale</h2>
          {nationales.length === 0 ? (
            <p style={{ color: 'var(--texte-clair)' }}>Aucune donnée nationale enregistrée pour l&apos;instant.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="tableau-simple">
                <thead>
                  <tr><th>Examen</th><th>Session</th><th>Candidats</th><th>Admis</th><th>Taux</th></tr>
                </thead>
                <tbody>
                  {nationales.map((s) => (
                    <tr key={s.id}>
                      <td data-label="Examen">{s.examen}</td>
                      <td data-label="Session">{s.session}</td>
                      <td data-label="Candidats">{formatNombre(s.candidats)}</td>
                      <td data-label="Admis">{formatNombre(s.admis)}</td>
                      <td data-label="Taux">
                        <strong>{formatTaux(s.taux)}</strong>
                        {s.note && <div style={{ fontSize: '0.72rem', color: 'var(--texte-clair)', fontWeight: 400 }}>{s.note}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {grillesParSession.map(({ session, grille, detailProvincial }) => (
          <div className="card" key={session}>
            <h2 style={{ fontSize: '1.05rem' }}>Détail par région — session {session}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--texte-clair)', marginTop: -8 }}>
              Les 17 régions, avec le taux de réussite par examen quand la donnée est disponible.
            </p>

            {/* Sur mobile (< 640px), ce tableau se transforme automatiquement
                en petites cartes empilées grâce à .tableau-responsive-cards
                (voir globals.css) — plus besoin de faire défiler horizontalement. */}
            <div style={{ overflowX: 'auto' }}>
              <table className="tableau-simple tableau-responsive-cards">
                <thead>
                  <tr><th>Région</th><th>Zone</th><th>CEP</th><th>BEPC</th><th>BAC</th></tr>
                </thead>
                <tbody>
                  {grille.map((r) => (
                    <tr key={r.region}>
                      <td data-label="Région"><strong>{r.region}</strong></td>
                      <td data-label="Zone" style={{ color: 'var(--texte-clair)' }}>{r.zone || '—'}</td>
                      <td data-label="CEP">{formatTaux(r.CEP)}</td>
                      <td data-label="BEPC">{formatTaux(r.BEPC)}</td>
                      <td data-label="BAC">{formatTaux(r.BAC)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {detailProvincial.length > 0 && (
              <>
                <h3 style={{ fontSize: '0.92rem', marginTop: 20 }}>Détail provincial disponible</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="tableau-simple tableau-responsive-cards">
                    <thead>
                      <tr><th>Examen</th><th>Région</th><th>Zone</th><th>Taux</th></tr>
                    </thead>
                    <tbody>
                      {detailProvincial.map((p) => (
                        <tr key={p.id}>
                          <td data-label="Examen">{p.examen}</td>
                          <td data-label="Région">{p.region}</td>
                          <td data-label="Zone">{p.zone}</td>
                          <td data-label="Taux"><strong>{formatTaux(p.taux)}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        ))}

        <div className="mention-legale">
          <strong>Note sur les régions :</strong> le Burkina Faso est passé de 13 à
          17 régions le 2 juillet 2025, avec de nouveaux noms endogènes. Les données
          ci-dessus sont gérées et mises à jour depuis l&apos;espace administrateur.
        </div>
      </div>
    </>
  );
}
