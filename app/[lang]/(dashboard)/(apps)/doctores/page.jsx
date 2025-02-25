"use client";
import Card from "@/components/ui/card-snippet";
import CreateDoctorForm from "./create-doctor";


const SimpleTablePage = () => {
  return (
    <div className=" space-y-5">
      <Card title="Pacientess asignados">
        <CreateDoctorForm />
      </Card>
    
    </div>
  );
};

export default SimpleTablePage;