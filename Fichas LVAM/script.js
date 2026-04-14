/* ═══════════════════════════════════════════════════
   LarrainVial — Fund Platform v6.0
   Multi-fund scalable engine + comparator + chatbot
   ═══════════════════════════════════════════════════ */
(function(){
'use strict';

/* ═══════════════ FUND CATALOG (scalable) ═══════════════
   Add new funds here — the entire UI adapts automatically.
*/
const FUNDS = {
    ahorro_uf: {
        name:'Ahorro UF', serie:'A', tipo:'Renta Fija UF',
        patrimonio:214514, manager:'Javier Marshall',
        costos:{rem:1.90,tac:1.61},
        stats:{ytm:1.4,dur:0.9,vol:0.6,rating:'AA+',uf:75.7},
        riesgo:'N-1 (Bajo)', horizonte:'Desde 6 meses',
        rentP:{ytd:1.90,'1m':1.34,'3m':1.90,'6m':2.10,'12m':4.29,'2a':11.51},
        rentM:{
            2023:{may:.41,jun:.83,jul:.74,ago:1.06,sep:.07,oct:.53,nov:.23,dic:1.25},
            2024:{ene:.59,feb:.84,mar:1.09,abr:.66,may:.55,jun:.70,jul:.67,ago:.72,sep:.54,oct:-.08,nov:.90,dic:.41},
            2025:{ene:.73,feb:.53,mar:.40,abr:.60,may:.14,jun:.20,jul:.26,ago:.53,sep:.40,oct:.26,nov:-.03,dic:-.02},
            2026:{ene:.18,feb:.37,mar:1.34},
        },
        rentA:{2024:7.84,2025:4.05,2026:1.90},
        comp:[{n:'Bonos Bancarios',p:47.8,c:'#2E7D32'},{n:'Bonos Corp.',p:25.1,c:'#4CAF50'},{n:'Depositos',p:24.0,c:'#81C784'},{n:'Gobierno',p:3.2,c:'#C8E6C9'}],
        emi:[{n:'Bco Central Chile',p:23.0},{n:'Bco de Chile',p:13.5},{n:'Bco Itau',p:8.9},{n:'Scotiabank',p:8.8},{n:'BCI',p:3.3},{n:'Tesoreria',p:3.2},{n:'Bco Internacional',p:3.1},{n:'Bco Santander',p:3.0},{n:'Bco Security',p:2.5},{n:'Bco Consorcio',p:2.4}],
        inf:3.5,
    },
    /* Comparison funds (placeholder data for comparator) */
    ahorro_clp:{name:'Ahorro CLP',tipo:'Renta Fija CLP',riesgo:'N-1 (Bajo)',rentP:{'12m':3.80},stats:{vol:0.4},horizonte:'Desde 3 meses',costos:{tac:1.45}},
    balanceado:{name:'Balanceado',tipo:'Mixto',riesgo:'N-3 (Moderado)',rentP:{'12m':8.20},stats:{vol:5.2},horizonte:'Desde 24 meses',costos:{tac:2.10}},
    accionario:{name:'Accionario Chile',tipo:'Renta Variable',riesgo:'N-5 (Alto)',rentP:{'12m':15.60},stats:{vol:14.8},horizonte:'Desde 36 meses',costos:{tac:2.85}},
};

const F = FUNDS.ahorro_uf; // Active fund

/* ═══════════════ TOOLTIPS ═══════════════ */
const tipDefs={
    duration:'Indica cuanto podria cambiar el valor del fondo si varian las tasas.',
    rentabilidad_nominal:'Ganancia sin considerar inflacion.',
    rentabilidad_real:'Ganancia real, descontando inflacion.',
    tac:'Costo total anual del fondo.',
    remuneracion:'Comision anual de la administradora.',
    plazo_recomendado:'Tiempo minimo sugerido para invertir.',
    ytm_clf:'Retorno esperado si se mantienen instrumentos hasta vencimiento.',
    volatilidad_1yr:'Cuanto ha variado el fondo en 12 meses. Menor = mas estable.',
    rating_promedio:'Calidad crediticia. AA+ = alta probabilidad de pago.',
    exposicion_uf:'Porcentaje en instrumentos que se ajustan con inflacion.',
};

const Tip={
    el:null,
    init(){
        this.el=document.getElementById('tooltipEl');
        document.querySelectorAll('[data-tooltip]').forEach(d=>{
            d.addEventListener('mouseenter',e=>this.show(e));
            d.addEventListener('mouseleave',()=>this.hide());
            d.addEventListener('click',e=>{e.stopPropagation();this.show(e)});
            d.setAttribute('tabindex','0');
        });
        document.addEventListener('click',()=>this.hide());
    },
    show(e){
        const t=tipDefs[e.target.dataset.tooltip];if(!t)return;
        this.el.textContent=t;this.el.classList.add('tip--visible');
        const r=e.target.getBoundingClientRect();
        let l=r.left+r.width/2-80,top=r.bottom+7;
        if(l<4)l=4;if(l+180>window.innerWidth)l=window.innerWidth-184;
        if(top+40>window.innerHeight)top=r.top-38;
        this.el.style.left=l+'px';this.el.style.top=top+'px';
    },
    hide(){this.el.classList.remove('tip--visible')}
};

/* ═══════════════ TAB NAV + SCROLL SPY ═══════════════ */
function initTabs(){
    const tabs=document.querySelectorAll('.tab');
    const sections=[];
    tabs.forEach(t=>{
        const id=t.getAttribute('href').slice(1);
        const el=document.getElementById(id);
        if(el)sections.push({tab:t,el});
        t.addEventListener('click',e=>{e.preventDefault();el?.scrollIntoView({behavior:'smooth'})});
    });

    const obs=new IntersectionObserver(entries=>{
        entries.forEach(en=>{
            if(en.isIntersecting){
                tabs.forEach(t=>t.classList.remove('tab--active'));
                const match=sections.find(s=>s.el===en.target);
                if(match)match.tab.classList.add('tab--active');
            }
        });
    },{threshold:0.15,rootMargin:'-90px 0px -60% 0px'});
    sections.forEach(s=>obs.observe(s.el));
}

/* ═══════════════ CHARTS ═══════════════ */
const MO=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const ML=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const GR='#00843D',GL='#4CAF50',NV='#1B2A4A',GD='#002E14';

Chart.defaults.font.family="'Source Sans 3',sans-serif";
Chart.defaults.font.size=8;
Chart.defaults.animation.duration=450;
Chart.defaults.animation.easing='easeOutQuart';
Chart.defaults.elements.line.borderWidth=1.5;
Chart.defaults.elements.point.radius=0;

function buildSeries(){
    const d=F.rentM,lb=[],nm=[];let c=100;
    for(const y of Object.keys(d).sort())for(const m of MO)if(d[y][m]!==undefined){c*=(1+d[y][m]/100);lb.push(ML[MO.indexOf(m)]+' '+y.slice(2));nm.push(+c.toFixed(2))}
    const mI=F.inf/12/100,rl=[];let cr=100;
    for(const y of Object.keys(d).sort())for(const m of MO)if(d[y][m]!==undefined){cr*=((1+d[y][m]/100)/(1+mI));rl.push(+cr.toFixed(2))}
    return{lb,nm,rl};
}

function grad(ctx,color,h){const g=ctx.createLinearGradient(0,0,0,h||160);g.addColorStop(0,color+'18');g.addColorStop(1,color+'00');return g}

const xhair={id:'xh',afterDraw(ch){const a=ch.tooltip?.getActiveElements();if(a?.length){const x=a[0].element.x,y=ch.scales.y,ctx=ch.ctx;ctx.save();ctx.beginPath();ctx.moveTo(x,y.top);ctx.lineTo(x,y.bottom);ctx.lineWidth=1;ctx.strokeStyle='rgba(0,132,61,.08)';ctx.setLineDash([3,3]);ctx.stroke();ctx.restore()}}};

let mainChart,chartMode='nominal';

function initMainChart(){
    const cv=document.getElementById('rentabilidadChart'),ctx=cv.getContext('2d'),s=buildSeries();
    mainChart=new Chart(ctx,{type:'line',plugins:[xhair],
        data:{labels:s.lb,datasets:[{data:s.nm,borderColor:GR,backgroundColor:grad(ctx,GR,cv.parentElement.clientHeight),borderWidth:1.5,fill:true,tension:.35,pointRadius:0,pointHitRadius:14,pointHoverRadius:2.5,pointHoverBackgroundColor:GR,pointHoverBorderColor:'#fff',pointHoverBorderWidth:1.5}]},
        options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},layout:{padding:{top:2,right:4,bottom:0,left:0}},
            plugins:{legend:{display:false},tooltip:{backgroundColor:NV,cornerRadius:3,padding:{x:6,y:4},titleFont:{size:7},bodyFont:{size:9,weight:'600'},displayColors:false,caretSize:4,callbacks:{label:c=>'Base 100: '+c.parsed.y.toFixed(2)}}},
            scales:{x:{grid:{display:false},border:{display:false},ticks:{font:{size:7},color:'#999',maxTicksLimit:7}},y:{grid:{color:'rgba(0,0,0,.025)',drawBorder:false},border:{display:false},ticks:{font:{size:7},color:'#999',padding:2,maxTicksLimit:5}}}}});
}

