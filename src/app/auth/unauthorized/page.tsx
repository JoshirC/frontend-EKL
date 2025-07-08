"use client";

export default function Unauthorized() {
  return (
    <div
      className="fixed inset-0 bg-gray-100 flex items-center justify-center overflow-hidden"
      style={{ minHeight: "100vh" }}
    >
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-16 h-16 mx-auto text-red-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Acceso No Autorizado
        </h1>
        <p className="text-gray-600 mb-6">
          Lo sentimos, no tienes permisos para acceder a esta página de la
          aplicación.
        </p>
        <button
          className="bg-orange-400 text-white font-semibold px-3 sm:px-4 py-2 w-full rounded hover:bg-orange-500 transition duration-300"
          onClick={() => {
            window.location.href = "/"; // Redirige a la página de inicio
          }}
        >
          Volver al Inicio
        </button>
      </div>
    </div>
  );
}
