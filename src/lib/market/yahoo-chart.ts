const YAHOO_CHART = "https://query1.finance.yahoo.com/v8/finance/chart";
const USER_AGENT =
  "Mozilla/5.0 (compatible; KabarDesk/1.0; +https://kabardesk.id)";

export type YahooQuote = {
  price: number;
  changePercent: number;
};

type YahooChartJson = {
  chart?: {
    result?: Array<{
      meta?: {
        regularMarketPrice?: number;
        regularMarketChangePercent?: number;
        chartPreviousClose?: number;
      };
    }>;
  };
};

function changePercent(
  price: number,
  previousClose: number | undefined,
  fromMeta: number | undefined,
): number {
  if (fromMeta != null && Number.isFinite(fromMeta)) return fromMeta;
  if (previousClose != null && previousClose !== 0) {
    return ((price - previousClose) / previousClose) * 100;
  }
  return 0;
}

export async function fetchYahooQuote(symbol: string): Promise<YahooQuote | null> {
  const url = `${YAHOO_CHART}/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as YahooChartJson;
  const meta = data.chart?.result?.[0]?.meta;
  const price = meta?.regularMarketPrice;
  if (price == null || !Number.isFinite(price)) return null;

  return {
    price,
    changePercent: changePercent(
      price,
      meta?.chartPreviousClose,
      meta?.regularMarketChangePercent,
    ),
  };
}

/** Troy ounce → gram (spot gold conversion) */
export const TROY_OZ_GRAMS = 31.1034768;
