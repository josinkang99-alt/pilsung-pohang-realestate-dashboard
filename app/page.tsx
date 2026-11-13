"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { apartments, dongOptions, trendData, type Apartment, type DealType } from "@/lib/pohang-data";
import { ArrowUpRight, Building2, CalendarDays, ChevronRight, CirclePlus, Coffee, GraduationCap, Landmark, MapPin, Phone, Search, Sparkles, TrainFront, TrendingUp, X } from "lucide-react";

type Period = "주간" | "월간";
type Recommendation = { id: number; aptId: number; title: string; note: string; price: string; tag: string };
const initialRecommendations: Recommendation[] = [
  { id: 101, aptId: 4, title: "양덕 학군 중심 로열동", note: "남향 · 중층 · 즉시입주 협의", price: "매매 4억 3,500", tag: "필승 PICK" },
  { id: 102, aptId: 3, title: "KTX 생활권 신축 추천", note: "초곡초 도보권 · 시스템에어컨", price: "매매 4억 7,200", tag: "신축" },
  { id: 103, aptId: 1, title: "대잠동 생활권 대표단지", note: "상태 우수 · 터미널 도보권", price: "전세 3억 5,000", tag: "가격조정" },
  { id: 104, aptId: 8, title: "철강산단 직주근접 입주권", note: "84㎡ · 남동향 · 탁 트인 조망", price: "매매 3억 7,500", tag: "입주추천" },
];
const facilityIcons = [TrainFront, GraduationCap, Coffee, Landmark];

function Logo() {
  return <div className="brand"><img className="brandImage" src="/brand-logo.jpg" alt="필승부동산 로고"/><span><b>필승부동산</b><small>POHANG PROPERTY BRIEF</small></span></div>;
}

function MiniMap({ apartment }: { apartment: Apartment }) {
  const bbox = `${apartment.lng - .012}%2C${apartment.lat - .008}%2C${apartment.lng + .012}%2C${apartment.lat + .008}`;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${apartment.lat}%2C${apartment.lng}`;
  return <div className="mapBox" aria-label={`${apartment.name} 위치 지도`}><iframe className="liveMap" title={`${apartment.name} 위치 지도`} loading="lazy" src={mapUrl}/><div className="mapPin"><MapPin size={20}/><span>{apartment.name}</span></div><div className="mapMeta"><span>{apartment.district} {apartment.dong}</span><a href={`https://map.naver.com/p/search/${encodeURIComponent("포항 " + apartment.name)}`} target="_blank" rel="noreferrer">큰 지도 보기 <ArrowUpRight size={13}/></a></div></div>;
}

