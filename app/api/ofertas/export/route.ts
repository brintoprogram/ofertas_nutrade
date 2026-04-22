import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { format, parseISO } from "date-fns";

import { supabaseAdmin, type OfertaRowComCriador } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("ofertas")
    .select("*, criador:usuarios!criado_por(id, nome, email)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[export] erro ao buscar ofertas:", error);
    return NextResponse.json(
      { error: "Falha ao buscar ofertas." },
      { status: 500 }
    );
  }

  const ofertas = (data ?? []) as unknown as OfertaRowComCriador[];

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Nutrade — Plataforma de Ofertas";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Ofertas", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = [
    { header: "Criado em",              key: "created_at",              width: 20 },
    { header: "Criado por (nome)",      key: "criador_nome",            width: 26 },
    { header: "Criado por (e-mail)",    key: "criador_email",           width: 30 },
    { header: "Nome Parent",            key: "nome_parent",             width: 22 },
    { header: "Nome Sold To",           key: "nome_sold_to",            width: 28 },
    { header: "Commodity",              key: "commodity",               width: 16 },
    { header: "Praça",                  key: "praca",                   width: 22 },
    { header: "Local Retirada/Entrega", key: "local_retirada_entrega",  width: 28 },
    { header: "Quantidade SC",          key: "quantidade_sc",           width: 16 },
    { header: "Quantidade TON",         key: "quantidade_ton",          width: 16 },
    { header: "Prazo de Entrega",       key: "prazo_entrega",           width: 18 },
    { header: "Preço",                  key: "preco",                   width: 14 },
    { header: "Moeda",                  key: "moeda",                   width: 10 },
    { header: "Valor Total",            key: "valor_total",             width: 18 },
    { header: "Pagamento",              key: "pagamento",               width: 18 },
    { header: "ID",                     key: "id",                      width: 38 },
  ];

  // cabeçalho estilizado
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.alignment = { vertical: "middle", horizontal: "left" };
  headerRow.height = 22;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0E6B34" }, // verde Nutrade
    };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FF0A5027" } },
    };
  });

  for (const o of ofertas) {
    sheet.addRow({
      created_at: format(parseISO(o.created_at), "dd/MM/yyyy HH:mm"),
      criador_nome: o.criador?.nome ?? "—",
      criador_email: o.criador?.email ?? "—",
      nome_parent: o.nome_parent,
      nome_sold_to: o.nome_sold_to,
      commodity: o.commodity,
      praca: o.praca,
      local_retirada_entrega: o.local_retirada_entrega,
      quantidade_sc: Number(o.quantidade_sc),
      quantidade_ton: Number(o.quantidade_ton),
      prazo_entrega: format(parseISO(o.prazo_entrega), "dd/MM/yyyy"),
      preco: Number(o.preco),
      moeda: o.moeda,
      valor_total: Number(o.preco) * Number(o.quantidade_sc),
      pagamento: format(parseISO(o.pagamento), "dd/MM/yyyy"),
      id: o.id,
    });
  }

  // formatos numéricos
  sheet.getColumn("quantidade_sc").numFmt = "#,##0";
  sheet.getColumn("quantidade_ton").numFmt = "#,##0.000";
  sheet.getColumn("preco").numFmt = "#,##0.0000";
  sheet.getColumn("valor_total").numFmt = "#,##0.00";

  // zebra stripes nas linhas de dados
  for (let i = 2; i <= ofertas.length + 1; i++) {
    if (i % 2 === 0) {
      sheet.getRow(i).eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF4F8F5" },
        };
      });
    }
  }

  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: sheet.columns.length },
  };

  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `ofertas-nutrade-${format(new Date(), "yyyy-MM-dd-HHmm")}.xlsx`;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
