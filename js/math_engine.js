/**
 * PM2.5 Network Mathematical Model Engine (YSC 2027)
 * Mathematical and Statistical Formulation according to blueprint.md
 */

const MathEngine = (function() {
  const EPSILON = 1e-7;
  const EARTH_RADIUS_KM = 6371.0;

  /**
   * Calculate Median of numeric array
   */
  function median(arr) {
    if (!arr || arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  /**
   * Calculate Median Absolute Deviation (MAD)
   */
  function mad(arr, med) {
    if (!arr || arr.length === 0) return 0;
    const m = med !== undefined ? med : median(arr);
    const absDevs = arr.map(x => Math.abs(x - m));
    return median(absDevs);
  }

  /**
   * Calculate Station PM2.5 Standardized Anomaly z_j(t) and Positive Anomaly a_j(t)
   * Formula: z_j(t) = (p_j(t) - med_j(t)) / (1.4826 * MAD_j(t) + eps)
   * a_j(t) = max(0, z_j(t))
   */
  function calculateStationAnomaly(currentValue, pastWindow) {
    const med = median(pastWindow);
    const m = mad(pastWindow, med);
    const denom = 1.4826 * m + EPSILON;
    const z = (currentValue - med) / denom;
    const a = Math.max(0, z);
    return {
      currentValue,
      median: med,
      mad: m,
      z: parseFloat(z.toFixed(4)),
      a: parseFloat(a.toFixed(4))
    };
  }

  /**
   * Calculate Haversine Distance (in kilometers) between two coordinates (lat, lon in degrees)
   */
  function haversineDistance(lat1, lon1, lat2, lon2) {
    const toRad = deg => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const phi1 = toRad(lat1);
    const phi2 = toRad(lat2);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c;
  }

  /**
   * Calculate Bearing Angle theta_ij (radians, 0 to 2*PI, clockwise from North)
   */
  function bearingAngle(lat1, lon1, lat2, lon2) {
    const toRad = deg => (deg * Math.PI) / 180;
    const phi1 = toRad(lat1);
    const phi2 = toRad(lat2);
    const dLon = toRad(lon2 - lon1);

    const y = Math.sin(dLon) * Math.cos(phi2);
    const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLon);
    let brng = Math.atan2(y, x);
    if (brng < 0) {
      brng += 2 * Math.PI;
    }
    return brng;
  }

  /**
   * Distance Weight D_ij = exp(-d_ij / ell)
   */
  function distanceWeight(d_ij, ell = 50.0) {
    return Math.exp(-d_ij / Math.max(ell, 1.0));
  }

  /**
   * Wind Alignment Weight W_ij(t) = exp(kappa * [cos(theta_ij - psi_i(t)) - 1])
   * theta_ij: bearing from cell i to station j
   * psi_i: wind-to direction (direction wind blows TOWARDS) at cell i
   * kappa: concentration parameter (kappa >= 0)
   */
  function windAlignmentWeight(theta_ij, psi_i, kappa = 1.0) {
    if (kappa <= 0) return 1.0;
    const diff = theta_ij - psi_i;
    return Math.exp(kappa * (Math.cos(diff) - 1.0));
  }

  /**
   * Compute Distance-Only Network Score Phi_i^(D)(t) and Distance+Wind Network Score Phi_i(t)
   * cell: { lat, lon, windToRad }
   * stations: array of { lat, lon, a, name }
   * params: { ell, kappa, rMax }
   */
  function computeNetworkScoresForCell(cell, stations, params = {}) {
    const ell = params.ell || 50.0;
    const kappa = params.kappa !== undefined ? params.kappa : 1.0;
    const rMax = params.rMax || 150.0;

    let sumDistWeights = 0;
    let sumDistScore = 0;

    let sumTotalWeights = 0;
    let sumTotalScore = 0;

    let validStationCount = 0;
    let minDistance = Infinity;
    let nearestStation = null;
    const stationInfluences = [];

    stations.forEach(st => {
      const d_ij = haversineDistance(cell.lat, cell.lon, st.lat, st.lon);
      if (d_ij < minDistance) {
        minDistance = d_ij;
        nearestStation = st;
      }

      if (d_ij <= rMax) {
        validStationCount++;
        const theta_ij = bearingAngle(cell.lat, cell.lon, st.lat, st.lon);
        const D_ij = distanceWeight(d_ij, ell);
        const W_ij = windAlignmentWeight(theta_ij, cell.windToRad, kappa);
        const q_ij = D_ij * W_ij;

        sumDistWeights += D_ij;
        sumDistScore += D_ij * st.a;

        sumTotalWeights += q_ij;
        sumTotalScore += q_ij * st.a;

        stationInfluences.push({
          name: st.name,
          distance: d_ij,
          bearingRad: theta_ij,
          bearingDeg: (theta_ij * 180) / Math.PI,
          D_ij,
          W_ij,
          q_ij,
          a: st.a
        });
      }
    });

    const phi_D = sumDistWeights > EPSILON ? sumDistScore / (sumDistWeights + EPSILON) : 0;
    const phi_W = sumTotalWeights > EPSILON ? sumTotalScore / (sumTotalWeights + EPSILON) : 0;

    return {
      phi_D: parseFloat(phi_D.toFixed(4)),
      phi_W: parseFloat(phi_W.toFixed(4)),
      nearestStationName: nearestStation ? nearestStation.name : 'N/A',
      nearestDistance: parseFloat(minDistance.toFixed(2)),
      nearestA: nearestStation ? nearestStation.a : 0,
      validStationCount,
      isCovered: validStationCount > 0 && sumTotalWeights > 0.01,
      stationInfluences: stationInfluences.sort((a, b) => b.q_ij - a.q_ij)
    };
  }

  /**
   * Harmonic Seasonality S1(d), S2(d)
   */
  function harmonicSeasonality(dayOfYear) {
    const angle = (2 * Math.PI * dayOfYear) / 365.0;
    return {
      S1: Math.sin(angle),
      S2: Math.cos(angle)
    };
  }

  /**
   * Laplace-Smoothed Historical Hotspot Rate C_i
   * C_i = (n_i^hot + 0.5) / (n_i + 1)
   */
  function historicalTendency(n_hot, n_total) {
    return (n_hot + 0.5) / (n_total + 1.0);
  }

  /**
   * Sigmoid / Logistic Function: pi = 1 / (1 + exp(-eta))
   */
  function sigmoid(eta) {
    if (eta > 35) return 1.0;
    if (eta < -35) return 0.0;
    return 1.0 / (1.0 + Math.exp(-eta));
  }

  /**
   * Standard Logistic GLM Inference for the 5 Stepwise Hierarchy Models:
   * M-1: Constant-Prevalence Benchmark
   * M0:  Physical Baseline (Weather + DEM + NDVI + Seasonality + C_i)
   * M1:  M0 + Nearest-Station Anomaly (a_nearest)
   * M2a: M0 + Distance-only Network Precursor (Phi_D)
   * M2b: M0 + Distance + Wind Network Precursor (Phi_W)
   */
  function evaluateModelHierarchy(cell, scores, prevalence = 0.082) {
    // Standardized Feature Vector (Zero-mean, unit-variance scaled from training distributions)
    const tempZ = (cell.temp2m - 28.0) / 4.5;
    const rhZ = (45.0 - cell.rh) / 12.0; // Lower RH increases fire risk
    const windSpdZ = (cell.windSpeed - 3.2) / 1.8;
    const rainZ = (0.5 - cell.rain24h) / 2.0;
    const soilMoistZ = (0.18 - cell.soilMoisture) / 0.08;
    const elevZ = (cell.elevation - 600.0) / 350.0;
    const slopeZ = (cell.slope - 15.0) / 8.0;
    const ndviZ = (0.45 - cell.ndvi) / 0.15; // Drier vegetation increases risk
    const seasonS1 = cell.seasonS1 || 0.3;
    const seasonS2 = cell.seasonS2 || -0.8;
    const c_iZ = (cell.C_i - 0.08) / 0.06;

    // Linear Predictor eta for M0 (Physical Baseline)
    const beta_0 = -2.85;
    const eta_M0 = beta_0 +
      (0.38 * tempZ) +
      (0.42 * rhZ) +
      (0.24 * windSpdZ) +
      (0.31 * rainZ) +
      (0.28 * soilMoistZ) +
      (0.18 * elevZ) +
      (0.22 * slopeZ) +
      (0.35 * ndviZ) +
      (0.15 * seasonS1) +
      (0.20 * seasonS2) +
      (0.72 * c_iZ);

    // M-1: Constant prevalence
    const pi_M_neg1 = prevalence;

    // M0: Physical
    const pi_M0 = sigmoid(eta_M0);

    // M1: Local Nearest PM2.5 Anomaly
    const beta_a_nearest = 0.48;
    const eta_M1 = eta_M0 + (beta_a_nearest * scores.nearestA);
    const pi_M1 = sigmoid(eta_M1);

    // M2a: Distance Network Score Phi_D
    const beta_phi_D = 0.76;
    const eta_M2a = eta_M0 + (beta_phi_D * scores.phi_D);
    const pi_M2a = sigmoid(eta_M2a);

    // M2b: Proposed Full Model (Distance + Wind Score Phi_W)
    const beta_phi_W = 1.05;
    const eta_M2b = eta_M0 + (beta_phi_W * scores.phi_W);
    const pi_M2b = sigmoid(eta_M2b);

    return {
      'M-1': parseFloat(pi_M_neg1.toFixed(4)),
      'M0': parseFloat(pi_M0.toFixed(4)),
      'M1': parseFloat(pi_M1.toFixed(4)),
      'M2a': parseFloat(pi_M2a.toFixed(4)),
      'M2b': parseFloat(pi_M2b.toFixed(4)),
      eta_M0: parseFloat(eta_M0.toFixed(3)),
      eta_M1: parseFloat(eta_M1.toFixed(3)),
      eta_M2a: parseFloat(eta_M2a.toFixed(3)),
      eta_M2b: parseFloat(eta_M2b.toFixed(3))
    };
  }

  /**
   * Spatiotemporal Exclusion Evaluator
   * E_i(t; tau_excl, r_excl) = 1 if past active hotspot occurred within r_excl in [t - tau_excl, t]
   */
  function evaluateExclusion(cell, pastHotspots, tauExclHours = 24, rExclKm = 10) {
    if (rExclKm <= 0) return 0;
    for (let i = 0; i < pastHotspots.length; i++) {
      const h = pastHotspots[i];
      if (h.hoursAgo <= tauExclHours) {
        const d = haversineDistance(cell.lat, cell.lon, h.lat, h.lon);
        if (d <= rExclKm) {
          return 1; // Excluded (Smoke / prior ongoing fire)
        }
      }
    }
    return 0; // Valid prospective test sample
  }

  /**
   * Brier Score: BS = (1 / N) * sum((pi_k - Y_k)^2)
   */
  function calculateBrierScore(predictions, groundTruths) {
    if (!predictions || predictions.length === 0) return 0;
    let sum = 0;
    for (let i = 0; i < predictions.length; i++) {
      const diff = predictions[i] - groundTruths[i];
      sum += diff * diff;
    }
    return parseFloat((sum / predictions.length).toFixed(5));
  }

  /**
   * Calculate PR-AUC (Precision-Recall Area Under Curve) and PR curve coordinates
   */
  function calculatePRAUC(predictions, groundTruths) {
    const n = predictions.length;
    if (n === 0) return { prAuc: 0, points: [] };

    // Pair and sort by predicted probability descending
    const paired = predictions.map((p, i) => ({ p, y: groundTruths[i] }))
      .sort((a, b) => b.p - a.p);

    const totalPositives = groundTruths.reduce((acc, v) => acc + v, 0);
    if (totalPositives === 0) return { prAuc: 0, points: [] };

    let tp = 0;
    let fp = 0;
    const curvePoints = [{ recall: 0, precision: 1.0 }];

    let prAuc = 0;
    let prevRecall = 0;
    let prevPrecision = 1.0;

    for (let i = 0; i < n; i++) {
      if (paired[i].y === 1) tp++;
      else fp++;

      const recall = tp / totalPositives;
      const precision = tp / (tp + fp);

      if (recall > prevRecall) {
        // Trapezoidal integration step
        prAuc += (recall - prevRecall) * (precision + prevPrecision) / 2.0;
        prevRecall = recall;
        prevPrecision = precision;
        curvePoints.push({ recall: parseFloat(recall.toFixed(4)), precision: parseFloat(precision.toFixed(4)) });
      }
    }

    return {
      prAuc: parseFloat(prAuc.toFixed(4)),
      points: curvePoints
    };
  }

  /**
   * Calculate Probability Calibration (Reliability Diagram Data)
   * 10 equal bins: [0, 0.1), [0.1, 0.2), ..., [0.9, 1.0]
   */
  function calculateCalibration(predictions, groundTruths, numBins = 10) {
    const bins = Array.from({ length: numBins }, () => ({
      sumPred: 0,
      sumTrue: 0,
      count: 0
    }));

    for (let i = 0; i < predictions.length; i++) {
      const p = predictions[i];
      const y = groundTruths[i];
      let bIdx = Math.floor(p * numBins);
      if (bIdx >= numBins) bIdx = numBins - 1;

      bins[bIdx].sumPred += p;
      bins[bIdx].sumTrue += y;
      bins[bIdx].count += 1;
    }

    return bins.map((b, idx) => {
      const center = (idx + 0.5) / numBins;
      const avgPred = b.count > 0 ? b.sumPred / b.count : center;
      const avgTrue = b.count > 0 ? b.sumTrue / b.count : 0;
      return {
        binIndex: idx,
        binCenter: parseFloat(center.toFixed(2)),
        meanPredicted: parseFloat(avgPred.toFixed(4)),
        fractionPositives: parseFloat(avgTrue.toFixed(4)),
        sampleCount: b.count
      };
    });
  }

  /**
   * Paired Block-Bootstrap for Difference in Brier Score and PR-AUC
   * Generates 95% Confidence Interval [lower, upper]
   */
  function pairedBlockBootstrap(predsA, predsB, groundTruths, numReplications = 500) {
    const n = predsA.length;
    const blockSize = Math.max(4, Math.floor(n / 10));
    const deltaBSList = [];
    const deltaPRList = [];

    for (let rep = 0; rep < numReplications; rep++) {
      const sampledIdx = [];
      while (sampledIdx.length < n) {
        const start = Math.floor(Math.random() * (n - blockSize + 1));
        for (let b = 0; b < blockSize && sampledIdx.length < n; b++) {
          sampledIdx.push(start + b);
        }
      }

      const samplePredA = sampledIdx.map(idx => predsA[idx]);
      const samplePredB = sampledIdx.map(idx => predsB[idx]);
      const sampleTruth = sampledIdx.map(idx => groundTruths[idx]);

      const bsA = calculateBrierScore(samplePredA, sampleTruth);
      const bsB = calculateBrierScore(samplePredB, sampleTruth);
      deltaBSList.push(bsA - bsB); // negative means A is better (lower BS)

      const prA = calculatePRAUC(samplePredA, sampleTruth).prAuc;
      const prB = calculatePRAUC(samplePredB, sampleTruth).prAuc;
      deltaPRList.push(prA - prB); // positive means A is better (higher PR-AUC)
    }

    deltaBSList.sort((a, b) => a - b);
    deltaPRList.sort((a, b) => a - b);

    const lowIdx = Math.floor(numReplications * 0.025);
    const highIdx = Math.floor(numReplications * 0.975);

    return {
      deltaBS: {
        mean: parseFloat(((deltaBSList.reduce((a, b) => a + b, 0)) / numReplications).toFixed(5)),
        ciLow: parseFloat(deltaBSList[lowIdx].toFixed(5)),
        ciHigh: parseFloat(deltaBSList[highIdx].toFixed(5)),
        distribution: deltaBSList
      },
      deltaPRAUC: {
        mean: parseFloat(((deltaPRList.reduce((a, b) => a + b, 0)) / numReplications).toFixed(4)),
        ciLow: parseFloat(deltaPRList[lowIdx].toFixed(4)),
        ciHigh: parseFloat(deltaPRList[highIdx].toFixed(4)),
        distribution: deltaPRList
      }
    };
  }

  // Public API
  return {
    median,
    mad,
    calculateStationAnomaly,
    haversineDistance,
    bearingAngle,
    distanceWeight,
    windAlignmentWeight,
    computeNetworkScoresForCell,
    harmonicSeasonality,
    historicalTendency,
    sigmoid,
    evaluateModelHierarchy,
    evaluateExclusion,
    calculateBrierScore,
    calculatePRAUC,
    calculateCalibration,
    pairedBlockBootstrap
  };
})();

// Export if in module environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MathEngine;
}
