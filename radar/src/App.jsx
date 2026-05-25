import { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } from "react";

/* ─────────────────────────────────────────────────────────────────────────
   CSS GLOBAL — injetado via useEffect no <head>
───────────────────────────────────────────────────────────────────────── */
const CSS = [
  "@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Share+Tech+Mono&display=swap');",
  "*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}",
  "html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#03050d;color:#f0f0f0;font-family:'Nunito',sans-serif}","#root{width:100%;height:100%;margin:0;padding:0}",
  "::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#080c18}::-webkit-scrollbar-thumb{background:#1c2540;border-radius:2px}::-webkit-scrollbar-thumb:hover{background:#d432c8}",
  "@keyframes popIn{0%{transform:scale(.5);opacity:0}70%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}",
  "@keyframes glowPink{0%,100%{box-shadow:0 0 6px 1px rgba(220,50,180,.35)}50%{box-shadow:0 0 14px 4px rgba(220,50,180,.55)}}",
  "@keyframes rowIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}",
  "@keyframes blink{0%,100%{opacity:1}50%{opacity:.15}}",
  "@keyframes gradShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}",
  "@keyframes pulseBorder{0%,100%{border-color:rgba(220,50,180,.4)}50%{border-color:rgba(220,50,180,.95)}}",
  "@keyframes toastIn{from{opacity:0;transform:translateX(50px)}to{opacity:1;transform:translateX(0)}}",
  "@keyframes pulseP{0%,100%{box-shadow:0 0 0 0 rgba(220,50,180,0)}50%{box-shadow:0 0 14px 4px rgba(220,50,180,.4)}}",
  "@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}",
  "@keyframes fadeIn{from{opacity:0}to{opacity:1}}",
  "@keyframes slideRight{from{opacity:0;transform:translateX(-30px)}to{opacity:1;transform:translateX(0)}}",
].join("\n");

/* ─────────────────────────────────────────────────────────────────────────
   CONTEXT API — estado centralizado
───────────────────────────────────────────────────────────────────────── */
const RadarContext = createContext(null);
const useRadar = () => useContext(RadarContext);

