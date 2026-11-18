import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { contentApi } from '../api/content';
import { userApi } from '../api/user';
import PostCard from '../components/PostCard';
import UserCard from '../components/UserCard';
import Pagination from '../components/Pagination';
import { useAuth } from '../context/AuthContext';
import type { Content, PageMeta, UserProfile } from '../types';

const LIMIT = 20;

type Tab = 'posts' | 'followers' | 'followings';

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('posts');

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Content[]>([]);
  const [people, setPeople] = useState<UserProfile[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [busyFollow, setBusyFollow] = useState(false);
  const [followed, setFollowed] = useState(false);

  const isSelf = user?.id === userId;

  // Данные пользователя (user-сервис)
  useEffect(() => {
    if (!userId) return;
    userApi
      .getById(userId)
      .then(setProfile)
      .catch(() => setError('Не удалось загрузить профиль пользователя.'));
  }, [userId]);
  
  
  useEffect(() => {
	if(isSelf) return;
	userApi
      .isFollowing(userId)
      .then(setFollowed)
      .catch(() => setFollowed(false));
  }, [userId]);

  // Записи пользователя (content-сервис)
  const loadPosts = useCallback(async (p: number) => {
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

  // Подписчики / подписки (user-сервис)
  const loadPeople = useCallback(
    async (p: number) => {
      if (!userId) return;
      setLoading(true);
      setError('');
      try {
        const api = tab === 'followers' ? userApi.followers : userApi.followings;
        const res = await api(userId, { page: p, limit: LIMIT });
        setPeople(res.data);
        setMeta(res.meta);
      } catch {
        setError('Не удалось загрузить список.');
      } finally {
        setLoading(false);
      }
    },
    [userId, tab],
  );

  useEffect(() => {
    if (tab === 'posts') void loadPosts(page);
    else void loadPeople(page);
  }, [page, tab, loadPosts, loadPeople]);

  const changeTab = (t: Tab) => {
    setTab(t);
    setPage(1);
  };

  const submitPost = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    try {
      const created = await contentApi.create(trimmed);
      setText('');
      setPosts((prev) => [created, ...prev]);
    } catch {
      setError('Не удалось опубликовать запись.');
    }
  };

  const handleFollowToggle = async () => {
    if (!user || !userId || busyFollow || isSelf) return;
    setBusyFollow(true);
    try {
      if (followed) {
        await userApi.unfollow(userId);
        setProfile((prev) =>
          prev ? { ...prev, followersCount: prev.followersCount - 1 } : prev,
        );
        setFollowed(false);
      } else {
        await userApi.follow(userId);
        setProfile((prev) =>
          prev ? { ...prev, followersCount: prev.followersCount + 1 } : prev,
        );
        setFollowed(true);
      }
    } catch {
      /* ignore */
    } finally {
      setBusyFollow(false);
    }
  };

  return (
    <div className="feed">
      <div className="card profile-header">
        <div className="profile-top">
          <h1>
            {profile ? profile.username : isSelf ? 'Мой профиль' : `Профиль @${userId}`}
            {profile && <span className="login">@{profile.login}</span>}
          </h1>
          {user && !isSelf && (
            <button
              className={`btn ${followed ? 'btn-outline' : 'btn-primary'}`}
              onClick={handleFollowToggle}
              disabled={busyFollow}
            >
              {followed ? 'Отписаться' : 'Подписаться'}
            </button>
          )}
        </div>
        {profile && (
          <div className="profile-stats hint">
            <span>Записей: {tab === 'posts' && meta ? meta.totalItems : '—'}</span>
            <button className="link-btn" onClick={() => changeTab('followings')}>
              Подписки: {profile.followingCount}
            </button>
            <button className="link-btn" onClick={() => changeTab('followers')}>
              Подписчики: {profile.followersCount}
            </button>
          </div>
        )}
        {profile?.role && <span className="badge">{profile.role}</span>}
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'posts' ? 'active' : ''}`} onClick={() => changeTab('posts')}>
          Записи
        </button>
        <button className={`tab ${tab === 'followers' ? 'active' : ''}`} onClick={() => changeTab('followers')}>
          Подписчики
        </button>
        <button className={`tab ${tab === 'followings' ? 'active' : ''}`} onClick={() => changeTab('followings')}>
          Подписки
        </button>
      </div>

      {isSelf && tab === 'posts' && (
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
      ) : tab === 'posts' ? (
        (!posts || posts.length === 0) ? (
          <p className="hint">У пользователя пока нет записей.</p>
        ) : (
          posts.map((p) => <PostCard key={p.id} post={p} />)
        )
      ) : (!people || people.length === 0) ? (
        <p className="hint">
          {tab === 'followers' ? 'Подписчиков пока нет.' : 'Подписок пока нет.'}
        </p>
      ) : (
        people.map((u) => <UserCard key={u.id} profile={u} />)
      )}

      {meta && <Pagination meta={meta} onPage={setPage} />}
    </div>
  );
}
