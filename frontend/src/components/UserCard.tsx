import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { UserProfile } from '../types';
import { userApi } from '../api/user';
import { useAuth } from '../context/AuthContext';

interface Props {
  profile: UserProfile;
  /** Кнопка действия справа (например, «Подписаться») */
  action?: ReactNode;
}

export default function UserCard({ profile, action }: Props) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [followers, setFollowers] = useState(profile.followersCount);
  const [following, setFollowing] = useState(profile.followingCount);
  const [isFollowing, setIsFollowing] = useState(false);
  const isSelf = user?.id === profile.id;

  const handleToggleFollow = async () => {
    if (!user || busy || isSelf) return;
    setBusy(true);
    try {
      if (isFollowing) {
        await userApi.unfollow(profile.id);
        setFollowers((c) => c - 1);
        if (user) setFollowing((c) => c - 1);
        setIsFollowing(false);
      } else {
        await userApi.follow(profile.id);
        setFollowers((c) => c + 1);
        if (user) setFollowing((c) => c + 1);
        setIsFollowing(true);
      }
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="card user-card">
      <div className="user-card-main">
        <Link to={`/profile/${profile.id}`} className="author">
          {profile.username}
          <span className="login">@{profile.login}</span>
        </Link>
        {profile.role && <span className="badge">{profile.role}</span>}
        <div className="user-stats hint">
          <span>Подписки: {following}</span>
          <span>Подписчики: {followers}</span>
        </div>
      </div>
      {action ??
        (user && !isSelf ? (
          <button
            className={`btn ${isFollowing ? 'btn-outline' : 'btn-primary'}`}
            onClick={handleToggleFollow}
            disabled={busy}
          >
            {isFollowing ? 'Отписаться' : 'Подписаться'}
          </button>
        ) : null)}
    </article>
  );
}
