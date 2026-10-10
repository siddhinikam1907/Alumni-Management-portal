import { Link } from "react-router-dom";

function Unauthorized() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-indigo-600">403</h1>

        <h2 className="mt-4 text-2xl font-bold text-slate-900">
          Access denied
        </h2>

        <p className="mt-2 text-slate-500">
          You don't have permission to access this page.
        </p>

        <Link
          to="/"
          className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

export default Unauthorized;
