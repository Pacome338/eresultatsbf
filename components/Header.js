import { useState } from 'react';
import Link from 'next/link';

// Logo générique (document + coche) — volontairement PAS les armoiries
// officielles du Burkina Faso, car ce site est une plateforme
// d'information indépendante et non une plateforme gouvernementale.
function LogoGenerique() {
  return (
    <svg className="header-logo" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#0f6b3a" />
      <path d="M14 12h14l6 6v18a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V14a2 2 0 0 1 2-2z" fill="#ffffff" fillOpacity="0.15" stroke="#ffffff" strokeWidth="1.6" />
      <path d="M28 12v6h6" stroke="#ffffff" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M17 26.5l4 4 8-9" stroke="#c98a2c" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconeMenu() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function Header() {
  const [menuOuvert, setMenuOuvert] = useState(false);

  return (
    <header className="site-header">
      <div className="container">
        <Link href="/" className="header-brand" onClick={() => setMenuOuvert(false)}>
          <LogoGenerique />
          <div className="header-titles">
            <div className="site-name">eRésultatsbf</div>
            <div className="site-tagline">Résultats d&apos;examens et concours — Burkina Faso</div>
          </div>
        </Link>

        <button
          className="menu-toggle"
          aria-label="Ouvrir le menu"
          onClick={() => setMenuOuvert((v) => !v)}
        >
          <IconeMenu />
        </button>

        <nav className={`site-nav ${menuOuvert ? 'ouvert' : ''}`}>
          <Link href="/" onClick={() => setMenuOuvert(false)}>Rechercher</Link>
          <Link href="/attestations" onClick={() => setMenuOuvert(false)}>Attestations</Link>
          <Link href="/faq" onClick={() => setMenuOuvert(false)}>FAQ</Link>
          <Link href="/calendrier" onClick={() => setMenuOuvert(false)}>Calendrier</Link>
          <Link href="/annuaire" onClick={() => setMenuOuvert(false)}>Annuaire</Link>
          <Link href="/a-propos" onClick={() => setMenuOuvert(false)}>À propos</Link>
        </nav>
      </div>
    </header>
  );
}
