import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminNav from '../../components/AdminNav';
import { EXAMENS, REGIONS } from '../../data/contenu';

const LIGNE_VIDE = {
  id: null, examen: EXAMENS[0].code, session: '2026', portee: 'national',
  region: '', zone: '', candidats: '', admis: '', taux: '', note: '',
};

export default function AdminStatistiques() {
  const router = useRouter();
  const [pretAAfficher, setPretAAfficher] = useState(false);
  const [lignes, setLignes] = useState([]);
  const [form, setForm] = useState(LIGNE_VIDE);
  const [message, setMessage] = useState(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  const charger = useCallback(async () => {
    const res = await fetch('/api/admin/statistiques');
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
    setForm({
      id: ligne.id, examen: ligne.examen, session: ligne.session, portee: ligne.portee,
      region: ligne.region || '', zone: ligne.zone || '', candidats: ligne.candidats ?? '',
      admis: ligne.admis ?? '', taux: ligne.taux ?? '', note: ligne.note || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function annulerEdition() {
    setForm(LIGNE_VIDE);
  }

  async function enregistrer(e) {
    e.preventDefault();
    setEnvoiEnCours(true);
    setMessage(null);

    const methode = form.id ? 'PUT' : 'POST';
    try {
      const res = await fetch('/api/admin/statistiques', {
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
    if (!confirm('Supprimer cette ligne de statistique ?')) return;
    await fetch(`/api/admin/statistiques?id=${id}`, { method: 'DELETE' });
    charger();
  }

  if (!pretAAfficher) {
    return <div className="container"><p style={{ padding: 40 }}>Chargement…</p></div>;
  }

  return (
    <>
      <Head><title>Statistiques — Admin eRésultatsbf</title></Head>
      <div className="container">
        <div className="page-title-block">
          <h1>Statistiques</h1>
          <p>Gérer les taux de réussite affichés sur la page publique /statistiques.</p>
        </div>

        <AdminNav />

        <div className="card">
          <h2 style={{ fontSize: '1.05rem' }}>{form.id ? 'Modifier une ligne' : 'Ajouter une ligne'}</h2>
          <form onSubmit={enregistrer}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div className="form-row" style={{ minWidth: 160 }}>
                <label>Examen</label>
                <select value={form.examen} onChange={(e) => majChamp('examen', e.target.value)}>
                  {EXAMENS.map((ex) => <option key={ex.code} value={ex.label}>{ex.label}</option>)}
                </select>
              </div>
              <div className="form-row" style={{ minWidth: 120 }}>
                <label>Session</label>
                <input value={form.session} onChange={(e) => majChamp('session', e.target.value)} />
              </div>
              <div className="form-row" style={{ minWidth: 140 }}>
                <label>Portée</label>
                <select value={form.portee} onChange={(e) => majChamp('portee', e.target.value)}>
                  <option value="national">National</option>
                  <option value="region">Région</option>
                </select>
              </div>
              {form.portee === 'region' && (
                <div className="form-row" style={{ minWidth: 160 }}>
                  <label>Région</label>
                  <select value={form.region} onChange={(e) => majChamp('region', e.target.value)}>
                    <option value="">Sélectionner</option>
                    {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              )}
              <div className="form-row" style={{ minWidth: 160 }}>
                <label>Zone / précision <span className="optionnel">(optionnel)</span></label>
                <input value={form.zone} onChange={(e) => majChamp('zone', e.target.value)} placeholder="ex: ex-Hauts-Bassins" />
              </div>
              <div className="form-row" style={{ minWidth: 120 }}>
                <label>Candidats <span className="optionnel">(optionnel)</span></label>
                <input value={form.candidats} onChange={(e) => majChamp('candidats', e.target.value)} />
              </div>
              <div className="form-row" style={{ minWidth: 120 }}>
                <label>Admis <span className="optionnel">(optionnel)</span></label>
                <input value={form.admis} onChange={(e) => majChamp('admis', e.target.value)} />
              </div>
              <div className="form-row" style={{ minWidth: 100 }}>
                <label>Taux (%)</label>
                <input value={form.taux} onChange={(e) => majChamp('taux', e.target.value)} />
              </div>
              <div className="form-row" style={{ flex: 1, minWidth: 200 }}>
                <label>Note <span className="optionnel">(optionnel)</span></label>
                <input value={form.note} onChange={(e) => majChamp('note', e.target.value)} placeholder="ex: 1er tour uniquement" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn" style={{ width: 'auto' }} disabled={envoiEnCours}>
                {form.id ? 'Mettre à jour' : 'Ajouter'}
              </button>
              {form.id && (
                <button type="button" onClick={annulerEdition} className="btn" style={{ width: 'auto', background: 'var(--texte-clair)' }}>
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
                <tr>
                  <th>Examen</th><th>Session</th><th>Portée</th><th>Région</th><th>Taux</th><th></th>
                </tr>
              </thead>
              <tbody>
                {lignes.map((l) => (
                  <tr key={l.id}>
                    <td>{l.examen}</td>
                    <td>{l.session}</td>
                    <td>{l.portee}</td>
                    <td>{l.region || '—'}</td>
                    <td>{l.taux != null ? `${l.taux}%` : '—'}</td>
                    <td style={{ display: 'flex', gap: 10 }}>
                      <button type="button" onClick={() => modifier(l)} style={{ color: 'var(--vert)', border: 'none', background: 'none', cursor: 'pointer' }}>Modifier</button>
                      <button type="button" onClick={() => supprimer(l.id)} style={{ color: 'var(--rouge-statut)', border: 'none', background: 'none', cursor: 'pointer' }}>Supprimer</button>
                    </td>
                  </tr>
                ))}
                {lignes.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--texte-clair)', padding: 20 }}>Aucune ligne.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
