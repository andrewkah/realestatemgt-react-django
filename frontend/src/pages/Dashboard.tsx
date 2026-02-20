export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your real estate management dashboard
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Total Properties</h3>
          <p className="text-2xl font-bold">24</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Active Listings</h3>
          <p className="text-2xl font-bold">18</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Clients</h3>
          <p className="text-2xl font-bold">42</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Revenue</h3>
          <p className="text-2xl font-bold">$125K</p>
        </div>
      </div>
    </div>
  );
}
