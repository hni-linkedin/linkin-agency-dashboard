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
  refetch: () => void;
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
        const mapped = mapHomeData(raw);
        setData(mapped);
        setStatus("success");
      })
      .catch((e) => {
        if (ignore) return;
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

  const refetch = useCallback(() => {
    if (clientId === null || clientId === "") return;
    setError(null);
    setStatus("loading");

    getHomeData(clientId)
      .then((raw) => {
        const mapped = mapHomeData(raw);
        setData(mapped);
        setStatus("success");
      })
      .catch((e) => {
        const message =
          e instanceof ApiError ? e.message : "Something went wrong";
        setError(message);
        setData(null);
        setStatus("error");
      });
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
