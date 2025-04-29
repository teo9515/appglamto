import CardAdmin from "../components/CardAdmin";

export default function Home() {
  return (
    <main className="flex flex-col  min-h-screen py-10 w-full lg:w-5/6 justify-center items-center gap-5">
      <div className=" w-5/6 space-y-5 ">
        <h1 className="text-5xl font-bold text-[#163020] text-center">
          Glamto
        </h1>
        <h3 className="text-3xl font-bold text-[#163020] text-center">
          Panel Admin
        </h3>
        <p className="text-[#163020] text-center text-xl lg:text-2xl ">
          Accede a la administración de clientes y guarderías. Gestiona toda la
          información de forma sencilla y rápida.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-5/6">
        <CardAdmin
          title="Clientes"
          description="Administra la información de tus clientes, visualiza sus datos y gestiona sus registros fácilmente."
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
