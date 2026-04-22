const FAIXAS_POR_COMMODITY: Record<string, [number, number]> = {
  Soja: [120, 150],
  Milho: [55, 75],
  "Café Arábica": [900, 1200],
  "Café Robusta": [600, 800],
  Açúcar: [90, 120],
  Algodão: [400, 550],
  Trigo: [70, 90],
  Sorgo: [40, 60],
};

function ajusteRegional(praca: string) {
  const seed = [...praca].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return ((seed % 21) - 10) / 100;
}

export async function buscarCotacao(
  commodity: string,
  praca: string
): Promise<number> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const faixa = FAIXAS_POR_COMMODITY[commodity] ?? [50, 200];
  const [min, max] = faixa;
  const base = min + Math.random() * (max - min);
  const ajuste = 1 + ajusteRegional(praca);

  return Number((base * ajuste).toFixed(2));
}
