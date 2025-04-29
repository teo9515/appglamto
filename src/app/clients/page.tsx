"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import ModalFormClient from "../../components/ModalFormClient";

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

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase.from("clients").select(`
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
        `);

      if (error) {
        setError(error.message);
      } else {
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

  if (loading) return <p className="p-4">Cargando clientes...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error}</p>;

  return (
    <div className="h-full w-full p-4 flex flex-col">
      <div className="w-full flex flex-col items-center gap-6">
        <div className="w-full flex items-center justify-center">
          <h1 className="text-3xl font-bold text-[rgb(22,48,32)]">
            Clientes registrados
          </h1>
          <span className="ml-2 text-xl font-normal text-gray-600">
            ({clients.length} total)
          </span>
        </div>

        <div className="space-x-4 w-10/12 flex justify-between h-full">
          <button className="btn-primary" onClick={handleOpenModal}>
            Nuevo cliente
          </button>

          <Link href="/">
            <button className="btn-secondary">Home</button>
          </Link>
        </div>
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 w-full md:w-1/2 p-2 border border-gray-300 rounded-md"
        />
      </div>

      {filteredClients.length === 0 ? (
        <p>No hay clientes aún.</p>
      ) : (
        <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-y-auto max-h-[600px] lg:max-h-[500px]">
            <table className="w-full table-auto border-collapse text-sm">
              <thead className="bg-[#dbe3b6] text-[#163020] sticky top-0 z-10">
                <tr>
                  <th className="p-2 border border-gray-300 text-center">
                    Nombre
                  </th>
                  <th className="p-2 border border-gray-300 text-center">
                    Dirección
                  </th>
                  <th className="p-2 border border-gray-300 text-center">
                    Teléfono
                  </th>
                  <th className="p-2 border border-gray-300 text-center">
                    Gatos
                  </th>
                  <th className="p-2 border border-gray-300 text-center">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-[#f8fbe6] transition text-[#2f3e2e]"
                  >
                    <td className="p-2 border border-gray-200 font-medium">
                      {client.name}
                    </td>
                    <td className="p-2 border border-gray-200">
                      {client.address || "No especificada"}
                    </td>
                    <td className="p-2 border border-gray-200">
                      {client.phone || "No especificado"}
                    </td>
                    <td className="p-2 border border-gray-200">
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
                    <td className="p-2 border border-gray-200">
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
        </div>
      )}

      {isModalOpen && (
        <ModalFormClient isOpen={isModalOpen} onClose={handleCloseModal} />
      )}
    </div>
  );
}
