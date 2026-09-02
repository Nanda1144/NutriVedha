import React from 'react';
import { Search } from 'lucide-react';

interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  onSearch?: (q: string) => void;
  loading?: boolean;
  error?: string | null;
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptyDesc?: string;
}

function DataTable<T extends { id: string }>({ columns, data, searchPlaceholder, onSearch, loading, error, emptyIcon, emptyTitle, emptyDesc }: DataTableProps<T>) {
  const [q, setQ] = React.useState('');
  return (
    <div>
      {searchPlaceholder && (
        <div className="glass-card" style={{ padding: '0.8rem 1rem', display: 'flex', gap: '0.8rem', alignItems: 'center', marginBottom: '1rem' }}>
          <Search size={18} className="text-muted" />
          <input aria-label="Search table" placeholder={searchPlaceholder} value={q} onChange={e => { setQ(e.target.value); onSearch?.(e.target.value); }} style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent' }} />
        </div>
      )}
      {loading && <div className="loading-state"><div className="spinner" /><p>Loading…</p></div>}
      {error && <div className="glass-card" style={{ padding: '0.8rem', borderLeft: '3px solid #ef4444' }}>{error}</div>}
      <div className="table-responsive" style={{ overflowX: 'auto' }}>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{columns.map(c => <th key={c.key} style={{ textAlign: 'left', padding: '0.6rem', fontSize: '0.85rem', borderBottom: '1px solid var(--border)' }}>{c.header}</th>)}</tr>
          </thead>
          <tbody>
            {data.length === 0 && !loading ? (
              <tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem' }}>{emptyIcon}<p><strong>{emptyTitle || 'No data'}</strong></p><p className="hint-text">{emptyDesc}</p></td></tr>
            ) : data.map(row => <tr key={row.id}>{columns.map(c => <td key={c.key} style={{ padding: '0.6rem', borderBottom: '1px solid var(--border)' }}>{c.render(row)}</td>)}</tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
