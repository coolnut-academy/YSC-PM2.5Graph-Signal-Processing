# BLUEPRINT โครงงาน YSC

## การประยุกต์ทฤษฎีสัญญาณบนกราฟเพื่อศึกษาการเลือกตำแหน่งเซนเซอร์ PM2.5 ภายใต้ข้อจำกัดจำนวนเซนเซอร์และการสูญเสียข้อมูล

**ชื่อภาษาอังกฤษ (Working Title):**  
**Application of Graph Signal Theory to PM2.5 Sensor Placement under Sensor-Budget and Data-Loss Constraints**

**สาขาที่แนะนำ:** คณิตศาสตร์และสถิติ (Mathematics and Statistics, MA)  
**สาขาย่อยที่แนะนำ:** คณิตศาสตร์ประยุกต์และเชิงคำนวณ (Applied and Computational Mathematics, MAAP)

**สถานะของชื่อ:** ชื่อชั่วคราวสำหรับพัฒนา Proposal ควรล็อกชื่อสุดท้ายหลัง Pilot Experiment รอบแรก

---

# 1. แนวคิดหลักของโครงงาน

โครงงานนี้ศึกษาปัญหาเชิงคณิตศาสตร์ประยุกต์ว่า

> หากมีตำแหน่งตรวจวัด PM2.5 จำนวนมาก แต่สามารถเลือกใช้เซนเซอร์ได้เพียงบางส่วน เราควรเลือกตำแหน่งใดเพื่อให้สามารถประมาณค่าของเครือข่ายทั้งหมดได้ดีที่สุด และเมื่อข้อมูลจากเซนเซอร์บางส่วนสูญหาย วิธีเลือกตำแหน่งใดจะรักษาความสามารถในการประมาณค่าได้ดีที่สุด

หัวใจของโครงงานไม่ใช่การสร้างเครื่องตรวจวัด PM2.5 และไม่ใช่การสร้างเว็บแอปตรวจฝุ่น แต่คือการนำ

- Graph Theory
- Linear Algebra
- Spectral Graph Theory
- Graph Signal Processing (GSP)
- Sampling Theory
- Optimization
- Statistical Evaluation

มาประยุกต์กับข้อมูลสถานี PM2.5 ของประเทศไทย

Webapp ทำหน้าที่เป็น **Proof of Concept และ Interactive Mathematical Experiment** ซึ่งเปิดให้ผู้ใช้ทดลองเปลี่ยนจำนวนเซนเซอร์ วิธีเลือกตำแหน่ง และสถานการณ์ข้อมูลสูญหาย แล้วเห็นผลทางคณิตศาสตร์และข้อผิดพลาดในการสร้างสัญญาณกลับ

---

# 2. เหตุผลที่โครงงานนี้เป็น “คณิตศาสตร์” ไม่ใช่ “โครงงานคอมพิวเตอร์”

ลำดับแกนของงานต้องเป็น

$$
\boxed{
\text{Mathematical Model}
\rightarrow
\text{Sampling Strategy}
\rightarrow
\text{Reconstruction}
\rightarrow
\text{Experiment}
\rightarrow
\text{Findings}
\rightarrow
\text{Webapp PoC}
}
$$

ไม่ใช่

$$
\text{Webapp}
\rightarrow
\text{เพิ่มคณิตศาสตร์ภายหลัง}
$$

ตัว Webapp จะไม่เป็นเกณฑ์ตัดสินหลักของงาน แต่ทำหน้าที่แสดงให้เห็นว่าแบบจำลองและวิธีการทางคณิตศาสตร์ทำงานจริงอย่างไร

---

# 3. Research Problem

เครือข่ายตรวจวัด PM2.5 มีข้อจำกัดเชิงทรัพยากร เพราะการติดตั้ง บำรุงรักษา และเชื่อมต่อเซนเซอร์มีต้นทุน ขณะเดียวกันข้อมูลจากบางสถานีอาจขาดหายหรือไม่พร้อมใช้งานในบางช่วงเวลา

หากมีตำแหน่งตัวเลือกทั้งหมด \(N\) ตำแหน่ง แต่สามารถใช้งานเพียง \(K<N\) ตำแหน่ง ปัญหาคือ

$$
\text{เลือก } S\subseteq V,\qquad |S|=K
$$

อย่างไรให้ข้อมูลจาก \(S\) สามารถใช้ประมาณสัญญาณ PM2.5 ทั้งเครือข่ายได้ดี

และเมื่อข้อมูลจากเซนเซอร์บางส่วนใน \(S\) สูญหาย จะเกิดการเสื่อมของความแม่นยำมากน้อยเพียงใด

---

# 4. Research Gap และ Originality ที่ใช้ได้อย่างปลอดภัย

## 4.1 สิ่งที่มีงานอยู่แล้ว

ต้องยอมรับอย่างชัดเจนใน Proposal ว่า