export default function Home() {
  const [dealType, setDealType] = useState<DealType>("매매");
  const [period, setPeriod] = useState<Period>("월간");
  const [dong, setDong] = useState("전체");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(1);
  const [date, setDate] = useState("2026-10");
  const [apiState, setApiState] = useState({ source: "demo", count: 312, median: 38200 });
  const [recommendations, setRecommendations] = useState(initialRecommendations);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { const saved = localStorage.getItem("pilsung-recommendations"); if (saved) { try { setRecommendations(JSON.parse(saved)); } catch {} } }, []);
  useEffect(() => { fetch(`/api/transactions?month=${date}`).then((r) => r.json()).then((d) => setApiState(d)).catch(() => {}) }, [date]);
  const selected = apartments.find((a) => a.id === selectedId) || apartments[0];
  const ranked = useMemo(() => [...apartments].sort((a, b) => b.rawPrice[dealType] - a.rawPrice[dealType]), [dealType]);
  const dongList = apartments.filter((a) => (dong === "전체" || a.dong === dong) && a.name.includes(query));
  const chart = trendData[period]; const maxVolume = Math.max(...chart.map((d) => d.volume));
  function selectApartment(id: number) { setSelectedId(id); setTimeout(() => document.getElementById("location")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50) }
  function addRecommendation(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const fd = new FormData(e.currentTarget); const aptId = Number(fd.get("aptId")); const apt = apartments.find((a) => a.id === aptId)!; const next = [...recommendations, { id: Date.now(), aptId, title: String(fd.get("title") || apt.name), note: String(fd.get("note") || "상담 후 조건 조율"), price: String(fd.get("price") || `${dealType} ${apt.price[dealType]}`), tag: "신규" }]; setRecommendations(next); localStorage.setItem("pilsung-recommendations", JSON.stringify(next)); setShowAdd(false) }

  return <main>
    <header className="topbar"><Logo/><nav><a href="#market">시장동향</a><a href="#ranking">TOP 10</a><a href="#recommend">추천매물</a><a href="#location">입지분석</a></nav><a className="call" href="tel:01025155373"><Phone size={16}/><span><small>상담문의</small>010-2515-5373</span></a></header>
    <section className="hero"><div className="heroInner"><div><p className="eyebrow"><span/>POHANG REAL ESTATE INTELLIGENCE</p><h1>포항의 집값을<br/><em>한눈에, 정확하게.</em></h1><p className="heroCopy">공인중개사가 엄선한 실거래 데이터와 생활권 분석으로<br/>고객 브리핑을 더 쉽고 신뢰감 있게.</p><div className="address"><MapPin size={15}/>포항시 북구 새천년대로 1276-1, 111호</div></div><div className="heroPanel"><div className="panelHead"><span>포항 주택시장 온도</span><b>관망 속 회복</b></div><div className="temperature"><strong>64</strong><span>/ 100</span><i style={{ width: "64%" }}/></div><div className="panelMetrics"><div><small>매매지수</small><b>99.5</b><em>+0.18%</em></div><div><small>전세지수</small><b>99.2</b><em>+0.24%</em></div><div><small>월 거래량</small><b>{apiState.count}</b><em>+9.1%</em></div></div><p>기준 {date.replace("-", ".")} · 한국부동산원 / 국토교통부</p></div></div></section>

    <section className="dashboard section" id="market"><div className="sectionHeading"><div><p className="kicker">MARKET SNAPSHOT</p><h2>포항 아파트 시장 브리핑</h2></div><div className="dateTools"><div className="segmented">{(["주간","월간"] as Period[]).map((p) => <button key={p} className={period === p ? "active" : ""} onClick={() => setPeriod(p)}>{p}</button>)}</div><label><CalendarDays size={16}/><input type="month" value={date} onChange={(e) => setDate(e.target.value)}/></label></div></div>
      <div className="statsGrid"><article><span className="statIcon mint"><TrendingUp/></span><small>아파트 매매가격지수</small><strong>99.5</strong><p className="up">▲ 0.18% 전기 대비</p></article><article><span className="statIcon coral"><Building2/></span><small>최근 월 매매 거래량</small><strong>{apiState.count}<i>건</i></strong><p className="up">▲ 9.1% 전월 대비</p></article><article><span className="statIcon gold"><Landmark/></span><small>전용 84㎡ 중위가격</small><strong>{Math.round(apiState.median / 10000 * 10) / 10}<i>억원</i></strong><p>북구·남구 통합</p></article><article><span className="statIcon blue"><Sparkles/></span><small>미분양 추정 추이</small><strong>2,146<i>호</i></strong><p className="down">▼ 4.2% 전월 대비</p></article></div>
      <div className="trendCard"><div className="trendChart"><div className="cardTitle"><div><h3>{period} 가격지수 흐름</h3><p>한국부동산원 R-ONE 기준 · 2025.6=100</p></div><div className="legend"><span className="saleDot">매매</span><span className="rentDot">전세</span></div></div><ResponsiveContainer width="100%" height={245}><AreaChart data={chart} margin={{ top: 15, right: 8, bottom: 0, left: -25 }}><defs><linearGradient id="saleFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0d7c75" stopOpacity={0.2}/><stop offset="100%" stopColor="#0d7c75" stopOpacity={0}/></linearGradient></defs><CartesianGrid vertical={false} stroke="#e7e3db" strokeDasharray="3 3"/><XAxis dataKey="label" tickLine={false} axisLine={false}/><YAxis domain={[97, 101]} tickLine={false} axisLine={false}/><Tooltip/><Area type="monotone" dataKey="sale" stroke="#0d7c75" strokeWidth={3} fill="url(#saleFill)" name="매매지수"/><Area type="monotone" dataKey="jeonse" stroke="#f06b4f" strokeWidth={2} fill="transparent" name="전세지수"/></AreaChart></ResponsiveContainer></div><div className="volume"><div className="cardTitle"><div><h3>거래량</h3><p>{period} 신고 건수</p></div></div><div className="bars">{chart.map((d) => <div key={d.label}><b>{d.volume}</b><i style={{ height: `${Math.max(22, d.volume / maxVolume * 145)}px` }}/><span>{d.label}</span></div>)}</div></div></div></section>

    <section className="dongSection"><div className="section"><div className="sectionHeading"><div><p className="kicker">NEIGHBORHOOD FINDER</p><h2>동별 아파트 찾기</h2></div><label className="search"><Search size={17}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="아파트명 검색"/></label></div><div className="dongTabs">{dongOptions.map((d) => <button key={d} onClick={() => setDong(d)} className={dong === d ? "active" : ""}>{d}<span>{d === "전체" ? apartments.length : apartments.filter((a) => a.dong === d).length}</span></button>)}</div><div className="dongResults">{dongList.map((apt) => <button key={apt.id} onClick={() => selectApartment(apt.id)}><span><b>{apt.name}</b><small>{apt.district} {apt.dong} · {apt.built}년 · {apt.households.toLocaleString()}세대</small></span><strong>{dealType} {apt.price[dealType]}<ChevronRight size={16}/></strong></button>)}</div></div></section>

    <section className="section" id="ranking"><div className="sectionHeading"><div><p className="kicker">POHANG TOP 10</p><h2>지금 가장 주목받는 아파트</h2></div><p className="subcopy">실거래가·거래량·선호도를 종합한 브리핑 순위</p></div><div className="rankingCard"><div className="rankingList"><div className="dealTabs">{(["매매","전세","월세"] as DealType[]).map((t) => <button key={t} className={dealType === t ? "active" : ""} onClick={() => setDealType(t)}>{t}</button>)}</div><div className="rankScroll">{ranked.map((apt, i) => <button key={apt.id} className={selected.id === apt.id ? "selected" : ""} onClick={() => setSelectedId(apt.id)}><span className="rank">{String(i + 1).padStart(2, "0")}</span><span className="rankInfo"><b>{apt.name}{apt.badge && <em>{apt.badge}</em>}</b><small>{apt.district} {apt.dong} · {apt.area} · {apt.built}</small></span><span className="rankPrice"><b>{apt.price[dealType]}</b><small className={apt.change >= 0 ? "up" : "down"}>{apt.change >= 0 ? "+" : ""}{apt.change}%</small></span></button>)}</div></div><div className="mapSide"><MiniMap apartment={selected}/><div className="selectedSummary"><div><p>{selected.district} {selected.dong}</p><h3>{selected.name}</h3><span>{selected.address} · {selected.households.toLocaleString()}세대</span></div><div><small>최근 {dealType} 실거래</small><strong>{selected.price[dealType]}</strong><span>{selected.area} · 신고 {selected.deals}건</span></div></div></div></div></section>

    <section className="recommendWrap" id="recommend"><div className="section"><div className="sectionHeading light"><div><p className="kicker">PILSUNG RECOMMENDS</p><h2>필승부동산 추천매물</h2><p>현장 확인과 권리분석을 거친 상담 우선 매물입니다.</p></div><button className="addBtn" onClick={() => setShowAdd(true)}><CirclePlus size={18}/>추천매물 추가</button></div><div className="recommendGrid">{recommendations.slice(-4).map((rec) => { const apt = apartments.find((a) => a.id === rec.aptId) || apartments[0]; return <button key={rec.id} onClick={() => selectApartment(apt.id)} className="propertyCard"><div className="propertyVisual"><span>{rec.tag}</span><div className="buildingShape"><i/><i/><i/></div><small>{apt.dong}</small></div><div className="propertyInfo"><p>{rec.title}</p><h3>{apt.name}</h3><span>{rec.note}</span><strong>{rec.price}</strong><small>입지분석 보기 <ChevronRight size={14}/></small></div></button>})}</div></div></section>

    <section className="section locationSection" id="location"><div className="sectionHeading"><div><p className="kicker">LOCATION ANALYSIS</p><h2>{selected.name} 입지 브리핑</h2></div><div className="score"><span>입지 종합점수</span><strong>{selected.id === 1 ? 91 : 82 + selected.id % 8}</strong><small>/ 100</small></div></div><div className="locationHero"><MiniMap apartment={selected}/><div className="locationSummary"><p>{selected.district} {selected.dong} · {selected.built}년 준공</p><h3>{selected.name}</h3><div><span><b>{selected.households.toLocaleString()}</b> 세대</span><span><b>{selected.area}</b> 대표면적</span><span><b>{selected.deals}</b> 최근거래</span></div><blockquote>“{selected.dong} 생활권의 교통·교육·상권을 균형 있게 누리는 단지로, 실거주와 자산가치 관점에서 함께 살펴볼 만합니다.”</blockquote></div></div><div className="facilityGrid">{[["교통", selected.transport, "KTX·버스·도로"], ["학군", selected.schools, "초·중·고 통학권"], ["생활상권", selected.commerce, "마트·카페·관공서"], ["개발계획", selected.development, "미래가치 체크"]].map(([title, items, desc], idx) => { const Icon = facilityIcons[idx]; return <article key={title as string}><div className="facilityHead"><span><Icon/></span><div><h3>{title as string}</h3><p>{desc as string}</p></div></div><ul>{(items as string[]).map((item) => <li key={item}><i/>{item}</li>)}</ul></article>})}</div><p className="disclaimer">※ 개발계획 및 거리 정보는 브리핑 참고용이며, 실제 계약 전 관계기관 고시·현장 확인이 필요합니다. 실거래 자료는 신고 취소·정정에 따라 달라질 수 있습니다.</p></section>

    <footer><div><Logo/><p>포항 아파트를 가장 잘 아는 지역전문 공인중개사</p></div><div><b>필승부동산</b><span>포항시 북구 새천년대로 1276-1, 111호</span><span>대표전화 010-2515-5373</span></div><div><small>DATA SOURCES</small><span>국토교통부 실거래가 공개시스템</span><span>한국부동산원 R-ONE</span></div></footer>

    {showAdd && <div className="modalBackdrop" onMouseDown={() => setShowAdd(false)}><form className="modal" onSubmit={addRecommendation} onMouseDown={(e) => e.stopPropagation()}><button type="button" className="modalClose" onClick={() => setShowAdd(false)}><X/></button><p className="kicker">NEW LISTING</p><h2>추천매물 추가</h2><label>아파트<select name="aptId">{apartments.map((a) => <option key={a.id} value={a.id}>{a.name} · {a.dong}</option>)}</select></label><label>추천 제목<input name="title" placeholder="예: 양덕 학군 중심 로열동" required/></label><label>가격<input name="price" placeholder="예: 매매 4억 3,500" required/></label><label>한 줄 설명<input name="note" placeholder="예: 남향 · 중층 · 즉시입주"/></label><button className="submitBtn">추천매물에 등록</button></form></div>}
  </main>;
}
