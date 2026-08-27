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
      segmentStatsTitle: "📋 赛段分段统计",
      segmentStatsTip: "点击或悬停表格行可与上方剖面图及地图实时联动",
      segColPoint: "点位名称",
      segColProfile: "分段轮廓",
      segColDistance: "距离",
      segColGainLoss: "爬升 / 下降",
      segColAltitude: "海拔",
      segColGrade: "坡度",
      segColTimeline: "预计抵达与时间轴",

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
      btnFontSizes: "字号设置",
      btnFontSizesTitle: "配置各元素字号大小",
      btnReset: "重置默认",
      toastFontSizesSaved: "各元素字号设置已保存并应用！",
      fsLabelTitle: "比赛名称",
      fsLabelCpName: "CP点名称",
      fsLabelCpElev: "CP海拔",
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
      labelPassage: "通过",
      toastMapFallback: "天地图图层加载受阻，已自动为您切换至备用地图图层（高德/OSM） ✓"
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
      colorModeClassic: "Classic Colors",
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
      segmentStatsTip: "Click or hover a row to sync with profile & map",
      segColPoint: "Point",
      segColProfile: "Profile",
      segColDistance: "Distance",
      segColGainLoss: "Gain / Loss",
      segColAltitude: "Altitude",
      segColGrade: "Grade",
      segColTimeline: "ETA & Timeline",

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
      btnFontSizes: "Font Sizes",
      btnFontSizesTitle: "Configure Granular Font Sizes",
      btnReset: "Reset Defaults",
      toastFontSizesSaved: "Font size settings saved and applied!",
      fsLabelTitle: "Race Title",
      fsLabelCpName: "CP Name",
      fsLabelCpElev: "CP Elevation",
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
      labelPassage: "Passage",
      toastMapFallback: "Tianditu tiles failed to load, automatically switched to backup map (Gaode/OSM) ✓"
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
    fontSizeCPName: 20,
    fontSizeCPElev: 11,
    fontSizeCPTime: 20,
    fontSizeCPNotes: 22,
    fontSizeSegment: 17,
    fontSizeCumulDist: 17,
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

    // Zone 1: Profile & Font Sizes Modal
    dom.profileContainer  = document.getElementById('profile-container');
    dom.placeholder       = document.getElementById('profile-placeholder');
    dom.btnOpenFontSizes  = document.getElementById('btn-open-font-sizes');
    dom.fsModalBackdrop   = document.getElementById('fs-modal-backdrop');
    dom.btnFsModalClose   = document.getElementById('btn-fs-modal-close');
    dom.btnFsModalCancel  = document.getElementById('btn-fs-modal-cancel');
    dom.btnFsModalReset   = document.getElementById('btn-fs-modal-reset');
    dom.btnFsModalSave    = document.getElementById('btn-fs-modal-save');
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

    // Auto Fallback callback for Map Tiles
    TR.trailMap.onFallback = function (fallbackSource, oldSource) {
      if (dom.selectMapSource) dom.selectMapSource.value = fallbackSource;
      toast(T[state.language].toastMapFallback);
    };

    if (dom.btnFitMap) {
      dom.btnFitMap.addEventListener('click', function () {
        TR.trailMap.fitMapToTrack();
      });
    }

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

    // CP Table Event Delegation
    if (dom.cpTbody) {
      dom.cpTbody.addEventListener('input', handleCPTableInput);
      dom.cpTbody.addEventListener('change', handleCPTableChange);
      dom.cpTbody.addEventListener('click', handleCPTableClick);
      dom.cpTbody.addEventListener('dblclick', handleCPTableDblClick);
    }

    // Font Sizes Modal Events
    if (dom.btnOpenFontSizes) dom.btnOpenFontSizes.addEventListener('click', openFontSizesModal);
    if (dom.btnFsModalClose) dom.btnFsModalClose.addEventListener('click', closeFontSizesModal);
    if (dom.btnFsModalCancel) dom.btnFsModalCancel.addEventListener('click', closeFontSizesModal);
    if (dom.btnFsModalReset) dom.btnFsModalReset.addEventListener('click', resetFontSizesModal);
    if (dom.btnFsModalSave) dom.btnFsModalSave.addEventListener('click', saveFontSizesModal);
    if (dom.fsModalBackdrop) {
      dom.fsModalBackdrop.addEventListener('click', function (e) {
        if (e.target === dom.fsModalBackdrop) closeFontSizesModal();
      });
    }
  }

  // ── Font Sizes Modal Functions ──────────────────────────────────────
  function openFontSizesModal() {
    if (!dom.fsModalBackdrop) return;
    if (dom.fsTitle) dom.fsTitle.value = state.fontSizeTitle;
    if (dom.fsCPName) dom.fsCPName.value = state.fontSizeCPName;
    if (dom.fsCPElev) dom.fsCPElev.value = state.fontSizeCPElev;
    if (dom.fsCPTime) dom.fsCPTime.value = state.fontSizeCPTime;
    if (dom.fsCPNotes) dom.fsCPNotes.value = state.fontSizeCPNotes;
    if (dom.fsSegment) dom.fsSegment.value = state.fontSizeSegment;
    if (dom.fsCumulDist) dom.fsCumulDist.value = state.fontSizeCumulDist;
    dom.fsModalBackdrop.classList.add('open');
  }

  function closeFontSizesModal() {
    if (dom.fsModalBackdrop) dom.fsModalBackdrop.classList.remove('open');
  }

  function resetFontSizesModal() {
    if (dom.fsTitle) dom.fsTitle.value = 18;
    if (dom.fsCPName) dom.fsCPName.value = 20;
    if (dom.fsCPElev) dom.fsCPElev.value = 11;
    if (dom.fsCPTime) dom.fsCPTime.value = 20;
    if (dom.fsCPNotes) dom.fsCPNotes.value = 22;
    if (dom.fsSegment) dom.fsSegment.value = 17;
    if (dom.fsCumulDist) dom.fsCumulDist.value = 17;
  }

  function saveFontSizesModal() {
    if (dom.fsTitle) state.fontSizeTitle = parseInt(dom.fsTitle.value, 10) || 18;
    if (dom.fsCPName) state.fontSizeCPName = parseInt(dom.fsCPName.value, 10) || 20;
    if (dom.fsCPElev) state.fontSizeCPElev = parseInt(dom.fsCPElev.value, 10) || 11;
    if (dom.fsCPTime) state.fontSizeCPTime = parseInt(dom.fsCPTime.value, 10) || 20;
    if (dom.fsCPNotes) state.fontSizeCPNotes = parseInt(dom.fsCPNotes.value, 10) || 22;
    if (dom.fsSegment) state.fontSizeSegment = parseInt(dom.fsSegment.value, 10) || 17;
    if (dom.fsCumulDist) state.fontSizeCumulDist = parseInt(dom.fsCumulDist.value, 10) || 17;

    scheduleRender();
    closeFontSizesModal();
    toast(T[state.language].toastFontSizesSaved || '各元素字号设置已保存并应用！');
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
      'waypoint',
      state.checkpoints,
      state.elevationMode,
      state.language,
      state.startTime
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
        segments: segments,
        onHover: function (ptIdx, pt, segIdx, seg) {
          TR.trailMap.updateMapCurrentPoint(ptIdx);
        },
        onSegmentHover: function (segIdx, seg) {
          highlightTableRow(segIdx, true);
          if (segIdx >= 0 && seg && state.activeSegmentIdx < 0) {
            TR.trailMap.highlightSegment(seg.startIdx, seg.endIdx);
          } else if (state.activeSegmentIdx < 0) {
            TR.trailMap.clearSegmentHighlight();
          }
        },
        onSegmentClick: function (segIdx, seg) {
          toggleSegmentActive(segIdx);
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

  // ── Mini Elevation Profile SVG Generator (PROFIL DE SECTION - Local Zoom Window) ──
  function generateMiniProfileSvg(trackData, startDist, endDist) {
    if (!trackData || !trackData.points || trackData.points.length === 0) return '';
    var points = trackData.points;
    var totalDist = trackData.totalDistance || points[points.length - 1].distance || 1;

    var segLen = Math.max(0.1, endDist - startDist);

    // Dynamic context window around segment (zoomed in, like UTMB OCC)
    var padLeft = startDist === 0 ? 0 : Math.max(segLen * 0.35, 1.5);
    var padRight = endDist >= totalDist ? 0 : Math.max(segLen * 0.35, 1.5);

    // If segment is near edges, give symmetric padding to the available side
    if (startDist === 0) padRight = Math.max(padRight, Math.min(totalDist - endDist, segLen * 0.6 + 2.0));
    if (endDist >= totalDist) padLeft = Math.max(padLeft, Math.min(startDist, segLen * 0.6 + 2.0));

    var winStart = Math.max(0, startDist - padLeft);
    var winEnd = Math.min(totalDist, endDist + padRight);

    // Ensure window spans at least 2.5 km for short segments
    if ((winEnd - winStart) < 2.5 && totalDist >= 2.5) {
      var needed = 2.5 - (winEnd - winStart);
      var addLeft = Math.min(winStart, needed / 2);
      var addRight = Math.min(totalDist - winEnd, needed - addLeft);
      winStart = Math.max(0, winStart - (needed - addRight));
      winEnd = Math.min(totalDist, winEnd + addRight);
    }
    var winDistSpan = Math.max(0.01, winEnd - winStart);

    // Extract window points and calculate local min/max elevation
    var winPts = points.filter(function (p) {
      return p.distance >= winStart && p.distance <= winEnd;
    });
    if (winPts.length < 2) {
      var tm = window.TrailRoadbook.trailMath;
      var pA = points[tm.findNearestPointIndexByDistance(points, winStart)];
      var pB = points[tm.findNearestPointIndexByDistance(points, winEnd)];
      winPts = [pA, pB];
    }

    var localMinE = Infinity;
    var localMaxE = -Infinity;
    winPts.forEach(function (p) {
      if (p.elevation < localMinE) localMinE = p.elevation;
      if (p.elevation > localMaxE) localMaxE = p.elevation;
    });

    var elevSpan = Math.max(25, localMaxE - localMinE);
    var ePad = elevSpan * 0.16;
    var eMin = localMinE - ePad;
    var eMax = localMaxE + ePad;
    var eRange = Math.max(1, eMax - eMin);

    var width = 125;
    var height = 36;
    var padX = 4;
    var padY = 4;
    var innerW = width - 2 * padX;
    var innerH = height - 2 * padY;

    function scaleX(d) {
      var ratio = Math.max(0, Math.min(1, (d - winStart) / winDistSpan));
      return (padX + ratio * innerW).toFixed(1);
    }
    function scaleY(e) {
      var ratio = Math.max(0, Math.min(1, (e - eMin) / eRange));
      return (height - padY - ratio * innerH).toFixed(1);
    }

    // 1. Context Window Background Curve (light subtle grey)
    var step = Math.max(1, Math.floor(winPts.length / 50));
    var fullD = '';
    var count = 0;
    for (var i = 0; i < winPts.length; i += step) {
      fullD += (count === 0 ? 'M' : 'L') + scaleX(winPts[i].distance) + ',' + scaleY(winPts[i].elevation);
      count++;
    }
    var lastWinPt = winPts[winPts.length - 1];
    fullD += 'L' + scaleX(lastWinPt.distance) + ',' + scaleY(lastWinPt.elevation);

    // 2. Active Segment Curve & Gradient Area Fill (vibrant amber / orange)
    var segPts = points.filter(function (p) {
      return p.distance >= startDist && p.distance <= endDist;
    });
    if (segPts.length < 2) {
      var tm2 = window.TrailRoadbook.trailMath;
      var p1 = points[tm2.findNearestPointIndexByDistance(points, startDist)];
      var p2 = points[tm2.findNearestPointIndexByDistance(points, endDist)];
      segPts = [p1, p2];
    }

    var segStep = Math.max(1, Math.floor(segPts.length / 40));
    var segD = '';
    var segCount = 0;
    var firstX = scaleX(segPts[0].distance);
    var lastX = scaleX(segPts[segPts.length - 1].distance);

    for (var j = 0; j < segPts.length; j += segStep) {
      segD += (segCount === 0 ? 'M' : 'L') + scaleX(segPts[j].distance) + ',' + scaleY(segPts[j].elevation);
      segCount++;
    }
    var finalSegPt = segPts[segPts.length - 1];
    segD += 'L' + scaleX(finalSegPt.distance) + ',' + scaleY(finalSegPt.elevation);

    var botY = (height - padY).toFixed(1);
    var segAreaD = segD + ' L' + lastX + ',' + botY + ' L' + firstX + ',' + botY + ' Z';

    var gradId = 'segGrad_' + Math.round(startDist * 10) + '_' + Math.round(endDist * 10);

    return '<svg class="mini-profile-svg" viewBox="0 0 ' + width + ' ' + height + '" width="' + width + '" height="' + height + '">' +
      '<defs>' +
      '  <linearGradient id="' + gradId + '" x1="0%" y1="0%" x2="0%" y2="100%">' +
      '    <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.45"/>' +
      '    <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.04"/>' +
      '  </linearGradient>' +
      '</defs>' +
      '<path d="' + fullD + '" fill="none" stroke="rgba(148,163,184,0.4)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="' + segAreaD + '" fill="url(#' + gradId + ')"/>' +
      '<path d="' + segD + '" fill="none" stroke="#f59e0b" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>';
  }

  // ── Segment Active Selection & Hover Linkage Helpers ────────────────
  function toggleSegmentActive(segIdx) {
    var segments = TR.trailAnalysis.analyzeSegments(
      state.trackData,
      'waypoint',
      state.checkpoints,
      state.elevationMode,
      state.language,
      state.startTime
    );

    if (state.activeSegmentIdx === segIdx) {
      state.activeSegmentIdx = -1;
      if (dom.segmentTbody) {
        dom.segmentTbody.querySelectorAll('.segment-row').forEach(function (r) { r.classList.remove('active-seg-row'); });
      }
      TR.trailMap.clearSegmentHighlight();
      scheduleRender();
      return;
    }

    state.activeSegmentIdx = segIdx;
    if (dom.segmentTbody) {
      dom.segmentTbody.querySelectorAll('.segment-row').forEach(function (r) { r.classList.remove('active-seg-row'); });
      var targetRow = dom.segmentTbody.querySelector('.segment-row[data-seg-idx="' + segIdx + '"]');
      if (targetRow) {
        targetRow.classList.add('active-seg-row');
        targetRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    var seg = segments[segIdx];
    if (seg) {
      TR.trailMap.highlightSegment(seg.startIdx, seg.endIdx);
      scheduleRender();
    }
  }

  function highlightTableRow(segIdx, isFromHover) {
    if (!dom.segmentTbody) return;
    dom.segmentTbody.querySelectorAll('.segment-row').forEach(function (r) {
      r.classList.remove('hover-seg-row');
    });

    if (segIdx >= 0) {
      var row = dom.segmentTbody.querySelector('.segment-row[data-seg-idx="' + segIdx + '"]');
      if (row) {
        row.classList.add('hover-seg-row');
      }
    }
  }

  // ── 3. Zone 3: UTMB OCC-Style Segment Table Rendering ──────────────
  function renderSegmentTable() {
    if (!dom.segmentTbody || !state.trackData) return;
    var rows = TR.trailAnalysis.generateUTMBTableRows(
      state.trackData,
      state.checkpoints,
      state.elevationMode,
      state.startTime,
      state.language
    );

    if (rows.length === 0) {
      dom.segmentTbody.innerHTML = '';
      return;
    }

    var html = '';
    rows.forEach(function (r, idx) {
      var isSelected = (idx > 0 && state.activeSegmentIdx === (idx - 1));
      var segIdx = idx - 1;

      // Checkpoint badge
      var badgeClass = 'cp-badge-default';
      var badgeText = String(idx);
      if (idx === 0) {
        badgeClass = 'cp-badge-start';
        badgeText = 'S';
      } else if (idx === rows.length - 1) {
        badgeClass = 'cp-badge-finish';
        badgeText = 'F';
      }

      // Mini profile column
      var profileHtml = '';
      if (idx === 0) {
        profileHtml = '<div class="mini-profile-start-placeholder"><span>🟢</span></div>';
      } else {
        profileHtml = generateMiniProfileSvg(state.trackData, r.segStartDist, r.segEndDist);
      }

      // Distance column: Top = Cumul, Bottom = Segment Delta
      var distHtml = '<div class="stat-primary">' + r.cumulDist.toFixed(1) + ' km</div>' +
        '<div class="stat-secondary">' + (r.isSegmentRow ? (r.segDist.toFixed(1) + ' km') : '-') + '</div>';

      // Dénivelé column: Top = Cumul +Ascent, Bottom = +Delta / -Delta
      var elevHtml = '<div class="stat-primary gain">+' + r.cumulAscent + ' m</div>' +
        '<div class="stat-secondary">' + (r.isSegmentRow ? ('+' + r.segAscent + ' m | -' + r.segDescent + ' m') : '-') + '</div>';

      // Altitude column
      var altHtml = '<div class="stat-primary font-mono">' + r.elevation + ' m</div>';

      // Grade column: Top = Avg Grade, Bottom = Max Grade
      var gradeHtml = '';
      if (r.isSegmentRow) {
        var avgSign = r.uphillAvg > 0 ? '+' : '';
        gradeHtml = '<div class="stat-primary">' + avgSign + r.uphillAvg.toFixed(1) + '%</div>' +
          '<div class="stat-secondary">' + (r.maxUphillGrad > 0 ? ('Max +' + r.maxUphillGrad.toFixed(1) + '%') : '-') + '</div>';
      } else {
        gradeHtml = '<div class="stat-secondary">-</div>';
      }

      // Day / Night Vertical Timeline column
      var isNight = r.dayNight.isNight;
      var timelineLineClass = isNight ? 'timeline-bar-night' : 'timeline-bar-day';
      var timelineBadgeClass = 'timeline-badge-' + r.dayNight.type;
      var segTimeStr = (r.isSegmentRow && r.segTimeMinutes > 0)
        ? ('⏱ ' + TR.utils.formatTime(r.segTimeMinutes) + (r.stopDuration > 0 ? (' · ⏸' + r.stopDuration + 'm') : ''))
        : (idx === 0 ? (state.language === 'zh' ? '鸣枪起跑' : 'Start') : '');

      var nodeHtml = '';
      if (r.showMilestoneBadge) {
        nodeHtml = '<div class="timeline-node ' + timelineBadgeClass + '" title="' + r.dayNight.type + '">' + r.dayNight.icon + '</div>';
      }

      var timelineHtml = '<div class="timeline-cell-wrap">' +
        '  <div class="timeline-v-line ' + timelineLineClass + (idx === 0 ? ' line-start' : (idx === rows.length - 1 ? ' line-end' : '')) + '"></div>' +
        nodeHtml +
        '  <div class="timeline-time-info">' +
        '    <div class="stat-primary font-mono">' + r.passageTimeStr + '</div>' +
        '    <div class="stat-secondary">' + segTimeStr + '</div>' +
        '  </div>' +
        '</div>';

      html += '<tr class="segment-row' + (isSelected ? ' active-seg-row' : '') + '" data-idx="' + idx + '" data-seg-idx="' + segIdx + '">' +
        '  <td class="col-seg-name">' +
        '    <div class="cp-name-cell">' +
        '      <span class="cp-table-badge ' + badgeClass + '">' + badgeText + '</span>' +
        '      <strong class="cp-title-text">' + esc(r.name) + '</strong>' +
        '    </div>' +
        '  </td>' +
        '  <td class="col-seg-profile">' + profileHtml + '</td>' +
        '  <td class="col-seg-dist">' + distHtml + '</td>' +
        '  <td class="col-seg-elev">' + elevHtml + '</td>' +
        '  <td class="col-seg-alt">' + altHtml + '</td>' +
        '  <td class="col-seg-grade">' + gradeHtml + '</td>' +
        '  <td class="col-seg-time">' + timelineHtml + '</td>' +
        '</tr>';
    });

    dom.segmentTbody.innerHTML = html;

    // Attach row events
    dom.segmentTbody.querySelectorAll('.segment-row').forEach(function (tr) {
      var rowIdx = parseInt(tr.dataset.idx, 10);
      var segIdx = parseInt(tr.dataset.segIdx, 10);

      tr.addEventListener('mouseenter', function () {
        if (segIdx >= 0 && rows[rowIdx] && state.activeSegmentIdx < 0) {
          var r = rows[rowIdx];
          TR.trailMap.highlightSegment(r.segStartIdx, r.segEndIdx);
        }
      });

      tr.addEventListener('mouseleave', function () {
        if (state.activeSegmentIdx < 0) {
          TR.trailMap.clearSegmentHighlight();
        }
      });

      tr.addEventListener('click', function () {
        if (segIdx >= 0) {
          toggleSegmentActive(segIdx);
        }
      });
    });
  }

  // ── 3. Zone 3: CP Table Rendering & Event Delegation ───────────────
  function renderCPTable() {
    if (!dom.cpTbody) return;
    var sortedCps = state.checkpoints.slice();
    var lang = state.language;
    var html = '';

    sortedCps.forEach(function (cp, idx) {
      var globalIdx = state.checkpoints.indexOf(cp);
      var isSelected = (globalIdx === state.activeCPIndex);
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

      html +=
        '<tr class="cp-table-row' + (isSelected ? ' selected-row' : '') + '" data-global-idx="' + globalIdx + '">' +
        '<td class="col-num">' + seqLabel + '</td>' +
        '<td class="col-name"><input type="text" data-idx="' + globalIdx + '" data-field="name" value="' + esc(cp.name) + '" placeholder="' + T[lang].placeholderCpNameInput + '"></td>' +
        '<td class="col-dist"><input type="number" data-idx="' + globalIdx + '" data-field="distance" value="' + cp.distance + '" step="0.1" min="0"></td>' +
        '<td class="col-time"><input type="text" data-idx="' + globalIdx + '" data-field="segmentTime" value="' + esc(cp.segmentTime || '') + '" placeholder="' + T[lang].placeholderTimeInput + '"' + (idx === 0 ? ' disabled' : '') + '></td>' +
        '<td class="col-action">' +
        '  <button type="button" class="btn-settings" data-idx="' + globalIdx + '" title="' + T[lang].settingsCpTitle + '">⚙️</button>' +
        '  <button type="button" class="btn-delete" data-idx="' + globalIdx + '" title="' + T[lang].deleteCpTitle + '">✕</button>' +
        '</td>' +
        detailsHtml +
        '</tr>';
    });

    dom.cpTbody.innerHTML = html;
  }

  function handleCPTableClick(e) {
    var settingsBtn = e.target.closest('.btn-settings');
    if (settingsBtn) {
      e.stopPropagation();
      var idx = parseInt(settingsBtn.dataset.idx, 10);
      openCPModal(idx);
      return;
    }

    var delBtn = e.target.closest('.btn-delete');
    if (delBtn) {
      e.stopPropagation();
      var delIdx = parseInt(delBtn.dataset.idx, 10);
      handleDeleteCP(delIdx);
      return;
    }

    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
      var row = e.target.closest('tr');
      if (row && row.dataset.globalIdx !== undefined) {
        state.activeCPIndex = parseInt(row.dataset.globalIdx, 10);
        dom.cpTbody.querySelectorAll('tr').forEach(function (r) { r.classList.remove('selected-row'); });
        row.classList.add('selected-row');
      }
    }
  }

  function handleCPTableDblClick(e) {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
      var row = e.target.closest('tr');
      if (row && row.dataset.globalIdx !== undefined) {
        openCPModal(parseInt(row.dataset.globalIdx, 10));
      }
    }
  }

  function handleCPTableInput(e) {
    if (!e.target.matches('input')) return;
    var idx = parseInt(e.target.dataset.idx, 10);
    var field = e.target.dataset.field;
    if (isNaN(idx) || !state.checkpoints[idx]) return;

    if (field === 'name') {
      state.checkpoints[idx].name = e.target.value;
      scheduleRender();
    }
  }

  function handleCPTableChange(e) {
    if (!e.target.matches('input')) return;
    var idx = parseInt(e.target.dataset.idx, 10);
    var field = e.target.dataset.field;
    var val = e.target.value;
    if (isNaN(idx) || !state.checkpoints[idx]) return;

    if (field === 'distance') {
      var numVal = parseFloat(val);
      if (isNaN(numVal) || numVal < 0) numVal = 0;
      state.checkpoints[idx].distance = Math.round(numVal * 100) / 100;
      var curCP = state.checkpoints[idx];
      sortCheckpoints();
      state.activeCPIndex = state.checkpoints.indexOf(curCP);
      updateArrivalTimes();
      renderCPTable();
    } else if (field === 'segmentTime') {
      state.checkpoints[idx].segmentTime = val.trim();
      updateArrivalTimes();
      renderCPTable();
    } else if (field === 'name') {
      state.checkpoints[idx].name = val.trim();
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
    var rawDist = parseFloat(dom.poiPosition.value);
    cp.distance = (!isNaN(rawDist) && rawDist >= 0) ? Math.round(rawDist * 100) / 100 : 0;
    cp.segmentTime = dom.poiTimeDetail.value.trim();
    var rawStop = parseInt(dom.poiStopDuration.value, 10);
    cp.stopDuration = (!isNaN(rawStop) && rawStop >= 0) ? Math.min(rawStop, 1440) : 0;
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
      fontSizeCPName: 20,
      fontSizeCPElev: 11,
      fontSizeCPTime: 20,
      fontSizeCPNotes: 22,
      fontSizeSegment: 17,
      fontSizeCumulDist: 17,
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
