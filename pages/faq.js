import Head from 'next/head';
import { FAQ } from '../data/contenu';

export default function Faq() {
  return (
    <>
      <Head>
        <title>FAQ — eRésultatsbf</title>
      </Head>

      <div className="container">
        <div className="page-title-block">
          <h1>Questions fréquentes</h1>
          <p>Les questions les plus posées sur les démarches post-résultats.</p>
        </div>

        {FAQ.map((item, i) => (
          <div className="faq-item" key={i}>
            <h3>{item.question}</h3>
            <p>{item.reponse}</p>
          </div>
        ))}
      </div>
    </>
  );
}
