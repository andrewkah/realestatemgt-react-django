import { ArrowRight, Building2, FileStack, RefreshCw, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchProperties, getApiErrorMessage } from "@/features/properties/api";
import type { PropertyRecord } from "@/features/properties/types";
import {
  formatCurrency,
  getCategoryLabel,
  getPropertySyncState,
  getStatusLabel,
} from "@/features/properties/utils";
import useAxios from "@/utils/useAxios";

export function Dashboard() {
  const api = useAxios();
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboard(refresh = false) {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const propertyData = await fetchProperties(api);
      setProperties(propertyData);
      setError(null);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const liveListings = properties.filter(
    (property) => property.status === "available",
  ).length;
  const draftListings = properties.filter(
    (property) => property.status === "draft",
  ).length;
  const exportReady = properties.filter(
    (property) => getPropertySyncState(property).exportReady,
  ).length;
  const totalDocuments = properties.reduce(
    (count, property) => count + property.document_count,
    0,
  );

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[1.5rem] border bg-linear-to-br from-white to-emerald-50 shadow-sm dark:from-card dark:to-emerald-950/15">
        <div className="flex flex-col gap-6 px-6 py-8 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div className="space-y-3">
            <Badge variant="secondary">REMS Overview</Badge>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Property operations are now running through one synced workspace.
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-6">
                Monitor listing health, document coverage, and export readiness from
                the same API-backed portfolio that powers the property management
                module.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => void loadDashboard(true)} disabled={isRefreshing}>
              <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button asChild>
              <Link to="/dashboard/properties">
                Open Property Workspace
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {error ? (
        <Card className="border-destructive/40">
          <CardContent className="px-6 py-5 text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="px-6 py-6">
            <p className="text-muted-foreground text-xs uppercase tracking-[0.24em]">
              Portfolio
            </p>
            <p className="mt-3 text-3xl font-semibold">
              {isLoading ? "..." : properties.length}
            </p>
            <p className="text-muted-foreground mt-2 text-sm">
              Total properties being managed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-6 py-6">
            <p className="text-muted-foreground text-xs uppercase tracking-[0.24em]">
              Live Listings
            </p>
            <p className="mt-3 text-3xl font-semibold">{isLoading ? "..." : liveListings}</p>
            <p className="text-muted-foreground mt-2 text-sm">
              Inventory currently marked available
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-6 py-6">
            <p className="text-muted-foreground text-xs uppercase tracking-[0.24em]">
              Draft Queue
            </p>
            <p className="mt-3 text-3xl font-semibold">{isLoading ? "..." : draftListings}</p>
            <p className="text-muted-foreground mt-2 text-sm">
              Listings still being prepared for release
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-6 py-6">
            <p className="text-muted-foreground text-xs uppercase tracking-[0.24em]">
              Export Ready
            </p>
            <p className="mt-3 text-3xl font-semibold">{isLoading ? "..." : exportReady}</p>
            <p className="text-muted-foreground mt-2 text-sm">
              Records ready for manual syndication
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Recent Listings</CardTitle>
            <CardDescription>
              Latest property records coming from the live API.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {properties.slice(0, 5).map((property) => (
              <div
                key={property.id}
                className="flex flex-col gap-3 rounded-2xl border bg-background/80 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{getCategoryLabel(property.category)}</Badge>
                    <Badge variant="outline">{getStatusLabel(property.status)}</Badge>
                  </div>
                  <p className="mt-3 font-semibold">{property.title}</p>
                  <p className="text-muted-foreground text-sm">
                    {property.address}, {property.city}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="font-semibold">{formatCurrency(property.price)}</p>
                  <p className="text-muted-foreground text-sm">
                    {property.document_count} docs linked
                  </p>
                </div>
              </div>
            ))}
            {!isLoading && properties.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No property listings yet. Open the property workspace to create the
                first record.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Automation Snapshot</CardTitle>
            <CardDescription>
              Key signals for the document hub and export pipeline.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <p className="font-medium">Internal sync</p>
                  <p className="text-muted-foreground text-sm">
                    Portfolio metrics and listing actions share the same data source.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                  <FileStack className="size-5" />
                </div>
                <div>
                  <p className="font-medium">Linked documents</p>
                  <p className="text-muted-foreground text-sm">
                    {isLoading ? "..." : totalDocuments} files are attached across the portfolio.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                  <Building2 className="size-5" />
                </div>
                <div>
                  <p className="font-medium">Property workspace</p>
                  <p className="text-muted-foreground text-sm">
                    Create, edit, upload, and export from the same operator surface.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
