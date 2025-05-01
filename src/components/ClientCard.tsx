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

export default function ClientCard({
  client,
  onDelete,
}: {
  client: Client;
  onDelete: (id: string) => void;
}) {
  return (
    <div className=" rounded-lg p-4 shadow-lg shadow-black bg-white ">
      <h2 className="text-xl font-bold text-[#163020]">{client.name}</h2>
      <p className="text-sm text-[#163020]">
        <strong>Dirección:</strong> {client.address || "No especificada"}
      </p>
      <p className="text-sm text-[#163020]">
        <strong>Teléfono:</strong> {client.phone || "No especificado"}
      </p>
      <div className="mt-2">
        <strong>Gatos:</strong>
        {client.cats.length === 0 ? (
          <p className="italic text-gray-500">—</p>
        ) : (
          <ul className="list-disc list-inside text-sm text-gray-700">
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
      </div>
      <button
        onClick={() => onDelete(client.id)}
        className="text-red-600 hover:underline text-sm mt-2"
      >
        Eliminar
      </button>
    </div>
  );
}
