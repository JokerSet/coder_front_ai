import { useCallback, useEffect, useState } from 'react';
import { userApi } from '../api/user';
import UserCard from '../components/UserCard';
import Pagination from '../components/Pagination';
import type { PageMeta, UserProfile } from '../types';

const LIMIT = 20;

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError('');
    try {
      const res = await userApi.list({ page: p, limit: LIMIT });
      setUsers(res.data);
      setMeta(res.meta);
    } catch {
      setError('Не удалось загрузить список пользователей. Убедитесь, что API-сервер запущен.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(page);
  }, [page, load]);

  return (
    <div className="feed">
      <h1 className="section-title">Пользователи</h1>
      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="hint">Загрузка…</p>
      ) : users.length === 0 ? (
        <p className="hint">Пользователей пока нет.</p>
      ) : (
        users.map((u) => <UserCard key={u.id} profile={u} />)
      )}
      {meta && <Pagination meta={meta} onPage={setPage} />}
    </div>
  );
}
