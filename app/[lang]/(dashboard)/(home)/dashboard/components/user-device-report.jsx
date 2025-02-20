"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig"; // Ajusta la ruta según tu proyecto

import { useThemeStore } from "@/store";
import { useTheme } from "next-themes";
import { themes } from "@/config/thems";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const UserDeviceReport = ({ height = 250 }) => {
  // Estados
  const [citasAgendadas, setCitasAgendadas] = useState(0);
  const [citasCanceladas, setCitasCanceladas] = useState(0);
  const [citasNoValida, setCitasNoValida] = useState(0);

  // Estados para la carga y el error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hooks de tema
  const { theme: config, isRtl } = useThemeStore();
  const { theme: mode } = useTheme();
  const theme = themes.find((t) => t.name === config);

  // useEffect para leer el documento
  useEffect(() => {
    const fetchCitasContador = async () => {
      try {
        setLoading(true);
        setError(null);

        // Usar la ID real del documento
        const docRef = doc(db, "citasContador", "buQJo5a7pEAj17i00Bcs");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("Datos de citasContador:", data);

          // Ajustar los campos al nombre exacto que tiene en Firestore
          setCitasAgendadas(data.citasAgendadas || 0);
          setCitasCanceladas(data.citasCanceladas || 0);
          // Verifica el nombre real del campo (p.ej. "citasNovalidas" o "citasNoValidas")
          setCitasNoValida(data.citasNovalidas || 0);
        } else {
          console.log("No existe el documento en Firestore");
          setError("No existe el documento en Firestore");
        }
      } catch (err) {
        console.error("Error al obtener citasContador:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCitasContador();
  }, []);

  if (loading) {
    return <div>Cargando información de citas...</div>;
  }

  if (error) {
    return <div>Error al cargar datos: {error}</div>;
  }

  // Datos para la gráfica
  const series = [citasAgendadas, citasCanceladas, citasNoValida];
  const labels = ["Citas Agendadas", "Citas Canceladas", "Citas No Válidas"];

  // Configuración de la gráfica
  const options = {
    chart: { toolbar: { show: false } },
    labels,
    dataLabels: { enabled: false },
    colors: [
      `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].primary})`,
      "#FF9E69",
      "#FFD1A7",
    ],
    tooltip: {
      theme: mode === "dark" ? "dark" : "light",
    },
    stroke: { width: 0 },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              formatter: (w) =>
                w.globals.seriesTotals.reduce((a, b) => a + b, 0),
            },
          },
        },
      },
    },
    legend: {
      position: "bottom",
      markers: {
        width: 10,
        height: 10,
        radius: 10,
        offsetX: isRtl ? 5 : -5,
      },
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

export default UserDeviceReport;
