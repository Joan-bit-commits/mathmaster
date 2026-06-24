import { useNavigate } from 'react-router-dom';

function RegistrationSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-slate-200 p-8 text-center">
        <div className="mb-6">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-4xl font-bold text-indigo-600 mb-2">MathMaster</h1>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Registration Successful!</h2>
        </div>

        <p className="text-slate-600 mb-6">
          Your account has been created successfully. You can now log in and start learning.
        </p>

        <button
          onClick={() => navigate('/login')}
          className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-white font-semibold shadow-sm hover:bg-indigo-700 transition-colors mb-3"
        >
          Go to Login
        </button>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full rounded-2xl bg-green-600 px-4 py-3 text-white font-semibold shadow-sm hover:bg-green-700 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

export default RegistrationSuccess;
