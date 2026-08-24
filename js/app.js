/**
 * Talus - Trail Roadbook Generator & TrailScope — Main Application (v7.3)
 *
 * Full Bi-directional Linkage across:
 *  - GPX / KML / KMZ Parsing & Elevation Smoothing Modes
 *  - Zone 1: Unified Roadbook Elevation Profile (SVG + Hover Sync + Multi-Color Modes)
 *  - Zone 2: Interactive Leaflet Map + 8-Metric Stats + 6-Level Slope Breakdown
 *  - Zone 3: CP Table + Multi-Mode Segment Statistics Table
 *  - Floating Modal: Checkpoint Visual Configuration & Custom Annotations
 *  - Multi-Scale (1x/2x/3x) & Multi-Ratio (20:9/19.5:9/Auto) PNG Export
 *  - Dynamic Chinese / English i18n Localization
 */
(function () {
  'use strict';

  var TR = window.TrailRoadbook;

  // ── i18n Translation Dictionary ─────────────────────────────────────
  var T = {
    zh: {
      pageTitle: "🏔️ Talus - Trail Roadbook Generator",
      headerSubtitle: "越野跑路书与轨迹分析",
      vibeCodedBy: "Vibe coded by",
      uploadTrack: "上传轨迹 (GPX/KML/KMZ)",
      uploadTrackTitle: "上传 GPX / KML / KMZ 轨迹文件",
      raceNameLabel: "比赛名称",
      raceStartLabel: "出发时间",
      elevCalcModeLabel: "⚡ 爬升计算",
      elevModeRaw: "原始数据",
      elevModeSmooth: "平滑 (4m)",
      colorModeLabel: "🎨 剖面着色",
      colorModeClassic: "经典路书柱条",
      colorModeGradient: "按坡度渐变",
      colorModeElevation: "按海拔渐变",
      importJson: "导入 JSON",
      importJsonTitle: "从 JSON 文件导入检查点与配置",
      downloadTemplate: "下载模板",
      downloadTemplateTitle: "下载配置 JSON 模板",
      exportJson: "导出 JSON",
      exportJsonTitle: "导出检查点与配置为 JSON 文件",
      languageLabel: "🌐 语言",
      exportRatioLabel: "导出比例",
      ratioAuto: "默认自适应 (无白边)",
      ratio19_5_9: "19.5:9横屏（iPhone 17/16）",
      ratio20_9: "20:9（小米、华为、安卓）",
      downloadPng: "下载图片 ▾",
      scale1: "1× 标准分辨率",
      scale2: "2× 高清 (推荐)",
      scale3: "3× 超高清 (打印)",
      placeholderText: "上传 GPX / KML / KMZ 文件以生成高程剖面路书",
      placeholderTextSub: "Upload a GPX/KML/KMZ file to generate the roadbook & map",

      zone1Title: "📈 统一路书高程剖面图 (Unified Roadbook Profile)",
      zone1Tip: "鼠标或手指滑动可实时在地图上追踪位置，分段及文字直接联动",
      mapExplorerTitle: "🗺️ 交互式轨迹地图",
      mapSourceLabel: "底图图层",
      btnFitMap: "居中全景",
      btnFitMapTitle: "自动缩放至全景轨迹",

      mapSourceTiandituVec: "天地图路网 (推荐)",
      mapSourceTiandituSat: "天地图卫星",
      mapSourceTiandituTer: "天地图地形",
      mapSourceGaodeSat: "高德混合图",
      mapSourceGaodeRoad: "高德路网图",
      mapSourceOSM: "OpenStreetMap",
      mapSourceOpenTopo: "OpenTopoMap",
      mapSourceCyclOSM: "CyclOSM",

      statsGradientTitle: "📐 坡度分布与实战技术要点",
      segmentStatsTitle: "📋 多模式分段统计",
      segModeWaypoint: "📍 检查点",
      segModeAuto: "📈 坡度变化",
      segMode1km: "📏 1 km",
      segMode5km: "📏 5 km",
      segColNum: "#",
      segColDist: "分段里程",
      segColAscent: "爬升",
      segColDescent: "下降",
      segColAvgGrad: "平均坡度",
      segColMaxGrad: "最大坡度",

      statTotalDistance: "总里程",
      statTotalAscent: "累计爬升 (D+)",
      statTotalDescent: "累计下降 (D-)",
      statMaxElevation: "最高海拔",
      statMinElevation: "最低海拔",
      statAvgGradient: "平均坡度",
      statMaxUphill: "最大上坡",
      statMaxDownhill: "最大下坡",
      statUphillDist: "上坡距离",
      statDownhillDist: "下坡距离",

      cpTableTitle: "📍 CP 点 / 补给站 列表",
      cpTableTip: "点击「⚙️」打开详细视觉配置浮窗",
      colNum: "#",
      colName: "名称",
      colDist: "距起点 (km)",
      colTime: "分段用时",
      colNotes: "备注 (支持回车多行)",
      addCpBtn: "添加 CP 点",
      poiPanelTitle: "📍 检查点详细视觉配置",
      poiCol1Title: "基本信息",
      poiCol1Pos: "CP位置距离 (公里)",
      poiCol1Intermediate: "用于分段统计点 (划分子赛段)",
      poiCol1FontSizesTitle: "各元素字号大小设置 (像素)",
      fsLabelTitle: "比赛名称",
      fsLabelCpName: "CP点名称",
      fsLabelCpElev: "分段爬升",
      fsLabelCpTime: "预计用时",
      fsLabelCpNotes: "备注信息",
      fsLabelSegment: "区间分段",
      fsLabelCumulDist: "底部累计距离",
      poiCol2Title: "补给站类型",
      poiLabelSymbol: "类型图标",
      poiCol3Title: "垂直指示辅助线",
      poiCol3Color: "指示线颜色",
      poiCol3Thickness: "指示线粗细 (px)",
      poiCol4Title: "图表内嵌自定义标注",
      poiCol4Color: "标注颜色",
      poiCol4Size: "字号 (px)",
      poiCol4Orient: "排列方向",
      orientRight: "靠右横排 (To Right)",
      orientLeft: "靠左横排 (To Left)",
      orientRotMinus90: "靠右竖排 (Rotated -90°)",
      orientRot90: "靠左竖排 (Rotated 90°)",
      labelLeftBottom: "左侧 - 下",
      labelLeftMiddle: "左侧 - 中",
      labelLeftTop: "左侧 - 上",
      labelRightBottom: "右侧 - 下",
      labelRightMiddle: "右侧 - 中",
      labelRightTop: "右侧 - 上",

      iconStart: "🟢 起点",
      iconFinish: "🏁 终点",
      iconAssisted: "🤝 有人协助补给站",
      iconDropbag: "🛍️ 寄存包补给站",
      iconClassic: "🍉 普通补给站",
      iconWater: "💧 水源点",
      iconCheckpoint: "🚩 打卡点",
      iconPeak: "🏔️ 山峰",
      iconDanger: "⚡ 危险",

      toastAddCp: "已添加新CP点，位置为 ",
      toastAddCpTail: " 公里 ✓",
      toastTrackSuccess: "轨迹载入成功：全长 ",
      toastTrackSuccessMid: " km，累计爬升 +",
      toastTrackSuccessTail: "m ✓",
      toastTrackError: "轨迹解析错误：",
      toastImportSuccess: "配置导入成功 ✓",
      toastImportError: "导入格式错误：",
      toastExportSuccess: "配置导出成功 ✓",
      toastGpxFirst: "请先上传比赛路线的 GPX / KML / KMZ 文件。",
      toastExporting: "正在导出 ",
      toastKeepOne: "必须保留至少一个检查点。",
      toastDeleted: "检查点已删除 ✓",
      toastTemplateSuccess: "模板 JSON 下载成功 ✓",
      newCpName: "新检查点",
      deleteCpTitle: "删除此CP",
      settingsCpTitle: "配置此CP视觉属性",
      modalCloseTitle: "关闭",
      placeholderCpNameInput: "CP名称",
      placeholderTimeInput: "用时 H:MM",
      placeholderNotesInput: "备注信息",
      placeholderTextNone: "无",

      btnCancel: "取消",
      btnSaveApply: "✓ 保存并应用",

      labelStopDuration: "⏸️ 停留时间 (分钟)",
      labelPassage: "通过"
    },
    en: {
      pageTitle: "🏔️ Talus - Trail Roadbook Generator",
      headerSubtitle: "Trail Roadbook & Track Analytics",
      vibeCodedBy: "Vibe coded by",
      uploadTrack: "Upload Track (GPX/KML/KMZ)",
      uploadTrackTitle: "Upload GPX / KML / KMZ route file",
      raceNameLabel: "Race Name",
      raceStartLabel: "Start Time",
      elevCalcModeLabel: "⚡ Elevation Calc",
      elevModeRaw: "Raw Data",
      elevModeSmooth: "Smooth (4m)",
      colorModeLabel: "🎨 Profile Color",
      colorModeClassic: "Classic Sisyf Bars",
      colorModeGradient: "By Grade Gradient",
      colorModeElevation: "By Elevation Gradient",
      importJson: "Import JSON",
      importJsonTitle: "Import checkpoints & settings from JSON",
      downloadTemplate: "Template",
      downloadTemplateTitle: "Download JSON template",
      exportJson: "Export JSON",
      exportJsonTitle: "Export checkpoints & settings as JSON",
      languageLabel: "🌐 Language",
      exportRatioLabel: "Aspect Ratio",
      ratioAuto: "Auto-fit (No Padding)",
      ratio19_5_9: "19.5:9 Landscape (iPhone 17/16)",
      ratio20_9: "20:9 Landscape (Android/Xiaomi)",
      downloadPng: "Download PNG ▾",
      scale1: "1× Standard",
      scale2: "2× HD (Recommended)",
      scale3: "3× Ultra HD (Print)",
      placeholderText: "Upload GPX / KML / KMZ file to generate the roadbook",
      placeholderTextSub: "Upload a GPX/KML/KMZ file to generate the roadbook & map",

      zone1Title: "📈 Unified Roadbook Elevation Profile",
      zone1Tip: "Hover/touch to track real-time position on map, all segments & text linked",
      mapExplorerTitle: "🗺️ Interactive Trail Map",
      mapSourceLabel: "Base Map",
      btnFitMap: "Center Map",
      btnFitMapTitle: "Auto zoom and fit entire track",

      mapSourceTiandituVec: "Tianditu Road (Recommended)",
      mapSourceTiandituSat: "Tianditu Satellite",
      mapSourceTiandituTer: "Tianditu Terrain",
      mapSourceGaodeSat: "Gaode Hybrid",
      mapSourceGaodeRoad: "Gaode Road",
      mapSourceOSM: "OpenStreetMap",
      mapSourceOpenTopo: "OpenTopoMap",
      mapSourceCyclOSM: "CyclOSM",

      statsGradientTitle: "📐 Grade Distribution & Technical Tips",
      segmentStatsTitle: "📋 Segment Statistics",
      segModeWaypoint: "📍 Checkpoints",
      segModeAuto: "📈 Grade Changes",
      segMode1km: "📏 1 km",
      segMode5km: "📏 5 km",
      segColNum: "#",
      segColDist: "Segment",
      segColAscent: "Gain",
      segColDescent: "Loss",
      segColAvgGrad: "Avg Grade",
      segColMaxGrad: "Max Grade",

      statTotalDistance: "Total Distance",
      statTotalAscent: "Elevation Gain (D+)",
      statTotalDescent: "Elevation Loss (D-)",
      statMaxElevation: "Max Elevation",
      statMinElevation: "Min Elevation",
      statAvgGradient: "Avg Grade",
      statMaxUphill: "Max Uphill",
      statMaxDownhill: "Max Downhill",
      statUphillDist: "Uphill Dist",
      statDownhillDist: "Downhill Dist",

      cpTableTitle: "📍 Checkpoint / CP List",
      cpTableTip: "Click「⚙️」to open visual settings popup",
      colNum: "#",
      colName: "Name",
      colDist: "Distance (km)",
      colTime: "Segment Duration",
      colNotes: "Notes (supports Enter)",
      addCpBtn: "Add Checkpoint",
      poiPanelTitle: "📍 Checkpoint Visual Settings",
      poiCol1Title: "Basic Info",
      poiCol1Pos: "CP Distance (km)",
      poiCol1Intermediate: "Use for segment split stats",
      poiCol1FontSizesTitle: "Granular Font Sizes (px)",
      fsLabelTitle: "Race Title",
      fsLabelCpName: "CP Name",
      fsLabelCpElev: "Segment Climb",
      fsLabelCpTime: "Time",
      fsLabelCpNotes: "Notes",
      fsLabelSegment: "Segment",
      fsLabelCumulDist: "Cumul Dist",
      poiCol2Title: "Aid Station Type",
      poiLabelSymbol: "Symbol",
      poiCol3Title: "Vertical Guide Axis",
      poiCol3Color: "Line Color",
      poiCol3Thickness: "Line Thickness (px)",
      poiCol4Title: "Chart Inside Annotations",
      poiCol4Color: "Text Color",
      poiCol4Size: "Size (px)",
      poiCol4Orient: "Alignment",
      orientRight: "To Right",
      orientLeft: "To Left",
      orientRotMinus90: "Rotated -90°",
      orientRot90: "Rotated 90°",
      labelLeftBottom: "Left - Bottom",
      labelLeftMiddle: "Left - Middle",
      labelLeftTop: "Left - Top",
      labelRightBottom: "Right - Bottom",
      labelRightMiddle: "Right - Middle",
      labelRightTop: "Right - Top",

      iconStart: "🟢 Start",
      iconFinish: "🏁 Finish",
      iconAssisted: "🤝 Assisted Aid",
      iconDropbag: "🛍️ Drop Bag",
      iconClassic: "🍉 Classic Aid",
      iconWater: "💧 Water Point",
      iconCheckpoint: "🚩 Checkpoint",
      iconPeak: "🏔️ Peak",
      iconDanger: "⚡ Danger",

      toastAddCp: "Added new Checkpoint at ",
      toastAddCpTail: " km ✓",
      toastTrackSuccess: "Track loaded successfully: Total ",
      toastTrackSuccessMid: " km, Gain +",
      toastTrackSuccessTail: "m ✓",
      toastTrackError: "Track Parse Error: ",
      toastImportSuccess: "Configuration imported successfully ✓",
      toastImportError: "Import format error: ",
      toastExportSuccess: "Configuration exported successfully ✓",
      toastGpxFirst: "Please upload the GPX / KML / KMZ route file first.",
      toastExporting: "Exporting ",
      toastKeepOne: "Must keep at least one checkpoint.",
      toastDeleted: "Checkpoint deleted ✓",
      toastTemplateSuccess: "Template JSON downloaded successfully ✓",
      newCpName: "New Checkpoint",
      deleteCpTitle: "Delete Checkpoint",
      settingsCpTitle: "Configure Checkpoint Visuals",
      modalCloseTitle: "Close",
      placeholderCpNameInput: "CP Name",
      placeholderTimeInput: "Duration H:MM",
      placeholderNotesInput: "Notes",
      placeholderTextNone: "None",

      btnCancel: "Cancel",
      btnSaveApply: "✓ Save & Apply",

      labelStopDuration: "⏸️ Stop Duration (min)",
      labelPassage: "Passage"
    }
  };

  function detectLanguage() {
    var lang = navigator.language || navigator.userLanguage || 'en';
    lang = lang.toLowerCase();
    if (lang.indexOf('zh') !== -1) return 'zh';
    return 'en';
  }

  function getDefaultStartDatetime() {
    var now = new Date();
    var day = now.getDay();
    var diff = (6 - day + 7) % 7; // Default to upcoming Saturday (or today if Sat)
    if (diff === 0 && now.getHours() >= 12) diff = 7;
    var target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff, 6, 0, 0);
    var y = target.getFullYear();
    var m = target.getMonth() + 1;
    var d = target.getDate();
    var hh = target.getHours();
    var mm = target.getMinutes();
    return y + '-' + (m < 10 ? '0' : '') + m + '-' + (d < 10 ? '0' : '') + d + 'T' + (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm;
  }

  // ── Global Application State ────────────────────────────────────────
  var state = {
    trackData: null,
    trackpoints: null,
    trackFileName: '',
    raceName: '',
    startTime: getDefaultStartDatetime(),
    activeCPIndex: 0,
    elevationMode: 'smooth',  // 'smooth' | 'raw'
    colorMode: 'classic',     // 'classic' | 'gradient' | 'elevation'
    segmentMode: 'waypoint',  // 'waypoint' | 'auto' | '1000' | '5000'
    activeSegmentIdx: -1,
    fontSizeTitle: 18,
    fontSizeCPName: 14,
    fontSizeCPElev: 11,
    fontSizeCPTime: 20,
    fontSizeCPNotes: 18,
    fontSizeSegment: 11,
    fontSizeCumulDist: 12,
    language: 'zh',
    checkpoints: []
  };

  TR.state = state;
  TR.elevationMode = state.elevationMode;

  // ── DOM References ──────────────────────────────────────────────────
  var dom = {};

  function init() {
    // Toolbar Elements
    dom.btnGpx            = document.getElementById('btn-gpx');
    dom.inputGpx          = document.getElementById('input-gpx');
    dom.inputName         = document.getElementById('input-name');
    dom.inputStartTime    = document.getElementById('input-start-time');
    dom.btnElevRaw        = document.getElementById('btn-elev-raw');
    dom.btnElevSmooth     = document.getElementById('btn-elev-smooth');
    dom.selectColorMode   = document.getElementById('select-color-mode');
    dom.btnImport         = document.getElementById('btn-import');
    dom.inputJson         = document.getElementById('input-json');
    dom.btnTemplateJson   = document.getElementById('btn-template-json');
    dom.btnExportJson     = document.getElementById('btn-export-json');
    dom.btnExportImg      = document.getElementById('btn-export-img');
    dom.exportMenu        = document.getElementById('export-menu');
    dom.exportRatio       = document.getElementById('export-ratio');
    dom.selectLang        = document.getElementById('select-lang');
    dom.toast             = document.getElementById('toast');

    // Zone 1: Profile & Sidebar
    dom.profileContainer  = document.getElementById('profile-container');
    dom.placeholder       = document.getElementById('profile-placeholder');
    dom.fsTitle           = document.getElementById('fs-title');
    dom.fsCPName          = document.getElementById('fs-cpname');
    dom.fsCPElev          = document.getElementById('fs-cpelev');
    dom.fsCPTime          = document.getElementById('fs-cptime');
    dom.fsCPNotes         = document.getElementById('fs-cpnotes');
    dom.fsSegment         = document.getElementById('fs-segment');
    dom.fsCumulDist       = document.getElementById('fs-cumuldist');

    // Zone 2: Map & Gradient Distribution
    dom.selectMapSource   = document.getElementById('select-map-source');
    dom.btnFitMap         = document.getElementById('btn-fit-map');
    dom.trailStatCards    = document.getElementById('trail-stat-cards');
    dom.gradientDistContent = document.getElementById('gradient-distribution-content');

    // Zone 3: CP Table & Segment Statistics
    dom.cpTbody           = document.getElementById('cp-tbody');
    dom.btnAddCp          = document.getElementById('btn-add-cp');
    dom.segmentTbody      = document.getElementById('segment-tbody');

    // Floating Modal Elements
    dom.modalBackdrop     = document.getElementById('cp-modal-backdrop');
    dom.modalCpTitle      = document.getElementById('modal-cp-title');
    dom.btnModalClose     = document.getElementById('btn-modal-close');
    dom.btnModalCancel    = document.getElementById('btn-modal-cancel');
    dom.btnModalSave      = document.getElementById('btn-modal-save');

    dom.poiNameDetail     = document.getElementById('poi-name-detail');
    dom.poiPosition       = document.getElementById('poi-position');
    dom.poiTimeDetail     = document.getElementById('poi-time-detail');
    dom.poiStopDuration   = document.getElementById('poi-stop-duration');
    dom.poiNotesDetail    = document.getElementById('poi-notes-detail');
    dom.poiIntermediate   = document.getElementById('poi-intermediate');
    dom.poiIconSelect     = document.getElementById('poi-icon-select');

    dom.poiAxisColor      = document.getElementById('poi-axis-color');
    dom.poiAxisColorHex   = document.getElementById('poi-axis-color-hex');
    dom.poiAxisThickness  = document.getElementById('poi-axis-thickness');
    dom.poiTextColor      = document.getElementById('poi-text-color');
    dom.poiTextColorHex   = document.getElementById('poi-text-color-hex');
    dom.poiTextSize       = document.getElementById('poi-text-size');
    dom.poiTextOrientation= document.getElementById('poi-text-orientation');

    dom.poiTxtLeftBottom  = document.getElementById('poi-txt-left-bottom');
    dom.poiTxtLeftMiddle  = document.getElementById('poi-txt-left-middle');
    dom.poiTxtLeftTop     = document.getElementById('poi-txt-left-top');
    dom.poiTxtRightBottom = document.getElementById('poi-txt-right-bottom');
    dom.poiTxtRightMiddle = document.getElementById('poi-txt-right-middle');
    dom.poiTxtRightTop    = document.getElementById('poi-txt-right-top');

    // Initialize Map
    TR.trailMap.initMap('leafletMap');

    state.language = detectLanguage();
    if (dom.selectLang) dom.selectLang.value = state.language;

    if (state.checkpoints.length === 0) {
      var isZH = (state.language === 'zh');
      state.checkpoints = [
        { name: isZH ? '起点' : 'Start', distance: 0, icon: 'start', arrivalTime: '0:00', segmentTime: '0:00', notes: '' },
        { name: isZH ? '终点' : 'Finish', distance: 0, icon: 'finish', arrivalTime: '', segmentTime: '', notes: '' }
      ];
    }

    if (dom.inputStartTime) {
      dom.inputStartTime.value = state.startTime;
    }
    normalizeAllCPs();
    bindEvents();
    bindModalEvents();
    applyLanguage();
  }

  // ── Event Bindings ──────────────────────────────────────────────────
  function bindEvents() {
    dom.btnGpx.addEventListener('click', function () { dom.inputGpx.click(); });
    dom.inputGpx.addEventListener('change', handleTrackUpload);

    dom.inputName.addEventListener('input', function () {
      state.raceName = this.value;
      scheduleRender();
    });

    if (dom.inputStartTime) {
      dom.inputStartTime.addEventListener('change', function () {
        state.startTime = this.value;
        renderCPTable();
        scheduleRender();
      });
    }

    dom.btnElevRaw.addEventListener('click', function () { setElevationMode('raw'); });
    dom.btnElevSmooth.addEventListener('click', function () { setElevationMode('smooth'); });

    if (dom.selectColorMode) {
      dom.selectColorMode.addEventListener('change', function () {
        state.colorMode = this.value;
        renderAllComponents();
      });
    }

    if (dom.selectMapSource) {
      dom.selectMapSource.addEventListener('change', function () {
        TR.trailMap.changeMapSource(this.value);
      });
    }

    if (dom.btnFitMap) {
      dom.btnFitMap.addEventListener('click', function () {
        TR.trailMap.fitMapToTrack();
      });
    }

    document.querySelectorAll('.seg-mode-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.seg-mode-btn').forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        state.segmentMode = this.dataset.mode;
        state.activeSegmentIdx = -1;
        TR.trailAnalysis.resetSegmentCache();
        renderSegmentTable();
        scheduleRender();
      });
    });

    dom.btnImport.addEventListener('click', function () { dom.inputJson.click(); });
    dom.inputJson.addEventListener('change', handleJsonImport);
    dom.btnTemplateJson.addEventListener('click', handleJsonTemplateDownload);
    dom.btnExportJson.addEventListener('click', handleJsonExport);

    dom.selectLang.addEventListener('change', function () {
      state.language = this.value;
      applyLanguage();
    });

    dom.btnExportImg.addEventListener('click', function (e) {
      e.stopPropagation();
      dom.exportMenu.classList.toggle('open');
    });
    dom.exportMenu.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        dom.exportMenu.classList.remove('open');
        handleImageExport(parseInt(this.dataset.scale, 10));
      });
    });
    document.addEventListener('click', function () {
      dom.exportMenu.classList.remove('open');
    });

    dom.btnAddCp.addEventListener('click', handleAddCP);
    dom.exportRatio.addEventListener('change', scheduleRender);

    // Font size controls
    var fsMap = {
      'fs-title': 'fontSizeTitle',
      'fs-cpname': 'fontSizeCPName',
      'fs-cpelev': 'fontSizeCPElev',
      'fs-cptime': 'fontSizeCPTime',
      'fs-cpnotes': 'fontSizeCPNotes',
      'fs-segment': 'fontSizeSegment',
      'fs-cumuldist': 'fontSizeCumulDist'
    };
    Object.keys(fsMap).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', function () {
          state[fsMap[id]] = parseInt(this.value, 10) || 12;
          scheduleRender();
        });
      }
    });
  }

  // ── Track Upload (GPX / KML / KMZ) ──────────────────────────────────
  function handleTrackUpload() {
    var file = dom.inputGpx.files[0];
    if (!file) return;
    state.trackFileName = file.name;

    TR.gpxParser.parseFile(file, state.elevationMode).then(function (trackData) {
      state.trackData = trackData;
      state.trackpoints = trackData.points;

      // Auto-detect race start time from track if available
      if (trackData.startTime) {
        var d = new Date(trackData.startTime);
        if (!isNaN(d.getTime())) {
          var y = d.getFullYear();
          var m = d.getMonth() + 1;
          var day = d.getDate();
          var hh = d.getHours();
          var mm = d.getMinutes();
          var iso = y + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day + 'T' + (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm;
          state.startTime = iso;
          if (dom.inputStartTime) dom.inputStartTime.value = iso;
        }
      }

      // Auto-detect base map layer: if outside China, default to OpenStreetMap ('osm')
      var inChina = TR.trailMath.isTrackInChina(trackData.points);
      var autoMapSource = inChina ? 'tiandituluwang' : 'osm';
      if (dom.selectMapSource) {
        dom.selectMapSource.value = autoMapSource;
      }
      TR.trailMap.changeMapSource(autoMapSource);

      var totalDist = trackData.totalDistance;

      state.checkpoints.forEach(function (cp) {
        if (cp.icon === 'finish' && cp.distance === 0) {
          cp.distance = Math.round(totalDist * 100) / 100;
        }
      });

      if (trackData.waypoints && trackData.waypoints.length > 0 && state.checkpoints.length <= 2) {
        trackData.waypoints.forEach(function (wp) {
          if (wp.distance > 0.5 && wp.distance < totalDist - 0.5) {
            state.checkpoints.push(normalizeCP({
              name: wp.name || 'CP',
              distance: Math.round(wp.distance * 10) / 10,
              icon: 'classic',
              arrivalTime: '',
              segmentTime: '',
              notes: wp.desc || ''
            }, state.checkpoints.length));
          }
        });
      }

      sortCheckpoints();
      normalizeAllCPs();
      TR.trailAnalysis.resetSegmentCache();
      renderCPTable();
      renderAllComponents();

      toast(T[state.language].toastTrackSuccess + totalDist.toFixed(1) + T[state.language].toastTrackSuccessMid + Math.round(trackData.totalAscent) + T[state.language].toastTrackSuccessTail);
    }).catch(function (err) {
      toast(T[state.language].toastTrackError + err.message);
    });

    dom.inputGpx.value = '';
  }

  // ── Elevation Calculation Mode Switch ───────────────────────────────
  function setElevationMode(mode) {
    if (state.elevationMode === mode) return;
    state.elevationMode = mode;
    TR.elevationMode = mode;

    dom.btnElevRaw.classList.toggle('active', mode === 'raw');
    dom.btnElevSmooth.classList.toggle('active', mode === 'smooth');

    if (state.trackData) {
      var totals = TR.trailMath.ElevationCalculator.computeTotal(state.trackData.points, mode);
      state.trackData.totalAscent = totals.ascent;
      state.trackData.totalDescent = totals.descent;
      TR.trailAnalysis.resetSegmentCache();
      renderAllComponents();
    }
  }

  // ── Rendering All Visual Components (Full Reactive Sync) ───────────
  function renderAllComponents() {
    if (!state.trackData) return;
    renderProfile();
    TR.trailMap.drawMap(state.trackData, state.colorMode, state.checkpoints);
    renderTrailSummaryStats();
    renderGradientDistribution();
    renderSegmentTable();
  }

  // ── 1. Zone 1: Unified Profile Rendering ────────────────────────────
  var renderTimer = null;
  function scheduleRender() {
    if (renderTimer) clearTimeout(renderTimer);
    renderTimer = setTimeout(renderProfile, 80);
  }

  function renderProfile() {
    if (!state.trackpoints) return;
    if (dom.placeholder) dom.placeholder.style.display = 'none';

    var segments = TR.trailAnalysis.analyzeSegments(
      state.trackData,
      state.segmentMode,
      state.checkpoints,
      state.elevationMode,
      state.language
    );
    var activeSeg = (state.activeSegmentIdx >= 0 && segments[state.activeSegmentIdx]) ? segments[state.activeSegmentIdx] : null;

    TR.profile.render(
      dom.profileContainer,
      state.trackpoints,
      state.checkpoints,
      state.raceName,
      {
        title: state.fontSizeTitle,
        cpName: state.fontSizeCPName,
        cpElev: state.fontSizeCPElev,
        cpTime: state.fontSizeCPTime,
        cpNotes: state.fontSizeCPNotes,
        segment: state.fontSizeSegment,
        cumulDist: state.fontSizeCumulDist
      },
      dom.exportRatio.value,
      {
        colorMode: state.colorMode,
        activeSegment: activeSeg,
        onHover: function (ptIdx) {
          TR.trailMap.updateMapCurrentPoint(ptIdx);
        }
      }
    );
  }

  // ── 2. Zone 2: Trail Summary Stats Cards ────────────────────────────
  function renderTrailSummaryStats() {
    if (!dom.trailStatCards || !state.trackData) return;
    var td = state.trackData;
    var dict = T[state.language];

    var tiles = [
      { label: dict.statTotalDistance, val: td.totalDistance.toFixed(1) + ' km' },
      { label: dict.statTotalAscent, val: '+' + Math.round(td.totalAscent) + ' m', color: 'var(--success)' },
      { label: dict.statTotalDescent, val: '-' + Math.round(td.totalDescent) + ' m', color: 'var(--danger)' },
      { label: dict.statAvgGradient, val: td.avgGradient.toFixed(1) + ' %' },
      { label: dict.statMaxElevation, val: Math.round(td.maxElevation) + ' m', color: 'var(--trail-amber)' },
      { label: dict.statMinElevation, val: Math.round(td.minElevation) + ' m', color: 'var(--trail-blue)' },
      { label: dict.statMaxUphill, val: '+' + td.uphillMaxGradient.toFixed(1) + ' %' },
      { label: dict.statMaxDownhill, val: td.downhillMaxGradient.toFixed(1) + ' %' }
    ];

    var html = '';
    tiles.forEach(function (tile) {
      html += '<div class="trail-stat-tile">' +
        '<div class="label">' + tile.label + '</div>' +
        '<div class="value"' + (tile.color ? (' style="color:' + tile.color + '"') : '') + '>' + tile.val + '</div>' +
        '</div>';
    });
    dom.trailStatCards.innerHTML = html;
  }

  // ── 2. Zone 2: Slope Gradient Distribution & Practical Tips ─────────
  function renderGradientDistribution() {
    if (!dom.gradientDistContent || !state.trackData) return;
    var dist = TR.trailAnalysis.calculateGradientDistribution(state.trackData, state.language);
    if (!dist) return;

    var isZH = (state.language === 'zh');

    function buildSection(title, list) {
      var barHtml = '<div class="gradient-bar-stack">';
      list.forEach(function (l) {
        if (l.percentage > 0) {
          barHtml += '<div class="gradient-bar-seg" style="width:' + l.percentage.toFixed(1) + '%; background:' + l.color + '" title="' + l.name + ': ' + l.distance.toFixed(1) + 'km (' + l.percentage.toFixed(1) + '%)"></div>';
        }
      });
      barHtml += '</div>';

      var listHtml = '<div class="gradient-level-list">';
      list.forEach(function (l) {
        listHtml += '<div class="gradient-level-item">' +
          '<div class="gradient-level-header">' +
          '  <span class="gradient-level-badge"><span class="gradient-level-dot" style="background:' + l.color + '"></span>' + l.name + '</span>' +
          '  <span class="gradient-level-stats">' + l.distance.toFixed(1) + ' km (' + l.percentage.toFixed(1) + '%)</span>' +
          '</div>' +
          '<div class="gradient-level-tip">' + l.tip + '</div>' +
          '</div>';
      });
      listHtml += '</div>';

      return '<div>' +
        '<div class="gradient-section-title"><span>' + title + '</span></div>' +
        barHtml +
        listHtml +
        '</div>';
    }

    var upTitle = isZH
      ? '<span class="gradient-section-dot" style="background:var(--success);"></span> 上坡坡度分级 (Uphill)'
      : '<span class="gradient-section-dot" style="background:var(--success);"></span> Uphill Grade Breakdown';
    var downTitle = isZH
      ? '<span class="gradient-section-dot" style="background:var(--trail-blue);"></span> 下坡坡度分级 (Downhill)'
      : '<span class="gradient-section-dot" style="background:var(--trail-blue);"></span> Downhill Grade Breakdown';

    dom.gradientDistContent.innerHTML =
      buildSection(upTitle, dist.uphill) +
      buildSection(downTitle, dist.downhill);
  }

  // ── 3. Zone 3: Multi-Mode Segment Statistics Table ───────────────────
  function renderSegmentTable() {
    if (!dom.segmentTbody || !state.trackData) return;
    var segments = TR.trailAnalysis.analyzeSegments(
      state.trackData,
      state.segmentMode,
      state.checkpoints,
      state.elevationMode,
      state.language
    );

    var html = '';
    segments.forEach(function (seg, idx) {
      var isSelected = (state.activeSegmentIdx === idx);
      var nameStr = seg.name ? (seg.name + (seg.endName ? (' → ' + seg.endName) : '')) : ('Seg ' + (idx + 1));

      html += '<tr class="segment-row' + (isSelected ? ' active-seg-row' : '') + '" data-idx="' + idx + '">' +
        '<td>' + (idx + 1) + '</td>' +
        '<td><strong>' + esc(nameStr) + '</strong> (' + seg.distance.toFixed(1) + 'km)</td>' +
        '<td style="color:var(--success)">+' + Math.round(seg.ascent) + 'm</td>' +
        '<td style="color:var(--danger)">-' + Math.round(seg.descent) + 'm</td>' +
        '<td>' + seg.uphillAvg.toFixed(1) + '%</td>' +
        '<td>+' + seg.maxUphillGrad.toFixed(1) + '%</td>' +
        '</tr>';
    });

    dom.segmentTbody.innerHTML = html;

    dom.segmentTbody.querySelectorAll('.segment-row').forEach(function (tr) {
      tr.addEventListener('click', function () {
        var idx = parseInt(this.dataset.idx, 10);
        if (state.activeSegmentIdx === idx) {
          state.activeSegmentIdx = -1;
          dom.segmentTbody.querySelectorAll('.segment-row').forEach(function (r) { r.classList.remove('active-seg-row'); });
          TR.trailMap.clearSegmentHighlight();
          scheduleRender();
          return;
        }

        state.activeSegmentIdx = idx;
        dom.segmentTbody.querySelectorAll('.segment-row').forEach(function (r) { r.classList.remove('active-seg-row'); });
        this.classList.add('active-seg-row');

        var seg = segments[idx];
        if (seg) {
          TR.trailMap.highlightSegment(seg.startIdx, seg.endIdx);
          scheduleRender();
        }
      });
    });
  }

  // ── 3. Zone 3: CP Table Rendering & Direct In-place Editing ─────────
  function renderCPTable() {
    dom.cpTbody.innerHTML = '';
    var sortedCps = state.checkpoints.slice();
    var lang = state.language;

    sortedCps.forEach(function (cp, idx) {
      var globalIdx = state.checkpoints.indexOf(cp);
      var isSelected = (globalIdx === state.activeCPIndex);
      var tr = document.createElement('tr');
      if (isSelected) tr.classList.add('selected-row');

      var seqLabel = (idx === 0) ? 'S' : (idx === sortedCps.length - 1 ? 'F' : idx);
      var detailsHtml = '';

      if (idx > 0) {
        var cpPrev = sortedCps[idx - 1];
        var cpCurr = cp;
        var segDist = cpCurr.distance - cpPrev.distance;
        var segDPlus = 0, segDMinus = 0;

        if (state.trackpoints && state.trackpoints.length > 0) {
          var stats = TR.utils.segmentStats(state.trackpoints, cpPrev.distance, cpCurr.distance, state.elevationMode);
          segDPlus = stats.dPlus;
          segDMinus = stats.dMinus;
        }

        var segTimeMins = TR.utils.parseTime(cpCurr.segmentTime || '');
        var targetTimeStr = TR.utils.formatTime(segTimeMins);

        var cumulMins = 0;
        for (var ci = 1; ci <= idx; ci++) {
          cumulMins += TR.utils.parseTime(sortedCps[ci].segmentTime || '') + (sortedCps[ci].stopDuration || 0);
        }
        var startInfo = parseStartTime(state.startTime);
        var passageStr = formatArrivalTime(startInfo, cumulMins, lang);
        var stopStr = (cpCurr.stopDuration > 0) ? ' · ⏸ ' + cpCurr.stopDuration + 'min' : '';

        detailsHtml =
          '<td class="col-details">' +
          '  <div class="seg-stats-row">' +
          '    <span>' + segDist.toFixed(1) + ' km</span> · ' +
          '    <span class="gain">+' + Math.round(segDPlus) + 'm</span> · ' +
          '    <span class="loss">-' + Math.round(segDMinus) + 'm</span> · ' +
          '    <span>⏱ ' + targetTimeStr + '</span>' + stopStr +
          '  </div>' +
          '  <div class="seg-passage">' + T[lang].labelPassage + ' ' + passageStr + '</div>' +
          '</td>';
      }

      tr.innerHTML =
        '<td class="col-num">' + seqLabel + '</td>' +
        '<td class="col-name"><input type="text" data-idx="' + globalIdx + '" data-field="name" value="' + esc(cp.name) + '" placeholder="' + T[lang].placeholderCpNameInput + '"></td>' +
        '<td class="col-dist"><input type="number" data-idx="' + globalIdx + '" data-field="distance" value="' + cp.distance + '" step="0.1" min="0"></td>' +
        '<td class="col-time"><input type="text" data-idx="' + globalIdx + '" data-field="segmentTime" value="' + esc(cp.segmentTime || '') + '" placeholder="' + T[lang].placeholderTimeInput + '"' + (idx === 0 ? ' disabled' : '') + '></td>' +
        '<td class="col-action">' +
        '  <button class="btn-settings" data-idx="' + globalIdx + '" title="' + T[lang].settingsCpTitle + '">⚙️</button>' +
        '  <button class="btn-delete" data-idx="' + globalIdx + '" title="' + T[lang].deleteCpTitle + '">✕</button>' +
        '</td>' +
        detailsHtml;

      tr.addEventListener('click', function (e) {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
          state.activeCPIndex = globalIdx;
          renderCPTable();
        }
      });

      tr.addEventListener('dblclick', function (e) {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
          openCPModal(globalIdx);
        }
      });

      dom.cpTbody.appendChild(tr);
    });

    dom.cpTbody.querySelectorAll('input').forEach(function (el) {
      el.addEventListener('change', handleCPTableChange);
      el.addEventListener('input', handleCPTableChange);
    });

    dom.cpTbody.querySelectorAll('.btn-settings').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var idx = parseInt(this.dataset.idx, 10);
        openCPModal(idx);
      });
    });

    dom.cpTbody.querySelectorAll('.btn-delete').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var idx = parseInt(this.dataset.idx, 10);
        handleDeleteCP(idx);
      });
    });
  }

  function handleCPTableChange(e) {
    var idx = parseInt(e.target.dataset.idx, 10);
    var field = e.target.dataset.field;
    var val = e.target.value;

    if (field === 'distance') {
      val = parseFloat(val) || 0;
      state.checkpoints[idx].distance = val;
      var curCP = state.checkpoints[idx];
      sortCheckpoints();
      state.activeCPIndex = state.checkpoints.indexOf(curCP);
      updateArrivalTimes();
      renderCPTable();
    } else if (field === 'segmentTime') {
      state.checkpoints[idx].segmentTime = val;
      updateArrivalTimes();
      renderCPTable();
    } else {
      state.checkpoints[idx][field] = val;
    }

    TR.trailAnalysis.resetSegmentCache();
    scheduleRender();
    if (state.trackData) {
      TR.trailMap.drawMap(state.trackData, state.colorMode, state.checkpoints, true);
      renderSegmentTable();
    }
  }

  function handleAddCP() {
    var activeCP = state.checkpoints[state.activeCPIndex];
    var newDist = 0;
    if (activeCP) {
      var sorted = state.checkpoints.slice().sort(function (a, b) { return a.distance - b.distance; });
      var activeIdxInSorted = sorted.indexOf(activeCP);
      if (activeIdxInSorted !== -1 && activeIdxInSorted < sorted.length - 1) {
        newDist = Math.round(((activeCP.distance + sorted[activeIdxInSorted + 1].distance) / 2) * 100) / 100;
      } else {
        newDist = Math.round((activeCP.distance + 2.0) * 100) / 100;
      }
    } else {
      newDist = 1.0;
    }

    var newCP = normalizeCP({
      name: T[state.language].newCpName,
      distance: newDist,
      icon: 'classic',
      arrivalTime: '',
      segmentTime: '',
      notes: ''
    }, state.checkpoints.length);

    state.checkpoints.push(newCP);
    sortCheckpoints();
    normalizeAllCPs();
    state.activeCPIndex = state.checkpoints.indexOf(newCP);

    TR.trailAnalysis.resetSegmentCache();
    renderCPTable();
    scheduleRender();
    if (state.trackData) {
      TR.trailMap.drawMap(state.trackData, state.colorMode, state.checkpoints, true);
      renderSegmentTable();
    }
    toast(T[state.language].toastAddCp + newDist + T[state.language].toastAddCpTail);
  }

  function handleDeleteCP(idx) {
    if (state.checkpoints.length <= 1) {
      toast(T[state.language].toastKeepOne);
      return;
    }
    state.checkpoints.splice(idx, 1);
    if (state.activeCPIndex >= state.checkpoints.length) {
      state.activeCPIndex = state.checkpoints.length - 1;
    }
    sortCheckpoints();
    normalizeAllCPs();
    TR.trailAnalysis.resetSegmentCache();
    renderCPTable();
    scheduleRender();
    if (state.trackData) {
      TR.trailMap.drawMap(state.trackData, state.colorMode, state.checkpoints, true);
      renderSegmentTable();
    }
    toast(T[state.language].toastDeleted);
  }

  // ── Floating Modal: Checkpoint Visual Configuration ────────────────
  function bindModalEvents() {
    dom.btnModalClose.addEventListener('click', closeCPModal);
    dom.btnModalCancel.addEventListener('click', closeCPModal);
    dom.btnModalSave.addEventListener('click', saveCPModal);

    dom.modalBackdrop.addEventListener('click', function (e) {
      if (e.target === dom.modalBackdrop) {
        closeCPModal();
      }
    });

    function bindColorPicker(pickerEl, hexEl) {
      if (!pickerEl || !hexEl) return;
      pickerEl.addEventListener('input', function () { hexEl.value = this.value; });
      hexEl.addEventListener('change', function () {
        if (/^#[0-9A-F]{6}$/i.test(this.value)) pickerEl.value = this.value;
      });
    }

    bindColorPicker(dom.poiAxisColor, dom.poiAxisColorHex);
    bindColorPicker(dom.poiTextColor, dom.poiTextColorHex);
  }

  function openCPModal(cpIndex) {
    state.activeCPIndex = cpIndex;
    var cp = state.checkpoints[cpIndex];
    if (!cp) return;

    dom.modalCpTitle.textContent = '📍 ' + (cp.name || 'CP' + cpIndex) + ' — ' + T[state.language].poiPanelTitle;

    dom.poiNameDetail.value = cp.name || '';
    dom.poiPosition.value = cp.distance;
    dom.poiTimeDetail.value = cp.segmentTime || '';
    dom.poiTimeDetail.disabled = (cpIndex === 0);
    dom.poiStopDuration.value = cp.stopDuration || 0;
    dom.poiStopDuration.disabled = (cpIndex === 0);
    dom.poiNotesDetail.value = cp.notes || '';
    dom.poiIntermediate.checked = !!cp.useForIntermediateDistances;

    if (dom.poiIconSelect) dom.poiIconSelect.value = cp.icon || 'classic';

    dom.poiAxisColor.value = cp.axisColor || '#4e4e4e';
    dom.poiAxisColorHex.value = cp.axisColor || '#4e4e4e';
    dom.poiAxisThickness.value = cp.axisThickness || 1;

    dom.poiTextColor.value = cp.textColor || '#1e293b';
    dom.poiTextColorHex.value = cp.textColor || '#1e293b';
    dom.poiTextSize.value = cp.textSize || 18;
    dom.poiTextOrientation.value = cp.textOrientation || 'To the right';

    dom.poiTxtLeftBottom.value = (cp.texts && cp.texts.leftBottom) || '';
    dom.poiTxtLeftMiddle.value = (cp.texts && cp.texts.leftMiddle) || '';
    dom.poiTxtLeftTop.value = (cp.texts && cp.texts.leftTop) || '';
    dom.poiTxtRightBottom.value = (cp.texts && cp.texts.rightBottom) || '';
    dom.poiTxtRightMiddle.value = (cp.texts && cp.texts.rightMiddle) || '';
    dom.poiTxtRightTop.value = (cp.texts && cp.texts.rightTop) || '';

    dom.modalBackdrop.classList.add('open');
  }

  function closeCPModal() {
    dom.modalBackdrop.classList.remove('open');
  }

  function saveCPModal() {
    var cp = state.checkpoints[state.activeCPIndex];
    if (!cp) { closeCPModal(); return; }

    cp.name = dom.poiNameDetail.value.trim() || 'CP';
    cp.distance = parseFloat(dom.poiPosition.value) || 0;
    cp.segmentTime = dom.poiTimeDetail.value.trim();
    cp.stopDuration = parseInt(dom.poiStopDuration.value, 10) || 0;
    cp.notes = dom.poiNotesDetail.value;
    cp.useForIntermediateDistances = dom.poiIntermediate.checked;
    cp.icon = dom.poiIconSelect.value;

    cp.axisColor = dom.poiAxisColorHex.value;
    cp.axisThickness = parseInt(dom.poiAxisThickness.value, 10) || 1;

    cp.textColor = dom.poiTextColorHex.value;
    cp.textSize = parseInt(dom.poiTextSize.value, 10) || 18;
    cp.textOrientation = dom.poiTextOrientation.value;

    cp.texts = {
      leftBottom: dom.poiTxtLeftBottom.value,
      leftMiddle: dom.poiTxtLeftMiddle.value,
      leftTop: dom.poiTxtLeftTop.value,
      rightBottom: dom.poiTxtRightBottom.value,
      rightMiddle: dom.poiTxtRightMiddle.value,
      rightTop: dom.poiTxtRightTop.value
    };

    sortCheckpoints();
    normalizeAllCPs();
    state.activeCPIndex = state.checkpoints.indexOf(cp);

    TR.trailAnalysis.resetSegmentCache();
    renderCPTable();
    scheduleRender();
    if (state.trackData) {
      TR.trailMap.drawMap(state.trackData, state.colorMode, state.checkpoints, true);
      renderSegmentTable();
    }

    closeCPModal();
  }

  // ── CP Normalization & Utilities ────────────────────────────────────
  function normalizeCP(cp, idx) {
    if (cp.useForIntermediateDistances === undefined) cp.useForIntermediateDistances = true;
    if (!cp.icon && cp.icons && Array.isArray(cp.icons) && cp.icons[0]) cp.icon = cp.icons[0].symbol || '';
    if (!cp.icon) cp.icon = (idx === 0 ? 'start' : 'classic');
    if (cp.axisColor === undefined) cp.axisColor = '#4e4e4e';
    if (cp.axisThickness === undefined) cp.axisThickness = 1;
    if (cp.textColor === undefined) cp.textColor = '#1e293b';
    if (cp.textSize === undefined) cp.textSize = 18;
    if (cp.textOrientation === undefined) cp.textOrientation = 'To the right';
    if (!cp.texts) {
      cp.texts = { leftBottom: '', leftMiddle: '', leftTop: '', rightBottom: '', rightMiddle: '', rightTop: '' };
    }
    if (cp.arrivalTime === undefined) cp.arrivalTime = '';
    if (cp.segmentTime === undefined) cp.segmentTime = '';
    if (cp.stopDuration === undefined) cp.stopDuration = 0;
    return cp;
  }

  function updateArrivalTimes() {
    var cumul = 0;
    state.checkpoints.forEach(function (cp, idx) {
      if (idx === 0) {
        cp.segmentTime = '0:00';
        cp.arrivalTime = '0:00';
      } else {
        var seg = TR.utils.parseTime(cp.segmentTime || '');
        cumul += seg + (cp.stopDuration || 0);
        cp.arrivalTime = TR.utils.formatTime(cumul);
      }
    });
  }

  function normalizeAllCPs() {
    var prevCumul = 0;
    state.checkpoints.forEach(function (cp, idx) {
      normalizeCP(cp, idx);
      if (cp.segmentTime === undefined || cp.segmentTime === '') {
        if (idx === 0) {
          cp.segmentTime = '0:00';
          prevCumul = 0;
        } else if (cp.arrivalTime) {
          var cumul = TR.utils.parseTime(cp.arrivalTime);
          var seg = Math.max(0, cumul - prevCumul);
          cp.segmentTime = TR.utils.formatTime(seg);
          prevCumul = cumul;
        } else {
          cp.segmentTime = '';
        }
      } else {
        if (idx === 0) prevCumul = 0;
        else prevCumul += TR.utils.parseTime(cp.segmentTime);
      }
    });
    updateArrivalTimes();
  }

  function sortCheckpoints() {
    state.checkpoints.sort(function (a, b) { return a.distance - b.distance; });
  }

  function parseStartTime(str) {
    if (!str) str = getDefaultStartDatetime();

    // 1. Check if str is standard ISO datetime format (YYYY-MM-DDTHH:MM)
    var isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})/);
    if (isoMatch) {
      var year = parseInt(isoMatch[1], 10);
      var month = parseInt(isoMatch[2], 10) - 1;
      var day = parseInt(isoMatch[3], 10);
      var hour = parseInt(isoMatch[4], 10);
      var min = parseInt(isoMatch[5], 10);
      var d = new Date(year, month, day, hour, min);
      if (!isNaN(d.getTime())) {
        return {
          isDate: true,
          dateObj: d,
          dayOffset: (d.getDay() + 6) % 7,
          hour: hour,
          min: min
        };
      }
    }

    // 2. Fallback: Legacy strings like '周五 18:00' or 'Fri 06:00'
    var lower = str.toLowerCase();
    var dayOffset = 4;
    if (lower.indexOf('mon') !== -1 || lower.indexOf('一') !== -1) dayOffset = 0;
    else if (lower.indexOf('tue') !== -1 || lower.indexOf('二') !== -1) dayOffset = 1;
    else if (lower.indexOf('wed') !== -1 || lower.indexOf('三') !== -1) dayOffset = 2;
    else if (lower.indexOf('thu') !== -1 || lower.indexOf('四') !== -1) dayOffset = 3;
    else if (lower.indexOf('fri') !== -1 || lower.indexOf('五') !== -1) dayOffset = 4;
    else if (lower.indexOf('sat') !== -1 || lower.indexOf('六') !== -1) dayOffset = 5;
    else if (lower.indexOf('sun') !== -1 || lower.indexOf('日') !== -1) dayOffset = 6;

    var timeMatch = str.match(/(\d{1,2})[:：](\d{2})/);
    var hourFallback = 6, minFallback = 0;
    if (timeMatch) {
      hourFallback = parseInt(timeMatch[1], 10);
      minFallback = parseInt(timeMatch[2], 10);
    }
    return { isDate: false, dayOffset: dayOffset, hour: hourFallback, min: minFallback };
  }

  function formatArrivalTime(startInfo, durationMinutes, lang) {
    if (startInfo.isDate && startInfo.dateObj) {
      var arrivalDate = new Date(startInfo.dateObj.getTime() + durationMinutes * 60 * 1000);
      var dayOfWeek = (arrivalDate.getDay() + 6) % 7;
      var hour = arrivalDate.getHours();
      var min = arrivalDate.getMinutes();
      var daysZH = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
      var daysEN = ['Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.', 'Sun.'];
      var dayStr = (lang === 'zh') ? daysZH[dayOfWeek] : daysEN[dayOfWeek];
      return dayStr + ' ' + (hour < 10 ? '0' : '') + hour + ':' + (min < 10 ? '0' : '') + min;
    }

    var totalMins = startInfo.dayOffset * 24 * 60 + startInfo.hour * 60 + startInfo.min + durationMinutes;
    var day = Math.floor(totalMins / (24 * 60)) % 7;
    var restMins = totalMins % (24 * 60);
    var hourLegacy = Math.floor(restMins / 60);
    var minLegacy = restMins % 60;
    var daysZH2 = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    var daysEN2 = ['Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.', 'Sun.'];
    var dayStr2 = (lang === 'zh') ? daysZH2[day] : daysEN2[day];
    return dayStr2 + ' ' + (hourLegacy < 10 ? '0' : '') + hourLegacy + ':' + (minLegacy < 10 ? '0' : '') + minLegacy;
  }

  function esc(str) {
    if (!str) return '';
    return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ── JSON Import / Export / Template ─────────────────────────────────
  function handleJsonImport() {
    var file = dom.inputJson.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var data = JSON.parse(e.target.result);
        if (data.raceName) { state.raceName = data.raceName; dom.inputName.value = data.raceName; }
        if (data.fontSizeTitle) state.fontSizeTitle = parseInt(data.fontSizeTitle, 10);
        if (data.fontSizeCPName) state.fontSizeCPName = parseInt(data.fontSizeCPName, 10);
        if (data.fontSizeCPElev) state.fontSizeCPElev = parseInt(data.fontSizeCPElev, 10);
        if (data.fontSizeCPTime) state.fontSizeCPTime = parseInt(data.fontSizeCPTime, 10);
        if (data.fontSizeCPNotes) state.fontSizeCPNotes = parseInt(data.fontSizeCPNotes, 10);
        if (data.fontSizeSegment) state.fontSizeSegment = parseInt(data.fontSizeSegment, 10);
        if (data.fontSizeCumulDist) state.fontSizeCumulDist = parseInt(data.fontSizeCumulDist, 10);
        if (data.language) state.language = data.language;
        if (data.colorMode) {
          state.colorMode = data.colorMode;
          if (dom.selectColorMode) dom.selectColorMode.value = data.colorMode;
        }
        if (data.elevationMode) setElevationMode(data.elevationMode);
        if (data.startTime) {
          state.startTime = data.startTime;
          if (dom.inputStartTime) dom.inputStartTime.value = data.startTime;
        }
        if (Array.isArray(data.checkpoints)) state.checkpoints = data.checkpoints;
        sortCheckpoints();
        normalizeAllCPs();
        state.activeCPIndex = 0;
        applyLanguage();
        toast(T[state.language].toastImportSuccess);
      } catch (err) {
        toast(T[state.language].toastImportError + err.message);
      }
    };
    reader.readAsText(file);
    dom.inputJson.value = '';
  }

  function handleJsonExport() {
    var data = {
      raceName: state.raceName,
      elevationMode: state.elevationMode,
      colorMode: state.colorMode,
      fontSizeTitle: state.fontSizeTitle,
      fontSizeCPName: state.fontSizeCPName,
      fontSizeCPElev: state.fontSizeCPElev,
      fontSizeCPTime: state.fontSizeCPTime,
      fontSizeCPNotes: state.fontSizeCPNotes,
      fontSizeSegment: state.fontSizeSegment,
      fontSizeCumulDist: state.fontSizeCumulDist,
      language: state.language,
      startTime: state.startTime || '',
      checkpoints: state.checkpoints
    };
    var json = JSON.stringify(data, null, 2);
    var blob = new Blob([json], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (state.raceName || 'roadbook') + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 3000);
    toast(T[state.language].toastExportSuccess);
  }

  function handleJsonTemplateDownload() {
    var isZH = (state.language === 'zh');
    var template = {
      raceName: isZH ? "Talus 经典越野跑 100K" : "Talus Classic Trail 100K",
      elevationMode: "smooth",
      colorMode: "classic",
      fontSizeTitle: 18,
      fontSizeCPName: 14,
      fontSizeCPElev: 11,
      fontSizeCPTime: 20,
      fontSizeCPNotes: 18,
      fontSizeSegment: 11,
      fontSizeCumulDist: 12,
      language: state.language,
      startTime: "2026-08-28T06:00",
      checkpoints: [
        { name: isZH ? "起点" : "Start", distance: 0.0, arrivalTime: "0:00", segmentTime: "0:00", icon: "start" },
        { name: "CP1", distance: 15.0, arrivalTime: "1:45", segmentTime: "1:45", icon: "classic" },
        { name: isZH ? "终点" : "Finish", distance: 100.0, arrivalTime: "14:00", segmentTime: "12:15", icon: "finish" }
      ]
    };
    var json = JSON.stringify(template, null, 2);
    var blob = new Blob([json], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = isZH ? 'talus_roadbook_template_cn.json' : 'talus_roadbook_template_en.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 3000);
    toast(T[state.language].toastTemplateSuccess);
  }

  // ── High-Resolution PNG Image Export ────────────────────────────────
  function handleImageExport(scale) {
    if (!state.trackpoints) {
      toast(T[state.language].toastGpxFirst);
      return;
    }
    var svgEl = dom.profileContainer.querySelector('svg');
    if (!svgEl) {
      toast('Error: SVG not found.');
      return;
    }
    var filename = (state.raceName || 'roadbook').replace(/[^a-zA-Z0-9_\-\u4e00-\u9fff]/g, '_');
    var ratio = dom.exportRatio.value;
    TR.exporter.exportToPNG(svgEl, scale, filename, ratio);
    toast(T[state.language].toastExporting + scale + '× PNG (' + ratio + ')…');
  }

  var toastTimer = null;
  function toast(msg) {
    dom.toast.textContent = msg;
    dom.toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { dom.toast.classList.remove('show'); }, 3000);
  }

  function applyLanguage() {
    var lang = state.language;
    var dict = T[lang];

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.dataset.i18n;
      if (dict[key] !== undefined) el.textContent = dict[key];
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.dataset.i18nPlaceholder;
      if (dict[key] !== undefined) el.placeholder = dict[key];
    });

    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      var key = el.dataset.i18nTitle;
      if (dict[key] !== undefined) el.title = dict[key];
    });

    renderCPTable();
    if (state.trackData) {
      TR.trailAnalysis.resetSegmentCache();
      renderAllComponents();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
