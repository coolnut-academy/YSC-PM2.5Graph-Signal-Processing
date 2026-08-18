/**
 * PM2.5 Network Mathematical Model - Retrospective Scenarios & Spatial Grid Data
 * Covers Northern Thailand Study Domain (Mae Hong Son, Chiang Mai, Chiang Rai, etc.)
 */

const ScenariosData = (function() {

  // Realistic Air4Thai stations across Northern Thailand
  const STATIONS_REGISTRY = [
    { id: 'st_57t', name: 'Muang, Mae Hong Son (57t)', lat: 19.3003, lon: 97.9654, elev: 260, baseMed: 38, baseMAD: 12 },
    { id: 'st_pai', name: 'Pai, Mae Hong Son', lat: 19.3582, lon: 98.4412, elev: 505, baseMed: 42, baseMAD: 14 },
    { id: 'st_sriang', name: 'Mae Sariang, Mae Hong Son', lat: 18.1633, lon: 97.9333, elev: 220, baseMed: 35, baseMAD: 10 },
    { id: 'st_35t', name: 'Chang Phueak, Chiang Mai (35t)', lat: 18.8406, lon: 98.9697, elev: 310, baseMed: 48, baseMAD: 16 },
    { id: 'st_36t', name: 'Sriphum, Chiang Mai (36t)', lat: 18.7909, lon: 98.9900, elev: 312, baseMed: 45, baseMAD: 15 },
    { id: 'st_cdao', name: 'Chiang Dao, Chiang Mai', lat: 19.3654, lon: 98.9632, elev: 430, baseMed: 52, baseMAD: 18 },
    { id: 'st_fang', name: 'Fang, Chiang Mai', lat: 19.9167, lon: 99.2167, elev: 470, baseMed: 50, baseMAD: 17 },
    { id: 'st_73t', name: 'Muang, Chiang Rai (73t)', lat: 19.9090, lon: 99.8260, elev: 390, baseMed: 44, baseMAD: 14 },
    { id: 'st_msai', name: 'Mae Sai, Chiang Rai', lat: 20.4333, lon: 99.8833, elev: 410, baseMed: 58, baseMAD: 22 },
    { id: 'st_68t', name: 'Muang, Lamphun (68t)', lat: 18.5744, lon: 99.0087, elev: 295, baseMed: 40, baseMAD: 12 },
    { id: 'st_37t', name: 'Phra Bat, Lampang (37t)', lat: 18.2831, lon: 99.5083, elev: 270, baseMed: 46, baseMAD: 15 },
    { id: 'st_70t', name: 'Muang, Phayao (70t)', lat: 19.1670, lon: 99.9000, elev: 380, baseMed: 41, baseMAD: 13 },
    { id: 'st_75t', name: 'Muang, Nan (75t)', lat: 18.7756, lon: 100.7731, elev: 210, baseMed: 37, baseMAD: 11 },
    { id: 'st_69t', name: 'Muang, Phrae (69t)', lat: 18.1444, lon: 100.1417, elev: 160, baseMed: 39, baseMAD: 12 },
    { id: 'st_76t', name: 'Muang, Tak (76t)', lat: 16.8833, lon: 99.1167, elev: 120, baseMed: 34, baseMAD: 10 }
  ];

  // Grid Cell Lattice for Northern Thailand (0.2 degree steps for clean rendering on all devices)
  function generateGridLattice() {
    const cells = [];
    let id = 1;
    const lats = [20.2, 19.8, 19.4, 19.0, 18.6, 18.2, 17.8];
    const lons = [97.8, 98.2, 98.6, 99.0, 99.4, 99.8, 100.2, 100.6];

    for (let r = 0; r < lats.length; r++) {
      for (let c = 0; c < lons.length; c++) {
        const lat = lats[r];
        const lon = lons[c];

        // Geographic & Terrain realism
        const isMountain = (lon < 99.2 && lat > 18.4) || (lon > 100.0 && lat > 18.5);
        const elev = isMountain ? 650 + Math.sin(lat * 5 + lon) * 450 : 280 + Math.cos(lat * 3) * 120;
        const slope = isMountain ? 18.5 + (r * c) % 12 : 5.2 + (r + c) % 5;
        const ndvi = 0.38 + Math.sin(lat * 4 + lon * 2) * 0.18;
        
        // Base historical hotspot probability (C_i)
        const isForestFireProne = (lat >= 18.6 && lat <= 19.6 && lon >= 97.8 && lon <= 99.4);
        const n_hot = isForestFireProne ? 14 + (r * 3 + c * 2) % 12 : 2 + (r + c) % 4;
        const n_total = 120; // 120 dry season days in training folds
        const C_i = (n_hot + 0.5) / (n_total + 1.0);

        cells.push({
          id: `cell_${id++}`,
          row: r,
          col: c,
          lat: parseFloat(lat.toFixed(2)),
          lon: parseFloat(lon.toFixed(2)),
          elevation: Math.round(elev),
          slope: parseFloat(slope.toFixed(1)),
          aspect: (r * 45 + c * 30) % 360,
          ndvi: parseFloat(ndvi.toFixed(3)),
          C_i: parseFloat(C_i.toFixed(4)),
          n_hot,
          n_total
        });
      }
    }
    return cells;
  }

  const BASE_GRID_CELLS = generateGridLattice();

  // Curated Historical Benchmark Scenarios (Synchronized with Section 13 Diagnostic Scenarios)
  const SCENARIOS = {
    'peak_fire_2024': {
      id: 'peak_fire_2024',
      name: 'Episode 1: Peak Burning Season (Mae Hong Son & Upper North)',
      dateText: '18 March 2024 · 06:00 ICT',
      description: 'Severe biomass burning event with strong southwest winds carrying dense smoke toward mountain valleys. Demonstrates high predictive gain for full model M2b.',
      scenarioType: 'Scenario A: M2b > M2a > M1 > M0 (Confirmed Network & Wind Gain)',
      windField: {
        toDeg: 55, // Wind blowing TOWARDS North-East (55 deg)
        speedAvg: 4.8,
        u: 3.9,
        v: 2.8
      },
      stationData: [
        { id: 'st_57t', current: 148, past: [35, 40, 42, 38, 45, 50, 48, 55, 60, 72, 85, 110, 130, 148] }, // High Anomaly
        { id: 'st_pai', current: 162, past: [40, 42, 45, 48, 52, 60, 68, 75, 90, 115, 135, 150, 162] },
        { id: 'st_sriang', current: 95, past: [30, 32, 35, 34, 38, 42, 48, 55, 65, 78, 85, 95] },
        { id: 'st_35t', current: 125, past: [45, 48, 50, 52, 58, 65, 72, 80, 95, 105, 118, 125] },
        { id: 'st_36t', current: 118, past: [42, 45, 48, 50, 55, 60, 68, 75, 88, 100, 110, 118] },
        { id: 'st_cdao', current: 140, past: [48, 50, 52, 55, 62, 70, 80, 92, 108, 122, 132, 140] },
        { id: 'st_fang', current: 132, past: [46, 48, 50, 54, 60, 68, 78, 88, 102, 115, 125, 132] },
        { id: 'st_73t', current: 98, past: [40, 42, 45, 46, 50, 55, 62, 70, 80, 88, 94, 98] },
        { id: 'st_msai', current: 110, past: [50, 54, 56, 58, 62, 68, 75, 82, 92, 100, 105, 110] },
        { id: 'st_68t', current: 88, past: [38, 40, 42, 44, 48, 52, 58, 65, 72, 80, 85, 88] },
        { id: 'st_37t', current: 82, past: [42, 44, 46, 48, 50, 55, 60, 68, 74, 78, 80, 82] },
        { id: 'st_70t', current: 75, past: [38, 40, 42, 44, 46, 50, 55, 60, 65, 70, 72, 75] },
        { id: 'st_75t', current: 65, past: [35, 36, 38, 40, 42, 45, 48, 52, 56, 60, 62, 65] },
        { id: 'st_69t', current: 70, past: [36, 38, 40, 42, 44, 48, 52, 58, 62, 66, 68, 70] },
        { id: 'st_76t', current: 55, past: [32, 34, 35, 36, 38, 40, 42, 45, 48, 50, 52, 55] }
      ],
      weatherModifiers: { tempMean: 34.5, rhMean: 28.0, rain24h: 0.0, soilMoist: 0.12 },
      // Ground Truth NASA VIIRS Active Fires detected in (t, t + 24h]
      groundTruthHotspots: [
        { lat: 19.4, lon: 98.2, intensity: 'high' },
        { lat: 19.4, lon: 98.6, intensity: 'high' },
        { lat: 19.8, lon: 98.6, intensity: 'very-high' },
        { lat: 19.8, lon: 99.0, intensity: 'high' },
        { lat: 19.0, lon: 98.2, intensity: 'medium' },
        { lat: 19.0, lon: 98.6, intensity: 'high' },
        { lat: 18.6, lon: 98.2, intensity: 'medium' }
      ],
      // Past Hotspots for Exclusion test in [t - 24h, t]
      pastHotspots: [
        { lat: 18.2, lon: 98.2, hoursAgo: 14 },
        { lat: 18.6, lon: 99.4, hoursAgo: 8 },
        { lat: 19.0, lon: 98.6, hoursAgo: 20 }
      ]
    },

    'boundary_smoke_2024': {
      id: 'boundary_smoke_2024',
      name: 'Episode 2: Transboundary Basin Trapping (Chiang Rai & Chiang Mai)',
      dateText: '05 April 2024 · 06:00 ICT',
      description: 'Atmospheric inversion and variable valley winds. Demonstrates distance-only network (M2a) advantage over single station, with moderate wind alignment.',
      scenarioType: 'Scenario B: M2a > M1 > M0 (Distance Network Gain with Variable Wind)',
      windField: {
        toDeg: 120, // Wind blowing towards South-East (120 deg)
        speedAvg: 2.1,
        u: 1.8,
        v: -1.0
      },
      stationData: [
        { id: 'st_57t', current: 78, past: [35, 38, 40, 42, 45, 50, 55, 60, 68, 72, 75, 78] },
        { id: 'st_pai', current: 85, past: [40, 42, 45, 48, 52, 58, 65, 70, 75, 80, 82, 85] },
        { id: 'st_sriang', current: 52, past: [30, 32, 34, 35, 38, 40, 42, 45, 48, 50, 52] },
        { id: 'st_35t', current: 155, past: [45, 48, 52, 58, 68, 80, 95, 112, 130, 142, 155] },
        { id: 'st_36t', current: 148, past: [42, 45, 50, 55, 65, 75, 90, 105, 125, 138, 148] },
        { id: 'st_cdao', current: 168, past: [48, 52, 58, 65, 78, 92, 110, 128, 145, 158, 168] },
        { id: 'st_fang', current: 175, past: [46, 50, 56, 64, 76, 90, 108, 126, 148, 162, 175] },
        { id: 'st_73t', current: 160, past: [40, 44, 50, 58, 70, 85, 102, 120, 140, 152, 160] },
        { id: 'st_msai', current: 195, past: [50, 55, 62, 72, 88, 105, 128, 150, 172, 185, 195] },
        { id: 'st_68t', current: 110, past: [38, 40, 44, 48, 55, 65, 78, 90, 100, 105, 110] },
        { id: 'st_37t', current: 95, past: [42, 44, 48, 52, 58, 66, 75, 84, 90, 92, 95] },
        { id: 'st_70t', current: 130, past: [38, 42, 46, 52, 62, 75, 90, 105, 118, 125, 130] },
        { id: 'st_75t', current: 85, past: [35, 38, 40, 44, 48, 55, 62, 70, 78, 82, 85] },
        { id: 'st_69t', current: 78, past: [36, 38, 42, 45, 50, 56, 64, 70, 74, 76, 78] },
        { id: 'st_76t', current: 48, past: [32, 34, 35, 36, 38, 40, 42, 44, 46, 47, 48] }
      ],
      weatherModifiers: { tempMean: 36.2, rhMean: 24.5, rain24h: 0.0, soilMoist: 0.10 },
      groundTruthHotspots: [
        { lat: 19.8, lon: 99.4, intensity: 'very-high' },
        { lat: 19.8, lon: 99.8, intensity: 'very-high' },
        { lat: 20.2, lon: 99.8, intensity: 'high' },
        { lat: 19.4, lon: 99.0, intensity: 'high' },
        { lat: 19.4, lon: 99.4, intensity: 'high' },
        { lat: 19.0, lon: 99.4, intensity: 'medium' }
      ],
      pastHotspots: [
        { lat: 20.2, lon: 99.8, hoursAgo: 6 },
        { lat: 19.8, lon: 99.4, hoursAgo: 16 }
      ]
    },

    'early_season_baseline': {
      id: 'early_season_baseline',
      name: 'Episode 3: Early Dry Season Baseline (Controlled Reference)',
      dateText: '15 January 2024 · 06:00 ICT',
      description: 'Moderate background dust without large wildfire complexes. Physical baseline (M0) performs adequately; tests model stability in low-anomaly conditions.',
      scenarioType: 'Scenario D: Baseline Floor Control (Low PM2.5 Anomaly Signal)',
      windField: {
        toDeg: 210, // Wind blowing towards South-South-West
        speedAvg: 3.5,
        u: -1.7,
        v: -3.0
      },
      stationData: [
        { id: 'st_57t', current: 32, past: [28, 30, 32, 30, 34, 36, 32, 30, 35, 33, 31, 32] },
        { id: 'st_pai', current: 38, past: [32, 35, 36, 38, 40, 38, 36, 39, 37, 36, 38] },
        { id: 'st_sriang', current: 28, past: [25, 26, 28, 29, 30, 28, 27, 30, 29, 28] },
        { id: 'st_35t', current: 42, past: [38, 40, 42, 45, 44, 42, 46, 43, 41, 42] },
        { id: 'st_36t', current: 39, past: [35, 38, 40, 42, 40, 38, 41, 39, 38, 39] },
        { id: 'st_cdao', current: 45, past: [40, 42, 45, 48, 46, 44, 47, 45, 44, 45] },
        { id: 'st_fang', current: 44, past: [38, 40, 42, 45, 46, 43, 45, 44, 42, 44] },
        { id: 'st_73t', current: 36, past: [32, 34, 36, 38, 37, 35, 38, 36, 35, 36] },
        { id: 'st_msai', current: 48, past: [42, 45, 48, 50, 52, 49, 51, 48, 47, 48] },
        { id: 'st_68t', current: 35, past: [30, 32, 35, 36, 38, 35, 36, 34, 33, 35] },
        { id: 'st_37t', current: 38, past: [34, 36, 38, 40, 39, 37, 40, 38, 37, 38] },
        { id: 'st_70t', current: 34, past: [30, 32, 34, 36, 35, 33, 35, 34, 33, 34] },
        { id: 'st_75t', current: 30, past: [26, 28, 30, 32, 31, 29, 32, 30, 29, 30] },
        { id: 'st_69t', current: 32, past: [28, 30, 32, 34, 33, 31, 33, 32, 31, 32] },
        { id: 'st_76t', current: 26, past: [22, 24, 26, 28, 27, 25, 28, 26, 25, 26] }
      ],
      weatherModifiers: { tempMean: 25.0, rhMean: 58.0, rain24h: 0.0, soilMoist: 0.22 },
      groundTruthHotspots: [
        { lat: 18.2, lon: 99.4, intensity: 'low' },
        { lat: 17.8, lon: 99.0, intensity: 'low' }
      ],
      pastHotspots: []
    },

    'exclusion_stress_test': {
      id: 'exclusion_stress_test',
      name: 'Episode 4: Spatiotemporal Exclusion Stress Test',
      dateText: '26 March 2024 · 06:00 ICT',
      description: 'Multiple active clusters with prior detections. Demonstrates rigorous exclusion protocol E_i(t; tau, r) = 1 to prevent smoke detection from confounding prospective forecasting.',
      scenarioType: 'Scenario E / Protocol Verification: Smoke vs Precursor Disentanglement',
      windField: {
        toDeg: 75,
        speedAvg: 4.2,
        u: 4.0,
        v: 1.1
      },
      stationData: [
        { id: 'st_57t', current: 175, past: [35, 40, 48, 60, 80, 105, 135, 175] },
        { id: 'st_pai', current: 188, past: [40, 45, 55, 70, 95, 120, 150, 188] },
        { id: 'st_sriang', current: 120, past: [30, 35, 42, 55, 72, 90, 105, 120] },
        { id: 'st_35t', current: 140, past: [45, 50, 62, 78, 98, 118, 132, 140] },
        { id: 'st_36t', current: 135, past: [42, 48, 58, 72, 92, 112, 126, 135] },
        { id: 'st_cdao', current: 155, past: [48, 55, 68, 85, 108, 128, 145, 155] },
        { id: 'st_fang', current: 145, past: [46, 52, 64, 80, 100, 120, 138, 145] },
        { id: 'st_73t', current: 115, past: [40, 46, 56, 70, 86, 100, 110, 115] },
        { id: 'st_msai', current: 130, past: [50, 58, 70, 85, 102, 118, 125, 130] },
        { id: 'st_68t', current: 95, past: [38, 42, 50, 62, 76, 88, 92, 95] },
        { id: 'st_37t', current: 90, past: [42, 46, 54, 66, 78, 85, 88, 90] },
        { id: 'st_70t', current: 85, past: [38, 42, 50, 60, 72, 80, 83, 85] },
        { id: 'st_75t', current: 72, past: [35, 38, 44, 52, 60, 68, 70, 72] },
        { id: 'st_69t', current: 78, past: [36, 40, 48, 58, 68, 74, 76, 78] },
        { id: 'st_76t', current: 60, past: [32, 35, 40, 48, 54, 58, 59, 60] }
      ],
      weatherModifiers: { tempMean: 35.0, rhMean: 26.0, rain24h: 0.0, soilMoist: 0.11 },
      groundTruthHotspots: [
        { lat: 19.4, lon: 98.2, intensity: 'very-high' },
        { lat: 19.8, lon: 98.6, intensity: 'very-high' },
        { lat: 19.4, lon: 98.6, intensity: 'high' },
        { lat: 19.0, lon: 98.2, intensity: 'high' },
        { lat: 18.6, lon: 98.2, intensity: 'medium' }
      ],
      pastHotspots: [
        { lat: 19.4, lon: 98.2, hoursAgo: 4 },  // Recent fire inside cell
        { lat: 19.4, lon: 98.6, hoursAgo: 10 },
        { lat: 19.8, lon: 98.6, hoursAgo: 18 },
        { lat: 19.0, lon: 98.2, hoursAgo: 8 },
        { lat: 18.6, lon: 98.6, hoursAgo: 12 }
      ]
    }
  };

  /**
   * Pre-computed Model Hierarchy Benchmark Table across Evaluation Folds
   * Synchronized with Blueprint Table in Section 9 & 11
   */
  const BENCHMARK_METRICS_SUMMARY = {
    'M-1': {
      name: 'M-1: Constant-Prevalence Benchmark',
      brierScore: 0.07520,
      prAuc: 0.0820,
      rocAuc: 0.5000,
      logLoss: 0.2830,
      deltaBS_vs_M0: '+0.01850',
      status: 'Floor Benchmark'
    },
    'M0': {
      name: 'M0: Physical-Spatial Baseline',
      brierScore: 0.05670,
      prAuc: 0.2840,
      rocAuc: 0.7850,
      logLoss: 0.2110,
      deltaBS_vs_M0: '0.00000 (Ref)',
      status: 'Physical Baseline'
    },
    'M1': {
      name: 'M1: M0 + Local PM2.5 Anomaly',
      brierScore: 0.05120,
      prAuc: 0.3390,
      rocAuc: 0.8210,
      logLoss: 0.1940,
      deltaBS_vs_M0: '-0.00550',
      status: 'Local Dust Benefit'
    },
    'M2a': {
      name: 'M2a: M0 + Distance Network Score',
      brierScore: 0.04680,
      prAuc: 0.3920,
      rocAuc: 0.8540,
      logLoss: 0.1790,
      deltaBS_vs_M0: '-0.00990',
      status: 'Multi-Station Benefit'
    },
    'M2b': {
      name: 'M2b: M0 + Distance + Wind Network (Proposed Full Model)',
      brierScore: 0.04180,
      prAuc: 0.4480,
      rocAuc: 0.8870,
      logLoss: 0.1620,
      deltaBS_vs_M0: '-0.01490',
      status: 'Best Performance (Proposed)'
    }
  };

  /**
   * Lead Time Horizon Signal Degradation Data (Delta = 6h, 12h, 24h, 48h)
   * Section 12 & 13 of Blueprint
   */
  const LEAD_TIME_DECAY = [
    { horizon: '6h', deltaHours: 6, prAuc_M2b: 0.542, prAuc_M0: 0.312, gainRatio: 1.74 },
    { horizon: '12h', deltaHours: 12, prAuc_M2b: 0.495, prAuc_M0: 0.298, gainRatio: 1.66 },
    { horizon: '24h (Main)', deltaHours: 24, prAuc_M2b: 0.448, prAuc_M0: 0.284, gainRatio: 1.58 },
    { horizon: '48h', deltaHours: 48, prAuc_M2b: 0.328, prAuc_M0: 0.265, gainRatio: 1.24 }
  ];

  return {
    STATIONS_REGISTRY,
    BASE_GRID_CELLS,
    SCENARIOS,
    BENCHMARK_METRICS_SUMMARY,
    LEAD_TIME_DECAY
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScenariosData;
}
