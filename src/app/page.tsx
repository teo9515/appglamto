"use client";

import CardAdmin from "../components/CardAdmin";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-col  min-h-screen w-full  items-center justify-center space-y-4 gap-2 md:gap-20">
      <Image
        src="/glamto12.png"
        width={120}
        quality={100}
        height={120}
        alt="cuidado para gatos"
      />
      <div className=" w-5/6 space-y-10 ">
        <h3 className="text-3xl font-semibold text-[#163020] lg:text-5xl text-center">
          Panel Administrativo
        </h3>
      </div>
      <div className="flex flex-col md:flex-row w-5/6 sm:w-5/6 gap-5 sm:gap-10 justify-center ">
        <CardAdmin
          title="Clientes"
          description="Administra la información de los clientes, crea, edita y visualiza sus datos."
          href="/clients"
        />
        <CardAdmin
          title="Guarderías"
          description="Consulta y administra las guarderías disponibles, horarios, capacidad y más."
          href="/guarderias"
        />
      </div>
    </main>
  );
}
