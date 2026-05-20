# CarbonTrust AI: Satellite-Driven Carbon Verification Pipeline & Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Python Version](https://img.shields.io/badge/python-3.9%20%7C%203.10%20%7C%203.11-blue.svg)](https://www.python.org/)
[![React Version](https://img.shields.io/badge/react-18.x-cyan.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/vite-5.x-purple.svg)](https://vite.dev/)

**Live Production Link:** [carbon-pipeline.vercel.app](https://carbon-pipeline.vercel.app/)

CarbonTrust AI is an enterprise-grade, end-to-end remote-sensing pipeline and interactive analytics dashboard designed to verify, monitor, and assess geopolitical risks for international carbon offset projects. 

By integrating Sentinel-2 satellite imagery with World Bank political stability indices, CarbonTrust AI provides carbon asset aggregators, developers, and buyers with transparent, real-time verification of green assets.

---

## 1. Features

### 🛰️ Satellite Remote Sensing & NDVI Ingestion
* **Cloud-Filtered Sentinel Integration:** Fetches multispectral imagery directly from Sentinel Hub API (Sentinel-2 L2A).
* **High-Resolution NDVI Calculation:** Leverages a custom, pixel-level cloud-masking Javascript Evalscript to measure Normalized Difference Vegetation Index (NDVI) at 10-meter spatial resolution, filtering out cloud-covered anomalies.
* **Smart Buffering:** Handles multi-point polygon coordinates dynamically via Bounding Boxes (`BBox`).

### 📊 Geopolitical Risk Modeling
* **World Bank Integration:** Dynamically crawls, parses, and scales the official World Bank Political Stability dataset.
* **Automated Risk Scores:** Translates country-level macroeconomic risk coefficients into a localized offset risk indicator (scale of `0` to `100`, where lower is better) on every pipeline execution.

### 🔄 Retroactive Backfill Pipeline
* **Historical Reconstruction:** Ingests and processes 24 months of monthly historical NDVI measurements retroactively for newly registered reforestation sites.
* **State Flag Tracking:** Employs atomic state checks (`historical_data_filled`) in the database to prevent duplicate historical calls and optimize Sentinel Hub API usage.

### 💻 Dual-Role Executive Dashboard
* **Buyer Experience:** Access to interactive carbon offset portfolios, historical verification trends, and a customized carbon footprint calculator to compute and match offset requirements.
* **Admin & Aggregator Control:** Full control panel to register projects, review automated satellite verification statuses, audit geopolitical risk assessments, and inspect NDVI data logs.

---

## 2. Installation

Ensure you have **Node.js (v18+)**, **Python (v3.9+)**, and a **Supabase** account ready.

### A. Python Backend Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/Khusheemaru/carbon-pipeline.git
   cd carbon-pipeline
   ```

2. Create and activate a virtual environment:
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install required libraries:
   ```bash
   pip install -r requirements.txt
   ```

4. Download your World Bank global stability dataset and locate it in the root pipeline directory:
   `API_PV.EST_DS2_en_csv_v2_1023320/political_stability.csv`

### B. React Frontend Setup
1. Navigate to the frontend project folder:
   ```bash
   cd carbon-trust-ui/carbon-trust-dash-main
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## 3. Environment Variables

Create a `.env` file in the **root** folder of your directory. Use the template below:

```ini
# Supabase Realtime Database Credentials
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_SERVICE_KEY="your-supabase-service-role-key"

# Sentinel Hub API Credentials (from Sentinel Hub Dashboard)
SENTINEL_INSTANCE_ID="your-sentinel-hub-instance-id"
SENTINEL_CLIENT_ID="your-sentinel-hub-client-id"
SENTINEL_CLIENT_SECRET="your-sentinel-hub-client-secret"
```

---

## 4. Usage

### Run the Core Verification Pipeline
To trigger the daily/weekly validation sequence, calculate political risk factors, and collect the latest 30-day vegetation metrics:
```bash
python main.py
```

### Retroactive Data Backfilling
To populate 2 years of historical metrics for newly registered reforestation projects in the system:
```bash
python backfill.py
```

### Spin Up the Web Dashboard
To launch the hot-reloading development server for the user dashboard:
```bash
cd carbon-trust-ui/carbon-trust-dash-main
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

---

## 5. Demo

**Explore the live web application here:** [carbon-pipeline.vercel.app](https://carbon-pipeline.vercel.app/)

---

## 6. Contributing

We welcome contributions from remote sensing engineers, policy analysts, and software developers!
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 7. License

Distributed under the MIT License. See `LICENSE` for details.

---

## 8. Author

* **Khushee Maru** - *Initial Architecture & System Integration* - [GitHub Profile](https://github.com/Khusheemaru)
