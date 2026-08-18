/**
 * PM2.5 Network Mathematical Model - Precision Canvas Chart Renderer
 * Light Premium Enterprise Theme
 */

const ChartRenderer = (function() {

  function setupRetinaCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 400;
    const height = rect.height || 250;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx, width, height };
  }

  /**
   * 1. Render Reliability Diagram (Calibration Curve)
   */
  function renderCalibrationChart(canvasId, calibM0, calibM2b) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const { ctx, width, height } = setupRetinaCanvas(canvas);

    const padL = 40, padR = 16, padT = 16, padB = 34;
    const plotW = width - padL - padR;
    const plotH = height - padT - padB;

    ctx.clearRect(0, 0, width, height);

    // Light Theme Grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 5; i++) {
      const v = i / 5;
      const y = padT + plotH - v * plotH;
      const x = padL + v * plotW;

      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + plotW, y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x, padT);
      ctx.lineTo(x, padT + plotH);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText((v * 100).toFixed(0) + '%', padL - 6, y + 3);

      ctx.textAlign = 'center';
      ctx.fillText((v * 100).toFixed(0) + '%', x, height - 12);
    }

    ctx.fillStyle = '#475569';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Forecasted Probability (π)', padL + plotW / 2, height - 1);

    // Ideal 45-degree Perfect Line
    ctx.strokeStyle = '#94a3b8';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padL, padT + plotH);
    ctx.lineTo(padL + plotW, padT);
    ctx.stroke();
    ctx.setLineDash([]);

    function drawSeries(data, color) {
      if (!data || data.length === 0) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      data.forEach((pt, i) => {
        const px = padL + pt.meanPredicted * plotW;
        const py = padT + plotH - pt.fractionPositives * plotH;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();

      ctx.fillStyle = color;
      data.forEach(pt => {
        const px = padL + pt.meanPredicted * plotW;
        const py = padT + plotH - pt.fractionPositives * plotH;
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    }

    drawSeries(calibM0, '#0284c7');
    drawSeries(calibM2b, '#db2777');

    // Legend
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'left';

    ctx.fillStyle = '#0284c7';
    ctx.fillRect(padL + 10, padT + 6, 10, 10);
    ctx.fillStyle = '#334155';
    ctx.fillText('M0 Baseline', padL + 25, padT + 15);

    ctx.fillStyle = '#db2777';
    ctx.fillRect(padL + 120, padT + 6, 10, 10);
    ctx.fillStyle = '#334155';
    ctx.fillText('M2b Proposed', padL + 135, padT + 15);
  }

  /**
   * 2. Render Precision-Recall Curve
   */
  function renderPRCurveChart(canvasId, prM0, prM2b, prevalence = 0.082) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const { ctx, width, height } = setupRetinaCanvas(canvas);

    const padL = 40, padR = 16, padT = 16, padB = 34;
    const plotW = width - padL - padR;
    const plotH = height - padT - padB;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 5; i++) {
      const v = i / 5;
      const y = padT + plotH - v * plotH;
      const x = padL + v * plotW;

      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + plotW, y);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(v.toFixed(1), padL - 6, y + 3);

      ctx.textAlign = 'center';
      ctx.fillText(v.toFixed(1), x, height - 12);
    }

    ctx.fillStyle = '#475569';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Recall (Sensitivity)', padL + plotW / 2, height - 1);

    // Prevalence line
    const prevY = padT + plotH - prevalence * plotH;
    ctx.strokeStyle = '#94a3b8';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padL, prevY);
    ctx.lineTo(padL + plotW, prevY);
    ctx.stroke();
    ctx.setLineDash([]);

    function drawPR(points, color, strokeW = 2.5) {
      if (!points || points.length === 0) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeW;
      ctx.beginPath();

      points.forEach((pt, i) => {
        const x = padL + Math.min(1, Math.max(0, pt.recall)) * plotW;
        const y = padT + plotH - Math.min(1, Math.max(0, pt.precision)) * plotH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    drawPR(prM0.points, '#0284c7', 2);
    drawPR(prM2b.points, '#db2777', 2.8);

    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'left';

    ctx.fillStyle = '#0284c7';
    ctx.fillRect(padL + 10, padT + 6, 10, 10);
    ctx.fillStyle = '#334155';
    ctx.fillText(`M0 Baseline (${prM0.prAuc.toFixed(3)})`, padL + 25, padT + 15);

    ctx.fillStyle = '#db2777';
    ctx.fillRect(padL + 150, padT + 6, 10, 10);
    ctx.fillStyle = '#334155';
    ctx.fillText(`M2b Full (${prM2b.prAuc.toFixed(3)})`, padL + 165, padT + 15);
  }

  /**
   * 3. Render Bootstrap 95% CI Histogram
   */
  function renderBootstrapChart(canvasId, bootstrapResults) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const { ctx, width, height } = setupRetinaCanvas(canvas);

    const padL = 40, padR = 16, padT = 20, padB = 34;
    const plotW = width - padL - padR;
    const plotH = height - padT - padB;

    ctx.clearRect(0, 0, width, height);

    const dist = bootstrapResults.deltaPRAUC.distribution || [];
    if (dist.length === 0) return;

    const minV = dist[0];
    const maxV = dist[dist.length - 1];
    const span = Math.max(maxV - minV, 0.01);
    const numBins = 24;
    const bins = new Array(numBins).fill(0);

    dist.forEach(v => {
      let b = Math.floor(((v - minV) / span) * numBins);
      if (b >= numBins) b = numBins - 1;
      bins[b]++;
    });

    const maxCount = Math.max(...bins);
    const barW = plotW / numBins;

    bins.forEach((cnt, idx) => {
      const h = (cnt / maxCount) * plotH;
      const x = padL + idx * barW;
      const y = padT + plotH - h;

      const binVal = minV + (idx + 0.5) * (span / numBins);
      ctx.fillStyle = binVal > 0 ? 'rgba(37, 99, 235, 0.7)' : 'rgba(239, 68, 68, 0.7)';
      ctx.fillRect(x + 1, y, barW - 2, h);
    });

    // 95% CI bounds
    const ciLowX = padL + ((bootstrapResults.deltaPRAUC.ciLow - minV) / span) * plotW;
    const ciHighX = padL + ((bootstrapResults.deltaPRAUC.ciHigh - minV) / span) * plotW;

    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ciLowX, padT);
    ctx.lineTo(ciLowX, padT + plotH);
    ctx.moveTo(ciHighX, padT);
    ctx.lineTo(ciHighX, padT + plotH);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(minV.toFixed(3), padL, height - 12);
    ctx.fillText(bootstrapResults.deltaPRAUC.mean.toFixed(3) + ' (Mean)', padL + plotW / 2, height - 12);
    ctx.fillText(maxV.toFixed(3), padL + plotW, height - 12);

    ctx.fillStyle = '#475569';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText('Paired ΔPR-AUC (M2b − M0)', padL + plotW / 2, height - 1);
  }

  /**
   * 4. Render Lead Time Horizon Decay
   */
  function renderLeadTimeChart(canvasId, leadTimeData) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const { ctx, width, height } = setupRetinaCanvas(canvas);

    const padL = 40, padR = 16, padT = 20, padB = 34;
    const plotW = width - padL - padR;
    const plotH = height - padT - padB;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 4; i++) {
      const v = i * 0.15;
      const y = padT + plotH - (v / 0.6) * plotH;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + plotW, y);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(v.toFixed(2), padL - 6, y + 3);
    }

    const n = leadTimeData.length;
    const stepX = plotW / (n - 1);

    function drawLine(prop, color) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      leadTimeData.forEach((d, i) => {
        const x = padL + i * stepX;
        const y = padT + plotH - (d[prop] / 0.6) * plotH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      ctx.fillStyle = color;
      leadTimeData.forEach((d, i) => {
        const x = padL + i * stepX;
        const y = padT + plotH - (d[prop] / 0.6) * plotH;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    drawLine('prAuc_M0', '#0284c7');
    drawLine('prAuc_M2b', '#db2777');

    leadTimeData.forEach((d, i) => {
      const x = padL + i * stepX;
      ctx.fillStyle = '#475569';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.horizon, x, height - 12);
    });

    ctx.fillStyle = '#475569';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Forecast Horizon (Δ hours)', padL + plotW / 2, height - 1);

    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'left';

    ctx.fillStyle = '#0284c7';
    ctx.fillRect(padL + 10, padT + 4, 10, 10);
    ctx.fillStyle = '#334155';
    ctx.fillText('M0 Baseline', padL + 25, padT + 13);

    ctx.fillStyle = '#db2777';
    ctx.fillRect(padL + 120, padT + 4, 10, 10);
    ctx.fillStyle = '#334155';
    ctx.fillText('M2b Precursor', padL + 135, padT + 13);
  }

  return {
    renderCalibrationChart,
    renderPRCurveChart,
    renderBootstrapChart,
    renderLeadTimeChart
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChartRenderer;
}
