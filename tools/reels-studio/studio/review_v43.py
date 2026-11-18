"""Offline A/B viewing and human override desk for a private V43 EDL.

Pure local-file output. No network, telemetry, publication or cloud deploys.
Human judgments are separate from pixel-derived candidate ranks.
"""
from __future__ import annotations
import argparse, html, json
from pathlib import Path

STYLE='''
:root{color-scheme:dark;font-family:Inter,system-ui,Arial,sans-serif;background:#11151e;color:#edf0ef}
*{box-sizing:border-box}body{margin:0;padding:24px;max-width:1550px;margin:auto}h1{margin:0;font-weight:900;font-size:clamp(24px,4vw,44px);letter-spacing:-.03em}h2{font-size:19px}h3{font-size:15px}p{line-height:1.55;color:#aeb6c0}.accent{color:#f6cf3f}.muted{font-size:13px;color:#9fa7b2}
header{border-bottom:2px solid #f6cf3f;padding-bottom:20px;margin-bottom:22px}.panel{background:#1a2230;border:1px solid #354052;padding:18px;border-radius:12px;margin-bottom:18px}.warning{border-left:4px solid #f6cf3f;padding-left:14px;margin:15px 0;color:#f0d97a}.layout{display:grid;grid-template-columns:1fr 1fr;gap:12px}video{width:100%;aspect-ratio:9/16;max-height:560px;background:#090d12;object-fit:contain}img{width:100%;height:auto;border-radius:6px}.controls{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:14px 0}button{padding:11px 16px;background:#f6cf3f;color:#0f131a;border:0;border-radius:7px;font-weight:800;cursor:pointer}button.secondary{background:#334458;color:#eef1f1}select{background:#26384c;color:#fff;border:1px solid #718093;border-radius:5px;padding:8px;width:100%;max-width:350px}label{display:grid;gap:6px;font-weight:700;font-size:13px}.edit{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}small{color:#c2c9d1}.code{font-family:ui-monospace,monospace;background:#0e1722;padding:4px 7px;border-radius:5px}table{width:100%;border-collapse:collapse;font-size:13px}td,th{text-align:left;padding:10px 8px;border-bottom:1px solid #384556}thead{background:#2a3543}@media(max-width:850px){.layout,.edit{grid-template-columns:1fr}body{padding:12px}}
'''