function toggleChart(mode){
    chartMode=mode;const s=buildSeries(),data=mode==='real'?s.rl:s.nm,color=mode==='real'?'#1565C0':GR;
    const ctx=document.getElementById('rentabilidadChart').getContext('2d'),ds=mainChart.data.datasets[0];
    ds.data=data;ds.borderColor=color;ds.backgroundColor=grad(ctx,color,160);ds.pointHoverBackgroundColor=color;
    mainChart.update('active');
}

function initDonut(){
    const ctx=document.getElementById('composicionChart').getContext('2d');
    new Chart(ctx,{type:'doughnut',
        data:{labels:F.comp.map(x=>x.n),datasets:[{data:F.comp.map(x=>x.p),backgroundColor:F.comp.map(x=>x.c),borderWidth:2,borderColor:'#fff',hoverOffset:3}]},
        options:{responsive:true,maintainAspectRatio:true,cutout:'58%',plugins:{legend:{display:false},tooltip:{backgroundColor:NV,cornerRadius:4,padding:{x:8,y:5},bodyFont:{size:9,weight:'600'},displayColors:true,callbacks:{label:c=>' '+c.label+': '+c.parsed+'%'}}}}});
    document.getElementById('composicionLegend').innerHTML=F.comp.map(x=>'<div class="cl"><span class="cl__d" style="background:'+x.c+'"></span><span class="cl__n">'+x.n+'</span><span class="cl__p">'+x.p+'%</span></div>').join('');
}

