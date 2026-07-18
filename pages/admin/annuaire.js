import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminNav from '../../components/AdminNav';

const LIGNE_VIDE = { id: null, structure: '', role: '', contact: '' };

export default function AdminAnnuaire() {
  const router = useRouter();
  const [pretAAfficher, setPretAAfficher] = useState(false);
  const [lignes, setLignes] = useState([]);
  const [form, setForm] = useState(LIGNE_VIDE);
  const [message, setMessage] = useState(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  const charger = useCallback(async () => {
    const res = await fetch('/api/admin/annuaire');
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
    setForm({ id: ligne.id, structure: ligne.structure, role: ligne.role || '', contact: ligne.contact || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function enregistrer(e) {
    e.preventDefault();
    setEnvoiEnCours(true);
    setMessage(null);

    const methode = form.id ? 'PUT' : 'POST';
    try {
      const res = await fetch('/api/admin/annuaire', {
        method: methode,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.status === 401) return router.replace('/admin/login');
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'erreur', texte: data.erreur });
      } else {
        setMessage({ type: 'ok', texte: form.id ? 'Structure mise à jour.' : 'Structure ajoutée.' });
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
    if (!confirm('Supprimer cette structure de l\'annuaire ?')) return;
    await fetch(`/api/admin/annuaire?id=${id}`, { method: 'DELETE' });
    charger();
  }

  if (!pretAAfficher) {
    return <div className="container"><p style={{ padding: 40 }}>Chargement…</p></div>;
  }

  return (
    <>
      <Head><title>Annuaire — Admin eRésultatsbf</title></Head>
      <div className="container">
        <div className="page-title-block">
          <h1>Annuaire des structures</h1>
          <p>Gérer les structures affichées sur la page publique /annuaire.</p>
        </div>

        <AdminNav />

        <div className="card">
          <h2 style={{ fontSize: '1.05rem' }}>{form.id ? 'Modifier' : 'Ajouter une structure'}</h2>
          <form onSubmit={enregistrer}>
            <div className="form-row">
              <label>Structure (nom complet)</label>
              <input value={form.structure} onChange={(e) => majChamp('structure', e.target.value)} required />
            </div>
            <div className="form-row">
              <label>Rôle / examens concernés <span className="optionnel">(optionnel)</span></label>
              <input value={form.role} onChange={(e) => majChamp('role', e.target.value)} placeholder="ex: BEPC, BAC, BAC pro, CAP, BEP" />
            </div>
            <div className="form-row">
              <label>Contact <span className="optionnel">(optionnel)</span></label>
              <input value={form.contact} onChange={(e) => majChamp('contact', e.target.value)} placeholder="Adresse, téléphone, site web…" />
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
          <h2 style={{ fontSize: '1.05rem' }}>Structures enregistrées ({lignes.length})</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="tableau-simple" style={{ fontSize: '0.82rem' }}>
              <thead>
                <tr><th>Structure</th><th>Rôle</th><th>Contact</th><th></th></tr>
              </thead>
              <tbody>
                {lignes.map((l) => (
                  <tr key={l.id}>
                    <td>{l.structure}</td>
                    <td>{l.role || '—'}</td>
                    <td>{l.contact || '—'}</td>
                    <td style={{ display: 'flex', gap: 10 }}>
                      <button type="button" onClick={() => modifier(l)} style={{ color: 'var(--vert)', border: 'none', background: 'none', cursor: 'pointer' }}>Modifier</button>
                      <button type="button" onClick={() => supprimer(l.id)} style={{ color: 'var(--rouge-statut)', border: 'none', background: 'none', cursor: 'pointer' }}>Supprimer</button>
                    </td>
                  </tr>
                ))}
                {lignes.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--texte-clair)', padding: 20 }}>Aucune structure enregistrée.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