def render_review(plan_path:Path, output_path:Path, *, video_a:str, video_b:str,
                  industrial_contact:str, interview_contact:str):
    plan=json.loads(Path(plan_path).read_text(encoding='utf8'))
    data=plan['edit_plan']
    if data.get('publication_approved') is not False or data.get('voice_embedded') is not False:
        raise ValueError('reviewer is for private instrumental lab only')
    if data['version']!='v0.43':raise ValueError('unexpected EDL version')
    metrics=data['scout_metrics']
    for name in ('industry','interview'):
        if not metrics[name].get('inventory'):
            raise ValueError('missing explainable candidate inventory')
    json_js=json.dumps(plan,ensure_ascii=False).replace('</','<\\/')
    def items(rows):
        return ''.join(f'<tr><td>{html.escape(str(r["source_id"]))}</td><td>{r["at_sec"]:.1f}s</td><td>{r["editor_score"]:.3f}</td><td>{r["motion"]:.3f}</td><td>{r["cut_risk"]:.2f}</td></tr>' for r in rows[:8])
    path=Path(output_path);path.parent.mkdir(parents=True,exist_ok=True)
    markup=f'''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Fábrica Aço Gráfico · Mesa V43</title><style>{STYLE}</style></head>
<body><header><div class="muted">VR ABANDONADA · LABORATÓRIO PRIVADO · V0.43</div><h1>O <span class="accent">movimento</span> precisa servir à história.</h1><p>Revisão de tomada com dados de nitidez, ritmo, exposição e redundância. Esses indicadores <strong>não identificam acontecimentos</strong> nem substituem revisão humana.</p></header>
<div class="panel"><h2>Comparação sincronizada A/B</h2><div class="layout"><div><strong>A — CURADORIA CINÉTICA</strong><video id="va" controls preload="metadata" src="{html.escape(video_a,quote=True)}"></video></div><div><strong>B — CURADORIA DOCUMENTAL</strong><video id="vb" controls preload="metadata" src="{html.escape(video_b,quote=True)}"></video></div></div>
<div class="controls"><button onclick="playBoth()">Reproduzir as duas</button><button class="secondary" onclick="pauseBoth()">Pausar</button><button class="secondary" onclick="step(-1)">−1 quadro</button><button class="secondary" onclick="step(1)">+1 quadro</button><span class="muted" id="clock">00.00s</span></div><div class="warning">Não há locução Alexandre neste arquivo; a trilha é de laboratório. Os registros franceses não são da CSN. Arquivo privado, não publicado.</div></div>
<div class="panel"><h2>Diagnóstico de repetição visual</h2><p>O telejornal de 2017 apresenta muitos enquadramentos semelhantes do mesmo entrevistado; a usina francesa é visualmente mais variada. Alterar o timecode <strong>não</strong> garante uma nova composição.</p><div class="layout"><div><h3>Janelas industriais (França, 2011)</h3><img src="{html.escape(industrial_contact,quote=True)}" alt="Miniaturas de janelas originais industriais com pontuação visual"/></div><div><h3>Reportagem da Rodovia do Contorno (2017)</h3><img src="{html.escape(interview_contact,quote=True)}" alt="Miniaturas da entrevista original com pontuação visual"/></div></div></div>
<div class="panel"><h2>Substituição manual de tomadas</h2><p>Escolha um instante para cada segmento. O arquivo EDL é exportado para renderização local; nenhuma alteração é enviada à internet.</p><div class="edit"><label>Reportagem 2017<select id="interview"></select></label><label>Indústria 2011 — janela 1<select id="industry1"></select></label><label>Indústria 2011 — janela 2<select id="industry2"></select></label></div><div class="controls"><button onclick="downloadEdl()">Exportar nova EDL (JSON)</button><span id="status" class="muted" aria-live="polite"></span></div><small>Bloqueios: papel editorial fixo, 5 segundos mínimos entre tomadas industriais, e imagens perceptualmente repetidas não entram em dois slots.</small></div>
<div class="panel"><h2>Como a fábrica pontua</h2><p>Ritmo ideal para a intenção: <span class="code">37%</span>; nitidez: <span class="code">23%</span>; exposição: <span class="code">22%</span>; continuidade sem corte brusco: <span class="code">18%</span>. Medidas não são opiniões estéticas.</p><div class="layout"><div><h3>Melhores candidatos industriais</h3><table><thead><tr><th>Origem</th><th>TC</th><th>Nota</th><th>Mov.</th><th>Risco</th></tr></thead><tbody>{items(metrics['industry']['inventory'])}</tbody></table></div><div><h3>Melhores candidatos da entrevista</h3><table><thead><tr><th>Origem</th><th>TC</th><th>Nota</th><th>Mov.</th><th>Risco</th></tr></thead><tbody>{items(metrics['interview']['inventory'])}</tbody></table></div></div></div>
<script type="application/json" id="edl">{json_js}</script><script>
const raw=JSON.parse(document.querySelector('#edl').textContent);const d=raw.edit_plan;
const footage=d.scout_metrics.industry.inventory, regional=d.scout_metrics.interview.inventory;
const inputs=[['interview',regional,d.shots[2].source_at],['industry1',footage,d.shots[3].source_at],['industry2',footage,d.shots[4].source_at]];
for(const [id,rows,initial] of inputs){{const el=document.getElementById(id);for(const row of rows){{const o=document.createElement('option');o.value=row.at_sec;o.textContent=`${{row.at_sec.toFixed(1)}}s · qualidade ${{row.editor_score.toFixed(3)}} · movimento ${{row.motion.toFixed(3)}}`;el.appendChild(o)}}el.value=String(initial)}}
const a=document.getElementById('va'), b=document.getElementById('vb');
function playBoth(){{b.currentTime=a.currentTime;Promise.allSettled([a.play(),b.play()])}}
function pauseBoth(){{a.pause();b.pause()}}
function step(dir){{pauseBoth();const t=Math.max(0,Math.min(16,a.currentTime+dir/30));a.currentTime=t;b.currentTime=t}}
a.addEventListener('seeked',()=>{{if(Math.abs(a.currentTime-b.currentTime)>.1)b.currentTime=a.currentTime}});
a.addEventListener('timeupdate',()=>{{document.getElementById('clock').textContent=a.currentTime.toFixed(2)+'s';if(!b.paused&&Math.abs(b.currentTime-a.currentTime)>.18)b.currentTime=a.currentTime}});
function distance(x,y){{let n=0;for(let i=0;i<x.length;i++)if(x[i]!==y[i])n++;return n}}
function downloadEdl(){{const [ti,ta,tb]=inputs.map(([id])=>Number(document.getElementById(id).value));const r1=footage.find(x=>x.at_sec===ta),r2=footage.find(x=>x.at_sec===tb);
const status=document.getElementById('status');if(!r1||!r2||Math.abs(ta-tb)<5||distance(r1.hash64,r2.hash64)<6){{status.textContent='Tomadas industriais muito próximas ou visualmente repetidas.';return}}
const newManifest=JSON.parse(JSON.stringify(raw));const shots=newManifest.edit_plan.shots;shots[2].source_at=ti;shots[3].source_at=ta;shots[4].source_at=tb;
newManifest.edit_plan.manual_review_override=true;newManifest.edit_plan.requires_human_semantic_review=true;newManifest.edit_plan.publication_approved=false;newManifest.edit_plan.voice_embedded=false;
const blob=new Blob([JSON.stringify(newManifest,null,2)],{{type:'application/json'}});const u=URL.createObjectURL(blob);const link=document.createElement('a');link.href=u;link.download='V43_EDL_REVISAO_HUMANA.json';link.click();setTimeout(()=>URL.revokeObjectURL(u),1000);status.textContent='EDL exportada localmente para renderização privada.'}}
</script></body></html>'''
    path.write_text(markup,encoding='utf8')
    return path

def main():
    p=argparse.ArgumentParser()
    for flag in ('plan','out','video-a','video-b','industry-sheet','interview-sheet'):
        p.add_argument('--'+flag,required=True)
    a=p.parse_args()
    print(render_review(Path(a.plan),Path(a.out),video_a=a.video_a,
                        video_b=a.video_b,industrial_contact=a.industry_sheet,
                        interview_contact=a.interview_sheet))
if __name__=='__main__':main()