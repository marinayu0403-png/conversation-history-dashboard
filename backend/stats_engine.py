import math
from dateutil.parser import parse as parse_date
from collections import Counter, defaultdict
import json

def parse_ts(ts_str):
    if not ts_str:
        return None
    try:
        return parse_date(ts_str)
    except:
        return None

def compute_stats(sessions, ai_results):
    all_msgs = []
    for s in sessions:
        all_msgs.extend(s["msgs"])
        
    agent_msgs = [m for m in all_msgs if m["spk"].upper() == "AGENT"]
    user_msgs = [m for m in all_msgs if m["spk"].upper() == "USER"]
    
    unique_users = len(set([m["spkId"] for m in user_msgs if m.get("spkId")]))
    sess_with_user = len([s for s in sessions if any(m["spk"].upper() == "USER" for m in s["msgs"])])
    avg_msgs = round(len(all_msgs) / len(sessions), 1) if sessions else 0
    
    # Date Range
    all_ts = [parse_ts(m.get("ts")) for m in all_msgs]
    all_ts = [t for t in all_ts if t]
    ts_min = min(all_ts).isoformat() if all_ts else None
    ts_max = max(all_ts).isoformat() if all_ts else None
    
    # Duration Medians
    durations = []
    sess_durations = {}
    for s in sessions:
        s_ts = [parse_ts(m.get("ts")) for m in s["msgs"]]
        s_ts = [t for t in s_ts if t]
        if len(s_ts) >= 2:
            duration_min = (max(s_ts) - min(s_ts)).total_seconds() / 60.0
            durations.append({"id": s["id"], "min": duration_min})
            sess_durations[s["id"]] = duration_min

    dur_normal = [d for d in durations if d["min"] < 30]
    dur_outliers = sorted([d for d in durations if d["min"] >= 30], key=lambda x: x["min"], reverse=True)
    
    avg_dur_min = None
    if dur_normal:
        sorted_mins = sorted([d["min"] for d in dur_normal])
        mid = len(sorted_mins) // 2
        if len(sorted_mins) % 2 == 1:
            avg_dur_min = round(sorted_mins[mid], 1)
        else:
            avg_dur_min = round((sorted_mins[mid - 1] + sorted_mins[mid]) / 2.0, 1)

    no_interact_count = len([s for s in sessions if not any(m["spk"].upper() == "USER" for m in s["msgs"])])
    no_interact_pct = round((no_interact_count / len(sessions) * 100), 1) if sessions else 0

    # Msg distribution
    msg_bins = [0] * 7 # '1', '2-4', '5-9', '10-19', '20-49', '50-99', '100+'
    for s in sessions:
        n = s["n"]
        if n == 1: msg_bins[0] += 1
        elif n <= 4: msg_bins[1] += 1
        elif n <= 9: msg_bins[2] += 1
        elif n <= 19: msg_bins[3] += 1
        elif n <= 49: msg_bins[4] += 1
        elif n <= 99: msg_bins[5] += 1
        else: msg_bins[6] += 1

    # Languages
    lang_count = Counter()
    for m in user_msgs:
        lang_count[m.get("lang") or "未知"] += 1
        
    sess_lang_count = Counter()
    lang_len_map = defaultdict(lambda: {"u": [], "a": []})
    
    for s in sessions:
        u_msgs = [m for m in s["msgs"] if m["spk"].upper() == "USER"]
        if not u_msgs:
            sess_lang_count["無用戶互動"] += 1
            continue
        
        lc = Counter([m.get("lang") or "未知" for m in u_msgs])
        dom_lang = lc.most_common(1)[0][0]
        sess_lang_count[dom_lang] += 1
        
        for m in s["msgs"]:
            if m.get("length"):
                if m["spk"].upper() == "USER":
                    lang_len_map[dom_lang]["u"].append(m["length"])
                elif m["spk"].upper() == "AGENT":
                    lang_len_map[dom_lang]["a"].append(m["length"])
                    
    lang_len_user_avg = {}
    lang_len_agent_avg = {}
    for l, data in lang_len_map.items():
        lang_len_user_avg[l] = round(sum(data["u"])/len(data["u"])) if data["u"] else 0
        lang_len_agent_avg[l] = round(sum(data["a"])/len(data["a"])) if data["a"] else 0

    # Time distributions
    hour_counts = [0] * 24
    day_counts = [0] * 7 # Sun = 0, Mon = 1, etc. (JS Date.getDay())
    dur_bin_counts = [0] * 6 # '<1min', '1-3min', '3-5min', '5-10min', '10-20min', '>20min'
    
    for s in sessions:
        s_ts = [parse_ts(m.get("ts")) for m in s["msgs"]]
        s_ts = [t for t in s_ts if t]
        if s_ts:
            start_ts = min(s_ts)
            hour_counts[start_ts.hour] += 1
            # Python weekday(): Monday is 0 and Sunday is 6.
            # JS getDay(): Sunday is 0, Monday is 1.
            js_day = (start_ts.weekday() + 1) % 7
            day_counts[js_day] += 1
            
        if s["id"] in sess_durations:
            dm = sess_durations[s["id"]]
            if dm < 1: dur_bin_counts[0] += 1
            elif dm < 3: dur_bin_counts[1] += 1
            elif dm < 5: dur_bin_counts[2] += 1
            elif dm < 10: dur_bin_counts[3] += 1
            elif dm < 20: dur_bin_counts[4] += 1
            else: dur_bin_counts[5] += 1

    # Reply speeds
    reply_speeds = []
    lang_reply_speeds = defaultdict(list)
    for s in sessions:
        # Determine dominant language
        u_msgs = [m for m in s["msgs"] if m["spk"].upper() == "USER"]
        if u_msgs:
            dom_lang = Counter([m.get("lang") or "未知" for m in u_msgs]).most_common(1)[0][0]
        else:
            dom_lang = "無用戶互動"
            
        last_user_ts = None
        for m in s["msgs"]:
            t = parse_ts(m.get("ts"))
            if not t: continue
            if m["spk"].upper() == "USER":
                last_user_ts = t
            elif m["spk"].upper() == "AGENT" and last_user_ts:
                diff = (t - last_user_ts).total_seconds()
                if 0 <= diff <= 600:
                    reply_speeds.append(diff)
                    lang_reply_speeds[dom_lang].append(diff)
                last_user_ts = None # Only count first reply
                
    overall_avg_reply = round(sum(reply_speeds) / len(reply_speeds), 1) if reply_speeds else None
    
    reply_bins = [0] * 6 # '<5s', '5-15s', '15-30s', '30-60s', '1-3min', '>3min'
    for diff in reply_speeds:
        if diff < 5: reply_bins[0] += 1
        elif diff < 15: reply_bins[1] += 1
        elif diff < 30: reply_bins[2] += 1
        elif diff < 60: reply_bins[3] += 1
        elif diff < 180: reply_bins[4] += 1
        else: reply_bins[5] += 1

    lang_avg_reply = {l: round(sum(arr)/len(arr), 1) for l, arr in lang_reply_speeds.items() if arr}

    # Behavior
    esc_kws = ['請致電', '請聯繫', '請電話', '請撥打', '請洽', 'contact us', 'please call', 'call us', 'お電話', 'お問い合わせ']
    unres_kws = ['無法提供', '不支援', '無提供', '目前沒有', '無此服務', '超出範圍', 'cannot', 'not available', '申し訳', '対応できません', 'ご対応']
    
    esc_count = 0
    unres_count = 0
    
    for s in sessions:
        is_esc = False
        is_unres = False
        for m in s["msgs"]:
            if m["spk"].upper() == "AGENT":
                cnt_lower = m["cnt"].lower()
                if not is_esc and any(k.lower() in cnt_lower for k in esc_kws):
                    is_esc = True
                if not is_unres and any(k.lower() in cnt_lower for k in unres_kws):
                    is_unres = True
        if is_esc: esc_count += 1
        if is_unres: unres_count += 1

    # Return Users
    spk_map = defaultdict(list)
    for s in sessions:
        ids = [m["spkId"] for m in s["msgs"] if m["spk"].upper() == "USER" and m.get("spkId")]
        if ids:
            spk_map[ids[0]].append(s["id"])
            
    return_users = []
    for spk_id, sids in spk_map.items():
        if len(sids) > 1:
            # calculate total user msgs
            total_msgs = sum(1 for s in sessions if s["id"] in sids for m in s["msgs"] if m["spk"].upper() == "USER")
            return_users.append({
                "spkId": spk_id,
                "sessions": sids,
                "nSess": len(sids),
                "totalMsgs": total_msgs
            })
            
    return_users = sorted(return_users, key=lambda x: x["nSess"], reverse=True)[:10]

    # Topics and Keywords
    topic_count = Counter()
    kw_count = Counter()
    for r in ai_results:
        if r["topic"] != "__NO_USER__":
            topic_count[r["topic"]] += 1
        if r.get("kw"):
            kws = [k.strip() for k in r["kw"].split("、") if k.strip()]
            for k in kws:
                kw_count[k] += 1
                
    return {
        "overview": {
            "totalSessions": len(sessions),
            "totalMsgs": len(all_msgs),
            "sessWithUser": sess_with_user,
            "avgMsgs": avg_msgs,
            "userMsgs": len(user_msgs),
            "agentMsgs": len(agent_msgs),
            "uniqueUsers": unique_users,
            "noInteractPct": no_interact_pct,
            "noInteractCount": no_interact_count,
            "tsMin": ts_min,
            "tsMax": ts_max,
            "avgDurMin": avg_dur_min,
            "durOutlierCount": len(dur_outliers),
            "durOutlierIds": [d["id"] for d in dur_outliers[:10]]
        },
        "msgDistChart": msg_bins,
        "language": {
            "langCount": dict(lang_count),
            "sessLangCount": dict(sess_lang_count),
            "langLenUserAvg": lang_len_user_avg,
            "langLenAgentAvg": lang_len_agent_avg
        },
        "time": {
            "hourCounts": hour_counts,
            "dayCounts": day_counts,
            "durBinCounts": dur_bin_counts,
            "avgReplySpeed": overall_avg_reply,
            "replyBins": reply_bins,
            "langAvgReply": lang_avg_reply
        },
        "behavior": {
            "escCount": esc_count,
            "unresCount": unres_count,
            "returnUsers": return_users
        },
        "ai": {
            "topTopics": [list(x) for x in topic_count.most_common(10)],
            "topKeywords": [list(x) for x in kw_count.most_common(20)]
        }
    }
