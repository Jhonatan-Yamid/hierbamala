"use client";

import SalesForm from "../page";

export default function EditSalePage({ params }) {
  return (
    <div className="container mx-auto p-4">
      <SalesForm saleId={params.id} />
    </div>
  );
}