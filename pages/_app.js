import '../styles/globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AvisLegal from '../components/AvisLegal';

export default function App({ Component, pageProps }) {
  return (
    <>
      {/* Filtre SVG partagé : donne au tampon encreur (.tampon) un bord
          légèrement irrégulier, comme un vrai tampon administratif. */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <filter id="texture-tampon">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="bruit" />
          <feDisplacementMap in="SourceGraphic" in2="bruit" scale="2.2" />
        </filter>
      </svg>

      <Header />
      <main>
        <Component {...pageProps} />
      </main>
      <Footer />
      <AvisLegal />
    </>
  );
}
