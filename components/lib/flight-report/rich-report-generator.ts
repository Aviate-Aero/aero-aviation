// Rich Aviation Report HTML Generator — Aviate Pro
// Premium light theme · fluid typography · large-screen / TV optimised

export interface RichReportData {
  title: string
  subtitle: string
  classification: string
  period: string
  generatedAt: string
  alertBanner: string | null
  kpis: Array<{ value: string; label: string; sub: string; type: 'danger' | 'warning' | 'normal' }>
  summary: string[]
  events: Array<{
    time: string; typeLabel: string; typeBadge: 'red' | 'yellow' | 'blue' | 'green'
    location: string; details: string; impactLabel: string; impactBadge: 'red' | 'yellow' | 'blue' | 'green'
  }>
  airlines: Array<{ code: string; name: string; status: string; statusType: 'suspended' | 'partial' | 'divert' | 'normal' }>
  threats: Array<{ category: string; text: string; level: 'high' | 'medium' | 'info' }>
  recommendations: string[]
  charts: {
    bar1: { title: string; subtitle: string; labels: string[]; data: number[]; unit: string } | null
    bar2: { title: string; subtitle: string; labels: string[]; data: number[]; unit: string } | null
    timeline: { title: string; subtitle: string; labels: string[]; data: number[] } | null
    donut: { title: string; subtitle: string; labels: string[]; data: number[] } | null
  }
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function badgeStyle(color: 'red' | 'yellow' | 'blue' | 'green'): string {
  const map: Record<string, string> = {
    red:    'background:linear-gradient(135deg,#fef2f2,#fee2e2);color:#dc2626;border:1px solid #fca5a5;',
    yellow: 'background:linear-gradient(135deg,#fffbeb,#fef3c7);color:#b45309;border:1px solid #fcd34d;',
    blue:   'background:linear-gradient(135deg,#eff6ff,#dbeafe);color:#1d4ed8;border:1px solid #93c5fd;',
    green:  'background:linear-gradient(135deg,#f0fdf4,#dcfce7);color:#15803d;border:1px solid #86efac;',
  }
  return map[color]
}

function statusColor(type: string): string {
  return type === 'suspended' ? '#dc2626' : type === 'partial' ? '#b45309' : type === 'divert' ? '#1d4ed8' : '#15803d'
}

function kpiGradient(type: string): string {
  return type === 'danger'
    ? 'linear-gradient(135deg,#dc2626,#b91c1c)'
    : type === 'warning'
    ? 'linear-gradient(135deg,#d97706,#b45309)'
    : 'linear-gradient(135deg,#2563eb,#1d4ed8)'
}

function kpiAccentColor(type: string): string {
  return type === 'danger' ? '#dc2626' : type === 'warning' ? '#d97706' : '#2563eb'
}

function threatBg(level: string): string {
  return level === 'high' ? 'linear-gradient(135deg,#fff5f5,#fef2f2)' : level === 'medium' ? 'linear-gradient(135deg,#fffdf0,#fffbeb)' : 'linear-gradient(135deg,#f5f9ff,#eff6ff)'
}
function threatBorder(level: string): string {
  return level === 'high' ? '#dc2626' : level === 'medium' ? '#d97706' : '#2563eb'
}
function threatIcon(level: string): string {
  return level === 'high' ? '🔴' : level === 'medium' ? '🟡' : '🔵'
}

export function generateRichReportHTML(
  data: RichReportData,
  options: { autoPrint?: boolean; forPDF?: boolean } = {}
): string {
  const reportId  = `AP-${Date.now().toString().slice(-8)}`
  const fontStack = options.forPDF
    ? "'Helvetica Neue', Arial, sans-serif"
    : "'Inter', system-ui, -apple-system, sans-serif"
  const hasCharts = !!(data.charts.bar1 || data.charts.bar2 || data.charts.timeline || data.charts.donut)

  /* ── KPI cards ──────────────────────────────────────────────────── */
  const kpiHTML = data.kpis.slice(0, 6).map(k => `
    <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:clamp(16px,2vw,30px) clamp(12px,1.5vw,24px);text-align:center;box-shadow:0 4px 16px rgba(37,99,235,0.07),0 1px 3px rgba(0,0,0,0.05);position:relative;overflow:hidden;">
      <div style="position:absolute;top:0;left:0;right:0;height:4px;background:${kpiGradient(k.type)};border-radius:16px 16px 0 0;"></div>
      <div style="position:absolute;bottom:-20px;right:-10px;width:80px;height:80px;border-radius:50%;background:${kpiAccentColor(k.type)};opacity:0.04;"></div>
      <div style="font-size:clamp(16px,2.2vw,32px);font-weight:800;background:${kpiGradient(k.type)};-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1;font-variant-numeric:tabular-nums;letter-spacing:-0.02em;">${esc(k.value)}</div>
      <div style="font-size:clamp(9px,0.85vw,12px);color:#64748b;letter-spacing:0.1em;text-transform:uppercase;margin-top:clamp(8px,1vw,14px);font-weight:700;">${esc(k.label)}</div>
      <div style="font-size:clamp(9px,0.8vw,11px);color:#94a3b8;margin-top:4px;font-weight:400;">${esc(k.sub)}</div>
    </div>`).join('')

  /* ── Alert banner ────────────────────────────────────────────────── */
  const alertHTML = data.alertBanner ? `
  <div style="background:linear-gradient(135deg,#fff5f5,#fef2f2);border-top:3px solid #dc2626;border-bottom:1px solid #fecaca;padding:clamp(12px,1.4vw,20px) clamp(24px,4vw,60px);display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
    <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
      <span style="font-size:clamp(14px,1.5vw,20px);">⚠️</span>
      <span style="background:linear-gradient(135deg,#dc2626,#b91c1c);color:white;font-size:clamp(8px,0.8vw,11px);font-weight:800;letter-spacing:0.14em;padding:4px 12px;border-radius:20px;white-space:nowrap;">CRITICAL ALERT</span>
    </div>
    <span style="flex:1;min-width:200px;font-size:clamp(11px,1.1vw,15px);font-weight:600;color:#9b1c1c;">${esc(data.alertBanner)}</span>
  </div>` : ''

  /* ── Summary ─────────────────────────────────────────────────────── */
  const summaryHTML = data.summary.map(p =>
    `<p style="font-size:clamp(12px,1.1vw,16px);line-height:1.85;color:#475569;margin-bottom:10px;">${esc(p)}</p>`
  ).join('')

  /* ── Chart containers ────────────────────────────────────────────── */
  const chartCard = (id: string, title: string, sub: string) => `
    <div class="card expandable" onclick="apOpenChart('${id}','${esc(title)}','${esc(sub)}')" title="Click to expand">
      <div class="card-title">${esc(title)}<span style="display:flex;align-items:center;gap:8px;"><span class="card-title-sub">${esc(sub)}</span><span class="expand-hint">⛶ expand</span></span></div>
      <div class="chart-wrap"><canvas id="${id}"></canvas></div>
    </div>`

  const chartsRow1HTML = (data.charts.bar1 || data.charts.bar2) ? `
  <div class="grid-2" style="margin-bottom:clamp(20px,2.5vw,40px);">
    ${data.charts.bar1 ? chartCard('chart_bar1', data.charts.bar1.title, data.charts.bar1.subtitle) : '<div></div>'}
    ${data.charts.bar2 ? chartCard('chart_bar2', data.charts.bar2.title, data.charts.bar2.subtitle) : '<div></div>'}
  </div>` : ''

  const chartsRow2HTML = (data.charts.timeline || data.charts.donut) ? `
  <div class="grid-2-1" style="margin-bottom:clamp(20px,2.5vw,40px);">
    ${data.charts.timeline ? chartCard('chart_timeline', data.charts.timeline.title, data.charts.timeline.subtitle) : ''}
    ${data.charts.donut   ? chartCard('chart_donut',    data.charts.donut.title,    data.charts.donut.subtitle)    : ''}
  </div>` : ''

  /* ── Events table ────────────────────────────────────────────────── */
  const eventsHTML = data.events.length > 0 ? `
  <div style="margin-bottom:clamp(20px,2.5vw,40px);">
    <div class="section-title">Event Log &amp; Timeline</div>
    <div class="card expandable" style="padding:0;overflow:hidden;" onclick="apOpenTable()" title="Click to expand">
      <div style="overflow-x:auto;">
        <table style="width:100%;min-width:620px;border-collapse:collapse;">
          <thead>
            <tr style="background:linear-gradient(135deg,#f8fafc,#f1f5f9);">
              <th class="th" style="width:13%;">Date / Time</th>
              <th class="th" style="width:10%;">Type</th>
              <th class="th" style="width:16%;">Location</th>
              <th class="th">Details</th>
              <th class="th" style="width:11%;">Impact</th>
            </tr>
          </thead>
          <tbody>
            ${data.events.map((e, i) => `
            <tr style="border-bottom:1px solid #f1f5f9;transition:background 0.15s;${i % 2 !== 0 ? 'background:#fafbff;' : 'background:#ffffff;'}" onmouseover="this.style.background='#f0f7ff'" onmouseout="this.style.background='${i % 2 !== 0 ? '#fafbff' : '#ffffff'}'">
              <td class="td"><strong style="color:#1e293b;">${esc(e.time)}</strong></td>
              <td class="td"><span class="badge" style="${badgeStyle(e.typeBadge)}">${esc(e.typeLabel)}</span></td>
              <td class="td" style="color:#334155;font-weight:500;">${esc(e.location)}</td>
              <td class="td" style="color:#64748b;">${esc(e.details)}</td>
              <td class="td"><span class="badge" style="${badgeStyle(e.impactBadge)}">${esc(e.impactLabel)}</span></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>` : ''

  /* ── Airlines ────────────────────────────────────────────────────── */
  const airlinesHTML = data.airlines.length > 0 ? `
  <div class="card">
    <div class="card-title">Airline &amp; Operator Status<span class="card-title-sub">Real-time Operational Status</span></div>
    ${data.airlines.map((a, i) => `
    <div style="display:flex;align-items:center;padding:clamp(8px,0.9vw,14px) clamp(10px,1vw,16px);border-radius:10px;gap:14px;flex-wrap:wrap;margin-bottom:4px;background:${i % 2 !== 0 ? '#fafbff' : '#f8fafc'};border:1px solid #f1f5f9;transition:background 0.15s;" onmouseover="this.style.background='#eff6ff'" onmouseout="this.style.background='${i % 2 !== 0 ? '#fafbff' : '#f8fafc'}'">
      <div style="background:linear-gradient(135deg,#eff6ff,#dbeafe);border:1px solid #93c5fd;border-radius:8px;padding:6px 10px;font-size:clamp(12px,1.2vw,18px);font-weight:800;color:#1d4ed8;min-width:50px;text-align:center;letter-spacing:0.04em;flex-shrink:0;">${esc(a.code)}</div>
      <div style="font-size:clamp(11px,1vw,15px);color:#334155;flex:1;min-width:120px;font-weight:500;">${esc(a.name)}</div>
      <div style="font-size:clamp(9px,0.85vw,12px);letter-spacing:0.08em;font-weight:700;color:${statusColor(a.statusType)};background:${statusColor(a.statusType)}18;padding:4px 10px;border-radius:20px;border:1px solid ${statusColor(a.statusType)}40;">${esc(a.status)}</div>
    </div>`).join('')}
  </div>` : ''

  /* ── Threats ─────────────────────────────────────────────────────── */
  const threatsHTML = data.threats.length > 0 ? `
  <div class="card">
    <div class="card-title">Threat &amp; Risk Assessment<span class="card-title-sub">Intelligence Analysis</span></div>
    <div class="grid-2" style="margin-top:8px;">
      ${data.threats.map(t => `
      <div class="expandable" onclick="apOpenThreat(this)" title="Click to expand" style="background:${threatBg(t.level)};border:1px solid ${threatBorder(t.level)}30;border-left:4px solid ${threatBorder(t.level)};border-radius:10px;padding:clamp(12px,1.3vw,20px) clamp(14px,1.5vw,22px);">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:clamp(10px,1vw,14px);">${threatIcon(t.level)}</span>
            <span style="font-size:clamp(8px,0.78vw,11px);color:${threatBorder(t.level)};letter-spacing:0.1em;text-transform:uppercase;font-weight:800;">${esc(t.category)}</span>
          </div>
          <span class="expand-hint">⛶ expand</span>
        </div>
        <div style="font-size:clamp(11px,1vw,14px);color:#475569;line-height:1.7;">${esc(t.text)}</div>
      </div>`).join('')}
    </div>
  </div>` : ''

  /* ── Recommendations ─────────────────────────────────────────────── */
  const recsHTML = data.recommendations.length > 0 ? `
  <div style="margin-bottom:clamp(20px,2.5vw,40px);">
    <div class="section-title">Recommendations</div>
    <div class="card">
      ${data.recommendations.map((r, i) => `
      <div style="display:flex;align-items:flex-start;gap:clamp(14px,1.6vw,24px);padding:clamp(10px,1.1vw,18px) 0;border-bottom:1px solid #f1f5f9;">
        <div style="width:clamp(28px,2.4vw,40px);height:clamp(28px,2.4vw,40px);border-radius:50%;background:${i < 2 ? 'linear-gradient(135deg,#2563eb,#1d4ed8)' : i < 4 ? 'linear-gradient(135deg,#0ea5e9,#0284c7)' : 'linear-gradient(135deg,#64748b,#475569)'};display:flex;align-items:center;justify-content:center;color:white;font-size:clamp(11px,1.1vw,16px);font-weight:700;flex-shrink:0;">${i + 1}</div>
        <div style="font-size:clamp(12px,1.1vw,15px);color:#475569;line-height:1.75;padding-top:clamp(3px,0.4vw,7px);">${esc(r)}</div>
      </div>`).join('')}
    </div>
  </div>` : ''

  const middleGridHTML = (data.airlines.length > 0 || data.threats.length > 0) ? `
  <div class="${data.airlines.length > 0 && data.threats.length > 0 ? 'grid-2' : ''}" style="margin-bottom:clamp(20px,2.5vw,40px);">
    ${airlinesHTML}
    ${threatsHTML}
  </div>` : ''

  /* ── Chart.js ────────────────────────────────────────────────────── */
  const CHART_PALETTE = ['#2563eb','#dc2626','#d97706','#16a34a','#7c3aed','#0891b2','#db2777','#ea580c']

  const chartScripts = !hasCharts ? '' : `
  <script>
  window._apChartDefs = {};
  Chart.defaults.devicePixelRatio = window.devicePixelRatio || 2;
  Chart.defaults.color = '#64748b';
  Chart.defaults.font.family = ${JSON.stringify(fontStack)};
  Chart.defaults.font.size = Math.max(11, Math.round(window.innerWidth / 110));

  const palette = ${JSON.stringify(CHART_PALETTE)};
  const gridCol = 'rgba(226,232,240,0.7)';
  const tickCol = '#64748b';

  function dynColors(arr) {
    const mx = Math.max(...arr);
    return arr.map(v => {
      const p = v/mx;
      if(p>0.75) return 'rgba(220,38,38,0.78)';
      if(p>0.45) return 'rgba(217,119,6,0.78)';
      return 'rgba(37,99,235,0.75)';
    });
  }
  function dynBorders(arr) {
    const mx = Math.max(...arr);
    return arr.map(v => { const p=v/mx; return p>0.75?'#dc2626':p>0.45?'#d97706':'#2563eb'; });
  }

  ${data.charts.bar1 ? (() => {
    const d = data.charts.bar1!
    return `(function(){var cfg={type:'bar',data:{labels:${JSON.stringify(d.labels)},datasets:[{label:${JSON.stringify(d.unit)},data:${JSON.stringify(d.data)},backgroundColor:dynColors(${JSON.stringify(d.data)}),borderColor:dynBorders(${JSON.stringify(d.data)}),borderWidth:0,borderRadius:6,borderSkipped:false}]},options:{responsive:true,maintainAspectRatio:true,plugins:{legend:{display:true,labels:{font:{size:11},color:tickCol}},tooltip:{backgroundColor:'rgba(15,23,42,0.92)',titleColor:'#f8fafc',bodyColor:'#cbd5e1',cornerRadius:8,padding:10,callbacks:{label:ctx=>' '+ctx.raw+' ${esc(d.unit)}'}},},scales:{x:{grid:{display:false},ticks:{color:tickCol,maxRotation:38,font:{size:10}}},y:{grid:{color:gridCol,borderDash:[3,3]},ticks:{color:tickCol,font:{size:10}},beginAtZero:true}}}};window._apChartDefs['chart_bar1']=cfg;new Chart(document.getElementById('chart_bar1'),cfg);})();`
  })() : ''}

  ${data.charts.bar2 ? (() => {
    const d = data.charts.bar2!
    return `(function(){var cfg={type:'bar',data:{labels:${JSON.stringify(d.labels)},datasets:[{label:${JSON.stringify(d.unit)},data:${JSON.stringify(d.data)},backgroundColor:'rgba(37,99,235,0.72)',borderColor:'transparent',borderWidth:0,borderRadius:6,borderSkipped:false}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:true,plugins:{legend:{display:true,labels:{font:{size:11},color:tickCol}},tooltip:{backgroundColor:'rgba(15,23,42,0.92)',titleColor:'#f8fafc',bodyColor:'#cbd5e1',cornerRadius:8,padding:10,callbacks:{label:ctx=>' '+ctx.raw+' ${esc(d.unit)}'}},},scales:{x:{grid:{color:gridCol,borderDash:[3,3]},ticks:{color:tickCol,font:{size:10}},beginAtZero:true},y:{grid:{display:false},ticks:{color:tickCol,font:{size:10}}}}}};window._apChartDefs['chart_bar2']=cfg;new Chart(document.getElementById('chart_bar2'),cfg);})();`
  })() : ''}

  ${data.charts.timeline ? (() => {
    const d = data.charts.timeline!
    return `(function(){var cfg={type:'line',data:{labels:${JSON.stringify(d.labels)},datasets:[{label:'Count',data:${JSON.stringify(d.data)},borderColor:'#2563eb',backgroundColor:'rgba(37,99,235,0.12)',borderWidth:2.5,fill:true,tension:0.42,pointBackgroundColor:'#2563eb',pointBorderColor:'#fff',pointBorderWidth:2,pointRadius:4,pointHoverRadius:7}]},options:{responsive:true,maintainAspectRatio:true,plugins:{legend:{display:true,labels:{font:{size:11},color:tickCol}},tooltip:{backgroundColor:'rgba(15,23,42,0.92)',titleColor:'#f8fafc',bodyColor:'#cbd5e1',cornerRadius:8,padding:10}},scales:{x:{grid:{display:false},ticks:{color:tickCol,maxRotation:42,font:{size:10}}},y:{grid:{color:gridCol,borderDash:[3,3]},ticks:{color:tickCol,font:{size:10}},beginAtZero:true}}}};window._apChartDefs['chart_timeline']=cfg;new Chart(document.getElementById('chart_timeline'),cfg);})();`
  })() : ''}

  ${data.charts.donut ? (() => {
    const d = data.charts.donut!
    return `(function(){var cfg={type:'doughnut',data:{labels:${JSON.stringify(d.labels)},datasets:[{data:${JSON.stringify(d.data)},backgroundColor:palette.map(c=>c+'cc'),borderColor:palette,borderWidth:2,hoverOffset:8}]},options:{responsive:true,maintainAspectRatio:true,cutout:'63%',plugins:{legend:{position:'bottom',labels:{color:tickCol,boxWidth:12,font:{size:10},padding:14,usePointStyle:true,pointStyle:'circle'}},tooltip:{backgroundColor:'rgba(15,23,42,0.92)',titleColor:'#f8fafc',bodyColor:'#cbd5e1',cornerRadius:8,padding:10,callbacks:{label:ctx=>' '+ctx.label+': '+ctx.raw+'%'}}}}};window._apChartDefs['chart_donut']=cfg;new Chart(document.getElementById('chart_donut'),cfg);})();`
  })() : ''}
  </script>`

  const autoPrintScript = options.autoPrint
    ? `<script>window.addEventListener('load',()=>setTimeout(()=>window.print(),1000));<\/script>`
    : ''

  const fontsLink = options.forPDF ? '' : `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;0,14..32,800&display=swap" rel="stylesheet">`

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Aviate Pro Intelligence | ${esc(data.title)}</title>
${hasCharts ? `<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"><\/script>` : ''}
${fontsLink}
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #f0f4ff;
    color: #1e293b;
    font-family: ${fontStack};
    font-size: clamp(12px, 1.1vw, 16px);
    line-height: 1.65;
    -webkit-font-smoothing: antialiased;
  }

