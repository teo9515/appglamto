"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import GuarderiaCard from "../../components/GuarderiaCard";
import ModalFormGuarderia from "../../components/ModalFormGuarderia";
import Link from "next/link";

type Visit = {
  id: string;
  date: string;
  time: string;
};

type Cat = {
  name: string;
};

type Client = {
  id: string;
  name: string;
  cats: Cat[];
};

type Guarderia = {
  id: string;
  clients: Client;
  guarderias_visits: Visit[];
};

export default function GuarderiasPage() {
  const [guarderias, setGuarderias] = useState<Guarderia[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  useEffect(() => {
    const fetchGuarderias = async () => {
      const { data, error } = await supabase
        .from("guarderias")
        .select(
          "id, clients(id, name, cats(name)), guarderias_visits(id, date)"
        );

      if (error) {
        console.error("Error fetching guarderías:", error);
        return;
      }

      const sorted = (data as unknown as Guarderia[]).sort((a, b) => {
        const aDate = a.guarderias_visits[0]?.date ?? "";
        const bDate = b.guarderias_visits[0]?.date ?? "";
        return new Date(aDate).getTime() - new Date(bDate).getTime();
      });

      setGuarderias(sorted);
    };

    fetchGuarderias();
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("guarderias").delete().eq("id", id);
    if (!error) {
      setGuarderias((prev) => prev.filter((g) => g.id !== id));
    }
  };

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const isToday = (date: string) => date === todayStr;
  const isFuture = (date: string) => new Date(date) > today;

  const guarderiasDeHoy = guarderias.filter((g) =>
    g.guarderias_visits.some((v) => isToday(v.date))
  );

  const guarderiasPendientes = guarderias.filter(
    (g) =>
      !guarderiasDeHoy.includes(g) &&
      g.guarderias_visits.some((v) => isFuture(v.date))
  );

  const guarderiasTerminadas = guarderias.filter(
    (g) =>
      !guarderiasDeHoy.includes(g) &&
      !g.guarderias_visits.some((v) => isFuture(v.date) || isToday(v.date))
  );

  return (
    <div className="max-w-4xl py-10 mx-auto p-4 space-y-8 md:space-y-8">
      <div className="flex flex-wrap gap-5 items-center justify-center space-y-5">
        <h1 className="text-5xl font-bold text-[#163020] text-center">
          Guarderías
        </h1>

        <div className="w-full  flex flex-col sm:flex-row  items-center space-y-4 sm:space-y-0 sm:space-x-5 mb-5 md:mb-3">
          <button className="btn-primary " onClick={handleOpenModal}>
            Nueva guarderia
          </button>
          <Link
            href="/guarderias/finanza"
            className="btn-secondary flex justify-center items-center hover:cursor-pointer"
          >
            <button className="cursor-pointer">Finanzas guardería</button>
          </Link>
          <Link
            href="/"
            className="btn-primary flex justify-center items-center"
          >
            <button className="cursor-pointer">Home</button>
          </Link>
        </div>
      </div>

      {/* Guarderías del día */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Guarderías del día</h2>
        {guarderiasDeHoy.length === 0 ? (
          <p className="text-gray-600">No hay guarderías para hoy.</p>
        ) : (
          <div className="space-y-4">
            {guarderiasDeHoy.map((g) => (
              <GuarderiaCard
                key={g.id}
                id={g.id}
                client={g.clients}
                visits={g.guarderias_visits}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>

      {/* Pendientes */}
      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">Pendientes</h2>
        {guarderiasPendientes.length === 0 ? (
          <p className="text-gray-600">No hay guarderías pendientes.</p>
        ) : (
          <div className="space-y-4">
            {guarderiasPendientes.map((g) => (
              <GuarderiaCard
                key={g.id}
                id={g.id}
                client={g.clients}
                visits={g.guarderias_visits}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>

      {/* Terminadas */}
      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">Terminadas.</h2>
        {guarderiasTerminadas.length === 0 ? (
          <p className="text-gray-600">No hay guarderías terminadas.</p>
        ) : (
          <div className="space-y-4">
            {guarderiasTerminadas.map((g) => (
              <GuarderiaCard
                key={g.id}
                id={g.id}
                client={g.clients}
                visits={g.guarderias_visits}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>

      {/* Modal */}
      {isModalOpen && (
        <ModalFormGuarderia isOpen={isModalOpen} onClose={handleCloseModal} />
      )}
    </div>
  );
}
