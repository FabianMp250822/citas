import Card from "@/components/ui/card-snippet";
import MultipleTypes from "./multiple-types";


const ValidationUseForm = () => {
  return (
    <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 gap-6">
     
      <div className="col-span-2">
        <Card title="Crear agentes">
          <MultipleTypes />
        </Card>
      </div>
    </div>
  );
};

export default ValidationUseForm;