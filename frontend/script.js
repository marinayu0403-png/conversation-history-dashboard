    // ════════════════════════════════════════════
    //  i18n
    // ════════════════════════════════════════════

    function applyLangToDOM() {
      Object.entries(UI_MAP).forEach(([id, key]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = T(key);
      });
      // Update lang button styles
      ['zh', 'en', 'ja'].forEach(l => {
        const btn = document.getElementById('langBtn-' + l);
        if (!btn) return;
        btn.style.background = l === currentLang ? 'var(--blue)' : 'var(--surface2)';
        btn.style.color = l === currentLang ? '#fff' : 'var(--text2)';
      });
    }

    function renderKeywordChart() {
      if (!aiResults || !aiResults.length) return;
      const kwCount = {};
      aiResults.forEach(r => {
        if (!r.kw) return;
        r.kw.split('、').forEach(k => { k = k.trim(); if (k) kwCount[k] = (kwCount[k] || 0) + 1; });
      });
      const sorted = Object.entries(kwCount).sort((a, b) => b[1] - a[1]).slice(0, 20);
      const el = document.getElementById('keywordChart');
      if (!el) return;
      destroyChart('keywordChart');
      chartInstances['keywordChart'] = new Chart(el, {
        type: 'bar',
        data: {
          labels: sorted.map(e => e[0]),
          datasets: [{ data: sorted.map(e => e[1]), backgroundColor: '#6366f1cc', borderColor: '#6366f1', borderWidth: 1, borderRadius: 4 }]
        },
        options: { ...barOpts(), plugins: { legend: { display: false } }, indexAxis: 'y' }
      });
    }


    function setLang(lang) {
      currentLang = lang;
      applyLangToDOM();
      // Re-render dynamic sections
      if (sessions.length) {
        renderOverview();
        renderLanguage();
        renderSessionsList();
      }
      if (aiResults.length) {
        renderTopicTable();
        setTimeout(renderKeywordChart, 80);
      }
    }


    // ── i18n ──────────────────────────────────────────────
    const LANG = {
      zh: {
        appTitle: '對話分析', noData: '尚未載入資料',
        navOverview: '總覽', navLanguage: '語言分析', navTopics: '主題分析',
        navSessions: '對話資料', navTime: '時間分析', navBehavior: '用戶行為',
        pageOverview: '數據總覽', overviewSub: '請先上傳 CSV 檔案以載入資料',
        pageLang: '語言分析', pageLangSub: '用戶使用語言分布與互動模式',
        pageTopics: '主題分析', pageTopicsSub: '由 AI 分析每個 session 的對話主題與關鍵詞',
        pageSessions: '對話資料', pageSessionsSub: '瀏覽所有 session 的完整對話記錄',
        pageTime: '時間分析', pageTimeSub: '對話時段、時長與 Agent 回覆速度',
        pageBehavior: '用戶行為', pageBehaviorSub: '無互動率、回訪用戶與高意圖用戶分析',
        dropTitle: '拖曳或點擊上傳 CSV', dropSub: '支援 UTF-8、UTF-8 BOM 編碼',
        dropHint: '需包含 session_id、speaker、content 欄位',
        colLen: '訊息字數 (Length)', hintLen: '有此欄位才能做分語言字數分析',
        btnConfirm: '✓ 確認載入', btnStart: '▶ 開始分析', btnStop: '■ 停止',
        btnRestart: '↺ 重新分析', btnContinue: '▶ 繼續分析', btnDownload: '↓ 下載 CSV',
        btnView: '查看對話', btnClear: '✕ 清除篩選', btnUpload: '上傳 CSV',
        statSessions: '總 Sessions', statSessionsSub: '對話紀錄數量',
        statMsgs: '總訊息數', statAvgMsgs: '平均訊息數', statAvgMsgsSub: '每個 session',
        statWithUser: '有用戶互動', statUserMsgs: '用戶訊息',
        statUniqueUsers: '不重複用戶', statUniqueUsersSub: '依 Speaker ID 計算',
        statDateRange: '資料區間',
        statNoInteract: '不互動率', statNoInteractSub: 'AGENT 開場後 USER 無回應',
        statAvgDuration: '對話時長中位數', statAvgDurationSub: '分鐘（已排除異常值）',
        tipNoInteract: 'AGENT 發出開場白後，USER 沒有任何回應的 session。包含系統自動開啟或用戶未輸入即離開的情況，不一定代表真實放棄。',
        tipAvgReply: 'USER 發出訊息後，AGENT 第一則回覆的平均等待時間。',
        tipDuration: '中位數計算，已排除超過 30 分鐘的 session。超過 30 分鐘通常是用戶未關閉視窗所致，非真實對話時長。',
        tipUniqueUsers: '依 CSV 中的 Speaker ID 欄位計算。若該欄位為空，則無法統計不重複用戶數。',
        statAvgReply: '平均回覆速度', statAvgReplySub: '秒（AGENT 回應 USER）',
        msgDistTitle: 'Session 訊息數分布', msgDistSub: '各 session 的對話輪數分布',
        speakerTitle: '說話者佔比', speakerSub: 'AGENT vs USER 訊息數量',
        langMsgTitle: '用戶訊息語言分布', langMsgSub: '所有 USER 訊息的語言比例',
        langSessTitle: 'Session 語言分布', langSessSub: '各 session 的主要使用語言',
        langBarSection: '各語言 Session 詳細',
        langLenSection: '分語言訊息字數分析',
        langLenUserTitle: '各語言平均字數（USER）', langLenUserSub: '不同語言用戶的平均輸入長度（分開統計）',
        langLenAgentTitle: '各語言平均字數（AGENT）', langLenAgentSub: '面對不同語言用戶的 AGENT 回覆長度',
        secHourDist: '各時段對話量', secHourDistSub: 'Session 開始時間（本地時間）',
        secDayDist: '各星期對話量', secDayDistSub: 'Session 開始的星期分布',
        secDurationDist: '對話時長分布', secDurationDistSub: '有互動 session 的對話持續時間',
        secReplySpeed: 'Agent 回覆速度分析', secReplySpeedSub: 'USER 發訊後 AGENT 回覆所需時間分布',
        secReplyByLang: '各語言 Agent 平均回覆速度', secReplyByLangSub: '面對不同語言用戶的平均回覆速度（秒）',
        secNoInteract: '不互動 Session 分析',
        noInteractListEmpty: '無不互動 Session', escUnresNote: '偵測標準：掃描 AGENT 訊息中的特定關鍵字。轉接：請致電、請聯繫、contact us 等；未解決：無法提供、不支援、cannot 等。實際情況可能有誤差，建議人工複核。', btnViewSession: '查看對話', escalatedSessions: '轉接 Sessions', unresolvedSessions: '未解決 Sessions', noInteractHourTitle: '不互動 Session 列表',
        secReturnUser: '回訪用戶', secHighIntent: '高意圖用戶（訊息數 Top 10）',
        secEscalation: '轉接與未解決偵測', escalationChartSub: '偵測到特定關鍵字的 session 數量',
        labelEscalated: '偵測到轉接', labelUnresolved: '偵測到未解決', labelNormal: '一般對話',
        labelReturnSessions: '回訪次數', noInteractNote: '此數據包含用戶未輸入即離開及系統自動開啟的 session',
        kwTitle: '熱門關鍵詞', kwSub: '各關鍵詞出現次數（前 20）',
        searchTopic: '🔍 搜尋主題 / 關鍵詞...', searchSess: '🔍 搜尋 Session ID / 主題...',
        allLangs: '所有語言', allMsgCounts: '所有對話數', langOther: '其他',
        timesUnit: '次',
        btnDownloadCsv: '↓ Session 明細 CSV',
        btnDownloadPdf: '📄 下載 PDF 報告',
        btnGenerate: '產生並下載',
        btnCancel: '取消',
        btnPrint: '🖨 另存為 PDF / 列印',
        btnClose: '✕ 關閉',
        thUserSessions: '對話 Sessions',
        msgAbove: function (n) { return n + ' 則以上'; },
        noUserInteraction: '無用戶互動', ofSessions: '% sessions',
        noSpkIdData: '無足夠 Speaker ID 資料',
        analyzingStatus: '⏳ 本地分析中，請稍候...',
        analysisDone: function (n, w) { return '✅ 已完成分析 ' + n + ' 個 session'; },
        countBadge: function (s, t) { return '共 ' + s + ' / ' + t + ' 筆'; },
        sessBadge: function (s, t) { return '共 ' + s + ' / ' + t + ' 個 session'; },
        downloadLabel: function (n) { return '↓ 下載 CSV（' + n + ' 筆）'; },
        avgChar: '平均',
        aiBannerTitle: 'Claude AI 主題分析', aiBannerSub: '逐一分析每個 session 的核心主題與關鍵詞',
        topicTableLabel: '各 Session 分析結果',
        thTopic: '主題', thMsgCount: '訊息數', thTime: '時間', thKeywords: '關鍵詞',
        thLang: '語言', thUserMsg: '用戶訊息', thAction: '操作', thSpkId: '用戶 ID',
        thReturnCount: '回訪次數', thMsgTotal: '總訊息',
        minuteUnit: '分鐘', secondUnit: '秒',
        durationBins: ['<1分', '1-3分', '3-5分', '5-10分', '10-20分', '>20分'],
        replyBins: ['<5秒', '5-15秒', '15-30秒', '30-60秒', '1-3分', '>3分'],
        weekdays: ['日', '一', '二', '三', '四', '五', '六'],
        hourLabel: function (h) { return h + ':00'; },
        escalationKeywords: ['請致電', '請聯繫', '請電話', '請撥打', '請洽', 'contact us', 'please call', 'call us', 'お電話', 'お問い合わせ'],
        unresolvedKeywords: ['無法提供', '不支援', '無提供', '目前沒有', '無此服務', '超出範圍', 'cannot', 'not available', '申し訳', '対応できません', 'ご対応'],
        pdfTitle: '對話分析報告',
        navReport: '報告',
        loading: '載入中...',
        noDataLoaded: '請先載入資料',
        filterTitle: '排除測試 Session', filterHint: 'USER 訊息包含以下關鍵字的 session 將被整個排除（不分大小寫）', filterPlaceholder: '輸入關鍵字後按 Enter', filterPreview: function (ex, keep) { return '預覽：將排除 ' + ex + ' 個，保留 ' + keep + ' 個 session'; }, filterDefault: 'Athena', filterLabel: '排除關鍵字',
        analyzing: '分析中，請稍候...', pageReport: '報告輸出', pageReportSub: 'AI 洞察、編輯與下載', reportInsightTitle: 'AI 洞察草稿', reportInsightSub: '根據數據自動生成，可直接在下方編輯後納入報告', reportInsightBtn: '✨ 生成 AI 洞察', reportInsightGenerating: '⏳ 生成中...', reportLangTitle: '報告語言', reportDownloadBtn: '⬇ 下載 PDF 報告', reportIncludeInsight: '將洞察納入報告', reportEditHint: '點擊文字即可編輯', reportHighlights: '亮點', reportWarnings: '需注意', reportSuggestions: '建議', noDataReport: '請先上傳 CSV 並完成分析',
      },
      en: {
        appTitle: 'Chat Analytics', noData: 'No data loaded',
        navOverview: 'Overview', navLanguage: 'Language', navTopics: 'Topics',
        navSessions: 'Sessions', navTime: 'Time Analysis', navBehavior: 'User Behavior',
        pageOverview: 'Overview', overviewSub: 'Upload a CSV file to get started',
        pageLang: 'Language Analysis', pageLangSub: 'Language distribution and interaction patterns',
        pageTopics: 'Topic Analysis', pageTopicsSub: 'AI-powered topic and keyword analysis per session',
        pageSessions: 'Session Data', pageSessionsSub: 'Browse all session conversation records',
        pageTime: 'Time Analysis', pageTimeSub: 'Session timing, duration, and Agent reply speed',
        pageBehavior: 'User Behavior', pageBehaviorSub: 'No-interaction rate, returning users, and high-intent users',
        dropTitle: 'Drag & drop or click to upload CSV', dropSub: 'Supports UTF-8 and UTF-8 BOM encoding',
        dropHint: 'Needs session_id, speaker, and content columns',
        colLen: 'Message length (optional)', hintLen: 'Required for per-language length analysis',
        btnConfirm: '✓ Confirm', btnStart: '▶ Start Analysis', btnStop: '■ Stop',
        btnRestart: '↺ Re-analyze', btnContinue: '▶ Continue', btnDownload: '↓ Download CSV',
        btnView: 'View', btnClear: '✕ Clear', btnUpload: 'Upload CSV',
        statSessions: 'Total Sessions', statSessionsSub: 'Conversation records',
        statMsgs: 'Total Messages', statAvgMsgs: 'Avg Messages', statAvgMsgsSub: 'per session',
        statWithUser: 'With User Interaction', statUserMsgs: 'User Messages',
        statUniqueUsers: 'Unique Users', statUniqueUsersSub: 'by Speaker ID',
        statDateRange: 'Date Range',
        statNoInteract: 'No-Interaction Rate', statNoInteractSub: 'Sessions where USER never replied',
        statAvgDuration: 'Median Session Duration', statAvgDurationSub: 'minutes (outliers excluded)',
        tipNoInteract: 'Sessions where USER never replied after the AGENT opening. Includes system-initiated sessions and users who left without typing — may not indicate true abandonment.',
        tipAvgReply: 'Average time for AGENT to send first reply after USER message.',
        tipDuration: 'Median value. Sessions over 30 minutes are excluded as they likely represent users leaving the window open rather than active conversations.',
        tipUniqueUsers: 'Calculated using the Speaker ID column in the CSV. If this column is empty, unique users cannot be counted.',
        statAvgReply: 'Avg Reply Speed', statAvgReplySub: 'seconds (Agent responding to User)',
        msgDistTitle: 'Message Count Distribution', msgDistSub: 'Number of turns per session',
        speakerTitle: 'Speaker Breakdown', speakerSub: 'AGENT vs USER message counts',
        langMsgTitle: 'User Message Language', langMsgSub: 'Language of all USER messages',
        langSessTitle: 'Session Language', langSessSub: 'Dominant language per session',
        langBarSection: 'Sessions by Language',
        langLenSection: 'Message Length by Language',
        langLenUserTitle: 'Avg USER Length by Language', langLenUserSub: 'Average input length per language (counted separately)',
        langLenAgentTitle: 'Avg AGENT Length by Language', langLenAgentSub: 'Average reply length per user language',
        secHourDist: 'Sessions by Hour', secHourDistSub: 'Session start time (local)',
        secDayDist: 'Sessions by Day of Week', secDayDistSub: 'Session start day of week',
        secDurationDist: 'Session Duration Distribution', secDurationDistSub: 'Duration of sessions with user interaction',
        secReplySpeed: 'Agent Reply Speed Analysis', secReplySpeedSub: 'Time for AGENT to reply after USER message',
        secReplyByLang: 'Avg Agent Reply Speed by Language', secReplyByLangSub: 'Average Agent reply speed per user language (seconds)',
        secNoInteract: 'No-Interaction Sessions',
        noInteractListEmpty: 'No no-interaction sessions', escUnresNote: 'Detection method: keyword scanning in AGENT messages. Escalation: please call, contact us, etc.; Unresolved: cannot, not available, etc. Results may have false positives — manual review recommended.', btnViewSession: 'View', escalatedSessions: 'Escalated Sessions', unresolvedSessions: 'Unresolved Sessions', noInteractHourTitle: 'No-Interaction Sessions',
        secReturnUser: 'Returning Users', secHighIntent: 'High-Intent Users (Top 10 by message count)',
        secEscalation: 'Escalation & Unresolved Detection', escalationChartSub: 'Sessions where specific keywords were detected',
        labelEscalated: 'Escalation detected', labelUnresolved: 'Unresolved detected', labelNormal: 'Normal conversations',
        labelReturnSessions: 'Return sessions', noInteractNote: 'Includes sessions where users left without typing and system-initiated sessions',
        kwTitle: 'Top Keywords', kwSub: 'Keyword frequency (top 20)',
        searchTopic: '🔍 Search topic / keywords...', searchSess: '🔍 Search session ID / topic...',
        allLangs: 'All languages', allMsgCounts: 'All message counts', langOther: 'Other',
        timesUnit: 'times',
        btnDownloadCsv: '↓ Download CSV',
        btnDownloadPdf: '📄 Download PDF Report',
        btnGenerate: 'Generate & Download',
        btnCancel: 'Cancel',
        btnPrint: '🖨 Save as PDF / Print',
        btnClose: '✕ Close',
        thUserSessions: 'Sessions',
        msgAbove: function (n) { return n + '+ messages'; },
        noUserInteraction: 'No user interaction', ofSessions: '% of sessions',
        noSpkIdData: 'Insufficient Speaker ID data',
        analyzingStatus: '⏳ Analyzing, please wait...',
        analysisDone: function (n, w) { return '✅ Analyzed ' + n + ' sessions'; },
        countBadge: function (s, t) { return s + ' / ' + t + ' results'; },
        sessBadge: function (s, t) { return s + ' / ' + t + ' sessions'; },
        downloadLabel: function (n) { return '↓ Download CSV (' + n + ' rows)'; },
        avgChar: 'avg',
        aiBannerTitle: 'Claude AI Topic Analysis', aiBannerSub: 'Analyzes each session for topics and keywords',
        topicTableLabel: 'Session Analysis Results',
        thTopic: 'Topic', thMsgCount: 'Messages', thTime: 'Time', thKeywords: 'Keywords',
        thLang: 'Language', thUserMsg: 'User msgs', thAction: 'Action', thSpkId: 'User ID',
        thReturnCount: 'Return count', thMsgTotal: 'Total msgs',
        minuteUnit: 'min', secondUnit: 'sec',
        durationBins: ['<1min', '1-3min', '3-5min', '5-10min', '10-20min', '>20min'],
        replyBins: ['<5s', '5-15s', '15-30s', '30-60s', '1-3min', '>3min'],
        weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        hourLabel: function (h) { return h + ':00'; },
        escalationKeywords: ['請致電', '請聯繫', '請電話', '請撥打', '請洽', 'contact us', 'please call', 'call us', 'お電話', 'お問い合わせ'],
        unresolvedKeywords: ['無法提供', '不支援', '無提供', '目前沒有', '無此服務', '超出範圍', 'cannot', 'not available', '申し訳', '対応できません', 'ご対応'],
        pdfTitle: 'Conversation Analysis Report',
        navReport: 'Report',
        loading: 'Loading...',
        noDataLoaded: 'Please load data first',
        filterTitle: 'Exclude Test Sessions', filterHint: 'Sessions where any USER message contains these keywords will be excluded (case-insensitive)', filterPlaceholder: 'Type a keyword and press Enter', filterPreview: function (ex, keep) { return 'Preview: ' + ex + ' excluded, ' + keep + ' kept'; }, filterDefault: 'Athena', filterLabel: 'Exclude keywords',
        analyzing: 'Analyzing, please wait...', pageReport: 'Report', pageReportSub: 'AI insights, edit & download', reportInsightTitle: 'AI Insight Draft', reportInsightSub: 'Auto-generated from your data — edit below before including in report', reportInsightBtn: '✨ Generate AI Insights', reportInsightGenerating: '⏳ Generating...', reportLangTitle: 'Report Language', reportDownloadBtn: '⬇ Download PDF Report', reportIncludeInsight: 'Include insights in report', reportEditHint: 'Click to edit', reportHighlights: 'Highlights', reportWarnings: 'Watch out', reportSuggestions: 'Suggestions', noDataReport: 'Please upload a CSV and complete analysis first',
      },
      ja: {
        appTitle: '会話分析', noData: 'データ未読込',
        navOverview: '概要', navLanguage: '言語分析', navTopics: 'トピック分析',
        navSessions: '会話データ', navTime: '時間分析', navBehavior: 'ユーザー行動',
        pageOverview: 'データ概要', overviewSub: 'CSVファイルをアップロードしてください',
        pageLang: '言語分析', pageLangSub: 'ユーザーの使用言語分布とインタラクションパターン',
        pageTopics: 'トピック分析', pageTopicsSub: 'AIによる各セッションのトピックとキーワード分析',
        pageSessions: '会話データ', pageSessionsSub: '全セッションの会話記録を閲覧',
        pageTime: '時間分析', pageTimeSub: 'セッションの時間帯・時間・返答速度',
        pageBehavior: 'ユーザー行動', pageBehaviorSub: '未返信率・リピートユーザー・高意図ユーザー分析',
        dropTitle: 'CSVをドラッグ＆ドロップまたはクリック', dropSub: 'UTF-8・UTF-8 BOMに対応',
        dropHint: 'session_id、speaker、contentカラムが必要です',
        colLen: 'メッセージ文字数（選択可）', hintLen: '言語別の文字数分析に必要',
        btnConfirm: '✓ 確認して読込', btnStart: '▶ 分析開始', btnStop: '■ 停止',
        btnRestart: '↺ 再分析', btnContinue: '▶ 続きから再開', btnDownload: '↓ CSVダウンロード',
        btnView: '会話を見る', btnClear: '✕ クリア', btnUpload: 'CSVをアップロード',
        statSessions: '総セッション数', statSessionsSub: '会話レコード数',
        statMsgs: '総メッセージ数', statAvgMsgs: '平均メッセージ数', statAvgMsgsSub: 'セッションあたり',
        statWithUser: 'ユーザー返信あり', statUserMsgs: 'ユーザーメッセージ',
        statUniqueUsers: 'ユニークユーザー', statUniqueUsersSub: 'Speaker IDで集計',
        statDateRange: 'データ期間',
        statNoInteract: '未返信率', statNoInteractSub: 'AGENTの挨拶後にUSERが未返信',
        statAvgDuration: '会話時間の中央値', statAvgDurationSub: '分（外れ値を除外）',
        tipNoInteract: 'AGENTの挨拶後にUSERが返信しなかったセッション。システム自動開始や入力なし離脱も含むため、必ずしも真の放棄を意味しません。',
        tipAvgReply: 'USERのメッセージ後、AGENTが最初に返信するまでの平均時間。',
        tipDuration: '中央値で計算。30分超のセッションは除外（ウィンドウを開いたままの可能性が高いため）。',
        tipUniqueUsers: 'CSV内のSpeaker IDカラムで集計。このカラムが空の場合、ユニークユーザー数は集計できません。',
        statAvgReply: '平均返答速度', statAvgReplySub: '秒（AGENTのUSERへの返答）',
        msgDistTitle: 'メッセージ数の分布', msgDistSub: 'セッションあたりのターン数',
        speakerTitle: '発話者の内訳', speakerSub: 'AGENT vs USERのメッセージ数',
        langMsgTitle: 'ユーザーメッセージの言語分布', langMsgSub: '全USERメッセージの言語割合',
        langSessTitle: 'セッションの言語分布', langSessSub: 'セッションごとの主要言語',
        langBarSection: '言語別セッション数',
        langLenSection: '言語別メッセージ文字数',
        langLenUserTitle: '言語別USER平均文字数', langLenUserSub: 'ユーザー言語ごとの平均入力文字数（個別集計）',
        langLenAgentTitle: '言語別AGENT平均文字数', langLenAgentSub: '各言語ユーザーへの返答の平均文字数',
        secHourDist: '時間帯別セッション数', secHourDistSub: 'セッション開始時間（現地時間）',
        secDayDist: '曜日別セッション数', secDayDistSub: 'セッション開始の曜日分布',
        secDurationDist: '会話時間の分布', secDurationDistSub: 'インタラクションありのセッション時間',
        secReplySpeed: 'AGENT返答速度分析', secReplySpeedSub: 'USERメッセージ後のAGENT返答時間',
        secReplyByLang: '言語別AGENT平均返答速度', secReplyByLangSub: 'ユーザー言語別AGENT平均返答速度（秒）',
        secNoInteract: '未返信セッション',
        noInteractListEmpty: '未返信セッションなし', escUnresNote: '検出方法：AGENTメッセージの特定キーワードをスキャン。エスカレーション：お電話、お問い合わせ等；未解決：申し訳、対応できません等。誤検出の可能性があるため、人による確認を推奨します。', btnViewSession: '会話を見る', escalatedSessions: 'エスカレーションセッション', unresolvedSessions: '未解決セッション', noInteractHourTitle: '未返信セッション一覧',
        secReturnUser: 'リピートユーザー', secHighIntent: '高意図ユーザー（メッセージ数Top10）',
        secEscalation: 'エスカレーション・未解決の検出', escalationChartSub: '特定キーワードが検出されたセッション数',
        labelEscalated: 'エスカレーション検出', labelUnresolved: '未解決検出', labelNormal: '通常の会話',
        labelReturnSessions: 'リピート回数', noInteractNote: '入力なしで離脱したユーザーおよびシステム自動開始のセッションを含みます',
        kwTitle: '頻出キーワード', kwSub: 'キーワード出現頻度（上位20件）',
        searchTopic: '🔍 トピック / キーワードを検索...', searchSess: '🔍 Session ID / トピックを検索...',
        allLangs: 'すべての言語', allMsgCounts: 'すべての件数', langOther: 'その他',
        timesUnit: '回',
        btnDownloadCsv: '↓ CSV ダウンロード',
        btnDownloadPdf: '📄 PDFレポートを出力',
        btnGenerate: '生成してダウンロード',
        btnCancel: 'キャンセル',
        btnPrint: '🖨 PDFとして保存 / 印刷',
        btnClose: '✕ 閉じる',
        thUserSessions: 'セッション',
        msgAbove: function (n) { return n + '件以上'; },
        noUserInteraction: 'ユーザー返信なし', ofSessions: '% of sessions',
        noSpkIdData: 'Speaker IDデータが不足しています',
        analyzingStatus: '⏳ 分析中、しばらくお待ちください...',
        analysisDone: function (n, w) { return '✅ ' + n + '件のセッションを分析完了'; },
        countBadge: function (s, t) { return s + ' / ' + t + ' 件'; },
        sessBadge: function (s, t) { return s + ' / ' + t + ' セッション'; },
        downloadLabel: function (n) { return '↓ CSVダウンロード（' + n + '件）'; },
        avgChar: '平均',
        aiBannerTitle: 'Claude AI トピック分析', aiBannerSub: '各セッションのトピックとキーワードを順次分析',
        topicTableLabel: 'セッション別分析結果',
        thTopic: 'トピック', thMsgCount: 'メッセージ数', thTime: '時刻', thKeywords: 'キーワード',
        thLang: '言語', thUserMsg: 'ユーザー発話', thAction: '操作', thSpkId: 'ユーザーID',
        thReturnCount: 'リピート回数', thMsgTotal: '総メッセージ',
        minuteUnit: '分', secondUnit: '秒',
        durationBins: ['1分未満', '1-3分', '3-5分', '5-10分', '10-20分', '20分超'],
        replyBins: ['5秒未満', '5-15秒', '15-30秒', '30-60秒', '1-3分', '3分超'],
        weekdays: ['日', '月', '火', '水', '木', '金', '土'],
        hourLabel: function (h) { return h + '時'; },
        escalationKeywords: ['請致電', '請聯繫', '請電話', '請撥打', '請洽', 'contact us', 'please call', 'call us', 'お電話', 'お問い合わせ'],
        unresolvedKeywords: ['無法提供', '不支援', '無提供', '目前沒有', '無此服務', '超出範圍', 'cannot', 'not available', '申し訳', '対応できません', 'ご対応'],
        pdfTitle: '会話分析レポート',
        navReport: 'レポート',
        loading: '読み込み中...',
        noDataLoaded: 'データを読み込んでください',
        filterTitle: 'テストセッションを除外', filterHint: 'USERメッセージに以下のキーワードが含まれるセッションを除外します（大文字小文字区別なし）', filterPlaceholder: 'キーワードを入力してEnterを押す', filterPreview: function (ex, keep) { return ex + '件を除外、' + keep + '件を保持'; }, filterDefault: 'Athena', filterLabel: '除外キーワード',
        analyzing: '分析中、しばらくお待ちください...', pageReport: 'レポート出力', pageReportSub: 'AIインサイト・編集・ダウンロード', reportInsightTitle: 'AIインサイト草稿', reportInsightSub: 'データから自動生成。下記で編集後にレポートへ反映できます', reportInsightBtn: '✨ AIインサイトを生成', reportInsightGenerating: '⏳ 生成中...', reportLangTitle: 'レポート言語', reportDownloadBtn: '⬇ PDFレポートをダウンロード', reportIncludeInsight: 'インサイトをレポートに含める', reportEditHint: 'クリックして編集', reportHighlights: 'ハイライト', reportWarnings: '注意事項', reportSuggestions: '提案', noDataReport: 'CSVをアップロードして分析を完了してください',
      }
      ,
      escTypeEscalated: '轉接真人',
      escTypeUnresolved: '未解決',
      thEscType: '類型',
      escTypeEscalated: 'Escalated',
      escTypeUnresolved: 'Unresolved',
      thEscType: 'Type',
      escTypeEscalated: 'エスカレーション',
      escTypeUnresolved: '未解決',
      thEscType: 'タイプ'
    }
    let currentLang = 'zh';
    function T(key) {
      var args = Array.prototype.slice.call(arguments, 1);
      var d = LANG[currentLang] || LANG.zh;
      var val = (key in d) ? d[key] : ((key in LANG.zh) ? LANG.zh[key] : key);
      return typeof val === 'function' ? val.apply(null, args) : val;
    }
    var UI_IDS = {
      'ui-appTitle': 'appTitle', 'ui-noData': 'noData',
      'nav-overview-label': 'navOverview', 'nav-language-label': 'navLanguage',
      'nav-topics-label': 'navTopics', 'nav-sessions-label': 'navSessions',
      'nav-time-label': 'navTime', 'nav-behavior-label': 'navBehavior',
      'page-overview-h1': 'pageOverview',
      'page-lang-h1': 'pageLang', 'page-lang-p': 'pageLangSub',
      'page-topics-h1': 'pageTopics', 'page-topics-p': 'pageTopicsSub',
      'page-sessions-h1': 'pageSessions', 'page-sessions-p': 'pageSessionsSub',
      'page-time-h1': 'pageTime', 'page-time-p': 'pageTimeSub',
      'page-behavior-h1': 'pageBehavior', 'page-behavior-p': 'pageBehaviorSub',
      'dropTitle': 'dropTitle', 'dropSub': 'dropSub', 'dropHint': 'dropHint',
      'ui-colLen': 'colLen', 'ui-hintLen': 'hintLen',
      'ui-msgDistTitle': 'msgDistTitle', 'ui-msgDistSub': 'msgDistSub',
      'ui-speakerTitle': 'speakerTitle', 'ui-speakerSub': 'speakerSub',
      'ai-banner-title': 'aiBannerTitle', 'ai-banner-sub': 'aiBannerSub',
      'sessionTableLabel': 'topicTableLabel',
      'ui-kwTitle': 'kwTitle', 'ui-kwSub': 'kwSub',
      'upload-btn-label': 'btnUpload',
      'ui-filterTitle': 'filterTitle', 'ui-filterHint': 'filterHint',
      'ui-dlBtn': 'btnDownloadCsv',
      'ui-dlPdfBtn': 'btnDownloadPdf',
      'ui-btnCancel': 'btnCancel',
      'ui-btnGenerate': 'btnGenerate',
      'ui-btnClear2': 'btnClear',
      'nav-time-label': 'navTime', 'nav-behavior-label': 'navBehavior',
      'page-time-h1': 'pageTime', 'page-time-p': 'pageTimeSub',
      'page-behavior-h1': 'pageBehavior', 'page-behavior-p': 'pageBehaviorSub'
    };
    function applyLangToDOM() {
      Object.keys(UI_IDS).forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.textContent = T(UI_IDS[id]);
      });
      const fi = document.getElementById('filterInput');
      if (fi) fi.placeholder = T('filterPlaceholder');
      ['zh', 'en', 'ja'].forEach(function (l) {
        var btn = document.getElementById('langBtn-' + l);
        if (!btn) return;
        btn.style.background = (l === currentLang) ? 'var(--blue)' : 'var(--surface2)';
        btn.style.color = (l === currentLang) ? '#fff' : 'var(--text2)';
      });
    }
    function setLang(lang) {
      currentLang = lang;
      applyLangToDOM();
      if (sessions.length) { renderOverview(); renderLanguage(); renderSessionsList(); renderTime(); renderBehavior(); renderReport(); }
      if (aiResults.length) { renderTopicTable(); renderKeywordChart(); }
    }
    // ── end i18n ──────────────────────────────────────────
    // ════════════════════════════════════════════
    //  STATE
    // ════════════════════════════════════════════
    let sessions = [];       // [{id, n, msgs:[{spk,spkId,cnt,lang}], full_convo, convo_preview}]
    let aiResults = [];
    let statsData = null;      // [{id, n, topic, kw, full_convo}]
    let rawRows = [], csvHeaders = [];
    let chartInstances = {};
    let aborted = false;
    let reportInsightText = { highlights: '', warnings: '', suggestions: '' };
    let includeInsight = true;

    // ════════════════════════════════════════════
    //  NAV / PAGE
    // ════════════════════════════════════════════
    function switchPage(name) {
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      document.getElementById('page-' + name).classList.add('active');
      document.getElementById('nav-' + name).classList.add('active');
      // Re-render pages that need chart reflow when becoming visible
      if (sessions && sessions.length) {
        if (name === 'time') { setTimeout(renderTime, 50); }
        if (name === 'behavior') { setTimeout(renderBehavior, 50); }
        if (name === 'report') { setTimeout(renderReport, 50); }
        if (name === 'language') { setTimeout(renderLanguage, 50); }
      }
    }

    // ════════════════════════════════════════════
    //  CSV PARSING
    // ════════════════════════════════════════════
    function parseCSV(text) {
      if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
      const lines = [];
      let cur = '', inQ = false;
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === '"') {
          if (inQ && text[i + 1] === '"') { cur += '"'; i++; }
          else inQ = !inQ;
        } else if ((ch === '\n' || ch === '\r') && !inQ) {
          if (ch === '\r' && text[i + 1] === '\n') i++;
          lines.push(cur); cur = '';
        } else cur += ch;
      }
      if (cur) lines.push(cur);

      const parseLine = line => {
        const cells = []; let c = '', q = false;
        for (let i = 0; i < line.length; i++) {
          const ch = line[i];
          if (ch === '"') {
            if (q && line[i + 1] === '"') { c += '"'; i++; }
            else q = !q;
          } else if (ch === ',' && !q) { cells.push(c); c = ''; }
          else c += ch;
        }
        cells.push(c);
        return cells;
      };
      return lines.filter(l => l.trim()).map(parseLine);
    }

    let currentCsvFile = null;
    let backendUrl = '';

    async function handleFileSelect(e) {
      const file = e.target.files[0];
      if (file) {
        currentCsvFile = file;
        await processFile(file);
      }
      e.target.value = '';
    }
    function handleDragOver(e) { e.preventDefault(); document.getElementById('dropZone').classList.add('dragover'); }
    function handleDragLeave() { document.getElementById('dropZone').classList.remove('dragover'); }
    function handleDrop(e) {
      e.preventDefault();
      document.getElementById('dropZone').classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file) {
        currentCsvFile = file;
        processFile(file);
      }
    }

    async function processFile(file) {
      const text = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = e => res(e.target.result);
        r.onerror = rej;
        r.readAsText(file, 'UTF-8');
      });
      const rows = parseCSV(text);
      if (rows.length < 2) { alert('CSV 格式錯誤或檔案為空'); return; }
      csvHeaders = rows[0];
      rawRows = rows.slice(1);

      // Populate selectors
      const makeOpts = (sel, addNone) => {
        sel.innerHTML = (addNone ? '<option value="-1">— 不使用 —</option>' : '') +
          csvHeaders.map((h, i) => `<option value="${i}">[${i}] ${h}</option>`).join('');
      };
      makeOpts(document.getElementById('colSessionId'), false);
      makeOpts(document.getElementById('colLength'), true);
      makeOpts(document.getElementById('colSpeaker'), false);
      makeOpts(document.getElementById('colContent'), false);
      makeOpts(document.getElementById('colSpeakerId'), true);

      // Auto-detect columns (exclude date/time/lang columns from mis-detection)
      const detect = (kws, exclude = []) => {
        const i = csvHeaders.findIndex(h => {
          const hn = h.toLowerCase().replace(/[_\s\.]/g, '');
          if (exclude.some(ex => hn.includes(ex))) return false;
          return kws.some(k => hn === k || hn.includes(k));
        });
        return i >= 0 ? i : 0;
      };
      document.getElementById('colSessionId').value = detect(['sessionid', 'session_id', 'session']);
      document.getElementById('colSpeaker').value = detect(['speaker', 'role', 'sender'], ['speakerid', 'speaker_id', 'userid', 'user_id', 'lang', 'language', 'date', 'time', 'created', 'at']);
      document.getElementById('colContent').value = detect(['content', 'message', 'msg', 'text', 'body'], ['lang', 'language', 'date', 'time', 'created', 'at', 'id']);
      // speaker_id: must be exact or contain speakerid/speaker_id but NOT just 'speaker'
      const spkIdIdx = csvHeaders.findIndex(h => {
        const hn = h.toLowerCase().replace(/[_\s\.]/g, '');
        return hn === 'speakerid' || hn === 'userid' || hn === 'user_id' || hn === 'speaker_id';
      });
      document.getElementById('colSpeakerId').value = spkIdIdx >= 0 ? spkIdIdx : -1;
      const lenIdx = csvHeaders.findIndex(h => {
        const hn = h.toLowerCase().replace(/[_\s\.]/g, '');
        return hn === 'length' || hn === 'len' || hn === 'msglength';
      });
      document.getElementById('colLength').value = lenIdx >= 0 ? lenIdx : -1;

      // Update UI
      document.getElementById('dropZone').className = 'drop-zone loaded';
      document.getElementById('dropIcon').textContent = '✅';
      document.getElementById('dropTitle').innerHTML = `<strong>${file.name}</strong>`;
      document.getElementById('dropSub').textContent = `${rawRows.length} 筆資料 · ${csvHeaders.length} 個欄位`;
      document.getElementById('dropFileInfo').style.display = 'none';
      document.getElementById('colConfig').style.display = 'block';
      renderFilterTags();
    }

    // ── Exclude keywords filter ──
    let excludeKeywords = ['Athena'];

    function renderFilterTags() {
      const container = document.getElementById('filterTags');
      if (!container) return;
      container.innerHTML = excludeKeywords.map((kw, i) => `<span style="display:inline-flex;align-items:center;gap:4px;background:var(--surface2);border:1px solid var(--border2);border-radius:5px;padding:3px 8px;font-size:11px;color:var(--text);">${esc(kw)}<button onclick="removeFilterKw(${i})" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:12px;padding:0;line-height:1;">✕</button></span>`).join('');
      updateFilterPreview();
    }

    function removeFilterKw(i) {
      excludeKeywords.splice(i, 1);
      renderFilterTags();
    }

    function handleFilterKey(e) {
      if (e.key !== 'Enter') return;
      const val = e.target.value.trim();
      if (val && !excludeKeywords.some(k => k.toLowerCase() === val.toLowerCase())) {
        excludeKeywords.push(val);
        renderFilterTags();
      }
      e.target.value = '';
      e.preventDefault();
    }

    function updateFilterPreview() {
      const el = document.getElementById('filterPreview');
      if (!el || !rawRows.length || !excludeKeywords.length) {
        if (el) el.textContent = '';
        return;
      }
      const s = parseInt(document.getElementById('colSessionId')?.value || '0');
      const sp = parseInt(document.getElementById('colSpeaker')?.value || '2');
      const c = parseInt(document.getElementById('colContent')?.value || '3');
      const sessIds = new Set();
      const excludeIds = new Set();
      rawRows.forEach(row => {
        const id = (row[s] || '').trim();
        const spk = (row[sp] || '').trim();
        const cnt = (row[c] || '').trim();
        if (!id || !spk) return;
        sessIds.add(id);
        if (spk.toUpperCase() === 'USER') {
          const cntLower = cnt.toLowerCase();
          if (excludeKeywords.some(kw => cntLower.includes(kw.toLowerCase()))) excludeIds.add(id);
        }
      });
      el.textContent = T('filterPreview', excludeIds.size, sessIds.size - excludeIds.size);
    }

    function sessionPassesFilter(msgs) {
      if (!excludeKeywords.length) return true;
      return !msgs.some(m => {
        if ((m.spk || '').toUpperCase() !== 'USER') return false;
        const lower = (m.cnt || '').toLowerCase();
        return excludeKeywords.some(kw => lower.includes(kw.toLowerCase()));
      });
    }

    async function confirmLoad() {
      try {
        const s = parseInt(document.getElementById('colSessionId').value);
        const sp = parseInt(document.getElementById('colSpeaker').value);
        const c = parseInt(document.getElementById('colContent').value);
        const sid = parseInt(document.getElementById('colSpeakerId').value);
        const len = parseInt(document.getElementById('colLength').value);

        let tsCol = csvHeaders.findIndex(h => {
          const hn = h.toLowerCase().replace(/[_\s]/g, '');
          return hn === 'createdat' || hn === 'timestamp' || hn === 'createtime' || hn === 'time';
        });

        // Hide col config, show loading area
        document.getElementById('colConfig').style.display = 'none';
        document.getElementById('uploadArea').style.display = 'none';

        const _banner2 = document.getElementById('autoBanner');
        const _bannerMsg2 = document.getElementById('bannerStatus');
        const _bannerIcon2 = document.querySelector('#autoBanner .spinner');
        if (_banner2) _banner2.style.display = 'flex';
        if (_bannerMsg2) _bannerMsg2.textContent = T('analyzingStatus');

        const formData = new FormData();
        formData.append('file', currentCsvFile);
        formData.append('colSessionId', s);
        formData.append('colSpeaker', sp);
        formData.append('colContent', c);
        formData.append('colSpeakerId', sid);
        formData.append('colLength', len);
        formData.append('colTimestamp', tsCol >= 0 ? tsCol : -1);
        formData.append('excludeKeywords', JSON.stringify(excludeKeywords));

        const res = await fetch(`${backendUrl}/api/analyze`, {
          method: 'POST',
          body: formData
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Server error');
        }

        const data = await res.json();
        sessions = data.sessions;
        aiResults = data.aiResults;
        statsData = data.stats;

        const withUser = aiResults.filter(r => r.kw).length;
        const doneMsg = T('analysisDone', aiResults.length);

        // Update top-level status variables
        document.getElementById('statsArea').style.display = 'block';
        document.getElementById('dataStatus').textContent = `${sessions.length} 個 session`;
        document.getElementById('overviewSub').textContent = `共 ${sessions.length} 個 session`;

        if (_banner2) { _banner2.style.borderColor = 'var(--green)'; }
        if (_bannerIcon2) _bannerIcon2.outerHTML = '<span style="font-size: 18px;">✅</span>';
        if (_bannerMsg2) _bannerMsg2.textContent = doneMsg;

        // Update DOM sections
        if (sessions.length) { renderOverview(); renderLanguage(); renderSessionsList(); renderTime(); renderBehavior(); renderReport(); }

        document.getElementById('aiStatus').textContent = `✓ 已載入 ${aiResults.length} 個 session（${withUser} 個有用戶互動）`;
        document.getElementById('topicTableWrap').style.display = 'block';
        document.getElementById('sessionTableLabel').style.display = 'block';
        document.getElementById('topicSummary').style.display = 'block';
        document.getElementById('topicEmpty').style.display = 'none';
        const tbody = document.getElementById('topicTbody');
        if (tbody) tbody.innerHTML = '';
        renderTopicTable();
        setTimeout(renderKeywordChart, 80);

      } catch (e) {
        console.error('confirmLoad error:', e);
        alert('載入失敗：' + e.message);
      }
    }



    // ════════════════════════════════════════
    function isUser(spk) { return spk && spk.toUpperCase() === 'USER'; }
    function isAgent(spk) { return spk && spk.toUpperCase() === 'AGENT'; }

    // ── Resolve __NO_USER__ marker per language ──
    const NO_USER_LABELS = {
      zh: '僅有客服開場白',
      en: 'Agent opening only',
      ja: 'Agentのみ（ユーザー返信なし）'
    };
    function resolveNoUser(topic, lang) {
      if (topic === '__NO_USER__') return NO_USER_LABELS[lang] || NO_USER_LABELS.zh;
      return topic;
    }



    function renderReport() {
      const el = document.getElementById('reportContent');
      if (!el) return;
      if (!sessions.length) {
        el.innerHTML = `<div class="empty-state"><div class="eicon">📋</div><p>${T('noDataReport')}</p></div>`;
        return;
      }

      el.innerHTML = `
    <!-- AI Insight section -->
    <div class="chart-card" style="margin-bottom:20px;">
      <div class="chart-title" style="margin-bottom:4px;">${T('reportInsightTitle')}</div>
      <div class="chart-sub" style="margin-bottom:16px;">${T('reportInsightSub')}</div>
      <button id="insightGenBtn" onclick="generateInsights()"
        class="btn btn-blue" style="margin-bottom:16px;" >${T('reportInsightBtn')}</button>
      <div id="insightArea" style="display:none;">
        <!-- Highlights -->
        <div style="margin-bottom:12px;">
          <div style="font-size:11px;font-weight:700;color:var(--green);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;">✅ ${T('reportHighlights')}</div>
          <div id="insightHighlights" contenteditable="true"
            style="background:var(--surface2);border:1px solid var(--border2);border-radius:8px;padding:12px;font-size:13px;color:var(--text);line-height:1.7;min-height:60px;outline:none;"
            oninput="saveInsightText()"></div>
        </div>
        <!-- Warnings -->
        <div style="margin-bottom:12px;">
          <div style="font-size:11px;font-weight:700;color:var(--amber);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;">⚠️ ${T('reportWarnings')}</div>
          <div id="insightWarnings" contenteditable="true"
            style="background:var(--surface2);border:1px solid var(--border2);border-radius:8px;padding:12px;font-size:13px;color:var(--text);line-height:1.7;min-height:60px;outline:none;"
            oninput="saveInsightText()"></div>
        </div>
        <!-- Suggestions -->
        <div style="margin-bottom:16px;">
          <div style="font-size:11px;font-weight:700;color:var(--blue);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;">💡 ${T('reportSuggestions')}</div>
          <div id="insightSuggestions" contenteditable="true"
            style="background:var(--surface2);border:1px solid var(--border2);border-radius:8px;padding:12px;font-size:13px;color:var(--text);line-height:1.7;min-height:60px;outline:none;"
            oninput="saveInsightText()"></div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
          <input type="checkbox" id="includeInsightChk" onchange="includeInsight=this.checked" style="width:16px;height:16px;cursor:pointer;">
          <label for="includeInsightChk" style="font-size:13px;color:var(--text2);cursor:pointer;">${T('reportIncludeInsight')}</label>
        </div>
        <div style="font-size:11px;color:var(--text3);">${T('reportEditHint')}</div>
      </div>
    </div>

    <!-- Language selector + Download -->
    <div class="chart-card">
      <div class="chart-title" style="margin-bottom:16px;">${T('reportLangTitle')}</div>
      <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;">
        ${['zh', 'en', 'ja'].map(l => {
        const labels = { zh: '中文', en: 'English', ja: '日本語' };
        return `<label onclick="selectPdfLangReport('${l}')" id="rptLang${l.charAt(0).toUpperCase() + l.slice(1)}"
            style="display:flex;align-items:center;gap:8px;padding:10px 16px;border:2px solid ${l === 'zh' ? '#3b82f6' : 'var(--border2)'};border-radius:10px;cursor:pointer;background:${l === 'zh' ? 'var(--surface2)' : 'var(--surface)'};transition:all .15s;">
            <span style="font-size:18px;">${{ zh: '🇹🇼', en: '🇺🇸', ja: '🇯🇵' }[l]}</span>
            <span style="font-size:13px;font-weight:600;color:var(--text);">${labels[l]}</span>
            <span id="rptChk${l.charAt(0).toUpperCase() + l.slice(1)}" style="color:var(--blue);display:${l === 'zh' ? 'inline' : 'none'};">✓</span>
          </label>`;
      }).join('')}
      </div>
      <button onclick="generatePDFFromReport()" class="btn btn-green" style="width:100%;padding:12px;font-size:14px;font-weight:700;">
        ${T('reportDownloadBtn')}
      </button>
    </div>
  `;

      // Restore saved insight text if any
      if (reportInsightText.highlights) {
        const h = document.getElementById('insightHighlights');
        const w = document.getElementById('insightWarnings');
        const s = document.getElementById('insightSuggestions');
        if (h) h.innerText = reportInsightText.highlights;
        if (w) w.innerText = reportInsightText.warnings;
        if (s) s.innerText = reportInsightText.suggestions;
        document.getElementById('insightArea').style.display = 'block';
        const chk = document.getElementById('includeInsightChk');
        if (chk) chk.checked = includeInsight;
      }
    }

    function saveInsightText() {
      reportInsightText.highlights = document.getElementById('insightHighlights')?.innerText || '';
      reportInsightText.warnings = document.getElementById('insightWarnings')?.innerText || '';
      reportInsightText.suggestions = document.getElementById('insightSuggestions')?.innerText || '';
    }

    async function generateInsights() {
      const btn = document.getElementById('insightGenBtn');
      if (btn) { btn.disabled = true; btn.textContent = T('reportInsightGenerating'); }

      // Build data summary for Claude
      const allMsgs = sessions.flatMap(s => s.msgs);
      const userMsgs = allMsgs.filter(m => isUser(m.spk));
      const sessWithUser = sessions.filter(s => s.msgs.some(m => isUser(m.spk))).length;
      const noInteract = sessions.length - sessWithUser;
      const noInteractPct = ((noInteract / sessions.length) * 100).toFixed(1);

      // Language distribution
      const langCount = {};
      sessions.forEach(s => {
        const u = s.msgs.filter(m => isUser(m.spk));
        if (!u.length) return;
        const lc = {};
        u.forEach(m => { lc[m.lang] = (lc[m.lang] || 0) + 1; });
        const dom = Object.entries(lc).sort((a, b) => b[1] - a[1])[0][0];
        langCount[dom] = (langCount[dom] || 0) + 1;
      });
      const langSummary = Object.entries(langCount).sort((a, b) => b[1] - a[1])
        .map(([l, c]) => `${l} ${((c / sessWithUser) * 100).toFixed(0)}%`).join('、');

      // Top keywords
      const kwCount = {};
      aiResults.forEach(r => {
        if (!r.kw) return;
        r.kw.split('、').forEach(k => { k = k.trim(); if (k) kwCount[k] = (kwCount[k] || 0) + 1; });
      });
      const topKw = Object.entries(kwCount).sort((a, b) => b[1] - a[1]).slice(0, 8).map(e => e[0]).join('、');

      // Top topics
      const topicCount = {};
      aiResults.forEach(r => { const t = resolveNoUser(r.topic, 'zh'); topicCount[t] = (topicCount[t] || 0) + 1; });
      const topTopics = Object.entries(topicCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(e => e[0]).join('、');

      // Duration median
      const sessWithTs = sessions.filter(s => s.msgs.filter(m => m.ts).length >= 2);
      const durs = sessWithTs.map(s => {
        const ts = s.msgs.map(m => m.ts).filter(Boolean).map(t => new Date(t)).filter(d => !isNaN(d));
        return (Math.max(...ts) - Math.min(...ts)) / 60000;
      }).filter(d => d < 30);
      const medDur = durs.length ? (() => {
        const sorted = [...durs].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 ? sorted[mid].toFixed(1) : ((sorted[mid - 1] + sorted[mid]) / 2).toFixed(1);
      })() : null;

      const prompt = `你是一位 AI 客服數據分析師。以下是一份 AI Agent 對話數據摘要，請用繁體中文生成簡短的分析洞察。

數據摘要：
- 總 Sessions：${sessions.length}，有用戶互動：${sessWithUser}（${((sessWithUser / sessions.length) * 100).toFixed(0)}%）
- 無互動率：${noInteractPct}%（${noInteract} sessions）
- 主要語言分布：${langSummary}
- 對話時長中位數：${medDur ? medDur + ' 分鐘' : '無法計算'}
- 熱門關鍵詞：${topKw}
- 熱門主題：${topTopics}

請以以下 JSON 格式回覆，每個區塊 1-2 點，每點一句話，不超過 40 字：
{
  "highlights": "亮點內容（用換行分隔多點）",
  "warnings": "需注意內容（用換行分隔多點）",
  "suggestions": "建議內容（用換行分隔多點）"
}

只回傳 JSON，不要加任何說明。`;

      try {
        let apiKey = localStorage.getItem('claude_api_key');
        if (!apiKey) {
          apiKey = prompt('請輸入您的 Anthropic Claude API Key：\n(僅存在本地端 localStorage，發送 API 請求使用)');
          if (!apiKey) {
            if (btn) { btn.disabled = false; btn.textContent = T('reportInsightBtn'); }
            return;
          }
          localStorage.setItem('claude_api_key', apiKey);
        }

        const resp = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 600,
            messages: [{ role: 'user', content: prompt }]
          })
        });

        if (!resp.ok) {
          if (resp.status === 401) localStorage.removeItem('claude_api_key');
          const errData = await resp.json().catch(() => ({}));
          throw new Error(errData.error?.message || 'API 請求失敗 (' + resp.status + ')');
        }

        const data = await resp.json();
        const text = data.content[0].text.trim().replace(/```json|```/g, '').trim();
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
    }

    function generatePDFFromReport() {
      // Sync pdfLang from report page selector
      generatePDF();
    }

    function selectPdfLangReport(lang) {
      selectPdfLang(lang);
      // Update report page selector UI
      ['zh', 'en', 'ja'].forEach(l => {
        const cap = l.charAt(0).toUpperCase() + l.slice(1);
        const row = document.getElementById('rptLang' + cap);
        const chk = document.getElementById('rptChk' + cap);
        if (!row) return;
        row.style.border = l === lang ? '2px solid #3b82f6' : '2px solid var(--border2)';
        row.style.background = l === lang ? 'var(--surface2)' : 'var(--surface)';
        if (chk) chk.style.display = l === lang ? 'inline' : 'none';
      });
    }

    // ── end report page ──────────────────────────────────────

    // ── Stat card with tooltip helper ──
    function statCardTip(colorVar, labelKey, value, subKey, subArgs, tipKey, tipArgs, warnIds) {
      const label = T(labelKey);
      const sub = subKey ? T(subKey, ...(subArgs || [])) : '';
      const tip = tipKey ? T(tipKey, ...(tipArgs || [])) : '';
      const hasWarn = warnIds && warnIds.length > 0;
      const warnHtml = hasWarn
        ? `<span class="stat-warn" title="" onclick="showOutlierModal(${JSON.stringify(warnIds)})">⚠️</span>` : '';
      const tipHtml = tip
        ? `<span class="stat-tooltip-wrap">
        <span class="stat-tooltip-icon">ⓘ</span>
        <div class="stat-tooltip-box">${tip}</div>
       </span>` : '';
      return `<div class="stat-card" style="border-left:3px solid var(${colorVar})">
    <div class="stat-label" style="display:flex;align-items:center;gap:4px;">
      ${label} ${tipHtml} ${warnHtml}
    </div>
    <div class="stat-value" style="color:var(${colorVar})">${value}</div>
    ${sub ? `<div class="stat-sub">${sub}</div>` : ''}
  </div>`;
    }

    function showOutlierModal(ids) {
      const existing = document.getElementById('outlierModal');
      if (existing) existing.remove();
      const m = document.createElement('div');
      m.id = 'outlierModal';
      m.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;';
      m.innerHTML = `
    <div style="background:var(--surface);border:1px solid var(--border2);border-radius:14px;padding:24px;width:480px;max-width:90vw;max-height:80vh;display:flex;flex-direction:column;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <div>
          <div style="font-size:15px;font-weight:700;">⚠️ 排除的異常 Session</div>
          <div style="font-size:11px;color:var(--text3);margin-top:3px;">對話時長超過 30 分鐘，已排除於中位數計算之外</div>
        </div>
        <button onclick="document.getElementById('outlierModal').remove()"
          style="background:none;border:none;color:var(--text2);font-size:20px;cursor:pointer;padding:0 4px;">✕</button>
      </div>
      <div style="overflow-y:auto;flex:1;">
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead><tr style="background:var(--surface2);">
            <th style="padding:8px 10px;text-align:left;color:var(--text3);font-size:11px;">Session ID</th>
            <th style="padding:8px 10px;text-align:center;color:var(--text3);font-size:11px;">時長</th>
            <th style="padding:8px 10px;text-align:center;color:var(--text3);font-size:11px;">查看</th>
          </tr></thead>
          <tbody>
            ${ids.map(id => {
        const s = sessions.find(x => x.id === id);
        const ts = s ? s.msgs.map(m => m.ts).filter(Boolean).map(t => new Date(t)).filter(d => !isNaN(d)) : [];
        const dur = ts.length >= 2 ? ((Math.max(...ts) - Math.min(...ts)) / 60000).toFixed(1) : '—';
        return `<tr style="border-bottom:1px solid var(--border);">
                <td style="padding:7px 10px;font-family:monospace;font-size:10px;color:var(--text3);">${id}</td>
                <td style="padding:7px 10px;text-align:center;color:var(--amber);font-weight:600;">${dur} 分</td>
                <td style="padding:7px 10px;text-align:center;">
                  <button class="btn btn-blue" style="padding:3px 10px;font-size:10px;" onclick="openModal('${id}');document.getElementById('outlierModal').remove();">查看</button>
                </td>
              </tr>`;
      }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
      m.addEventListener('click', e => { if (e.target === m) m.remove(); });
      document.body.appendChild(m);
    }

    function renderOverview() {
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
    }

    // ════════════════════════════════════════════
    //  LANGUAGE PAGE
    // ════════════════════════════════════════════
    function renderLanguage() {
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
    }

    // ════════════════════════════════════════════
    //  AI TOPIC ANALYSIS
    // ════════════════════════════════════════════




    // ── Topic table state ──
    let topicSortKey = 'n', topicSortDir = -1;

    function topicSort(key) {
      topicSortDir = topicSortKey === key ? -topicSortDir : (key === 'n' || key === 'ts' ? -1 : 1);
      topicSortKey = key;
      renderTopicTable();
    }

    function clearTopicFilters() {
      ['topicSearch', 'topicDateFrom', 'topicDateTo'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
      const lf = document.getElementById('topicLangFilter'); if (lf) lf.value = '';
      const mf = document.getElementById('topicMsgFilter'); if (mf) mf.value = '0';
      renderTopicTable();
    }

    function populateTopicFilters() {
      const lf = document.getElementById('topicLangFilter');
      const mf = document.getElementById('topicMsgFilter');
      if (!lf || !mf) return;
      lf.innerHTML = `<option value="">${T('allLangs')}</option><option value="日文">日文</option><option value="中文">中文</option><option value="英文">英文</option><option value="其他">${T('langOther')}</option>`;
      mf.innerHTML = `<option value="0">${T('allMsgCounts')}</option><option value="2">${T('msgAbove', 2)}</option><option value="5">${T('msgAbove', 5)}</option><option value="10">${T('msgAbove', 10)}</option><option value="20">${T('msgAbove', 20)}</option>`;
      const s = document.getElementById('topicSearch'); if (s) s.placeholder = T('searchTopic');
    }

    function renderTopicTable() {
      populateTopicFilters();
      const q = (document.getElementById('topicSearch')?.value || '').toLowerCase();
      const langF = document.getElementById('topicLangFilter')?.value || '';
      const minMsgs = parseInt(document.getElementById('topicMsgFilter')?.value || '0');
      const dFrom = document.getElementById('topicDateFrom')?.value || '';
      const dTo = document.getElementById('topicDateTo')?.value || '';

      const sessTs = {}; const sessLang = {};
      sessions.forEach(s => {
        sessTs[s.id] = s.msgs.find(m => m.ts)?.ts || '';
        const u = s.msgs.filter(m => isUser(m.spk));
        if (!u.length) { sessLang[s.id] = ''; return; }
        const lc = {}; u.forEach(m => { const l = m.lang || '未知'; lc[l] = (lc[l] || 0) + 1; });
        sessLang[s.id] = Object.entries(lc).sort((a, b) => b[1] - a[1])[0][0];
      });

      let rows = aiResults.map(r => ({ ...r, ts: sessTs[r.id] || '', lang: sessLang[r.id] || '' }));
      if (q) rows = rows.filter(r => resolveNoUser(r.topic, 'zh').toLowerCase().includes(q) || r.kw.toLowerCase().includes(q) || r.id.toLowerCase().includes(q));
      if (langF) rows = rows.filter(r => r.lang === langF);
      if (minMsgs > 0) rows = rows.filter(r => r.n >= minMsgs);
      if (dFrom) rows = rows.filter(r => r.ts && r.ts.slice(0, 10) >= dFrom);
      if (dTo) rows = rows.filter(r => r.ts && r.ts.slice(0, 10) <= dTo);

      rows.sort((a, b) => {
        let av = a[topicSortKey], bv = b[topicSortKey];
        if (topicSortKey === 'n') { av = +av; bv = +bv; }
        else if (topicSortKey === 'ts') { av = new Date(av || 0); bv = new Date(bv || 0); }
        else { av = String(av || '').toLowerCase(); bv = String(bv || '').toLowerCase(); }
        return av < bv ? -topicSortDir : av > bv ? topicSortDir : 0;
      });

      ['id', 'topic', 'n', 'ts'].forEach(k => {
        const el = document.getElementById('tsort-' + k);
        if (el) el.textContent = k === topicSortKey ? (topicSortDir > 0 ? ' ↑' : ' ↓') : '';
      });

      document.getElementById('topicTbody').innerHTML = rows.map(r => `
    <tr style="cursor:pointer" onclick="openModal('${r.id}')">
      <td class="td-sid">${r.id}</td>
      <td class="td-topic">${esc(resolveNoUser(r.topic, 'zh'))}</td>
      <td class="td-cnt">${r.n}</td>
      <td class="td-cnt" style="font-size:10px;">${r.ts ? formatTs(r.ts) : '—'}</td>
      <td class="td-kw">${esc(r.kw)}</td>
    </tr>`).join('');

      document.getElementById('topicTableWrap').style.display = rows.length ? 'block' : 'none';
      document.getElementById('sessionTableLabel').style.display = 'block';
      const badge = document.getElementById('topicCountBadge');
      if (badge) badge.textContent = T('countBadge', rows.length, aiResults.length);
    }

    // addTopicRow is no longer called directly; kept for compatibility
    function addTopicRow(r) { }

    // ── Sessions page state ──
    let sessSortKey = 'ts', sessSortDir = -1;

    function sessSort(key) {
      sessSortDir = sessSortKey === key ? -sessSortDir : (key === 'n' || key === 'uCount' || key === 'ts' ? -1 : 1);
      sessSortKey = key;
      renderSessTable();
    }

    function clearSessFilters() {
      ['sessSearch', 'sessDateFrom', 'sessDateTo'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
      const lf = document.getElementById('sessLangFilter'); if (lf) lf.value = '';
      const mf = document.getElementById('sessMsgFilter'); if (mf) mf.value = '0';
      renderSessTable();
    }

    function renderSessionsList() {
      document.getElementById('sessionsContent').innerHTML = `
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px;">
      <input type="text" id="sessSearch" oninput="renderSessTable()"
        style="background:var(--surface2);border:1px solid var(--border2);border-radius:8px;color:var(--text);padding:7px 12px;font-size:12px;width:210px;">
      <select id="sessLangFilter" onchange="renderSessTable()"
        style="background:var(--surface2);border:1px solid var(--border2);border-radius:8px;color:var(--text);padding:7px 10px;font-size:12px;"></select>
      <select id="sessMsgFilter" onchange="renderSessTable()"
        style="background:var(--surface2);border:1px solid var(--border2);border-radius:8px;color:var(--text);padding:7px 10px;font-size:12px;"></select>
      <input type="date" id="sessDateFrom" onchange="renderSessTable()" title="From"
        style="background:var(--surface2);border:1px solid var(--border2);border-radius:8px;color:var(--text);padding:7px 10px;font-size:12px;color-scheme:dark;">
      <span style="color:var(--text3);font-size:12px;">～</span>
      <input type="date" id="sessDateTo" onchange="renderSessTable()" title="To"
        style="background:var(--surface2);border:1px solid var(--border2);border-radius:8px;color:var(--text);padding:7px 10px;font-size:12px;color-scheme:dark;">
      <span id="sessCountBadge" style="font-size:12px;color:var(--text3);flex:1;"></span>
      <button onclick="clearSessFilters()" id="ui-btnClear2"
        style="background:none;border:1px solid var(--border2);border-radius:6px;color:var(--text3);padding:6px 12px;font-size:11px;cursor:pointer;" id="ui-btnClear2">✕ 清除篩選</button>
    </div>
    <div class="table-wrap">
    <table style="table-layout:fixed;width:100%;">
      <colgroup><col style="width:14%"><col style="width:9%"><col style="width:7%"><col style="width:8%"><col style="width:11%"><col style="width:37%"><col style="width:7%"></colgroup>
      <thead><tr>
        <th style="cursor:pointer" onclick="sessSort('id')">Session ID <span id="ssort-id"></span></th>
        <th style="cursor:pointer" onclick="sessSort('lang')" id="ui-thLang">語言 <span id="ssort-lang"></span></th>
        <th style="cursor:pointer" onclick="sessSort('n')" id="ui-thMsgCount2">訊息數 <span id="ssort-n"></span></th>
        <th style="cursor:pointer" onclick="sessSort('uCount')" id="ui-thUserMsg">用戶訊息 <span id="ssort-uCount"></span></th>
        <th style="cursor:pointer" onclick="sessSort('ts')" id="ui-thTime2">時間 <span id="ssort-ts"> ↓</span></th>
        <th id="ui-thTopic2">主題</th>
        <th id="ui-thAction">操作</th>
      </tr></thead>
      <tbody id="sessTableBody"></tbody>
    </table>
    </div>
  `;
      renderSessTable();
    }

    const langTagHTML = l => {
      if (!l) return '—';
      const cls = l === '日文' ? 'lang-ja' : l === '中文' ? 'lang-zh' : l === '英文' ? 'lang-en' : l === '其他' ? 'lang-other' : 'lang-none';
      if (l === '__NO_USER__') l = T('noUserInteraction');
      return `<span class="lang-tag ${cls}">${l}</span>`;
    };

    function populateSessFilters() {
      const lf = document.getElementById('sessLangFilter');
      const mf = document.getElementById('sessMsgFilter');
      if (!lf || !mf) return;
      lf.innerHTML = `<option value="">${T('allLangs')}</option><option value="日文">日文</option><option value="中文">中文</option><option value="英文">英文</option><option value="其他">${T('langOther')}</option><option value="__NO_USER__">${T('noUserInteraction')}</option>`;
      mf.innerHTML = `<option value="0">${T('allMsgCounts')}</option><option value="2">${T('msgAbove', 2)}</option><option value="5">${T('msgAbove', 5)}</option><option value="10">${T('msgAbove', 10)}</option><option value="20">${T('msgAbove', 20)}</option>`;
      const s = document.getElementById('sessSearch'); if (s) s.placeholder = T('searchSess');
      const c1 = document.getElementById('ui-btnClear1'); if (c1) c1.textContent = T('btnClear');
      const c2 = document.getElementById('ui-btnClear2'); if (c2) c2.textContent = T('btnClear');
    }

    function renderSessTable() {
      populateSessFilters();
      const q = (document.getElementById('sessSearch')?.value || '').toLowerCase();
      const langF = document.getElementById('sessLangFilter')?.value || '';
      const minMsgs = parseInt(document.getElementById('sessMsgFilter')?.value || '0');
      const dFrom = document.getElementById('sessDateFrom')?.value || '';
      const dTo = document.getElementById('sessDateTo')?.value || '';

      const topicMap = {};
      aiResults.forEach(r => { topicMap[r.id] = resolveNoUser(r.topic, 'zh'); });

      let rows = sessions.map(s => {
        const uCount = s.msgs.filter(m => isUser(m.spk)).length;
        const ts = s.msgs.find(m => m.ts)?.ts || '';
        const u = s.msgs.filter(m => isUser(m.spk));
        let lang = '';
        if (!u.length) lang = '__NO_USER__';
        else {
          const lc = {}; u.forEach(m => { const l = m.lang || '未知'; lc[l] = (lc[l] || 0) + 1; });
          lang = Object.entries(lc).sort((a, b) => b[1] - a[1])[0][0];
        }
        return { id: s.id, n: s.n, uCount, ts, lang, topic: topicMap[s.id] || '' };
      });

      if (q) rows = rows.filter(r => r.id.toLowerCase().includes(q) || r.topic.toLowerCase().includes(q));
      if (langF) rows = rows.filter(r => (langF === '__NO_USER__' ? r.lang === '__NO_USER__' : r.lang === langF));
      if (minMsgs > 0) rows = rows.filter(r => r.n >= minMsgs);
      if (dFrom) rows = rows.filter(r => r.ts && r.ts.slice(0, 10) >= dFrom);
      if (dTo) rows = rows.filter(r => r.ts && r.ts.slice(0, 10) <= dTo);

      rows.sort((a, b) => {
        let av = a[sessSortKey], bv = b[sessSortKey];
        if (sessSortKey === 'n' || sessSortKey === 'uCount') { av = +av; bv = +bv; }
        else if (sessSortKey === 'ts') { av = new Date(av || 0); bv = new Date(bv || 0); }
        else { av = String(av || '').toLowerCase(); bv = String(bv || '').toLowerCase(); }
        return av < bv ? -sessSortDir : av > bv ? sessSortDir : 0;
      });

      ['id', 'lang', 'n', 'uCount', 'ts'].forEach(k => {
        const el = document.getElementById('ssort-' + k);
        if (el) el.textContent = k === sessSortKey ? (sessSortDir > 0 ? ' ↑' : ' ↓') : '';
      });

      const tb = document.getElementById('sessTableBody');
      if (!tb) return;
      tb.innerHTML = rows.map(r => `<tr>
    <td class="td-sid">${r.id}</td>
    <td class="td-lang">${langTagHTML(r.lang)}</td>
    <td class="td-cnt">${r.n}</td>
    <td class="td-cnt">${r.uCount}</td>
    <td class="td-cnt" style="font-size:10px;">${r.ts ? formatTs(r.ts) : '—'}</td>
    <td class="td-topic" style="font-size:11px;color:var(--text2);">${esc(r.topic)}</td>
    <td><button class="btn btn-blue" style="padding:5px 12px;font-size:11px;" onclick="openModal('${r.id}')">${T('btnView')}</button></td>
  </tr>`).join('');

      const badge = document.getElementById('sessCountBadge');
      if (badge) badge.textContent = T('sessBadge', rows.length, sessions.length);
    }

    function openModal(sessionId) {
      const s = sessions.find(x => x.id === sessionId);
      if (!s) return;
      document.getElementById('modalTitle').textContent = sessionId;
      const tsFirst = s.msgs[0]?.ts ? formatTs(s.msgs[0].ts) : '';
      const tsLast = s.msgs[s.msgs.length - 1]?.ts ? formatTs(s.msgs[s.msgs.length - 1].ts) : '';
      const tsRange = tsFirst ? `${tsFirst} ～ ${tsLast}` : '';
      document.getElementById('modalMeta').textContent = `${s.n} 則訊息 · ${s.msgs.filter(m => m.spk.toUpperCase() === 'USER').length} 則用戶訊息${tsRange ? ' · ' + tsRange : ''}`;
      document.getElementById('modalBody').innerHTML = s.msgs.map(m => {
        const isAgentMsg = m.spk.toUpperCase() === 'AGENT' || (!isUser(m.spk) && m.spk !== '');
        const tsDisplay = m.ts ? formatTs(m.ts) : '';
        return `<div class="convo-msg">
      <div class="msg-role ${isAgentMsg ? 'agent' : 'user'}" style="display:flex;justify-content:space-between;align-items:center;">
        <span>${m.spk}</span>
        ${tsDisplay ? `<span style="font-size:10px;color:var(--text3);font-weight:400;">${tsDisplay}</span>` : ''}
      </div>
      <div class="msg-bubble ${isAgentMsg ? 'agent' : 'user'}">${esc(m.cnt)}</div>
    </div>`;
      }).join('');
      document.getElementById('modalOverlay').classList.add('open');
    }
    function closeModal(e) { if (e.target === document.getElementById('modalOverlay')) closeModalDirect(); }
    function closeModalDirect() { document.getElementById('modalOverlay').classList.remove('open'); }

    // ════════════════════════════════════════════
    //  CSV EXPORT
    // ════════════════════════════════════════════
    function escCSV(s) {
      if (s == null) return '';
      const str = String(s);
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r'))
        return '"' + str.replace(/"/g, '""') + '"';
      return str;
    }

    function downloadCSV() {
      const headers = ['session_id', 'topic', '對話訊息數', 'keywords', '完整對話'];
      const rows = aiResults.map(r => [escCSV(r.id), escCSV(resolveNoUser(r.topic, 'zh')), escCSV(r.n), escCSV(r.kw), escCSV(r.full_convo)]);
      const csv = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'session_analysis.csv'; a.click();
      URL.revokeObjectURL(url);
    }

    // ════════════════════════════════════════════
    //  CHART HELPERS
    // ════════════════════════════════════════════
    const chartDefaults = {
      color: '#94a3b8',
      plugins: {
        legend: { labels: { color: '#94a3b8', font: { size: 11 } } },
        tooltip: { backgroundColor: '#1e2535', titleColor: '#e2e8f0', bodyColor: '#94a3b8' }
      }
    };
    function barOpts() {
      return {
        responsive: true, maintainAspectRatio: false,
        plugins: { ...chartDefaults.plugins },
        scales: {
          x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: '#1e2535' } },
          y: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: '#1e2535' } }
        }
      };
    }
    function pieOpts() {
      return {
        responsive: true, maintainAspectRatio: false,
        plugins: { ...chartDefaults.plugins, legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 11 }, boxWidth: 12, padding: 12 } } }
      };
    }
    function destroyChart(id) {
      if (chartInstances[id]) { chartInstances[id].destroy(); delete chartInstances[id]; }
    }

    // ════════════════════════════════════════════
    //  MISC
    // ════════════════════════════════════════════
    function formatTs(ts) {
      if (!ts) return '';
      try {
        const d = new Date(ts);
        if (isNaN(d)) return ts;
        return d.toLocaleString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
      } catch { return ts; }
    }
    function esc(s) {
      return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    // ════════════════════════════════════════════
    //  TIME ANALYSIS PAGE
    // ════════════════════════════════════════════
    function renderTime() {
      const el = document.getElementById('timeContent');
      if (!el) return;
      if (!sessions || !sessions.length) { el.innerHTML = '<div class="empty-state"><div class="eicon">⏱</div><p>' + T('noDataLoaded') + '</p></div>'; return; }
      if (!el) return;

      const allMsgs = sessions.flatMap(s => s.msgs);

      // ── Hour distribution ──
      const hourCounts = Array(24).fill(0);
      sessions.forEach(s => {
        const firstTs = s.msgs.find(m => m.ts)?.ts;
        if (firstTs) { const h = new Date(firstTs).getHours(); hourCounts[h]++; }
      });

      // ── Day of week distribution ──
      const dayCounts = Array(7).fill(0);
      sessions.forEach(s => {
        const firstTs = s.msgs.find(m => m.ts)?.ts;
        if (firstTs) { const d = new Date(firstTs).getDay(); dayCounts[d]++; }
      });

      // ── Session duration bins ──
      const durBinCounts = [0, 0, 0, 0, 0, 0];
      sessions.forEach(s => {
        const ts = s.msgs.map(m => m.ts).filter(Boolean).map(t => new Date(t)).filter(d => !isNaN(d));
        if (ts.length < 2) return;
        const dur = (Math.max(...ts) - Math.min(...ts)) / 60000;
        if (dur < 1) durBinCounts[0]++;
        else if (dur < 3) durBinCounts[1]++;
        else if (dur < 5) durBinCounts[2]++;
        else if (dur < 10) durBinCounts[3]++;
        else if (dur < 20) durBinCounts[4]++;
        else durBinCounts[5]++;
      });


      const avgArr = arr => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

      // ── Agent replies per language (based on user message language in session) ──
      const replyByLang = {};
      sessions.forEach(s => {
        const umsgs = s.msgs.filter(m => isUser(m.spk) && m.lang);
        if (!umsgs.length) return;
        const lc = {};
        umsgs.forEach(m => { lc[m.lang] = (lc[m.lang] || 0) + 1; });
        const domLang = Object.entries(lc).sort((a, b) => b[1] - a[1])[0][0];
        const agentCount = s.msgs.filter(m => isAgent(m.spk)).length;
        replyByLang[domLang] = (replyByLang[domLang] || 0) + agentCount;
      });
      const langKeys = Object.keys(replyByLang);

      const langColors = { '日文': '#3b82f6', '中文': '#22c55e', '英文': '#a855f7', '其他': '#f59e0b' };
      const getColor = l => langColors[l] || '#64748b';
      const weekdays = T('weekdays');
      const durationBins = T('durationBins');
      const replyBins = T('replyBins');

      el.innerHTML = `
    <div class="chart-grid">
      <div class="chart-card full">
        <div class="chart-title" id="ui-secHourDist">${T('secHourDist')}</div>
        <div class="chart-sub">${T('secHourDistSub')}</div>
        <div class="chart-wrap tall"><canvas id="hourChart"></canvas></div>
      </div>
    </div>
    <div class="chart-grid">
      <div class="chart-card">
        <div class="chart-title" id="ui-secDayDist">${T('secDayDist')}</div>
        <div class="chart-sub">${T('secDayDistSub')}</div>
        <div class="chart-wrap"><canvas id="dayChart"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="chart-title" id="ui-secDurationDist">${T('secDurationDist')}</div>
        <div class="chart-sub">${T('secDurationDistSub')}</div>
        <div class="chart-wrap"><canvas id="durChart"></canvas></div>
      </div>
    </div>
  `;

      const mkBar = (id, labels, data, color) => {
        destroyChart(id);
        chartInstances[id] = new Chart(document.getElementById(id), {
          type: 'bar',
          data: { labels, datasets: [{ data, backgroundColor: color + 'cc', borderColor: color, borderWidth: 1, borderRadius: 4 }] },
          options: { ...barOpts(), plugins: { legend: { display: false } } }
        });
      };

      // Hour chart - 24 bars
      mkBar('hourChart', Array.from({ length: 24 }, (_, i) => i + ':00'), hourCounts, '#3b82f6');
      // Day chart
      mkBar('dayChart', weekdays, dayCounts, '#a855f7');
      // Duration chart
      mkBar('durChart', durationBins, durBinCounts, '#f59e0b');

    }

    // ════════════════════════════════════════════
    //  USER BEHAVIOR PAGE
    // ════════════════════════════════════════════
    function renderBehavior() {
      const el = document.getElementById('behaviorContent');
      if (!el) return;
      if (!sessions.length) { el.innerHTML = '<div class="empty-state"><div class="eicon">👤</div><p>' + T("noDataLoaded") + '</p></div>'; return; }
      if (!el) return;

      const allMsgs = sessions.flatMap(s => s.msgs);
      const noInteractSessions = sessions.filter(s => !s.msgs.some(m => isUser(m.spk)));
      const noInteractPct = ((noInteractSessions.length / sessions.length) * 100).toFixed(1);



      // ── Returning users ──
      const userSessions = {};
      sessions.forEach(s => {
        s.msgs.filter(m => isUser(m.spk) && m.spkId).forEach(m => {
          if (!userSessions[m.spkId]) userSessions[m.spkId] = new Set();
          userSessions[m.spkId].add(s.id);
        });
      });
      const returningUsers = Object.entries(userSessions)
        .filter(([, sids]) => sids.size > 1)
        .sort((a, b) => b[1].size - a[1].size)
        .slice(0, 20);

      // ── High-intent users (most messages) ──
      const userMsgCount = {};
      sessions.forEach(s => {
        const umsgs = s.msgs.filter(m => isUser(m.spk) && m.spkId);
        umsgs.forEach(m => {
          userMsgCount[m.spkId] = (userMsgCount[m.spkId] || 0) + 1;
        });
      });
      // Only show users with spkId AND more than 1 message (skip anonymous/single-msg)
      const highIntent = Object.entries(userMsgCount)
        .filter(([id, cnt]) => cnt > 1)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      // ── Escalation & unresolved detection ──
      const escKws = T('escalationKeywords');
      const unresKws = T('unresolvedKeywords');
      const escalatedSessions = sessions.filter(s =>
        s.msgs.some(m => isAgent(m.spk) && escKws.some(kw => m.cnt.toLowerCase().includes(kw.toLowerCase())))
      );
      const unresolvedSessions = sessions.filter(s =>
        s.msgs.some(m => isAgent(m.spk) && unresKws.some(kw => m.cnt.toLowerCase().includes(kw.toLowerCase())))
      );

      const hasSpkId = allMsgs.some(m => m.spkId);

      el.innerHTML = `
    <!-- Stat cards -->
    <div class="stat-grid" style="margin-bottom:20px;">
      <div class="stat-card" style="border-left:3px solid var(--red)">
        <div class="stat-label" style="display:flex;align-items:center;gap:4px;">
          ${T('statNoInteract')}
          <span class="stat-tooltip-wrap"><span class="stat-tooltip-icon">ⓘ</span><div class="stat-tooltip-box">${T('tipNoInteract')}</div></span>
        </div>
        <div class="stat-value" style="color:var(--red)">${noInteractPct}%</div>
        <div class="stat-sub">${noInteractSessions.length} / ${sessions.length} sessions</div>
      </div>
      <div class="stat-card" style="border-left:3px solid var(--amber)">
        <div class="stat-label" style="display:flex;align-items:center;gap:4px;">
          ${T('labelEscalated')}
          <span class="stat-tooltip-wrap"><span class="stat-tooltip-icon">ⓘ</span><div class="stat-tooltip-box">${T('escUnresNote')}</div></span>
        </div>
        <div class="stat-value" style="color:var(--amber)">${escalatedSessions.length}</div>
        <div class="stat-sub">${((escalatedSessions.length / sessions.length) * 100).toFixed(1)}%</div>
      </div>
      <div class="stat-card" style="border-left:3px solid var(--red)">
        <div class="stat-label" style="display:flex;align-items:center;gap:4px;">
          ${T('labelUnresolved')}
          <span class="stat-tooltip-wrap"><span class="stat-tooltip-icon">ⓘ</span><div class="stat-tooltip-box">${T('escUnresNote')}</div></span>
        </div>
        <div class="stat-value" style="color:var(--red)">${unresolvedSessions.length}</div>
        <div class="stat-sub">${((unresolvedSessions.length / sessions.length) * 100).toFixed(1)}%</div>
      </div>
      ${returningUsers.length > 0 ? `<div class="stat-card indigo"><div class="stat-label">${T('secReturnUser')}</div><div class="stat-value" style="color:var(--indigo)">${returningUsers.length}</div><div class="stat-sub">${T('labelReturnSessions')}</div></div>` : ''}
    </div>

    <!-- Charts -->
    <div class="chart-grid">
      <div class="chart-card">
        <div class="chart-title">${T('noInteractHourTitle')}</div>
        <div class="chart-sub">${T('noInteractNote')}</div>
        <div class="chart-wrap"><canvas id="noInteractHourChart"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="chart-title">${T('secEscalation')}</div>
        <div class="chart-sub">${T('escUnresNote')}</div>
        <div class="chart-wrap"><canvas id="escalationChart"></canvas></div>
      </div>
    </div>

    <!-- Escalation + Unresolved - merged -->
    <p class="section-h" style="margin-top:20px;display:flex;align-items:center;gap:6px;">${T('secEscalation')} <span class="stat-tooltip-wrap"><span class="stat-tooltip-icon">ⓘ</span><div class="stat-tooltip-box">${T('escUnresNote')}</div></span></p>
    ${(() => {
          const merged = new Map();
          escalatedSessions.forEach(s => merged.set(s.id, { s, type: 'esc' }));
          unresolvedSessions.forEach(s => {
            if (merged.has(s.id)) merged.get(s.id).type = 'both';
            else merged.set(s.id, { s, type: 'unres' });
          });
          const rows = [...merged.values()].sort((a, b) => {
            const ta = a.s.msgs.find(m => m.ts)?.ts || '', tb = b.s.msgs.find(m => m.ts)?.ts || '';
            return tb.localeCompare(ta);
          });
          if (!rows.length) return '<p style="color:var(--text3);font-size:13px;">—</p>';
          const typeLabel = t => t === 'esc' ? T('escTypeEscalated') : t === 'unres' ? T('escTypeUnresolved') : T('escTypeEscalated') + ' + ' + T('escTypeUnresolved');
          const typeColor = t => t === 'both' ? 'var(--red)' : t === 'esc' ? 'var(--amber)' : 'var(--indigo)';
          return '<div class="table-wrap"><table style="table-layout:fixed;width:100%;font-size:11px;border-collapse:collapse;"><colgroup><col style="width:15%"><col style="width:42%"><col style="width:25%"><col style="width:13%"></colgroup>' +
            '<thead><tr style="background:var(--surface2);">' +
            '<th style="padding:6px 8px;color:var(--text3);">' + T('thEscType') + '</th>' +
            '<th style="padding:6px 8px;text-align:left;color:var(--text3);">Session ID</th>' +
            '<th style="padding:6px 8px;text-align:center;color:var(--text3);">' + T('thTime') + '</th>' +
            '<th style="padding:6px 8px;color:var(--text3);">' + T('thAction') + '</th>' +
            '</tr></thead><tbody>' +
            rows.slice(0, 30).map(({ s, type }) => {
              const ts = s.msgs.find(m => m.ts)?.ts || '';
              return '<tr style="border-bottom:1px solid var(--border);">' +
                '<td style="padding:5px 8px;"><span style="font-size:10px;font-weight:700;color:' + typeColor(type) + ';">' + typeLabel(type) + '</span></td>' +
                '<td style="padding:5px 8px;" class="td-sid">' + s.id + '</td>' +
                '<td style="padding:5px 8px;text-align:center;font-size:10px;color:var(--text2);">' + (ts ? formatTs(ts) : '—') + '</td>' +
                '<td style="padding:5px 8px;"><button class="btn btn-blue" style="padding:2px 7px;font-size:10px;" onclick="openModal(\'' + s.id + '\'">' + T('btnView') + '</button></td>' +
                '</tr>';
            }).join('') + '</tbody></table></div>';
        })()}
    <!-- High intent -->
    <p class="section-h" style="margin-top:20px;">${T('secHighIntent')}</p>
    ${highIntent.length > 0 ? '<div class="table-wrap"><table style="table-layout:fixed;width:100%;"><colgroup><col style="width:4%"><col style="width:32%"><col style="width:10%"><col style="width:10%"><col style="width:44%"></colgroup><thead><tr><th>#</th><th>' + T('thSpkId') + '</th><th style="text-align:center">' + T('thMsgTotal') + '</th><th style="text-align:center">' + T('thUserSessions') + '</th><th>' + T('thAction') + '</th></tr></thead><tbody>' +
          highIntent.map(([id, cnt], i) => {
            const userSids = sessions.filter(s => s.msgs.some(m => m.spkId === id)).map(s => s.id);
            return '<tr><td class="td-cnt">' + (i + 1) + '</td><td class="td-sid">' + id + '</td><td class="td-cnt">' + cnt + '</td><td class="td-cnt">' + userSids.length + '</td><td>' + userSids.map(sid => '<button class="btn btn-blue" style="padding:3px 8px;font-size:10px;margin:1px;" onclick="openModal(\'' + sid + '\')">' + sid.slice(-6) + '</button>').join('') + '</td></tr>';
          }).join('') +
          '</tbody></table></div>'
          : '<p class="section-h" style="color:var(--text3);font-size:12px;">' + T('secHighIntent') + ' — ' + T('noSpkIdData') + '</p>'}

    <!-- Returning users -->
    ${returningUsers.length > 0 ? '<p class="section-h" style="margin-top:20px;">' + T('secReturnUser') + '</p><div class="table-wrap"><table style="table-layout:fixed;width:100%;"><colgroup><col style="width:5%"><col style="width:50%"><col style="width:20%"></colgroup><thead><tr><th>#</th><th>' + T('thSpkId') + '</th><th style="text-align:center">' + T('thReturnCount') + '</th></tr></thead><tbody>' + returningUsers.map(([id, sids], i) => '<tr><td class="td-cnt">' + (i + 1) + '</td><td class="td-sid">' + id + '</td><td class="td-cnt">' + sids.size + '</td></tr>').join('') + '</tbody></table></div>' : ''}
  `;

      // No-interact hour chart
      const noInteractByHour = Array(24).fill(0);
      sessions.forEach(s => {
        if (s.msgs.some(m => isUser(m.spk))) return; // skip sessions with user interaction
        const firstTs = s.msgs.find(m => m.ts)?.ts;
        if (firstTs) { const h = new Date(firstTs).getHours(); noInteractByHour[h]++; }
      });
      destroyChart('noInteractHourChart');
      chartInstances['noInteractHourChart'] = new Chart(document.getElementById('noInteractHourChart'), {
        type: 'bar',
        data: { labels: Array.from({ length: 24 }, (_, i) => i + ':00'), datasets: [{ data: noInteractByHour, backgroundColor: '#ef4444cc', borderColor: '#ef4444', borderWidth: 1, borderRadius: 4 }] },
        options: { ...barOpts(), plugins: { legend: { display: false } } }
      });

      // Escalation pie
      const interacted = sessions.length - noInteractSessions.length;
      const normal = interacted - escalatedSessions.length - unresolvedSessions.length;
      destroyChart('escalationChart');
      chartInstances['escalationChart'] = new Chart(document.getElementById('escalationChart'), {
        type: 'doughnut',
        data: {
          labels: [T('labelEscalated'), T('labelUnresolved'), T('labelNormal')],
          datasets: [{ data: [escalatedSessions.length, unresolvedSessions.length, Math.max(0, normal)], backgroundColor: ['#f59e0b', '#ef4444', '#22c55e'], borderWidth: 0 }]
        },
        options: { ...pieOpts() }
      });
    }

    function showErr(msg) {
      const el = document.getElementById('errBox'); el.textContent = '⚠️ ' + msg; el.style.display = 'block';
    }
    function hideErr() { document.getElementById('errBox').style.display = 'none'; }
    // ════════════════════════════════════════
    // ── PDF Report (print-based, full CJK support) ──
    // ════════════════════════════════════════
    let pdfLang = 'zh';

    const PDF_S = {
      zh: {
        title: 'AI Avatar 對話分析報告', generated: '報告產生時間',
        total_sessions: '總 Sessions', total_messages: '總訊息數',
        sess_with_user: '有用戶互動', avg_msg: '平均訊息數 / Session',
        user_msg: '用戶訊息數', agent_msg: 'Agent 訊息數', unique_users: '不重複用戶數',
        no_interact: '不互動率', avg_duration: '對話時長中位數', avg_reply: '平均回覆速度',
        escalated: '偵測到轉接', unresolved: '偵測到未解決',
        data_range: '資料區間',
        s1: '一、數據總覽', s2: '二、語言分布', s3: '三、用戶行為', s4: '四、主題分析（Top 10）', s5: '五、熱門關鍵詞（Top 20）',
        lang_label: '語言', sessions_label: 'Sessions 數', count_label: '次數',
        topic_label: '主題', keyword_label: '關鍵詞',
        no_user: '僅有客服開場白', min_unit: '分', sec_unit: '秒',
      },
      en: {
        title: 'AI Avatar Conversation Analysis Report', generated: 'Generated',
        total_sessions: 'Total Sessions', total_messages: 'Total Messages',
        sess_with_user: 'With User Interaction', avg_msg: 'Avg Messages / Session',
        user_msg: 'User Messages', agent_msg: 'Agent Messages', unique_users: 'Unique Users',
        no_interact: 'No-Interaction Rate', avg_duration: 'Median Session Duration', avg_reply: 'Avg Reply Speed',
        escalated: 'Escalation Detected', unresolved: 'Unresolved Detected',
        data_range: 'Date Range',
        s1: '1. Overview', s2: '2. Language Distribution', s3: '3. User Behavior', s4: '4. Topic Analysis (Top 10)', s5: '5. Top Keywords (Top 20)',
        lang_label: 'Language', sessions_label: 'Sessions', count_label: 'Count',
        topic_label: 'Topic', keyword_label: 'Keywords',
        no_user: 'Agent opening only', min_unit: 'min', sec_unit: 'sec',
      },
      ja: {
        title: 'AIアバター 会話分析レポート', generated: 'レポート生成日時',
        total_sessions: '総Sessions数', total_messages: '総メッセージ数',
        sess_with_user: 'ユーザー有り', avg_msg: '平均メッセージ数/Session',
        user_msg: 'ユーザーメッセージ数', agent_msg: 'Agentメッセージ数', unique_users: 'ユニークユーザー数',
        no_interact: '未返信率', avg_duration: '会話時間の中央値', avg_reply: '平均返答速度',
        escalated: 'エスカレーション検出', unresolved: '未解決検出',
        data_range: 'データ期間',
        s1: '一、データ概要', s2: '二、言語分布', s3: '三、ユーザー行動', s4: '四、トピック分析（Top 10）', s5: '五、上位キーワード（Top 20）',
        lang_label: '言語', sessions_label: 'Sessions数', count_label: '件数',
        topic_label: 'トピック', keyword_label: 'キーワード',
        no_user: 'Agentのみ', min_unit: '分', sec_unit: '秒',
      }
    };

    function openPdfModal() {
      if (!aiResults || !aiResults.length) { alert('先上傳 CSV 並完成分析後才能下載報告'); return; }
      document.getElementById('pdfModal').style.display = 'flex';
    }
    function closePdfModal() { document.getElementById('pdfModal').style.display = 'none'; }

    function selectPdfLang(lang) {
      pdfLang = lang;
      ['zh', 'en', 'ja'].forEach(l => {
        const cap = l.charAt(0).toUpperCase() + l.slice(1);
        const row = document.getElementById('pdfLang' + cap);
        const chk = document.getElementById('chk' + cap);
        if (l === lang) {
          row.style.border = '2px solid #3b82f6'; row.style.background = '#1e2535';
          chk.style.display = 'inline';
        } else {
          row.style.border = '2px solid #252d40'; row.style.background = '#111520';
          chk.style.display = 'none';
        }
      });
    }

    // ── Render chart canvas → <img> dataURL ──
    function canvasToDataUrl(canvasId) {
      const c = document.getElementById(canvasId);
      if (!c) return null;
      // Create a white-bg offscreen canvas for print
      const off = document.createElement('canvas');
      off.width = c.width; off.height = c.height;
      const ctx = off.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, off.width, off.height);
      ctx.drawImage(c, 0, 0);
      return off.toDataURL('image/png');
    }

    // ── Build inline bar chart as SVG (no canvas needed, full unicode) ──
    function svgBarChart(labels, values, color, title) {
      if (!labels.length) return '';
      const barH = 22, padL = 170, padR = 50, padT = 30, gap = 4;
      const maxV = Math.max(...values, 1);
      const chartW = 520;
      const barArea = chartW - padL - padR;
      const h = padT + labels.length * (barH + gap) + 10;

      let bars = '';
      labels.forEach((label, i) => {
        const bw = Math.max((values[i] / maxV) * barArea, 2);
        const y = padT + i * (barH + gap);
        const shortL = label.length > 20 ? label.slice(0, 19) + '…' : label;
        bars += `
      <text x="${padL - 6}" y="${y + barH * 0.68}" text-anchor="end"
        font-size="11" fill="#475569">${shortL}</text>
      <rect x="${padL}" y="${y}" width="${bw.toFixed(1)}" height="${barH}"
        rx="4" fill="${color}" opacity="0.9"/>
      <rect x="${padL}" y="${y}" width="3" height="${barH}"
        rx="0" fill="${color}"/>
      <text x="${padL + bw + 6}" y="${y + barH * 0.68}"
        font-size="11" font-weight="600" fill="#334155">${values[i]}</text>`;
      });

      return `<svg xmlns="http://www.w3.org/2000/svg" width="${chartW}" height="${h}" style="max-width:100%">
    <text x="${chartW / 2}" y="18" text-anchor="middle" font-size="12" font-weight="bold" fill="#1e293b">${title}</text>
    ${bars}
  </svg>`;
    }

    // ── Build inline donut chart as SVG ──
    function svgDonutChart(labels, values, colors, title) {
      if (!labels.length || values.every(v => v === 0)) return '';
      const total = values.reduce((s, v) => s + v, 0);
      const cx = 130, cy = 110, r = 80, ri = 52;
      let angle = -Math.PI / 2;
      let slices = '';
      const COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#06b6d4', '#ef4444'];

      values.forEach((v, i) => {
        const slice = (v / total) * 2 * Math.PI;
        const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
        const x2 = cx + r * Math.cos(angle + slice), y2 = cy + r * Math.sin(angle + slice);
        const lf = slice > Math.PI ? 1 : 0;
        const ix1 = cx + ri * Math.cos(angle), iy1 = cy + ri * Math.sin(angle);
        const ix2 = cx + ri * Math.cos(angle + slice), iy2 = cy + ri * Math.sin(angle + slice);
        slices += `<path d="M${ix1.toFixed(1)},${iy1.toFixed(1)} L${x1.toFixed(1)},${y1.toFixed(1)}
      A${r},${r} 0 ${lf},1 ${x2.toFixed(1)},${y2.toFixed(1)}
      L${ix2.toFixed(1)},${iy2.toFixed(1)} A${ri},${ri} 0 ${lf},0 ${ix1.toFixed(1)},${iy1.toFixed(1)} Z"
      fill="${COLORS[i % COLORS.length]}"/>`;
        angle += slice;
      });

      let legend = '';
      labels.forEach((label, i) => {
        const pct = Math.round(values[i] / total * 100);
        legend += `<rect x="270" y="${30 + i * 26}" width="12" height="12" rx="2" fill="${COLORS[i % COLORS.length]}"/>
      <text x="288" y="${41 + i * 26}" font-size="12" fill="#334155">${label}　${pct}%　(${values[i]})</text>`;
      });

      return `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="230" style="max-width:100%">
    <text x="250" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="#1e293b">${title}</text>
    ${slices}
    <text x="${cx}" y="${cy + 5}" text-anchor="middle" font-size="18" font-weight="bold" fill="#1e293b">${total}</text>
    <text x="${cx}" y="${cy + 20}" text-anchor="middle" font-size="10" fill="#64748b">total</text>
    ${legend}
  </svg>`;
    }

    // ── Stat card HTML ──
    function statCardHTML(label, value, sub, color) {
      return `<div style="flex:1;min-width:120px;background:#f8fafc;border-radius:12px;padding:16px;border:1px solid #e2e8f0;position:relative;overflow:hidden;">
    <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${color};border-radius:12px 12px 0 0;"></div>
    <div style="font-size:10px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;">${label}</div>
    <div style="font-size:24px;font-weight:800;color:${color};line-height:1;">${value}</div>
    ${sub ? `<div style="font-size:10px;color:#94a3b8;margin-top:4px;">${sub}</div>` : ''}
  </div>`;
    }

    // ── Section title HTML ──
    function sectionHTML(title) {
      return `<div style="display:flex;align-items:center;gap:10px;margin:24px 0 16px;">
    <div style="width:4px;height:20px;background:linear-gradient(180deg,#3b82f6,#7c3aed);border-radius:2px;flex-shrink:0;"></div>
    <div style="font-size:14px;font-weight:700;color:#1e293b;letter-spacing:-.2px;">${title}</div>
    <div style="flex:1;height:1px;background:#e2e8f0;"></div>
  </div>`;
    }

    // ── Generate and print ──
    function generatePDF() {
      const s = PDF_S[pdfLang];

      // Gather data
      const allMsgsAll = sessions.flatMap(sx => sx.msgs);
      const userMsgsAll = allMsgsAll.filter(m => isUser(m.spk));
      const agentMsgsAll = allMsgsAll.filter(m => !isUser(m.spk));
      const sessWithUser = sessions.filter(sx => sx.msgs.some(m => isUser(m.spk))).length;
      const avgMsgs = sessions.length ? (allMsgsAll.length / sessions.length).toFixed(1) : 0;
      const spkIds = new Set(allMsgsAll.map(m => m.spkId).filter(Boolean));

      const allTs = allMsgsAll.map(m => m.ts).filter(Boolean).map(t => new Date(t)).filter(d => !isNaN(d));
      const tsMin = allTs.length ? new Date(Math.min(...allTs)) : null;
      const tsMax = allTs.length ? new Date(Math.max(...allTs)) : null;
      const fmtD = d => d ? d.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '—';

      // Language distribution
      const langCount = {};
      sessions.forEach(sx => {
        const umsgs = sx.msgs.filter(m => isUser(m.spk) && m.lang);
        if (!umsgs.length) return;
        const lc = {};
        umsgs.forEach(m => { lc[m.lang] = (lc[m.lang] || 0) + 1; });
        const dom = Object.entries(lc).sort((a, b) => b[1] - a[1])[0][0];
        langCount[dom] = (langCount[dom] || 0) + 1;
      });
      const langEntries = Object.entries(langCount).sort((a, b) => b[1] - a[1]);

      // Topic distribution
      const topicCount = {};
      aiResults.forEach(r => { const tk = resolveNoUser(r.topic, pdfLang); topicCount[tk] = (topicCount[tk] || 0) + 1; });
      const topTopics = Object.entries(topicCount).sort((a, b) => b[1] - a[1]).slice(0, 10);

      // Keyword distribution
      const kwCount = {};
      aiResults.forEach(r => {
        if (!r.kw) return;
        r.kw.split('、').forEach(k => { k = k.trim(); if (k) kwCount[k] = (kwCount[k] || 0) + 1; });
      });
      const topKw = Object.entries(kwCount).sort((a, b) => b[1] - a[1]).slice(0, 20);

      // Build HTML report
      const now = new Date().toLocaleString();

      // Extra stats for PDF
      const noInteractCount = sessions.filter(sx => !sx.msgs.some(m => isUser(m.spk))).length;
      const noInteractPct = ((noInteractCount / sessions.length) * 100).toFixed(1);
      const sessWithTs = sessions.filter(sx => sx.msgs.filter(m => m.ts).length >= 2);
      const avgDurMin = (() => {
        if (!sessWithTs.length) return null;
        const durs = sessWithTs.map(sx => {
          const ts = sx.msgs.map(m => m.ts).filter(Boolean).map(t => new Date(t)).filter(d => !isNaN(d));
          return (Math.max(...ts) - Math.min(...ts)) / 60000;
        }).filter(d => d < 120); // 排除超過 120 分鐘的異常值（用戶長時間未關閉視窗）
        if (!durs.length) return null;
        // 用中位數而非平均，更能反映典型對話時長
        const sorted = [...durs].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 ? sorted[mid].toFixed(1) : ((sorted[mid - 1] + sorted[mid]) / 2).toFixed(1);
      })();
      const avgReplySec = null;
      const escKws = ['請致電', '請聯繫', 'contact us', 'please call', 'お電話'];
      const unresKws = ['無法提供', '不支援', 'cannot', 'not available', '申し訳'];
      const escCount = sessions.filter(sx => sx.msgs.some(m => isAgent(m.spk) && escKws.some(k => m.cnt.toLowerCase().includes(k.toLowerCase())))).length;
      const unresCount = sessions.filter(sx => sx.msgs.some(m => isAgent(m.spk) && unresKws.some(k => m.cnt.toLowerCase().includes(k.toLowerCase())))).length;

      const reportHTML = `
<div style="font-family:'Hiragino Sans','Noto Sans CJK JP','Microsoft JhengHei','PingFang TC',sans-serif;color:#1e293b;background:#fff;max-width:794px;margin:0 auto;padding:10px 0;">

  <!-- Page 1: Overview + Language -->
  <div class="pr-page" style="padding-bottom:20px;">
    <!-- Cover header -->
    <div style="background:linear-gradient(135deg,#0f172a 0%,#1e3a8a 50%,#4c1d95 100%);color:#fff;padding:40px 36px;border-radius:16px;margin-bottom:28px;position:relative;overflow:hidden;">
      <div style="position:absolute;top:-30px;right:-30px;width:160px;height:160px;background:rgba(255,255,255,0.04);border-radius:50%;"></div>
      <div style="position:absolute;bottom:-20px;right:60px;width:100px;height:100px;background:rgba(255,255,255,0.06);border-radius:50%;"></div>
      <div style="font-size:10px;font-weight:600;letter-spacing:.15em;opacity:.6;text-transform:uppercase;margin-bottom:10px;">CONVERSATION ANALYTICS REPORT</div>
      <div style="font-size:26px;font-weight:800;letter-spacing:-.5px;margin-bottom:12px;line-height:1.2;">${s.title}</div>
      <div style="display:flex;gap:20px;font-size:11px;opacity:.7;">
        <span>📅 ${s.generated}：${now}</span>
        <span>📊 ${sessions.length} Sessions</span>
      </div>
    </div>

    ${includeInsight && (reportInsightText.highlights || reportInsightText.warnings || reportInsightText.suggestions) ? `
    <div style="margin-bottom:20px;background:#f8fafc;border-radius:12px;padding:20px;border:1px solid #e2e8f0;">
      <div style="font-size:14px;font-weight:700;color:#1e293b;margin-bottom:14px;">✨ AI 洞察摘要</div>
      ${reportInsightText.highlights ? `<div style="margin-bottom:10px;"><div style="font-size:10px;font-weight:700;color:#16a34a;letter-spacing:.06em;margin-bottom:4px;">✅ 亮點</div><div style="font-size:12px;color:#334155;line-height:1.7;white-space:pre-line;">${reportInsightText.highlights}</div></div>` : ''}
      ${reportInsightText.warnings ? `<div style="margin-bottom:10px;"><div style="font-size:10px;font-weight:700;color:#d97706;letter-spacing:.06em;margin-bottom:4px;">⚠️ 需注意</div><div style="font-size:12px;color:#334155;line-height:1.7;white-space:pre-line;">${reportInsightText.warnings}</div></div>` : ''}
      ${reportInsightText.suggestions ? `<div><div style="font-size:10px;font-weight:700;color:#2563eb;letter-spacing:.06em;margin-bottom:4px;">💡 建議</div><div style="font-size:12px;color:#334155;line-height:1.7;white-space:pre-line;">${reportInsightText.suggestions}</div></div>` : ''}
    </div>` : ''}

    ${sectionHTML(s.s1)}
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:10px;">
      ${statCardHTML(s.total_sessions, sessions.length, '', '#3b82f6')}
      ${statCardHTML(s.total_messages, allMsgsAll.length.toLocaleString(), '', '#22c55e')}
      ${statCardHTML(s.sess_with_user, sessWithUser, '/ ' + sessions.length + ' Sessions', '#a855f7')}
      ${statCardHTML(s.avg_msg, avgMsgs, '', '#f59e0b')}
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:10px;">
      ${statCardHTML(s.user_msg, userMsgsAll.length, '', '#06b6d4')}
      ${statCardHTML(s.agent_msg, agentMsgsAll.length, '', '#3b82f6')}
      ${spkIds.size > 0 ? statCardHTML(s.unique_users, spkIds.size, '', '#22c55e') : statCardHTML('—', '—', '', '#94a3b8')}
      ${statCardHTML(s.no_interact, noInteractPct + '%', noInteractCount + ' sessions', '#ef4444')}
    </div>
    ${(avgDurMin !== null || avgReplySec !== null) ? `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:10px;">
      ${avgDurMin !== null ? statCardHTML(s.avg_duration, avgDurMin, s.min_unit, '#f59e0b') : ''}

    </div>` : ''}
    ${tsMin ? '<div style="font-size:11px;color:#64748b;margin-top:6px;">📅 ' + s.data_range + '：' + fmtD(tsMin) + ' ～ ' + fmtD(tsMax) + '</div>' : ''}

    ${sectionHTML(s.s2)}
    <div style="display:flex;justify-content:center;">
      ${svgDonutChart(langEntries.map(e => e[0]), langEntries.map(e => e[1]),
        ['#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#06b6d4', '#ef4444'], s.lang_label)}
    </div>
  </div>

  <!-- Page 2: User Behavior -->
  <div class="pr-page" style="padding-bottom:20px;">
    ${sectionHTML(s.s3)}
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
      ${statCardHTML(s.no_interact, noInteractPct + '%', noInteractCount + ' / ' + sessions.length + ' sessions', '#ef4444')}
      ${statCardHTML(s.escalated, escCount, ((escCount / sessions.length) * 100).toFixed(1) + '%', '#f59e0b')}
      ${statCardHTML(s.unresolved, unresCount, ((unresCount / sessions.length) * 100).toFixed(1) + '%', '#ef4444')}
    </div>
    <!-- Visual bar rows -->
    <div style="background:#f8fafc;border-radius:12px;padding:16px;border:1px solid #e2e8f0;">
      ${[
          [s.no_interact, noInteractPct, '#ef4444'],
          [s.escalated, ((escCount / sessions.length) * 100).toFixed(1), '#f59e0b'],
          [s.unresolved, ((unresCount / sessions.length) * 100).toFixed(1), '#6366f1']
        ].map(([label, pct, color]) => `
        <div style="margin-bottom:12px;">
          <div style="display:flex;justify-content:space-between;font-size:11px;color:#475569;margin-bottom:4px;">
            <span style="font-weight:600;">${label}</span><span style="font-weight:700;color:${color};">${pct}%</span>
          </div>
          <div style="background:#e2e8f0;border-radius:4px;height:8px;overflow:hidden;">
            <div style="width:${Math.min(pct, 100)}%;height:100%;background:${color};border-radius:4px;"></div>
          </div>
        </div>`).join('')}
    </div>
  </div>

  <!-- Page 3: Topic + Keyword -->
  <div class="pr-page" style="padding-bottom:20px;">
    ${sectionHTML(s.s4)}
    <div style="display:flex;justify-content:center;">
      ${svgBarChart(topTopics.map(e => e[0]), topTopics.map(e => e[1]), '#6366f1', s.topic_label)}
    </div>

    ${sectionHTML(s.s5)}
    <div style="display:flex;justify-content:center;">
      ${svgBarChart(topKw.map(e => e[0]), topKw.map(e => e[1]), '#f59e0b', s.keyword_label)}
    </div>
  </div>

</div>`;

      // Open report in a new tab for preview — user prints manually or saves as PDF
      const printStyles = `
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Hiragino Sans','Noto Sans CJK JP','Microsoft JhengHei','PingFang TC',sans-serif;
             color:#1e293b; background:#f1f5f9; }
      .report-wrap { max-width: 794px; margin: 0 auto; background:#fff;
                     padding: 28px 32px; box-shadow: 0 4px 24px rgba(0,0,0,.12); }
      .print-bar { position: sticky; top: 0; z-index: 99;
                   background: #1e293b; color: #fff; padding: 10px 24px;
                   display: flex; align-items: center; gap: 14px;
                   font-family: system-ui, sans-serif; font-size: 13px; }
      .print-bar button {
        padding: 7px 18px; border: none; border-radius: 6px; cursor: pointer;
        font-size: 13px; font-weight: 600; }
      .print-btn { background: #6366f1; color: #fff; }
      .close-btn { background: #374151; color: #e5e7eb; }
      .print-hint { color: #94a3b8; font-size: 11px; }
      @media print {
        .print-bar { display: none !important; }
        body { background: #fff; }
        .report-wrap { box-shadow: none; padding: 0; }
        @page { size: A4 portrait; margin: 18mm 18mm 20mm 18mm; }
        .pr-page { page-break-after: always; }
        .pr-page:last-child { page-break-after: avoid; }
        .no-break { page-break-inside: avoid; }
      }
    </style>`;

      const fullPage = `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>${s.title}</title>${printStyles}</head><body>
    <div class="print-bar">
      <span>📄 ${s.title}</span>
      <button class="print-btn" onclick="window.print()" id="ui-btnPrint">🖨 另存為 PDF / 列印</button>
      <button class="close-btn" onclick="window.close()" id="ui-btnClose">✕ 關閉</button>
      <span class="print-hint">提示：列印時選「另存為 PDF」，建議開啟「背景圖形」選項</span>
    </div>
    <div class="report-wrap">${reportHTML}</div>
  </body></html>`;

      const blob = new Blob([fullPage], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      closePdfModal();
    }
