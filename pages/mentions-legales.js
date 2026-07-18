import Head from 'next/head';

export default function MentionsLegales() {
  return (
    <>
      <Head><title>Mentions légales — eRésultatsbf</title></Head>
      <div className="container">
        <div className="page-title-block">
          <h1>Mentions légales</h1>
        </div>
        <div className="fiche">
          <h3>Éditeur du site</h3>
          <p>
            eRésultatsbf est une plateforme d&apos;information <strong>indépendante</strong>,
            à but civique, consacrée à la centralisation des résultats d&apos;examens
            scolaires du Burkina Faso. Elle n&apos;est éditée ni par le Ministère de
            l&apos;Éducation Nationale, de l&apos;Alphabétisation et de la Promotion
            des Langues Nationales (MENAPLN), ni par la Direction Générale des
            Examens et Concours (DGEC, ex-OCECOS), ni par aucune autre structure
            gouvernementale.
          </p>
        </div>
        <div className="fiche">
          <h3>Nature des informations diffusées</h3>
          <p>
            Les résultats affichés sont fournis à titre indicatif, à partir de
            communiqués publics et de sources vérifiées dans la mesure du
            possible. Ils ne constituent pas des documents à valeur légale et ne
            remplacent aucune attestation, relevé de notes ou diplôme délivré par
            les structures compétentes.
          </p>
        </div>
        <div className="fiche">
          <h3>Signaler une erreur</h3>
          <p>
            Si un résultat affiché vous semble erroné, ou si vous souhaitez qu&apos;il
            soit retiré, contactez-nous via la structure ayant relayé cette
            plateforme, en précisant l&apos;examen, la session et le numéro de table
            concernés.
          </p>
        </div>
      </div>
    </>
  );
}
