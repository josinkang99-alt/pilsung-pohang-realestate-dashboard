import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const key = process.env.REB_API_KEY;
  const statbl = process.env.REB_STATBL_ID;
  if (!key || !statbl) return NextResponse.json({ source: "demo", sale: 99.5, jeonse: 99.2, change: 0.18 });
  try {
    const url = new URL("https://www.reb.or.kr/r-one/openapi/SttsApiTblData.do");
    url.searchParams.set("KEY", key); url.searchParams.set("Type", "json"); url.searchParams.set("pIndex", "1");
    url.searchParams.set("pSize", "24"); url.searchParams.set("STATBL_ID", statbl);
    url.searchParams.set("START_WRTTIME", request.nextUrl.searchParams.get("year") || "2025");
    const res = await fetch(url, { next: { revalidate: 21600 } });
    if (!res.ok) throw new Error("reb");
    return NextResponse.json({ source: "reb", data: await res.json() });
  } catch {
    return NextResponse.json({ source: "demo", sale: 99.5, jeonse: 99.2, change: 0.18 });
  }
}
