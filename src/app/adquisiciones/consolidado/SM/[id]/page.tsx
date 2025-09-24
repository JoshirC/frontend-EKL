"use client";
import React, { useEffect, use } from "react";

interface ss_page_Props {
  params: Promise<{ tipo: string; id: string }>;
}
export default function SsPage({ params }: ss_page_Props) {
  const { id } = use(params);
  return (
    <div>
      <h1>Página SM</h1>
      <p>ID: {id}</p>
    </div>
  );
}
