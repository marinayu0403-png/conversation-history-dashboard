import re

with open("frontend/script.js", "r", encoding="utf-8") as f:
    js = f.read()

# 1. Add statsData
js = js.replace("let aiResults = [];", "let aiResults = [];\n    let statsData = null;")
js = js.replace("aiResults = data.aiResults;", "aiResults = data.aiResults;\n        statsData = data.stats;")

# 2. Rewrite renderOverview
overview_body = """    function renderOverview() {
      if (!statsData) return;
      const ov = statsData.overview;
      
      const fmtDate = d => {
        if (!d) return '';
        const date = new Date(d);
        if (isNaN(date)) return '';
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return y + '/' + m + '/' + dd;
      };

      document.getElementById('statGrid').innerHTML = `
    <div class="stat-card blue"><div class="stat-label">${T('statSessions')}</div><div class="stat-value">${ov.totalSessions}</div><div class="stat-sub">${T('statSessionsSub')}</div></div>
    <div class="stat-card green"><div class="stat-label">${T('statMsgs')}</div><div class="stat-value">${ov.totalMsgs.toLocaleString()}</div><div class="stat-sub">AGENT + USER</div></div>
    <div class="stat-card purple"><div class="stat-label">${T('statWithUser')}</div><div class="stat-value">${ov.sessWithUser}</div><div class="stat-sub">SESSION / ${ov.totalSessions}</div></div>
    <div class="stat-card amber"><div class="stat-label">${T('statAvgMsgs')}</div><div class="stat-value">${ov.avgMsgs}</div><div class="stat-sub">${T('statAvgMsgsSub')}</div></div>
    <div class="stat-card cyan"><div class="stat-label">${T('statUserMsgs')}</div><div class="stat-value">${ov.userMsgs}</div><div class="stat-sub">${ov.agentMsgs} AGENT</div></div>

    ${statCardTip('--red', 'statNoInteract', ov.noInteractPct + '%', null, null, 'tipNoInteract', null, null)}
    ${ov.uniqueUsers > 0 ? statCardTip('--indigo', 'statUniqueUsers', ov.uniqueUsers, 'statUniqueUsersSub', null, 'tipUniqueUsers', null, null) : ''}
    ${ov.avgDurMin !== null ? statCardTip('--amber', 'statAvgDuration', ov.avgDurMin + ' ' + T('minuteUnit'), null, null, 'tipDuration', null, ov.durOutlierCount > 0 ? ov.durOutlierIds : null) : ''}

    ${ov.tsMin ? `<div class="stat-card" style="border-left:3px solid var(--text3)"><div class="stat-label">${T('statDateRange')}</div><div class="stat-value" style="font-size:13px;color:var(--text2);line-height:1.5;">${fmtDate(ov.tsMin)}<br>～ ${fmtDate(ov.tsMax)}</div></div>` : ''}
  `;

      // Msg distribution chart
      const bins = ['1', '2-4', '5-9', '10-19', '20-49', '50-99', '100+'];
      destroyChart('msgDistChart');
      chartInstances['msgDistChart'] = new Chart(document.getElementById('msgDistChart'), {
        type: 'bar',
        data: {
          labels: bins,
          datasets: [{ data: statsData.msgDistChart, backgroundColor: '#3b82f6cc', borderColor: '#3b82f6', borderWidth: 1, borderRadius: 4 }]
        },
        options: { ...barOpts(), plugins: { legend: { display: false } } }
      });

      // Speaker pie
      destroyChart('speakerChart');
      chartInstances['speakerChart'] = new Chart(document.getElementById('speakerChart'), {
        type: 'doughnut',
        data: {
          labels: ['AGENT', 'USER'],
          datasets: [{ data: [ov.agentMsgs, ov.userMsgs], backgroundColor: ['#3b82f6', '#22c55e'], borderWidth: 0 }]
        },
        options: { ...pieOpts() }
      });
    }"""
js = re.sub(r"    function renderOverview\(\) \{.*?\n    \}(?=\n\n    // ════════════════════════════════════════════\n    //  LANGUAGE)", overview_body, js, flags=re.DOTALL)

