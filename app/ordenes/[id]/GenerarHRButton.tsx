"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function GenerarHRButton({ ordenId }: { ordenId: number }) {
  const [generando, setGenerando] = useState(false);
  const router = useRouter();

  const generar = async () => {
    setGenerando(true);
    const res = await fetch(`/api/ordenes/${ordenId}/generar`, { method: "POST" });
    if (res.ok) {
      router.push(`/ordenes/${ordenId}/hoja-de-ruta`);
    } else {
      alert("Error al generar la hoja de ruta");
      setGenerando(false);
    }
  };

  return (
    <Button onClick={generar} disabled={generando} className="w-full">
      {generando ? "Generando..." : "Generar Hoja de Ruta"}
    </Button>
  );
}
