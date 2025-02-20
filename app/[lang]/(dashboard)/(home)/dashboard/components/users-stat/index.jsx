"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Icon } from "@iconify/react";
// Asumiendo que estos componentes ya existen en tu proyecto
import UsersDataChart from "./users-data-chart";
import UsersDataTable from "./users-data-table";

// Importa funciones de Firestore y la configuración
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebaseConfig";

const UsersStat = () => {
  const [patients, setPatients] = useState([]);
  const [citiesData, setCitiesData] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        // Obtén los documentos de la colección "pacientes"
        const querySnapshot = await getDocs(collection(db, "pacientes"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        setPatients(data);

        // Agrupamos por el campo "lugarSolicitud" para obtener la cantidad de pacientes por ciudad
        const aggregated = data.reduce((acc, curr) => {
          const city = curr.lugarSolicitud || "Desconocido";
          acc[city] = (acc[city] || 0) + 1;
          return acc;
        }, {});

        // Convertimos el objeto en un arreglo usable para el gráfico y la tabla
        const citiesArray = Object.keys(aggregated).map((city) => ({
          city,
          count: aggregated[city],
        }));

        setCitiesData(citiesArray);
      } catch (error) {
        console.error("Error al obtener los pacientes:", error);
      }
    };

    fetchPatients();
  }, []);

  return (
    <Card>
      <CardHeader className="border-none pb-0 mb-5">
        <div className="flex items-center gap-1">
          <div className="flex-1">
            {/* Título: antes era 'Users', ahora 'Pacientes por Ciudad de Solicitud' */}
            <div className="text-xl font-semibold text-default-900">Pacientes por Ciudad de Solicitud</div>
            <span className="text-xs text-default-600 ml-1">En los últimos 30 minutos</span>
          </div>
          <div className="flex-none flex items-center gap-1">
            {/* Cantidad total de pacientes */}
            <span className="text-4xl font-semibold text-primary">{patients.length}</span>
            <span className="text-2xl text-success">
              <Icon icon="heroicons:arrow-trending-up-16-solid" />
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-0">
        {/* Texto indicando lo que se muestra en el gráfico */}
        <p className="text-xs font-medium text-default-800">Distribución de Pacientes por Ciudad</p>
        {/* Componente del gráfico: recibe citiesData con { city, count } */}
        <UsersDataChart data={citiesData} />
        {/* Tabla que muestra las mismas agrupaciones: { city, count } */}
        <UsersDataTable data={citiesData} />
      </CardContent>
    </Card>
  );
};

export default UsersStat;
