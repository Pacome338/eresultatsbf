import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminNav from '../../components/AdminNav';
import { EXAMENS, SERIES_BAC } from '../../data/contenu';

const SESSIONS = ['2026', '2025', '2024'];

const LIGNE_VIDE = {
  numero_table: '', nom: '', prenom: '', decision: 'admis', moyenne: '',
  mention: '', serie: '', etablissement: '', province: '', region: '',
  erreurs: [],
};

const LABEL_DECISION = {
  admis: 'Admis',
  second_tour: 'Second tour',
  non_admis: 'Non admis',
};

export default function AdminDashboard() {
  const router = useRouter();
  const [pretAAfficher, setPretAAfficher] = useState(false);

  const [examen, setExamen] = useState(EXAMENS[0].code);
  const [session, setSession] = useState(SESSIONS[0]);

  const [lignesPreview, setLignesPreview] = useState([]);
  const [chargementFichier, setChargementFichier] = useState(false);
  const [messageFichier, setMessageFichier] = useState(null);

  const [texteExtraitPDF, setTexteExtraitPDF] = useState('');
  const [chargementPDF, setChargementPDF] = useState(false);

  const [resultatsRecents, setResultatsRecents] = useState([]);
  const [messageImport, setMessageImport] = useState(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  const chargerResultatsRecents = useCallback(async () => {
    const res = await fetch('/api/admin/resultats');
    if (res.status === 401) {
      router.replace('/admin/login');
      return;
    }
    const data = await res.json();
    setResultatsRecents(data.lignes || []);
    setPretAAfficher(true);
  }, [router]);

  useEffect(() => {
    chargerResultatsRecents();
  }, [chargerResultatsRecents]);

  async function onFichierExcel(e) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;

    setChargementFichier(true);
    setMessageFichier(null);
    setLignesPreview([]);

    const formData = new FormData();
    formData.append('fichier', fichier);

    try {
      const res = await fetch('/api/admin/parse-excel', { method: 'POST', body: formData });
      if (res.status === 401) return router.replace('/admin/login');
      const data = await res.json();

      if (!res.ok) {
        setMessageFichier({ type: 'erreur', texte: data.erreur });
      } else {
        setLignesPreview(data.lignes);
        setMessageFichier({
          type: 'ok',
          texte: `${data.lignes.length} ligne(s) lues. Vérifie et corrige avant import.`,
        });
      }
    } catch (err) {
      setMessageFichier({ type: 'erreur', texte: 'Erreur réseau lors de la lecture du fichier.' });
    } finally {
      setChargementFichier(false);
      e.target.value = '';
    }
  }

  async function onFichierPDF(e) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;

    setChargementPDF(true);
    setTexteExtraitPDF('');

    const formData = new FormData();
    formData.append('fichier', fichier);

    try {
      const res = await fetch('/api/admin/extract-pdf', { method: 'POST', body: formData });
      if (res.status === 401) return router.replace('/admin/login');
      const data = await res.json();

      setTexteExtraitPDF(res.ok ? data.texte : `Erreur : ${data.erreur}`);
    } catch (err) {
      setTexteExtraitPDF('Erreur réseau lors de l\'extraction.');
    } finally {
      setChargementPDF(false);
      e.target.value = '';
    }
  }

  function modifierLigne(id, champ, valeur) {
    setLignesPreview((lignes) => lignes.map((l) => (l.id === id ? { ...l, [champ]: valeur } : l)));
  }

  function supprimerLignePreview(id) {
    setLignesPreview((lignes) => lignes.filter((l) => l.id !== id));
  }

  function ajouterLigneManuelle() {
    setLignesPreview((lignes) => [...lignes, { id: Date.now(), ...LIGNE_VIDE }]);
  }

  async function onImporter() {
    setEnvoiEnCours(true);
    setMessageImport(null);

    try {
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examen, session, lignes: lignesPreview }),
      });
      if (res.status === 401) return router.replace('/admin/login');
      const data = await res.json();

      if (!res.ok) {
        setMessageImport({ type: 'erreur', texte: data.erreur });
      } else {
        setMessageImport({
          type: 'ok',
          texte: `${data.inseres} résultat(s) importé(s). ${data.echecs.length} rejeté(s).`,
        });
        setLignesPreview([]);
        chargerResultatsRecents();
      }
    } catch (err) {
      setMessageImport({ type: 'erreur', texte: "Erreur réseau lors de l'import." });
    } finally {
      setEnvoiEnCours(false);
    }
  }

  async function onSupprimerResultat(id) {
    if (!confirm('Supprimer définitivement ce résultat ?')) return;
    await fetch(`/api/admin/resultats?id=${id}`, { method: 'DELETE' });
    chargerResultatsRecents();
  }

  async function onSupprimerLot() {
    if (!confirm(`Supprimer TOUS les résultats ${examen} - session ${session} ? Cette action est irréversible.`)) return;
    const res = await fetch(`/api/admin/resultats?examen=${encodeURIComponent(examen)}&session=${encodeURIComponent(session)}`, { method: 'DELETE' });
    const data = await res.json();
    alert(`${data.supprimes || 0} résultat(s) supprimé(s).`);
    chargerResultatsRecents();
  }

  if (!pretAAfficher) {
    return (
      <div className="container">
        <p style={{ padding: 40 }}>Chargement…</p>
      </div>
    );
  }

  const lignesAvecErreurs = lignesPreview.filter((l) => l.erreurs && l.erreurs.length > 0).length;

  return (
    <>
      <Head>
        <title>Espace admin — eRésultatsbf</title>
      </Head>
      <div className="container">
        <div className="page-title-block">
          <h1>Espace administrateur</h1>
          <p>Import des résultats depuis un fichier Excel/CSV, ou extraction de texte depuis un PDF.</p>
        </div>

        <AdminNav />

        <div className="card">
          <h2 style={{ fontSize: '1.05rem' }}>1. Choisir l&apos;examen et la session du lot</h2>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div className="form-row" style={{ flex: 1, minWidth: 160 }}>
              <label htmlFor="examen-import">Examen</label>
              <select id="examen-import" value={examen} onChange={(e) => setExamen(e.target.value)}>
                {EXAMENS.map((ex) => (
                  <option key={ex.code} value={ex.code}>{ex.label}</option>
                ))}
              </select>
            </div>
            <div className="form-row" style={{ flex: 1, minWidth: 140 }}>
              <label htmlFor="session-import">Session</label>
              <select id="session-import" value={session} onChange={(e) => setSession(e.target.value)}>
                {SESSIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="button"
            onClick={onSupprimerLot}
            style={{
              marginTop: 14, background: 'none', border: '1px solid var(--rouge-statut)',
              color: 'var(--rouge-statut)', borderRadius: 8, padding: '8px 14px',
              fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Supprimer tous les résultats {examen} {session} (en cas de mauvais import)
          </button>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.05rem' }}>2. Importer un fichier Excel / CSV</h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--texte-clair)' }}>
            Colonnes attendues : numero_table, nom, prenom, decision (admis/second_tour/non_admis),
            moyenne, mention, serie, etablissement, province, region.{' '}
            <a href="/modele-import.csv" download>Télécharger le modèle</a>.
          </p>
          <input type="file" accept=".xlsx,.xls,.csv" onChange={onFichierExcel} disabled={chargementFichier} />
          {chargementFichier && <p>Lecture du fichier…</p>}
          {messageFichier && (
            <div className={messageFichier.type === 'erreur' ? 'alerte erreur' : 'mention-legale'}>
              {messageFichier.texte}
            </div>
          )}
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.05rem' }}>Alternative : extraire le texte d&apos;un PDF</h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--texte-clair)' }}>
            L&apos;extraction automatique de <em>tableaux</em> depuis un PDF n&apos;est pas
            fiable (mise en page trop variable selon les structures) — on ne veut pas
            risquer d&apos;introduire des erreurs silencieuses dans des résultats
            d&apos;examens. Ce texte brut sert de référence pour recopier les résultats
            à la main via le bouton &quot;Ajouter une ligne&quot; ci-dessous. Pour un gros
            volume, il est plus sûr de convertir le PDF en Excel avec un outil dédié
            avant de l&apos;importer.
          </p>
          <input type="file" accept="application/pdf" onChange={onFichierPDF} disabled={chargementPDF} />
          {chargementPDF && <p>Extraction en cours…</p>}
          {texteExtraitPDF && (
            <textarea
              readOnly
              value={texteExtraitPDF}
              style={{ width: '100%', height: 200, marginTop: 12, fontFamily: 'monospace', fontSize: '0.8rem', padding: 10 }}
            />
          )}
        </div>

        {lignesPreview.length > 0 && (
          <div className="card">
            <h2 style={{ fontSize: '1.05rem' }}>
              3. Vérifier et corriger ({lignesPreview.length} ligne(s), {lignesAvecErreurs} en erreur)
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--texte-clair)' }}>
              Rappel : "Second tour" pour une moyenne entre 8,00 et 9,99 (résultat pas
              encore final) ; sinon Admis (≥ 10,00) ou Non admis (&lt; 8,00).
            </p>

            <div style={{ overflowX: 'auto' }}>
              <datalist id="series-bac">
                {SERIES_BAC.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
              <table className="tableau-simple" style={{ fontSize: '0.8rem' }}>
                <thead>
                  <tr>
                    <th>N° table</th><th>Nom</th><th>Prénom</th><th>Décision du jury</th>
                    <th>Moyenne</th><th>Mention</th><th>Série</th>
                    <th>Établissement</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {lignesPreview.map((ligne) => (
                    <tr key={ligne.id} style={{ background: ligne.erreurs?.length ? '#fbeceb' : 'transparent' }}>
                      <td><input value={ligne.numero_table} onChange={(e) => modifierLigne(ligne.id, 'numero_table', e.target.value)} style={{ width: 80 }} /></td>
                      <td><input value={ligne.nom} onChange={(e) => modifierLigne(ligne.id, 'nom', e.target.value)} style={{ width: 100 }} /></td>
                      <td><input value={ligne.prenom} onChange={(e) => modifierLigne(ligne.id, 'prenom', e.target.value)} style={{ width: 100 }} /></td>
                      <td>
                        <select value={ligne.decision} onChange={(e) => modifierLigne(ligne.id, 'decision', e.target.value)}>
                          <option value="">—</option>
                          <option value="admis">Admis</option>
                          <option value="second_tour">Second tour</option>
                          <option value="non_admis">Non admis</option>
                        </select>
                      </td>
                      <td><input value={ligne.moyenne} onChange={(e) => modifierLigne(ligne.id, 'moyenne', e.target.value)} style={{ width: 60 }} /></td>
                      <td><input value={ligne.mention} onChange={(e) => modifierLigne(ligne.id, 'mention', e.target.value)} style={{ width: 90 }} /></td>
                      <td>
                        <input
                          value={ligne.serie}
                          onChange={(e) => modifierLigne(ligne.id, 'serie', e.target.value)}
                          list="series-bac"
                          style={{ width: 60 }}
                          placeholder="—"
                        />
                      </td>
                      <td><input value={ligne.etablissement} onChange={(e) => modifierLigne(ligne.id, 'etablissement', e.target.value)} style={{ width: 140 }} /></td>
                      <td>
                        <button type="button" onClick={() => supprimerLignePreview(ligne.id)} style={{ color: 'var(--rouge-statut)', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
              <button type="button" onClick={ajouterLigneManuelle} className="btn" style={{ width: 'auto', background: 'var(--vert)' }}>
                + Ajouter une ligne
              </button>
              <button type="button" onClick={onImporter} className="btn" style={{ width: 'auto' }} disabled={envoiEnCours || lignesAvecErreurs > 0}>
                {envoiEnCours ? 'Import en cours…' : `Importer ces ${lignesPreview.length} ligne(s)`}
              </button>
            </div>
            {lignesAvecErreurs > 0 && (
              <p style={{ fontSize: '0.82rem', color: 'var(--rouge-statut)', marginTop: 8 }}>
                Corrige les lignes en rouge avant de pouvoir importer.
              </p>
            )}

            {messageImport && (
              <div className={messageImport.type === 'erreur' ? 'alerte erreur' : 'mention-legale'} style={{ marginTop: 12 }}>
                {messageImport.texte}
              </div>
            )}
          </div>
        )}

        <div className="card">
          <h2 style={{ fontSize: '1.05rem' }}>Résultats déjà en base (100 derniers)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="tableau-simple" style={{ fontSize: '0.82rem' }}>
              <thead>
                <tr>
                  <th>Examen</th><th>Session</th><th>N° table</th><th>Nom</th><th>Prénom</th><th>Série</th><th>Décision</th><th></th>
                </tr>
              </thead>
              <tbody>
                {resultatsRecents.map((r) => (
                  <tr key={r.id}>
                    <td>{r.examen}</td>
                    <td>{r.session}</td>
                    <td>{r.numero_table}</td>
                    <td>{r.nom}</td>
                    <td>{r.prenom}</td>
                    <td>{r.serie || '—'}</td>
                    <td>{LABEL_DECISION[r.decision] || r.decision}</td>
                    <td>
                      <button type="button" onClick={() => onSupprimerResultat(r.id)} style={{ color: 'var(--rouge-statut)', border: 'none', background: 'none', cursor: 'pointer' }}>
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
                {resultatsRecents.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', color: 'var(--texte-clair)', padding: 20 }}>
                      Aucun résultat en base.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