/* ─────────────────────────────────────────────────────────────────────────
   PAINEL LATERAL DIREITO — feed contextual de eventos ≥10x
   Fixo, independente do zoom, com scroll próprio
───────────────────────────────────────────────────────────────────────── */
function PainelLateral({ plat }) {
  const { allLines } = useRadar();
  const painelRef = useRef(null);

  // Cor verde terminal fosforescente
  const VERDE       = "#7CFF7C";
  const VERDE_DIM   = "rgba(124,255,124,0.55)"; // horário — opacidade reduzida
  const VERDE_TITLE = "rgba(124,255,124,0.35)"; // título

  // Extrair eventos ≥10x — cada linha = 1 bloco contextual
  const eventos = useMemo(() => {
    const evts = [];
    allLines.filter(l => l.hot && !l.open).forEach(line => {
      const hotCells = line.cells.filter(c => c.multiplier >= 10);
      if (!hotCells.length) return;
      evts.push({
        casas:         hotCells.map(hc => `${hc.casa}°`),
        multiplicadores: hotCells.map(hc => fmt(hc.multiplier)),
        horario:       hotCells[hotCells.length - 1].time,
        count:         hotCells.length,
      });
    });
    return evts; // cronológico — antigo no topo, novo embaixo
  }, [allLines]);

  // Auto-scroll para o final quando novo evento chega
  useEffect(() => {
    if (painelRef.current) {
      painelRef.current.scrollTop = painelRef.current.scrollHeight;
    }
  }, [eventos.length]);

  return (
    <div style={{
      position:   "fixed",
      top: 0, right: 0,
      width:    "clamp(220px, 22vw, 320px)",
      minWidth: 220,
      maxWidth: 320,
      height:   "100vh",
      background: "#03070d",
      borderLeft: `1px solid ${VERDE}18`,
      display:    "flex",
      flexDirection: "column",
      zIndex:     100,
      fontFamily: "'JetBrains Mono','Fira Code','IBM Plex Mono','Source Code Pro','Share Tech Mono',monospace",
    }}>

      {/* ── Cabeçalho ── */}
      <div style={{
        padding: "12px 14px 10px",
        borderBottom: `1px solid ${VERDE}18`,
        flexShrink: 0,
      }}>
        <div style={{
          fontSize: 8, color: VERDE_TITLE,
          letterSpacing: 3, marginBottom: 2,
        }}>◈ RADAR · FEED ≥10x</div>
        <div style={{
          fontSize: 7, color: VERDE_TITLE,
          letterSpacing: 1, opacity: .6,
        }}>{eventos.length} eventos registrados</div>
      </div>

      {/* ── Lista de blocos com scroll próprio ── */}
      <div ref={painelRef} style={{
        flex: 1,
        overflowY: "auto",
        padding: "10px 14px",
        scrollbarWidth: "thin",
        scrollbarColor: `${VERDE}22 transparent`,
      }}>
        {eventos.length === 0 ? (
          <div style={{
            color: VERDE_TITLE, fontSize: 8,
            textAlign: "center", marginTop: 32,
            lineHeight: 2, letterSpacing: 1,
          }}>
            aguardando<br/>eventos ≥10x
          </div>
        ) : eventos.map((ev, i) => (
          <div key={i} style={{
            marginBottom: 20,
            paddingBottom: 12,
            borderBottom: `1px solid ${VERDE}12`,
          }}>
            {/* Linha 1 — casas + multiplicadores */}
            <div style={{
              fontSize: 14,
              color: VERDE,
              letterSpacing: .5,
              lineHeight: 1.6,
              marginBottom: 5,
            }}>
              <span style={{ opacity:.85 }}>
                {ev.casas.join("/")}
              </span>
              <span style={{ opacity:.4, margin:"0 7px" }}>—</span>
              <span style={{ opacity:.95 }}>
                {ev.multiplicadores.join(" / ")}
              </span>
            </div>

            {/* Linha 2 — horário com opacidade reduzida */}
            <div style={{
              fontSize: 11,
              color: VERDE_DIM,
              letterSpacing: 1,
              paddingLeft: 2,
            }}>
              {ev.horario}
            </div>
          </div>
        ))}
      </div>

      {/* ── Rodapé ── */}
      <div style={{
        padding: "8px 14px",
        borderTop: `1px solid ${VERDE}18`,
        flexShrink: 0,
      }}>
        <div style={{
          fontSize: 6, color: VERDE_TITLE,
          letterSpacing: 2, textAlign: "center", opacity: .5,
        }}>
          RADAR AVIATOR · CONTEXTUAL
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   RÉGUA DE CASAS — barra fixa inferior 1°→30°
───────────────────────────────────────────────────────────────────────── */
function ReguaCasas({ sizeCfg, zoom }) {
  // Valores idênticos ao GridLine para alinhamento perfeito
  const casaW   = sizeCfg.px<=72 ? 72 : sizeCfg.px<=96 ? 88 : 108;
  const gap     = sizeCfg.px<=72 ? 3  : sizeCfg.px<=96 ? 4  : 5;
  // Mesmo padding horizontal do container do grid
  const padLeft = 14;

  return (
    <div style={{
      flexShrink: 0,
      background: "#080a14",
      borderTop: "1px solid #1a1d2a",
      padding: "5px 0",
      overflowX: "hidden",
    }}>
      {/* Mesmo zoom do grid */}
      <div style={{
        display: "flex",
        alignItems: "center",
        zoom: zoom,
        width: `${100/zoom}%`,
        paddingLeft: padLeft, // compensar padding do grid
      }}>
        {/* Espaço idêntico à coluna CASA */}
        <div style={{ width: casaW, minWidth: casaW, flexShrink:0 }}/>

        {/* Números com divisores visuais */}
        <div style={{ display:"flex", flex:1 }}>
          {Array.from({ length: 30 }, (_, i) => i + 1).map((n, idx) => (
            <div key={n} style={{
              width:        sizeCfg.px,
              minWidth:     sizeCfg.px,
              flexShrink:   0,
              marginRight:  gap,
              position:     "relative",
              display:      "flex",
              alignItems:   "center",
              justifyContent: "center",
            }}>
              {/* Linha divisória à esquerda de cada coluna */}
              <div style={{
                position:   "absolute",
                left:       0,
                top:        "15%",
                bottom:     "15%",
                width:      1,
                background: "#1a1d2a",
              }}/>
              <span style={{
                fontFamily:    "'Share Tech Mono',monospace",
                fontSize:      sizeCfg.px<=72 ? 18 : sizeCfg.px<=96 ? 21 : 26,
                fontWeight:    700,
                letterSpacing: 0.3,
                color:         "#2d3a5a",
                userSelect:    "none",
                position:      "relative", // sobre a linha divisória
                zIndex:        1,
              }}>
                {n}°
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   PLATAFORMAS E JOGOS
   status:   "online" | "testing" | "soon"
   protocol: "socketio" | "websocket" | "soketi"
   Campos marcados com ⚠️ precisam ser preenchidos após teste no notebook.
───────────────────────────────────────────────────────────────────────── */
const PLATFORMS = [
  // ── ApostaX — 3 jogos confirmados no mesmo socket ────────────────────
  {
    id: "apostax", name: "ApostaX", domain: "apostax.bet",
    color: "#d432c8", color2: "#7a0090", icon: "✈",
    status: "online", desc: "3 jogos disponíveis",
    games: [
      {
        id: "apostax_spribe", name: "Aviator Spribe", badge: "SPRIBE",
        icon: "✈", color: "#d432c8", color2: "#7a0090",
        status: "online", protocol: "gamehack",
        source: "ApostaX Gráfico 1",
        desc: "Versão original · Spribe",
      },
      {
        id: "apostax_vip", name: "Aviator VIP", badge: "VIP",
        icon: "👑", color: "#f5a623", color2: "#a06010",
        status: "online", protocol: "gamehack",
        source: "ApostaX Gráfico 2",
        desc: "Versão VIP · ApostaX",
      },
      {
        id: "apostax_premium", name: "Aviator Premium", badge: "PREMIUM",
        icon: "💜", color: "#9c27b0", color2: "#4a0072",
        status: "online", protocol: "gamehack",
        source: "ApostaX Gráfico 3",
        desc: "Versão Premium · ApostaX",
      },
    ],
  },
  // ── ApostaTudo — confirmado no mesmo socket ───────────────────────────
  {
    id: "apostatudo", name: "ApostaTudo", domain: "apostatudo.bet",
    color: "#29b6f6", color2: "#0077aa", icon: "💎",
    status: "online", protocol: "socketio",
    protocol: "gamehack",
    source: "ApostaTudo Gráfico 1",
    desc: "Aviator · Dados em tempo real",
  },
  // ── ApostaMax — endpoint mapeado, aguarda teste ───────────────────────
  {
    id: "apostamax", name: "ApostaMax", domain: "apostamax.bet.br",
    color: "#f5a623", color2: "#a06010", icon: "🔥",
    status: "testing", protocol: "websocket",
    endpoint: "wss://api5.s.cactusgaming.net/websocket/services",
    path: "?master&domain=apostamax.bet.br&version=1.3.383",
    event: null, fields: { mult: null, time: null },
    desc: "Aviator · Em teste",
  },
  // ── Lotogreen — endpoint mapeado, aguarda teste ───────────────────────
  {
    id: "lotogreen", name: "Lotogreen", domain: "lotogreen.bet.br",
    color: "#39d353", color2: "#1a7a28", icon: "🍀",
    status: "testing", protocol: "soketi",
    endpoint: "soketi-lotogreen.cometagaming.com",
    appKey: "soketi_app_key_dbe50c1ff66ea", wsPort: 443,
    channel: null, event: null, fields: { mult: null, time: null },
    desc: "Aviator · Em teste",
  },
  // ── Bet365 / BetBoom — pendentes ─────────────────────────────────────
  {
    id: "bet365", name: "Bet365", domain: "bet365.com",
    color: "#00a651", color2: "#006830", icon: "⚽",
    status: "soon", desc: "Em breve · Endpoint pendente",
  },
  {
    id: "betboom", name: "BetBoom", domain: "betboom.com",
    color: "#ff5252", color2: "#aa1010", icon: "💣",
    status: "soon", desc: "Em breve · Endpoint pendente",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
   TELA 1 — SELEÇÃO DE PLATAFORMA
───────────────────────────────────────────────────────────────────────── */
function PlatformCard({ plat, onSelect, delay }) {
  const isOnline  = plat.status === "online";
  const isTesting = plat.status === "testing";
  const [hovered, setHovered] = useState(false);
  const active = isOnline || isTesting;

  return (
    <div
      onClick={() => active && onSelect(plat)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered && active ? `linear-gradient(135deg,${plat.color}22,${plat.color2}11)` : "rgba(255,255,255,.03)",
        border: `1px solid ${hovered && active ? plat.color + "66" : "#1c2540"}`,
        borderRadius: 16, padding: "22px 18px",
        cursor: active ? "pointer" : "default",
        opacity: active ? 1 : 0.45,
        transition: "all .25s",
        transform: hovered && active ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered && active ? `0 8px 32px ${plat.color}22` : "none",
        animation: `fadeUp .5s ease ${delay}s both`,
        display: "flex", flexDirection: "column", gap: 10,
        position: "relative", overflow: "hidden",
      }}
    >
      <div style={{ position:"absolute", top:-20, right:-20, width:80, height:80, borderRadius:"50%", background:`radial-gradient(circle,${plat.color}15,transparent 70%)`, pointerEvents:"none" }}/>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ width:42, height:42, borderRadius:12, background:`linear-gradient(135deg,${plat.color},${plat.color2})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, boxShadow: isOnline ? `0 0 16px ${plat.color}44` : "none" }}>{plat.icon}</div>
        <div style={{ display:"flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, background: isOnline ? "rgba(0,230,118,.12)" : isTesting ? "rgba(245,166,35,.12)" : "rgba(255,255,255,.05)", border:`1px solid ${isOnline?"rgba(0,230,118,.3)":isTesting?"rgba(245,166,35,.3)":"#1c2540"}` }}>
          <div style={{ width:5, height:5, borderRadius:"50%", background: isOnline?"#00e676":isTesting?"#f5a623":"#3d4f72", animation: active?"blink 1.2s infinite":"none" }}/>
          <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:7, letterSpacing:1.5, color: isOnline?"#00e676":isTesting?"#f5a623":"#3d4f72" }}>{isOnline?"ONLINE":isTesting?"EM TESTE":"EM BREVE"}</span>
        </div>
      </div>

      <div>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:18, fontWeight:900, color: active?"#fff":"#4a5580", letterSpacing:.5 }}>{plat.name}</div>
        <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:"#2d3a5a", letterSpacing:1, marginTop:2 }}>{plat.domain}</div>
      </div>

      <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color: active?"#4a5580":"#2d3a5a", letterSpacing:.5, lineHeight:1.5 }}>{plat.desc}</div>

      {active && (
        <div style={{ marginTop:4, background: hovered?plat.color:"transparent", border:`1px solid ${hovered?plat.color:plat.color+"44"}`, borderRadius:8, padding:"7px 0", textAlign:"center", fontFamily:"'Share Tech Mono',monospace", fontSize:9, letterSpacing:2, color: hovered?"#fff":plat.color, transition:"all .2s" }}>
          {hovered ? "ACESSAR →" : isTesting ? "TESTAR" : "AVIATOR"}
        </div>
      )}
    </div>
  );
}

function SelectScreen({ onSelect }) {
  return (
    <div style={{ minHeight:"100vh", width:"100%", background:"#03050d", display:"flex", flexDirection:"column", alignItems:"center", padding:"32px 20px 40px", overflow:"auto" }}>
      <div style={{ textAlign:"center", marginBottom:36, animation:"fadeUp .4s ease both" }}>
        <div style={{ width:56, height:56, borderRadius:16, margin:"0 auto 16px", background:"linear-gradient(135deg,#d432c8,#7a0000)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, boxShadow:"0 0 30px rgba(212,50,200,.4)" }}>✈</div>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:26, fontWeight:900, letterSpacing:2, background:"linear-gradient(90deg,#d432c8,#7c3aed,#29b6f6)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:6 }}>RADAR AVIATOR</div>
        <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#2d3a5a", letterSpacing:3 }}>SELECIONE A PLATAFORMA</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:14, width:"100%", maxWidth:800 }}>
        {PLATFORMS.map((p, i) => <PlatformCard key={p.id} plat={p} onSelect={onSelect} delay={i * 0.07} />)}
      </div>
      <div style={{ marginTop:32, fontFamily:"'Share Tech Mono',monospace", fontSize:7, color:"#1c2540", letterSpacing:2, textAlign:"center", animation:"fadeUp .5s ease .6s both" }}>
        RADAR AVIATOR · ANÁLISE ESTATÍSTICA · APENAS LEITURA
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   TELA 2 — SELEÇÃO DE JOGO (dentro da plataforma)
───────────────────────────────────────────────────────────────────────── */
function GameCard({ game, onSelect, delay }) {
  const isOnline  = game.status === "online";
  const isTesting = game.status === "testing";
  const [hovered, setHovered] = useState(false);
  const active = isOnline || isTesting;

  return (
    <div
      onClick={() => active && onSelect(game)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered && active ? `linear-gradient(135deg,${game.color}22,${game.color2}11)` : "rgba(255,255,255,.03)",
        border: `1px solid ${hovered && active ? game.color + "66" : "#1c2540"}`,
        borderRadius:16, padding:"28px 24px",
        cursor: active?"pointer":"default",
        opacity: active?1:0.45,
        transition:"all .25s",
        transform: hovered && active ? "translateY(-5px)" : "translateY(0)",
        boxShadow: hovered && active ? `0 10px 40px ${game.color}22` : "none",
        animation: `fadeUp .4s ease ${delay}s both`,
        display:"flex", flexDirection:"column", alignItems:"center",
        gap:14, textAlign:"center", position:"relative", overflow:"hidden",
        flex:1, minWidth:180, maxWidth:260,
      }}
    >
      <div style={{ position:"absolute", top:-30, left:"50%", transform:"translateX(-50%)", width:100, height:100, borderRadius:"50%", background:`radial-gradient(circle,${game.color}18,transparent 70%)`, pointerEvents:"none" }}/>
      <div style={{ width:64, height:64, borderRadius:18, background:`linear-gradient(135deg,${game.color},${game.color2})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, boxShadow: active?`0 0 24px ${game.color}55`:"none" }}>{game.icon}</div>
      <div style={{ padding:"3px 12px", borderRadius:20, background:`${game.color}22`, border:`1px solid ${game.color}44`, fontFamily:"'Share Tech Mono',monospace", fontSize:8, letterSpacing:2, color:game.color }}>{game.badge || game.name}</div>
      <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:20, fontWeight:900, color: active?"#fff":"#4a5580", lineHeight:1.2 }}>{game.name}</div>
      <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color: active?"#4a5580":"#2d3a5a", letterSpacing:.5, lineHeight:1.5 }}>{game.desc}</div>
      <div style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 12px", borderRadius:20, background: isOnline?"rgba(0,230,118,.1)":isTesting?"rgba(245,166,35,.1)":"rgba(255,255,255,.04)", border:`1px solid ${isOnline?"rgba(0,230,118,.3)":isTesting?"rgba(245,166,35,.3)":"#1c2540"}` }}>
        <div style={{ width:5, height:5, borderRadius:"50%", background: isOnline?"#00e676":isTesting?"#f5a623":"#3d4f72", animation: active?"blink 1.2s infinite":"none" }}/>
        <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:7, letterSpacing:1.5, color: isOnline?"#00e676":isTesting?"#f5a623":"#3d4f72" }}>{isOnline?"ONLINE":isTesting?"EM TESTE":"EM BREVE"}</span>
      </div>
    </div>
  );
}

