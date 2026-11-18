import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { contentApi } from '../api/content';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import { useAuth } from '../context/AuthContext';
import type { Content, PageMeta } from '../types';

const LIMIT = 20;

export default function PostPage() {
  const { postId } = useParams<{ postId: string }>();
  const { user } = useAuth();
  const [post, setPost] = useState<Content | null>(null);
  const [replies, setReplies] = useState<Content[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    void loadPost(postId);
  }, [postId]);

	const loadPost = useCallback(async (id?: string)=>{
		if (!id) return;
		setLoading(true);
		try {
		  const res = await contentApi.getById(id);
		  setPost(res);
		} catch {
		  setError('Запись не найдена.')
		} finally {
		  setLoading(false);
		}
	}, [postId])

  const loadReplies = useCallback(async (p: number) => {
    if (!postId) return;
    setLoading(true);
    try {
      const res = await contentApi.replies(postId, { page: p, limit: LIMIT });
      setReplies(res.data ? res.data : []);
      setMeta(res.meta);
    } catch {
      /* replies may be empty */
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    void loadReplies(page);
  }, [page, loadReplies]);

  const submitReply = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !postId) return;
    try {
      const created = await contentApi.reply(trimmed, postId);
      setText('');
      setReplies((prev) => [created, ...prev]);
      if (post) setPost({ ...post, repliesCount: post.repliesCount + 1 });
    } catch {
      setError('Не удалось отправить ответ.');
    }
  };

  if (!post) {
    return loading || error ? (
      <p className={error ? 'error' : 'hint'}>{error || 'Загрузка…'}</p>
    ) : (
      <p className="hint">Загрузка…</p>
    );
  }

  return (
    <div className="feed">
      <Link to="/" className="back-link">← В ленту</Link>
      <PostCard post={post} onChanged={setPost} />

      {user ? (
        <form className="card composer" onSubmit={submitReply}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ваш ответ…"
            rows={2}
            maxLength={500}
          />
          <div className="composer-footer">
            <span className="hint">{text.length}/500</span>
            <button className="btn btn-primary" disabled={!text.trim()}>
              Ответить
            </button>
          </div>
        </form>
      ) : (
        <p className="hint">
          <Link to="/login">Войдите</Link>, чтобы отвечать.
        </p>
      )}

      <h2 className="section-title">Ответы ({post.repliesCount})</h2>
      {loading ? (
        <p className="hint">Загрузка…</p>
      ) : (!replies || replies.length === 0) ? (
        <p className="hint">Ответов пока нет. Будьте первым!</p>
      ) : (
        replies.map((r) => <PostCard key={r.id} post={r} />)
      )}

      {meta && <Pagination meta={meta} onPage={setPage} />}
    </div>
  );
}
