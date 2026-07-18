import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminNav from '../../components/AdminNav';
import { EXAMENS } from '../../data/contenu';

const LIGNE_VIDE = { id: null, examen: EXAMENS[0].label, session: '2027', epreuves: '', resultats: '' };

export default function AdminCalendrier() {
  const router = useRouter();
  const [pretAAfficher, setPretAAfficher] = useState(false);
  const [lignes, setLignes] = useState([]);
  const [form, setForm] = useState(LIGNE_VIDE);
  const [message, setMessage] = useState(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  const charger = useCallback(async () => {
    const res = await fetch('/api/admin/calendrier');
    if (res.status === 401) return router.replace('/admin/login');
    const data = await res.json();
    setLignes(data.lignes || []);
    setPretAAfficher(true);
  }, [router]);

  useEffect(() => { charger(); }, [charger]);

  function majChamp(champ, valeur) {
    setForm((f) => ({ ...f, [champ]: valeur }));
  }

  function modifier(ligne) {
    setForm({ id: ligne.id, examen: ligne.examen, session: ligne.session, epreuves: ligne.epreuves || '', resultats: ligne.resultats || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function enregistrer(e) {
    e.preventDefault();
    setEnvoiEnCours(true);
    setMessage(null);

    const methode = form.id ? 'PUT' : 'POST';
    try {
      const res = await fetch('/api/admin/calendrier', {
        method: methode,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.status === 401) return router.replace('/admin/login');
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'erreur', texte: data.erreur });
      } else {
        setMessage({ type: 'ok', texte: form.id ? 'Ligne mise à jour.' : 'Ligne ajoutée.' });
        setForm(LIGNE_VIDE);
        charger();
      }
    } catch (err) {
      setMessage({ type: 'erreur', texte: 'Erreur réseau.' });
    } finally {
      setEnvoiEnCours(false);
    }
  }

  async function supprimer(id) {
    if (!confirm('Supprimer cette ligne du calendrier ?')) return;
    await fetch(`/api/admin/calendrier?id=${id}`, { method: 'DELETE' });
    charger();
  }

  if (!pretAAfficher) {
    return <div className="container"><p style={{ padding: 40 }}>Chargement…</p></div>;
  }

  return (
    <>
      <Head><title>Calendrier — Admin eRésultatsbf</title></Head>
      <div className="container">
        <div className="page-title-block">
          <h1>Calendrier des examens</h1>
          <p>Gérer les dates affichées sur la page publique /calendrier.</p>
        </div>

        <AdminNav />

        <div className="card">
          <h2 style={{ fontSize: '1.05rem' }}>{form.id ? 'Modifier' : 'Ajouter une ligne'}</h2>
          <form onSubmit={enregistrer}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div className="form-row" style={{ minWidth: 200 }}>
                <label>Examen</label>
                <input value={form.examen} onChange={(e) => majChamp('examen', e.target.value)} required />
              </div>
              <div className="form-row" style={{ minWidth: 120 }}>
                <label>Session</label>
                <input value={form.session} onChange={(e) => majChamp('session', e.target.value)} required />
              </div>
            </div>
            <div className="form-row">
              <label>Épreuves <span className="optionnel">(dates, détails)</span></label>
              <input value={form.epreuves} onChange={(e) => majChamp('epreuves', e.target.value)} />
            </div>
            <div className="form-row">
              <label>Résultats <span className="optionnel">(dates, détails)</span></label>
              <input value={form.resultats} onChange={(e) => majChamp('resultats', e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn" style={{ width: 'auto' }} disabled={envoiEnCours}>
                {form.id ? 'Mettre à jour' : 'Ajouter'}
              </button>
              {form.id && (
                <button type="button" onClick={() => setForm(LIGNE_VIDE)} className="btn" style={{ width: 'auto', background: 'var(--texte-clair)' }}>
                  Annuler
                </button>
              )}
            </div>
          </form>
          {message && (
            <div className={message.type === 'erreur' ? 'alerte erreur' : 'mention-legale'} style={{ marginTop: 12 }}>
              {message.texte}
            </div>
          )}
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.05rem' }}>Lignes existantes ({lignes.length})</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="tableau-simple" style={{ fontSize: '0.82rem' }}>
              <thead>
                <tr><th>Examen</th><th>Session</th><th>Épreuves</th><th>Résultats</th><th></th></tr>
              </thead>
              <tbody>
                {lignes.map((l) => (
                  <tr key={l.id}>
                    <td>{l.examen}</td>
                    <td>{l.session}</td>
                    <td>{l.epreuves || '—'}</td>
                    <td>{l.resultats || '—'}</td>
                    <td style={{ display: 'flex', gap: 10 }}>
                      <button type="button" onClick={() => modifier(l)} style={{ color: 'var(--vert)', border: 'none', background: 'none', cursor: 'pointer' }}>Modifier</button>
                      <button type="button" onClick={() => supprimer(l.id)} style={{ color: 'var(--rouge-statut)', border: 'none', background: 'none', cursor: 'pointer' }}>Supprimer</button>
                    </td>
                  </tr>
                ))}
                {lignes.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--texte-clair)', padding: 20 }}>Aucune ligne.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
