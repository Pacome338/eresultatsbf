import { useState, useEffect } from 'react';
import Link from 'next/link';

const CLE_STOCKAGE = 'erbf_avis_accepte_v1';

export default function AvisLegal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(CLE_STOCKAGE)) {
        setVisible(true);
      }
    } catch (err) {
      // Stockage indisponible (navigation privée stricte, etc.) : on
      // n'affiche simplement pas le bandeau plutôt que de bloquer le site.
    }
  }, []);

  function accepter() {
    try {
      window.localStorage.setItem(CLE_STOCKAGE, '1');
    } catch (err) {
      // Rien de grave si le stockage échoue.
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="avis-fond">
      <div className="avis-carte">
        <div className="avis-entete">
          <h2>Avis important — à lire attentivement</h2>
        </div>
        <div className="avis-corps">
          <p>
            En accédant à eRésultatsbf, vous reconnaissez avoir pris connaissance
            des <Link href="/mentions-legales">mentions légales</Link>, des{' '}
            <Link href="/cgu">conditions générales d&apos;utilisation</Link> et de
            la <Link href="/confidentialite">politique de confidentialité</Link> de
            cette plateforme.
          </p>
          <p>
            eRésultatsbf est une plateforme d&apos;information{' '}
            <strong>indépendante</strong>, non éditée par le Ministère de
            l&apos;Éducation ni par la DGEC (ex-OCECOS). Les résultats affichés
            sont fournis à titre indicatif.
          </p>
          <button type="button" onClick={accepter} className="btn">
            J&apos;ai compris, continuer
          </button>
        </div>
      </div>
    </div>
  );
}
