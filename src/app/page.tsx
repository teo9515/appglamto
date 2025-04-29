import CardAdmin from "../components/CardAdmin";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-white  w-full">
      <div className="w-5/6 space-y-10 lg:w-4/6">
        <h1 className="text-5xl font-bold text-[#163020] text-center">
          Glamto
        </h1>
        <h3 className="text-4xl font-bold text-[#163020] text-center">
          Panel Admin
        </h3>
        <p className="text-[#163020] text-center text-xl lg:text-2xl ">
          Accede a la administración de clientes y guarderías. Gestiona toda la
          información de forma sencilla y rápida.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6  w-full">
          <CardAdmin
            title="Clientes"
            description="Administra la información de tus clientes, visualiza sus datos y gestiona sus registros fácilmente."
            href="/clients"
            icon="👤"
          />
          <CardAdmin
            title="Guarderías"
            description="Consulta y administra las guarderías disponibles, horarios, capacidad y más."
            href="/guarderias"
            icon="🏠"
          />
        </div>
      </div>
    </main>
  );
}
