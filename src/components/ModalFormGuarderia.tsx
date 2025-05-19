"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import ClientSelect from "./ClientSelect"; // Asegúrate de tenerlo en la misma carpeta

interface ModalFormGuarderiaProps {
  isOpen: boolean;
  onClose: () => void;
  onGuarderiaCreated?: () => void;
}

type Client = {
  id: string;
  name: string;
  cats: {
    name: string;
  }[];
};

export default function ModalFormGuarderia({
  isOpen,
  onClose,
  onGuarderiaCreated,
}: ModalFormGuarderiaProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [visits, setVisits] = useState<{ date: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name, cats(name)");

      if (error) {
        setError("Error cargando clientes");
      } else {
        setClients(data || []);
      }
    };

    if (isOpen) {
      fetchClients();
    }
  }, [isOpen]);

  const handleAddVisit = () => {
    setVisits([...visits, { date: "" }]);
  };

  const handleChangeVisit = (index: number, value: string) => {
    const newVisits = [...visits];
    newVisits[index].date = value;
    setVisits(newVisits);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    if (!selectedClient || visits.length === 0) {
      setError("Selecciona un cliente y al menos una visita");
      setLoading(false);
      return;
    }

    const { data: guarderia, error: insertError } = await supabase
      .from("guarderias")
      .insert({ client_id: selectedClient.id })
      .select()
      .single();

    if (insertError || !guarderia) {
      setError("Error creando guardería");
      setLoading(false);
      return;
    }

    const { error: visitsError } = await supabase
      .from("guarderias_visits")
      .insert(
        visits.map((visit) => ({
          guarderia_id: guarderia.id,
          date: visit.date,
        }))
      );

    if (visitsError) {
      setError("Error agregando visitas");
      setLoading(false);
      return;
    }

    onGuarderiaCreated?.();
    onClose();
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-5/6 md:w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold text-[#163020] text-center">
          Nueva guardería
        </h2>

        {error && <p className="text-red-600">{error}</p>}

        <div>
          <label className="block font-medium mb-1">Cliente:</label>
          <ClientSelect
            clients={clients}
            selectedClient={selectedClient}
            onChange={setSelectedClient}
          />
        </div>

        <div className="space-y-2">
          <p className="font-medium">Fechas:</p>
          {visits.map((visit, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="date"
                value={visit.date}
                onChange={(e) => handleChangeVisit(index, e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddVisit}
            className="text-sm text-blue-600 font-semibold hover:underline cursor-pointer"
          >
            + Agregar otra fecha
          </button>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="bg-[#163020] text-white px-4 py-2 rounded hover:bg-[#2c4a1c]"
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
