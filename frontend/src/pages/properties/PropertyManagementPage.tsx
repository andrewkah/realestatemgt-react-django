import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowUpRight,
  Building2,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  LoaderCircle,
  MapPin,
  PencilLine,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createAmenity,
  createProperty,
  deleteProperty,
  deletePropertyDocument,
  fetchAmenities,
  fetchProperties,
  getApiErrorMessage,
  updateProperty,
  updatePropertyDocument,
  uploadPropertyDocuments,
} from "@/features/properties/api";
import type {
  Amenity,
  PropertyDocument,
  PropertyFormValues,
  PropertyRecord,
  PropertyUploadDraft,
} from "@/features/properties/types";
import {
  buildPropertyPayload,
  downloadBlob,
  emptyPropertyFormValues,
  formatCurrency,
  formatDateTime,
  getCategoryLabel,
  getPrimaryImageUrl,
  getPropertySyncState,
  getStatusLabel,
  mapPropertyToFormValues,
  propertyCategoryOptions,
  propertyStatusOptions,
  toCsv,
} from "@/features/properties/utils";
import useAxios from "@/utils/useAxios";

const propertyFormSchema = z
  .object({
    title: z.string().trim().min(3, "A property title is required."),
    description: z
      .string()
      .trim()
      .min(24, "Add a fuller property description for marketing and ops."),
    category: z.enum(["RENT", "SALE", "LEASE"]),
    status: z.enum([
      "draft",
      "pending_review",
      "available",
      "under_offer",
      "rented",
      "sold",
      "under_maintenance",
      "delisted",
    ]),
    address: z.string().trim().min(4, "The street address is required."),
    city: z.string().trim().min(2, "City is required."),
    state: z.string(),
    zip_code: z.string(),
    country: z.string().trim().min(2, "Country is required."),
    longitude: z.string(),
    latitude: z.string(),
    price: z.string().trim().min(1, "Price is required."),
    rent_amount: z.string(),
    deposit: z.string(),
    bedrooms: z.string(),
    bathrooms: z.string(),
    square_footage: z.string(),
    year_built: z.string(),
    amenity_ids: z.array(z.number()),
  })
  .superRefine((values, context) => {
    if (values.category === "RENT" && !values.rent_amount.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rent_amount"],
        message: "Rental properties need a rent amount.",
      });
    }
  });

const shellInputClassName =
  "border-input bg-background/70 focus-visible:border-ring focus-visible:ring-ring/50 rounded-md border px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]";

type CategoryFilter = "ALL" | PropertyFormValues["category"];
type StatusFilter = "ALL" | PropertyFormValues["status"];

function PortfolioStat({
  label,
  value,
  note,
}: {
  label: string;
  value: string | number;
  note: string;
}) {
  return (
    <Card className="border-white/50 bg-white/80 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
      <CardContent className="space-y-1 px-5 py-5">
        <p className="text-muted-foreground text-xs uppercase tracking-[0.24em]">
          {label}
        </p>
        <p className="text-3xl font-semibold">{value}</p>
        <p className="text-muted-foreground text-sm">{note}</p>
      </CardContent>
    </Card>
  );
}

