from fastapi import FastAPI, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import os
import pandas as pd
import io
import re
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

STOP_JA = {"ます", "です", "ませ", "ません", "ください", "ございます", "いただき", "おり", "れる", "いる", "ある", "する", "なる", "こと", "ため", "など", "この", "その", "これ", "それ", "てい", "まし", "まで", "まま", "ようこそ", "なぎさ", "コンシェルジュ", "お客様", "当リゾート", "ゴルフリゾート", "瀬戸内", "リゾート", "ゴルフ"}
STOP_ZH = {"的", "了", "是", "在", "我", "你", "有", "没有", "可以", "不", "也", "都", "和", "瀨戶內", "高爾夫", "度假村", "禮賓", "您好", "請問", "謝謝", "可以", "這是", "那是"}
STOP_EN = {"the", "and", "for", "you", "your", "that", "this", "with", "have", "from", "are", "can", "will", "please", "thank", "what", "how", "yes", "not", "but", "hotel", "resort", "golf"}

TOPIC_RULES = [
    (["フェアウェイフロントヴィラ", "Fairway Front Villa", "コースに泊"], "フェアウェイフロントヴィラの宿泊に関する問い合わせ"),
    (["貸切露天風呂", "露天風呂", "温泉", "スパ", "サウナ", "溫泉", "spa", "onsen"], "温泉・スパプランに関する問い合わせ"),
    (["竹原散策", "竹原", "観光", "散策", "周辺スポット"], "竹原観光・周辺スポットに関する問い合わせ"),
    (["月例", "競技", "大会", "トーナメント", "杯"], "ゴルフ競技・月例杯に関する問い合わせ"),
    (["初心者", "初めて", "beginner", "初學者"], "初心者向けゴルフ情報に関する問い合わせ"),
    (["アメニティ", "設備", "充電", "Wi-Fi", "wifi", "タオル"], "ヴィラ設備・アメニティに関する問い合わせ"),
    (["アクセス", "行き方", "交通", "駐車", "バス", "電車", "新幹線", "飛行機", "access", "parking", "shuttle", "地點", "怎麼去"], "アクセス・交通に関する問い合わせ"),
    (["荷物", "手荷物", "宅配", "luggage", "baggage"], "手荷物・宅配サービスに関する問い合わせ"),
    (["レストラン", "食事", "ランチ", "ディナー", "朝食", "夕食", "料理", "メニュー", "昼食", "breakfast", "dinner", "food", "menu", "菜單", "早餐", "餐廳"], "レストラン・食事に関する問い合わせ"),
    (["宿泊", "チェック", "客室", "部屋", "ヴィラ", "villa", "room", "住宿", "客房"], "宿泊施設に関する問い合わせ"),
    (["予約", "キャンセル", "変更", "空き", "booking", "reserve", "cancel", "reservation", "預訂", "取消"], "予約・キャンセルに関する問い合わせ"),
    (["料金", "価格", "費用", "値段", "割引", "クーポン", "fee", "price", "cost", "費用", "價格", "金額"], "料金・価格に関する問い合わせ"),
    (["天気", "雨", "晴れ", "気温", "weather", "rain"], "天気に関する問い合わせ"),
    (["グリーン", "ベントグリーン", "フェアウェイ", "バンカー", "パット", "ティー", "スコア", "球道", "果嶺"], "ゴルフコース・技術に関する問い合わせ"),
    (["ドレスコード", "マナー", "服装", "dress code"], "ドレスコード・マナーに関する問い合わせ"),
    (["中文", "繁體", "簡體", "Chinese", "講中文", "英語", "language"], "言語対応に関する問い合わせ"),
    (["ゴルフ", "コース", "プレー", "ラウンド", "クラブ", "高爾夫", "球場"], "ゴルフコース全般に関する問い合わせ"),
    (["プラン", "パッケージ", "セット", "plan", "package", "企劃", "套餐"], "リゾートプランに関する問い合わせ")
]

