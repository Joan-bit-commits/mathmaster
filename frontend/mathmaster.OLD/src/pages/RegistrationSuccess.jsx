import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

function RegistrationSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_34%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-10 text-slate-950">
      <div className="mx-auto flex w-full max-w-md flex-col rounded-[2rem] border border-slate-200 bg-white/90 p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="mb-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl">✅</div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">MathMaster</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Registration successful</h1>
        </div>

        <p className="mb-6 text-sm leading-6 text-slate-600">
          Your account has been created successfully. You can now log in and start learning.
        </p>

        <Button
          onClick={() => navigate('/login')}
          className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-white hover:bg-slate-800"
        >
          Go to Login
        </Button>

        <Button
          onClick={() => navigate('/dashboard')}
          className="mt-3 w-full rounded-2xl bg-sky-600 px-4 py-3 text-white hover:bg-sky-700"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}

export default RegistrationSuccess;