function GameSelectScreen({ plat, onSelect, onBack }) {
  return (
    <div style={{ minHeight:"100vh", width:"100%", background:"#03050d", display:"flex", flexDirection:"column", alignItems:"center", padding:"32px 20px 40px", overflow:"auto" }}>
      <div style={{ width:"100%", maxWidth:600, marginBottom:32, animation:"fadeUp .35s ease both" }}>
        <button onClick={onBack} style={{ background:"rgba(255,255,255,.04)", border:"1px solid #1c2540", borderRadius:8, padding:"6px 14px", cursor:"pointer", color:"#4a5580", fontFamily:"'Share Tech Mono',monospace", fontSize:8, letterSpacing:1, display:"flex", alignItems:"center", gap:6, marginBottom:24, transition:"all .15s" }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=plat.color;e.currentTarget.style.color=plat.color;}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor="#1c2540";e.currentTarget.style.color="#4a5580";}}>
          ← VOLTAR
        </button>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:`linear-gradient(135deg,${plat.color},${plat.color2})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, boxShadow:`0 0 20px ${plat.color}44` }}>{plat.icon}</div>
          <div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:22, fontWeight:900, letterSpacing:1 }}>{plat.name}</div>
            <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:"#2d3a5a", letterSpacing:2 }}>SELECIONE O JOGO</div>
          </div>
        </div>
        <div style={{ height:1, background:`linear-gradient(90deg,${plat.color}66,transparent)` }}/>
      </div>
      <div style={{ display:"flex", gap:16, flexWrap:"wrap", justifyContent:"center", width:"100%", maxWidth:600 }}>
        {plat.games.map((g, i) => <GameCard key={g.id} game={g} onSelect={onSelect} delay={i * 0.1} />)}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   LÓGICA ESTATÍSTICA
───────────────────────────────────────────────────────────────────────── */
function getTier(v) {
  if (v >= 10) return { bg:"linear-gradient(135deg,#c42ab8,#8a0088)", border:"#d450c8", glow:"glowPink 2.5s infinite", isPink:true,  color:"pink"   };
  if (v >= 2)  return { bg:"linear-gradient(135deg,#6a30d0,#4a1a9a)", border:"#8a4fe0", glow:"none",                   isPink:false, color:"purple" };
  return             { bg:"linear-gradient(135deg,#0c90d8,#025888)", border:"#2aaae8",  glow:"none",                   isPink:false, color:"blue"   };
}

function fmt(v) {
  // Formato exato do game:
  // < 1000  → ponto decimal apenas:          1.99 / 350.42 / 732.55
  // >= 1000 → vírgula milhar + ponto decimal: 1,453.54 / 8,745.55 / 35,147.36
  if (v >= 1000) {
    // Formata manualmente para garantir independência da localização do SO
    const parts = v.toFixed(2).split(".");
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return intPart + "." + parts[1];
  }
  return v.toFixed(2);
}

const LINE_LIMIT = 30;

function buildLines(rounds, limit) {
  if (!rounds.length) return [];
  const lim = limit || LINE_LIMIT;
  const lines = []; let cur = []; let hot = false;
  const close = (isHot) => { lines.push({ cells:[...cur], hot:isHot, open:false }); cur = []; hot = false; };
  rounds.forEach(r => {
    if (r.multiplier >= 10) { cur.push({ ...r, casa: cur.length + 1 }); hot = true; }
    else {
      if (hot) close(true);
      cur.push({ ...r, casa: cur.length + 1 });
      if (cur.length >= lim) close(false);
    }
  });
  if (cur.length) lines.push({ cells: cur, hot, open: true });
  return lines;
}

function hasEspelho(line) {
  let s = 0;
  for (const c of line.cells) {
    if (c.multiplier >= 10) { s++; if (s >= 2) return true; } else s = 0;
  }
  return false;
}

function applyFilter(lines, filter) {
  if (!filter || filter === "TUDO") return lines;
  if (filter === "50x")     return lines.filter(l => l.cells.some(c => c.multiplier >= 50));
  if (filter === "100x")    return lines.filter(l => l.cells.some(c => c.multiplier >= 100));
  if (filter === "500x")    return lines.filter(l => l.cells.some(c => c.multiplier >= 500));
  if (filter === "ESPELHO") return lines.filter(l => hasEspelho(l));
  return lines;
}

// Ausência calculada APENAS dentro do subconjunto de velas ≥10x
function calcAusencia(rounds, thr) {
  if (!rounds.length) return 0;
  const rosas = rounds.filter(r => r.multiplier >= 10);
  if (!rosas.length) return 0;
  let n = 0;
  for (let i = rosas.length - 1; i >= 0; i--) {
    if (rosas[i].multiplier >= thr) break;
    n++;
  }
  return n;
}

/* ─────────────────────────────────────────────────────────────────────────
   GERADOR DE DADOS DEMO
───────────────────────────────────────────────────────────────────────── */
let _id = 1;

function genOne() {
  const r = Math.random(); let v;
  if      (r < .30) v = +(Math.random() * .98  + 1.01).toFixed(2);
  else if (r < .60) v = +(Math.random() * 7.99 + 2.0 ).toFixed(2);
  else if (r < .80) v = +(Math.random() * 20   + 10  ).toFixed(2);
  else if (r < .93) v = +(Math.random() * 70   + 30  ).toFixed(2);
  else              v = +(Math.random() * 400  + 100  ).toFixed(2);
  const d = new Date();
  const tier = getTier(v);
  return {
    id:         _id++,
    multiplier: v,
    time:       [d.getHours(), d.getMinutes(), d.getSeconds()].map(n => String(n).padStart(2,"0")).join(":"),
    timestamp:  d.getTime(),
    house:      "DEMO",
    color:      tier.color,
    metadata:   {},
  };
}

function genBatch(n) {
  const now = Date.now();
  return Array.from({ length: n }, (_, i) => {
    const r = Math.random(); let v;
    if      (r < .30) v = +(Math.random() * .98  + 1.01).toFixed(2);
    else if (r < .60) v = +(Math.random() * 7.99 + 2.0 ).toFixed(2);
    else if (r < .80) v = +(Math.random() * 20   + 10  ).toFixed(2);
    else if (r < .93) v = +(Math.random() * 70   + 30  ).toFixed(2);
    else              v = +(Math.random() * 400  + 100  ).toFixed(2);
    const d = new Date(now - (n - i) * 25000);
    const tier = getTier(v);
    return {
      id:         _id++,
      multiplier: v,
      time:       [d.getHours(), d.getMinutes(), d.getSeconds()].map(n => String(n).padStart(2,"0")).join(":"),
      timestamp:  d.getTime(),
      house:      "DEMO",
      color:      tier.color,
      metadata:   {},
    };
  });
}

/* ─────────────────────────────────────────────────────────────────────────
   PARSER DE DADOS REAIS
   Formato primário (arquivo coletado):
     Linha ímpar → multiplicador (ex: 17.51)
     Linha par   → horário       (ex: 18:39:56)
   Também aceita valores separados por espaço/vírgula numa linha só.
   A ordem do arquivo é do mais recente para o mais antigo.
   O parser inverte para ordem cronológica.
───────────────────────────────────────────────────────────────────────── */
function parseInput(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const rounds = [];
  let id = Date.now();

  const isTimeStr = s => /^\d{1,2}:\d{2}:\d{2}$/.test(s);
  const isMultStr = s => !isNaN(parseFloat(s)) && parseFloat(s) >= 1;

  // Formato alternado: multiplicador / horário em linhas separadas
  if (lines.length >= 2 && isMultStr(lines[0]) && isTimeStr(lines[1])) {
    let i = 0;
    while (i < lines.length) {
      const multStr = lines[i];
      const timeStr = lines[i + 1];
      if (isMultStr(multStr) && timeStr && isTimeStr(timeStr)) {
        const mult = parseFloat(multStr);
        if (mult >= 1 && mult < 100000) {
          const tier = getTier(mult);
          rounds.push({
            id:         id++,
            multiplier: mult,
            time:       timeStr,
            timestamp:  null,
            house:      "",
            color:      tier.color,
            metadata:   {},
          });
        }
        i += 2;
      } else { i++; }
    }
    rounds.reverse(); // mais recente primeiro → inverter para cronológico
    return rounds;
  }

  // Formato inline: "17.51 18:39:56" ou só números
  for (const line of lines) {
    const parts = line.split(/[\s,;|]+/);
    const multPart = parts.find(p => isMultStr(p));
    const timePart = parts.find(p => isTimeStr(p));
    if (multPart) {
      const mult = parseFloat(multPart);
      if (mult >= 1 && mult < 100000) rounds.push({ id: id++, multiplier: mult, time: timePart || null });
    }
  }
  return rounds;
}

/* ─────────────────────────────────────────────────────────────────────────
   TAMANHOS DE CÉLULA
───────────────────────────────────────────────────────────────────────── */
const SIZES = [
  { key: "XXS", px: 72,  showGlow: true,  radius: 8,  border: "1px" },
  { key: "XS",  px: 96,  showGlow: true,  radius: 10, border: "1px" },
  { key: "S",   px: 128, showGlow: true,  radius: 14, border: "2px" },
];

/* ─────────────────────────────────────────────────────────────────────────
   COMPONENTE: CÉLULA INDIVIDUAL
───────────────────────────────────────────────────────────────────────── */
function Cell({ round, isNew, sizeCfg }) {
  const t = getTier(round.multiplier);
  const s = sizeCfg.px;
  // Font scaling automático por quantidade de dígitos
  const digits = fmt(round.multiplier).replace(/[^0-9]/g,"").length;
  const fsMult = (() => {
    const base = s <= 72 ? 19 : s <= 96 ? 23 : 28;
    if (digits <= 4)  return base;
    if (digits <= 6)  return base - 2;
    if (digits <= 8)  return base - 4;
    if (digits <= 10) return base - 5;
    return base - 6;
  })();
  const fsTime = s <= 72 ? 14 : s <= 96 ? 16 : 18;
  const cellH  = s <= 72 ? s * 0.75 : s <= 96 ? s * 0.72 : s * 0.70;

  return (
    <div
      title={`${fmt(round.multiplier)}x · ${round.time} · Casa ${round.casa}`}
      style={{
        width: s, height: cellH, flexShrink: 0,
        background: t.bg, border: `${sizeCfg.border} solid ${t.border}`,
        borderRadius: sizeCfg.radius,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: s<=34?1:2, cursor: "default", position: "relative", overflow: "hidden",
        userSelect: "none",
        animation: isNew ? `popIn .4s cubic-bezier(.36,.07,.19,.97) both, ${t.glow}` : t.glow,
        transition: "transform .12s",
      }}
      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
    >
      {sizeCfg.showGlow && (
        <div style={{ position:"absolute", top:0, left:"15%", right:"15%", height:"30%", background:"rgba(255,255,255,.09)", borderRadius:"50%", filter:"blur(4px)", pointerEvents:"none" }}/>
      )}
      <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:fsMult, fontWeight:900, color:"#fff", lineHeight:1, letterSpacing:-0.3, textShadow:t.isPink?"0 0 8px rgba(255,160,255,.5), 0 1px 2px rgba(0,0,0,.6)":"0 1px 3px rgba(0,0,0,.6)" }}>
        {fmt(round.multiplier)}
      </span>
      <span style={{
        fontFamily:    "'Nunito',sans-serif",
        fontSize:      fsTime,
        fontWeight:    700,
        lineHeight:    1,
        color:         t.isPink ? "rgba(255,210,255,.92)" : "rgba(255,255,255,.88)",
        letterSpacing: 0.1,
      }}>
        {round.time}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   COMPONENTE: LINHA DO GRID
───────────────────────────────────────────────────────────────────────── */
function GridLine({ line, idx, newestId, sizeCfg, lineLimit }) {
  const isOpen   = line.open;
  const isHot    = line.hot;
  const hotCells = line.cells.filter(c => c.multiplier >= 10);
  const isEspelho = hotCells.length >= 2;

  // Label da coluna CASA
  const casaLabel = isOpen
    ? "—"
    : hotCells.length === 0
      ? `${line.cells.length}°`
      : isEspelho
        ? hotCells.map(hc => `${hc.casa}°`).join("/")
        : `${hotCells[hotCells.length - 1].casa}°`;

  const casaColor = isOpen ? "#2d3a5a" : hotCells.length===0 ? "#3d4f72" : isEspelho ? "#f5a623" : "#d432c8";
  const gap   = sizeCfg.px<=72 ? 3 : sizeCfg.px<=96 ? 4 : 5;
  const casaW = sizeCfg.px<=72 ? 72 : sizeCfg.px<=96 ? 88 : 108;
  const casaFs = isEspelho
    ? (sizeCfg.px<=72 ? 14  : sizeCfg.px<=96 ? 16  : 19)
    : (sizeCfg.px<=72 ? 20  : sizeCfg.px<=96 ? 23  : 28);

  // Agrupa pares de casas em linhas (ex: "34°/35°" na 1ª, "36°" na 2ª)
  const casaRows = (() => {
    if (!isEspelho) return [casaLabel];
    const parts = hotCells.map(hc => `${hc.casa}°`);
    const rows = [];
    for (let i = 0; i < parts.length; i += 2) rows.push(parts.slice(i, i + 2).join("/"));
    return rows;
  })();

  return (
    <div style={{ display:"flex", alignItems:"center", marginBottom:0, animation:`rowIn .3s ease ${Math.min(idx*.03,.3)}s both` }}>
      {/* Coluna CASA — largura fixa */}
      <div style={{ width:casaW, minWidth:casaW, maxWidth:casaW, display:"flex", alignItems:"center", justifyContent:"flex-end", paddingRight:6, flexShrink:0, overflow:"hidden" }}>
        <div style={{ textAlign:"right", lineHeight:1.1 }}>
          {casaRows.map((row, i) => (
            <div key={i} style={{
              fontFamily:    "'Share Tech Mono',monospace",
              fontSize:      casaFs,
              fontWeight:    700,
              letterSpacing: 0.3,
              color:         casaColor,
              whiteSpace:    "nowrap",
              textShadow:    isEspelho
                ? "0 0 10px rgba(245,166,35,.7)"
                : hotCells.length > 0
                  ? "0 0 8px rgba(220,50,180,.4)"
                  : "none",
            }}>
              {row}
            </div>
          ))}
        </div>
      </div>

      {/* Células */}
      <div style={{ display:"flex", flexWrap:"nowrap", gap, padding:`${gap}px 0`, flex:1 }}>
        {line.cells.map(r => <Cell key={r.id} round={r} isNew={r.id===newestId} sizeCfg={sizeCfg} />)}
        {isOpen && (
          <div style={{ width:sizeCfg.px, height:sizeCfg.px*1.0, flexShrink:0, borderRadius:sizeCfg.radius, border:"1px dashed rgba(255,255,255,.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ width:2, height:sizeCfg.px*.3, background:"rgba(255,255,255,.3)", borderRadius:2, animation:"blink .9s infinite" }}/>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   COMPONENTE: BARRA DE AUSÊNCIA NAS ROSAS
───────────────────────────────────────────────────────────────────────── */
function AusenciaPilulas({ rounds, allLines }) {
  const items   = [{ label:"30x",thr:30 },{ label:"50x",thr:50 },{ label:"100x",thr:100 },{ label:"500x",thr:500 }];
  const warnAt  = { 30:10, 50:20, 100:40, 500:100 };

  const espelhoAus = useMemo(() => {
    const hotLines = allLines.filter(l => l.hot && !l.open);
    let n = 0;
    for (let i = hotLines.length - 1; i >= 0; i--) {
      if (hasEspelho(hotLines[i])) break;
      n++;
    }
    return n;
  }, [allLines]);

  const espelhoWarn = espelhoAus >= 20;

  return (
    <div style={{ background:"#0a0c12", borderBottom:"1px solid #1a1d24", padding:"4px 10px", display:"flex", alignItems:"center", gap:5, flexWrap:"nowrap", flexShrink:0, overflowX:"auto" }}>
      {items.map(item => {
        const val  = calcAusencia(rounds, item.thr);
        const warn = val >= (warnAt[item.thr] || 50);
        return (
          <div key={item.label} style={{ display:"flex", alignItems:"center", gap:7, background:warn?"rgba(220,50,180,.14)":"rgba(255,255,255,.04)", border:`1px solid ${warn?"rgba(220,50,180,.55)":"#1e2230"}`, borderRadius:24, padding:"5px 16px", transition:"all .3s", animation:warn?"pulseP 2s infinite":"none", flexShrink:0 }}>
            <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:13, color:warn?"rgba(220,50,180,.7)":"rgba(255,255,255,.3)", letterSpacing:.3 }}>{item.label}</span>
            <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:26, fontWeight:900, color:warn?"#d432c8":rounds.length===0?"#2d3a5a":"#fff", lineHeight:1, minWidth:24, textAlign:"center" }}>{rounds.length===0?"—":val}</span>
          </div>
        );
      })}
      <div style={{ width:1, height:24, background:"#1e2230", flexShrink:0 }}/>
      <div style={{ display:"flex", alignItems:"center", gap:7, background:espelhoWarn?"rgba(220,50,180,.14)":"rgba(255,255,255,.04)", border:`1px solid ${espelhoWarn?"rgba(220,50,180,.55)":"#1e2230"}`, borderRadius:24, padding:"5px 16px", transition:"all .3s", animation:espelhoWarn?"pulseP 2s infinite":"none", flexShrink:0 }}>
        <span style={{ fontSize:18, lineHeight:1 }}>🪞</span>
        <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:26, fontWeight:900, color:espelhoWarn?"#d432c8":allLines.length===0?"#2d3a5a":"#fff", lineHeight:1, minWidth:24, textAlign:"center" }}>{allLines.length===0?"—":espelhoAus}</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   COMPONENTE: FILTROS DE VISUALIZAÇÃO
───────────────────────────────────────────────────────────────────────── */
const FILTERS = [
  { key:"TUDO",    label:"TUDO",       color:"#4a5580" },
  { key:"50x",     label:"≥ 50x",      color:"#00e676" },
  { key:"100x",    label:"≥ 100x",     color:"#f5a623" },
  { key:"500x",    label:"≥ 500x",     color:"#ce93d8" },
  { key:"ESPELHO", label:"🪞 ESPELHO", color:"#d432c8" },
];

function FilterBar({ active, onChange, counts }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 14px", background:"#080a10", borderBottom:"1px solid #1a1d24", flexShrink:0, flexWrap:"wrap" }}>
      <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:12, color:"#2d3a5a", letterSpacing:2 }}>FILTRO</span>
      {FILTERS.map(f => (
        <button key={f.key} onClick={() => onChange(f.key)} style={{ display:"flex", alignItems:"center", gap:6, background:active===f.key?`${f.color}22`:"transparent", border:`1px solid ${active===f.key?f.color:"#1e2230"}`, borderRadius:20, padding:"6px 16px", fontFamily:"'Share Tech Mono',monospace", fontSize:12, letterSpacing:1, color:active===f.key?f.color:"#3d4f72", cursor:"pointer", transition:"all .15s" }}>
          {f.label}
          {counts[f.key] !== undefined && (
            <span style={{ background:active===f.key?f.color:"#1e2230", color:active===f.key?"#fff":"#3d4f72", borderRadius:10, padding:"2px 8px", fontSize:11, fontWeight:700 }}>{counts[f.key]}</span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   COMPONENTE: TOAST DE NOTIFICAÇÃO
───────────────────────────────────────────────────────────────────────── */
function Toast({ msg, color }) {
  return (
    <div style={{ position:"fixed", bottom:18, right:18, zIndex:999, background:"#0f1220", border:`1px solid ${color}`, borderRadius:10, padding:"10px 16px", fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:800, color, display:"flex", alignItems:"center", gap:8, boxShadow:`0 6px 30px rgba(0,0,0,.7),0 0 18px ${color}44`, animation:"toastIn .3s ease both" }}>
      <span style={{ width:7, height:7, borderRadius:"50%", background:color, display:"inline-block", animation:"blink .6s infinite" }}/>
      {msg}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   HOOK: CONEXÃO EM TEMPO REAL
   Suporta 3 protocolos:
     "socketio"  → Socket.IO  (ApostaX Spribe)
     "websocket" → WebSocket puro (ApostaMax, ApostaX VIP)
     "soketi"    → Pusher/Soketi  (LotoGreen)
   Enquanto event/fields.mult forem null, loga todos os eventos para debug.
───────────────────────────────────────────────────────────────────────── */
// ── Carregar histórico via API REST ──────────────────────────────────
async function loadHistory(source, onRounds) {
  try {
    const url = `https://api.gamehack.bet/results?source=${encodeURIComponent(source)}&limits=500`;
    const res  = await fetch(url);
    const data = await res.json();
    if (!Array.isArray(data)) return;
    const rounds = data
      .filter(r => r.multiplier >= 1)
      .map((r, i) => {
        const ts   = new Date(r.timestamp);
        const time = [ts.getHours(), ts.getMinutes(), ts.getSeconds()]
          .map(n => String(n).padStart(2,"0")).join(":");
        return { id: Date.now() + i, multiplier: parseFloat(r.multiplier), time };
      })
      .reverse(); // mais antigo primeiro
    if (rounds.length) {
      onRounds(rounds);
      console.log(`✅ Histórico carregado: ${rounds.length} rodadas de "${source}"`);
    }
  } catch(e) {
    console.warn("⚠️ Erro ao carregar histórico:", e.message);
  }
}

