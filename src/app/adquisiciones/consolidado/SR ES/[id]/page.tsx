"use client";
import React, { useEffect, use } from "react";

interface sr_es_page_Props {
  params: Promise<{ tipo: string; id: string }>;
}
export default function SrEsPage({ params }: sr_es_page_Props) {
  const { id } = use(params);
  return (
    <div>
      <h1>Página SR ES</h1>
      <p>ID: {id}</p>
    </div>
  );
}
