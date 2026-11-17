import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { contentApi } from '../api/content';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import { useAuth } from '../context/AuthContext';
import type { Content, PageMeta } from '../types';

const LIMIT = 20;

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Content[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [text, setText] = useState('');

  const load = useCallback(async (p: number) => {
    if (!userId) return;
    setLoading(true);
    setError('');
    try {
      const res = await contentApi.byUser(userId, { page: p, limit: LIMIT });
      setPosts(res.data);
      setMeta(res.meta);
    } catch {
      setError('Не удалось загрузить записи пользователя.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load(page);
  }, [page, load]);

  const submitPost = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !userId) return;
    try {
      const created = await contentApi.create(trimmed);
      setText('');
      setPosts((prev) => [created, ...prev]);
    } catch {
      setError('Не удалось опубликовать запись.');
    }
  };

  const isSelf = user?.id === userId;

  return (
    <div className="feed">
      <div className="card profile-header">
        <h1>{isSelf ? 'Мой профиль' : `Профиль @${userId}`}</h1>
      </div>

      {isSelf && (
        <form className="card composer" onSubmit={submitPost}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Что нового?"
            rows={3}
            maxLength={500}
          />
          <div className="composer-footer">
            <Link to="/" className="hint">Лента</Link>
            <button className="btn btn-primary" disabled={!text.trim()}>
              Опубликовать
            </button>
          </div>
        </form>
      )}

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="hint">Загрузка…</p>
      ) : posts.length === 0 ? (
        <p className="hint">У пользователя пока нет записей.</p>
      ) : (
        posts.map((p) => <PostCard key={p.id} post={p} />)
      )}

      {meta && <Pagination meta={meta} onPage={setPage} />}
    </div>
  );
}
