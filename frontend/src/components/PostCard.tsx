import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Content } from '../types';
import { contentApi } from '../api/content';
import { useAuth } from '../context/AuthContext';

interface Props {
  post: Content;
  onChanged?: (post: Content) => void;
}

export default function PostCard({ post, onChanged }: Props) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likeCount);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLikes(post.likeCount);
  }, [post.likeCount]);

  useEffect(() => {
    if (!user) return;
    contentApi
      .isLiked(post.id)
      .then(setLiked)
      .catch(() => setLiked(false));
  }, [user, post.id]);

  const handleLike = async () => {
    if (!user || busy) return;
    setBusy(true);
    try {
      if (liked) {
        await contentApi.unlike(post.id);
      } else {
        await contentApi.like(post.id);
      }
      const next = !liked;
      setLiked(next);
      setLikes((c) => c + (next ? 1 : -1));
      onChanged?.({ ...post, likeCount: likes + (next ? 1 : -1) });
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="card">
      <header className="card-header">
        <Link to={`/profile/${post.author.id}`} className="author">
          {post.author.username}
          <span className="login">@{post.author.login}</span>
        </Link>
        {post.author.role && <span className="badge">{post.author.role}</span>}
      </header>
      <Link to={`/post/${post.id}`} className="card-text">
        {post.text}
      </Link>
      <footer className="card-actions">
        <button
          className={`btn btn-ghost ${liked ? 'liked' : ''}`}
          onClick={handleLike}
          disabled={!user || busy}
          title={user ? '' : 'Нужно войти'}
        >
          ♥ {likes}
        </button>
        <Link to={`/post/${post.id}`} className="btn btn-ghost">
          💬 {post.repliesCount}
        </Link>
      </footer>
    </article>
  );
}
