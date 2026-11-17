import type { PageMeta } from '../types';

interface Props {
  meta: PageMeta;
  onPage: (page: number) => void;
}

export default function Pagination({ meta, onPage }: Props) {
  if (meta.totalPages <= 1) return null;
  return (
    <div className="pagination">
      <button
        className="btn btn-outline"
        disabled={meta.currentPage <= 1}
        onClick={() => onPage(meta.currentPage - 1)}
      >
        ← Назад
      </button>
      <span className="hint">
        Стр. {meta.currentPage} из {meta.totalPages} ({meta.totalItems} записей)
      </span>
      <button
        className="btn btn-outline"
        disabled={meta.currentPage >= meta.totalPages}
        onClick={() => onPage(meta.currentPage + 1)}
      >
        Вперёд →
      </button>
    </div>
  );
}
