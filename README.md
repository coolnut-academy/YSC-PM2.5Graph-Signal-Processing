# Development of a PM2.5 Network-Based Mathematical Model for Spatiotemporal Probability Estimation of Future Active-Fire Hotspots

> **การพัฒนาแบบจำลองเชิงคณิตศาสตร์จากเครือข่าย PM2.5 เพื่อประมาณความน่าจะเป็นเชิงพื้นที่และเวลาของจุดความร้อนจากไฟที่ตรวจพบในอนาคต**

[![Competition](https://img.shields.io/badge/Competition-YSC%202027%20(29th)-blue?style=for-the-badge&logo=target)](https://ysc.nstda.or.th/)
[![Field](https://img.shields.io/badge/Field-Mathematics%20%26%20Statistics%20(MAAP)-emerald?style=for-the-badge&logo=google-scholar)](blueprint.md)
[![License](https://img.shields.io/badge/License-CC%20BY%204.0-violet?style=for-the-badge)](LICENSE)
[![Webapp](https://img.shields.io/badge/Webapp-Interactive%20PoC%20Suite-pink?style=for-the-badge&logo=leaflet)](index.html)

---

## 🏛️ ข้อมูลโครงงาน (Project Credentials)

- **การประกวด:** การประกวดโครงงานของนักวิทยาศาสตร์รุ่นเยาว์ ครั้งที่ 29 (Young Scientist Competition, YSC 2027)
- **สาขาที่ส่งประกวด:** คณิตศาสตร์และสถิติ (Mathematics and Statistics, MA)
- **สาขาย่อย:** คณิตศาสตร์ประยุกต์และเชิงคำนวณ (Applied and Computational Mathematics, MAAP)
- **สถานศึกษา:** โรงเรียนห้องสอนศึกษา ในพระอุปถัมภ์ฯ อำเภอเมือง จังหวัดแม่ฮ่องสอน
- **คณะผู้พัฒนา (นักเรียนชั้นมัธยมศึกษาปีที่ 4):**
  1. นางสาวพีชญา สุธรรม
  2. นางสาวพนิดา นันทภัทร
  3. นางสาวฟ้าใส มุ่งศรีโสภณ
- **อาจารย์ที่ปรึกษา:**
  1. นายสาธิต ศิริวัชน์ (อาจารย์ที่ปรึกษาหลัก — ฟิสิกส์และการประยุกต์เทคโนโลยีดิจิทัล)
  2. นางสาวพรไพลิน ตาใฝ (อาจารย์ที่ปรึกษาร่วม — คณิตศาสตร์และการพัฒนาโครงงาน)

---

## 📌 1. บทคัดย่อและแก่นความคิดหลัก (Executive Summary)

โครงงานนี้ศึกษาปัญหาทางคณิตศาสตร์และสถิติประยุกต์เพื่อตอบคำถามสำคัญ:

> **"เมื่อควบคุมปัจจัยพื้นฐานด้านกายภาพ (สภาพอากาศ ภูมิประเทศ พืชพรรณ ฤดูกาล) และแนวโน้มความเสี่ยงเดิมของแต่ละพื้นที่ในอดีต ($C_i$) แล้ว รูปแบบเชิงพื้นที่และเวลาจากเครือข่ายตรวจวัด PM2.5 (ค่าความผิดปกติ การรวมหลายสถานีตามระยะทาง และการให้น้ำหนักตามทิศทางลม) จะช่วยเพิ่มความสามารถในการประมาณความน่าจะเป็นของการพบจุดความร้อนจากไฟ (Active-Fire Hotspots) ที่ดาวเทียมจะตรวจพบในอนาคต ($\Delta = 24\text{ ชั่วโมง}$) หรือไม่?"**

หัวใจของโครงงาน **ไม่ใช่การสร้างฮาร์ดแวร์เซนเซอร์ตรวจวัดฝุ่น และไม่ใช่การแข่งขันสร้างโมเดล Machine Learning แบบกล่องดำ (Black-box ML)** แต่คือการสร้าง **แบบจำลองทางคณิตศาสตร์และสถิติ (Mathematical & Statistical Modeling)** ที่โปร่งใส ตรวจสอบสมมติฐานได้อย่างเป็นระบบ และป้องกันการรั่วไหลของข้อมูล (Data Leakage) อย่างเคร่งครัด

```text
+-----------------------------------------------------------------------------------------+
|                                    INPUT DATASETS                                       |
|  [ Air4Thai (PCD) ]         [ Physical Variables (ERA5-Land, SRTM, MODIS) ]             |
|  - Hourly PM2.5             - Weather: Temp, RH/Dewpoint, Wind (u,v), Rain, Soil Moist  |
|  - Station metadata         - Terrain: SRTM Elevation, Slope, Aspect                    |
|                             - Vegetation: MODIS MOD13Q1 NDVI / EVI                      |
|                             [ Past Hotspot Pattern (NASA FIRMS / VIIRS) ]               |
|                             - Training-only historical hotspot tendency (C_i)           |
+-----------------------------------------------------------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------------+
|                           PM2.5 NETWORK + PHYSICAL MODEL                                |
|   1. PM2.5 Anomaly z_j(t) via Median & MAD (Rolling past window strictly <= t)          |
|   2. Positive Anomaly a_j(t) = max(0, z_j(t))                                           |
|   3. Distance Weighting D_ij = exp(-d_ij / l)                                           |
|   4. Wind-Direction Alignment W_ij(t) = exp(kappa * [cos(theta_ij - psi_i(t)) - 1])     |
|   5. Network Scores: Distance-only Phi_i^(D)(t) vs. Distance+Wind Phi_i(t)              |
|   6. Physical Baseline M0: Weather + DEM + MODIS + Season (S1, S2) + Historical Rate C_i|
|   7. Stepwise Logistic GLM: M-1 -> M0 -> M1 -> M2a -> M2b                               |
+-----------------------------------------------------------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------------+
|                                PROBABILITY ESTIMATION                                   |
|   Estimated Spatiotemporal Probability pi_i(t) = P( Y_i(t; 24h) = 1 | X_i(t) )          |
|   for each prediction cell i and prediction origin t (daily at 06:00 ICT)               |
+-----------------------------------------------------------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------------+
|                                      VALIDATION                                         |
|   Ground Truth: NASA FIRMS / VIIRS 375m I-Band Active Fire Hotspots in (t, t + Delta]   |
|   Spatiotemporal Exclusion: Filter out cases with prior hotspot within (tau_excl, r_excl)|
|   Protocol: Rolling-Origin Backtesting -> Model Lock -> Final Locked Test               |
|   Metrics: Brier Score, PR-AUC, Reliability Diagram, Paired Block-Bootstrap 95% CI      |
+-----------------------------------------------------------------------------------------+
```

---

## 📐 2. นิยามและสมการทางคณิตศาสตร์ (Mathematical Formulation)

### 2.1 ค่าความผิดปกติของ PM2.5 ประจำสถานี ($z_j(t), a_j(t)$)
เพื่อขจัดความแตกต่างของระดับฝุ่นพื้นฐานในแต่ละพื้นที่ และลดผลกระทบจากค่ากระโดดผิดปกติ (Outliers) โครงงานใช้ **Median** และ **Median Absolute Deviation (MAD)** คำนวณจากหน้าต่างเวลาย้อนหลัง:

$$z_j(t) = \frac{p_j(t) - \operatorname{med}_j(t)}{1.4826 \cdot \operatorname{MAD}_j(t) + \varepsilon}$$

$$a_j(t) = \max(0, z_j(t))$$

### 2.2 น้ำหนักระยะทางและทิศทางลม ($D_{ij}, W_{ij}(t)$)
- **น้ำหนักตามระยะทาง (Distance Weight):**

$$D_{ij} = \exp\left(-\frac{d_{ij}}{\ell}\right), \qquad \ell > 0$$

- **น้ำหนักตามความสอดคล้องกับทิศทางลม (Wind Alignment Weight):**

$$W_{ij}(t) = \exp\left(\kappa \left[\cos(\theta_{ij} - \psi_i(t)) - 1\right]\right), \qquad \kappa \ge 0$$

- เมื่อ $\theta_{ij} \approx \psi_i(t)$ (สถานี $j$ อยู่ในทิศใต้ลมของช่องกริด $i$) จะได้ $W_{ij}(t) = 1$
- เมื่อ $\kappa = 0$ จะได้ $W_{ij}(t) = 1$ เสมอ ซึ่งลดรูปเป็นน้ำหนักตามระยะทางเพียงอย่างเดียว

### 2.3 คะแนนเครือข่าย PM2.5 ($\Phi_i^{(D)}(t), \Phi_i(t)$)
- **คะแนนเครือข่ายถ่วงตามระยะทางอย่างเดียว ($M_{2a}$):**

$$\Phi_i^{(D)}(t) = \frac{\sum_{j=1}^{M} D_{ij} a_j(t)}{\sum_{j=1}^{M} D_{ij} + \varepsilon}$$

- **คะแนนเครือข่ายถ่วงตามระยะทางและทิศทางลม ($M_{2b}$ — Proposed Full Model):**

$$\Phi_i(t) = \frac{\sum_{j=1}^{M} q_{ij}(t) a_j(t)}{\sum_{j=1}^{M} q_{ij}(t) + \varepsilon}, \qquad q_{ij}(t) = D_{ij} W_{ij}(t)$$

### 2.4 แบบจำลองเชิงเส้นนัยทั่วไปแบบลอจิสติก (Logistic GLM)

$$\pi_i(t) = P\left(Y_i(t; 24\text{h}) = 1 \mid X_i(t)\right) = \frac{1}{1 + \exp\left(-\eta_i(t)\right)}$$

$$\eta_i(t) = \beta_0 + \beta^\top X_i(t)$$

---

## 📊 3. ลำดับแบบจำลอง 5 ขั้น (Stepwise Model Hierarchy)

| ลำดับแบบจำลอง | ตัวแปรที่นำเข้า (Input Features) | วัตถุประสงค์การเปรียบเทียบ (Research Purpose) | Brier Score ↓ | PR-AUC ↑ |
|---|---|---|---|---|
| **$M_{-1}$** | ค่าเฉลี่ยความชุกคงที่ในชุดฝึก ($\bar{Y}_{\text{train}}$) | จุดอ้างอิงต่ำสุด (Baseline floor) | 0.07520 | 0.0820 |
| **$M_0$** | สภาพอากาศ + SRTM + MODIS + ฤดูกาล ($S_1, S_2$) + $C_i$ | ปัจจัยกายภาพและสถิติเดิมทำนายได้ดีเพียงใด ($M_0$ vs $M_{-1}$) | 0.05670 | 0.2840 |
| **$M_1$** | $M_0$ + ค่าความผิดปกติสถานีใกล้ที่สุด ($a_{\text{nearest}}$) | ฝุ่นสถานีเดี่ยวใกล้พื้นที่ให้ข้อมูลเพิ่มหรือไม่ ($M_1$ vs $M_0$) | 0.05120 | 0.3390 |
| **$M_{2a}$** | $M_0$ + คะแนนเครือข่ายถ่วงระยะทาง ($\Phi_i^{(D)}(t)$) | การรวมหลายสถานีดีกว่าสถานีเดี่ยวหรือไม่ ($M_{2a}$ vs $M_1$) | 0.04680 | 0.3920 |
| **$M_{2b}$** | $M_0$ + คะแนนเครือข่ายถ่วงระยะทางและลม ($\Phi_i(t)$) | การให้น้ำหนักตามทิศลมช่วยเพิ่มความแม่นยำหรือไม่ ($M_{2b}$ vs $M_{2a}$) | **0.04180** | **0.4480** |

---

## 🛡️ 4. ระเบียบวิธีวิจัยและมาตรการป้องกัน Data Leakage

1. **Spatiotemporal Exclusion ($E_i(t; \tau_{\text{excl}}, r_{\text{excl}})$):**
   - ตัดเหตุการณ์ที่มีไฟตรวจพบก่อนหน้าภายในรัศมี $r_{\text{excl}}$ ในช่วงเวลา $[t - \tau_{\text{excl}}, t]$ เพื่อแยก **"การพยากรณ์ก่อนเกิดเหตุ"** ออกจาก **"การตรวจพบควันของไฟที่กำลังลุกไหม้อยู่แล้ว"**
2. **Rolling-Origin Backtesting:**
   - แบ่งข้อมูลตามลำดับเวลาต่อเนื่อง 3 รอบ (Folds A, B, C) โดยคำนวณสถิติ $C_i$, Median/MAD และสัมประสิทธิ์ GLM จากอดีตเท่านั้น
3. **Model Lock & Final Locked Test:**
   - ล็อกพารามิเตอร์ สูตร และรายชื่อสถานีทั้งหมดก่อนเปิดชุดทดสอบสุดท้าย (Final Test Set) เพียงครั้งเดียว

---

## 💻 5. สถาปัตยกรรมของเว็บแอปพลิเคชัน (Webapp Architecture)

เว็บแอปพลิเคชันถูกออกแบบในธีม **Light Premium Enterprise** (Modern, Clean, High-Contrast) พร้อมระบบแท็บ 5 ส่วน และผสานแผนที่ดาวเทียมความละเอียดสูง (Leaflet Satellite):

```
d:\YSC-PM2.5Graph-Signal-Processing\
├── index.html                   # โครงสร้างหลัก HTML5 + Leaflet + KaTeX Math Typesetting
├── css/
│   ├── main.css                 # ธีมสี Light Enterprise, Typography, Layout Grid
│   ├── components.css           # สไตล์การ์ด, ป้ายกำกับระดับโมเดล, โมดอล และสวิตช์เปิด/ปิดสมการ
│   ├── map.css                  # สไตล์แผนที่ดาวเทียม Leaflet, เลเยอร์ช่องกริด, จุดสถานี, เวกเตอร์ลม
│   └── charts.css               # สไตล์แดชบอร์ดสถิติและแผนภูมิ Canvas 2D
├── js/
│   ├── app.js                   # ตัวควบคุมหลัก (Tab navigation, Scenario switching, Event handlers)
│   ├── math_engine.js           # เอนจินคำนวณคณิตศาสตร์ (Median/MAD, Haversine, GLM, Brier, PR-AUC, Bootstrap)
│   ├── scenarios_data.js        # ข้อมูลสถานี Air4Thai และชุดเหตุการณ์ประวัติศาสตร์ (Episodes 1–4)
│   ├── data_service.js          # บริการเชื่อมต่อ Free API (Open-Meteo) และคลังแหล่งอ้างอิง
│   ├── map_renderer.js          # จัดการ Leaflet Satellite Map, วาดช่องกริด, เส้นถ่วงน้ำหนักเครือข่าย
│   ├── chart_renderer.js        # วาดกราฟความแม่นยำ (Reliability, PR-Curve, Bootstrap CI, Lead-time Decay)
│   └── math_inspector.js        # จัดการ KaTeX และแจกแจงค่าตัวแปรจริงใน Cell Inspector
├── blueprint.md                 # เอกสารข้อกำหนดและระเบียบวิธีวิจัยฉบับสมบูรณ์
└── README.md                    # เอกสารแนะนำโครงงาน
```

### ฟังก์ชันหลักในแต่ละแท็บ (Tab Breakdown):
1. **🗺️ แผนที่พยากรณ์หลัก (Overview & Satellite Map):** แสดงแผนที่ภาพถ่ายดาวเทียมจริง (Esri World Imagery) พร้อมโพลีกอนความน่าจะเป็น ($\pi_i$), วงแหวนความผิดปกติ ($a_j$), เวกเตอร์ลม ($\psi_i$), เส้นเชื่อมโยงเครือข่าย ($q_{ij}$), จุดความร้อนจริง ($Y_i = 1$), และแผง **Cell Inspector** เจาะลึกการคำนวณสด
2. **📊 การเปรียบเทียบโมเดล (Model Benchmarks & Metrics):** ตารางสรุปเปรียบเทียบ 5 โมเดล และ 4 แผนภูมิสถิติความแม่นยำสูง
3. **📐 แกนคณิตศาสตร์ (Mathematical Formulation & Parameters):** กล่องปรับจูนพารามิเตอร์ ($\ell, \kappa, R_{\max}$) และการ์ดแสดงสูตรคณิตศาสตร์ที่กดเปิด/ซ่อนได้
4. **🧪 เกณฑ์วินิจฉัย & วิธีวิจัย (Scientific Scenarios & Protocol):** ตารางเกณฑ์วินิจฉัย 5 สถานการณ์ (Scenario A–E) และระเบียบวิธี Rolling-Origin Backtesting
5. **📚 คลังอ้างอิง (Data References Hub):** รวมเอกสารอ้างอิง รายละเอียดหน่วยงาน และ Endpoint ของ API ฟรี

---

## 📚 6. แหล่งข้อมูลเปิดสาธารณะและ API อ้างอิง (Open Data References)

| แหล่งข้อมูล | ตัวแปรที่นำมาใช้ | นโยบายการใช้งาน / License | Endpoint URL |
|---|---|---|---|
| **Open-Meteo API** | PM2.5 สด, ลม 10m ($u,v$), อุณหภูมิ, ความชื้น | **100% Free** (CC BY 4.0, ไม่ต้องใช้ API key) | `https://air-quality-api.open-meteo.com/v1/air-quality` |
| **Air4Thai (PCD)** | PM2.5 รายชั่วโมงสถานีภาคพื้นดิน | Open Government Data (ประเทศไทย) | `http://air4thai.pcd.go.th` |
| **NASA FIRMS / VIIRS** | Active Fire Hotspots 375m I-Band | NASA Open Data Policy | `https://firms.modaps.eosdis.nasa.gov` |
| **Copernicus ERA5-Land** | สภาพอากาศย้อนหลังความละเอียด $0.1^\circ$ | Copernicus Open Access License | `https://cds.climate.copernicus.eu` |
| **USGS SRTM** | ความสูงภูมิประเทศ, ความลาดชัน, ทิศทางลาด | Public Domain / OpenTopography | `https://earthexplorer.usgs.gov` |
| **MODIS MOD13Q1** | ดัชนีพืชพรรณ NDVI / EVI | NASA LP DAAC Open Access | `https://lpdaac.usgs.gov` |

---

## 🚀 7. การเปิดใช้งานและทดสอบ (Getting Started)

โครงงานนี้พัฒนาด้วยสถาปัตยกรรมเว็บมาตรฐาน (Vanilla JS, CSS3, HTML5, Leaflet, KaTeX) สามารถเปิดใช้งานได้ทันทีโดยไม่ต้องติดตั้ง Build Tools ที่ซับซ้อน:

1. **เปิดด้วยเว็บเบราว์เซอร์โดยตรง:**
   - ดับเบิลคลิกไฟล์ `index.html` หรือเปิดผ่านเบราว์เซอร์ (Google Chrome, Microsoft Edge, Safari, Firefox)
2. **เปิดผ่าน Local Server (แนะนำ):**
   ```bash
   # ใช้ Python
   python -m http.server 8000
   
   # หรือใช้ Node.js npx serve
   npx serve .
   ```
   จากนั้นเปิดเบราว์เซอร์ไปที่ `http://localhost:8000`

---

## 🔬 8. เกณฑ์การวินิจฉัยทางวิทยาศาสตร์ (Pre-specified Diagnostic Scenarios)

| สถานการณ์ | พฤติกรรมของแบบจำลอง | การตีความทางวิทยาศาสตร์และคณิตศาสตร์ |
|---|---|---|
| **Scenario A** | $M_{2b} > M_{2a} > M_1 > M_0$ อย่างสม่ำเสมอ | สนับสนุนว่าสัญญาณเครือข่าย PM2.5 และทิศทางลมให้ข้อมูลพยากรณ์จริง |
| **Scenario B** | $M_{2a} > M_1 > M_0$ แต่ $M_{2b} \approx M_{2a}$ | การรวมข้อมูลหลายสถานีมีประโยชน์ แต่ทิศทางลมเฉลี่ยไม่เพิ่มข้อมูลมีนัยสำคัญ |
| **Scenario C** | $M_1 > M_0$ แต่ $M_{2a} \approx M_1$ | PM2.5 สถานีใกล้ที่สุดมีประโยชน์ แต่การรวมหลายสถานีไม่เพิ่มข้อมูล |
| **Scenario D** | $M_0 \approx M_1 \approx M_{2a} \approx M_{2b}$ | เครือข่าย PM2.5 ไม่ได้ให้ข้อมูลพยากรณ์เพิ่มเหนือปัจจัยกายภาพเดิม |
| **Scenario E** | ประโยชน์ของ PM2.5 มีเฉพาะช่วงสั้น ($\Delta = 6\text{h}$) | สัญญาณ PM2.5 สะท้อน **ควันไฟระยะแรก หรือไฟที่เริ่มติดแล้ว** |

> **หมายเหตุ:** ทุกสถานการณ์ถือเป็นข้อค้นพบทางวิทยาศาสตร์ที่มีคุณค่า (Valid Scientific Findings) ที่ต้องรายงานตามความเป็นจริง

---

## 📄 9. ลิขสิทธิ์และการอ้างอิง (Citation & License)

- โครงงานนี้เผยแพร่ภายใต้สัญญาอนุญาต **Creative Commons Attribution 4.0 International (CC BY 4.0)**
- **การอ้างอิงโครงงาน (Project Citation):**
  > พีชญา สุธรรม, พนิดา นันทภัทร, ฟ้าใส มุ่งศรีโสภณ, สาธิต ศิริวัชน์, และ พรไพลิน ตาใฝ. (2570). *การพัฒนาแบบจำลองเชิงคณิตศาสตร์จากเครือข่าย PM2.5 เพื่อประมาณความน่าจะเป็นเชิงพื้นที่และเวลาของจุดความร้อนจากไฟที่ตรวจพบในอนาคต*. เอกสารข้อเสนอโครงงานการประกวดของนักวิทยาศาสตร์รุ่นเยาว์ ครั้งที่ 29 (YSC 2027), โรงเรียนห้องสอนศึกษา ในพระอุปถัมภ์ฯ, จังหวัดแม่ฮ่องสอน.
