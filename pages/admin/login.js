import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function AdminLogin() {
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(false);
  const router = useRouter();

  async function onSubmit(e) {
    e.preventDefault();
    setErreur(null);
    setChargement(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mot_de_passe: motDePasse }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErreur(data.erreur || 'Erreur de connexion.');
      } else {
        router.push('/admin');
      }
    } catch (err) {
      setErreur('Impossible de contacter le serveur.');
    } finally {
      setChargement(false);
    }
  }

  return (
    <>
      <Head>
        <title>Connexion admin — eRésultatsbf</title>
      </Head>
      <div className="container">
        <div className="card" style={{ maxWidth: 380, margin: '60px auto' }}>
          <h1 style={{ fontSize: '1.3rem' }}>Espace administrateur</h1>
          <p style={{ color: 'var(--texte-clair)', fontSize: '0.9rem', marginBottom: 20 }}>
            Accès réservé à la gestion des données.
          </p>

          <form onSubmit={onSubmit} className="form-recherche">
            <div className="form-row">
              <label htmlFor="mdp">Mot de passe</label>
              <input
                id="mdp"
                type="password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                autoFocus
              />
            </div>
            <button type="submit" className="btn" disabled={chargement}>
              {chargement ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          {erreur && <div className="alerte erreur">{erreur}</div>}
        </div>
      </div>
    </>
  );
}
