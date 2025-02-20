// app/dashboard/layout.jsx (o .tsx)
import DashBoardLayoutProvider from "@/provider/dashboard.layout.provider";
import { getDictionary } from "@/app/dictionaries";
import AuthGuard from "@/components/AuthGuard";

const DashboardLayout = async ({ children, params: { lang } }) => {
  const trans = await getDictionary(lang);

  return (
    <DashBoardLayoutProvider trans={trans}>
      {/* Se envuelve el contenido del dashboard con AuthGuard */}
      <AuthGuard>
        {children}
      </AuthGuard>
    </DashBoardLayoutProvider>
  );
};

export default DashboardLayout;
