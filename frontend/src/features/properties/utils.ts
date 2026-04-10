import type {
  PropertyCategory,
  PropertyFormValues,
  PropertyPayload,
  PropertyRecord,
  PropertyStatus,
} from "./types";

export const propertyCategoryOptions: Array<{
  value: PropertyCategory;
  label: string;
  shortLabel: string;
}> = [
  { value: "RENT", label: "Rental", shortLabel: "Rent" },
  { value: "SALE", label: "Sale", shortLabel: "Sale" },
  { value: "LEASE", label: "Lease", shortLabel: "Lease" },
];

export const propertyStatusOptions: Array<{
  value: PropertyStatus;
  label: string;
}> = [
  { value: "draft", label: "Draft" },
  { value: "pending_review", label: "Pending Review" },
  { value: "available", label: "Available" },
  { value: "under_offer", label: "Under Offer" },
  { value: "rented", label: "Rented" },
  { value: "sold", label: "Sold" },
  { value: "under_maintenance", label: "Under Maintenance" },
  { value: "delisted", label: "Delisted" },
];

export const emptyPropertyFormValues: PropertyFormValues = {
  title: "",
  description: "",
  category: "RENT",
  status: "draft",
  address: "",
  city: "",
  state: "",
  zip_code: "",
  country: "Uganda",
  longitude: "",
  latitude: "",
  price: "",
  rent_amount: "",
  deposit: "",
  bedrooms: "",
  bathrooms: "",
  square_footage: "",
  year_built: "",
  amenity_ids: [],
};

export function formatCurrency(
  amount: number | string | null | undefined,
  currency = "USD",
) {
  const numericAmount =
    typeof amount === "number" ? amount : amount ? Number(amount) : NaN;

  if (Number.isNaN(numericAmount)) {
    return "Not set";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(numericAmount);
}

export function formatDateTime(value: string | null) {
  if (!value) {
    return "Not published";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function mapPropertyToFormValues(
  property: PropertyRecord,
): PropertyFormValues {
  return {
    title: property.title,
    description: property.description,
    category: property.category,
    status: property.status,
    address: property.address,
    city: property.city,
    state: property.state ?? "",
    zip_code: property.zip_code ?? "",
    country: property.country,
    longitude: property.longitude ?? "",
    latitude: property.latitude ?? "",
    price: property.price,
    rent_amount: property.rent_amount ?? "",
    deposit: property.deposit ?? "",
    bedrooms: property.bedrooms ? String(property.bedrooms) : "",
    bathrooms: property.bathrooms ? String(property.bathrooms) : "",
    square_footage: property.square_footage
      ? String(property.square_footage)
      : "",
    year_built: property.year_built ? String(property.year_built) : "",
    amenity_ids: property.amenities.map((amenity) => amenity.id),
  };
}

function numberFromField(value: string) {
  return value.trim() ? Number(value) : undefined;
}

export function buildPropertyPayload(
  values: PropertyFormValues,
): PropertyPayload {
  const payload: PropertyPayload = {
    title: values.title.trim(),
    description: values.description.trim(),
    category: values.category,
    status: values.status,
    address: values.address.trim(),
    city: values.city.trim(),
    country: values.country.trim(),
    price: Number(values.price),
  };

  const optionalFields = {
    state: values.state.trim() || undefined,
    zip_code: values.zip_code.trim() || undefined,
    longitude: numberFromField(values.longitude),
    latitude: numberFromField(values.latitude),
    rent_amount: numberFromField(values.rent_amount),
    deposit: numberFromField(values.deposit),
    bedrooms: numberFromField(values.bedrooms),
    bathrooms: numberFromField(values.bathrooms),
    square_footage: numberFromField(values.square_footage),
    year_built: numberFromField(values.year_built),
  };

  Object.assign(payload, optionalFields);

  if (values.amenity_ids.length) {
    payload.amenity_ids = values.amenity_ids;
  }

  return payload;
}

export function getCategoryLabel(category: PropertyCategory) {
  return (
    propertyCategoryOptions.find((option) => option.value === category)?.label ??
    category
  );
}

export function getStatusLabel(status: PropertyStatus) {
  return (
    propertyStatusOptions.find((option) => option.value === status)?.label ??
    status
  );
}

export function getPrimaryImageUrl(property: PropertyRecord) {
  return property.documents.find((document) => document.is_photo)?.file_url ?? "";
}

export function getPropertySyncState(property: PropertyRecord) {
  const checklist = [
    Boolean(property.title.trim()),
    Boolean(property.description.trim()),
    Boolean(property.address.trim()),
    Boolean(property.city.trim()),
    Boolean(property.price),
    Boolean(property.status),
    Boolean(property.category),
  ];

  const completionRate = checklist.filter(Boolean).length / checklist.length;
  const exportReady =
    completionRate === 1 &&
    property.status !== "draft" &&
    property.status !== "delisted";

  return {
    exportReady,
    completionRate,
    label: exportReady ? "Ready for syndication" : "Needs attention",
  };
}

export function toCsv(properties: PropertyRecord[]) {
  const headers = [
    "ID",
    "Title",
    "Category",
    "Status",
    "Address",
    "City",
    "Country",
    "Price",
    "RentAmount",
    "Bedrooms",
    "Bathrooms",
    "Amenities",
    "Documents",
    "PublishedAt",
  ];

  const rows = properties.map((property) => [
    property.id,
    property.title,
    getCategoryLabel(property.category),
    getStatusLabel(property.status),
    property.address,
    property.city,
    property.country,
    property.price,
    property.rent_amount ?? "",
    property.bedrooms ?? "",
    property.bathrooms ?? "",
    property.amenities.map((amenity) => amenity.name).join(" | "),
    property.documents.map((document) => document.file_name).join(" | "),
    property.published_at ?? "",
  ]);

  return [headers, ...rows]
    .map((row) =>
      row
        .map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`)
        .join(","),
    )
    .join("\n");
}

export function downloadBlob(
  content: BlobPart,
  filename: string,
  contentType: string,
) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