// ── Hook de conexão — protocolo gamehack ─────────────────────────────
function useGameSocket(game, onRound, onHistory, enabled) {
  const connRef = useRef(null);

  // Carregar histórico ao ativar
  useEffect(() => {
    if (!enabled || !game?.source) return;
    loadHistory(game.source, onHistory);
  }, [enabled, game?.id]);

  // Conectar socket em tempo real
  useEffect(() => {
    if (!enabled || !game?.source) return;

    const boot = () => {
      if (!window.io) {
        const s = document.createElement("script");
        s.src = "https://cdn.socket.io/4.7.2/socket.io.min.js";
        s.onload = init;
        document.head.appendChild(s);
      } else { init(); }
    };

    const init = () => {
      const socket = window.io("https://api.gamehack.bet", {
        transports: ["websocket"],
        reconnection: true,
        reconnectionDelay: 3000,
      });
      connRef.current = socket;

      socket.on("connect", () =>
        console.log("✅ [gamehack] Conectado! Escutando:", game.source));
      socket.on("disconnect", r =>
        console.warn("❌ [gamehack] Desconectado:", r));
      socket.on("connect_error", e =>
        console.warn("⚠️ [gamehack] Erro:", e.message));

      // Evento de resultado final — o que nos interessa
      socket.on("new_result", (data) => {
        if (data?.source !== game.source) return; // filtrar por jogo
        const mult = parseFloat(data.multiplier);
        if (isNaN(mult) || mult < 1) return;
        const ts   = new Date(data.timestamp);
        const time = [ts.getHours(), ts.getMinutes(), ts.getSeconds()]
          .map(n => String(n).padStart(2,"0")).join(":");
        const tier = getTier(mult);
        onRound({
          id:         data.round_id || Date.now(),
          multiplier: mult,
          time,
          timestamp:  ts.getTime(),
          house:      data.source || game.source || "",
          color:      tier.color,
          metadata:   { round_id: data.round_id || null },
        });
        console.log(`📥 [${game.source}] ${mult}x · ${time} · ID:${data.round_id||"?"}`);
      });

      // Log de outros eventos para debug
      socket.onAny((evt, data) => {
        if (evt !== "new_result" && evt !== "tick" && evt !== "game_state")
          console.log(`📡 [gamehack] Evento: "${evt}"`, data);
      });
    };

    boot();

    return () => {
      if (connRef.current) {
        try { connRef.current.disconnect(); } catch(e) {}
        connRef.current = null;
      }
    };
  }, [enabled, game?.id]);
}

