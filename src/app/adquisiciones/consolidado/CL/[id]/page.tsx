"use client";
import React, { useEffect, use } from "react";

interface cl_page_Props {
  params: Promise<{ tipo: string; id: string }>;
}
export default function ClPage({ params }: cl_page_Props) {
  const { id } = use(params);
  return (
    <div>
      <h1>Página CL</h1>
      <p>ID: {id}</p>
    </div>
  );
}
