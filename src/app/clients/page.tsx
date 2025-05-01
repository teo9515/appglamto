"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import ModalFormClient from "../../components/ModalFormClient";
import ClientCard from "@/components/ClientCard";

type Cat = {
  id: string;
  name: string;
  age?: number;
  medical_condition?: string;
};

type Client = {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  email?: string;
  cats: Cat[];
};

const CLIENTS_PER_PAGE = 5;

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase
        .from("clients")
        .select(
          `
        id,
        name,
        phone,
        address,
        email,
        cats (
          id,
          name,
          age,
          medical_condition
        )
      `
        )
        .order("created_at", { ascending: false }); // 👈 ordena por más reciente

      if (error) setError(error.message);
      else {
        setClients(data || []);
        setFilteredClients(data || []);
      }

      setLoading(false);
    };

    fetchClients();
  }, []);

  useEffect(() => {
    const results = clients.filter((client) =>
      client.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredClients(results);
    setCurrentPage(1); // reset to first page when search changes
  }, [search, clients]);

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de eliminar este cliente?"
    );
    if (!confirmDelete) return;

    await supabase.from("cats").delete().eq("client_id", id);
    const { error } = await supabase.from("clients").delete().eq("id", id);

    if (error) {
      alert("Error al eliminar: " + error.message);
    } else {
      const updated = clients.filter((client) => client.id !== id);
      setClients(updated);
      setFilteredClients(updated);
    }
  };

  const totalPages = Math.ceil(filteredClients.length / CLIENTS_PER_PAGE);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * CLIENTS_PER_PAGE,
    currentPage * CLIENTS_PER_PAGE
  );

  if (loading) return <p className="p-4">Cargando clientes...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error}</p>;

  return (
    <div className="h-full w-full  p-4 flex flex-col overflow-hidden">
      <div className="w-full flex flex-col gap-7 items-center md:items-start lg:items-center md:gap-6 lg:flex-row">
        <div className="w-full flex flex-col md:flex-row items-center gap-3">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[rgb(22,48,32)] text-center md:text-left">
            Clientes registrados
          </h1>
          <span className="text-lg text-gray-700 text-center">
            ({filteredClients.length} total)
          </span>
        </div>

        <div className="w-5/6 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-5">
          <button className="btn-primary" onClick={handleOpenModal}>
            Nuevo cliente
          </button>
          <Link
            href="/"
            className="btn-secondary flex justify-center items-center hover:cursor-pointer"
          >
            <button className="cursor-pointer">Home</button>
          </Link>
        </div>

        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-5/6 md:w-1/2 p-2 font-semibold shadow-md shadow-black rounded-md "
        />
      </div>

      {filteredClients.length === 0 ? (
        <p className="mt-6 text-center text-gray-500">No hay clientes aún.</p>
      ) : (
        <>
          <div className="mt-6 hidden md:block overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
            <table className="min-w-full table-auto border-collapse text-sm">
              <thead className="bg-[#dbe3b6] text-[#163020] sticky top-0 z-10">
                <tr>
                  <th className="p-3 border border-gray-300 text-left w-1/6">
                    Nombre
                  </th>
                  <th className="p-3 border border-gray-300 text-left w-3/6">
                    Dirección
                  </th>
                  <th className="p-3 border border-gray-300 text-left w-1/12">
                    Teléfono
                  </th>
                  <th className="p-3 border border-gray-300 text-left">
                    Gatos
                  </th>
                  <th className="p-3 border border-gray-300 text-center w-1/12">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-[#f8fbe6] transition text-[#2f3e2e] "
                  >
                    <td className="p-3 border border-gray-200 font-medium">
                      {client.name}
                    </td>
                    <td className="p-3 border border-gray-200">
                      {client.address || "No especificada"}
                    </td>
                    <td className="p-3 border border-gray-200">
                      {client.phone || "No especificado"}
                    </td>
                    <td className="p-3 border border-gray-200">
                      {client.cats.length === 0 ? (
                        <span className="italic text-gray-500">—</span>
                      ) : (
                        <ul className="list-disc pl-4 space-y-1">
                          {client.cats.map((cat) => (
                            <li key={cat.id}>
                              {cat.name}
                              {cat.age && ` (${cat.age} años)`}
                              {cat.medical_condition && (
                                <span className="text-red-500 text-xs">
                                  {" "}
                                  - {cat.medical_condition}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="p-3 border border-gray-200 text-center">
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="text-red-600 hover:underline"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="mt-6 grid grid-cols-1 gap-4 md:hidden">
            {paginatedClients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-md cursor-pointer ${
                  currentPage === i + 1
                    ? "bg-[#304d30] text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}

      {isModalOpen && (
        <ModalFormClient isOpen={isModalOpen} onClose={handleCloseModal} />
      )}
    </div>
  );
}
