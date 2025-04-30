import CardAdmin from "../components/CardAdmin";

export default function Home() {
  return (
    <main className="flex flex-col  min-h-screen w-full  items-center justify-center  gap-10 md:gap-20">
      <div className=" w-5/6 space-y-10 ">
        <h1 className="text-5xl lg:text-7xl font-bold text-[#163020] text-center">
          Glamto
        </h1>
        <h3 className="text-3xl font-semibold text-[#163020] lg:text-5xl text-center">
          Panel Administrativo
        </h3>
      </div>
      <div className="flex flex-col md:flex-row w-5/6 sm:w-5/6 gap-10 justify-center items-end">
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
