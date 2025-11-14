import type { TDocumentDefinitions } from "pdfmake/interfaces";
import { loadImageAsBase64 } from "./getBase64Image";
import { Pallet } from "@/types/graphql";

async function loadPdfMake() {
  const pdfMakeModule = await import("pdfmake/build/pdfmake");
  const pdfMake = (pdfMakeModule as any).default || (pdfMakeModule as any);
  const pdfFonts = await import("pdfmake/build/vfs_fonts");
  (pdfMake as any).vfs = (pdfFonts as any).vfs;
  return pdfMake;
}

export async function generarPalletPdf(pallet: Pallet, centroCosto: string) {
  const pdfMake = await loadPdfMake();

  // Cargar PNG desde public en base64
  const logo_base64 = await loadImageAsBase64("/logo_ekl_color.png");

  // Fecha actual formateada
  const fechaActual = new Date().toLocaleDateString("es-CL");

  const tablaProductos =
    pallet.envios?.map((e) => [
      e.producto?.familia ?? "",
      e.producto?.codigo ?? "",
      e.producto?.nombre_producto ?? "",
      e.producto?.unidad_medida ?? "",
      e.cantidad_enviada ?? 0,
    ]) ?? [];

  const docDefinition: TDocumentDefinitions = {
    pageMargins: [40, 80, 40, 60], // más espacio para footer

    header: {
      margin: [40, 20, 40, 0],
      columns: [
        {
          image: logo_base64,
          width: 120,
        },
        {
          width: "*",
          alignment: "center",
          stack: [
            {
              text: centroCosto,
              fontSize: 16,
              bold: true,
            },
          ],
        },

        {
          width: "auto",
          alignment: "right",
          stack: [
            {
              text: `Pallet Nº ${pallet.numero_pallet}`,
              fontSize: 10,
              bold: true,
            },
            {
              text: `Fecha preparación: ${fechaActual}`,
              fontSize: 10,
              margin: [0, 2, 0, 0],
            },
          ],
        },
      ],
    },

    footer: function (currentPage, pageCount) {
      return {
        text: `Página ${currentPage} de ${pageCount}`,
        alignment: "center",
        margin: [0, 20, 0, 0],
        fontSize: 9,
      };
    },

    content: [
      { text: "Listado de Productos", style: "sectionTitle" },

      {
        style: "tableStyle",
        table: {
          headerRows: 1,
          widths: [80, 80, "*", 50, 50],

          body: [
            [
              { text: "Familia", style: "tableHeader" },
              { text: "Código", style: "tableHeader" },
              { text: "Nombre Producto", style: "tableHeader" },
              { text: "Unidad", style: "tableHeader" },
              { text: "Cantidad", style: "tableHeader" },
            ],
            ...tablaProductos,
          ],
        },
        layout: {
          fillColor: (rowIndex) => (rowIndex === 0 ? "#eeeeee" : null),
        },
      },
    ],

    styles: {
      sectionTitle: { fontSize: 14, bold: true, margin: [0, 0, 0, 10] },
      tableHeader: { bold: true, fontSize: 10 },
      tableStyle: { margin: [0, 0, 0, 10] },
    },
  };

  pdfMake.createPdf(docDefinition).open();
}
