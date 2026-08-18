/**
 * PM2.5 Network Mathematical Model PoC - Master Application Controller
 * Light Premium Enterprise Theme & Tabbed Navigation
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    activeTab: 'tab-map',
    currentScenarioKey: 'peak_fire_2024',
    currentScenario: ScenariosData.SCENARIOS['peak_fire_2024'],
    selectedModel: 'M2b',
    heatmapMode: 'prob',
    ell: 50.0,
    kappa: 1.0,
    rMax: 150.0,
    tauExcl: 24,
    rExcl: 10,
    isLiveQuerying: false
  };

  // 1. Initialize Leaflet Map
  MapRenderer.init('leafletMap', (activeCell, stations, scenario) => {
    MathInspector.updateCellInspector(activeCell, stations, scenario);
  });

  // 2. Initialize KaTeX Static Formulas
  MathInspector.initStaticFormulas();

  // 3. Set up Event Listeners
  setupEventListeners();

  // 4. Initial Render
  updateUI();

  /**
   * Set up all Event Listeners
   */
  function setupEventListeners() {
    // 1. Top Enterprise Tabs
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        if (!targetTab) return;

        // Switch Active Tab Button
        document.querySelectorAll('.nav-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Switch Active Tab Content Pane
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
        const activePane = document.getElementById(targetTab);
        if (activePane) {
          activePane.classList.add('active');
        }

        state.activeTab = targetTab;

        // If switching to Map tab, invalidate Leaflet size
        if (targetTab === 'tab-map') {
          setTimeout(() => {
            MapRenderer.invalidateSize();
          }, 50);
        }

        // If switching to Charts tab, re-render charts
        if (targetTab === 'tab-metrics') {
          setTimeout(() => {
            renderCharts();
          }, 50);
        }
      });
    });

    // 2. Scenario Selector Cards
    document.querySelectorAll('.scenario-card-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.scenario-card-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const key = btn.getAttribute('data-scenario');
        if (ScenariosData.SCENARIOS[key]) {
          state.currentScenarioKey = key;
          state.currentScenario = ScenariosData.SCENARIOS[key];
          updateUI();
        }
      });
    });

    // 3. Model Step Hierarchy Selector Buttons
    document.querySelectorAll('.step-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.step-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        state.selectedModel = btn.getAttribute('data-model');
        updateMapOnly();
        highlightTableRow(state.selectedModel);
      });
    });

    // 4. Map Layer Toggles
    document.querySelectorAll('[data-layer]').forEach(btn => {
      btn.addEventListener('click', () => {
        const layer = btn.getAttribute('data-layer');
        if (layer.startsWith('mode_')) {
          document.querySelectorAll('[data-layer^="mode_"]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.heatmapMode = layer.replace('mode_', '');
        } else {
          btn.classList.toggle('active');
        }
        updateMapOnly();
      });
    });

    // 5. Parameter Controls (Sliders)
    const ellInput = document.getElementById('paramEll');
    const kappaInput = document.getElementById('paramKappa');
    const rMaxInput = document.getElementById('paramRMax');
    const tauInput = document.getElementById('paramTauExcl');
    const rExclInput = document.getElementById('paramRExcl');

    if (ellInput) {
      ellInput.addEventListener('input', (e) => {
        state.ell = parseFloat(e.target.value);
        document.getElementById('valEll').textContent = state.ell + ' km';
        updateMapOnly();
      });
    }

    if (kappaInput) {
      kappaInput.addEventListener('input', (e) => {
        state.kappa = parseFloat(e.target.value);
        document.getElementById('valKappa').textContent = state.kappa.toFixed(1);
        updateMapOnly();
      });
    }

    if (rMaxInput) {
      rMaxInput.addEventListener('input', (e) => {
        state.rMax = parseFloat(e.target.value);
        document.getElementById('valRMax').textContent = state.rMax + ' km';
        updateMapOnly();
      });
    }

    if (tauInput) {
      tauInput.addEventListener('input', (e) => {
        state.tauExcl = parseInt(e.target.value);
        document.getElementById('valTauExcl').textContent = state.tauExcl + 'h';
        updateMapOnly();
      });
    }

    if (rExclInput) {
      rExclInput.addEventListener('input', (e) => {
        state.rExcl = parseInt(e.target.value);
        document.getElementById('valRExcl').textContent = state.rExcl + ' km';
        updateMapOnly();
      });
    }

    // 6. Live API Query Button
    const liveApiBtn = document.getElementById('btnLiveFetch');
    if (liveApiBtn) {
      liveApiBtn.addEventListener('click', async () => {
        if (state.isLiveQuerying) return;
        state.isLiveQuerying = true;
        liveApiBtn.innerHTML = '<span>⏳ กำลังดึงข้อมูล Live Open-Meteo API...</span>';

        const res = await DataService.fetchLiveOpenMeteoData(18.79, 98.98);
        state.isLiveQuerying = false;
        liveApiBtn.innerHTML = '<span>⚡ ดึงข้อมูลสด (Free Live API)</span>';

        if (res.success) {
          showNotification(`ดึงข้อมูลสดสำเร็จจาก Open-Meteo API (ฝุ่น PM2.5: ${res.data.latestPM25} µg/m³, ลม: ${res.data.windSpeed} m/s)`);
        } else {
          showNotification(`เชื่อมต่อ API ภายนอกไม่สำเร็จ ระบบสลับใช้ข้อมูลประวัติศาสตร์ความแม่นยำสูงแทน`, true);
        }
      });
    }

    // 7. Reference [Ref.] Modals
    document.querySelectorAll('[data-ref]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const refKey = btn.getAttribute('data-ref');
        openReferenceModal(refKey);
      });
    });

    // Reference Modal Close
    const refModal = document.getElementById('referenceModal');
    const refCloseBtn = document.getElementById('refModalClose');
    if (refCloseBtn && refModal) {
      refCloseBtn.addEventListener('click', () => refModal.classList.remove('open'));
      refModal.addEventListener('click', (e) => {
        if (e.target === refModal) refModal.classList.remove('open');
      });
    }

    // Math Proof Modal Close
    const mathModal = document.getElementById('mathProofModal');
    const mathCloseBtn = document.getElementById('mathModalClose');
    if (mathCloseBtn && mathModal) {
      mathCloseBtn.addEventListener('click', () => mathModal.classList.remove('open'));
      mathModal.addEventListener('click', (e) => {
        if (e.target === mathModal) mathModal.classList.remove('open');
      });
    }

    // Mathematical Proof Buttons
    document.querySelectorAll('[data-open-math]').forEach(btn => {
      btn.addEventListener('click', () => {
        const step = btn.getAttribute('data-open-math');
        MathInspector.openMathModal(step);
      });
    });

    // Window Resize
    window.addEventListener('resize', debounce(() => {
      MapRenderer.invalidateSize();
      renderCharts();
    }, 200));
  }

  /**
   * Update UI
   */
  function updateUI() {
    const dateEl = document.getElementById('activeOriginTime');
    if (dateEl) dateEl.textContent = state.currentScenario.dateText;

    updateMapOnly();
    renderCharts();
  }

  /**
   * Update Map Only
   */
  function updateMapOnly() {
    const showStations = document.getElementById('layerStations')?.classList.contains('active') ?? true;
    const showWind = document.getElementById('layerWind')?.classList.contains('active') ?? true;
    const showLinks = document.getElementById('layerLinks')?.classList.contains('active') ?? true;
    const showHotspots = document.getElementById('layerHotspots')?.classList.contains('active') ?? true;

    MapRenderer.render(state.currentScenario, {
      selectedModel: state.selectedModel,
      heatmapMode: state.heatmapMode,
      ell: state.ell,
      kappa: state.kappa,
      rMax: state.rMax,
      tauExcl: state.tauExcl,
      rExcl: state.rExcl,
      showStations,
      showWind,
      showLinks,
      showHotspots
    });
  }

  /**
   * Render Charts
   */
  function renderCharts() {
    const predsM0 = [0.05, 0.08, 0.12, 0.18, 0.22, 0.26, 0.32, 0.35, 0.40, 0.45, 0.52, 0.58];
    const predsM2b = [0.03, 0.04, 0.09, 0.14, 0.28, 0.38, 0.48, 0.62, 0.74, 0.82, 0.88, 0.94];
    const truths = [0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1];

    const calibM0 = MathEngine.calculateCalibration(predsM0, truths);
    const calibM2b = MathEngine.calculateCalibration(predsM2b, truths);
    ChartRenderer.renderCalibrationChart('calibrationChartCanvas', calibM0, calibM2b);

    const prM0 = MathEngine.calculatePRAUC(predsM0, truths);
    const prM2b = MathEngine.calculatePRAUC(predsM2b, truths);
    ChartRenderer.renderPRCurveChart('prCurveCanvas', prM0, prM2b, 0.082);

    const bootstrapRes = MathEngine.pairedBlockBootstrap(predsM2b, predsM0, truths, 400);
    ChartRenderer.renderBootstrapChart('bootstrapChartCanvas', bootstrapRes);

    const ciValEl = document.getElementById('bootstrapCiRange');
    if (ciValEl) {
      ciValEl.textContent = `[+${bootstrapRes.deltaPRAUC.ciLow.toFixed(3)}, +${bootstrapRes.deltaPRAUC.ciHigh.toFixed(3)}] (95% CI)`;
    }

    ChartRenderer.renderLeadTimeChart('leadTimeChartCanvas', ScenariosData.LEAD_TIME_DECAY);
  }

  /**
   * Open Reference Modal
   */
  function openReferenceModal(key) {
    const modal = document.getElementById('referenceModal');
    const titleEl = document.getElementById('refModalTitle');
    const bodyEl = document.getElementById('refModalBody');
    if (!modal || !titleEl || !bodyEl) return;

    if (key === 'all') {
      titleEl.textContent = 'แหล่งข้อมูลสาธารณะและเอกสารอ้างอิงทั้งหมด (All Data References)';
      const refs = DataService.getAllReferences();
      let html = '';
      refs.forEach(r => {
        html += `
          <div class="ref-source-card">
            <div class="ref-source-header">
              <span class="ref-source-title">${r.title}</span>
              <span class="ref-badge-free">${r.license}</span>
            </div>
            <p style="font-size: 13px; color: #334155; margin: 4px 0;"><b>หน่วยงาน:</b> ${r.agency}</p>
            <p style="font-size: 13px; color: #334155; margin: 4px 0;"><b>ตัวแปร:</b> ${r.dataType}</p>
            <p style="font-size: 13px; color: #0284c7; margin: 4px 0;"><b>บทบาทในแบบจำลอง:</b> ${r.roleInModel}</p>
            <div class="ref-endpoint-url">Endpoint: ${r.endpoint}</div>
            <p style="font-size: 12px; color: #64748b; margin-top: 6px;"><i>การอ้างอิง: ${r.citation}</i></p>
          </div>
        `;
      });
      bodyEl.innerHTML = html;
    } else {
      const r = DataService.getReference(key);
      if (!r) return;
      titleEl.textContent = `แหล่งอ้างอิง: ${r.title}`;
      bodyEl.innerHTML = `
        <div class="ref-source-card">
          <div class="ref-source-header">
            <span class="ref-source-title">${r.title}</span>
            <span class="ref-badge-free">${r.license}</span>
          </div>
          <p style="font-size: 13px; color: #334155; margin: 6px 0;"><b>หน่วยงานผู้เผยแพร่:</b> ${r.agency}</p>
          <p style="font-size: 13px; color: #334155; margin: 6px 0;"><b>ลักษณะข้อมูล:</b> ${r.dataType}</p>
          <p style="font-size: 13px; color: #334155; margin: 6px 0;"><b>ความถี่การอัปเดต:</b> ${r.updateFrequency}</p>
          <p style="font-size: 13px; color: #0284c7; margin: 6px 0;"><b>บทบาทในแบบจำลองคณิตศาสตร์:</b> ${r.roleInModel}</p>
          <div class="ref-endpoint-url">URL / Endpoint: ${r.endpoint}</div>
          <div style="margin-top: 12px; padding: 10px; background: #e2e8f0; border-radius: 6px; font-size: 12px; color: #475569;">
            <b>รูปแบบการอ้างอิงทางวิชาการ:</b><br/>${r.citation}
          </div>
        </div>
      `;
    }

    modal.classList.add('open');
  }

  function highlightTableRow(modelKey) {
    document.querySelectorAll('.stepwise-table tr').forEach(row => {
      if (row.getAttribute('data-row-model') === modelKey) {
        row.classList.add('highlight-row');
      } else {
        row.classList.remove('highlight-row');
      }
    });
  }

  function showNotification(msg, isWarn = false) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; bottom: 20px; right: 20px; z-index: 3000;
      background: ${isWarn ? '#ef4444' : '#059669'};
      color: #ffffff; padding: 12px 18px; border-radius: 8px;
      font-size: 13px; font-weight: 700; box-shadow: 0 4px 14px rgba(0,0,0,0.15);
      transform: translateY(20px); opacity: 0; transition: all 0.25s ease;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    }, 10);

    setTimeout(() => {
      toast.style.transform = 'translateY(20px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 250);
    }, 4000);
  }

  function debounce(fn, ms) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  }
});
