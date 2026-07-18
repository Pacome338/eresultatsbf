import Link from 'next/link';
import { useRouter } from 'next/router';

const ONGLETS = [
  { href: '/admin', label: 'Résultats' },
  { href: '/admin/statistiques', label: 'Statistiques' },
  { href: '/admin/etablissements', label: 'Établissements' },
  { href: '/admin/annuaire', label: 'Annuaire' },
  { href: '/admin/calendrier', label: 'Calendrier' },
];

export default function AdminNav() {
  const router = useRouter();

  async function onDeconnexion() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
  }

  return (
    <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, padding: 16 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {ONGLETS.map((o) => {
          const actif = router.pathname === o.href;
          return (
            <Link
              key={o.href}
              href={o.href}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'none',
                color: actif ? 'var(--blanc)' : 'var(--vert-fonce)',
                background: actif ? 'var(--vert)' : 'var(--fond)',
              }}
            >
              {o.label}
            </Link>
          );
        })}
      </div>
      <button onClick={onDeconnexion} className="btn" style={{ width: 'auto' }}>
        Se déconnecter
      </button>
    </div>
  );
}
