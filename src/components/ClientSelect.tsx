"use client";

import { Combobox } from "@headlessui/react";
import { useState } from "react";

type Client = {
  id: string;
  name: string;
  cats: {
    name: string;
  }[];
};

interface Props {
  clients: Client[];
  selectedClient: Client | null;
  onChange: (client: Client | null) => void;
}

export default function ClientSelect({
  clients,
  selectedClient,
  onChange,
}: Props) {
  const [query, setQuery] = useState("");

  const filteredClients =
    query === ""
      ? clients
      : clients.filter((client) =>
          client.name.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <Combobox value={selectedClient} onChange={onChange}>
      <div className="relative">
        <Combobox.Input
          className="w-full border rounded-md px-3 py-2"
          displayValue={(client: Client | null) => client?.name || ""}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar cliente..."
        />
        {filteredClients.length > 0 && (
          <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg z-10">
            {filteredClients.map((client) => (
              <Combobox.Option
                key={client.id}
                value={client}
                className={({ active }) =>
                  `cursor-pointer px-4 py-2 ${
                    active ? "bg-indigo-600 text-white" : "text-gray-900"
                  }`
                }
              >
                {client.name}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
        {filteredClients.length === 0 && query !== "" && (
          <div className="absolute mt-1 w-full bg-white border rounded-md px-4 py-2 text-gray-500 shadow z-10">
            No se encontró ningún cliente.
          </div>
        )}
      </div>
    </Combobox>
  );
}
