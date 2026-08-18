/**
 * PM2.5 Network Mathematical Model - Math Inspector & KaTeX Formula Manager
 * Dynamic mathematical breakdown of real calculations at each step
 */

const MathInspector = (function() {

  // Check KaTeX availability
  function renderLatex(element, texString, displayMode = false) {
    if (!element) return;
    if (typeof katex !== 'undefined') {
      try {
        katex.render(texString, element, {
          displayMode: displayMode,
          throwOnError: false
        });
        return;
      } catch (err) {
        console.warn('KaTeX rendering error:', err);
      }
    }
    // Fallback to text
    element.textContent = texString;
  }

  /**
   * Populate Static Formula Displays on Page Load
   */
  function initStaticFormulas() {
    document.querySelectorAll('[data-tex]').forEach(el => {
      const tex = el.getAttribute('data-tex');
      const isDisplay = el.classList.contains('display-mode') || el.tagName === 'DIV';
      renderLatex(el, tex, isDisplay);
    });

    setupMathToggles();
  }

  /**
   * Set up Hide/Show Math Toggles
   */
  function setupMathToggles() {
    document.querySelectorAll('.math-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.math-card') || btn.parentElement.parentElement;
        const display = card.querySelector('.formula-display');
        if (!display) return;

        const isCollapsed = display.classList.contains('collapsed');
        if (isCollapsed) {
          display.classList.remove('collapsed');
          btn.innerHTML = '<span>ซ่อนสมการ ▴</span>';
        } else {
          display.classList.add('collapsed');
          btn.innerHTML = '<span>ดูสมการ ▾</span>';
        }
      });
    });
  }

  /**
   * Update Cell Inspector Panel with Real Dynamic Math
   */
  function updateCellInspector(cell, stations, scenario) {
    const coordsEl = document.getElementById('inspectorCoords');
    const probEl = document.getElementById('inspectorProb');
    const phiWEl = document.getElementById('inspectorPhiW');
    const phiDEl = document.getElementById('inspectorPhiD');
    const nearestEl = document.getElementById('inspectorNearest');
    const excludedBadge = document.getElementById('inspectorExclusionBadge');
    const breakdownEl = document.getElementById('inspectorBreakdown');

    if (coordsEl) coordsEl.textContent = `${cell.lat.toFixed(2)}°N, ${cell.lon.toFixed(2)}°E (Elev: ${cell.elevation}m)`;
    if (probEl) probEl.textContent = (cell.modelHierarchy['M2b'] * 100).toFixed(1) + '%';
    if (phiWEl) phiWEl.textContent = cell.scores.phi_W.toFixed(3);
    if (phiDEl) phiDEl.textContent = cell.scores.phi_D.toFixed(3);
    if (nearestEl) nearestEl.textContent = `${cell.scores.nearestStationName} (${cell.scores.nearestDistance} km, a=${cell.scores.nearestA})`;

    if (excludedBadge) {
      if (cell.isExcluded) {
        excludedBadge.className = 'card-badge badge-rose';
        excludedBadge.textContent = 'Excluded (E_i = 1: Prior Fire)';
      } else {
        excludedBadge.className = 'card-badge badge-emerald';
        excludedBadge.textContent = 'Active Test Sample (E_i = 0)';
      }
    }

    if (breakdownEl) {
      const topInfluences = cell.scores.stationInfluences.slice(0, 3);
      let html = `
        <div class="calc-row"><span class="calc-label">Historical Rate (C_i):</span><span class="calc-val">${cell.C_i.toFixed(4)} (${cell.n_hot}/${cell.n_total} days)</span></div>
        <div class="calc-row"><span class="calc-label">Wind-To Vector:</span><span class="calc-val">${scenario.windField.toDeg}° @ ${scenario.windField.speedAvg} m/s</span></div>
        <div class="calc-row"><span class="calc-label">Linear Logit (η_M2b):</span><span class="calc-val">${cell.modelHierarchy.eta_M2b}</span></div>
        <div class="calc-row"><span class="calc-label">Logistic π_i(24h):</span><span class="calc-val">${(cell.modelHierarchy['M2b'] * 100).toFixed(2)}%</span></div>
        <div style="margin-top: 8px; font-weight: 700; font-size: 11px; color: #94a3b8;">Top Network Influences (q_ij = D_ij · W_ij):</div>
      `;

      topInfluences.forEach(inf => {
        html += `
          <div class="calc-row" style="font-size: 11px;">
            <span class="calc-label">• ${inf.name.split(',')[0]} (${inf.distance.toFixed(0)}km):</span>
            <span class="calc-val">D=${inf.D_ij.toFixed(2)}, W=${inf.W_ij.toFixed(2)} ⇒ <b>q=${inf.q_ij.toFixed(3)}</b></span>
          </div>
        `;
      });

      breakdownEl.innerHTML = html;
    }
  }

  /**
   * Open Mathematical Proof Modal with Interactive Breakdown
   */
  function openMathModal(stepName) {
    const modal = document.getElementById('mathProofModal');
    const titleEl = document.getElementById('mathModalTitle');
    const bodyEl = document.getElementById('mathModalBody');
    if (!modal || !titleEl || !bodyEl) return;

    let content = '';
    if (stepName === 'anomaly') {
      titleEl.textContent = '1. Station PM2.5 Anomaly Formulation (Robust Median & MAD)';
      content = `
        <p>เพื่อขจัดความแตกต่างของระดับฝุ่นพื้นฐานในแต่ละพื้นที่ และลดผลกระทบจากค่ากระโดดผิดปกติ (Outliers) โครงงานใช้ <b>Median</b> และ <b>Median Absolute Deviation (MAD)</b> คำนวณจากหน้าต่างเวลาย้อนหลัง:</p>
        <div class="formula-display" data-tex="z_j(t) = \\frac{p_j(t) - \\operatorname{med}_j(t)}{1.4826 \\cdot \\operatorname{MAD}_j(t) + \\varepsilon}"></div>
        <div class="formula-display" data-tex="a_j(t) = \\max(0, z_j(t))"></div>
        <p><b>คำอธิบายตัวแปร:</b></p>
        <ul style="padding-left: 20px; line-height: 1.7; font-size: 13px;">
          <li><code>p_j(t)</code>: ค่าความเข้มข้น PM2.5 ที่สถานี <code>j</code> ณ เวลา <code>t</code> (06:00 น.)</li>
          <li><code>med_j(t)</code>: ค่ามัธยฐานของฝุ่นย้อนหลังในหน้าต่างเวลา (เช่น 14, 30, 60 วัน)</li>
          <li><code>MAD_j(t)</code>: ค่ามัธยฐานของผลต่างสัมบูรณ์จากมัธยฐาน <code>median(|p_j(s) - med_j(t)|)</code></li>
          <li><code>1.4826</code>: ตัวคูณปรับสเกลให้เทียบเท่า Standard Deviation ภายใต้การแจกแจงแบบปกติ</li>
          <li><code>a_j(t)</code>: ค่าความผิดปกติเฉพาะส่วนที่เป็นบวก (Positive Anomaly) ป้องกันการนำค่าฝุ่นต่ำผิดปกติมาลดทอนคะแนนไฟ</li>
        </ul>
      `;
    } else if (stepName === 'network') {
      titleEl.textContent = '2. Spatial Distance & Wind-Direction Network Scores';
      content = `
        <p>การสร้างคะแนนเครือข่าย $\\Phi_i^{(D)}(t)$ และ $\\Phi_i(t)$ ถ่วงน้ำหนักด้วยระยะทางและทิศทางลมระหว่างช่องกริด $i$ กับทุกสถานี $j$:</p>
        <div class="formula-display" data-tex="D_{ij} = \\exp\\left(-\\frac{d_{ij}}{\\ell}\\right), \\qquad W_{ij}(t) = \\exp\\left(\\kappa \\left[\\cos(\\theta_{ij} - \\psi_i(t)) - 1\\right]\\right)"></div>
        <div class="formula-display" data-tex="q_{ij}(t) = D_{ij} W_{ij}(t), \\qquad \\Phi_i(t) = \\frac{\\sum_{j=1}^{M} q_{ij}(t) a_j(t)}{\\sum_{j=1}^{M} q_{ij}(t) + \\varepsilon}"></div>
        <p><b>การทำงาน:</b></p>
        <ul style="padding-left: 20px; line-height: 1.7; font-size: 13px;">
          <li><code>d_{ij}</code>: ระยะทางตามผิวโลก (Haversine Distance) ระหว่างช่องกริด <code>i</code> กับสถานี <code>j</code></li>
          <li><code>\\ell</code>: ระยะทางอ้างอิง Characteristic length scale (เช่น 25, 50, 100 km)</li>
          <li><code>\\theta_{ij}</code>: มุมทิศ (Bearing) จากช่องกริด <code>i</code> ไปยังสถานี <code>j</code></li>
          <li><code>\\psi_i(t)</code>: ทิศทางที่ลมพัดไป (Wind-to direction) ณ ช่องกริด <code>i</code></li>
          <li>หากสถานี <code>j</code> อยู่ใต้ลมของช่องกริด <code>i</code> (<code>\\theta_{ij} \\approx \\psi_i</code>) ค่า <code>\\cos(\\theta - \\psi) = 1 \\implies W_{ij} = 1</code> ทำให้น้ำหนักสูงสุด</li>
          <li>หาก $\\kappa = 0$ จะได้ $W_{ij} = 1$ เสมอ ซึ่งลดรูปเป็นคะแนนถ่วงระยะทางอย่างเดียว $\\Phi_i^{(D)}(t)$</li>
        </ul>
      `;
    } else if (stepName === 'glm') {
      titleEl.textContent = '3. Logistic Generalized Linear Model (Logistic GLM)';
      content = `
        <p>ใช้แบบจำลอง Logistic GLM เพื่อความโปร่งใสและตีความสัมประสิทธิ์ Odds Ratio ได้อย่างถูกต้องตามระเบียบวิธีทางคณิตศาสตร์และสถิติ:</p>
        <div class="formula-display" data-tex="\\pi_i(t) = P(Y_i(t; 24\\text{h}) = 1 \\mid X_i(t)) = \\frac{1}{1 + \\exp(-\\eta_i(t))}"></div>
        <div class="formula-display" data-tex="\\eta_i(t) = \\beta_0 + \\beta^\\top X_i(t)"></div>
        <p><b>ลำดับแบบจำลอง 5 ระดับ (Stepwise Hierarchy):</b></p>
        <ul style="padding-left: 20px; line-height: 1.7; font-size: 13px;">
          <li><b>M-1:</b> $\\pi_i = \\text{prevalence}(\\bar{Y}_{\\text{train}})$ (Baseline Floor)</li>
          <li><b>M0:</b> สภาพอากาศ + ภูมิประเทศ SRTM + พืชพรรณ MODIS + ฤดูกาล $S_1, S_2$ + แนวโน้มอดีต $C_i$</li>
          <li><b>M1:</b> $M_0 + a_{\\text{nearest}}(t)$ (ฝุ่นสถานีใกล้สุด)</li>
          <li><b>M2a:</b> $M_0 + \\Phi_i^{(D)}(t)$ (เครือข่ายถ่วงระยะทาง)</li>
          <li><b>M2b:</b> $M_0 + \\Phi_i(t)$ (เครือข่ายถ่วงระยะทาง + ทิศทางลม — Proposed Full Model)</li>
        </ul>
      `;
    } else if (stepName === 'exclusion') {
      titleEl.textContent = '4. Spatiotemporal Exclusion & Probabilistic Evaluation';
      content = `
        <p>การตัดเหตุการณ์เดิมตามพื้นที่และเวลาเพื่อป้องกัน Data Leakage และแยกการพยากรณ์ก่อนเกิดเหตุออกจากการตรวจพบควัน:</p>
        <div class="formula-display" data-tex="E_i(t; \\tau_{\\text{excl}}, r_{\\text{excl}}) = \\begin{cases} 1 & \\text{หากพบจุดความร้อนในรัศมี } r_{\\text{excl}} \\text{ ในช่วง } t-\\tau_{\\text{excl}} < s \\le t \\\\ 0 & \\text{กรณีอื่น} \\end{cases}"></div>
        <div class="formula-display" data-tex="\\operatorname{BS} = \\frac{1}{N} \\sum_{k=1}^N (\\pi_k - Y_k)^2"></div>
        <p><b>ระเบียบวิธีประเมินผล:</b></p>
        <ul style="padding-left: 20px; line-height: 1.7; font-size: 13px;">
          <li>ทดสอบสมมติฐานเฉพาะกลุ่มตัวอย่างที่ผ่านเกณฑ์ <code>E_i = 0</code> เท่านั้น</li>
          <li>ประเมินด้วย <b>Brier Score (BS)</b> และ <b>Precision–Recall AUC (PR-AUC)</b> เพื่อรองรับ Imbalanced Data</li>
          <li>ทดสอบความไม่แน่นอนด้วย <b>Paired Time-Block Bootstrap (500-1000 Replications)</b> เพื่อคำนวณช่วงความเชื่อมั่น 95% CI ของผลต่าง $\\Delta\\text{BS}$ และ $\\Delta\\text{PR-AUC}$</li>
        </ul>
      `;
    }

    bodyEl.innerHTML = content;
    bodyEl.querySelectorAll('[data-tex]').forEach(el => {
      renderLatex(el, el.getAttribute('data-tex'), true);
    });

    modal.classList.add('open');
  }

  return {
    initStaticFormulas,
    updateCellInspector,
    openMathModal
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MathInspector;
}
