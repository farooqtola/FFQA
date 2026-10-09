/* ============================================================================
 * KAPLAN REPORT (admin)  —  paste this block into Index.html
 * Put it inside the <script>, right after the drawAQRep / qrDownload functions
 * (i.e. just before the "REPORT CARD" comment).
 * Needs NO new CSS: it reuses the Quiz Report styles (qr-*).
 * ========================================================================== */
function kpBand(p,w){ return w?['Watched','qr-d']:p>0?['In progress','qr-p']:['Not started','qr-na']; }
function vAKap(){
  $('main').innerHTML='<div class="loading">Preparing Kaplan report…</div>';
  call('adminKaplanReport',S.token,S.kapVid||'').then(function(r){ S.kap=r; S.kapVid=r.vid; if(S.tab==='a-kap') drawAKap(); }).catch(showErr);
}
function drawAKap(){
  var r=S.kap, acc=S.kapAcc||'', q=(S.kapQ||'');
  var h='<div class="ph"><div><h2>🎥 Kaplan Report</h2><p>See how every student is doing in the Kaplan Mix Bank videos — overall, or one video at a time. A video counts as watched at 90%. Updated '+esc(r.generatedText)+'.</p></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn gold sm" id="kpDl">⬇ Download HTML report</button><button class="btn ghost sm" id="kpR">⟳ Refresh</button></div></div>'+
    '<div class="card qr-ctl"><div class="fld" style="margin:0;flex:2;min-width:240px"><label>Video</label><select id="kpV"><option value="">📊 All videos — student overview</option>'+
    r.videos.map(function(v){ return '<option value="'+esc(v.id)+'"'+(v.id===r.vid?' selected':'')+'>'+v.n+'. '+esc(v.title)+' — '+v.done+' watched</option>'; }).join('')+'</select></div>'+
    '<div class="fld" style="margin:0"><label>Access</label><select id="kpA"><option value="">All students</option><option'+(acc==='TSA Live'?' selected':'')+'>TSA Live</option><option'+(acc==='Full'?' selected':'')+'>Full</option></select></div></div><div id="kpBody"></div>';
  $('main').innerHTML=h;
  $('kpV').onchange=function(){ S.kapVid=this.value; vAKap(); };
  $('kpA').onchange=function(){ S.kapAcc=this.value; drawAKap(); };
  $('kpR').onclick=function(){ var b=this; b.disabled=true; call('adminRefreshCaches',S.token).then(vAKap).catch(function(e){ toast(e.message); b.disabled=false; }); };
  if(!r.total){ $('kpBody').innerHTML='<div class="empty">No Kaplan videos found. Add YouTube links to your <b>kaplan</b> page, then press ⟳ Refresh.</div>'; $('kpDl').onclick=function(){ toast('No Kaplan videos yet.'); }; return; }
  $('kpDl').onclick=function(){ kapDownload(r,acc); };
  var inAcc=function(x){ return !acc||x.access===acc; };
  var b='';
  if(!r.vid){
    var L=r.students.filter(function(s){ return s.active&&inAcc(s); }), done=L.reduce(function(a,s){ return a+s.done; },0);
    var avg=L.length?Math.round(done*100/(L.length*r.total)):0, fin=L.filter(function(s){ return s.done>=r.total; }).length, none=L.filter(function(s){ return !s.done&&!s.started; });
    b+='<div class="qr-hero"><div class="qr-k">🎥 KAPLAN MIX BANK'+(acc?' · '+esc(acc.toUpperCase()):'')+'</div><h3>'+r.total+' videos · '+L.length+' students</h3><div class="qr-stats">'+
      [[avg+'%','Average completion'],[fin,'Finished all'],[L.filter(function(s){ return s.done||s.started; }).length,'Started'],[none.length,'Not started'],[Math.round(L.reduce(function(a,s){ return a+s.minutes; },0)/60*10)/10+' h','Watch time']].map(function(x){ return '<div><b>'+x[0]+'</b><span>'+x[1]+'</span></div>'; }).join('')+'</div></div>';
    b+='<div class="qr-two"><div class="card"><h3 class="qr-h">🎬 Videos <span class="small">— tap one for its report</span></h3><div class="tw" style="max-height:420px"><table class="t"><thead><tr><th>#</th><th>Video</th><th>Watched</th><th>In progress</th><th>Not started</th></tr></thead><tbody>'+
      r.videos.map(function(v){ var p=r.eligible?Math.round(v.done*100/r.eligible):0; return '<tr style="cursor:pointer" data-kv="'+esc(v.id)+'"><td>'+v.n+'</td><td><b style="color:var(--navy)">'+esc(v.title)+'</b><div class="qr-bar" style="margin-top:4px"><i class="qr-d" style="width:'+p+'%"></i></div></td><td><b>'+v.done+'</b></td><td>'+v.started+'</td><td>'+v.notStarted+'</td></tr>'; }).join('')+'</tbody></table></div></div>'+
      '<div class="card"><h3 class="qr-h">⏳ Not started yet <span class="small">('+none.length+')</span></h3>'+(none.length?'<div class="qr-mlist" style="margin:0">'+none.map(function(x){ var ph=waNum(x.mobile), msg='Assalam-o-Alaikum '+x.name.split(' ')[0]+'! Please start the Kaplan Mix Bank video solutions on the FFQA TX portal. Your progress is saved automatically. — Sir Faizan';
        return '<div class="vrow"><span class="t" style="flex:1"><b>'+esc(x.name)+'</b> <span class="small">@'+esc(x.u)+'</span></span>'+(ph?'<a class="btn sm" style="background:#1f7a4d;text-decoration:none" target="_blank" href="https://wa.me/'+ph+'?text='+encodeURIComponent(msg)+'">Remind</a>':'')+'</div>'; }).join('')+'</div>':'<div class="small">Everyone has started ✓</div>')+'</div></div>';
    b+='<div class="toolbar" style="margin-top:14px"><h3 class="qr-h" style="margin:0;flex:1">🏆 Student progress</h3><input id="kpQ" placeholder="🔎 Find student" value="'+esc(q)+'" style="min-width:200px"></div>'+
      '<div class="tw"><table class="t"><thead><tr><th>Rank</th><th>Student</th><th style="min-width:170px">Progress</th><th>Watched</th><th>In progress</th><th>Minutes</th><th>Last watched</th><th></th></tr></thead><tbody id="kpT"></tbody></table></div>';
    $('kpBody').innerHTML=b;
    var draw=function(){ var qq=($('kpQ').value||'').toLowerCase(); S.kapQ=$('kpQ').value;
      $('kpT').innerHTML=L.filter(function(x){ return !qq||(x.name+' '+x.u).toLowerCase().indexOf(qq)>=0; }).map(function(x,i){ var md=i<3?['🥇','🥈','🥉'][i]:i+1;
        return '<tr><td><b class="qr-rk">'+md+'</b></td><td><b style="color:var(--navy)">'+esc(x.name)+'</b><div class="small">@'+esc(x.u)+' · '+esc(x.access)+'</div></td><td><div class="qr-bar"><i class="'+(x.pct>=100?'qr-d':'qr-p')+'" style="width:'+x.pct+'%"></i></div><b class="small" style="color:var(--navy)">'+x.pct+'%</b></td><td><b>'+x.done+'</b><span class="small"> / '+x.total+'</span></td><td>'+x.started+'</td><td>'+x.minutes+'</td><td class="small">'+(x.last?ago(x.last):'never')+'</td><td><button class="btn ghost sm" data-rc="'+esc(x.u)+'" title="Report card">📋</button></td></tr>'; }).join('')||'<tr><td colspan="8" class="small" style="text-align:center;padding:18px">No student matches.</td></tr>';
      Array.prototype.forEach.call($('kpT').querySelectorAll('[data-rc]'),function(bt){ bt.onclick=function(){ openReportCard(bt.getAttribute('data-rc')); }; }); };
    $('kpQ').oninput=draw; draw();
    Array.prototype.forEach.call($('kpBody').querySelectorAll('[data-kv]'),function(tr){ tr.onclick=function(){ S.kapVid=tr.getAttribute('data-kv'); vAKap(); }; });
    return;
  }
  var V=r.video, R=r.rows.filter(inAcc), M=r.missing.filter(inAcc), W=R.filter(function(x){ return x.watched; }), P=R.length-W.length, total=R.length+M.length;
  b+='<div class="qr-hero"><div class="qr-k">🎥 KAPLAN VIDEO '+V.n+' OF '+r.total+(acc?' · '+esc(acc.toUpperCase()):'')+'</div><h3>'+esc(V.title)+'</h3><div class="qr-stats">'+
    [[W.length,'Watched'],[P,'In progress'],[M.length,'Not started'],[total?Math.round(W.length*100/total)+'%':'—','Completion'],[R.reduce(function(a,x){ return a+x.minutes; },0),'Minutes watched']].map(function(x){ return '<div><b>'+x[0]+'</b><span>'+x[1]+'</span></div>'; }).join('')+'</div></div>';
  b+='<div class="toolbar"><button class="btn ghost sm" id="kpPrev"'+(V.n<=1?' disabled':'')+'>← Previous video</button><button class="btn ghost sm" id="kpNext"'+(V.n>=r.total?' disabled':'')+'>Next video →</button><button class="btn ghost sm" id="kpAll">📊 All videos</button></div>';
  if(R.length) b+='<div class="toolbar"><h3 class="qr-h" style="margin:0;flex:1">Students who have started</h3><input id="kpQ" placeholder="🔎 Find student" value="'+esc(q)+'" style="min-width:200px"></div><div class="tw"><table class="t"><thead><tr><th>Student</th><th style="min-width:150px">Progress</th><th>Status</th><th>Minutes</th><th>Stopped at</th><th>Last watched</th><th></th></tr></thead><tbody id="kpT"></tbody></table></div>';
  else b+='<div class="empty">Nobody'+(acc?' with '+esc(acc)+' access':'')+' has started this video yet.</div>';
  if(M.length) b+='<details class="card qr-miss"'+(R.length?'':' open')+'><summary>⏳ <b>'+M.length+'</b> student'+(M.length>1?'s have':' has')+' not started this video <span class="small">— tap to see and remind</span></summary><div class="qr-mlist">'+M.map(function(x){ var ph=waNum(x.mobile), msg='Assalam-o-Alaikum '+x.name.split(' ')[0]+'! Please watch the Kaplan video "'+V.title+'" on the FFQA TX portal (Kaplan Mix Bank). — Sir Faizan';
    return '<div class="vrow"><span class="t" style="flex:1"><b>'+esc(x.name)+'</b> <span class="small">@'+esc(x.u)+' · '+esc(x.access)+'</span></span>'+(ph?'<a class="btn sm" style="background:#1f7a4d;text-decoration:none" target="_blank" href="https://wa.me/'+ph+'?text='+encodeURIComponent(msg)+'">Remind</a>':'')+'</div>'; }).join('')+'</div></details>';
  $('kpBody').innerHTML=b;
  var step=function(d){ var x=r.videos[V.n-1+d]; if(x){ S.kapVid=x.id; vAKap(); } };
  $('kpPrev').onclick=function(){ step(-1); }; $('kpNext').onclick=function(){ step(1); }; $('kpAll').onclick=function(){ S.kapVid=''; vAKap(); };
  if(R.length){
    var draw2=function(){ var qq=($('kpQ').value||'').toLowerCase(); S.kapQ=$('kpQ').value;
      $('kpT').innerHTML=R.filter(function(x){ return !qq||(x.name+' '+x.u).toLowerCase().indexOf(qq)>=0; }).map(function(x){ var t=kpBand(x.pct,x.watched);
        return '<tr><td><b style="color:var(--navy)">'+esc(x.name)+'</b><div class="small">@'+esc(x.u)+' · '+esc(x.access)+'</div></td><td><div class="qr-bar"><i class="'+(x.watched?'qr-d':'qr-p')+'" style="width:'+x.pct+'%"></i></div><b class="small" style="color:var(--navy)">'+x.pct+'%</b></td><td><span class="qr-tag '+t[1]+'">'+t[0]+'</span></td><td>'+x.minutes+'</td><td class="small">'+(x.pos&&!x.watched?fmtT(x.pos)+(x.dur?' / '+fmtT(x.dur):''):'—')+'</td><td class="small">'+(x.last?ago(x.last):'—')+'</td><td><button class="btn ghost sm" data-rc="'+esc(x.u)+'" title="Report card">📋</button></td></tr>'; }).join('')||'<tr><td colspan="7" class="small" style="text-align:center;padding:18px">No student matches.</td></tr>';
      Array.prototype.forEach.call($('kpT').querySelectorAll('[data-rc]'),function(bt){ bt.onclick=function(){ openReportCard(bt.getAttribute('data-rc')); }; }); };
    $('kpQ').oninput=draw2; draw2();
  }
}
function kapDownload(r,acc){
  var e=function(t){ return String(t==null?'':t).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
  var L=r.students.filter(function(s){ return s.active&&(!acc||s.access===acc); });
  var when=new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
  var css='*{box-sizing:border-box}body{margin:0;background:#FBF8F1;color:#1d2433;font:15px/1.5 Inter,Segoe UI,Arial,sans-serif}h1,h2{font-family:Georgia,serif;margin:0}.w{max-width:980px;margin:0 auto;padding:24px 16px 40px}.hero{background:linear-gradient(135deg,#0B1F3A,#1d3d6b);color:#fff;border-radius:20px;padding:28px 22px;text-align:center}.hero h1 em{color:#e7cf7a;font-style:normal}.hero p{color:#c7d2e3;margin:6px 0 0}.card{background:#fff;border:1px solid #e8e0cb;border-radius:16px;margin-top:20px;overflow:hidden}.card h2{font-size:20px;color:#0B1F3A;padding:14px 18px;border-bottom:1px solid #efe8d6}table{width:100%;border-collapse:collapse}th{font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#6b7280;text-align:left;padding:10px 14px;background:#faf7ef}td{padding:10px 14px;border-top:1px solid #f3eee2}.bar{height:8px;background:#f1ece0;border-radius:99px;overflow:hidden;min-width:100px}.bar i{display:block;height:100%;background:#C9A227}.bar i.f{background:#1f7a4d}.ft{text-align:center;color:#6b7280;font-size:13px;margin-top:24px}';
  var html='<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kaplan Mix Bank Report | FFQA</title><style>'+css+'</style></head><body><div class="w"><div class="hero"><h1>Kaplan Mix Bank · <em>Video Report</em></h1><p>ACCA TX (UK) · '+L.length+' students · '+r.total+' videos · '+e(when)+(acc?' · '+e(acc):'')+'</p></div>'+
    '<div class="card"><h2>🎬 Videos</h2><div style="overflow-x:auto"><table><thead><tr><th>#</th><th>Video</th><th>Watched</th><th>In progress</th><th>Not started</th></tr></thead><tbody>'+r.videos.map(function(v){ return '<tr><td>'+v.n+'</td><td><b>'+e(v.title)+'</b></td><td>'+v.done+'</td><td>'+v.started+'</td><td>'+v.notStarted+'</td></tr>'; }).join('')+'</tbody></table></div></div>'+
    '<div class="card"><h2>🏆 Student progress</h2><div style="overflow-x:auto"><table><thead><tr><th>Rank</th><th>Student</th><th>Progress</th><th>Watched</th><th>In progress</th><th>Minutes</th></tr></thead><tbody>'+L.map(function(s,i){ return '<tr><td>'+(i+1)+'</td><td><b>'+e(s.name)+'</b></td><td><div class="bar"><i class="'+(s.pct>=100?'f':'')+'" style="width:'+s.pct+'%"></i></div>'+s.pct+'%</td><td>'+s.done+' / '+s.total+'</td><td>'+s.started+'</td><td>'+s.minutes+'</td></tr>'; }).join('')+'</tbody></table></div></div>'+
    '<div class="ft">Prepared by <b>Sir Faizan Farooq Tola (FFQA)</b> · ACCA TX Live Classes · WhatsApp 00923343440590<br>A video counts as watched at 90%.</div></div></body></html>';
  try { var a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([html],{type:'text/html'})); a.download='Kaplan Report'+(acc?' - '+acc:'')+'.html'; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },4000); toast('⬇ Kaplan Report downloaded'); }
  catch(err){ toast('Download blocked by the browser.'); }
}
