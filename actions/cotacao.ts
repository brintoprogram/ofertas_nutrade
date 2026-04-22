"use server";

import * as cheerio from "cheerio";

/**
 * Slugs do Notícias Agrícolas (fonte primária). Algumas commodities partilham
 * a mesma página (café, por exemplo); filtramos por seção depois.
 */
const SLUGS: Record<string, string> = {
  Soja: "soja",
  Milho: "milho",
  "Café Arábica": "cafe",
  "Café Robusta": "cafe",
  Açúcar: "acucar",
  Algodão: "algodao",
  Trigo: "trigo",
  Sorgo: "sorgo",
};

const BASE = "https://www.noticiasagricolas.com.br/cotacoes";

export type CotacaoSucesso = {
  ok: true;
  preco: number;
  moeda: "BRL";
  source: string;
  matchedPraca: string;
  exact: boolean;
  fetchedAt: string;
  sourceUrl: string;
};

export type CotacaoErro = {
  ok: false;
  message: string;
};

export type CotacaoResult = CotacaoSucesso | CotacaoErro;

type ScrapedRow = {
  local: string;
  preco: number;
  sectionTitle: string;
};

const DIACRITICS_RE = /[̀-ͯ]/g;

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS_RE, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePrecoBR(raw: string): number | null {
  // Aceita formatos: "R$ 132,50", "132,50", "1.234,56", "1234.56"
  const cleaned = raw.replace(/R\$|\s|%/g, "").trim();
  if (!cleaned) return null;

  let normalized: string;
  if (cleaned.includes(",") && cleaned.includes(".")) {
    // "1.234,56" → remove pontos (milhar) e troca vírgula por ponto
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (cleaned.includes(",")) {
    normalized = cleaned.replace(",", ".");
  } else {
    normalized = cleaned;
  }

  const n = Number.parseFloat(normalized);
  if (!Number.isFinite(n) || n <= 0 || n > 1_000_000) return null;
  return n;
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; NutradeBot/1.0; +https://nutrade.app)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "pt-BR,pt;q=0.9",
      },
      cache: "no-store",
    });

    clearTimeout(timeout);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function extractRows(html: string): ScrapedRow[] {
  const $ = cheerio.load(html);
  const rows: ScrapedRow[] = [];

  $("table").each((_, table) => {
    // Tenta pegar um título próximo à tabela para contextualizar a fonte
    let title = "";
    const prev = $(table).prevAll("h1, h2, h3, h4, .titulo, .title, strong")
      .first();
    if (prev.length) title = prev.text().trim();
    if (!title) {
      const parent = $(table).parent();
      const parentTitle = parent
        .find("h1, h2, h3, h4, .titulo, .title")
        .first()
        .text()
        .trim();
      title = parentTitle || "Notícias Agrícolas";
    }

    $(table)
      .find("tbody tr, tr")
      .each((_, tr) => {
        const cells = $(tr)
          .find("td")
          .map((_, td) => $(td).text().trim())
          .get();
        if (cells.length < 2) return;

        const local = cells[0];
        if (!local || local.length < 3) return;
        // Ignora linhas agregadoras tipo "Média", "Fechamento", etc. se necessário
        // (mantém-se para mostrar algo quando não houver match)

        for (let i = 1; i < cells.length; i++) {
          const preco = parsePrecoBR(cells[i]);
          if (preco !== null) {
            rows.push({ local, preco, sectionTitle: title });
            break;
          }
        }
      });
  });

  return rows;
}

function matchRow(
  rows: ScrapedRow[],
  pracaUsuario: string
): { row: ScrapedRow; exact: boolean } | null {
  if (rows.length === 0) return null;

  const parts = pracaUsuario.split(/[\/\-]/).map((p) => normalize(p));
  const city = parts[0] ?? "";
  const state = parts[1] ?? "";

  if (city.length >= 3) {
    const cityState = rows.find((r) => {
      const n = normalize(r.local);
      return n.includes(city) && (!state || n.includes(state));
    });
    if (cityState) return { row: cityState, exact: true };

    const cityOnly = rows.find((r) => normalize(r.local).includes(city));
    if (cityOnly) return { row: cityOnly, exact: true };
  }

  if (state) {
    const stateOnly = rows.find((r) => normalize(r.local).includes(state));
    if (stateOnly) return { row: stateOnly, exact: false };
  }

  return null;
}

/**
 * Busca a cotação real da commodity na praça informada via scraping de
 * Notícias Agrícolas. Se não encontrar match exato, retorna a média das
 * cotações disponíveis como referência. Se a requisição falhar
 * completamente, devolve um erro — sem fallback simulado, pra deixar
 * explícito pro usuário que não foi possível trazer valor real.
 */
export async function buscarCotacao(
  commodity: string,
  praca: string
): Promise<CotacaoResult> {
  const slug = SLUGS[commodity];
  if (!slug) {
    return {
      ok: false,
      message: `Commodity "${commodity}" não suportada para cotação automática.`,
    };
  }

  const url = `${BASE}/${slug}`;
  const html = await fetchHtml(url);

  if (!html) {
    return {
      ok: false,
      message:
        "Não foi possível acessar a fonte de cotações (Notícias Agrícolas). Tente novamente em instantes.",
    };
  }

  const rows = extractRows(html);
  if (rows.length === 0) {
    return {
      ok: false,
      message:
        "A página de cotações foi carregada mas nenhum preço pôde ser extraído. A estrutura da fonte pode ter mudado.",
    };
  }

  const match = matchRow(rows, praca);
  const fetchedAt = new Date().toISOString();

  if (match) {
    return {
      ok: true,
      preco: Number(match.row.preco.toFixed(2)),
      moeda: "BRL",
      source: `Notícias Agrícolas — ${match.row.sectionTitle}`,
      matchedPraca: match.row.local,
      exact: match.exact,
      fetchedAt,
      sourceUrl: url,
    };
  }

  // Sem match: devolve a média das cotações encontradas como referência
  const media =
    rows.reduce((acc, r) => acc + r.preco, 0) / rows.length;

  return {
    ok: true,
    preco: Number(media.toFixed(2)),
    moeda: "BRL",
    source: `Notícias Agrícolas — média nacional (${rows.length} praças)`,
    matchedPraca: "Média nacional",
    exact: false,
    fetchedAt,
    sourceUrl: url,
  };
}