# 3. Rewrite renderLanguage
lang_body = """    function renderLanguage() {
      if (!statsData) return;
      const ls = statsData.language;
      const el = document.getElementById('langContent');

      if (Object.keys(ls.langCount).length === 0) {
        el.innerHTML = `<div class="empty-state"><div class="eicon">🌐</div><p>CSV 中未包含語言欄位</p><small>請在欄位設定中選擇語言欄位後重新載入</small></div>`;
        return;
      }

      const langColors = { '日文': '#3b82f6', '中文': '#22c55e', '英文/其他': '#a855f7', '無用戶互動': '#374151', '未知': '#64748b' };
      const getColor = l => langColors[l] || '#f59e0b';
      const userMsgsTotal = statsData.overview.userMsgs || 1;

      el.innerHTML = `
    <div class="stat-grid">
      ${Object.entries(ls.langCount).map(([l, c]) => `
        <div class="stat-card" style="border-left:3px solid ${getColor(l)}">
          <div class="stat-label">用戶訊息・${l}</div>
          <div class="stat-value" style="color:${getColor(l)}">${c}</div>
          <div class="stat-sub">${((c / userMsgsTotal) * 100).toFixed(1)}% 的用戶訊息</div>
        </div>`).join('')}
    </div>

    <div class="chart-grid">
      <div class="chart-card">
        <div class="chart-title">${T('langMsgTitle')}</div>
        <div class="chart-sub">${T('langMsgSub')}</div>
        <div class="chart-wrap"><canvas id="langMsgChart"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="chart-title">${T('langSessTitle')}</div>
        <div class="chart-sub">${T('langSessSub')}</div>
        <div class="chart-wrap"><canvas id="langSessChart"></canvas></div>
      </div>
    </div>

    <p class="section-h">${T('langBarSection')}</p>
    <div class="chart-card">
      <div class="bar-list" id="langBarList"></div>
    </div>
  `;

      const mkPie = (id, data, labels) => {
        destroyChart(id);
        chartInstances[id] = new Chart(document.getElementById(id), {
          type: 'doughnut',
          data: { labels, datasets: [{ data, backgroundColor: labels.map(getColor), borderWidth: 0 }] },
          options: { ...pieOpts() }
        });
      };
      
      const msgEntries = Object.entries(ls.langCount).sort((a, b) => b[1] - a[1]);
      mkPie('langMsgChart', msgEntries.map(e => e[1]), msgEntries.map(e => e[0]));
      
      const sessEntries = Object.entries(ls.sessLangCount).sort((a, b) => b[1] - a[1]);
      mkPie('langSessChart', sessEntries.map(e => e[1]), sessEntries.map(e => e[0]));

      const maxSess = Math.max(...sessEntries.map(e => e[1]), 1);
      document.getElementById('langBarList').innerHTML = sessEntries.map(([l, c]) => `
    <div class="bar-item">
      <div class="bar-label">${l}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${(c / maxSess * 100).toFixed(1)}%;background:${getColor(l)}"></div></div>
      <div class="bar-val">${c}</div>
    </div>`).join('');

      // Length charts
      if (Object.keys(ls.langLenUserAvg).length > 0) {
        const langs = Object.keys(ls.langLenUserAvg);
        const sec = document.createElement('div');
        sec.id = 'langLenSection';
        sec.innerHTML = `
      <p class="section-h" id="ui-langLenSection">${T('langLenSection')}</p>
      <div class="chart-grid">
        <div class="chart-card">
          <div class="chart-title" id="ui-langLenUserTitle">${T('langLenUserTitle')}</div>
          <div class="chart-sub" id="ui-langLenUserSub">${T('langLenUserSub')}</div>
          <div class="chart-wrap"><canvas id="langLenUserChart"></canvas></div>
        </div>
        <div class="chart-card">
          <div class="chart-title" id="ui-langLenAgentTitle">${T('langLenAgentTitle')}</div>
          <div class="chart-sub" id="ui-langLenAgentSub">${T('langLenAgentSub')}</div>
          <div class="chart-wrap"><canvas id="langLenAgentChart"></canvas></div>
        </div>
      </div>`;
        document.getElementById('langContent').appendChild(sec);
        
        const mkBar = (id, vals, labels, colors) => {
          destroyChart(id);
          chartInstances[id] = new Chart(document.getElementById(id), {
            type: 'bar',
            data: { labels, datasets: [{ data: vals, backgroundColor: colors.map(c => c + 'cc'), borderColor: colors, borderWidth: 1, borderRadius: 5 }] },
            options: { ...barOpts(), plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `${T('avgChar')} ${ctx.raw}` } } } }
          });
        };
        mkBar('langLenUserChart', langs.map(l => ls.langLenUserAvg[l]), langs, langs.map(getColor));
        mkBar('langLenAgentChart', langs.map(l => ls.langLenAgentAvg[l]), langs, langs.map(getColor));
      }
    }"""