1. Graph Signal Processing สำหรับการสร้างข้อมูลมลพิษอากาศกลับมีงานวิจัยอยู่แล้ว
2. การเลือก sampling nodes บนกราฟมีทฤษฎีและวิธี optimization อยู่แล้ว
3. Robust Graph Signal Sampling สำหรับกรณี sample สูญหายจาก sensor failure/adversarial erasure มีงานอยู่แล้ว
4. การใช้ GSP เพื่อเลือกตำแหน่ง sensor ในเครือข่ายประเภทอื่นมีงานอยู่แล้ว

ดังนั้น **ห้าม** claim ว่าโครงงานเป็นผู้คิด Graph Signal Sampling, Robust GSP หรือการวาง sensor ด้วย GSP ขึ้นใหม่

## 4.2 Originality ของโครงงานนี้

Originality จะอยู่ที่การออกแบบการศึกษาสำหรับบริบทไทยและการเปรียบเทียบเชิงระบบ ได้แก่

- ประยุกต์ Graph Signal Sampling กับข้อมูล PM2.5 ของประเทศไทย
- ศึกษา sensor-budget โดยใช้จำนวน sensor เท่ากันภายใต้วิธีเลือกที่แตกต่างกัน
- เปรียบเทียบ geometric coverage กับ spectral information ของ GSP
- ศึกษาการเสื่อมของ reconstruction เมื่อข้อมูล sensor สูญหาย
- วิเคราะห์ว่า graph construction แบบต่าง ๆ ส่งผลต่อ reconstruction อย่างไร
- สร้าง Public Interactive Experiment ให้ผู้ใช้ reproduce การทดลองสำคัญของโครงงานได้

## 4.3 Novelty Statement ที่แนะนำ

> งานวิจัยด้าน Graph Signal Processing ได้แสดงแล้วว่าสามารถสร้างข้อมูลจากเครือข่ายเซนเซอร์บางส่วนกลับได้ และมีวิธีเลือกจุดสุ่มตัวอย่างเพื่อเพิ่มประสิทธิภาพของการสร้างสัญญาณกลับ งานนี้ไม่ได้เสนอทฤษฎี Graph Signal Sampling ใหม่ แต่ศึกษาการประยุกต์ใช้และพฤติกรรมของวิธีดังกล่าวกับเครือข่ายตรวจวัด PM2.5 ของประเทศไทย ภายใต้ข้อจำกัดจำนวนเซนเซอร์และการสูญเสียข้อมูล โดยเปรียบเทียบกับวิธีเชิงเรขาคณิตและวิธีพื้นฐานภายใต้เงื่อนไขทดลองเดียวกัน และวิเคราะห์ trade-off ระหว่างการครอบคลุมพื้นที่ ความสามารถในการสร้างสัญญาณกลับ และความทนทานต่อข้อมูลสูญหาย

---

# 5. คำถามวิจัยหลัก

## RQ1 — Sensor Budget
เมื่อจำนวนเซนเซอร์ที่อนุญาต \(K\) เท่ากัน วิธีเลือกตำแหน่งแบบใดให้ความคลาดเคลื่อนในการสร้างค่า PM2.5 ของสถานีที่ถูกซ่อนไว้ต่ำที่สุด

เปรียบเทียบอย่างน้อย:
- Random Sampling
- Geometric / Coverage-based Sampling
- Graph Signal Sampling
- Robust Graph Signal Sampling

## RQ2 — Graph Construction
การสร้างกราฟจากข้อมูลต่างชนิด เช่น ระยะทาง ภูมิประเทศ และความสัมพันธ์เชิงประวัติของ PM2.5 ส่งผลต่อ reconstruction error อย่างไร

## RQ3 — Data Loss Robustness
เมื่อข้อมูลจากเซนเซอร์ที่เลือกไว้สูญหายจำนวน \(q\) จุด วิธีเลือกตำแหน่งแต่ละแบบรักษาความแม่นยำของ reconstruction ได้แตกต่างกันเพียงใด

## RQ4 — Geometry vs Information
การครอบคลุมพื้นที่ทางเรขาคณิตที่ดี เช่น การลด coverage radius หรือ Voronoi imbalance มีความสัมพันธ์กับความสามารถในการ reconstruct graph signal มากน้อยเพียงใด

---

# 6. สมมติฐานการวิจัย

ไม่ควรเขียนสมมติฐานแบบฟันธงว่า GSP “ต้องชนะ”

$$
H_0:\;E_{M_1}=E_{M_2}
$$

$$
H_1:\;E_{M_1}\neq E_{M_2}
$$

โดย \(E_M\) อาจหมายถึง RMSE ของวิธี \(M\)

สมมติฐานเชิงแนวคิดที่สามารถทดสอบได้ เช่น

> การกระจายเซนเซอร์ให้ครอบคลุมพื้นที่ทางเรขาคณิตดีที่สุด ไม่จำเป็นต้องเป็นตำแหน่งที่รักษาข้อมูลเชิงสเปกตรัมของสัญญาณได้ดีที่สุด

และ

> วิธีเลือกตำแหน่งที่ optimize เพื่อ reconstruction ในสภาวะปกติ อาจมี trade-off กับความทนทานเมื่อข้อมูลบางเซนเซอร์สูญหาย

---

