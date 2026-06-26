import { useNavigate } from 'react-router-dom';
import Button from './Button';

const NavbarComponent = ({ isLoggedIn, handleLogout }) => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');

  const handleLogoutClick = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    if (typeof handleLogout === 'function') {
      handleLogout();
    }
    navigate('/login');
  };

  const authenticated = isLoggedIn || localStorage.getItem('access_token');

  return (
    <nav className="sticky top-0 z-50 border-b border-sky-100/70 bg-[rgba(248,250,252,0.92)] text-slate-950 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-3 text-left"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-950 via-sky-700 to-cyan-500 text-sm font-black text-white shadow-lg shadow-sky-500/20">
            MM
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-sky-700">MathMaster</p>
            <h1 className="text-lg font-semibold text-slate-950">Learn faster, master more</h1>
          </div>
        </button>

        <div className="flex items-center gap-3 sm:gap-4">
          {authenticated ? (
            <>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-slate-950">{username || 'Learner'}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{role || 'student'}</p>
              </div>
              <Button variant="secondary" onClick={handleLogoutClick}>
                Logout
              </Button>
            </>
          ) : (
            <Button onClick={() => navigate('/login')}>Log in</Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavbarComponent;