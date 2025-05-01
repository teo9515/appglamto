"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Visit = {
  id: string;
  date: string;
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

type Pago = {
  id: string;
  guarderia_id: string;
  monto: number;
  forma_pago?: "efectivo" | "transferencia";
  fecha: string;
};

export default function FinanzasPage() {
  const [guarderias, setGuarderias] = useState<Guarderia[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [nuevoAbonos, setNuevoAbonos] = useState<{ [key: string]: number }>({});
  const [notificacion, setNotificacion] = useState<string | null>(null);

  const COP = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("guarderias")
        .select(
          "id, clients(id, name, cats(name)), guarderias_visits(id, date)"
        );

      if (error) {
        console.error("Error fetching guarderías:", error);
        return;
      }

      setGuarderias(data as unknown as Guarderia[]);

      const { data: pagosData, error: pagosError } = await supabase
        .from("pagos_guarderias")
        .select("*");

      if (pagosError) {
        console.error("Error fetching pagos:", pagosError);
        return;
      }

      setPagos(pagosData as unknown as Pago[]);
    };

    fetchData();
  }, []);

  const calcularPrecio = (numGatos: number) => {
    if (numGatos === 1) return 40000;
    if (numGatos === 2) return 60000;
    if (numGatos >= 3 && numGatos <= 5) return 80000;
    return 80000;
  };

  const agregarAbono = async (guarderiaId: string, monto: number) => {
    if (!monto || monto <= 0) return;

    const { error } = await supabase.from("pagos_guarderias").insert([
      {
        guarderia_id: guarderiaId,
        monto,
        forma_pago: "transferencia",
        fecha: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Error al agregar abono:", error);
      return;
    }

    const { data: pagosActualizados } = await supabase
      .from("pagos_guarderias")
      .select("*")
      .eq("guarderia_id", guarderiaId);

    setPagos((prevPagos) => [
      ...prevPagos.filter((p) => p.guarderia_id !== guarderiaId),
      ...(pagosActualizados as unknown as Pago[]),
    ]);

    setNuevoAbonos((prev) => ({ ...prev, [guarderiaId]: 0 }));
    setNotificacion("✅ Abono registrado exitosamente");

    setTimeout(() => setNotificacion(null), 3000);
  };

  const calcularTotalAbonado = (guarderiaId: string) => {
    return pagos
      .filter((pago) => pago.guarderia_id === guarderiaId)
      .reduce((total, pago) => total + pago.monto, 0);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const terminadas = guarderias.filter((guarderia) =>
    guarderia.guarderias_visits.every((visit) => {
      const visitDate = new Date(`${visit.date}`);
      return visitDate < today;
    })
  );

  const pendientes = guarderias.filter((guarderia) =>
    guarderia.guarderias_visits.some((visit) => {
      const visitDate = new Date(`${visit.date}`);
      return visitDate >= today;
    })
  );

  const renderTarjetas = (lista: Guarderia[], titulo: string) => (
    <div className="mb-12">
      <h2 className="text-xl font-semibold mb-2">{titulo}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {lista.map((guarderia) => {
          const numGatos = guarderia.clients?.cats?.length || 0;
          const precioPorVisita = calcularPrecio(numGatos);
          const visitas = guarderia.guarderias_visits || [];
          const total = visitas.length * precioPorVisita;
          const gasolina = total * 0.1;
          const cuidador = total * 0.4;
          const glamto = total * 0.5;
          const totalAbonado = calcularTotalAbonado(guarderia.id);
          const saldoPendiente = total - totalAbonado;
          const sinDeuda = saldoPendiente === 0;

          const isCompleted = visitas.every((visit) => {
            const visitDate = new Date(`${visit.date}`);
            return visitDate < today;
          });

          return (
            <div
              key={guarderia.id}
              className="bg-white border rounded-lg shadow-md p-4"
            >
              <h3 className="font-bold text-lg">{guarderia.clients?.name}</h3>
              <p className="text-sm text-gray-600">
                {guarderia.clients?.cats?.map((cat) => cat.name).join(", ")}
              </p>
              <div className="mt-4">
                <p>
                  <strong>Visitas:</strong> {visitas.length}
                </p>
                <p>
                  <strong>Gatos:</strong> {numGatos}
                </p>
                <p>
                  <strong>Valor por visita:</strong>{" "}
                  {COP.format(precioPorVisita)}
                </p>
                <p>
                  <strong>Total:</strong> {COP.format(total)}
                </p>
                <p>
                  <strong>10% Gasolina:</strong> {COP.format(gasolina)}
                </p>
                <p>
                  <strong>40% Cuidador:</strong> {COP.format(cuidador)}
                </p>
                <p>
                  <strong>50% Glamto:</strong> {COP.format(glamto)}
                </p>
                <p>
                  <strong>Abono:</strong>
                  <input
                    type="number"
                    value={nuevoAbonos[guarderia.id] || ""}
                    onChange={(e) =>
                      setNuevoAbonos((prev) => ({
                        ...prev,
                        [guarderia.id]: Number(e.target.value),
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        agregarAbono(
                          guarderia.id,
                          nuevoAbonos[guarderia.id] || 0
                        );
                      }
                    }}
                    placeholder="$"
                    className="w-24 border p-1 text-sm rounded"
                  />
                </p>
                <p>
                  <strong>Saldo Pendiente:</strong> {COP.format(saldoPendiente)}
                </p>
                <p className={sinDeuda ? "text-green-600" : "text-red-600"}>
                  <strong>Deuda:</strong> {sinDeuda ? "Sin deuda" : "Con deuda"}
                </p>
                <p
                  className={isCompleted ? "text-green-600" : "text-yellow-600"}
                >
                  <strong>Estado:</strong>{" "}
                  {isCompleted ? "Terminada" : "Pendiente"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex">
        <h1 className="text-2xl font-bold mb-6">Resumen financiero</h1>
        <Link href="/" className="btn-primary flex justify-center items-center">
          <button>Home</button>
        </Link>
      </div>
      {notificacion && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-800 rounded">
          {notificacion}
        </div>
      )}
      {renderTarjetas(pendientes, "Guarderías Pendientes")}
      {renderTarjetas(terminadas, "Guarderías Terminadas")}
    </div>
  );
}