/* ═══════════════ RENDER FUNCTIONS ═══════════════ */
function renderChips(){
    const p=F.rentP;
    document.getElementById('retChips').innerHTML=[['YTD',p.ytd],['1M',p['1m']],['3M',p['3m']],['6M',p['6m']],['12M',p['12m']],['2A',p['2a']]].map(([l,v])=>'<div class="ret-chip"><div class="ret-chip__per">'+l+'</div><div class="ret-chip__val">'+v.toFixed(2)+'%</div></div>').join('');
}

function renderTable(){
    const tb=document.querySelector('#returnsTable tbody');let h='';
    for(const y of Object.keys(F.rentM).sort()){h+='<tr><td>'+y+'</td>';for(const m of MO){const v=F.rentM[y][m];h+=v!==undefined?'<td class="'+(v>0?'pos':v<0?'neg':'')+'">'+v.toFixed(2)+'</td>':'<td>-</td>'}const a=F.rentA[+y];h+='<td>'+(a!==undefined?a.toFixed(2):'-')+'</td></tr>'}
    tb.innerHTML=h;
}

function renderIssuers(){
    document.getElementById('issuerList').innerHTML=F.emi.map(e=>'<div class="iss"><span class="iss__n">'+e.n+'</span><span class="iss__p">'+e.p+'%</span></div>').join('');
}

/* ═══════════════ SIMULATOR ═══════════════ */
let simChart=null;

