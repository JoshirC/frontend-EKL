import React from "react";

interface ListaVaciaProps {
  mensaje?: string;
}

const ListaVacia: React.FC<ListaVaciaProps> = ({ mensaje }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full m-5">
      <p>{mensaje}</p>
    </div>
  );
};

export default ListaVacia;