js = re.sub(r"    function renderLanguage\(\) \{.*?\n    \}(?=\n\n    // ════════════════════════════════════════════\n    //  AI)", lang_body, js, flags=re.DOTALL)


# 4. Rewrite renderTime
time_body = """    function renderTime() {
      if (!statsData) return;
      const ts = statsData.time;

      const langColors = { '日文': '#3b82f6', '中文': '#22c55e', '英文/其他': '#a855f7', '無用戶互動': '#374151', '未知': '#64748b' };
      const getColor = l => langColors[l] || '#f59e0b';

      const mkBar = (id, data, labels, color) => {
        destroyChart(id);
        chartInstances[id] = new Chart(document.getElementById(id), {
          type: 'bar',
          data: { labels, datasets: [{ data, backgroundColor: color + 'cc', borderColor: color, borderWidth: 1, borderRadius: 3 }] },
          options: { ...barOpts(), plugins: { legend: { display: false } } }
        });
      };

      mkBar('hourDistChart', ts.hourCounts, Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`), '#6366f1');
      mkBar('dayDistChart', ts.dayCounts, ['週日', '週一', '週二', '週三', '週四', '週五', '週六'], '#8b5cf6');
      mkBar('durationDistChart', ts.durBinCounts, ['< 1m', '1-3m', '3-5m', '5-10m', '10-20m', '> 20m'], '#f59e0b');
      mkBar('replyDistChart', ts.replyBins, ['< 5s', '5-15s', '15-30s', '30-60s', '1-3m', '> 3m'], '#10b981');

      if (ts.avgReplySpeed !== null) {
        const avgSec = ts.avgReplySpeed;
        const color = avgSec < 15 ? 'green' : (avgSec < 30 ? 'blue' : 'amber');
        document.getElementById('timeStatGrid').innerHTML = `
          <div class="stat-card ${color}">
            <div class="stat-label">${T('statAvgReply')}</div>
            <div class="stat-value">${avgSec}</div>
            <div class="stat-sub">${T('statAvgReplySub')}</div>
          </div>
        `;
      } else {
        document.getElementById('timeStatGrid').innerHTML = '';
      }

      const lars = Object.entries(ts.langAvgReply).sort((a, b) => b[1] - a[1]);
      if (lars.length > 0) {
        destroyChart('replyByLangChart');
        chartInstances['replyByLangChart'] = new Chart(document.getElementById('replyByLangChart'), {
          type: 'bar',
          data: {
            labels: lars.map(e => e[0]),
            datasets: [{ data: lars.map(e => e[1]), backgroundColor: lars.map(e => getColor(e[0]) + 'cc'), borderColor: lars.map(e => getColor(e[0])), borderWidth: 1, borderRadius: 4 }]
          },
          options: { ...barOpts(), plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.raw + ' 秒' } } } }
        });
      }
    }"""
js = re.sub(r"    function renderTime\(\) \{.*?\n    \}(?=\n\n    // ════════════════════════════════════════════\n    //  BEHAVIOR)", time_body, js, flags=re.DOTALL)


