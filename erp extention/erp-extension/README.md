# 📊 GEHU ERP Enhancer v2.0

A Chrome extension that adds a smart attendance dashboard to the GEHU ERP portal with:
- **Bunk Calculator** — subject-wise safe bunk count
- **Classes Needed** — how many classes to attend per subject to reach 75%
- Live progress bars, status chips, and summary stats

---

## 🔌 Installation

1. Open Chrome → `chrome://extensions/`
2. Enable **Developer Mode** (top-right toggle)
3. Click **Load Unpacked**
4. Select the `erp-extension/` folder
5. Visit **https://student.gehu.ac.in** and log in
6. Click the **📊 button** in the bottom-right corner

---

## 🧠 Features

| Feature | Description |
|---|---|
| Overview | All subjects with attendance % and progress bars |
| Bunk Calc | How many classes can safely be skipped (per subject) |
| Classes Needed | How many classes to attend to hit 75% (per subject) |
| Summary Stats | Average attendance, total safe bunks, subjects below 75% |
| Auto-Refresh | Pulls live data from ERP session — no login needed |

---

## ⚙️ How It Works

- Uses `credentials: "include"` so your existing ERP session cookie is sent automatically
- Calls `POST /Student/GetSubjectDetailStudentAcademicFromLive`
- Parses the nested JSON string in `data.state`
- All calculations happen locally in the browser

### Formulas

**Safe Bunks** (how many can I skip and stay ≥ 75%):
```
safeBunks = floor(attended / 0.75 − total)
```

**Classes Needed** (how many must I attend to reach 75%):
```
needed = ceil((0.75 × total − attended) / 0.25)
```

---

## ⚠️ Notes

- Works only when you're logged into the ERP
- For educational use only — respects university policies
- No data is sent anywhere; everything runs locally