# 7. Mathematical Core

## 7.1 Graph Model

กำหนดกราฟ

$$
G=(V,E,W)
$$

โดย
- \(V\) = ตำแหน่ง/สถานีตรวจวัด
- \(E\) = ความสัมพันธ์ระหว่างสถานี
- \(W=[w_{ij}]\) = น้ำหนักความสัมพันธ์
- \(|V|=N\)

## 7.2 Graph Weight Models

### Model A — Distance-only

$$
w_{ij}
=
\exp\left(-\frac{d_{ij}^{2}}{2\sigma_d^{2}}\right)
$$

### Model B — Distance + Elevation

$$
w_{ij}
=
\exp\left[
-\left(
\alpha\frac{d_{ij}^{2}}{\sigma_d^{2}}
+
\beta\frac{(h_i-h_j)^2}{\sigma_h^{2}}
\right)
\right]
$$

### Model C — Historical Correlation

$$
w_{ij}
=
|\operatorname{Corr}(x_i,x_j)|
$$

### Model D — Hybrid Graph

$$
W
=
\alpha W_d+\beta W_h+\gamma W_c
$$

โดย

$$
\alpha+\beta+\gamma=1,\qquad \alpha,\beta,\gamma\ge0
$$

> Hybrid formula เป็นแบบจำลองสำหรับการทดลอง ไม่ใช่การอ้างทฤษฎีใหม่

---

# 8. Graph Laplacian และ Graph Fourier Basis

Degree matrix

$$
D_{ii}=\sum_j w_{ij}
$$

Graph Laplacian

$$
\boxed{L=D-W}
$$

Eigendecomposition

$$
\boxed{L=U\Lambda U^\top}
$$

โดย

$$
\Lambda=\operatorname{diag}(\lambda_1,\lambda_2,\ldots,\lambda_N)
$$

Graph Fourier transform ของ signal \(x\)

$$
\hat{x}=U^\top x
$$

---

# 9. Smoothness ของ PM2.5 บนกราฟ

ใช้

$$
\boxed{x^\top Lx}
$$

ซึ่งเท่ากับ

$$
x^\top Lx
=
\frac12
\sum_{i,j}
w_{ij}(x_i-x_j)^2
$$

ก่อนใช้ low-frequency reconstruction ต้องตรวจสอบจากข้อมูลจริงว่า PM2.5 บน graph ที่สร้างขึ้นมีพลังงานอยู่ใน low graph frequencies มากเพียงใด

นี่เป็น **Model Diagnostic ที่ต้องทำจริง** ไม่ควรสมมติว่า PM2.5 bandlimited โดยอัตโนมัติ

---

# 10. Low-frequency Approximation

เลือก graph frequencies แรกจำนวน \(r\)

$$
U_r=[u_1,u_2,\ldots,u_r]
$$

ประมาณ signal

$$
\boxed{x\approx U_r\alpha}
$$

โดย

$$
\alpha\in\mathbb R^r
$$

ตัวอย่างเกณฑ์ cumulative spectral energy

$$
\frac{\sum_{k=1}^{r}\hat{x}_k^2}
{\sum_{k=1}^{N}\hat{x}_k^2}
\ge \eta
$$

---

# 11. Sampling Model

เลือก sensor set

$$
S\subseteq V,\qquad |S|=K
$$

สร้าง sampling matrix

$$
C_S
$$

ค่าที่สังเกตได้

$$
y=C_Sx
$$

ภายใต้ low-frequency model

$$
y\approx C_SU_r\alpha
$$

เงื่อนไข identifiability ที่สำคัญคือ

$$
\operatorname{rank}(C_SU_r)=r
$$

---

# 12. Reconstruction

Least-squares / pseudoinverse reconstruction

$$
\hat{\alpha}=(C_SU_r)^\dagger y
$$

ดังนั้น

$$
\boxed{
\hat{x}
=
U_r(C_SU_r)^\dagger y
}
$$

เปรียบเทียบ \(\hat{x}\) ที่สถานีถูกซ่อนกับค่าจริง \(x\)

---

# 13. วิธีเลือกตำแหน่งเซนเซอร์

## Method 0 — All Sensors
ใช้ทุกสถานีเป็น reference ceiling

## Method 1 — Random Sampling
สุ่ม \(K\) สถานี และทำซ้ำหลาย random seeds

## Method 2 — Geometric / Coverage-based
มุ่งกระจาย sensor ให้ครอบคลุมพื้นที่ เช่นลด

$$
h(S)
=
\max_{v\in V}
\min_{s\in S}d(v,s)
$$

## Method 3 — Graph Signal Sampling
ใช้ spectral criterion เช่น

$$
\sigma_{\min}(C_SU_r)
$$

หรือ determinant-based criterion

$$
\det\left((C_SU_r)^\top(C_SU_r)\right)
$$

## Method 4 — Robust Graph Signal Sampling
พิจารณาคุณภาพหลังเกิด sensor loss เช่นแนวคิด

$$
\max_{|S|=K}
\min_{j\in S}
\sigma_{\min}\left(C_{S\setminus\{j\}}U_r\right)
$$

