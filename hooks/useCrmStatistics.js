// useCrmStatistics.js
"use client";
import { useEffect } from "react";
import useStatisticsStore from "@/store/statisticsStore";

export default function useCrmStatistics() {
  const { data, loading, fetchData } = useStatisticsStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading };
}
