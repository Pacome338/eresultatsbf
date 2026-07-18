import Head from 'next/head';
const db = require('../lib/db');

export async function getServerSideProps() {
  const lignes = db.prepare('SELECT * FROM annuaire ORDER BY id ASC').all();
  return { props: { lignes } };
}

// Découpe le champ "contact" (texte libre séparé par "·") en lignes
// distinctes, avec une icône adaptée selon le type d'info détecté.
function decouperContact(contact) {
  if (!contact) return [];
  return contact.split('·').map((s) => s.trim()).filter(Boolean);
}

function typeSegment(segment) {
  const s = segment.toLowerCase();
  if (s.startsWith('tél') || s.startsWith('tel')) return 'telephone';
  if (s.startsWith('fax')) return 'telephone';
  if (s.startsWith('email')) return 'email';
  if (s.startsWith('horaires')) return 'horaires';
  if (s.startsWith('carte') || s.includes('http')) return 'carte';
  return 'adresse';
}

function extraireUrl(segment) {
  const m = segment.match(/https?:\/\/\S+/);
  return m ? m[0] : null;
}

export default function Annuaire({ lignes }) {
  return (
    <>
      <Head>
        <title>Annuaire des structures — eRésultatsbf</title>
      </Head>
      <div className="container">
        <div className="page-title-block">
          <h1>Annuaire des structures compétentes</h1>
          <p>Coordonnées gérées depuis l&apos;espace admin.</p>
        </div>

        {lignes.map((s) => (
          <div className="fiche" key={s.id}>
            <h3>{s.structure}</h3>
            {s.role && <p style={{ marginBottom: 14 }}><strong>Concerne :</strong> {s.role}</p>}

            <ul className="contact-liste">
              {decouperContact(s.contact).map((segment, i) => {
                const type = typeSegment(segment);
                const url = type === 'carte' ? extraireUrl(segment) : null;
                const texte = url ? segment.replace(url, '').replace(/carte\s*:?\s*/i, '').trim() : segment;

                return (
                  <li key={i} className="contact-ligne">
                    <IconeContact type={type} />
                    <span>
                      {texte}
                      {url && (
                        <>
                          {texte && ' — '}
                          <a href={url} target="_blank" rel="noreferrer">Voir sur la carte</a>
                        </>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {lignes.length === 0 && (
          <p style={{ color: 'var(--texte-clair)' }}>Aucune structure enregistrée pour l&apos;instant.</p>
        )}
      </div>
    </>
  );
}

function IconeContact({ type }) {
  const props = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none' };
  if (type === 'telephone') {
    return (
      <svg {...props}>
        <path d="M6.5 4h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5l1.5-2 4 1.5v3c0 1-1 1.5-2 1.5C11.5 19 5 12.5 5 6c0-1 .5-2 1.5-2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === 'email') {
    return (
      <svg {...props}>
        <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M4.5 7l7.5 6 7.5-6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === 'horaires') {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 7.5v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === 'carte') {
    return (
      <svg {...props}>
        <path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="12" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  // adresse par défaut
  return (
    <svg {...props}>
      <path d="M4 21V10l8-6 8 6v11h-5v-6H9v6H4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
