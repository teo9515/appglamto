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
  const [loading, setLoading] = useState(true);

  const COP = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
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
      setLoading(false);
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
    if (!monto || isNaN(monto) || monto <= 0) {
      setNotificacion("⚠️ Ingresa un monto válido");
      return;
    }

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

  const eliminarAbono = async (abonoId: string, guarderiaId: string) => {
    const { error } = await supabase
      .from("pagos_guarderias")
      .delete()
      .eq("id", abonoId);

    if (error) {
      console.error("Error al eliminar abono:", error);
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

    setNotificacion("🗑️ Abono eliminado correctamente");
    setTimeout(() => setNotificacion(null), 3000);
  };

  const calcularTotalAbonado = (guarderiaId: string) => {
    return pagos
      .filter((pago) => pago.guarderia_id === guarderiaId)
      .reduce((total, pago) => total + pago.monto, 0);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const terminadas = guarderias.filter((g) =>
    g.guarderias_visits.every((v) => new Date(v.date) < today)
  );

  const pendientes = guarderias.filter((g) =>
    g.guarderias_visits.some((v) => new Date(v.date) >= today)
  );

  const procesarGuarderia = (guarderia: Guarderia) => {
    const numGatos = guarderia.clients?.cats?.length || 0;
    const visitas = guarderia.guarderias_visits || [];
    const precioPorVisita = calcularPrecio(numGatos);
    const total = visitas.length * precioPorVisita;
    const gasolina = total * 0.1;
    const cuidador = total * 0.4;
    const glamto = total * 0.5;
    const totalAbonado = calcularTotalAbonado(guarderia.id);
    const saldoPendiente = total - totalAbonado;
    const sinDeuda = saldoPendiente === 0;

    return {
      numGatos,
      visitas,
      precioPorVisita,
      total,
      gasolina,
      cuidador,
      glamto,
      totalAbonado,
      saldoPendiente,
      sinDeuda,
    };
  };

  const renderTarjetas = (lista: Guarderia[], titulo: string) => (
    <div className="mb-12">
      <h2 className="text-xl font-semibold mb-2">{titulo}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {lista.map((guarderia) => {
          const datos = procesarGuarderia(guarderia);
          const abonos = pagos.filter((p) => p.guarderia_id === guarderia.id);

          return (
            <div
              key={guarderia.id}
              className="rounded-lg p-4 shadow-lg shadow-black bg-white"
            >
              <h3 className="text-xl font-bold text-[#163020]">
                {guarderia.clients?.name}
              </h3>
              <p className="text-sm text-gray-700 font-semibold">
                {guarderia.clients?.cats?.map((cat) => cat.name).join(", ")}
              </p>
              <div className="mt-4">
                <p className="text-[#163020]">
                  <strong>Visitas:</strong> {datos.visitas.length}
                </p>
                <p className="text-[#163020]">
                  <strong>Gatos:</strong> {datos.numGatos}
                </p>
                <p className="text-[#163020]">
                  <strong>Valor por visita:</strong>{" "}
                  {COP.format(datos.precioPorVisita)}
                </p>
                <p className="text-green-700">
                  <strong>Total:</strong> {COP.format(datos.total)}
                </p>
                <p className="text-[#163020]">
                  <strong>Abono:</strong>
                  <input
                    type="text"
                    value={
                      nuevoAbonos[guarderia.id]
                        ? new Intl.NumberFormat("es-CO").format(
                            nuevoAbonos[guarderia.id]
                          )
                        : ""
                    }
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\D/g, "");
                      setNuevoAbonos((prev) => ({
                        ...prev,
                        [guarderia.id]: Number(rawValue),
                      }));
                    }}
                    placeholder="$"
                    className="w-24 border p-1 text-sm rounded ml-2"
                  />
                  <button
                    onClick={() =>
                      agregarAbono(guarderia.id, nuevoAbonos[guarderia.id] || 0)
                    }
                    className="ml-2 bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                  >
                    Registrar
                  </button>
                </p>

                {abonos.length > 0 && (
                  <ul className="mt-2 space-y-1 text-sm text-green-700">
                    {abonos.map((abono) => (
                      <li
                        key={abono.id}
                        className="flex justify-between items-center"
                      >
                        <span>
                          {COP.format(abono.monto)} —{" "}
                          {new Date(abono.fecha).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => eliminarAbono(abono.id, guarderia.id)}
                          className="text-red-600 text-xs hover:underline"
                        >
                          Eliminar
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <p className="text-[#163020] mt-2">
                  <strong>Saldo Pendiente:</strong>{" "}
                  {COP.format(datos.saldoPendiente)}
                </p>
                <p className="text-[#163020]">
                  <strong>10% Gasolina:</strong> {COP.format(datos.gasolina)}
                </p>
                <p className="text-[#163020]">
                  <strong>40% Cuidador:</strong> {COP.format(datos.cuidador)}
                </p>
                <p className="text-[#163020]">
                  <strong>50% Glamto:</strong> {COP.format(datos.glamto)}
                </p>
                <p
                  className={datos.sinDeuda ? "text-green-600" : "text-red-600"}
                >
                  <strong>Deuda:</strong>{" "}
                  {datos.sinDeuda ? "Sin deuda" : "Con deuda"}
                </p>
                <p
                  className={
                    datos.visitas.every((v) => new Date(v.date) < today)
                      ? "text-green-600"
                      : "text-yellow-600"
                  }
                >
                  <strong>Estado:</strong>{" "}
                  {datos.visitas.every((v) => new Date(v.date) < today)
                    ? "Terminada"
                    : "Pendiente"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl py-10 mx-auto p-4 space-y-8 md:space-y-8">
      <div className="flex flex-wrap gap-5 items-center justify-center space-y-5">
        <h1 className="text-5xl font-bold text-[#163020] text-center">
          Resumen financiero
        </h1>
        <div className="w-full flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-5 mb-5 md:mb-3">
          <Link
            href="/"
            className="btn-primary flex justify-center items-center"
          >
            <button>Home</button>
          </Link>
          <Link
            href="/"
            className="btn-secondary flex justify-center items-center"
          >
            <button className="cursor-pointer">Guarderías</button>
          </Link>
        </div>
      </div>

      {notificacion && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-800 rounded">
          {notificacion}
        </div>
      )}

      {loading ? (
        <p className="text-center">Cargando datos financieros...</p>
      ) : (
        <>
          {renderTarjetas(pendientes, "Guarderías Pendientes")}
          {renderTarjetas(terminadas, "Guarderías Terminadas")}
        </>
      )}
    </div>
  );
}