หรือ formulation robust ที่อ้างอิงจาก literature

---

# 14. Data-loss Experiment

จาก sampling set \(S\) จำลอง failure set

$$
F\subseteq S,\qquad |F|=q
$$

sensor ที่เหลือ

$$
S'=S\setminus F
$$

ทำ reconstruction ใหม่

$$
\hat{x}^{(F)}
=
U_r(C_{S'}U_r)^\dagger y_{S'}
$$

ศึกษาค่า error เป็นฟังก์ชันของ

$$
E=E(K,q,M,G,t)
$$

โดย
- \(K\) = sensor budget
- \(q\) = จำนวน sensor ที่สูญหาย
- \(M\) = sampling method
- \(G\) = graph construction model
- \(t\) = time/season/data split

---

# 15. Experimental Dataset

## Primary Dataset
ข้อมูล PM2.5 จากสถานีตรวจวัด Air4Thai ของกรมควบคุมมลพิษ

ข้อมูลที่ต้องการอย่างน้อย:
- station ID
- latitude
- longitude
- timestamp
- PM2.5
- station metadata

## Optional Auxiliary Data
ใช้เฉพาะเมื่อ Pilot แสดงว่าจำเป็น:
- elevation / DEM
- ภูมิประเทศ
- weather variables
- wind

Phase แรกไม่ควรเพิ่มตัวแปรมากเกินไป เพราะจะทำให้แยกผลของ Graph Signal Sampling ออกจาก feature engineering ได้ยาก

---

# 16. Candidate Nodes และ Ground Truth

Research Mode ต้องเริ่มจากตำแหน่งที่มีค่าจริงสำหรับ validation

สมมติมีสถานี usable จำนวน \(N\) จุด เลือก \(K\) จุดเป็น sensor set \(S\) และซ่อนจุดอื่นจาก algorithm จากนั้น reconstruct

$$
\hat{x}_j,\qquad j\notin S
$$

แล้วเปรียบเทียบกับค่าจริง

$$
x_j
$$

นี่คือ held-out reconstruction ที่ทำให้ประเมินผลด้วย ground truth จริง

---

# 17. Data Splitting เพื่อป้องกัน Data Leakage

หาก graph weight ใช้ Historical Correlation ห้ามใช้ข้อมูลช่วงทดสอบในการสร้าง graph

แบ่งเวลาอย่างน้อยเป็น
- Graph/Training period
- Validation period
- Test period

หลักการ:

```text
Past Data
    ↓
Construct Graph / Tune Parameters
    ↓
Future Held-out Data
    ↓
Final Evaluation
```

ห้ามสร้าง correlation matrix จากทั้ง dataset แล้วค่อยรายงาน test RMSE

---

# 18. ตัวแปรการทดลอง

## ตัวแปรต้น
1. Sampling method \(M\)
2. Sensor budget \(K\)
3. Number of failed sensors \(q\)
4. Graph model \(G\)
5. Spectral dimension \(r\)
6. Season / temporal subset

## ตัวแปรตาม
1. RMSE
2. MAE
3. Worst-case absolute error
4. Coverage radius
5. \(\sigma_{\min}\)
6. Error increase after failure

## ตัวแปรควบคุม
- dataset/time period
- candidate station pool
- sensor budget
- test timestamps
- reconstruction method
- missing-data policy
- random seeds/repetition protocol

---

# 19. Metrics

## RMSE

$$
\operatorname{RMSE}
=
\sqrt{
\frac1m
\sum_{i=1}^{m}(x_i-\hat{x}_i)^2
}
$$

## MAE

$$
\operatorname{MAE}
=
\frac1m
\sum_{i=1}^{m}|x_i-\hat{x}_i|
$$

## Worst Error

$$
E_{\max}
=
\max_i|x_i-\hat{x}_i|
$$

## Relative Failure Degradation

$$
D_q
=
\frac{E_q-E_0}{E_0}
$$

## Coverage Radius

$$
h(S)
=
\max_{v\in V}
\min_{s\in S}d(v,s)
$$

## Spectral Stability

$$
\sigma_{\min}(C_SU_r)
$$

---

# 20. Statistical Analysis

Random baseline ต้องทำซ้ำหลายครั้ง

รายงานอย่างน้อย:
- mean
- median
- standard deviation
- confidence interval หรือ bootstrap interval

เมื่อแต่ละ method ถูกทดสอบบน test samples เดียวกัน ควรใช้ paired comparison

หาก distribution ไม่เหมาะกับ parametric assumptions สามารถใช้ permutation test หรือ Wilcoxon-type paired comparison ตามความเหมาะสม

ควรรายงาน effect size ไม่ใช่เฉพาะ p-value

---

# 21. Experimental Matrix

ตัวอย่าง:

$$
K\in\{5,10,15,20,25\}
$$

$$
q\in\{0,1,2,3\}
$$

$$
M\in
\{
\text{Random},
\text{Coverage},
\text{GSP},
\text{Robust GSP}
\}
$$

Graph models:

$$
G\in
\{
\text{Distance},
\text{Distance+Elevation},
\text{Correlation},
\text{Hybrid}
\}
$$

ไม่จำเป็นต้องรัน full Cartesian product ทันที ให้ Pilot ตัด graph models ที่อ่อนออกก่อน

---

# 22. Pilot Experiments ก่อนล็อก Proposal

## Pilot A — Data Feasibility
ตรวจจำนวนสถานีที่มีข้อมูล PM2.5 พร้อมกันจริง

## Pilot B — Graph Smoothness
ตรวจ spectral energy ภายใต้ graph models ต่าง ๆ

## Pilot C — Reconstruction Sanity Check
ซ่อน 20–30% ของสถานี แล้วดูว่า GSP reconstruction ดีกว่า naive mean/nearest baseline หรือไม่

## Pilot D — Sensor-budget Curve
สร้างกราฟ

$$
K\rightarrow RMSE
$$

## Pilot E — Failure Stress Test
ลอง failure 1–3 sensors เพื่อดูว่ามี signal ให้ศึกษา robustness หรือไม่

---

# 23. สิ่งที่ถือเป็น “ข้อค้นพบ” ได้

ตัวอย่าง:
1. วิธี sampling ใดมี sensor-efficiency สูงที่สุดในแต่ละช่วง \(K\)
2. Coverage ดีในแง่พื้นที่แต่ไม่ได้ดีที่สุดในแง่ reconstruction
3. Graph model แบบใดเหมาะกับข้อมูล PM2.5 ไทยมากกว่า
4. ความแม่นยำเสื่อมอย่างไรเมื่อ sensor สูญหาย
5. Robust method มี cost ใน normal operation เท่าไร แลกกับ robustness ที่เพิ่มขึ้นเท่าไร
6. มีจุด diminishing return หรือไม่
7. ผลแตกต่างตามฤดูหรือภูมิภาคหรือไม่

ทุกข้อข้างต้นต้องมาจากข้อมูลจริง ไม่กำหนดผลไว้ล่วงหน้า

---

# 24. Webapp PoC — บทบาท

Webapp มีหน้าที่ 4 อย่าง:
1. **Visualize** mathematical model
2. **Reproduce** selected experiments
3. **Compare** sampling strategies under equal constraints
4. **Explain** why sensor placement is an information problem ไม่ใช่เพียง geometric spacing problem

Webapp ไม่ใช่ real-time public-health warning system

ต้องติด label ชัดเจนเมื่อแสดงค่าประมาณ:

> **Estimated / Reconstructed PM2.5 — Research Demonstration**

---

# 25. Webapp — Thailand Explorer

## Main View
- monitoring nodes
- selected sensors
- graph edges
- reconstructed PM2.5 layer
- actual held-out values ใน Research Mode
- Voronoi cells ใน Coverage Mode
- optional terrain/elevation

## User Controls
- Sensor budget \(K\)
- Sampling method
- Graph model
- Spectral dimension \(r\)
- Failure count \(q\)
- Failure selection: random/manual
- Date/period
- Region
- Toggle terrain/elevation
- Toggle graph edges
- Toggle Voronoi

## Live Metrics
- RMSE
- MAE
- Worst Error
- Coverage Radius
- \(\sigma_{\min}\)
- Number of selected sensors
- Number of failed sensors

---

# 26. Webapp — Compare Mode

เปรียบเทียบ 2–4 methods ภายใต้

$$
\text{same dataset}
+
\text{same }K
+
\text{same test timestamps}
+
\text{same failure scenario}
$$

| Method | RMSE | MAE | Worst Error | Coverage | Failure RMSE |
|---|---:|---:|---:|---:|---:|
| Random | | | | | |
| Coverage / Voronoi | | | | | |
| GSP | | | | | |
| Robust GSP | | | | | |

ค่าจริงต้องคำนวณจาก experiment ไม่ hard-code

---

# 27. Webapp — Break the Network Mode

ผู้ใช้คลิก sensor ให้ fail

$$
S'=S\setminus F
$$

แล้ว reconstruct ใหม่ทันที

แสดง

$$
RMSE_{\text{before}}
\rightarrow
RMSE_{\text{after}}
$$

พร้อม visual difference map

---

# 28. Research Mode vs Public Explore Mode

## Research Mode
- candidate nodes = สถานีที่มี ground truth
- reproducible experiment
- fixed dataset version
- deterministic seeds/config
- export result table
- ใช้เป็น evidence ของรายงาน

## Public Explore Mode
- interactive Thailand
- เปลี่ยน parameter ได้
- simulation/reconstructed layers
- ใช้เพื่อสื่อสาร concept

หากมี recommended new sensor location นอกสถานีที่เคยวัด ต้องระบุว่าเป็น **model recommendation** ไม่ใช่ experimentally verified location

---

# 29. Technology Boundary

Technology ไม่ควรบดบังคณิตศาสตร์

Frontend ที่เหมาะ:
- WebGL map/terrain engine เช่น CesiumJS หรือ MapLibre GL JS
- interactive charts

Mathematical computation:
- Python
- NumPy / SciPy
- NetworkX หรือ sparse graph operations

สามารถ precompute experiment results สำหรับ Public Mode เพื่อลด server cost

ไม่จำเป็นต้องมี:
- login
- social features
- generative AI
- complex user database
- recommendation account system

---

# 30. Conceptual Framework

```text
Air4Thai PM2.5 + Station Coordinates
                |
                v
        Data Cleaning / Split
                |
                v
        Graph Construction
     /       |       |       \
Distance  Elevation Correlation Hybrid
                |
                v
        Graph Laplacian L
                |
                v
     Spectral Representation
                |
                v
       Sampling Method M
 Random / Coverage / GSP / Robust GSP
                |
                v
         Sensor Budget K
                |
                v
       Hide Non-selected Nodes
                |
                v
        Signal Reconstruction
                |
                v
 Compare with Ground Truth
                |
                v
 RMSE / MAE / Worst Error / Coverage
                |
                v
       Simulate Data Loss q
                |
                v
      Reconstruct + Re-evaluate
                |
                v
        Statistical Analysis
                |
                v
        Findings / Trade-offs
                |
                v
        Webapp Proof of Concept
```

---

# 31. Methodology Workflow

## Phase 1 — Literature and Mathematical Foundation
- Graph Signal Processing basics
- Graph Laplacian
- spectral decomposition
- graph signal smoothness
- sampling and reconstruction
- robust graph sampling
- spatial coverage / Voronoi baseline

## Phase 2 — Dataset Audit
- ดาวน์โหลด/เรียกข้อมูล Air4Thai
- ตรวจจำนวนสถานี
- ตรวจ missingness
- กำหนดช่วงเวลา
- สร้าง clean research dataset version

## Phase 3 — Graph Model Pilot
- Distance graph
- Elevation graph (ถ้าจำเป็น)
- Correlation graph
- Hybrid candidate
- spectral smoothness analysis

## Phase 4 — Reconstruction Pilot
- hidden-station validation
- select \(r\)
- verify reconstruction pipeline

## Phase 5 — Sensor Placement Experiment
- Random
- Coverage / Voronoi
- GSP
- Robust GSP
- sensor-budget curves

## Phase 6 — Data Loss Experiment
- random failure
- optional structured/regional failure as secondary stress test

## Phase 7 — Statistical Analysis
- repeated runs
- paired comparison
- effect size
- confidence intervals
- sensitivity analysis

## Phase 8 — Webapp PoC
- Research Mode
- Thailand Explore Mode
- Compare Mode
- Break the Network

## Phase 9 — Competition Package
- report
- abstract
- poster / quad chart
- proof-of-concept demo
- reproducibility notebook
- Q&A preparation

---

# 32. Minimum Viable Research Result (MVRR)

ก่อนสร้าง Webapp เต็ม ต้องมี:
1. clean dataset ที่ reproducible
2. graph construction อย่างน้อย 2 แบบ
3. reconstruction method ที่ validated
4. sampling methods อย่างน้อย 3 แบบ
5. sensor-budget experiment
6. failure experiment
7. statistical comparison
8. ข้อค้นพบอย่างน้อย 2–3 ข้อที่ตอบ RQ จริง

หากยังไม่มีข้อ 1–7 **ห้ามแก้ปัญหาด้วยการเพิ่ม feature ให้ Webapp**

---

# 33. Success Criteria

โครงงานถือว่าประสบความสำเร็จทางวิจัย หากสามารถตอบได้อย่างมีหลักฐานว่า:
- sensor placement method ส่งผลต่อ reconstruction จริงหรือไม่
- จำนวน sensor ลดลงได้มากน้อยเพียงใดก่อน error เพิ่มอย่างรวดเร็ว
- geometric coverage และ spectral reconstruction มี trade-off อย่างไร
- sensor loss ส่งผลต่อแต่ละ method อย่างไร
- graph construction แบบใดเหมาะกับข้อมูลไทยมากกว่าในเงื่อนไขที่ศึกษา

ไม่จำเป็นต้องพิสูจน์ว่า GSP ชนะทุกกรณี

---

# 34. Failure / Negative Result ที่ยังมีคุณค่า

ผลลัพธ์ที่ยังมีคุณค่า:
- GSP ไม่ได้ดีกว่า Coverage อย่างมีนัยสำคัญ
- GSP ดีกว่าเฉพาะเมื่อ sensor budget ต่ำ
- correlation graph ทำได้ดีใน training แต่ generalize ไม่ดี
- elevation ไม่เพิ่มประสิทธิภาพ
- robust placement sacrifice normal RMSE มากเกินไป
- PM2.5 ไม่ sufficiently low-frequency บน graph บางชนิด

สิ่งเหล่านี้คือ scientific findings ไม่ใช่ความล้มเหลว

---

# 35. Scope Guardrails

## Main Scope
- PM2.5
- Thailand
- historical station network
- fixed candidate station pool
- mathematical sensor selection and reconstruction

## Optional Extension
- weather
- wind
- satellite data
- continuous new sensor locations
- forecasting
- real-time monitoring

## ห้ามกลายเป็น
- IoT hardware project
- PM2.5 forecasting ML competition
- dashboard project
- AI chatbot
- public-health warning service

---

# 36. ข้อจำกัดที่ต้องเขียนอย่างโปร่งใส

1. สถานี Air4Thai ไม่ได้กระจายสม่ำเสมอทั่วประเทศไทย
2. station pool ที่ใช้เป็น candidate nodes มี selection bias จากเครือข่ายที่มีอยู่แล้ว
3. reconstruction ที่สถานีเดิมไม่ได้พิสูจน์ว่าตำแหน่งใดก็ได้ทั่วประเทศ reconstruct ได้เท่ากัน
4. graph construction มีผลต่อผลลัพธ์อย่างมาก
5. PM2.5 ไม่จำเป็นต้อง bandlimited อย่างสมบูรณ์
6. sensor failure ในการทดลองเป็น simulation
7. reconstructed PM2.5 ไม่ใช่ค่าตรวจวัดจริง
8. ข้อมูลสาธารณะอาจมี missingness และคุณภาพแตกต่างตามสถานี/ช่วงเวลา

---

# 37. การตีความ Webapp ที่ถูกต้อง

Webapp **ไม่ได้พิสูจน์ theorem** และไม่ได้ทำให้ผลวิจัยถูกต้องเพียงเพราะ visualization ดูดี

สิ่งที่ Webapp พิสูจน์เชิง Proof of Concept คือ

> mathematical pipeline สามารถรับข้อมูลจริง เลือก sampling nodes สร้างสัญญาณกลับ วัด error และแสดง trade-off แบบ interactive ตาม protocol เดียวกับงานวิจัยได้

---

# 38. Expected Deliverables

## Academic
1. Proposal
2. Literature Review
3. Mathematical Model document
4. Reproducible data-cleaning pipeline
5. Experiment notebook/scripts
6. Result tables
7. Statistical analysis
8. Full report

## Proof of Concept
9. Public Webapp
10. Thailand Explorer
11. Compare Mode
12. Failure Simulator

## Competition
13. Poster / Quad Chart
14. Demo scenario
15. 3-minute explanation
16. Judge Q&A bank

---

# 39. Judge Storyline

Presentation ไม่ควรเปิดด้วย Webapp

เปิดด้วยคำถาม:

> “ถ้าเรามีงบติดเซนเซอร์เพียง 10 จุด การกระจายให้ทั่วประเทศคือวิธีที่ให้ข้อมูลมากที่สุดจริงหรือ?”

จากนั้น:
1. แสดง geometric intuition
2. แนะนำ graph signal
3. แสดง Laplacian / spectral idea
4. อธิบาย sampling
5. แสดง experimental design
6. แสดง findings
7. ค่อยเปิด Webapp ให้กรรมการทดลอง

---

# 40. One-sentence Project Pitch

> โครงงานนี้ประยุกต์ทฤษฎีสัญญาณบนกราฟเพื่อศึกษาว่า ภายใต้งบประมาณเซนเซอร์ PM2.5 ที่จำกัด ตำแหน่งแบบใดรักษาข้อมูลของเครือข่ายได้ดีที่สุด และความสามารถนั้นเปลี่ยนไปอย่างไรเมื่อข้อมูลจากเซนเซอร์บางส่วนสูญหาย โดยตรวจสอบกับข้อมูลสถานีจริงของประเทศไทยและสาธิตผ่านห้องทดลองคณิตศาสตร์แบบโต้ตอบ

---

# 41. Working Title Alternatives

## ตัวเลือก 1 — แนะนำที่สุด

**การประยุกต์ทฤษฎีสัญญาณบนกราฟเพื่อศึกษาการเลือกตำแหน่งเซนเซอร์ PM2.5 ภายใต้ข้อจำกัดจำนวนเซนเซอร์และการสูญเสียข้อมูล**

**Application of Graph Signal Theory to PM2.5 Sensor Placement under Sensor-Budget and Data-Loss Constraints**

## ตัวเลือก 2 — เน้นคณิตศาสตร์มากขึ้น

**การศึกษาการสุ่มตัวอย่างสัญญาณบนกราฟสำหรับการเลือกตำแหน่งจุดตรวจวัด PM2.5 ภายใต้ข้อจำกัดทรัพยากร**

**A Study of Graph Signal Sampling for PM2.5 Monitoring-Site Selection under Resource Constraints**

## ตัวเลือก 3 — เน้น Reconstruction

**การประยุกต์การสุ่มตัวอย่างเชิงสเปกตรัมบนกราฟเพื่อการสร้างข้อมูล PM2.5 กลับจากเครือข่ายตรวจวัดแบบจำกัดจุด**

**Application of Spectral Graph Sampling to PM2.5 Reconstruction from Sparse Monitoring Networks**

---

# 42. Recommended Competition Classification

**Mathematics and Statistics (MA)**  
**Applied and Computational Mathematics (MAAP)**

เหตุผล: งานใช้ graph theory, matrix/eigenvalue decomposition, spectral representation, sampling, optimization และ computational experiments เพื่อแก้ปัญหาเชิงประยุกต์ โดย Webapp เป็นเพียงเครื่องมือสาธิตและทำซ้ำการทดลอง

---

# 43. Literature Starter Pack

## Graph Signal Processing + Air Pollution

1. Ferrer-Cid, P., Barcelo-Ordinas, J. M., Garcia-Vidal, J. (2022). **Data reconstruction applications for IoT air pollution sensor networks using graph signal processing.** Journal of Network and Computer Applications, 205, 103434. DOI: 10.1016/j.jnca.2022.103434
2. Ferrer-Cid, P., Barcelo-Ordinas, J. M., Garcia-Vidal, J. (2022). **Graph Signal Reconstruction Techniques for IoT Air Pollution Monitoring Platforms.** IEEE Internet of Things Journal, 9(24), 25350–25362. DOI: 10.1109/JIOT.2022.3196154

## Robust Sampling

3. Guler, B., Jayawant, A., Avestimehr, A. S., Ortega, A. (2019). **Robust Graph Signal Sampling.** ICASSP 2019, 7520–7524. DOI: 10.1109/ICASSP.2019.8682340

## Applied Sensor Placement on Graphs

4. **Sensor placement method for water distribution networks based on sampling of non-bandlimited graph signals.** Digital Signal Processing, 156 (2025), 104809. DOI: 10.1016/j.dsp.2024.104809
5. Bezerra, D. et al. **A novel approach based on graph signal processing and sampling theory to set pressure sensors in water distribution networks.** Expert Systems with Applications, 270 (2025), 126306. DOI: 10.1016/j.eswa.2024.126306

## Thailand Data

6. กรมควบคุมมลพิษ — Air4Thai / Envilink Data Catalog: ข้อมูล PM2.5 รายชั่วโมงและรายวันจากสถานีทั่วประเทศ
7. กระทรวงทรัพยากรธรรมชาติและสิ่งแวดล้อม — ชุดข้อมูลสถานีตรวจวัดคุณภาพอากาศและ metadata ของสถานี

---

# 44. Pre-Proposal Go / No-Go Checklist

ก่อนล็อก Proposal ต้องตอบ “ผ่าน” ให้ได้อย่างน้อย:

- [ ] Air4Thai data ที่ต้องใช้สามารถดึงและ archive ได้อย่าง reproducible
- [ ] มีสถานี usable พร้อมกันมากพอสำหรับ held-out reconstruction
- [ ] baseline reconstruction pipeline ทำงาน
- [ ] ไม่มี data leakage ใน correlation graph
- [ ] graph signal มี low-frequency/smooth structure เพียงพออย่างน้อยหนึ่ง graph model
- [ ] GSP / Coverage / Random สามารถเปรียบเทียบภายใต้ candidate pool เดียวกัน
- [ ] มี sensor-budget curve เบื้องต้น
- [ ] มี failure experiment เบื้องต้น
- [ ] มีข้อค้นพบ pilot อย่างน้อยหนึ่งข้อที่ไม่ใช่ UI result
- [ ] Webapp architecture ไม่บังคับให้เปลี่ยน methodology เพื่อความสวย

หาก 3 ข้อสำคัญต่อไปนี้ไม่ผ่าน ต้องปรับหัวข้อก่อนสร้าง Webapp เต็ม:

1. usable station count ไม่พอ
2. graph reconstruction ไม่ดีกว่า trivial baselines ในทุก formulation
3. ไม่มี measurable difference ระหว่าง sensor-placement methods

---

# 45. Blueprint Decision

**สถานะที่แนะนำ: GO — ทำ Pilot Research ก่อนสร้าง Product**

แก่นที่ควรล็อกคือ

$$
\boxed{
\text{Graph Signal Sampling}
+
\text{Sensor Budget}
+
\text{Data Loss}
+
\text{Thailand PM2.5}
+
\text{Geometric vs Spectral Comparison}
}
$$

Public Webapp เป็น Proof of Concept ที่มีศักยภาพสูง แต่คุณค่าของโครงงานต้องถูกตัดสินจาก **mathematical model, experimental rigor และ findings** ก่อน

---

# Canonical Mathematical Storyline

```text
Graph Construction
      ↓
Graph Laplacian
      ↓
Spectral Representation
      ↓
Low-frequency Diagnostic / Model
      ↓
Sampling Set under Fixed K
      ↓
Reconstruction from Selected Samples
      ↓
Compare against Held-out Ground Truth
      ↓
Simulate Sensor Failure
      ↓
Reconstruct Again
      ↓
RMSE / MAE / Worst Error / Coverage / Spectral Stability
      ↓
Statistical Comparison and Trade-off Analysis
```

---

# Guiding Principle

> **Mathematics first.  
> Experiment second.  
> Visualization third.**

---

**Project:** PM2.5 Sensor Placement using Graph Signal Processing  
**Competition Context:** YSC  
**Primary Field:** Mathematics & Statistics / Applied Mathematics  
**Webapp Role:** Proof of Concept  
**Blueprint Version:** 8 August 2026