def detect_lang(text):
    if not text or not isinstance(text, str):
        return "未知"
    jp = len(re.findall(r"[぀-ヿㇰ-ㇿ]", text))
    zh = len(re.findall(r"[一-鿿]", text))
    en = len(re.findall(r"[a-zA-Z]", text))
    total = jp + zh + en
    if total == 0:
        return "其他"
    if jp / total > 0.15:
        return "日文"
    if zh / total > 0.25:
        return "中文"
    if en / total > 0.5:
        return "英文/其他"
    if zh > 0:
        return "中文"
    return "其他"

def detect_topic(user_texts, all_text):
    user_str = " ".join(user_texts)
    for kw_list, label in TOPIC_RULES:
        if any(kw in user_str for kw in kw_list):
            return label
    for kw_list, label in TOPIC_RULES:
        if any(kw in all_text for kw in kw_list):
            return label
    return "一般的な問い合わせ"

def extract_keywords(texts, top_n=5):
    combined = " ".join(texts)
    words = []
    for m in re.finditer(r"[ァ-ヶー]{2,}", combined):
        words.append(m.group(0))
    for m in re.finditer(r"[\u4e00-\u9fff]{2,4}", combined):
        words.append(m.group(0))
    for m in re.finditer(r"[a-zA-Z]{4,}", combined):
        w = m.group(0)
        if w.lower() not in STOP_EN:
            words.append(w)
            
    filtered = [w for w in words if len(w) >= 2 and w not in STOP_JA and w not in STOP_ZH]
    cnt = {}
    for w in filtered:
        cnt[w] = cnt.get(w, 0) + 1
    sorted_words = sorted(cnt.items(), key=lambda x: x[1], reverse=True)
    return [w[0] for w in sorted_words[:top_n]]

from backend.stats_engine import compute_stats

@app.post("/api/analyze")
async def analyze(
    file: UploadFile = File(...),
    colSessionId: int = Form(...),
    colSpeaker: int = Form(...),
    colContent: int = Form(...),
    colTimestamp: int = Form(-1),
    colSpeakerId: int = Form(-1),
    colLength: int = Form(-1),
    excludeKeywords: str = Form("[]")
):
    contents = await file.read()
    try:
         df = pd.read_csv(io.StringIO(contents.decode("utf-8-sig")))
    except Exception as e:
         return JSONResponse(status_code=400, content={"error": str(e)})

    # we need to build sessions
    exclude_list = json.loads(excludeKeywords)

    sessions_map = {}
    order = []
    
    for _, row in df.iterrows():
        try:
             id_val = str(row.iloc[colSessionId]).strip() if colSessionId >= 0 else None
             spk = str(row.iloc[colSpeaker]).strip() if colSpeaker >= 0 else None
             cnt = str(row.iloc[colContent]).strip() if colContent >= 0 else ""
             if colContent >= 0 and pd.isna(row.iloc[colContent]):
                 cnt = ""
        except IndexError:
             continue
        if not id_val or not spk or id_val == "nan" or spk == "nan":
             continue
        
        if id_val not in sessions_map:
             sessions_map[id_val] = {"id": id_val, "msgs": []}
             order.append(id_val)
             
        ts = str(row.iloc[colTimestamp]).strip() if colTimestamp >= 0 else ""
        if ts == "nan": ts = ""
        spk_id = str(row.iloc[colSpeakerId]).strip() if colSpeakerId >= 0 else ""
        if spk_id == "nan": spk_id = ""
        
        raw_len = None
        if colLength >= 0:
            try:
                raw_len = int(row.iloc[colLength])
            except:
                pass

        lang = detect_lang(cnt)
        sessions_map[id_val]["msgs"].append({
            "spk": spk,
            "spkId": spk_id,
            "cnt": cnt,
            "lang": lang,
            "ts": ts,
            "length": raw_len if raw_len is not None else len(cnt)
        })

    exclude_ids = set()
    for s_id in order:
        s = sessions_map[s_id]
        for m in s["msgs"]:
            if m["spk"].upper() == "USER":
                if any(kw.lower() in m["cnt"].lower() for kw in exclude_list):
                    exclude_ids.add(s_id)
                    break

    sessions = []
    ai_results = []
    
    for s_id in order:
        if s_id in exclude_ids:
            continue
            
        s = sessions_map[s_id]
        msg_lines = [f"[{m['spk']}]: {m['cnt']}" for m in s["msgs"]]
        full_convo = "\n".join(msg_lines)
        convo_preview = "\n".join([f"[{m['spk']}]: {str(m['cnt'])[:300]}" for m in s["msgs"]])[:1500]
        
        sessions.append({
            "id": s_id,
            "n": len(s["msgs"]),
            "msgs": s["msgs"],
            "full_convo": full_convo,
            "convo_preview": convo_preview
        })
        
        user_msgs = [m["cnt"] for m in s["msgs"] if m["spk"].upper() == "USER"]
        if not user_msgs:
            ai_results.append({
                "id": s_id,
                "n": len(s["msgs"]),
                "topic": "__NO_USER__",
                "kw": "",
                "full_convo": full_convo
            })
        else:
            all_text = " ".join([m["cnt"] for m in s["msgs"]])
            topic = detect_topic(user_msgs, all_text)
            kw = "、".join(extract_keywords(user_msgs))
            ai_results.append({
                "id": s_id,
                "n": len(s["msgs"]),
                "topic": topic,
                "kw": kw,
                "full_convo": full_convo
            })
            
    stats = compute_stats(sessions, ai_results)
    return {"sessions": sessions, "aiResults": ai_results, "stats": stats}