const Sim={
    run(monto,months){
        const all=[];for(const y of Object.keys(F.rentM).sort())for(const m of MO)if(F.rentM[y][m]!==undefined)all.push(F.rentM[y][m]/100);
        if(!all.length)return null;
        const nm=[monto],rl=[monto],lb=['Inicio'],mI=F.inf/12/100;
        for(let i=0;i<months;i++){const r=all[i%all.length];nm.push(nm[nm.length-1]*(1+r));rl.push(rl[rl.length-1]*((1+r)/(1+mI)));lb.push('M'+(i+1))}
        const fN=nm[nm.length-1],fR=rl[rl.length-1];
        return{lb,nm,rl,fN,fR,rN:((fN/monto)-1)*100,rR:((fR/monto)-1)*100};
    },
    render(res){
        const w=document.getElementById('simResults');w.classList.add('sim-out--vis');w.style.display='block';
        document.getElementById('simValorNominal').textContent=fmtCLP(res.fN);
        document.getElementById('simRentNominal').textContent='+'+res.rN.toFixed(2)+'%';
        document.getElementById('simValorReal').textContent=fmtCLP(res.fR);
        document.getElementById('simRentReal').textContent='+'+res.rR.toFixed(2)+'%';
        const mo=res.lb.length-1;
        let msg='Historicamente, este fondo ha mostrado estabilidad en este horizonte. ';
        msg+=mo<=12?'La baja volatilidad ofrece mayor previsibilidad en plazos cortos.':'A mayor plazo, la proteccion UF se hace mas visible en la rentabilidad real.';
        document.getElementById('simMessage').textContent=msg;

        const cv=document.getElementById('simChart'),ctx=cv.getContext('2d');
        if(simChart)simChart.destroy();
        simChart=new Chart(ctx,{type:'line',plugins:[xhair],
            data:{labels:res.lb,datasets:[
                {label:'Nominal',data:res.nm,borderColor:GL,backgroundColor:'rgba(76,175,80,.05)',fill:true,tension:.35,borderWidth:1.5,pointRadius:0,pointHitRadius:12,pointHoverRadius:2.5,pointHoverBackgroundColor:GL,pointHoverBorderColor:'#fff',pointHoverBorderWidth:1.5},
                {label:'Real',data:res.rl,borderColor:'rgba(255,255,255,.25)',backgroundColor:'transparent',fill:false,tension:.35,borderWidth:1,borderDash:[4,3],pointRadius:0,pointHitRadius:12}]},
            options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},layout:{padding:{top:2,right:2,bottom:0,left:0}},
                plugins:{legend:{display:true,position:'top',align:'end',labels:{font:{size:7},color:'rgba(255,255,255,.4)',usePointStyle:true,pointStyle:'line',padding:6,boxWidth:12}},
                    tooltip:{backgroundColor:'rgba(0,0,0,.55)',cornerRadius:3,padding:{x:6,y:3},bodyFont:{size:8},caretSize:3,displayColors:false,callbacks:{label:c=>c.dataset.label+': '+fmtCLP(c.parsed.y)}}},
                scales:{x:{grid:{display:false},border:{display:false},ticks:{font:{size:6},color:'rgba(255,255,255,.18)',maxTicksLimit:5}},
                    y:{grid:{color:'rgba(255,255,255,.03)',drawBorder:false},border:{display:false},ticks:{font:{size:6},color:'rgba(255,255,255,.18)',maxTicksLimit:4,callback:v=>'$'+(v/1e6).toFixed(1)+'M'}}}}});
        w.scrollIntoView({behavior:'smooth',block:'nearest'});
    }
};

/* ═══════════════ COMPARATOR ═══════════════ */
function initComparator(){
    const sel=document.getElementById('cmpSelect');
    const tbl=document.getElementById('cmpTable');
    const ins=document.getElementById('cmpInsight');

    sel.addEventListener('change',()=>{
        const id=sel.value;
        if(!id){tbl.style.display='none';ins.style.display='none';return}
        const cf=FUNDS[id];if(!cf)return;
        tbl.style.display='';ins.style.display='';

        document.getElementById('cmpName').textContent=cf.name;
        document.getElementById('cmpRiesgo').textContent=cf.riesgo;
        document.getElementById('cmpRent').textContent=(cf.rentP['12m']||0).toFixed(2)+'%';
        document.getElementById('cmpVol').textContent=(cf.stats.vol||0).toFixed(1)+'%';
        document.getElementById('cmpHorizonte').textContent=cf.horizonte;
        document.getElementById('cmpTac').textContent=(cf.costos.tac||0).toFixed(2)+'%';
        document.getElementById('cmpTipo').textContent=cf.tipo;

        // Insight
        const volDiff=cf.stats.vol-F.stats.vol;
        const rentDiff=(cf.rentP['12m']||0)-F.rentP['12m'];
        let insight='Ahorro UF tiene ';
        if(volDiff>0)insight+='menor volatilidad ('+(F.stats.vol).toFixed(1)+'% vs '+(cf.stats.vol).toFixed(1)+'%), ';
        else insight+='mayor volatilidad, ';
        if(rentDiff>0)insight+='pero '+cf.name+' ha rentado mas en 12 meses (+'+rentDiff.toFixed(2)+'pp). ';
        else insight+='y tambien ha rentado mas en 12 meses. ';
        insight+='Elige segun tu tolerancia al riesgo y horizonte.';
        ins.textContent=insight;
    });
}

