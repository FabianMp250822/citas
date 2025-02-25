"use client";
import Card from "@/components/ui/card-snippet";
import BasicTable from "./basic-table";
import ListDoctors from "./basic-table";


const SimpleTablePage = () => {
  return (
    <div className=" space-y-5">
      <Card title="Listar Doctores">
        <ListDoctors />
      </Card>
    
    </div>
  );
};

export default SimpleTablePage;
