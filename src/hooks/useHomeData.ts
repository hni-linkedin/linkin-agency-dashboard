"use client";

import { useCallback, useEffect, useState } from "react";
import { getHomeData } from "@/api/home";
import { ApiError } from "@/lib/axios";
import { mapHomeData } from "@/lib/mappers/homeMapper";
import type { MappedHomeData } from "@/lib/mappers/homeMapper";

export type UseHomeDataReturn = {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  isEmpty: boolean;
  data: MappedHomeData | null;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useHomeData(clientId: string | null): UseHomeDataReturn {
  const [data, setData] = useState<MappedHomeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">(
    "idle",
  );

  useEffect(() => {
    if (clientId === null || clientId === "") {
      const id = setTimeout(() => {
        setStatus("idle");
        setData(null);
        setError(null);
      }, 0);
      return () => clearTimeout(id);
    }

    let ignore = false;
    const id = setTimeout(() => {
      setError(null);
      setStatus("loading");
    }, 0);

    getHomeData(clientId)
      .then((raw) => {
        if (ignore) return;
        try {
          const mapped = mapHomeData(raw);
          setData(mapped);
          setStatus("success");
        } catch (e) {
          // Surface mapper issues in devtools so we can debug shape mismatches.
          // eslint-disable-next-line no-console
          console.error("[mapHomeData error]", e, raw);
          setError("Failed to map dashboard data");
          setData(null);
          setStatus("error");
        }
      })
      .catch((e) => {
        if (ignore) return;
        // eslint-disable-next-line no-console
        console.error("[useHomeData fetch error]", e);
        const message =
          e instanceof ApiError ? e.message : "Something went wrong";
        setError(message);
        setData(null);
        setStatus("error");
      });

    return () => {
      clearTimeout(id);
      ignore = true;
    };
  }, [clientId]);

  const refetch = useCallback(async () => {
    if (clientId === null || clientId === "") return;
    setError(null);
    setStatus("loading");

    try {
      const raw = await getHomeData(clientId);
      try {
        const mapped = mapHomeData(raw);
        setData(mapped);
        setStatus("success");
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("[mapHomeData error - refetch]", e, raw);
        setError("Failed to map dashboard data");
        setData(null);
        setStatus("error");
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[useHomeData fetch error - refetch]", e);
      const message =
        e instanceof ApiError ? e.message : "Something went wrong";
      setError(message);
      setData(null);
      setStatus("error");
    }
  }, [clientId]);

  const isLoading = status === "loading";
  const isError = status === "error";
  const isSuccess = status === "success";
  const isEmpty = status === "success" && data !== null && !data.hasAnyData;

  return {
    isLoading,
    isError,
    isSuccess,
    isEmpty,
    data,
    error,
    refetch,
  };
}
