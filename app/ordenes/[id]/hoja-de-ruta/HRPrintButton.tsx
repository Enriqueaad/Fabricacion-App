"use client";

export default function HRPrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium print:hidden"
    >
      🖨️ Imprimir
    </button>
  );
}
