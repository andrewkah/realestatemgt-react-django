import type { AxiosInstance } from "axios";

import type {
  Amenity,
  PropertyDocument,
  PropertyPayload,
  PropertyRecord,
  PropertyUploadDraft,
} from "./types";

const PROPERTY_BASE_PATH = "/properties/";

export async function fetchProperties(api: AxiosInstance) {
  const response = await api.get<PropertyRecord[]>(PROPERTY_BASE_PATH);
  return response.data;
}

export async function fetchAmenities(api: AxiosInstance) {
  const response = await api.get<Amenity[]>(`${PROPERTY_BASE_PATH}amenities/`);
  return response.data;
}

export async function createAmenity(
  api: AxiosInstance,
  payload: Pick<Amenity, "name" | "description">,
) {
  const response = await api.post<Amenity>(`${PROPERTY_BASE_PATH}amenities/`, payload);
  return response.data;
}

export async function createProperty(
  api: AxiosInstance,
  payload: PropertyPayload,
) {
  const response = await api.post<PropertyRecord>(PROPERTY_BASE_PATH, payload);
  return response.data;
}

export async function updateProperty(
  api: AxiosInstance,
  propertyId: number,
  payload: PropertyPayload,
) {
  const response = await api.patch<PropertyRecord>(
    `${PROPERTY_BASE_PATH}${propertyId}/`,
    payload,
  );
  return response.data;
}

export async function deleteProperty(api: AxiosInstance, propertyId: number) {
  await api.delete(`${PROPERTY_BASE_PATH}${propertyId}/`);
}

export async function uploadPropertyDocuments(
  api: AxiosInstance,
  propertyId: number,
  uploads: PropertyUploadDraft[],
) {
  const formData = new FormData();
  uploads.forEach((upload) => {
    formData.append("files", upload.file);
    formData.append("descriptions", upload.description.trim() || upload.file.name);
  });

  const response = await api.post<PropertyDocument[]>(
    `${PROPERTY_BASE_PATH}${propertyId}/add-media/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
}

export async function updatePropertyDocument(
  api: AxiosInstance,
  documentId: number,
  description: string,
) {
  const response = await api.patch<PropertyDocument>(
    `${PROPERTY_BASE_PATH}documents/${documentId}/`,
    { description },
  );
  return response.data;
}

export async function deletePropertyDocument(
  api: AxiosInstance,
  documentId: number,
) {
  await api.delete(`${PROPERTY_BASE_PATH}documents/${documentId}/`);
}

export function getApiErrorMessage(error: unknown) {
  const fallbackMessage = "Something went wrong while talking to the property API.";

  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response
  ) {
    const responseData = error.response.data as
      | Record<string, unknown>
      | string
      | undefined;

    if (typeof responseData === "string") {
      return responseData;
    }

    if (responseData?.detail && typeof responseData.detail === "string") {
      return responseData.detail;
    }

    const firstEntry = responseData ? Object.entries(responseData)[0] : undefined;
    if (firstEntry) {
      const [, value] = firstEntry;
      if (Array.isArray(value)) {
        return value.join(", ");
      }
      if (typeof value === "string") {
        return value;
      }
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}
