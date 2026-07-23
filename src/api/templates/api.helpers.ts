import type { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

import APIClient from "@/lib/axios";


// const getAccessToken = () => {
//   const session = getSession();
//   return session.access_token || session.token;
// };

import type { ApiActionResponse, ApiErrorResponse } from "@/types";

export type ApiId = string | number;
export type ApiRecord = Record<string, unknown>;
export type ApiParams = Record<string, unknown>;
export type { ApiActionResponse, ApiErrorResponse };

export type ApiRequestError = AxiosError<ApiErrorResponse>;

const isValidParamValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return false;
  }

  const stringValue = String(value).trim();

  return ![
    "",
    "undefined",
    "null",
    "NaN",
    "Infinity",
    "-Infinity",
  ].includes(stringValue);
};

export const compactParams = (params: ApiParams = {}) => {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([key, value]) => isValidParamValue(key) && isValidParamValue(value),
    ),
  );
};

const isRecord = (value: unknown): value is ApiRecord => {
  return !!value && typeof value === "object" && !Array.isArray(value);
};

const isSuccessEnvelope = (
  value: unknown,
): value is { status: true; data: unknown } => {
  return isRecord(value) && value.status === true && "data" in value;
};

const isErrorEnvelope = (
  value: unknown,
): value is { status: false; error?: unknown; message?: unknown } => {
  return isRecord(value) && value.status === false;
};

const getErrorMessage = (value: unknown) => {
  if (!isRecord(value)) {
    return null;
  }

  const message = value.message || value.error || value.detail;

  return typeof message === "string" && message.trim()
    ? message.trim()
    : null;
};

const unwrapData = async <TData>(
  request: Promise<AxiosResponse<TData>>,
) => {
  const { data } = await request;

  if (isSuccessEnvelope(data)) {
    return data.data as TData;
  }

  if (isErrorEnvelope(data)) {
    const message =
      getErrorMessage(data.error) || getErrorMessage(data) || "Request failed";

    throw new Error(message);
  }

  return data;
};

export const requestApiData = <TData = unknown>(
  config: AxiosRequestConfig,
) => unwrapData<TData>(APIClient.request<TData>(config));
