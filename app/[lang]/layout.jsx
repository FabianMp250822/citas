import "../assets/scss/globals.scss";
import "../assets/scss/theme.scss";
import { Inter } from "next/font/google";
import { siteConfig } from "@/config/site";
import Providers from "@/provider/providers";
import "simplebar-react/dist/simplebar.min.css";
import TanstackProvider from "@/provider/providers.client";
import AuthProvider from "@/provider/auth.provider";
import "flatpickr/dist/themes/light.css";
import DirectionProvider from "@/provider/direction.provider";
import { ChatProvider } from "@/store/ChatContext";
import { AppointmentsProvider } from "@/store/citaStore";
import { DoctorsProvider } from "@/store/doctorContex"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({ children, params: { lang } }) {
  return (
    <html lang={lang}>
      <body className={inter.className}>
        <AuthProvider>
          <TanstackProvider>
            <Providers>
              <ChatProvider>
                <DirectionProvider lang={lang}>
                  {/* Envolvemos con DoctorsProvider y AppointmentsProvider */}
                  <DoctorsProvider>
                    <AppointmentsProvider>
                      {children}
                    </AppointmentsProvider>
                  </DoctorsProvider>
                </DirectionProvider>
              </ChatProvider>
            </Providers>
          </TanstackProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
