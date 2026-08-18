/**
 * PM2.5 Network Mathematical Model - Leaflet Satellite Map & Network Renderer
 * Real Satellite Imagery with Spatial Grid Heatmaps & Dynamic Network Links
 */

const MapRenderer = (function() {
  let leafletMap = null;
  let gridLayerGroup = null;
  let stationLayerGroup = null;
  let linkLayerGroup = null;
  let windLayerGroup = null;
  let hotspotLayerGroup = null;

  let currentScenario = null;
  let currentParams = {
    selectedModel: 'M2b',
    heatmapMode: 'prob',
    ell: 50.0,
    kappa: 1.0,
    rMax: 150.0,
    tauExcl: 24,
    rExcl: 10,
    showStations: true,
    showWind: true,
    showLinks: true,
    showHotspots: true
  };

  let selectedCellId = 'cell_28'; // Mae Hong Son / Chiang Mai border centroid
  let onCellSelectCallback = null;

  /**
   * Color Ramp for Predicted Probability pi_i (0.0 to 1.0)
   */
  function getProbabilityColor(prob) {
    if (prob <= 0.05) return '#0284c7'; // Cool Blue
    if (prob <= 0.15) return '#10b981'; // Emerald Green
    if (prob <= 0.30) return '#eab308'; // Amber Yellow
    if (prob <= 0.50) return '#f97316'; // Vibrant Orange
    return '#e11d48'; // Critical Rose-Red
  }

  function getScoreColor(val) {
    if (val <= 0.2) return '#38bdf8';
    if (val <= 0.8) return '#a855f7';
    if (val <= 1.8) return '#f43f5e';
    return '#db2777';
  }

  /**
   * Initialize Leaflet Map with Real Satellite Imagery Tiles
   */
  function init(mapContainerId, onCellSelect) {
    onCellSelectCallback = onCellSelect;
    const container = document.getElementById(mapContainerId);
    if (!container || typeof L === 'undefined') return;

    // Center on Northern Thailand (Mae Hong Son - Chiang Mai - Chiang Rai)
    leafletMap = L.map(mapContainerId, {
      center: [19.10, 99.10],
      zoom: 8,
      minZoom: 7,
      maxZoom: 13,
      zoomControl: true,
      attributionControl: true
    });

    // 1. High-Resolution Free Esri World Imagery Satellite Base Layer
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri, Earthstar Geographics, USGS, NASA'
    }).addTo(leafletMap);

    // 2. Reference Places & Borders Hybrid Layer
    L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      opacity: 0.65
    }).addTo(leafletMap);

    // Layer Groups
    gridLayerGroup = L.layerGroup().addTo(leafletMap);
    linkLayerGroup = L.layerGroup().addTo(leafletMap);
    windLayerGroup = L.layerGroup().addTo(leafletMap);
    hotspotLayerGroup = L.layerGroup().addTo(leafletMap);
    stationLayerGroup = L.layerGroup().addTo(leafletMap);
  }

  /**
   * Render or Re-render Spatial Grid & Layers
   */
  function render(scenario, params = {}) {
    currentScenario = scenario;
    currentParams = { ...currentParams, ...params };
    if (!leafletMap || !currentScenario) return;

    // Clear Previous Overlays
    gridLayerGroup.clearLayers();
    linkLayerGroup.clearLayers();
    windLayerGroup.clearLayers();
    hotspotLayerGroup.clearLayers();
    stationLayerGroup.clearLayers();

    // 1. Compute Station Anomalies
    const computedStations = currentScenario.stationData.map(st => {
      const reg = ScenariosData.STATIONS_REGISTRY.find(r => r.id === st.id) || {
        name: st.id, lat: 19.0, lon: 99.0, elev: 300
      };
      const anomaly = MathEngine.calculateStationAnomaly(st.current, st.past);
      return {
        ...reg,
        current: st.current,
        z: anomaly.z,
        a: anomaly.a,
        median: anomaly.median,
        mad: anomaly.mad
      };
    });

    const windToRad = (currentScenario.windField.toDeg * Math.PI) / 180;

    // 2. Compute Spatial Grid Calculations
    const processedCells = ScenariosData.BASE_GRID_CELLS.map(cell => {
      const cellWithWind = {
        ...cell,
        temp2m: currentScenario.weatherModifiers.tempMean + (cell.elevation > 500 ? -2.5 : 1.0),
        rh: currentScenario.weatherModifiers.rhMean + (cell.elevation > 500 ? 5.0 : -3.0),
        windSpeed: currentScenario.windField.speedAvg,
        windToRad,
        rain24h: currentScenario.weatherModifiers.rain24h,
        soilMoisture: currentScenario.weatherModifiers.soilMoist
      };

      const scores = MathEngine.computeNetworkScoresForCell(cellWithWind, computedStations, {
        ell: currentParams.ell,
        kappa: currentParams.kappa,
        rMax: currentParams.rMax
      });

      const modelHierarchy = MathEngine.evaluateModelHierarchy(cellWithWind, scores);

      const isGroundTruthHotspot = currentScenario.groundTruthHotspots.some(gt =>
        Math.abs(gt.lat - cell.lat) < 0.12 && Math.abs(gt.lon - cell.lon) < 0.12
      );

      const isExcluded = MathEngine.evaluateExclusion(
        cell,
        currentScenario.pastHotspots,
        currentParams.tauExcl,
        currentParams.rExcl
      );

      return {
        ...cellWithWind,
        scores,
        modelHierarchy,
        isGroundTruthHotspot: isGroundTruthHotspot ? 1 : 0,
        isExcluded
      };
    });

    const activeCell = processedCells.find(c => c.id === selectedCellId) || processedCells[0];

    // 3. Draw Grid Cells
    const halfStep = 0.20; // Half of 0.4-degree grid spacing
    processedCells.forEach(cell => {
      const bounds = [
        [cell.lat - halfStep, cell.lon - halfStep],
        [cell.lat + halfStep, cell.lon + halfStep]
      ];

      let fillColor = '#0284c7';
      let fillOpacity = 0.55;
      const modelVal = cell.modelHierarchy[currentParams.selectedModel] || 0;

      if (cell.isExcluded && currentParams.heatmapMode === 'exclusion') {
        fillColor = '#e11d48';
        fillOpacity = 0.75;
      } else {
        if (currentParams.heatmapMode === 'prob') {
          fillColor = getProbabilityColor(modelVal);
          fillOpacity = Math.max(0.35, Math.min(0.85, modelVal * 1.2 + 0.3));
        } else if (currentParams.heatmapMode === 'phi_w') {
          fillColor = getScoreColor(cell.scores.phi_W);
          fillOpacity = 0.65;
        } else if (currentParams.heatmapMode === 'phi_d') {
          fillColor = getScoreColor(cell.scores.phi_D);
          fillOpacity = 0.65;
        } else if (currentParams.heatmapMode === 'groundtruth') {
          fillColor = cell.isGroundTruthHotspot ? '#e11d48' : '#0f172a';
          fillOpacity = cell.isGroundTruthHotspot ? 0.8 : 0.2;
        }
      }

      const isSelected = cell.id === selectedCellId;
      const rect = L.rectangle(bounds, {
        color: isSelected ? '#db2777' : '#ffffff',
        weight: isSelected ? 3.5 : 0.8,
        opacity: isSelected ? 1.0 : 0.4,
        fillColor: fillColor,
        fillOpacity: fillOpacity
      });

      rect.on('click', () => {
        selectedCellId = cell.id;
        render(currentScenario, currentParams);
      });

      rect.bindTooltip(`
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
          <b>Cell (${cell.lat}°N, ${cell.lon}°E)</b><br/>
          ความน่าจะเป็น (${currentParams.selectedModel}): <b>${(modelVal * 100).toFixed(1)}%</b><br/>
          คะแนนเครือข่าย Φ_i: <b>${cell.scores.phi_W}</b><br/>
          สถานีใกล้สุด: ${cell.scores.nearestStationName} (${cell.scores.nearestDistance} km)
        </div>
      `, { sticky: true });

      gridLayerGroup.addLayer(rect);
    });

    // 4. Draw Network Links to Active Cell
    if (currentParams.showLinks && activeCell) {
      activeCell.scores.stationInfluences.forEach(inf => {
        const st = computedStations.find(s => s.name === inf.name);
        if (!st) return;

        const weight = Math.max(1.0, Math.min(5.0, inf.q_ij * 4.5));
        const opacity = Math.max(0.3, Math.min(0.9, inf.q_ij));

        const line = L.polyline([[activeCell.lat, activeCell.lon], [st.lat, st.lon]], {
          color: '#db2777',
          weight: weight,
          opacity: opacity,
          dashArray: '6, 6'
        });
        linkLayerGroup.addLayer(line);
      });
    }

    // 5. Draw Wind Direction Vectors
    if (currentParams.showWind) {
      const windRad = (currentScenario.windField.toDeg * Math.PI) / 180;
      const arrowDistKm = 22;
      const degLatPerKm = 1 / 111.0;
      const degLonPerKm = 1 / (111.0 * Math.cos(19.0 * Math.PI / 180));

      const dLat = Math.cos(windRad) * arrowDistKm * degLatPerKm;
      const dLon = Math.sin(windRad) * arrowDistKm * degLonPerKm;

      const sampleLats = [20.0, 19.4, 18.8, 18.2];
      const sampleLons = [98.0, 98.8, 99.6, 100.4];

      sampleLats.forEach(lat => {
        sampleLons.forEach(lon => {
          const start = [lat - dLat / 2, lon - dLon / 2];
          const end = [lat + dLat / 2, lon + dLon / 2];

          const windLine = L.polyline([start, end], {
            color: '#38bdf8',
            weight: 2.5,
            opacity: 0.85
          });
          windLayerGroup.addLayer(windLine);

          const windArrowHead = L.circleMarker(end, {
            radius: 3,
            color: '#38bdf8',
            fillColor: '#38bdf8',
            fillOpacity: 1
          });
          windLayerGroup.addLayer(windArrowHead);
        });
      });
    }

    // 6. Draw NASA VIIRS Active Fire Hotspots
    if (currentParams.showHotspots) {
      currentScenario.groundTruthHotspots.forEach(h => {
        const fireIcon = L.divIcon({
          className: 'leaflet-fire-icon',
          html: '🔥',
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        const marker = L.marker([h.lat, h.lon], { icon: fireIcon });
        marker.bindTooltip(`<b>NASA VIIRS Active Fire Hotspot</b><br/>ตรวจพบจุดความร้อนจริงในช่วง (t, t + 24h]`, { sticky: true });
        hotspotLayerGroup.addLayer(marker);
      });
    }

    // 7. Draw Air4Thai Stations
    if (currentParams.showStations) {
      computedStations.forEach(st => {
        const customIcon = L.divIcon({
          className: 'leaflet-station-icon',
          html: `
            ${st.a > 0.5 ? '<div class="station-pulse-halo"></div>' : ''}
            <div class="station-core-dot"></div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        const marker = L.marker([st.lat, st.lon], { icon: customIcon });
        marker.bindTooltip(`
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
            <b>${st.name}</b><br/>
            PM2.5: <b>${st.current} µg/m³</b> (Median: ${st.median})<br/>
            Positive Anomaly a_j: <b style="color: #7c3aed;">+${st.a}</b>
          </div>
        `, { sticky: true });
        stationLayerGroup.addLayer(marker);
      });
    }

    // Trigger Callback to update Cell Inspector Panel
    if (onCellSelectCallback && activeCell) {
      onCellSelectCallback(activeCell, computedStations, currentScenario);
    }
  }

  function invalidateSize() {
    if (leafletMap) {
      leafletMap.invalidateSize();
    }
  }

  return {
    init,
    render,
    invalidateSize,
    setSelectedCell: id => { selectedCellId = id; }
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MapRenderer;
}