# 5. Rewrite renderBehavior
behavior_body = """    function renderBehavior() {
      if (!statsData) return;
      const bs = statsData.behavior;
      const ov = statsData.overview;

      const mkSessList = (sids, limit) => {
        const toShow = sids.slice(0, limit);
        if (!toShow.length) return `<div class="empty-state" style="padding:20px"><p>無符合的 Session</p></div>`;
        return `<div style="display:flex;flex-wrap:wrap;gap:8px">` +
          toShow.map(sid => {
            const s = sessions.find(x => x.id === sid);
            if (!s) return '';
            return `<button class="btn btn-blue" style="font-family:monospace;font-size:11px" onclick="showSessionDetail('${sid}')">${sid}</button>`;
          }).join('') +
          (sids.length > limit ? `<div style="font-size:11px;color:var(--text3);padding:8px">...還有 ${sids.length - limit} 筆</div>` : '') +
          `</div>`;
      };

      document.getElementById('escStat').innerHTML = `<div class="stat-value" style="color:var(--amber)">${bs.escCount}</div>`;
      document.getElementById('escList').innerHTML = mkSessList(sessions.filter(s => {
          let e = false;
          s.msgs.forEach(m => {
            if (m.spk.toUpperCase() === 'AGENT' && ['請致電', '請聯繫', '請電話', '請撥打', '請洽', 'contact us', 'please call', 'call us', 'お電話', 'お問い合わせ'].some(k => m.cnt.toLowerCase().includes(k))) e = true;
          });
          return e;
      }).map(s => s.id), 12);

      document.getElementById('unresStat').innerHTML = `<div class="stat-value" style="color:var(--red)">${bs.unresCount}</div>`;
      document.getElementById('unresList').innerHTML = mkSessList(sessions.filter(s => {
          let u = false;
          s.msgs.forEach(m => {
            if (m.spk.toUpperCase() === 'AGENT' && ['無法提供', '不支援', '無提供', '目前沒有', '無此服務', '超出範圍', 'cannot', 'not available', '申し訳', '対応できません', 'ご対応'].some(k => m.cnt.toLowerCase().includes(k))) u = true;
          });
          return u;
      }).map(s => s.id), 12);

      const tBody = document.getElementById('returnUserBody');
      if (bs.returnUsers.length === 0) {
        tBody.innerHTML = `<tr><td colspan="4" class="td-cnt">無回訪用戶資料</td></tr>`;
      } else {
        tBody.innerHTML = bs.returnUsers.map(u => `
        <tr>
          <td class="td-sid">${u.spkId}</td>
          <td class="td-cnt">${u.nSess}</td>
          <td class="td-cnt">${u.totalMsgs}</td>
          <td>${mkSessList(u.sessions, 5)}</td>
        </tr>
      `).join('');
      }
    }"""
js = re.sub(r"    function renderBehavior\(\) \{.*?\n    \}(?=\n\n    // ════════════════════════════════════════════\n    //  INIT)", behavior_body, js, flags=re.DOTALL)

# 6. Rewrite generateInsights
insights_body = """    async function generateInsights() {
      const btn = document.getElementById('insightGenBtn');
      if (btn) { btn.disabled = true; btn.textContent = T('reportInsightGenerating'); }

      try {
        let apiKey = localStorage.getItem('claude_api_key');
        if (!apiKey) {
          apiKey = prompt('請輸入您的 Anthropic Claude API Key：\\n(僅存在本地端 localStorage，發送 API 請求使用)');
          if (!apiKey) {
            if (btn) { btn.disabled = false; btn.textContent = T('reportInsightBtn'); }
            return;
          }
          localStorage.setItem('claude_api_key', apiKey);
        }

        const resp = await fetch(`${backendUrl}/api/insights`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            apiKey: apiKey,
            stats: statsData
          })
        });

        if (!resp.ok) {
          if (resp.status === 401) localStorage.removeItem('claude_api_key');
          const errData = await resp.json().catch(() => ({}));
          throw new Error(errData.error || 'API 請求失敗 (' + resp.status + ')');
        }

        const data = await resp.json();
        const text = data.text;
        const result = JSON.parse(text);

        reportInsightText = {
          highlights: result.highlights || '',
          warnings: result.warnings || '',
          suggestions: result.suggestions || ''
        };

        const area = document.getElementById('insightArea');
        if (area) area.style.display = 'block';
        const h = document.getElementById('insightHighlights');
        const w = document.getElementById('insightWarnings');
        const s = document.getElementById('insightSuggestions');
        if (h) h.innerText = reportInsightText.highlights;
        if (w) w.innerText = reportInsightText.warnings;
        if (s) s.innerText = reportInsightText.suggestions;
      } catch (e) {
        alert('生成失敗，請稍後再試：' + e.message);
      }

      if (btn) { btn.disabled = false; btn.textContent = T('reportInsightBtn'); }
    }"""
js = re.sub(r"    async function generateInsights\(\) \{.*?\n    \}(?=\n\n    // ════════════════════════════════════════════\n    //  PAGE ROUTING)", insights_body, js, flags=re.DOTALL)


with open("frontend/script.js", "w", encoding="utf-8") as f:
    f.write(js)
