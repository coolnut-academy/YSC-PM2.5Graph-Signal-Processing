/**
 * PM2.5 Network Mathematical Model - Data Service & Free API Integration
 * Connects to 100% Free Public APIs with Offline Resilient Fallback
 * Provides Academic Citations and Metadata for [Ref.] Buttons
 */

const DataService = (function() {

  // Verified Public Academic & Open Data Sources (Blueprint Section 6 & References)
  const REFERENCES_REPOSITORY = {
    'air4thai': {
      id: 'air4thai',
      title: 'Air4Thai / Pollution Control Department (PCD Thailand)',
      agency: 'Pollution Control Department, Ministry of Natural Resources and Environment, Thailand',
      dataType: 'Ground-based hourly PM2.5 concentrations (ug/m3) and station coordinates',
      endpoint: 'http://air4thai.pcd.go.th / EnviLink Open Services',
      license: 'Free Public Open Data (Government of Thailand)',
      updateFrequency: 'Hourly automated reporting',
      citation: 'Pollution Control Department (PCD). (2024). Thailand Air Quality and Air Pollution Database. Ministry of Natural Resources and Environment, Bangkok, Thailand.',
      roleInModel: 'Used to compute station anomaly z_j(t), positive anomaly a_j(t), and network precursor scores Phi_i^(D), Phi_i.'
    },

    'openmeteo': {
      id: 'openmeteo',
      title: 'Open-Meteo Air Quality & Weather Global API',
      agency: 'Open-Meteo GmbH / European Centre for Medium-Range Weather Forecasts (ECMWF)',
      dataType: 'Live PM2.5, 10m Wind speed, Wind direction (u, v vectors), 2m Temperature, Relative Humidity',
      endpoint: 'https://api.open-meteo.com/v1/forecast & https://air-quality-api.open-meteo.com/v1/air-quality',
      license: 'Open Access / Creative Commons Attribution 4.0 International (CC BY 4.0) - No API key required',
      updateFrequency: 'Hourly updates, 0.1-degree spatial resolution',
      citation: 'Zippenfenig, P. (2024). Open-Meteo: Free High-Resolution Weather & Air Quality API. Open-Meteo Documentation, https://open-meteo.com/',
      roleInModel: 'Enables live client-side data queries for real-time demonstration during judging presentation.'
    },

    'firms_viirs': {
      id: 'firms_viirs',
      title: 'NASA FIRMS / VIIRS Active Fire Hotspots (375m I-Band)',
      agency: 'National Aeronautics and Space Administration (NASA) Earthdata / Land, Atmosphere Near-real-time Capability for EOS (LANCE)',
      dataType: 'Satellite-detected thermal active-fire anomalies (375-meter spatial resolution, day & night passes)',
      endpoint: 'https://firms.modaps.eosdis.nasa.gov / NASA Earthdata Open Access',
      license: 'NASA Open Data Policy (Free and Open Access for Research)',
      updateFrequency: 'Near real-time (NRT) satellite passes (Suomi-NPP & NOAA-20/21)',
      citation: 'Schroeder, W., Oliva, P., Giglio, L., & Csiszar, I. A. (2014). The New VIIRS 375m active fire detection product: Algorithm description and initial assessment. Remote Sensing of Environment, 143, 85-96.',
      roleInModel: 'Defines target binary response variable Y_i(t; 24h) and spatiotemporal exclusion filter E_i(t; tau_excl, r_excl).'
    },

    'era5_land': {
      id: 'era5_land',
      title: 'ERA5-Land Global Reanalysis',
      agency: 'Copernicus Climate Change Service (C3S) / ECMWF',
      dataType: '2m Temperature, Dewpoint/RH, 10m Wind components (u, v), Total Precipitation, Volumetric Soil Water',
      endpoint: 'https://cds.climate.copernicus.eu / Copernicus Data Space',
      license: 'Copernicus Open Access License (Free for research & commercial use)',
      updateFrequency: 'Hourly reanalysis, 0.1-degree (~9 km) grid',
      citation: 'Muñoz-Sabater, J., et al. (2021). ERA5-Land: A state-of-the-art global reanalysis dataset for land applications. Earth System Science Data, 13(9), 4349-4383.',
      roleInModel: 'Constructs physical environmental feature vector H_i(t) in baseline model M0.'
    },

    'srtm_usgs': {
      id: 'srtm_usgs',
      title: 'SRTM 1 Arc-Second Global Elevation (USGS)',
      agency: 'United States Geological Survey (USGS) & NASA',
      dataType: 'Digital Elevation Model (DEM, 30-meter resolution), Surface Slope, Terrain Aspect',
      endpoint: 'https://earthexplorer.usgs.gov / OpenTopography',
      license: 'Public Domain / Open Data',
      updateFrequency: 'Static high-precision topographic baseline',
      citation: 'Farr, T. G., et al. (2007). The Shuttle Radar Topography Mission. Reviews of Geophysics, 45(2), RG2004.',
      roleInModel: 'Provides topographic elevation, slope, and mountain barrier factors for spatial baseline M0.'
    },

    'modis_ndvi': {
      id: 'modis_ndvi',
      title: 'MODIS MOD13Q1 Vegetation Indices (NDVI / EVI)',
      agency: 'NASA Land Processes Distributed Active Archive Center (LP DAAC)',
      dataType: 'Normalized Difference Vegetation Index (NDVI) and Enhanced Vegetation Index (EVI)',
      endpoint: 'https://lpdaac.usgs.gov / NASA Earthdata',
      license: 'NASA Open Data Policy (Free Public Research Access)',
      updateFrequency: '16-day composited, 250-meter resolution',
      citation: 'Didan, K. (2015). MOD13Q1 MODIS/Terra Vegetation Indices 16-Day L3 Global 250m SIN Grid V006. NASA EOSDIS Land Processes DAAC.',
      roleInModel: 'Quantifies biomass dryness and fuel availability in physical model M0.'
    }
  };

  /**
   * Fetch Real-Time Data from Open-Meteo Air Quality & Weather API
   * Coordinates default: Chiang Mai / Northern Thailand centroid (18.79N, 98.98E)
   */
  async function fetchLiveOpenMeteoData(lat = 18.79, lon = 98.98) {
    try {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation&forecast_days=1&timezone=Asia%2FBangkok`;
      const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm2_5&forecast_days=2&timezone=Asia%2FBangkok`;

      const [weatherRes, airRes] = await Promise.all([
        fetch(weatherUrl, { cache: 'no-store' }),
        fetch(airUrl, { cache: 'no-store' })
      ]);

      if (!weatherRes.ok || !airRes.ok) {
        throw new Error('Live API HTTP error status');
      }

      const weatherJson = await weatherRes.json();
      const airJson = await airRes.json();

      const hourlyW = weatherJson.hourly;
      const hourlyA = airJson.hourly;

      // Extract latest reading
      const lastIdx = hourlyW.time.length - 1;
      const temp = hourlyW.temperature_2m[lastIdx] || 32.0;
      const rh = hourlyW.relative_humidity_2m[lastIdx] || 35.0;
      const windSpeed = hourlyW.wind_speed_10m[lastIdx] || 3.5;
      const windDirFrom = hourlyW.wind_direction_10m[lastIdx] || 220; // Deg from which wind blows
      const windDirTo = (windDirFrom + 180) % 360; // Deg wind blows TOWARDS

      const pm25Series = hourlyA.pm2_5 ? hourlyA.pm2_5.filter(v => v !== null && v !== undefined) : [45, 50, 55];
      const latestPM25 = pm25Series.length > 0 ? pm25Series[pm25Series.length - 1] : 52.0;

      return {
        success: true,
        source: 'Open-Meteo Live API',
        timestamp: new Date().toLocaleTimeString('th-TH') + ' ICT',
        data: {
          temp,
          rh,
          windSpeed,
          windDirToDeg: windDirTo,
          latestPM25,
          pm25History: pm25Series.slice(-14)
        }
      };
    } catch (err) {
      console.warn('Live API query failed, utilizing guaranteed offline benchmark dataset:', err);
      return {
        success: false,
        source: 'Offline Historical Fallback',
        error: err.message
      };
    }
  }

  /**
   * Get Reference Metadata for a Specific Key or All Keys
   */
  function getReference(key) {
    return REFERENCES_REPOSITORY[key] || null;
  }

  function getAllReferences() {
    return Object.values(REFERENCES_REPOSITORY);
  }

  return {
    REFERENCES_REPOSITORY,
    fetchLiveOpenMeteoData,
    getReference,
    getAllReferences
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataService;
}
