# 📊 Bunk Calculator: GEHU Attendance Intelligence

**Bunk Calculator** is a native Android application and browser extension designed for students of **Graphic Era Hill University (GEHU)**[cite: 1]. It serves as an intelligent layer that sits on top of the university's legacy ERP portal, transforming flat data into actionable attendance insights[cite: 1].
<p align="center">
  <img src="WhatsApp Image 2026-05-04 at 6.17.48 PM.jpeg"  width="500">
  <br>
  
</p><p align="center">
  <img src="Screenshot 2026-05-04 180907.png"  width="500">
  <br>
  
</p>
<p align="center">
  <img src="WhatsApp Image 2026-05-04 at 6.27.25 PM.jpeg"  width="500">
  <br>
</p>
---

## 🚀 The Problem & Solution
The current GEHU ERP portal is a navigation-heavy web application that lacks visual summaries or forecasting tools[cite: 1]. Students often struggle to calculate if they can safely skip a class while staying above the mandatory **75% threshold**[cite: 1].

Bunk Calculator answers these questions instantly by reverse-engineering the ERP's private API and providing a gamified, real-time dashboard[cite: 1].

---

## ✨ Key Features
*   **Automatic Sync:** Inherits your existing authenticated ERP session via WebView—no secondary login required[cite: 1].
*   **Real-time Bunk Credits:** Tells you exactly how many more classes you can skip for each subject[cite: 1].
*   **Recovery Estimator:** Calculates the number of consecutive classes needed to return to a safe 75% standing[cite: 1].
*   **Gamified UI:** Features a "Bunk Meter" with color-coded status badges (Safe 🟢, OK 🔵, Risk 🟡, Danger 🔴)[cite: 1].
*   **Pulsing FAB Button:** A floating action button that pulses to remind you that your attendance metrics are always one tap away[cite: 1].

---

## 🛠️ Technical Architecture
The system operates as a **three-layer stack**[cite: 1]:
1.  **Android Host (Kotlin):** Manages the WebView container, cookie persistence, and native navigation[cite: 1].
2.  **WebView (Chromium Engine):** Renders the official ERP portal (`student.gehu.ac.in`)[cite: 1].
3.  **JavaScript Injection Layer:** A non-invasive overlay that fetches data from the ERP API and renders a high-end UI using **ES2020+ and CSS3 animations**[cite: 1].

---

## 🧠 Core Algorithms

### 1. Safe Bunk Calculation
Calculates the maximum buffer of skip-able classes[cite: 1]:
$$\text{Bunks} = \lfloor (\text{Attended} / 0.75) - \text{Total} \rfloor$$

### 2. Recovery Calculation
Calculates the number of consecutive classes required to reach 75%[cite: 1]:
$$\text{Needed} = \lceil (0.75 \times \text{Total} - \text{Attended}) / 0.25 \rceil$$

---

## 📂 Extension Views


<p align="center">
  <img src="Screenshot 2026-05-04 182947.png"  width="500">
  <br>
</p>
The extension provides three unique perspectives on your semester[cite: 1]:
*   **Overview Tab:** All subjects with percentage bars and dual chips (Bunk/Needed)[cite: 1].
*   **Bunk Tab:** Sorted by subjects with the highest buffer—perfect for planning absences[cite: 1].
*   **Needed Tab:** Filters out healthy subjects to focus solely on those requiring immediate recovery[cite: 1].

---

## 🔐 Security & Ethical Model
*   **No Data Exfiltration:** All calculations and data processing occur locally on the client-side[cite: 1].
*   **Credential Safety:** User passwords are entered directly into the ERP login form; the app never touches or stores them[cite: 1].
*   **Read-Only Access:** The app only visualizes existing records; it cannot modify or falsify attendance data[cite: 1].

---
**Version 1.0** | *Developed by Divyanshu Kaprawan (2026)*[cite: 1]  
**GEHU ERP Enhancer Project**[cite: 1]
