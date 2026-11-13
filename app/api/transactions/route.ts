import { NextRequest, NextResponse } from "next/server";

const fallback = { source: "demo", updatedAt: "2026-11-13", count: 312, median: 38200, message: "API 미연결 시 브리핑용 표본 데이터" };
function getTag(xml: string, tag: string) { return xml.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?</${tag}>`))?.[1]?.trim() ?? ""; }

export async function GET(request: NextRequest) {
  const key = process.env.PUBLIC_DATA_API_KEY;
  const month = request.nextUrl.searchParams.get("month")?.replace(/-/g, "") || "202610";
  if (!key) return NextResponse.json(fallback);
  try {
    const results = await Promise.all(["47111", "47113"].map(async (lawd) => {
      const url = new URL("https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade");
      url.searchParams.set("serviceKey", key); url.searchParams.set("LAWD_CD", lawd);
      url.searchParams.set("DEAL_YMD", month.slice(0, 6)); url.searchParams.set("numOfRows", "999");
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (!res.ok) throw new Error(`public-data ${res.status}`);
      const xml = await res.text();
      return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => ({ apartment: getTag(m[1], "aptNm"), dong: getTag(m[1], "umdNm"), price: Number(getTag(m[1], "dealAmount").replace(/,/g, "")), area: getTag(m[1], "excluUseAr"), floor: getTag(m[1], "floor"), day: getTag(m[1], "dealDay") }));
    }));
    const items = results.flat().filter((x) => x.apartment && x.price);
    const sorted = items.map((x) => x.price).sort((a, b) => a - b);
    return NextResponse.json({ source: "data.go.kr", updatedAt: new Date().toISOString(), count: items.length, median: sorted[Math.floor(sorted.length / 2)] || 0, items: items.slice(0, 80) });
  } catch {
    return NextResponse.json({ ...fallback, message: "공공데이터 응답 지연 — 표본 데이터로 표시 중" });
  }
}
