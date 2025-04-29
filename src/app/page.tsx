import CardAdmin from "../components/CardAdmin";

export default function Home() {
  return (
    <main className="flex flex-col  min-h-screen pb-5 pt-4 w-full lg:w-5/6 justify-center items-center gap-10">
      <div className=" w-5/6 space-y-5 ">
        <h1 className="text-5xl font-bold text-[#163020] text-center">
          Glamto
        </h1>
        <h3 className="text-3xl font-semibold text-[#163020] text-center">
          Panel Administrativo
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-5/6">
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