from anthropic import Anthropic
@app.post("/api/insights")
async def generate_insights(req: Request):
    data = await req.json()
    apiKey = data.get("apiKey")
    stats = data.get("stats", {})
    
    if not apiKey:
        return JSONResponse(status_code=401, content={"error": "Missing API Key"})
        
    ov = stats.get("overview", {})
    ai = stats.get("ai", {})
    lang_dict = stats.get("language", {}).get("sessLangCount", {})
    
    sess_with_user = ov.get("sessWithUser", 1)
    if sess_with_user == 0: sess_with_user = 1
    
    # Sort language entries by count descending
    sorted_langs = sorted(lang_dict.items(), key=lambda x: x[1], reverse=True)
    lang_str = "、".join([f"{k} {int(v/sess_with_user*100)}%" for k, v in sorted_langs if k != "無用戶互動"])
    
    med_dur = ov.get("avgDurMin")
    top_kw = "、".join([k[0] for k in ai.get("topKeywords", [])[:8]])
    top_topics = "、".join([t[0] for t in ai.get("topTopics", [])[:5]])
    
    total_sess = ov.get("totalSessions", 1)
    pct = int(ov.get("sessWithUser", 0) / max(1, total_sess) * 100)
    
    prompt = f"""你是一位 AI 客服數據分析師。以下是一份 AI Agent 對話數據摘要，請用繁體中文生成簡短的分析洞察。

數據摘要：
- 總 Sessions：{total_sess}，有用戶互動：{ov.get('sessWithUser', 0)}（{pct}%）
- 無互動率：{ov.get('noInteractPct', 0)}%（{ov.get('noInteractCount', 0)} sessions）
- 主要語言分布：{lang_str}
- 對話時長中位數：{med_dur if med_dur is not None else '無法計算'} 分鐘
- 熱門關鍵詞：{top_kw}
- 熱門主題：{top_topics}

請以以下 JSON 格式回覆，每個區塊 1-2 點，每點一句話，不超過 40 字：
{{
  "highlights": "亮點內容（用換行分隔多點）",
  "warnings": "需注意內容（用換行分隔多點）",
  "suggestions": "建議內容（用換行分隔多點）"
}}

只回傳 JSON，不要加任何說明。"""

    client = Anthropic(api_key=apiKey)
    try:
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=600,
            messages=[{"role": "user", "content": prompt}]
        )
        text = response.content[0].text
        return {"text": text.strip().replace("```json", "").replace("```", "").strip()}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend")
app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")

