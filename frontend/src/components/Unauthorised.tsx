import { Link } from "react-router-dom";

const Unauthorised = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-muted-foreground">401</h1>
        <h2 className="text-2xl font-semibold">Unauthorised Access</h2>
        <p className="text-muted-foreground">
          You are not authorised to access this page.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default Unauthorised;
