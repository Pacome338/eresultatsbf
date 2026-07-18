import Head from 'next/head';
const db = require('../lib/db');

export async function getServerSideProps() {
  const lignes = db.prepare('SELECT * FROM calendrier ORDER BY session DESC, id ASC').all();
  return { props: { lignes } };
}

export default function Calendrier({ lignes }) {
  return (
    <>
      <Head>
        <title>Calendrier des examens — eRésultatsbf</title>
      </Head>
      <div className="container">
        <div className="page-title-block">
          <h1>Calendrier des examens</h1>
          <p>Dates gérées depuis l&apos;espace admin.</p>
        </div>

        {lignes.length === 0 ? (
          <p style={{ color: 'var(--texte-clair)' }}>Aucune donnée de calendrier enregistrée pour l&apos;instant.</p>
        ) : (
          <table className="tableau-simple">
            <thead>
              <tr>
                <th>Examen</th><th>Session</th><th>Épreuves</th><th>Résultats</th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((l) => (
                <tr key={l.id}>
                  <td>{l.examen}</td>
                  <td>{l.session}</td>
                  <td>{l.epreuves || '—'}</td>
                  <td>{l.resultats || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="mention-legale">
          Dates fournies à titre indicatif ; seules les annonces officielles
          des ministères et de la DGEC (ex-OCECOS) font foi.
        </div>
      </div>
    </>
  );
}
