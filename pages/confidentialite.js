import Head from 'next/head';

export default function Confidentialite() {
  return (
    <>
      <Head><title>Politique de confidentialité — eRésultatsbf</title></Head>
      <div className="container">
        <div className="page-title-block">
          <h1>Politique de confidentialité</h1>
        </div>
        <div className="fiche">
          <h3>Données affichées</h3>
          <p>
            Les résultats affichés (nom, prénom, numéro de table, moyenne,
            mention, décision du jury) proviennent de communiqués publics
            d&apos;examens officiels. Ils sont republiés ici uniquement à titre
            indicatif, pour faciliter la consultation par les candidats
            eux-mêmes et leurs familles.
          </p>
        </div>
        <div className="fiche">
          <h3>Recherche de résultat</h3>
          <p>
            La recherche se fait par numéro de table. Aucune donnée saisie dans
            le formulaire de recherche n&apos;est conservée après l&apos;affichage
            du résultat : elle sert uniquement à interroger la base au moment de
            la requête.
          </p>
        </div>
        <div className="fiche">
          <h3>Cookies et stockage local</h3>
          <p>
            Le site utilise le stockage local de votre navigateur uniquement pour
            retenir que vous avez déjà pris connaissance de l&apos;avis affiché à
            la première visite — aucune donnée personnelle n&apos;y est stockée,
            et aucun outil de suivi publicitaire n&apos;est utilisé.
          </p>
        </div>
        <div className="fiche">
          <h3>Demande de retrait</h3>
          <p>
            Toute personne dont le nom apparaît dans un résultat affiché peut
            demander la vérification ou le retrait de cette information, via la
            structure ayant relayé cette plateforme.
          </p>
        </div>
      </div>
    </>
  );
}