/* ═══════════════ CHATBOT ═══════════════ */
const Bot={
    kb:[
        {k:['duration','duracion'],a:'La duracion (0,9) indica cuanto podria cambiar el valor si varian las tasas. Un valor bajo = mas estabilidad.'},
        {k:['riesgo','riesgoso','seguro'],a:'Clasificacion N-1, el nivel mas bajo. 100% renta fija nacional de alta calidad (AA+).'},
        {k:['uf','inflacion','proteccion'],a:'75,7% en instrumentos UF. Tu inversion se ajusta automaticamente con la inflacion.'},
        {k:['rentabilidad','rendimiento','retorno'],a:'12M: 4,29% nominal. Baja volatilidad (0,6%) refleja consistencia.'},
        {k:['tac','costo','comision'],a:'TAC 1,61% anual. Incluye remuneracion y gastos. Se descuenta del valor cuota.'},
        {k:['plazo','horizonte','tiempo'],a:'Desde 6 meses. Ideal para corto a mediano plazo con foco en estabilidad.'},
        {k:['rescate','sacar','liquidez'],a:'T+1: dinero al dia habil siguiente. Sin monto minimo.'},
        {k:['volatilidad','estable','varia'],a:'Solo 0,6% en 12 meses. Muy estable comparado con otros fondos.'},
        {k:['rating','calidad','aa'],a:'AA+: alta calidad crediticia. Emisores con muy alta probabilidad de pago.'},
        {k:['apv','tributario','impuesto'],a:'Serie APV disponible. Tambien aplican Art. 107, 108 y 57 LIR.'},
        {k:['serie'],a:'Serie A: sin monto minimo, ideal para empezar. Serie APV: beneficio tributario. Serie I: institucional.'},
        {k:['comparar','otro fondo','diferencia'],a:'Usa la seccion Comparar para ver lado a lado con otros fondos de LarrainVial.'},
        {k:['que es','fondo','ahorro'],a:'Fondo conservador de renta fija en UF. Busca estabilidad y proteccion contra inflacion.'},
        {k:['hola','buenas'],a:'Hola! Preguntame sobre el fondo: riesgo, rentabilidad, costos, series, o lo que necesites.'},
    ],
    def:'Puedo ayudar con: riesgo, rentabilidad, costos, series, volatilidad, comparar fondos, o si este fondo es para ti.',
    find(q){const lw=q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');for(const e of this.kb)if(e.k.some(k=>lw.includes(k)))return e.a;return this.def},
    init(){
        const w=document.getElementById('chatWidget'),fab=document.getElementById('chatFab'),inp=document.getElementById('chatInput'),msgs=document.getElementById('chatMessages');
        fab.addEventListener('click',()=>{w.classList.toggle('chat--open');if(w.classList.contains('chat--open'))setTimeout(()=>inp.focus(),200)});
        const send=()=>{const q=inp.value.trim();if(!q)return;const u=document.createElement('div');u.className='chat__m chat__m--u';u.textContent=q;msgs.appendChild(u);inp.value='';
            setTimeout(()=>{const b=document.createElement('div');b.className='chat__m chat__m--b';b.textContent=this.find(q);msgs.appendChild(b);msgs.scrollTop=msgs.scrollHeight},300);msgs.scrollTop=msgs.scrollHeight};
        document.getElementById('chatSend').addEventListener('click',send);inp.addEventListener('keydown',e=>{if(e.key==='Enter')send()});
    }
};

/* ═══════════════ ADMIN ═══════════════ */
const Adm={
    init(){
        const p=document.getElementById('adminPanel');
        document.getElementById('adminToggle').addEventListener('click',()=>p.classList.add('adm--open'));
        document.getElementById('adminClose').addEventListener('click',()=>p.classList.remove('adm--open'));
        document.getElementById('adminOverlay').addEventListener('click',()=>p.classList.remove('adm--open'));
        document.addEventListener('keydown',e=>{if(e.key==='Escape')p.classList.remove('adm--open')});

        document.getElementById('adminSave').addEventListener('click',()=>{
            F.name=document.getElementById('adminFundName').value;F.patrimonio=+document.getElementById('adminPatrimonio').value;
            F.costos.rem=+document.getElementById('adminRemuneracion').value;F.costos.tac=+document.getElementById('adminTAC').value;
            this.refresh();this.toast('Datos actualizados')});
        document.getElementById('adminSaveParams').addEventListener('click',()=>{
            F.stats.ytm=+document.getElementById('adminYTM').value;F.stats.dur=+document.getElementById('adminDuration').value;
            F.stats.vol=+document.getElementById('adminVolatilidad').value;F.stats.rating=document.getElementById('adminRating').value;
            F.stats.uf=+document.getElementById('adminExposicionUF').value;
            this.refresh();this.toast('Parametros actualizados')});
        document.getElementById('uploadUF').addEventListener('change',e=>{const f=e.target.files[0];if(f)document.getElementById('uploadUFStatus').textContent='"'+f.name+'" cargado.'});
    },
    refresh(){
        document.getElementById('fundName').textContent=F.name;
        document.getElementById('displayPatrimonio').textContent='$'+F.patrimonio.toLocaleString('es-CL')+' MM';
        document.getElementById('kpiYTM').textContent=F.stats.ytm.toFixed(1).replace('.',',')+' %';
        document.getElementById('kpiDuration').textContent=F.stats.dur.toFixed(1).replace('.',',');
        document.getElementById('kpiVolatilidad').textContent=F.stats.vol.toFixed(1).replace('.',',')+' %';
        document.getElementById('volHero').textContent=F.stats.vol.toFixed(1).replace('.',',')+' %';
        document.getElementById('kpiRating').textContent=F.stats.rating;
        document.getElementById('kpiExposicionUF').textContent=F.stats.uf.toFixed(1).replace('.',',')+' %';
        document.getElementById('kpiTAC').textContent=F.costos.tac.toFixed(2).replace('.',',')+' %';
        document.getElementById('kpiRemuneracion').textContent=F.costos.rem.toFixed(2).replace('.',',')+' %';
    },
    toast(m){const t=document.createElement('div');t.style.cssText='position:fixed;bottom:12px;left:50%;transform:translateX(-50%);z-index:9999;background:#002E14;color:#fff;padding:7px 16px;border-radius:5px;font-size:10px;font-family:inherit;box-shadow:0 4px 16px rgba(0,0,0,.2);animation:ru .3s ease';t.textContent=m;document.body.appendChild(t);setTimeout(()=>{t.style.opacity='0';t.style.transition='opacity .3s';setTimeout(()=>t.remove(),300)},2000)}
};

/* ═══════════════ UTILS ═══════════════ */
function fmtCLP(v){return'$'+Math.round(v).toLocaleString('es-CL')}
function parseCLP(s){return parseInt(s.replace(/[^0-9]/g,''),10)||0}

/* ═══════════════ INIT ═══════════════ */
function init(){
    initTabs();
    Tip.init();
    initMainChart();
    initDonut();
    renderChips();
    renderTable();
    renderIssuers();
    initComparator();

    // Toggle
    document.getElementById('chartToggle').addEventListener('click',e=>{const b=e.target.closest('.tog');if(!b)return;document.querySelectorAll('.tog').forEach(x=>x.classList.remove('tog--on'));b.classList.add('tog--on');toggleChart(b.dataset.mode)});

    // Simulator
    const si=document.getElementById('simMonto');
    si.addEventListener('input',()=>{const r=parseCLP(si.value);if(r>0)si.value=r.toLocaleString('es-CL')});
    let ran=false;
    function runSim(){const m=parseCLP(si.value),mo=+document.getElementById('simHorizonte').value;if(m<1000){si.focus();return}const r=Sim.run(m,mo);if(r){Sim.render(r);ran=true}}
    document.getElementById('simRun').addEventListener('click',runSim);
    document.getElementById('simHorizonte').addEventListener('change',()=>{if(ran)runSim()});

    Bot.init();
    Adm.init();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
})();
