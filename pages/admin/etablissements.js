import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminNav from '../../components/AdminNav';
import { REGIONS } from '../../data/contenu';

const LIGNE_VIDE = { id: null, nom: '', type: '', province: '', region: '' };

export default function AdminEtablissements() {
  const router = useRouter();
  const [pretAAfficher, setPretAAfficher] = useState(false);
  const [lignes, setLignes] = useState([]);
  const [form, setForm] = useState(LIGNE_VIDE);
  const [message, setMessage] = useState(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  const charger = useCallback(async () => {
    const res = await fetch('/api/admin/etablissements');
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
    setForm({ id: ligne.id, nom: ligne.nom, type: ligne.type || '', province: ligne.province || '', region: ligne.region || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function enregistrer(e) {
    e.preventDefault();
    setEnvoiEnCours(true);
    setMessage(null);

    const methode = form.id ? 'PUT' : 'POST';
    try {
      const res = await fetch('/api/admin/etablissements', {
        method: methode,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.status === 401) return router.replace('/admin/login');
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'erreur', texte: data.erreur });
      } else {
        setMessage({ type: 'ok', texte: form.id ? 'Établissement mis à jour.' : 'Établissement ajouté.' });
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
    if (!confirm('Supprimer cet établissement ?')) return;
    await fetch(`/api/admin/etablissements?id=${id}`, { method: 'DELETE' });
    charger();
  }

  if (!pretAAfficher) {
    return <div className="container"><p style={{ padding: 40 }}>Chargement…</p></div>;
  }

  return (
    <>
      <Head><title>Établissements — Admin eRésultatsbf</title></Head>
      <div className="container">
        <div className="page-title-block">
          <h1>Établissements</h1>
          <p>Liste utilisée pour les suggestions à l&apos;import et la future recherche par établissement.</p>
        </div>

        <AdminNav />

        <div className="card">
          <h2 style={{ fontSize: '1.05rem' }}>{form.id ? 'Modifier' : 'Ajouter un établissement'}</h2>
          <form onSubmit={enregistrer}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div className="form-row" style={{ flex: 2, minWidth: 220 }}>
                <label>Nom</label>
                <input value={form.nom} onChange={(e) => majChamp('nom', e.target.value)} required />
              </div>
              <div className="form-row" style={{ minWidth: 140 }}>
                <label>Type <span className="optionnel">(optionnel)</span></label>
                <select value={form.type} onChange={(e) => majChamp('type', e.target.value)}>
                  <option value="">—</option>
                  <option value="Primaire">Primaire</option>
                  <option value="Collège">Collège</option>
                  <option value="Lycée">Lycée</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div className="form-row" style={{ minWidth: 140 }}>
                <label>Province <span className="optionnel">(optionnel)</span></label>
                <input value={form.province} onChange={(e) => majChamp('province', e.target.value)} />
              </div>
              <div className="form-row" style={{ minWidth: 160 }}>
                <label>Région <span className="optionnel">(optionnel)</span></label>
                <select value={form.region} onChange={(e) => majChamp('region', e.target.value)}>
                  <option value="">—</option>
                  {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
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
          <h2 style={{ fontSize: '1.05rem' }}>Établissements enregistrés ({lignes.length})</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="tableau-simple" style={{ fontSize: '0.82rem' }}>
              <thead>
                <tr><th>Nom</th><th>Type</th><th>Province</th><th>Région</th><th></th></tr>
              </thead>
              <tbody>
                {lignes.map((l) => (
                  <tr key={l.id}>
                    <td>{l.nom}</td>
                    <td>{l.type || '—'}</td>
                    <td>{l.province || '—'}</td>
                    <td>{l.region || '—'}</td>
                    <td style={{ display: 'flex', gap: 10 }}>
                      <button type="button" onClick={() => modifier(l)} style={{ color: 'var(--vert)', border: 'none', background: 'none', cursor: 'pointer' }}>Modifier</button>
                      <button type="button" onClick={() => supprimer(l.id)} style={{ color: 'var(--rouge-statut)', border: 'none', background: 'none', cursor: 'pointer' }}>Supprimer</button>
                    </td>
                  </tr>
                ))}
                {lignes.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--texte-clair)', padding: 20 }}>Aucun établissement enregistré.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
