"use client";

import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

import { useThemeStore } from "@/store";
import { useTheme } from "next-themes";
import { themes } from "@/config/thems";
import { getGridConfig } from "@/lib/appex-chart-options";

// Recibimos "data" como prop, donde data es [{ city: "X", count: 10 }, ...]
const UsersDataChart = ({ data = [], height = 160 }) => {
  // Configuración de tema (no tocaremos mucho esta parte)
  const { theme: config } = useThemeStore();
  const { theme: mode } = useTheme();
  const theme = themes.find((theme) => theme.name === config);

  // Convertimos "data" en la estructura necesaria para ApexCharts
  const series = [
    {
      name: "Pacientes",
      data: data.map((item) => item.count),
    },
  ];

  // Opciones de la gráfica
  const options = {
    chart: {
      toolbar: {
        show: false,
      },
    },
    // Mostramos las categorías en el eje X como las ciudades
    xaxis: {
      categories: data.map((item) => item.city),
      labels: {
        show: true,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    // Sin datos dentro de las barras
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 0,
    },
    // Color principal (basado en tu tema)
    colors: [
      `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].primary})`,
    ],
    tooltip: {
      theme: mode === "dark" ? "dark" : "light",
    },
    grid: getGridConfig(
      `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartGird})`
    ),
    // Mostramos el eje Y
    yaxis: {
      show: true,
    },
    // Propiedades para la gráfica de barras
    plotOptions: {
      bar: {
        columnWidth: "50%",
        borderRadius: 4,
        horizontal: false,
      },
    },
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  };

  return (
    <Chart
      options={options}
      series={series}
      type="bar"
      height={height}
      width={"100%"}
    />
  );
};

export default UsersDataChart;
