/* ============================================================================
 * KAPLAN REPORT (admin)  —  paste this whole block into Code.gs
 * Place it right after the adminSetExamTotal / QUIZ REPORT section
 * (anywhere at top level is fine).
 *
 * adminKaplanReport(token, videoId)
 *   videoId blank  -> overview: every Kaplan video + every student's progress
 *   videoId = id   -> one video: every student's % / watched / minutes / last watched,
 *                     plus the students who have not started it
 * A video counts as WATCHED at 90% (same rule the student portal uses).
 * Students who cannot open the Kaplan page (TSA Live with it switched off) and
 * blocked students are left out of the counts.
 * ========================================================================== */
function adminKaplanReport(token, vid) {
  adminOnly_(token);
  const cat = kaplanCatalog_();
  const ids = cat.ids || [], titles = cat.titles || {};
  const VS = allVideoStates_();
  const pctOf = v => !v ? 0 : (v[3] ? 100 : (v[2] || 0));
  const watched = v => !!v && (!!v[3] || (v[2] || 0) >= 90);

  const S = [];
  readObjs_(sheet_('Students')).forEach(o => {
    const u = norm_(o['Username']); if (!u || String(o['Role']).toLowerCase() === 'admin') return;
    const tsa = isTsa_(o['Access']), status = String(o['Status'] || 'Active');
    S.push({ u: u, name: String(o['Full Name'] || u), mobile: String(o['Mobile'] || '').replace(/^'/, ''), access: tsa ? 'TSA Live' : 'Full',
      active: !/blocked|inactive/i.test(status) && canOpenPage_({ admin: false, tsa: tsa }, 'kaplan') });
  });
  const E = S.filter(s => s.active);

  const videos = ids.map((id, i) => {
    let done = 0, started = 0, sum = 0, secs = 0;
    E.forEach(s => {
      const v = (VS[s.u] || {})[id], p = pctOf(v);
      if (watched(v)) done++; else if (p > 0) started++;
      sum += watched(v) ? 100 : p; secs += (v && v[4]) || 0;
    });
    return { id: id, title: titles[id] || ('Video ' + (i + 1)), n: i + 1, done: done, started: started, notStarted: E.length - done - started,
      avg: E.length ? Math.round(sum / E.length) : null, minutes: Math.round(secs / 60) };
  });

  const students = S.map(s => {
    const vs = VS[s.u] || {}; let done = 0, started = 0, secs = 0, last = 0;
    ids.forEach(id => { const v = vs[id]; if (!v) return; if (watched(v)) done++; else if (pctOf(v) > 0) started++; secs += v[4] || 0; if ((v[5] || 0) > last) last = v[5]; });
    return { u: s.u, name: s.name, mobile: s.mobile, access: s.access, active: s.active, done: done, started: started, total: ids.length,
      pct: ids.length ? Math.round(done * 100 / ids.length) : 0, minutes: Math.round(secs / 60), last: last };
  }).sort((a, b) => (b.done - a.done) || (b.started - a.started) || a.name.localeCompare(b.name));
  students.forEach((s, i) => { s.rank = i + 1; });

  const out = { ok: true, total: ids.length, eligible: E.length, videos: videos, students: students, vid: '',
    generatedText: Utilities.formatDate(new Date(), tz_(), 'd MMM yyyy, h:mm a') };

  if (vid && ids.indexOf(vid) >= 0) {
    out.vid = vid; out.video = videos[ids.indexOf(vid)];
    out.rows = []; out.missing = [];
    E.forEach(s => {
      const v = (VS[s.u] || {})[vid], p = pctOf(v);
      if (!v || (!p && !(v[4] > 0))) { out.missing.push({ u: s.u, name: s.name, mobile: s.mobile, access: s.access }); return; }
      out.rows.push({ u: s.u, name: s.name, mobile: s.mobile, access: s.access, pct: p, watched: watched(v), pos: v[0] || 0, dur: v[1] || 0,
        minutes: Math.round((v[4] || 0) / 60), last: v[5] || 0 });
    });
    out.rows.sort((a, b) => (b.pct - a.pct) || a.name.localeCompare(b.name));
    out.missing.sort((a, b) => a.name.localeCompare(b.name));
  }
  return out;
}
