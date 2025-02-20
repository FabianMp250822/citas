"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig"; 
import { useThemeStore } from "@/store";
import { useTheme } from "next-themes";
import { themes } from "@/config/thems";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const UserStats = ({ height = 250 }) => {
  // Estados para los campos del documento
  const [resEntregados, setResEntregados] = useState(0);
  const [resCargados, setResCargados] = useState(0);

  // Estados de carga y error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tema
  const { theme: config, isRtl } = useThemeStore();
  const { theme: mode } = useTheme();
  const theme = themes.find((theme) => theme.name === config);

  // useEffect para leer el documento de "graficosResultados"
  useEffect(() => {
    const fetchGraficosResultados = async () => {
      try {
        setLoading(true);
        setError(null);

        // Ajusta el ID del documento si es distinto
        const docRef = doc(db, "graficosResultados", "7G73QrzRjQBTKrY23ybK");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("Datos de graficosResultados:", data);

          // Ajusta los nombres de los campos según estén en tu Firestore
          setResEntregados(data.reseltadosEntregados || 0);
          setResCargados(data.resultadosCargados || 0);
        } else {
          setError("No existe el documento en Firestore.");
        }
      } catch (err) {
        console.error("Error al obtener graficosResultados:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGraficosResultados();
  }, []);

  if (loading) {
    return <div>Cargando información...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Series y labels con los datos obtenidos
  const series = [resEntregados, resCargados];
  const labels = ["Resultados Entregados", "Resultados Cargados"];

  // Configuración de la gráfica
  const options = {
    chart: {
      toolbar: {
        show: false,
      },
    },
    labels,
    dataLabels: {
      enabled: false,
    },
    colors: [
      `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].primary})`,
      `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].info})`,
    ],
    tooltip: {
      theme: mode === "dark" ? "dark" : "light",
    },
    stroke: {
      width: 0,
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "14px",
              fontWeight: 600,
              colors: `hsl(${
                theme?.cssVars[
                  mode === "dark" || mode === "system" ? "dark" : "light"
                ].chartLabel
              })`,
            },
            value: {
              show: true,
              fontSize: "14px",
              fontWeight: 600,
              color: `hsl(${
                theme?.cssVars[
                  mode === "dark" || mode === "system" ? "dark" : "light"
                ].chartLabel
              })`,
            },
            total: {
              show: true,
              label: "Total",
              fontSize: "16px",
              fontWeight: 600,
              color: `hsl(${
                theme?.cssVars[
                  mode === "dark" || mode === "system" ? "dark" : "light"
                ].chartLabel
              })`,
              formatter: (w) => w.globals.seriesTotals.reduce((a, b) => a + b, 0),
            },
          },
        },
      },
    },
    legend: {
      position: "bottom",
      labels: {
        colors: `hsl(${
          theme?.cssVars[
            mode === "dark" || mode === "system" ? "dark" : "light"
          ].chartLabel
        })`,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 8,
      },
      markers: {
        width: 10,
        height: 10,
        radius: 10,
        offsetX: isRtl ? 5 : -5,
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
      type="donut"
      height={height}
      width="100%"
    />
  );
};

export default UserStats;