  /* ── Top bar ── */
  .topbar {
    background: linear-gradient(135deg, #1e3a8a, #1e40af, #2563eb);
    padding: clamp(8px,0.9vw,14px) clamp(24px,4vw,64px);
    display: flex; justify-content: space-between; align-items: center;
    font-size: clamp(10px,0.85vw,13px); color: #bfdbfe;
    flex-wrap: wrap; gap: 6px; letter-spacing: 0.03em;
  }
  .topbar .left { display: flex; align-items: center; gap: clamp(12px,2vw,28px); flex-wrap: wrap; }
  .topbar strong { color: #ffffff; }
  .topbar .dot { display:inline-block; width:7px; height:7px; border-radius:50%; background:#60a5fa; margin-right:7px; animation:blink 1.8s infinite; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

  /* ── Header ── */
  .header {
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    padding: clamp(22px,2.8vw,48px) clamp(24px,4vw,64px) clamp(18px,2.2vw,36px);
    position: relative; overflow: hidden;
  }
  .header::after {
    content: '✈';
    position: absolute; right: -20px; top: 50%; transform: translateY(-50%);
    font-size: clamp(80px,12vw,180px); color: #2563eb; opacity: 0.035;
    pointer-events: none; user-select: none;
  }
  .header-inner { display:flex; justify-content:space-between; align-items:flex-start; gap:clamp(16px,3vw,44px); flex-wrap:wrap; position:relative; z-index:1; }

  .logo-block { display:flex; flex-direction:column; gap:5px; }
  .logo { display:flex; align-items:center; gap:clamp(8px,1vw,14px); margin-bottom:4px; }
  .logo-icon {
    width:clamp(38px,4.5vw,64px); height:clamp(38px,4.5vw,64px);
    background:linear-gradient(135deg,#2563eb,#1d4ed8);
    border-radius:12px; display:flex; align-items:center; justify-content:center;
    color:white; font-size:clamp(18px,2.2vw,32px); font-weight:800; flex-shrink:0;
    box-shadow:0 4px 14px rgba(37,99,235,0.35);
  }
  .logo-name { display:flex; flex-direction:column; }
  .logo-text { font-size:clamp(14px,1.6vw,24px); font-weight:800; color:#1e293b; letter-spacing:-0.03em; line-height:1; }
  .logo-text span { color:#2563eb; }
  .logo-sub { font-size:clamp(9px,0.82vw,12px); color:#94a3b8; letter-spacing:0.1em; text-transform:uppercase; margin-top:3px; font-weight:500; }
  .logo-contact { font-size:clamp(9px,0.82vw,12px); color:#94a3b8; margin-top:5px; }

  .header-meta { text-align:right; flex-shrink:0; }
  .report-class-badge {
    display:inline-block;
    background:linear-gradient(135deg,#eff6ff,#dbeafe);
    color:#1d4ed8; border:1px solid #93c5fd;
    font-size:clamp(8px,0.72vw,11px); font-weight:800; letter-spacing:0.14em;
    padding:clamp(4px,0.45vw,7px) clamp(10px,1.1vw,16px);
    border-radius:20px; margin-bottom:10px; text-transform:uppercase;
  }
  .report-title { font-size:clamp(13px,1.5vw,22px); font-weight:800; color:#0f172a; line-height:1.2; max-width:clamp(280px,34vw,520px); letter-spacing:-0.02em; }
  .report-subtitle { font-size:clamp(10px,0.9vw,14px); color:#64748b; margin-top:6px; font-weight:400; }

  .header-dates {
    display:flex; gap:clamp(16px,2.5vw,44px); margin-top:clamp(14px,1.8vw,28px);
    padding-top:clamp(12px,1.5vw,22px); border-top:1px solid #f1f5f9; flex-wrap:wrap; position:relative; z-index:1;
  }
  .date-item label { font-size:clamp(8px,0.72vw,10px); color:#94a3b8; letter-spacing:0.12em; text-transform:uppercase; display:block; margin-bottom:4px; font-weight:600; }
  .date-item value { font-size:clamp(11px,1.1vw,15px); font-weight:700; color:#1e293b; }

  /* ── Main ── */
  .main { padding: clamp(22px,3vw,56px) clamp(24px,4vw,64px); }

  /* ── Grids ── */
  .kpi-grid  { display:grid; grid-template-columns:repeat(6,1fr); gap:clamp(10px,1.5vw,22px); margin-bottom:clamp(22px,2.8vw,40px); }
  .grid-2    { display:grid; grid-template-columns:1fr 1fr; gap:clamp(16px,2vw,28px); }
  .grid-2-1  { display:grid; grid-template-columns:2fr 1fr; gap:clamp(16px,2vw,28px); }

  /* ── Section title ── */
  .section-title {
    font-size:clamp(10px,0.9vw,13px); font-weight:800;
    letter-spacing:0.12em; text-transform:uppercase; color:#334155;
    display:flex; align-items:center; gap:10px; margin-bottom:clamp(12px,1.4vw,20px);
  }
  .section-title::before {
    content:''; display:inline-block;
    width:clamp(14px,1.4vw,20px); height:3px;
    background:linear-gradient(90deg,#2563eb,#7c3aed);
    border-radius:2px; flex-shrink:0;
  }

  /* ── Card ── */
  .card {
    background:#ffffff; border:1px solid #e2e8f0; border-radius:14px;
    padding:clamp(18px,2.1vw,30px); box-shadow:0 4px 16px rgba(15,23,42,0.06),0 1px 3px rgba(0,0,0,0.04);
    height:100%;
  }
  .card-title {
    font-size:clamp(10px,0.88vw,13px); font-weight:700; letter-spacing:0.08em;
    text-transform:uppercase; color:#475569;
    margin-bottom:clamp(12px,1.5vw,20px); padding-bottom:clamp(10px,1.1vw,16px);
    border-bottom:1px solid #f1f5f9;
    display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;
  }
  .card-title-sub { font-size:clamp(8px,0.72vw,11px); color:#94a3b8; font-weight:400; letter-spacing:0.03em; text-transform:none; }

  /* ── Summary box ── */
  .summary-box {
    background:linear-gradient(135deg,#f0f7ff,#eff6ff,#f5f3ff);
    border:1px solid #c7d7fe; border-left:4px solid #2563eb;
    border-radius:14px; padding:clamp(18px,2.2vw,36px) clamp(22px,2.8vw,44px);
    margin-bottom:clamp(22px,2.8vw,40px);
    box-shadow:0 4px 16px rgba(37,99,235,0.08);
  }

  /* ── Chart wrap ── */
  .chart-wrap {
    background:linear-gradient(135deg,#f8fafc,#f1f5f9);
    border:1px solid #e2e8f0; border-radius:12px;
    padding:clamp(12px,1.4vw,20px);
  }
  .chart-wrap canvas { max-height:clamp(160px,12vw,240px) !important; width:100% !important; }

  /* ── Badge / Table ── */
  .badge { display:inline-block; padding:clamp(2px,0.3vw,4px) clamp(7px,0.8vw,12px); border-radius:20px; font-size:clamp(8px,0.72vw,10px); font-weight:800; letter-spacing:0.07em; text-transform:uppercase; white-space:nowrap; }
  .th { background:linear-gradient(135deg,#f8fafc,#f1f5f9); color:#475569; font-size:clamp(8px,0.72vw,10px); font-weight:800; letter-spacing:0.12em; text-transform:uppercase; padding:clamp(10px,1.1vw,16px) clamp(12px,1.3vw,20px); text-align:left; border-bottom:2px solid #e2e8f0; white-space:nowrap; }
  .td { padding:clamp(9px,1vw,14px) clamp(12px,1.3vw,20px); font-size:clamp(10px,0.92vw,13px); color:#475569; vertical-align:middle; }

  /* ── Footer ── */
  .footer {
    background:linear-gradient(135deg,#1e3a8a,#1e40af);
    padding:clamp(18px,2.2vw,36px) clamp(24px,4vw,64px);
    display:flex; justify-content:space-between; align-items:flex-start;
    font-size:clamp(9px,0.82vw,12px); color:#93c5fd;
    margin-top:8px; flex-wrap:wrap; gap:20px;
  }
  .footer-brand { font-size:clamp(14px,1.6vw,24px); font-weight:800; color:#ffffff; letter-spacing:-0.02em; }
  .footer-brand span { color:#60a5fa; }

  /* ── Responsive ── */
  @media (max-width:640px) {
    .topbar { padding:8px 16px; }
    .header { padding:16px; }
    .header::after { display:none; }
    .header-meta { text-align:left; width:100%; }
    .report-title { max-width:100%; }
    .main { padding:14px 16px; }
    .kpi-grid { grid-template-columns:repeat(2,1fr); gap:10px; }
    .grid-2, .grid-2-1 { grid-template-columns:1fr; }
    .footer { padding:16px; flex-direction:column; }
  }
  @media (min-width:641px) and (max-width:1023px) {
    .kpi-grid { grid-template-columns:repeat(3,1fr); }
    .grid-2-1 { grid-template-columns:1fr; }
  }
  @media (min-width:1440px) { .chart-wrap canvas { max-height:260px !important; } }
  @media (min-width:1920px) {
    .kpi-grid { gap:26px; }
    .chart-wrap canvas { max-height:300px !important; }
    .td, .th { padding:15px 22px; }
  }

  /* ── Expandable / click hints ── */
  .expandable { cursor:pointer; transition:box-shadow 0.2s, transform 0.15s; }
  .expandable:hover { box-shadow:0 8px 28px rgba(37,99,235,0.18) !important; transform:translateY(-1px); }
  .expand-hint { font-size:clamp(8px,0.7vw,10px); color:#93c5fd; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; opacity:0; transition:opacity 0.2s; white-space:nowrap; }
  .expandable:hover .expand-hint { opacity:1; }

  /* ── Modal ── */
  #ap-modal { display:none; position:fixed; inset:0; z-index:9999; background:rgba(15,23,42,0.75); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px); padding:clamp(16px,4vw,56px); box-sizing:border-box; animation:apFadeIn 0.18s ease; }
  @keyframes apFadeIn { from{opacity:0;} to{opacity:1;} }
  #ap-modal-box { background:#ffffff; border-radius:18px; max-width:1100px; width:100%; margin:0 auto; max-height:90vh; overflow:auto; position:relative; padding:clamp(20px,2.5vw,36px); box-shadow:0 24px 80px rgba(0,0,0,0.4); animation:apSlideUp 0.2s ease; }
  @keyframes apSlideUp { from{transform:translateY(20px);opacity:0;} to{transform:translateY(0);opacity:1;} }
  #ap-modal-close { position:sticky; top:0; float:right; width:36px; height:36px; border-radius:50%; background:#f1f5f9; border:none; font-size:18px; cursor:pointer; color:#475569; display:flex; align-items:center; justify-content:center; margin-bottom:-36px; z-index:2; transition:background 0.15s; }
  #ap-modal-close:hover { background:#e2e8f0; color:#1e293b; }
  #ap-modal-content { clear:both; padding-top:8px; }
  #ap-modal-content canvas { width:100% !important; max-height:60vh !important; }
  #ap-modal-content table { width:100%; border-collapse:collapse; }
  .ap-modal-title { font-size:clamp(14px,1.6vw,22px); font-weight:800; color:#0f172a; margin-bottom:4px; letter-spacing:-0.02em; }
  .ap-modal-sub { font-size:clamp(10px,0.9vw,13px); color:#94a3b8; margin-bottom:clamp(16px,2vw,28px); }

  /* ── Print ── */
  @media print {
    body { background:#fff; }
    .header::after { display:none; }
    .main { padding:16px 28px; }
    .header { padding:18px 28px; }
    .footer { padding:14px 28px; }
    .kpi-grid { grid-template-columns:repeat(3,1fr); gap:10px; }
    .grid-2, .grid-2-1 { grid-template-columns:1fr 1fr; }
    .chart-wrap canvas { max-height:180px !important; }
    .card { box-shadow:none; }
  }
</style>
</head>
<body>

<div class="topbar">
  <div class="left">
    <span><span class="dot"></span><strong>Aviate Pro</strong> · Aviation Intelligence</span>
    <span>ID: <strong>${reportId}</strong></span>
    <span>Class: <strong>${esc(data.classification)}</strong></span>
  </div>
  <div style="display:flex;gap:clamp(12px,2vw,28px);flex-wrap:wrap;">
    <span>Generated: <strong>${esc(data.generatedAt)}</strong></span>
    <span>Period: <strong>${esc(data.period)}</strong></span>
  </div>
</div>

<div class="header">
  <div class="header-inner">
    <div class="logo-block">
      <div class="logo">
        <div class="logo-icon">✈</div>
        <div class="logo-name">
          <div class="logo-text">Aviate <span>Pro</span></div>
          <div class="logo-sub">Aviation Intelligence &nbsp;·&nbsp; Operations Analytics</div>
        </div>
      </div>
      <div class="logo-contact">Aviate Pro ME LLC &nbsp;·&nbsp; aviatepro.me &nbsp;·&nbsp; info@aviatepro.me</div>
    </div>
    <div class="header-meta">
      <div class="report-class-badge">✈ &nbsp;${esc(data.classification)}</div>
      <div class="report-title">${esc(data.title)}</div>
      <div class="report-subtitle">${esc(data.subtitle)}</div>
    </div>
  </div>
  <div class="header-dates">
    <div class="date-item"><label>Generated</label><value>${esc(data.generatedAt)}</value></div>
    <div class="date-item"><label>Period</label><value>${esc(data.period)}</value></div>
    <div class="date-item"><label>Report ID</label><value>${reportId}</value></div>
    <div class="date-item"><label>Source</label><value>AI + Web Search</value></div>
  </div>
</div>

${alertHTML}

<div class="main">
  ${data.kpis.length > 0 ? `<div class="kpi-grid">${kpiHTML}</div>` : ''}

  ${data.summary.length > 0 ? `
  <div class="summary-box">
    <div class="section-title" style="margin-bottom:12px;">Executive Summary</div>
    ${summaryHTML}
  </div>` : ''}

  ${chartsRow1HTML}
  ${chartsRow2HTML}
  ${eventsHTML}
  ${middleGridHTML}
  ${recsHTML}
</div>

<div class="footer">
  <div style="max-width:55%;line-height:1.75;min-width:200px;">
    <strong style="color:#ffffff;font-size:clamp(9px,0.85vw,12px);letter-spacing:0.08em;text-transform:uppercase;">Disclaimer</strong><br>
    <span style="color:#93c5fd;">Generated by Aviate Pro AI Intelligence using real-time web search as of ${esc(data.generatedAt)}. For planning purposes only — always verify with official sources (NOTAMs, ATIS, AIP) before operations.</span>
  </div>
  <div style="text-align:right;">
    <div class="footer-brand">Aviate <span>Pro</span></div>
    <div style="margin-top:5px;color:#93c5fd;">Aviate Pro ME LLC &nbsp;·&nbsp; aviatepro.me</div>
    <div style="margin-top:4px;color:#60a5fa;">&copy; 2026 Aviate Pro ME LLC &nbsp;·&nbsp; All Rights Reserved</div>
    <div style="margin-top:6px;color:#60a5fa;font-size:clamp(8px,0.72vw,11px);font-weight:700;letter-spacing:0.1em;">REPORT ${reportId}</div>
  </div>
</div>

${chartScripts}
${autoPrintScript}

<!-- ── Modal overlay ── -->
<div id="ap-modal" onclick="if(event.target===this)apCloseModal()">
  <div id="ap-modal-box">
    <button id="ap-modal-close" onclick="apCloseModal()">✕</button>
    <div id="ap-modal-content"></div>
  </div>
</div>

<script>
window._apModalChart = null;

function apCloseModal() {
  document.getElementById('ap-modal').style.display = 'none';
  document.body.style.overflow = '';
  if (window._apModalChart) { window._apModalChart.destroy(); window._apModalChart = null; }
}

document.addEventListener('keydown', function(e) { if (e.key === 'Escape') apCloseModal(); });

// ── Expand a chart ──────────────────────────────────────────────────
function apOpenChart(id, title, sub) {
  const src = window._apChartDefs && window._apChartDefs[id];
  if (!src) return;

  document.getElementById('ap-modal-content').innerHTML =
    '<div class="ap-modal-title">' + title + '</div>' +
    '<div class="ap-modal-sub">' + sub + '</div>' +
    '<canvas id="ap-modal-canvas" style="width:100%;max-height:60vh;"></canvas>';

  document.getElementById('ap-modal').style.display = 'block';
  document.body.style.overflow = 'hidden';

  // Deep-clone config and bump font sizes for the modal
  const cfg = JSON.parse(JSON.stringify(src));
  if (cfg.options) {
    cfg.options.maintainAspectRatio = false;
    if (!cfg.options.plugins) cfg.options.plugins = {};
    if (!cfg.options.plugins.legend) cfg.options.plugins.legend = {};
    cfg.options.plugins.legend.display = true;
    cfg.options.plugins.legend.labels = cfg.options.plugins.legend.labels || {};
    cfg.options.plugins.legend.labels.font = { size: 13 };
  }
  // Restore gradient fill for line chart if present
  if (cfg.data && cfg.data.datasets) {
    cfg.data.datasets.forEach(function(ds) {
      if (ds._fillGradient) ds.backgroundColor = ds._fillGradient;
    });
  }

  const canvas = document.getElementById('ap-modal-canvas');
  canvas.height = Math.round(canvas.parentElement.offsetWidth * 0.5);
  window._apModalChart = new Chart(canvas, cfg);
}

// ── Expand events table ─────────────────────────────────────────────
function apOpenTable() {
  const tbl = document.querySelector('.card.expandable table');
  if (!tbl) return;
  document.getElementById('ap-modal-content').innerHTML =
    '<div class="ap-modal-title">Event Log &amp; Timeline</div>' +
    '<div class="ap-modal-sub">Full incident &amp; event record</div>' +
    '<div style="overflow-x:auto;">' + tbl.outerHTML + '</div>';
  document.getElementById('ap-modal').style.display = 'block';
  document.body.style.overflow = 'hidden';
}

// ── Expand a threat card ────────────────────────────────────────────
function apOpenThreat(el) {
  const cat  = el.querySelector('[style*="text-transform:uppercase"]') ? el.querySelector('[style*="letter-spacing"]').textContent : '';
  const body = el.querySelector('[style*="line-height:1.7"]') ? el.querySelector('[style*="line-height:1.7"]').textContent : '';
  const icon = el.querySelector('[style*="font-size:clamp(10px"]') ? el.querySelector('[style*="font-size:clamp(10px"]').textContent : '';
  document.getElementById('ap-modal-content').innerHTML =
    '<div class="ap-modal-title">' + icon + ' &nbsp;' + cat + '</div>' +
    '<div class="ap-modal-sub">Threat &amp; Risk Detail</div>' +
    '<p style="font-size:clamp(13px,1.3vw,18px);color:#334155;line-height:1.85;">' + body + '</p>';
  document.getElementById('ap-modal').style.display = 'block';
  document.body.style.overflow = 'hidden';
}
</script>
</body>
</html>`
}
