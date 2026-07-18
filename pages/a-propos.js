import Head from 'next/head';

export default function APropos() {
  return (
    <>
      <Head><title>À propos — eRésultatsbf</title></Head>
      <div className="container">
        <div className="page-title-block">
          <h1>À propos d&apos;eRésultatsbf</h1>
        </div>

        <div className="fiche">
          <h3>Pourquoi ce site ?</h3>
          <p>
            Au Burkina Faso, seul le CEP dispose d&apos;un vrai portail de
            consultation individuelle des résultats en ligne. Pour le BEPC, le
            BAC et les autres examens, les résultats sont diffusés de façon
            dispersée : affichage physique dans les établissements,
            communiqués ponctuels sur les réseaux sociaux ou dans la presse.
            eRésultatsbf est né de l&apos;envie de centraliser ces informations
            en un seul endroit simple à consulter, y compris sur une connexion
            lente.
          </p>
        </div>

        <div className="fiche">
          <h3>Une plateforme indépendante</h3>
          <p>
            eRésultatsbf n&apos;est ni édité ni géré par le Ministère de
            l&apos;Éducation, ni par la DGEC (ex-OCECOS), ni par aucune autre
            structure gouvernementale. C&apos;est un projet civique
            indépendant. Les résultats affichés sont fournis à titre indicatif
            à partir de sources publiques ; en cas de doute, la structure
            organisatrice de l&apos;examen fait foi.
          </p>
        </div>

        <div className="fiche">
          <h3>Ce que le site fait</h3>
          <ul>
            <li>Recherche de résultats par numéro de table (CEP, BEPC, BAC)</li>
            <li>Informations pratiques sur les démarches d&apos;attestations</li>
            <li>Calendrier des examens</li>
            <li>Annuaire des structures compétentes</li>
            <li>Statistiques agrégées de réussite</li>
          </ul>
        </div>

        <div className="fiche">
          <h3>Ce que le site ne fait pas</h3>
          <p>
            eRésultatsbf ne délivre aucun document officiel (attestation,
            diplôme, relevé de notes) et ne peut pas modifier une information
            détenue par les structures officielles. Pour toute démarche
            administrative, adressez-vous directement à la structure
            compétente (voir la page Annuaire).
          </p>
        </div>
      </div>
    </>
  );
}
