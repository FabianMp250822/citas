"use client"
import { Icon } from '@iconify/react';
const EmptyMessage = () => {
  return (
    <div className="h-full flex flex-col justify-center">
      <div className="h-full flex justify-center items-center">
        <div className="text-center flex flex-col items-center">
          <Icon icon="typcn:messages" className="text-7xl text-gray-400" /> {/* Cambiado a un gris más suave */}
          <div className="mt-4 text-lg font-medium text-gray-600">Aún no hay mensajes</div>
          <div className="mt-1 text-sm font-medium text-gray-500">
            Comienza la conversación.  ¡Saluda!
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyMessage;
