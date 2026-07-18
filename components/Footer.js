import Link from 'next/link';

function IconeInfo() {
  return (
    <svg className="footer-icon" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.6" opacity="0.6" />
      <path d="M20 13.5v.1M20 18v9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function IconeCadenas() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-inner">
          <IconeInfo />
          <div className="footer-text">
            <strong>eRésultatsbf — Plateforme d&apos;information indépendante</strong>
            Ce site n&apos;est pas édité par le Ministère de l&apos;Éducation nationale,
            de l&apos;Alphabétisation et de la Promotion des Langues nationales,
            ni par la DGEC (ex-OCECOS). Les résultats affichés sont fournis à titre
            indicatif et ne constituent pas des documents officiels. Pour toute
            démarche officielle, adressez-vous à la structure compétente
            (voir la page Annuaire).
          </div>
        </div>

        <nav className="footer-liens">
          <Link href="/mentions-legales">Mentions légales</Link>
          <Link href="/cgu">Conditions générales d&apos;utilisation</Link>
          <Link href="/confidentialite">Politique de confidentialité</Link>
        </nav>

        <div className="footer-meta">
          <IconeCadenas />
          <span>Connexion sécurisée · © {new Date().getFullYear()} eRésultatsbf</span>
        </div>
      </div>

      <div className="bande-drapeau" aria-hidden="true">
        <span style={{ background: '#e2001a' }} />
        <span style={{ background: '#009a49' }} />
        <svg className="bande-etoile" viewBox="0 0 24 24" fill="#f9d616">
          <path d="M12 1.5l2.6 6.7 7.2.4-5.6 4.6 1.9 7-6.1-4-6.1 4 1.9-7-5.6-4.6 7.2-.4z" />
        </svg>
      </div>
    </footer>
  );
}