/* ─────────────────────────────────────────────────────────────────────────
   TELA 3 — RADAR (grid principal + análise)
───────────────────────────────────────────────────────────────────────── */
function RadarScreen({ plat, onBack }) {
  const storageKey = `radar_rounds_${plat.id}`;

  // ── Estado com inicialização a partir do localStorage ────────────────
  const [rounds, setRounds] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch(e) { console.warn("[localStorage] Erro ao carregar:", e); }
    return [];
  });

  const [sizeKey,   setSizeKey]   = useState("XXS");
  // Detecta dispositivo e define zoom inicial apropriado
  const isMobileDevice = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
    || window.innerWidth < 768;

  const [zoom, setZoom] = useState(() => isMobileDevice ? 0.6 : 1.8);
  const ZOOM_MIN  = isMobileDevice ? 0.25 : 0.5;
  const ZOOM_MAX  = isMobileDevice ? 1.6  : 3.0;
  const ZOOM_STEP = isMobileDevice ? 0.05 : 0.1;

  const [live,      setLive]      = useState(false);
  const [liveReal,  setLiveReal]  = useState(false);
  const [lastTime,  setLastTime]  = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) { const p = JSON.parse(saved); return p[p.length-1]?.time || null; }
    } catch(e) {}
    return null;
  });
  const [toast,     setToast]     = useState(null);
  const [filter,    setFilter]    = useState("TUDO");
  const [showPaste,  setShowPaste]  = useState(false);
  const [pasteVal,   setPasteVal]   = useState("");
  const [restored,   setRestored]   = useState(false);
  const [inputVal,   setInputVal]   = useState("");
  const [inputError, setInputError] = useState(false);
  const inputRef = useRef(null);

  const liveRef  = useRef(null);
  const scrollRef = useRef();

  // ── Persistência: salvar no localStorage a cada nova rodada ──────────
  useEffect(() => {
    if (!rounds.length) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(rounds.slice(-5000)));
    } catch(e) {
      console.warn("[localStorage] Erro ao salvar (quota excedida?):", e);
    }
  }, [rounds, storageKey]);

  // ── Aviso de restauração ──────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRestored(true);
          setTimeout(() => setRestored(false), 3000);
        }
      }
    } catch(e) {}
  }, []);

  // ── Derivações memoizadas ─────────────────────────────────────────────
  const sizeCfg = SIZES.find(s => s.key === sizeKey) || SIZES[0];
  const allLines = useMemo(() => buildLines(rounds, LINE_LIMIT), [rounds]);
  const filterCounts = useMemo(() => ({
    "50x":     allLines.filter(l => l.cells.some(c => c.multiplier >= 50)).length,
    "100x":    allLines.filter(l => l.cells.some(c => c.multiplier >= 100)).length,
    "500x":    allLines.filter(l => l.cells.some(c => c.multiplier >= 500)).length,
    "ESPELHO": allLines.filter(l => hasEspelho(l)).length,
  }), [allLines]);
  const lines    = useMemo(() => applyFilter(allLines, filter), [allLines, filter]);
  const newestId = rounds[rounds.length - 1]?.id ?? null;

  // ── Auto-scroll para o fim ────────────────────────────────────────────
  useEffect(() => {
    if (!rounds.length) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [newestId]);

  // ── Toast de alta ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!rounds.length) return;
    const v = rounds[rounds.length - 1].multiplier;
    let msg = null, color = null;
    if      (v >= 500) { msg = `🚀 ${fmt(v)}x — LENDÁRIO!`;  color = "#ce93d8"; }
    else if (v >= 100) { msg = `🌕 ${fmt(v)}x — MOON!`;      color = "#f5a623"; }
    else if (v >= 50)  { msg = `🔥 ${fmt(v)}x — ULTRA!`;     color = "#00e676"; }
    else if (v >= 10)  { msg = `✦ ${fmt(v)}x — PAGANTE!`;    color = "#d432c8"; }
    if (msg) { setToast({ msg, color }); setTimeout(() => setToast(null), 3000); }
  }, [newestId]);

  // ── Callback para rodada recebida via socket ──────────────────────────
  const handleRound = useCallback((round) => {
    setRounds(p => [...p, round].slice(-5000));
    setLastTime(round.time);
  }, []);

  // ── Hook de conexão real ──────────────────────────────────────────────
  // Objeto do jogo para o hook
  const socketGame = useMemo(() => ({
    id:       plat.id,
    protocol: plat.protocol || "gamehack",
    source:   plat.source,
    name:     plat.name,
  }), [plat.id]);

  // Callback para histórico — substitui os rounds atuais
  const handleHistory = useCallback((rounds) => {
    setRounds(rounds);
    setLastTime(rounds[rounds.length-1]?.time || null);
    setRestored(true);
    setTimeout(() => setRestored(false), 3000);
  }, []);

  useGameSocket(socketGame, handleRound, handleHistory, liveReal);

  // ── Demo live ────────────────────────────────────────────────────────
  const toggleLive = useCallback(() => {
    if (liveRef.current) {
      clearInterval(liveRef.current); liveRef.current = null; setLive(false);
    } else {
      setLive(true);
      liveRef.current = setInterval(() => {
        const r = genOne();
        setRounds(p => [...p, r].slice(-5000));
        setLastTime(r.time);
      }, 3500);
    }
  }, []);

  // ── Carregar demo estático ────────────────────────────────────────────
  const loadDemo = () => {
    _id = 1;
    const d = genBatch(90);
    setRounds(d);
    setLastTime(d[d.length - 1]?.time || null);
  };

  // ── Colar histórico real ──────────────────────────────────────────────
  const handlePaste = () => {
    const parsed = parseInput(pasteVal);
    if (!parsed.length) return;
    const baseId = Date.now();
    const withIds = parsed.map((r, i) => ({ ...r, id: baseId + i }));
    setRounds(withIds);
    setLastTime(withIds[withIds.length - 1]?.time || null);
    setShowPaste(false);
    setPasteVal("");
  };

  // ── Input manual de rodada ───────────────────────────────────────────
  const handleManualInput = (e) => {
    if (e.key !== "Enter" && e.type !== "click") return;
    let raw = inputVal.trim();

    // Formatos aceitos:
    // 1.95        → ponto decimal simples
    // 1,95        → vírgula decimal simples
    // 8,745.55    → vírgula milhar + ponto decimal (formato do game acima de 1.000)
    // 51,971.69   → vírgula milhar + ponto decimal

    const temPonto   = raw.includes(".");
    const temVirgula = raw.includes(",");

    if (temPonto && temVirgula) {
      // Formato do game: vírgula=milhar, ponto=decimal (8,745.55)
      // Remove a vírgula de milhar e mantém o ponto decimal
      raw = raw.replace(/,/g, "");
    } else if (temVirgula && !temPonto) {
      // Só vírgula: substituir por ponto decimal (1,95 → 1.95)
      raw = raw.replace(",", ".");
    }
    // Se só tem ponto: já está correto (1.95)

    const mult = parseFloat(raw);
    if (isNaN(mult) || mult < 1 || mult > 100000) {
      setInputError(true);
      setTimeout(() => setInputError(false), 800);
      return;
    }
    const now  = new Date();
    const time = [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map(n => String(n).padStart(2, "0")).join(":");
    const tier = getTier(mult);
    const round = {
      id:         Date.now(),
      multiplier: mult,
      time,
      timestamp:  now.getTime(),
      house:      "MANUAL",
      color:      tier.color,
      metadata:   {},
    };
    setRounds(p => [...p, round].slice(-5000));
    setLastTime(time);
    setInputVal("");
    inputRef.current?.focus();
  };

  // ── Limpar tudo ───────────────────────────────────────────────────────
  const clear = () => {
    setRounds([]); setLive(false); setLiveReal(false); setLastTime(null);
    if (liveRef.current) { clearInterval(liveRef.current); liveRef.current = null; }
    try { localStorage.removeItem(storageKey); } catch(e) {}
  };

  const statusLabel = liveReal ? "LIVE REAL" : live ? "DEMO" : "MANUAL";
  const statusColor = liveReal ? "#00e676"   : live ? "#8892ff" : "#3d4f72";

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", width:"100%", maxWidth:"100%", overflow:"hidden", background:"#03050d", animation:"fadeIn .3s ease both", margin:0, padding:0,

    }}>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 14px", height:52, background:"#0d0f15", borderBottom:"1px solid #1e2230", flexShrink:0, position:"relative", overflow:"hidden", gap:10 }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${plat.color},#7c3aed,${plat.color},transparent)`, backgroundSize:"200% 100%", animation:"gradShift 4s linear infinite" }}/>

        {/* Voltar + Brand */}
        <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
          <button onClick={onBack} style={{ background:"rgba(255,255,255,.04)", border:"1px solid #1c2540", borderRadius:7, width:30, height:30, cursor:"pointer", color:"#4a5580", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", transition:"all .15s", flexShrink:0 }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=plat.color;e.currentTarget.style.color=plat.color;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="#1c2540";e.currentTarget.style.color="#4a5580";}}>←</button>
          <div style={{ width:32, height:32, borderRadius:8, background:`linear-gradient(135deg,${plat.color},${plat.color2})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, boxShadow:`0 0 16px ${plat.color}44` }}>{plat.icon}</div>
          <div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:900, letterSpacing:1 }}>{plat.name}</div>
            <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:7, color:"#4a5580", letterSpacing:2 }}>AVIATOR · ANALYZER</div>
          </div>
        </div>

        {/* Status */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
          <div style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:statusColor, animation:(liveReal||live)?"blink 1s infinite":"none" }}/>
            <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, letterSpacing:2, color:statusColor }}>{statusLabel}</span>
            {rounds.length > 0 && <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:7, color:"#2a3450" }}>💾</span>}
          </div>
          <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:"#2a3450" }}>
            {rounds.length > 0 ? `${rounds.length} rodadas` : ""}
            {lastTime ? ` · ${lastTime}` : ""}
          </span>
        </div>

        {/* Controles */}
        <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
          {/* Zoom */}
          <div style={{ display:"flex", alignItems:"center", gap:4 }}>
            <button onClick={() => setZoom(z => +(Math.max(ZOOM_MIN, z - ZOOM_STEP)).toFixed(2))} disabled={zoom<=ZOOM_MIN}
              style={{ width:28, height:26, borderRadius:5, cursor:"pointer", background:"#1a1d24", border:`1px solid ${zoom<=ZOOM_MIN?"#111":"#1e2230"}`, color:zoom<=ZOOM_MIN?"#2a2a2a":"#8892aa", fontSize:16, fontWeight:900, lineHeight:1, display:"flex", alignItems:"center", justifyContent:"center", transition:"all .15s" }}>−</button>
            <div style={{ minWidth:38, textAlign:"center", fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:Math.abs(zoom-(isMobileDevice?0.6:1.8))<0.01?"#3d4f72":plat.color, letterSpacing:1 }}>{Math.round(zoom*100)}%</div>
            <button onClick={() => setZoom(z => +(Math.min(ZOOM_MAX, z + ZOOM_STEP)).toFixed(2))} disabled={zoom>=ZOOM_MAX}
              style={{ width:28, height:26, borderRadius:5, cursor:"pointer", background:"#1a1d24", border:`1px solid ${zoom>=ZOOM_MAX?"#111":"#1e2230"}`, color:zoom>=ZOOM_MAX?"#2a2a2a":"#8892aa", fontSize:16, fontWeight:900, lineHeight:1, display:"flex", alignItems:"center", justifyContent:"center", transition:"all .15s" }}>+</button>
          </div>
          <div style={{ width:1, height:20, background:"#1e2230" }}/>
          <button onClick={clear} style={{ background:"transparent", color:"#3d4f72", border:"1px solid #1e2230", borderRadius:5, padding:"4px 8px", fontFamily:"'Share Tech Mono',monospace", fontSize:7, cursor:"pointer" }}>✕</button>
          <button onClick={() => setShowPaste(true)} style={{ background:"#1a1d24", color:"#8892aa", border:"1px solid #252b3b", borderRadius:5, padding:"4px 10px", fontFamily:"'Share Tech Mono',monospace", fontSize:7, letterSpacing:1, cursor:"pointer" }}>📋 COLAR</button>
          <button onClick={loadDemo} style={{ background:"#1a1d24", color:"#8892aa", border:"1px solid #252b3b", borderRadius:5, padding:"4px 10px", fontFamily:"'Share Tech Mono',monospace", fontSize:7, letterSpacing:1, cursor:"pointer" }}>DEMO</button>
          {/* Demo Live */}
          <button onClick={toggleLive} style={{ background:live?"rgba(232,55,59,.15)":"rgba(100,100,255,.12)", color:live?"#e8373b":"#8892ff", border:`1px solid ${live?"rgba(232,55,59,.4)":"rgba(100,100,255,.3)"}`, borderRadius:5, padding:"4px 10px", fontFamily:"'Share Tech Mono',monospace", fontSize:7, letterSpacing:1, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
            <span style={{ width:5, height:5, borderRadius:"50%", background:"currentColor", display:"inline-block", animation:live?"blink 1s infinite":"none" }}/>
            {live ? "PARAR" : "DEMO"}
          </button>
          {/* Live Real — só aparece quando endpoint está configurado */}
          <button onClick={() => setLiveReal(l => !l)} style={{ background:liveReal?"rgba(232,55,59,.15)":"rgba(0,230,118,.12)", color:liveReal?"#e8373b":"#00e676", border:`1px solid ${liveReal?"rgba(232,55,59,.4)":"rgba(0,230,118,.3)"}`, borderRadius:5, padding:"4px 10px", fontFamily:"'Share Tech Mono',monospace", fontSize:7, letterSpacing:1, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
            <span style={{ width:5, height:5, borderRadius:"50%", background:"currentColor", display:"inline-block", animation:liveReal?"blink 1s infinite":"none" }}/>
            {liveReal ? "■ PARAR" : "▶ LIVE"}
          </button>
        </div>
      </div>

      {/* ── BARRAS ─────────────────────────────────────────────────────── */}
      <AusenciaPilulas rounds={rounds} allLines={allLines} />
      <FilterBar active={filter} onChange={setFilter} counts={filterCounts} />

      {/* ── GRID COM ZOOM ──────────────────────────────────────────────── */}
      {/* Técnica: zoom CSS nativo — ancora em top-left sem deslocamento,
          sem precisar compensar width. Suporte: Chrome/Safari/Edge.
          O scrollRef envolve o container para auto-scroll funcionar. */}
      <div ref={scrollRef} style={{ flex:1, overflowY:"auto" }}>
        <div style={{
          zoom: zoom,              // âncora top-left nativamente
          padding:"12px 14px 40px",
          transition:"zoom .15s ease",
          minHeight:"100%",
        }}>
          {lines.length === 0 ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14, padding:40, marginTop:40 }}>
              <div style={{ fontSize:48, opacity:.15 }}>{plat.icon}</div>
              <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"#2a3450", letterSpacing:2 }}>SEM DADOS CARREGADOS</div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={loadDemo} style={{ background:`${plat.color}22`, border:`1px solid ${plat.color}55`, color:plat.color, borderRadius:8, padding:"8px 18px", fontFamily:"'Share Tech Mono',monospace", fontSize:9, letterSpacing:1, cursor:"pointer" }}>CARREGAR DEMO</button>
                <button onClick={toggleLive} style={{ background:"rgba(0,230,118,.12)", border:"1px solid rgba(0,230,118,.3)", color:"#00e676", borderRadius:8, padding:"8px 18px", fontFamily:"'Share Tech Mono',monospace", fontSize:9, letterSpacing:1, cursor:"pointer" }}>▶ DEMO LIVE</button>
              </div>
            </div>
          ) : (
            lines.map((line, i) => <GridLine key={i} line={line} idx={i} newestId={newestId} sizeCfg={sizeCfg} lineLimit={LINE_LIMIT} />)
          )}
          {filter !== "TUDO" && lines.length === 0 && rounds.length > 0 && (
            <div style={{ textAlign:"center", padding:"40px 20px", fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#2d3a5a", letterSpacing:2 }}>NENHUMA LINHA COM ESSE FILTRO AINDA</div>
          )}
        </div>
      </div>

      {/* ── MODAL: COLAR HISTÓRICO ──────────────────────────────────────── */}
      {showPaste && (
        <div onClick={() => setShowPaste(false)} style={{ position:"fixed", inset:0, zIndex:999, background:"rgba(3,5,13,.9)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div onClick={e => e.stopPropagation()} style={{ width:"min(520px,94vw)", background:"#0f1526", border:"1px solid #1f2d50", borderRadius:12, padding:26, boxShadow:"0 0 80px rgba(0,0,0,.7)" }}>
            <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:plat.color, letterSpacing:1, marginBottom:4 }}>📋 COLAR HISTÓRICO DE RODADAS</div>
            <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:"#3d4f72", marginBottom:14, lineHeight:1.6 }}>
              Cole o histórico no formato coletado (multiplicador e horário em linhas alternadas).<br/>
              Aceita também valores separados por espaço ou vírgula.
            </div>
            <textarea
              value={pasteVal}
              onChange={e => setPasteVal(e.target.value)}
              autoFocus
              rows={10}
              placeholder="2.27&#10;18:40:17&#10;17.51&#10;18:39:56&#10;1.73&#10;18:39:11&#10;..."
              style={{ width:"100%", background:"#080c18", border:"1px solid #1c2540", borderRadius:8, color:"#dde4f0", fontFamily:"'Share Tech Mono',monospace", fontSize:11, padding:12, resize:"vertical", outline:"none", transition:"border-color .2s" }}
              onFocus={e => e.target.style.borderColor = plat.color}
              onBlur={e  => e.target.style.borderColor = "#1c2540"}
            />
            {pasteVal.length > 0 && (
              <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:"#3d4f72", marginTop:6 }}>
                {(() => {
                  const preview = parseInput(pasteVal);
                  return preview.length > 0
                    ? `✓ ${preview.length} rodadas detectadas · ${preview[0]?.multiplier}x → ${preview[preview.length-1]?.multiplier}x`
                    : "⚠ Nenhuma rodada detectada — verifique o formato";
                })()}
              </div>
            )}
            <div style={{ display:"flex", gap:10, marginTop:14 }}>
              <button onClick={handlePaste} style={{ flex:1, background:plat.color, color:"#fff", border:"none", borderRadius:7, padding:"10px 0", fontFamily:"'Share Tech Mono',monospace", fontSize:9, fontWeight:700, letterSpacing:1, cursor:"pointer" }}>✓ CARREGAR</button>
              <button onClick={() => { setShowPaste(false); setPasteVal(""); }} style={{ background:"transparent", color:"#3d4f72", border:"1px solid #1c2540", borderRadius:7, padding:"10px 14px", fontFamily:"'Share Tech Mono',monospace", fontSize:8, cursor:"pointer" }}>CANCELAR</button>
            </div>
          </div>
        </div>
      )}

      {/* ── RÉGUA DE CASAS ─────────────────────────────────────────────── */}
      <ReguaCasas sizeCfg={sizeCfg} zoom={zoom} />

      {/* ── BARRA DE INPUT MANUAL ──────────────────────────────────────── */}
      <div style={{
        flexShrink: 0,
        background: "#0a0c12",
        borderTop: `1px solid ${inputError ? "rgba(232,55,59,.6)" : "#1a1d24"}`,
        padding: "8px 14px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        transition: "border-color .2s",
      }}>
        {/* Label */}
        <span style={{
          fontFamily: "'Share Tech Mono',monospace",
          fontSize: 8, color: "#3d4f72",
          letterSpacing: 1, whiteSpace: "nowrap",
          flexShrink: 0,
        }}>MULTIPLICADOR</span>

        {/* Campo de entrada */}
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={handleManualInput}
          placeholder="ex: 1.95 · 350.42 · 8,745.55 · 51,971.69"
          autoComplete="off"
          style={{
            flex: 1,
            background: inputError ? "rgba(232,55,59,.1)" : "rgba(255,255,255,.04)",
            border: `1px solid ${inputError ? "rgba(232,55,59,.6)" : "#1c2540"}`,
            borderRadius: 8,
            padding: "8px 12px",
            fontFamily: "'Nunito',sans-serif",
            fontSize: 16,
            fontWeight: 900,
            color: "#fff",
            outline: "none",
            transition: "all .2s",
          }}
          onFocus={e => e.target.style.borderColor = plat.color}
          onBlur={e  => e.target.style.borderColor = inputError ? "rgba(232,55,59,.6)" : "#1c2540"}
        />

        {/* Botão confirmar */}
        <button
          onClick={handleManualInput}
          style={{
            background: plat.color,
            border: "none",
            borderRadius: 8,
            padding: "8px 18px",
            fontFamily: "'Share Tech Mono',monospace",
            fontSize: 10,
            fontWeight: 700,
            color: "#fff",
            cursor: "pointer",
            letterSpacing: 1,
            flexShrink: 0,
            transition: "opacity .15s",
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = ".8"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          ✓ OK
        </button>

        {/* Contador de rodadas */}
        <span style={{
          fontFamily: "'Share Tech Mono',monospace",
          fontSize: 7,
          color: "#2d3a5a",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}>
          {rounds.length > 0 ? `${rounds.length} rod.` : ""}
        </span>
      </div>

      {/* ── TOASTS ─────────────────────────────────────────────────────── */}
      {restored && (
        <div style={{ position:"fixed", bottom:18, left:"50%", transform:"translateX(-50%)", zIndex:998, background:"#0f1220", border:"1px solid rgba(0,230,118,.4)", borderRadius:10, padding:"8px 16px", fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:"#00e676", display:"flex", alignItems:"center", gap:8, letterSpacing:1, animation:"toastIn .3s ease both", whiteSpace:"nowrap" }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"#00e676", display:"inline-block" }}/>
          HISTÓRICO RESTAURADO · {rounds.length} RODADAS
        </div>
      )}
      {toast && <Toast msg={toast.msg} color={toast.color} />}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   APP ROOT — gerenciamento de navegação (3 níveis)
   Nível 1: SelectScreen      → seleção de plataforma
   Nível 2: GameSelectScreen  → seleção de jogo (se plataforma tiver games[])
   Nível 3: RadarScreen       → grid de análise
───────────────────────────────────────────────────────────────────────── */
// RadarAviator Build 2026-04-24
export default function App() {
  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = CSS;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  const [activePlat, setActivePlat] = useState(null);
  const [activeGame, setActiveGame] = useState(null);

  if (!activePlat) {
    return <SelectScreen onSelect={p => { setActivePlat(p); setActiveGame(null); }} />;
  }

  if (activePlat.games && !activeGame) {
    return (
      <GameSelectScreen
        plat={activePlat}
        onSelect={setActiveGame}
        onBack={() => { setActivePlat(null); setActiveGame(null); }}
      />
    );
  }

  const game = activeGame || activePlat;
  return (
    <RadarScreen
      plat={{ ...activePlat, ...game }}
      onBack={() => { if (activePlat.games) setActiveGame(null); else setActivePlat(null); }}
    />
  );
}
