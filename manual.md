# AI Avatar Conversation Dashboard - 部署手冊

這份文件將引導您如何從零開始，在一個乾淨的環境中部署並執行此對話資料分析儀表板（Conversation Analytics Dashboard）。

## 系統需求

在開始之前，請確保您的系統已安裝以下軟體：
- **Python 3.11 或以上版本**
- **Git**

---

## 步驟一：取得專案與準備環境

1. **複製專案到本地端**
   在終端機中執行以下指令，將專案下載到您的電腦（如果是您的私有庫，請替換為正確的 git 網址）：
   ```bash
   git clone <你的專案_GitHub_URL>
   cd <你的專案資料夾名稱>
   ```

2. **建立 Python 虛擬環境**
   為了避免套件衝突，強烈建議在專案資料夾下建立一個專屬的虛擬環境：
   ```bash
   # 建立名為 .venv 的虛擬環境
   python3 -m venv .venv
   ```

3. **啟動虛擬環境**
   根據您的作業系統，啟動指令會有所不同：
   - **macOS / Linux**:
     ```bash
     source .venv/bin/activate
     ```
   - **Windows (Command Prompt)**:
     ```cmd
     .venv\Scripts\activate.bat
     ```
   - **Windows (PowerShell)**:
     ```powershell
     .venv\Scripts\Activate.ps1
     ```
   > 啟動成功後，您的終端機提示字元前面應該會多出一個 `(.venv)` 的標記。

---

## 步驟二：安裝相依套件

確認虛擬環境已經啟動後，安裝本專案所需的所有 Python 套件（包含 FastAPI, Uvicorn, Pandas, Anthropic 等）。

```bash
pip install --upgrade pip
pip install -r requirements.txt
```
*(註：我們已經為您產生了 `requirements.txt` 以確保套件版本的一致性。)*

---

## 步驟三：啟動後端伺服器

本專案採用前後端分離的概念，但由 FastAPI 統一伺服靜態網頁與 API 端點。
請在專案的根目錄下（確認終端機仍在虛擬環境中）執行以下指令來啟動伺服器：

```bash
uvicorn backend.main:app --port 8000
```

- 如果您在**開發階段**，可以加上 `--reload` 參數，這樣只要修改程式碼，伺服器就會自動重啟：
  ```bash
  uvicorn backend.main:app --port 8000 --reload
  ```

---

## 步驟四：開啟網頁儀表板

當伺服器啟動成功後，終端機中會顯示類似以下的訊息：
`INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)`

此時，請打開您的網頁瀏覽器，並輸入以下網址：
**[http://127.0.0.1:8000](http://127.0.0.1:8000)**

您將會看到儀表板的初始畫面。

### 測試功能：
1. 將準備好的對話紀錄 CSV 拖曳到畫面中。
2. 確認欄位對應正確，點擊「✓ 確認載入」。
3. 產生 AI 洞察摘要：切換到任何一個有 AI 報告按鈕的頁面，點擊「✨ 產生 AI 洞察摘要」，輸入您的 Anthropic Claude API Key 進行測試。

---

## 常見問題與除錯 (Troubleshooting)

- **Q: 遇到 `Address already in use` 錯誤？**
  這代表 8000 port 已經被其他程式（或是先前未關閉的伺服器）佔用。請在終端機按下 `Ctrl + C` 終止先前的程序，或是換一個 port 啟動：
  ```bash
  uvicorn backend.main:app --port 8080
  ```

- **Q: 顯示 `ModuleNotFoundError`？**
  請確認您已經啟動了虛擬環境 (`source .venv/bin/activate`) 並且已經執行過 `pip install -r requirements.txt`。

- **Q: AI 分析功能出現 API 錯誤？**
  請確認您輸入的 Claude API Key 是否正確且有效，並確認您的網路連線正常。API 金鑰只會存儲在您瀏覽器的 LocalStorage 中，您可以隨時在瀏覽器開發者工具中清除它。
