import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app">
      <header className="header">
        <Link to="/" className="logo">🐦 Chirp</Link>
        <nav className="nav">
          {user ? (
            <>
              <Link to="/users">Люди</Link>
              <Link to={`/profile/${user.id}`}>@{user.username}</Link>
              <button className="btn btn-outline" onClick={handleLogout}>Выйти</button>
            </>
          ) : (
            <>
              <Link to="/users">Люди</Link>
              <Link to="/login">Войти</Link>
              <Link to="/register" className="btn btn-primary">Регистрация</Link>
            </>
          )}
        </nav>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
