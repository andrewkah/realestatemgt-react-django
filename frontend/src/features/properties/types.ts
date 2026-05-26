export type PropertyCategory = "RENT" | "SALE" | "LEASE";

export type PropertyStatus =
  | "draft"
  | "pending_review"
  | "available"
  | "under_offer"
  | "rented"
  | "sold"
  | "under_maintenance"
  | "delisted";

export interface Amenity {
  id: number;
  name: string;
  description: string;
}

export interface PropertyDocument {
  id: number;
  file: string;
  file_url: string;
  file_name: string;
  file_type: string;
  description: string;
  is_photo: boolean;
  created_at: string;
  updated_at: string;
}

export interface PropertyRecord {
  id: number;
  title: string;
  description: string;
  category: PropertyCategory;
  status: PropertyStatus;
  address: string;
  city: string;
  state: string | null;
  zip_code: string | null;
  country: string;
  longitude: string | null;
  latitude: string | null;
  price: string;
  rent_amount: string | null;
  deposit: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  square_footage: number | null;
  year_built: number | null;
  amenities: Amenity[];
  documents: PropertyDocument[];
  image_count: number;
  document_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface PropertyPayload {
  title: string;
  description: string;
  category: PropertyCategory;
  status: PropertyStatus;
  address: string;
  city: string;
  state?: string;
  zip_code?: string;
  country: string;
  longitude?: number;
  latitude?: number;
  price: number;
  rent_amount?: number;
  deposit?: number;
  bedrooms?: number;
  bathrooms?: number;
  square_footage?: number;
  year_built?: number;
  amenity_ids?: number[];
}

export interface PropertyFormValues {
  title: string;
  description: string;
  category: PropertyCategory;
  status: PropertyStatus;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  longitude: string;
  latitude: string;
  price: string;
  rent_amount: string;
  deposit: string;
  bedrooms: string;
  bathrooms: string;
  square_footage: string;
  year_built: string;
  amenity_ids: number[];
}

export interface PropertyUploadDraft {
  id: string;
  file: File;
  description: string;
}