function PropertyCard({
  property,
  isActive,
  isDeleting,
  onEdit,
  onExport,
  onDelete,
}: {
  property: PropertyRecord;
  isActive: boolean;
  isDeleting: boolean;
  onEdit: () => void;
  onExport: () => void;
  onDelete: () => void;
}) {
  const syncState = getPropertySyncState(property);
  const imageUrl = getPrimaryImageUrl(property);

  return (
    <Card
      className={`overflow-hidden border transition-all ${
        isActive
          ? "border-primary shadow-lg shadow-primary/10"
          : "border-border/70 shadow-sm"
      }`}
    >
      <div className="grid gap-0 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div
          className="relative min-h-52 bg-linear-to-br from-emerald-500 via-teal-600 to-slate-900"
          style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
        >
          <div className="absolute inset-0 bg-black/10" />
          {!imageUrl ? (
            <div className="absolute inset-0 flex flex-col justify-between p-5 text-white">
              <Badge className="w-fit bg-white/20 text-white backdrop-blur">
                REMS Property
              </Badge>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/75">
                  {getCategoryLabel(property.category)}
                </p>
                <p className="mt-2 text-2xl font-semibold">{property.city}</p>
              </div>
            </div>
          ) : (
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 via-black/20 to-transparent p-5 text-white">
              <p className="text-xs uppercase tracking-[0.26em] text-white/75">
                {property.city}
              </p>
              <p className="mt-2 text-xl font-semibold">{property.title}</p>
            </div>
          )}
        </div>

        <CardContent className="space-y-5 px-5 py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge>{getCategoryLabel(property.category)}</Badge>
                <Badge variant="outline">{getStatusLabel(property.status)}</Badge>
                <Badge variant={syncState.exportReady ? "default" : "secondary"}>
                  {syncState.label}
                </Badge>
              </div>
              <div>
                <h3 className="text-xl font-semibold">{property.title}</h3>
                <p className="text-muted-foreground flex items-center gap-2 text-sm">
                  <MapPin className="size-4" />
                  {property.address}, {property.city}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-xs uppercase tracking-[0.24em]">
                Listing Price
              </p>
              <p className="text-2xl font-semibold">{formatCurrency(property.price)}</p>
              {property.rent_amount ? (
                <p className="text-muted-foreground text-sm">
                  Rent {formatCurrency(property.rent_amount)} / month
                </p>
              ) : null}
            </div>
          </div>

          <p className="text-muted-foreground line-clamp-3 text-sm leading-6">
            {property.description}
          </p>

          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-lg border bg-muted/40 px-3 py-3">
              <p className="text-muted-foreground text-xs uppercase tracking-[0.22em]">
                Beds / Baths
              </p>
              <p className="mt-2 font-semibold">
                {property.bedrooms ?? "-"} / {property.bathrooms ?? "-"}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/40 px-3 py-3">
              <p className="text-muted-foreground text-xs uppercase tracking-[0.22em]">
                Media
              </p>
              <p className="mt-2 font-semibold">
                {property.image_count} photos / {property.document_count} docs
              </p>
            </div>
            <div className="rounded-lg border bg-muted/40 px-3 py-3">
              <p className="text-muted-foreground text-xs uppercase tracking-[0.22em]">
                Amenities
              </p>
              <p className="mt-2 font-semibold">{property.amenities.length}</p>
            </div>
            <div className="rounded-lg border bg-muted/40 px-3 py-3">
              <p className="text-muted-foreground text-xs uppercase tracking-[0.22em]">
                Last Updated
              </p>
              <p className="mt-2 font-semibold">
                {new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  day: "numeric",
                }).format(new Date(property.updated_at))}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {property.amenities.slice(0, 4).map((amenity) => (
              <Badge key={amenity.id} variant="secondary">
                {amenity.name}
              </Badge>
            ))}
            {property.amenities.length > 4 ? (
              <Badge variant="outline">
                +{property.amenities.length - 4} more amenities
              </Badge>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={onEdit}>
              <PencilLine className="size-4" />
              Edit Listing
            </Button>
            <Button variant="outline" onClick={onExport}>
              <ArrowUpRight className="size-4" />
              Export JSON
            </Button>
            <Button variant="ghost" onClick={onDelete} disabled={isDeleting}>
              {isDeleting ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Archive
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

function DocumentRow({
  document,
  value,
  isBusy,
  onChange,
  onSave,
  onDelete,
}: {
  document: PropertyDocument;
  value: string;
  isBusy: boolean;
  onChange: (value: string) => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-xl border bg-background/80 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant={document.is_photo ? "default" : "secondary"}>
              {document.is_photo ? "Image" : document.file_type || "Document"}
            </Badge>
            <a
              className="text-sm font-medium underline-offset-4 hover:underline"
              href={document.file_url}
              rel="noreferrer"
              target="_blank"
            >
              {document.file_name}
            </a>
          </div>
          <p className="text-muted-foreground mt-2 text-xs">
            Added {formatDateTime(document.created_at)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onSave} disabled={isBusy}>
            {isBusy ? <LoaderCircle className="size-4 animate-spin" /> : "Save"}
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} disabled={isBusy}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
      <Input
        className="mt-3"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export function PropertyManagementPage() {
  const api = useAxios();
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingAmenity, setIsCreatingAmenity] = useState(false);
  const [busyDocumentId, setBusyDocumentId] = useState<number | null>(null);
  const [deletingPropertyId, setDeletingPropertyId] = useState<number | null>(
    null,
  );
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(
    null,
  );
  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const [newAmenityName, setNewAmenityName] = useState("");
  const [newAmenityDescription, setNewAmenityDescription] = useState("");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [pendingUploads, setPendingUploads] = useState<PropertyUploadDraft[]>([]);
  const [documentDrafts, setDocumentDrafts] = useState<Record<number, string>>({});

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: emptyPropertyFormValues,
  });

  const selectedProperty =
    properties.find((property) => property.id === selectedPropertyId) ?? null;
  const activeCategory = form.watch("category");

  const propertyCount = properties.length;
  const liveListingCount = properties.filter(
    (property) => property.status === "available",
  ).length;
  const rentCount = properties.filter(
    (property) => property.category === "RENT",
  ).length;
  const exportReadyCount = properties.filter(
    (property) => getPropertySyncState(property).exportReady,
  ).length;

  const filteredProperties = properties.filter((property) => {
    const query = deferredSearch.trim().toLowerCase();
    const matchesQuery =
      !query ||
      [
        property.title,
        property.city,
        property.address,
        property.description,
        property.category,
        property.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    const matchesCategory =
      categoryFilter === "ALL" || property.category === categoryFilter;
    const matchesStatus =
      statusFilter === "ALL" || property.status === statusFilter;
    return matchesQuery && matchesCategory && matchesStatus;
  });

  function resetComposer() {
    startTransition(() => {
      setSelectedPropertyId(null);
    });
    form.reset(emptyPropertyFormValues);
    setPendingUploads([]);
    setDocumentDrafts({});
    setPortfolioError(null);
  }

  function openProperty(property: PropertyRecord) {
    startTransition(() => {
      setSelectedPropertyId(property.id);
    });
    form.reset(mapPropertyToFormValues(property));
    setPendingUploads([]);
    setDocumentDrafts(
      Object.fromEntries(
        property.documents.map((document) => [document.id, document.description]),
      ),
    );
    setPortfolioError(null);
  }

  async function loadPortfolio(options?: {
    quiet?: boolean;
    nextSelectedId?: number | null;
  }) {
    if (options?.quiet) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const [propertyData, amenityData] = await Promise.all([
        fetchProperties(api),
        fetchAmenities(api),
      ]);

      setProperties(propertyData);
      setAmenities(amenityData);

      const nextSelectedId = options?.nextSelectedId ?? selectedPropertyId;
      if (nextSelectedId) {
        const nextProperty =
          propertyData.find((property) => property.id === nextSelectedId) ?? null;
        if (nextProperty) {
          openProperty(nextProperty);
        } else {
          resetComposer();
        }
      }

      if (!nextSelectedId && !selectedPropertyId && propertyData.length === 0) {
        form.reset(emptyPropertyFormValues);
      }

      setPortfolioError(null);
    } catch (error) {
      setPortfolioError(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    void loadPortfolio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(values: PropertyFormValues) {
    setIsSaving(true);
    setPortfolioError(null);

    try {
      const payload = buildPropertyPayload(values);
      const savedProperty = selectedProperty
        ? await updateProperty(api, selectedProperty.id, payload)
        : await createProperty(api, payload);

      if (pendingUploads.length > 0) {
        await uploadPropertyDocuments(api, savedProperty.id, pendingUploads);
      }

      await loadPortfolio({ quiet: true, nextSelectedId: savedProperty.id });
      setPendingUploads([]);
      toast.success(
        selectedProperty
          ? "Property listing updated."
          : "Property listing created.",
      );
    } catch (error) {
      const message = getApiErrorMessage(error);
      setPortfolioError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRefresh() {
    await loadPortfolio({ quiet: true, nextSelectedId: selectedPropertyId });
  }

  async function handleCreateAmenity() {
    if (!newAmenityName.trim()) {
      toast.error("Add an amenity name first.");
      return;
    }

    setIsCreatingAmenity(true);
    try {
      const amenity = await createAmenity(api, {
        name: newAmenityName.trim(),
        description: newAmenityDescription.trim(),
      });

      setAmenities((currentAmenities) =>
        [...currentAmenities, amenity].sort((left, right) =>
          left.name.localeCompare(right.name),
        ),
      );
      form.setValue("amenity_ids", [
        ...new Set([...form.getValues("amenity_ids"), amenity.id]),
      ]);
      setNewAmenityName("");
      setNewAmenityDescription("");
      toast.success("Amenity created and selected.");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsCreatingAmenity(false);
    }
  }

  async function handleDeleteProperty(propertyId: number) {
    if (!window.confirm("Archive this property listing and remove it from REMS?")) {
      return;
    }

    setDeletingPropertyId(propertyId);
    try {
      await deleteProperty(api, propertyId);
      await loadPortfolio({
        quiet: true,
        nextSelectedId: selectedPropertyId === propertyId ? null : selectedPropertyId,
      });
      if (selectedPropertyId === propertyId) {
        resetComposer();
      }
      toast.success("Property archived.");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setDeletingPropertyId(null);
    }
  }

  async function handleDocumentSave(documentId: number) {
    const nextDescription = documentDrafts[documentId] ?? "";
    setBusyDocumentId(documentId);
    try {
      await updatePropertyDocument(api, documentId, nextDescription);
      await loadPortfolio({ quiet: true, nextSelectedId: selectedPropertyId });
      toast.success("Document details updated.");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setBusyDocumentId(null);
    }
  }

  async function handleDocumentDelete(documentId: number) {
    if (!window.confirm("Delete this document from the property record?")) {
      return;
    }

    setBusyDocumentId(documentId);
    try {
      await deletePropertyDocument(api, documentId);
      await loadPortfolio({ quiet: true, nextSelectedId: selectedPropertyId });
      toast.success("Document removed.");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setBusyDocumentId(null);
    }
  }

  function handleAmenityToggle(amenityId: number, checked: boolean) {
    const currentAmenityIds = form.getValues("amenity_ids");
    const nextAmenityIds = checked
      ? [...new Set([...currentAmenityIds, amenityId])]
      : currentAmenityIds.filter((currentAmenityId) => currentAmenityId !== amenityId);
    form.setValue("amenity_ids", nextAmenityIds, { shouldValidate: true });
  }

  function handleFileSelection(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) {
      return;
    }

    const nextUploads = Array.from(fileList).map((file) => ({
      id: crypto.randomUUID(),
      file,
      description: file.name,
    }));

    setPendingUploads((currentUploads) => [...currentUploads, ...nextUploads]);
  }

  function handleExportJson(propertySet: PropertyRecord[], scope: string) {
    downloadBlob(
      JSON.stringify(propertySet, null, 2),
      `rems-${scope}-${new Date().toISOString().slice(0, 10)}.json`,
      "application/json;charset=utf-8",
    );
    toast.success(`${scope} export is ready for manual syndication.`);
  }

  function handleExportCsv() {
    downloadBlob(
      toCsv(filteredProperties),
      `rems-properties-${new Date().toISOString().slice(0, 10)}.csv`,
      "text/csv;charset=utf-8",
    );
    toast.success("CSV export generated.");
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-full border bg-card px-5 py-3">
          <LoaderCircle className="size-5 animate-spin text-primary" />
          <span>Loading property operations workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[1.75rem] border bg-linear-to-br from-slate-950 via-emerald-950 to-teal-900 text-white shadow-xl">
        <div className="grid gap-8 px-6 py-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)] lg:px-8">
          <div className="space-y-5">
            <Badge className="bg-white/10 text-white backdrop-blur">Property Ops</Badge>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-3xl font-semibold tracking-tight lg:text-5xl">
                Centralize listings, documents, and export-ready property data in
                one REMS workflow.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-white/75 lg:text-base">
                Create and maintain rental, sale, and lease inventory against the
                live property API, keep property documents linked to the record, and
                export clean portfolio snapshots for manual syndication to external
                listing platforms.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <PortfolioStat
                label="Portfolio"
                value={propertyCount}
                note="Total managed properties"
              />
              <PortfolioStat
                label="Live"
                value={liveListingCount}
                note="Listings currently available"
              />
              <PortfolioStat
                label="Rentals"
                value={rentCount}
                note="Rental inventory under management"
              />
              <PortfolioStat
                label="Syndication"
                value={exportReadyCount}
                note="Listings ready to export"
              />
            </div>
          </div>

          <Card className="border-white/10 bg-white/8 text-white shadow-none backdrop-blur">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 p-3">
                  <ShieldCheck className="size-6" />
                </div>
                <div>
                  <CardTitle>Automation Strategy Alignment</CardTitle>
                  <CardDescription className="text-white/70">
                    Internal sync is API-native and export is operator-ready.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-white/80">
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/60">
                  Internal REMS Sync
                </p>
                <p className="mt-2 font-medium text-white">
                  Dashboard, portfolio, and document actions are all reading from the
                  same property API surface.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/60">
                  Manual Syndication Export
                </p>
                <p className="mt-2 font-medium text-white">
                  Export filtered inventory as CSV or JSON whenever an external
                  marketplace handoff is needed.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  className="bg-white text-slate-900 hover:bg-white/90"
                  onClick={handleExportCsv}
                >
                  <FileSpreadsheet className="size-4" />
                  Export Filtered CSV
                </Button>
                <Button
                  variant="outline"
                  className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                  onClick={() => handleExportJson(filteredProperties, "portfolio")}
                >
                  <FileText className="size-4" />
                  Export Filtered JSON
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Card className="border-border/60">
        <CardContent className="grid gap-4 px-5 py-5 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
          <Input
            placeholder="Search by title, location, category, or status"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className={shellInputClassName}
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value as CategoryFilter)
            }
          >
            <option value="ALL">All categories</option>
            {propertyCategoryOptions.map((categoryOption) => (
              <option key={categoryOption.value} value={categoryOption.value}>
                {categoryOption.label}
              </option>
            ))}
          </select>
          <select
            className={shellInputClassName}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
          >
            <option value="ALL">All statuses</option>
            {propertyStatusOptions.map((statusOption) => (
              <option key={statusOption.value} value={statusOption.value}>
                {statusOption.label}
              </option>
            ))}
          </select>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              {isRefreshing ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              Refresh
            </Button>
            <Button onClick={resetComposer}>
              <Plus className="size-4" />
              New Property
            </Button>
          </div>
        </CardContent>
      </Card>

      {portfolioError ? (
        <Alert variant="destructive">
          <AlertTitle>Property workspace needs attention</AlertTitle>
          <AlertDescription>{portfolioError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(380px,0.95fr)]">
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Portfolio Listings
              </h2>
              <p className="text-muted-foreground text-sm">
                {filteredProperties.length} of {properties.length} properties in view
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => handleExportJson(filteredProperties, "filtered-portfolio")}
            >
              <FileArchive className="size-4" />
              Export Visible Set
            </Button>
          </div>

          {filteredProperties.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex min-h-72 flex-col items-center justify-center space-y-3 px-6 py-12 text-center">
                <div className="rounded-full bg-primary/10 p-4 text-primary">
                  <Building2 className="size-8" />
                </div>
                <h3 className="text-xl font-semibold">No properties match this view</h3>
                <p className="text-muted-foreground max-w-md text-sm leading-6">
                  Adjust your search or filters, or create the first listing to start
                  building the internal property registry.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isActive={property.id === selectedPropertyId}
                isDeleting={deletingPropertyId === property.id}
                onEdit={() => openProperty(property)}
                onExport={() => handleExportJson([property], `property-${property.id}`)}
                onDelete={() => void handleDeleteProperty(property.id)}
              />
            ))
          )}
        </section>

        <section className="xl:sticky xl:top-4 xl:self-start">
          <Card className="overflow-hidden border-border/70 shadow-lg">
            <div className="bg-linear-to-r from-emerald-500/10 via-transparent to-cyan-500/10 px-6 py-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-[0.24em]">
                    {selectedProperty ? "Edit Listing" : "Create Listing"}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    {selectedProperty
                      ? selectedProperty.title
                      : "Property operations console"}
                  </h2>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Manage core details, amenity mapping, document linkage, and
                    export readiness from one place.
                  </p>
                </div>
                {selectedProperty ? (
                  <Button variant="outline" onClick={resetComposer}>
                    <Plus className="size-4" />
                    New
                  </Button>
                ) : null}
              </div>
            </div>

            <CardContent className="space-y-6 px-6 py-6">
              <form
                className="space-y-6"
                onSubmit={form.handleSubmit((values) => void handleSubmit(values))}
              >
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Property title</label>
                    <Input {...form.register("title")} placeholder="Kololo Terrace Villa" />
                    {form.formState.errors.title ? (
                      <p className="text-destructive text-xs">
                        {form.formState.errors.title.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">
                      Listing description
                    </label>
                    <Textarea
                      {...form.register("description")}
                      className="min-h-32"
                      placeholder="Capture the selling points, operating notes, and tenant or buyer value story."
                    />
                    {form.formState.errors.description ? (
                      <p className="text-destructive text-xs">
                        {form.formState.errors.description.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Category</label>
                      <select className={shellInputClassName} {...form.register("category")}>
                        {propertyCategoryOptions.map((categoryOption) => (
                          <option
                            key={categoryOption.value}
                            value={categoryOption.value}
                          >
                            {categoryOption.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Listing status</label>
                      <select className={shellInputClassName} {...form.register("status")}>
                        {propertyStatusOptions.map((statusOption) => (
                          <option key={statusOption.value} value={statusOption.value}>
                            {statusOption.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2 md:col-span-2">
                      <label className="text-sm font-medium">Address</label>
                      <Input {...form.register("address")} placeholder="12 Acacia Avenue" />
                      {form.formState.errors.address ? (
                        <p className="text-destructive text-xs">
                          {form.formState.errors.address.message}
                        </p>
                      ) : null}
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">City</label>
                      <Input {...form.register("city")} placeholder="Kampala" />
                      {form.formState.errors.city ? (
                        <p className="text-destructive text-xs">
                          {form.formState.errors.city.message}
                        </p>
                      ) : null}
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">State / Region</label>
                      <Input {...form.register("state")} placeholder="Central Region" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">ZIP / Postal code</label>
                      <Input {...form.register("zip_code")} placeholder="N/A or local code" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Country</label>
                      <Input {...form.register("country")} placeholder="Uganda" />
                      {form.formState.errors.country ? (
                        <p className="text-destructive text-xs">
                          {form.formState.errors.country.message}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Price</label>
                      <Input
                        {...form.register("price")}
                        inputMode="decimal"
                        placeholder="350000"
                      />
                      {form.formState.errors.price ? (
                        <p className="text-destructive text-xs">
                          {form.formState.errors.price.message}
                        </p>
                      ) : null}
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Rent amount</label>
                      <Input
                        {...form.register("rent_amount")}
                        inputMode="decimal"
                        disabled={activeCategory !== "RENT"}
                        placeholder={
                          activeCategory === "RENT"
                            ? "2500"
                            : "Only required for rental inventory"
                        }
                      />
                      {form.formState.errors.rent_amount ? (
                        <p className="text-destructive text-xs">
                          {form.formState.errors.rent_amount.message}
                        </p>
                      ) : null}
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Deposit</label>
                      <Input
                        {...form.register("deposit")}
                        inputMode="decimal"
                        placeholder="5000"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Square footage</label>
                      <Input
                        {...form.register("square_footage")}
                        inputMode="numeric"
                        placeholder="1800"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Bedrooms</label>
                      <Input
                        {...form.register("bedrooms")}
                        inputMode="numeric"
                        placeholder="3"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Bathrooms</label>
                      <Input
                        {...form.register("bathrooms")}
                        inputMode="numeric"
                        placeholder="2"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Year built</label>
                      <Input
                        {...form.register("year_built")}
                        inputMode="numeric"
                        placeholder="2020"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Longitude</label>
                      <Input
                        {...form.register("longitude")}
                        inputMode="decimal"
                        placeholder="32.5825"
                      />
                    </div>
                    <div className="grid gap-2 md:col-start-2">
                      <label className="text-sm font-medium">Latitude</label>
                      <Input
                        {...form.register("latitude")}
                        inputMode="decimal"
                        placeholder="0.3476"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 rounded-2xl border bg-muted/30 p-4">
                  <div>
                    <h3 className="text-lg font-semibold">Amenities</h3>
                    <p className="text-muted-foreground text-sm">
                      Categorize the property for search, operations, and export.
                    </p>
                  </div>

                  {amenities.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      No amenities exist yet. Create the first one below.
                    </p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {amenities.map((amenity) => {
                        const checked = form.watch("amenity_ids").includes(amenity.id);

                        return (
                          <label
                            key={amenity.id}
                            className="flex items-start gap-3 rounded-xl border bg-background px-4 py-3"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(value) =>
                                handleAmenityToggle(amenity.id, Boolean(value))
                              }
                            />
                            <span className="space-y-1">
                              <span className="block text-sm font-medium">
                                {amenity.name}
                              </span>
                              <span className="text-muted-foreground block text-xs">
                                {amenity.description || "No extra notes yet."}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  <div className="grid gap-3 rounded-xl border border-dashed bg-background p-4">
                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                      <Input
                        placeholder="Add new amenity"
                        value={newAmenityName}
                        onChange={(event) => setNewAmenityName(event.target.value)}
                      />
                      <Input
                        placeholder="Short description"
                        value={newAmenityDescription}
                        onChange={(event) =>
                          setNewAmenityDescription(event.target.value)
                        }
                      />
                      <Button
                        type="button"
                        onClick={() => void handleCreateAmenity()}
                        disabled={isCreatingAmenity}
                      >
                        {isCreatingAmenity ? (
                          <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                          <Plus className="size-4" />
                        )}
                        Add
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 rounded-2xl border bg-muted/30 p-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Images and documents
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Upload brochures, contracts, photos, floor plans, and other
                      supporting documents. Files are linked directly to the property
                      record in the backend.
                    </p>
                  </div>

                  <div className="rounded-xl border border-dashed bg-background p-4">
                    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 text-center">
                      <div className="rounded-full bg-primary/10 p-3 text-primary">
                        <FileImage className="size-5" />
                      </div>
                      <div>
                        <p className="font-medium">Add property files</p>
                        <p className="text-muted-foreground text-sm">
                          Images, PDFs, and supporting documents up to 1MB each
                        </p>
                      </div>
                      <input
                        className="hidden"
                        multiple
                        type="file"
                        onChange={(event) => {
                          handleFileSelection(event.target.files);
                          event.target.value = "";
                        }}
                      />
                    </label>
                  </div>

                  {pendingUploads.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          Pending uploads ({pendingUploads.length})
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setPendingUploads([])}
                        >
                          Clear queue
                        </Button>
                      </div>
                      {pendingUploads.map((upload) => (
                        <div
                          key={upload.id}
                          className="rounded-xl border bg-background p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-medium">{upload.file.name}</p>
                              <p className="text-muted-foreground text-xs">
                                {(upload.file.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setPendingUploads((currentUploads) =>
                                  currentUploads.filter(
                                    (currentUpload) =>
                                      currentUpload.id !== upload.id,
                                  ),
                                )
                              }
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                          <Input
                            className="mt-3"
                            value={upload.description}
                            onChange={(event) =>
                              setPendingUploads((currentUploads) =>
                                currentUploads.map((currentUpload) =>
                                  currentUpload.id === upload.id
                                    ? {
                                        ...currentUpload,
                                        description: event.target.value,
                                      }
                                    : currentUpload,
                                ),
                              )
                            }
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {selectedProperty?.documents.length ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium">Linked documents</p>
                        <p className="text-muted-foreground text-xs">
                          Centralized document management for the selected property
                        </p>
                      </div>
                      {selectedProperty.documents.map((document) => (
                        <DocumentRow
                          key={document.id}
                          document={document}
                          value={documentDrafts[document.id] ?? document.description}
                          isBusy={busyDocumentId === document.id}
                          onChange={(value) =>
                            setDocumentDrafts((currentDrafts) => ({
                              ...currentDrafts,
                              [document.id]: value,
                            }))
                          }
                          onSave={() => void handleDocumentSave(document.id)}
                          onDelete={() => void handleDocumentDelete(document.id)}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="rounded-2xl border bg-background p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">Availability and sync</p>
                      <p className="text-muted-foreground text-xs">
                        Published {formatDateTime(selectedProperty?.published_at ?? null)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        selectedProperty
                          ? getPropertySyncState(selectedProperty).exportReady
                            ? "default"
                            : "secondary"
                          : "secondary"
                      }
                    >
                      {selectedProperty
                        ? getPropertySyncState(selectedProperty).label
                        : "New listing draft"}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="size-4" />
                    )}
                    {selectedProperty ? "Save changes" : "Create property"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetComposer}>
                    Reset form
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

export default PropertyManagementPage;
