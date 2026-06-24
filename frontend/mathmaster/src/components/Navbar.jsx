import { useNavigate } from 'react-router-dom';

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
    navigate('/login');
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-indigo-600 text-white shadow-lg">
      <div className="flex items-center gap-3">
        <div className="bg-white rounded-full p-2">
          <h1 className="text-xl font-bold text-indigo-600">MM</h1>
        </div>
        <h1 className="text-2xl font-bold">MathMaster</h1>
      </div>
      <div className="flex items-center gap-4">
        {isLoggedIn || localStorage.getItem('access_token') ? (
          <>
            <div className="text-sm">
              <p className="font-semibold">{username}</p>
              <p className="text-indigo-200 capitalize">{role}</p>
            </div>
            <button
              onClick={handleLogoutClick}
              className="px-4 py-2 rounded-lg bg-white text-indigo-600 font-semibold hover:bg-indigo-100 transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <Button onClick={() => navigate('/login')}>Log In</Button>
        )}
      </div>
    </nav>
  );
};

export default NavbarComponent;