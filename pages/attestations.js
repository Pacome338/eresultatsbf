import Head from 'next/head';
import { FICHES_PRATIQUES, EXAMENS } from '../data/contenu';

export default function Attestations() {
  return (
    <>
      <Head>
        <title>Démarches attestations — eRésultatsbf</title>
      </Head>

      <div className="container">
        <div className="page-title-block">
          <h1>Démarches pour attestations et relevés de notes</h1>
          <p>
            Ce site ne délivre aucun document officiel. Voici comment
            préparer votre démarche auprès de la structure compétente.
          </p>
        </div>

        {FICHES_PRATIQUES.map((fiche) => {
          const label = EXAMENS.find((e) => e.code === fiche.examen)?.label || fiche.examen;
          return (
            <div className="fiche" key={fiche.examen}>
              <h3>{label}</h3>
              <p><strong>Structure compétente :</strong> {fiche.structure}</p>
              <p><strong>Lieu :</strong> {fiche.lieu}</p>
              {fiche.telephone && <p><strong>Téléphone :</strong> {fiche.telephone}</p>}
              <p><strong>Documents à apporter :</strong></p>
              <ul>
                {fiche.documents.map((doc, i) => (
                  <li key={i}>{doc}</li>
                ))}
              </ul>
              <p><strong>Coût indicatif :</strong> {fiche.cout}</p>
              <p><strong>Délai indicatif :</strong> {fiche.delai}</p>
              <p><strong>Horaires :</strong> {fiche.horaires}</p>
            </div>
          );
        })}

        <div className="mention-legale">
          Ces informations sont indicatives et peuvent varier selon les
          structures locales. Contactez la structure avant de vous déplacer.
        </div>
      </div>
    </>
  );
}
