"use client";
export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-4 py-2 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-900 print:hidden"
    >
      Imprimir
    </button>
  );
}
