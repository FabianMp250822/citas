"use client";
import Image from "next/image";
import Link from "next/link";
import { SiteLogo } from "@/components/svg";
import { Button } from "@/components/ui/button";
import footerImage from "@/public/images/landing-page/footer.png";
import facebook from "@/public/images/social/facebook-1.png";
import dribble from "@/public/images/social/dribble-1.png";
import linkedin from "@/public/images/social/linkedin-1.png";
import github from "@/public/images/social/github-1.png";
import behance from "@/public/images/social/behance-1.png";
import twitter from "@/public/images/social/twitter-1.png";
import youtube from "@/public/images/social/youtube.png";

const Footer = () => {
  const socials = [
    {
      icon: facebook,
      href: "https://www.facebook.com/Codeshaperbd/" // Replace with Clínica de la Costa's Facebook link if available
    },
    {
      icon: github,
      href: "https://github.com/Codeshaper-bd" // Replace with Clínica de la Costa's Github link if available
    },
    {
      icon: linkedin,
      href: "https://www.linkedin.com/company/codeshaper/" // Replace with Clínica de la Costa's LinkedIn link if available
    },
    {
      icon: youtube,
      href: "https://www.youtube.com/@codeshaper4181" // Replace with Clínica de la Costa's Youtube link if available
    },
    {
      icon: twitter,
      href: "https://twitter.com/codeshaperbd" // Replace with Clínica de la Costa's Twitter link if available
    },
    {
      icon: dribble,
      href: "https://dribbble.com/codeshaperbd" // Replace with Clínica de la Costa's Dribble link if available
    },
    {
      icon: behance,
      href: "https://www.behance.net/codeshaper" // Replace with Clínica de la Costa's Behance link if available
    }
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer
      className=" bg-cover bg-center bg-no-repeat relative before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-default-900/90 dark:before:bg-default-100"
      style={{
        background: `url(${footerImage.src})`
      }}
    >
      <div className="py-16 2xl:py-[120px]">
        <div className="max-w-[700px] mx-auto flex flex-col items-center relative">
          <Link
            href="/"
            className="inline-flex items-center gap-4 text-primary-foreground"
          >
            <SiteLogo className="w-[50px] h-[52px]" />
            <span className="text-3xl font-semibold">Clínica de la Costa</span> {/* Clínica de la Costa */}
          </Link>
          <p className="text-base leading-7 text-default-200 dark:text-default-600 text-center mt-3">
            Clínica de la Costa.  Su bienestar, nuestra prioridad. {/* Clínica de la Costa description */}
          </p>
          <div className="mt-9 flex justify-center flex-wrap gap-4">
            <Button asChild variant="outline" className="rounded text-primary-foreground border-primary">
              <Link href="/servicios">Nuestros Servicios</Link> {/* Example link */}
            </Button>
            <Button asChild variant="outline" className="rounded text-primary-foreground border-primary">
              <Link href="/especialistas">Especialistas</Link> {/* Example link */}
            </Button>
            <Button asChild variant="outline" className="rounded text-primary-foreground border-primary">
              <Link href="/contacto">Contacto</Link> {/* Example link */}
            </Button>
          </div>
          <div className="mt-8 flex items-center justify-center flex-wrap gap-5">
            {socials.map((item, index) => (
              <Link href={item.href} key={`social-link-${index}`} target="_blank">
                <Image src={item.icon} alt="social" width={30} height={30} />
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="relative bg-default-900 dark:bg-default-50 py-6">
        <div className="container flex flex-col text-center md:text-start md:flex-row gap-2">
          <p className="text-primary-foreground flex-1 text-base xl:text-lg font-medium">
            COPYRIGHT © {currentYear} Clínica de la Costa - Fabián Muñoz & Leidy Vega Anaya
          </p>
          <p className="text-primary-foreground flex-1 text-base xl:text-lg font-medium">
             <Link href="www.clinicadelacosta.com" target="_blank" className="hover:underline">www.clinicadelacosta.com</Link> {/* Clínica de la Costa website */}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;