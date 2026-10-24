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
      vibeCodedBy: "Vibe coded by",
      footerPrivacy: "轨迹和路书数据只在你的浏览器本地处理",
      raceNameLabel: "比赛名称",
      raceNamePlaceholder: "未命名赛事",
      raceStartLabel: "出发时间",

      importMenu: "导入",
      exportMenu: "导出",
      uploadTrack: "上传轨迹文件",
      importJson: "导入路书配置",
      downloadTemplate: "下载配置模板",
      exportJson: "导出路书配置",
      exportPngLabel: "PNG 路书图片",
      scale1: "标准 1×",
      scale2: "高清 2×",
      scale2Tag: "推荐",
      scale3: "超清 3×",
      scale3Tag: "打印",

      step1: "上传轨迹",
      step2: "设置 CP",
      step3: "目标时间",
      step4: "微调分段",
      step5: "导出路书",
      stepOptional: "可选",
      hintStep1: "先上传比赛路线：把 GPX / KML / KMZ 文件拖到下方剖面区域，或者点右边的按钮选择文件。",
      hintStep1Action: "选择文件",
      hintStep2: "在剖面图上双击添加 CP，或点「添加 CP」；距离可以在计划表里直接修改。",
      hintStep2Action: "添加 CP",
      hintStep3: "填写目标完赛时间，系统会按每段的距离和爬升自动分配用时。",
      hintStep3Action: "填写目标时间",
      hintStep5: "可以导出路书了。也可以先锁定某段用时或填写停留时间来微调。",
      hintStep5Action: "导出图片",
      hintAllDone: "路书已导出。之后修改任何内容，都可以随时重新导出。",

      zone1Title: "路书剖面",
      zone1Tip: "在剖面上移动鼠标或手指，地图会同步显示位置；点击分段可以高亮该段",
      canvasLabel: "画布",
      ratioAuto: "自适应",
      ratio19_5_9Title: "19.5:9 横屏（适配 iPhone 等）",
      ratio20_9Title: "20:9 横屏（适配小米、华为等安卓手机）",
      colorModeLabel: "着色",
      colorModeClassic: "经典",
      colorModeGradient: "坡度",
      colorModeElevation: "海拔",
      elevCalcModeLabel: "爬升",
      elevModeRaw: "原始",
      elevModeSmooth: "平滑",
      elevModeRawTitle: "直接累加原始海拔数据",
      elevModeSmoothTitle: "过滤 4 m 以内的 GPS 噪点（推荐，更接近手表和官方数据）",
      btnFontSizes: "字号",
      btnFontSizesTitle: "配置各元素字号大小",
      dropTitle: "把 GPX / KML / KMZ 文件拖到这里",
      dropSub: "文件只在你的浏览器里处理，不会上传到任何服务器",
      dropChoose: "选择文件",
      loadSample: "用示例赛道试一试",
      dropImportJson: "或导入已保存的路书配置 (JSON)",

      mapExplorerTitle: "交互式轨迹地图",
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

      planTitle: "比赛计划",
      planTip: "悬停或点击一行，可在剖面图和地图上定位该段",
      targetTimeLabel: "目标完赛",
      targetTimePlaceholder: "如 14:00",
      colStop: "停留 (分)",
      colEta: "预计抵达",
      colActions: "操作",
      addCpTip: "也可以在剖面图上双击，直接在该位置添加 CP",
      altitudeShort: "海拔",
      cumulShort: "累计",
      departShort: "离站",
      timeLocked: "已锁定",
      timeAutoTarget: "按目标分配",
      timeAutoDefault: "默认配速估算",
      lockTitle: "锁定这段用时（其余分段自动重新分配）",
      unlockTitle: "已锁定，点击改回自动分配",
      summaryOnTarget: "已按目标分配，完赛用时 {t}",
      summaryStops: "（含停留 {t}）",
      summaryOver: "锁定的分段和停留已比目标多 {t}：放宽目标，或解锁某段",
      summaryUnder: "所有分段都已锁定，合计比目标少 {t}",
      summaryEstimate: "还没设目标：按默认配速估算，完赛约 {t}",
      summaryFinish: "预计完赛用时 {t}",
      toastCpAddedAt: "已在 {d} km 添加 CP",
      toastWaypoints: "已把 GPX 中的 {n} 个航点设为 CP",
      undo: "撤销",
      statsGradientTitle: "坡度分布与实战技术要点",
      segColProfile: "分段剖面",
      segColGainLoss: "爬升 / 下降",

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

      colNum: "#",
      colName: "名称",
      colDist: "距起点 (km)",
      colTime: "分段用时",
      colNotes: "备注 (支持回车多行)",
      addCpBtn: "添加 CP",
      poiPanelTitle: "检查点详细视觉配置",
      poiCol1Title: "基本信息",
      poiCol1Pos: "CP位置距离 (公里)",
      poiCol1Intermediate: "用于分段统计点 (划分子赛段)",
      poiCol1FontSizesTitle: "各元素字号大小设置 (像素)",
      btnReset: "重置默认",
      toastFontSizesSaved: "字号设置已保存并应用",
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

      toastTrackSuccess: "轨迹已载入：全长 ",
      toastTrackSuccessMid: " km，累计爬升 +",
      toastTrackSuccessTail: " m",
      toastTrackError: "轨迹解析错误：",
      toastImportSuccess: "配置已导入",
      toastImportError: "导入格式错误：",
      toastExportSuccess: "配置已导出",
      toastGpxFirst: "请先上传比赛路线的 GPX / KML / KMZ 文件。",
      toastExporting: "正在导出 ",
      toastKeepOne: "必须保留至少一个检查点。",
      toastDeleted: "检查点已删除",
      toastTemplateSuccess: "模板已下载",
      toastSampleError: "示例赛道加载失败：",
      toastUnsupportedFile: "不支持的文件类型。请使用 GPX / KML / KMZ 轨迹或 JSON 配置。",
      newCpName: "新检查点",
      deleteCpTitle: "删除此CP",
      settingsCpTitle: "配置此CP视觉属性",
      modalCloseTitle: "关闭",
      placeholderCpNameInput: "CP名称",
      placeholderTimeInput: "用时 H:MM",
      placeholderNotesInput: "备注信息",
      placeholderTextNone: "无",

      btnCancel: "取消",
      btnSaveApply: "保存并应用",

      labelStopDuration: "停留时间 (分钟)",
      toastMapFallback: "天地图图层加载受阻，已自动切换到备用地图（高德 / OSM）"
    },
    en: {
      vibeCodedBy: "Vibe coded by",
      footerPrivacy: "Your tracks and roadbooks are processed locally in your browser",
      raceNameLabel: "Race name",
      raceNamePlaceholder: "Untitled race",
      raceStartLabel: "Start time",

      importMenu: "Import",
      exportMenu: "Export",
      uploadTrack: "Upload track file",
      importJson: "Import roadbook settings",
      downloadTemplate: "Download template",
      exportJson: "Export roadbook settings",
      exportPngLabel: "PNG roadbook image",
      scale1: "Standard 1×",
      scale2: "HD 2×",
      scale2Tag: "Recommended",
      scale3: "Ultra HD 3×",
      scale3Tag: "Print",

      step1: "Upload track",
      step2: "Set checkpoints",
      step3: "Target time",
      step4: "Fine-tune",
      step5: "Export",
      stepOptional: "optional",
      hintStep1: "Start with the race route: drop a GPX / KML / KMZ file on the profile area below, or choose a file.",
      hintStep1Action: "Choose file",
      hintStep2: "Double-click the profile to add a checkpoint, or use Add checkpoint; edit distances right in the plan.",
      hintStep2Action: "Add checkpoint",
      hintStep3: "Enter your target finish time; it is split across segments by distance and climb.",
      hintStep3Action: "Set target time",
      hintStep5: "Your roadbook is ready to export. You can still lock a segment time or add stop times first.",
      hintStep5Action: "Export image",
      hintAllDone: "Roadbook exported. Change anything and export again whenever you like.",

      zone1Title: "Roadbook profile",
      zone1Tip: "Move over the profile to follow the position on the map; click a segment to highlight it",
      canvasLabel: "Canvas",
      ratioAuto: "Auto",
      ratio19_5_9Title: "19.5:9 landscape (iPhone and similar)",
      ratio20_9Title: "20:9 landscape (most Android phones)",
      colorModeLabel: "Colors",
      colorModeClassic: "Classic",
      colorModeGradient: "Grade",
      colorModeElevation: "Elevation",
      elevCalcModeLabel: "Gain",
      elevModeRaw: "Raw",
      elevModeSmooth: "Smooth",
      elevModeRawTitle: "Sum the raw elevation data as recorded",
      elevModeSmoothTitle: "Filter GPS noise under 4 m (recommended, closer to watches and official figures)",
      btnFontSizes: "Font sizes",
      btnFontSizesTitle: "Configure font sizes",
      dropTitle: "Drop a GPX / KML / KMZ file here",
      dropSub: "Files are processed in your browser and never uploaded to a server",
      dropChoose: "Choose file",
      loadSample: "Try a sample course",
      dropImportJson: "or import saved roadbook settings (JSON)",

      mapExplorerTitle: "Interactive trail map",
      mapSourceLabel: "Base map",
      btnFitMap: "Fit track",
      btnFitMapTitle: "Zoom to the whole track",
      mapSourceTiandituVec: "Tianditu Road (Recommended)",
      mapSourceTiandituSat: "Tianditu Satellite",
      mapSourceTiandituTer: "Tianditu Terrain",
      mapSourceGaodeSat: "Gaode Hybrid",
      mapSourceGaodeRoad: "Gaode Road",
      mapSourceOSM: "OpenStreetMap",
      mapSourceOpenTopo: "OpenTopoMap",
      mapSourceCyclOSM: "CyclOSM",

      planTitle: "Race plan",
      planTip: "Hover or click a row to locate that segment on the profile and map",
      targetTimeLabel: "Target finish",
      targetTimePlaceholder: "e.g. 14:00",
      colStop: "Stop (min)",
      colEta: "ETA",
      colActions: "Actions",
      addCpTip: "You can also double-click the profile to add a checkpoint right there",
      altitudeShort: "Alt.",
      cumulShort: "Total",
      departShort: "Leave",
      timeLocked: "Locked",
      timeAutoTarget: "From target",
      timeAutoDefault: "Default pace",
      lockTitle: "Lock this time (the other segments are re-balanced)",
      unlockTitle: "Locked; click to go back to automatic",
      summaryOnTarget: "Split across segments: finish in {t}",
      summaryStops: " (incl. {t} of stops)",
      summaryOver: "Locked segments and stops exceed the target by {t}: relax the target or unlock a segment",
      summaryUnder: "All segments are locked and add up to {t} less than the target",
      summaryEstimate: "No target yet: the default pace gives about {t}",
      summaryFinish: "Expected finish time {t}",
      toastCpAddedAt: "Checkpoint added at {d} km",
      toastWaypoints: "{n} GPX waypoints added as checkpoints",
      undo: "Undo",
      statsGradientTitle: "Grade distribution and technique tips",
      segColProfile: "Profile",
      segColGainLoss: "Gain / Loss",

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

      colNum: "#",
      colName: "Name",
      colDist: "Distance (km)",
      colTime: "Segment Duration",
      colNotes: "Notes (supports Enter)",
      addCpBtn: "Add checkpoint",
      poiPanelTitle: "Checkpoint visual settings",
      poiCol1Title: "Basic Info",
      poiCol1Pos: "CP Distance (km)",
      poiCol1Intermediate: "Use for segment split stats",
      poiCol1FontSizesTitle: "Font sizes (px)",
      btnReset: "Reset defaults",
      toastFontSizesSaved: "Font sizes saved",
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

      toastTrackSuccess: "Track loaded: ",
      toastTrackSuccessMid: " km, gain +",
      toastTrackSuccessTail: " m",
      toastTrackError: "Couldn't read the track: ",
      toastImportSuccess: "Settings imported",
      toastImportError: "Import format error: ",
      toastExportSuccess: "Settings exported",
      toastGpxFirst: "Upload the race route (GPX / KML / KMZ) first.",
      toastExporting: "Exporting ",
      toastKeepOne: "Keep at least one checkpoint.",
      toastDeleted: "Checkpoint deleted",
      toastTemplateSuccess: "Template downloaded",
      toastSampleError: "Couldn't load the sample course: ",
      toastUnsupportedFile: "Unsupported file type. Use a GPX / KML / KMZ track or a JSON settings file.",
      newCpName: "New Checkpoint",
      deleteCpTitle: "Delete Checkpoint",
      settingsCpTitle: "Configure Checkpoint Visuals",
      modalCloseTitle: "Close",
      placeholderCpNameInput: "CP Name",
      placeholderTimeInput: "Duration H:MM",
      placeholderNotesInput: "Notes",
      placeholderTextNone: "None",

      btnCancel: "Cancel",
      btnSaveApply: "Save and apply",

      labelStopDuration: "Stop Duration (min)",
      toastMapFallback: "Tianditu tiles failed to load, switched to a backup map (Gaode / OSM)"
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
    exportRatio: '20-9',      // 'auto' | '19.5-9' | '20-9' — shapes the on-screen profile too
    targetTime: '',           // target finish, split over segments without a locked time
    activeRange: null,        // { startDist, endDist } of the clicked segment
    hasExported: false,
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

  var SAMPLE_TRACK_URL = 'samples/sample-trail.gpx';

  // ── DOM References ──────────────────────────────────────────────────
  var dom = {};

  function init() {
    // App bar: race name, import / export menus, language
    dom.inputName         = document.getElementById('input-name');
    dom.btnImportMenu     = document.getElementById('btn-import-menu');
    dom.importMenu        = document.getElementById('import-menu');
    dom.btnGpx            = document.getElementById('btn-gpx');
    dom.inputGpx          = document.getElementById('input-gpx');
    dom.btnImport         = document.getElementById('btn-import');
    dom.inputJson         = document.getElementById('input-json');
    dom.btnTemplateJson   = document.getElementById('btn-template-json');
    dom.btnExportImg      = document.getElementById('btn-export-img');
    dom.exportMenu        = document.getElementById('export-menu');
    dom.btnExportJson     = document.getElementById('btn-export-json');
    dom.langButtons       = document.querySelectorAll('.lang-toggle [data-lang]');
    dom.toast             = document.getElementById('toast');
    dom.toastText         = document.getElementById('toast-text');
    dom.toastAction       = document.getElementById('toast-action');

    // Step bar
    dom.stepBar           = document.getElementById('step-bar');
    dom.stepButtons       = document.querySelectorAll('#step-bar .step');
    dom.stepHint          = document.getElementById('step-hint');
    dom.stepHintText      = document.getElementById('step-hint-text');
    dom.stepHintAction    = document.getElementById('step-hint-action');

    // Sections (scroll targets for the step bar)
    dom.sectionProfile    = document.getElementById('section-profile');
    dom.sectionPlan       = document.getElementById('section-plan');

    // Zone 1: Profile, view settings & Font Sizes Modal
    dom.profileContainer  = document.getElementById('profile-container');
    dom.placeholder       = document.getElementById('profile-placeholder');
    dom.btnDropChoose     = document.getElementById('btn-drop-choose');
    dom.btnLoadSample     = document.getElementById('btn-load-sample');
    dom.btnDropImportJson = document.getElementById('btn-drop-import-json');
    dom.ratioButtons      = document.querySelectorAll('#ratio-control [data-ratio]');
    dom.colorModeButtons  = document.querySelectorAll('#color-mode-control [data-color-mode]');
    dom.btnElevRaw        = document.getElementById('btn-elev-raw');
    dom.btnElevSmooth     = document.getElementById('btn-elev-smooth');
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

    // Plan: start time, CP Table & Segment Statistics
    dom.inputStartTime    = document.getElementById('input-start-time');
    dom.inputTargetTime   = document.getElementById('input-target-time');
    dom.planSummary       = document.getElementById('plan-summary');
    dom.planTbody         = document.getElementById('plan-tbody');
    dom.btnAddCp          = document.getElementById('btn-add-cp');

    // Analysis: Map & Gradient Distribution
    dom.selectMapSource   = document.getElementById('select-map-source');
    dom.btnFitMap         = document.getElementById('btn-fit-map');
    dom.trailStatCards    = document.getElementById('trail-stat-cards');
    dom.gradientDistContent = document.getElementById('gradient-distribution-content');

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
    bindDragAndDrop();
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
        renderPlanTable(); // passage times and day/night
        scheduleRender();
      });
    }

    dom.inputTargetTime.addEventListener('change', function () {
      var minutes = parseTargetTime(this.value);
      state.targetTime = minutes > 0 ? TR.utils.formatTime(minutes) : '';
      this.value = state.targetTime;
      updateArrivalTimes();
      refreshAfterPlanChange(false);
    });

    // View settings in the profile header
    dom.btnElevRaw.addEventListener('click', function () { setElevationMode('raw'); });
    dom.btnElevSmooth.addEventListener('click', function () { setElevationMode('smooth'); });
    dom.colorModeButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.colorMode = this.dataset.colorMode;
        syncViewControls();
        renderAllComponents();
      });
    });
    dom.ratioButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.exportRatio = this.dataset.ratio;
        syncViewControls();
        scheduleRender();
      });
    });

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

    dom.langButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (state.language === this.dataset.lang) return;
        state.language = this.dataset.lang;
        applyLanguage();
      });
    });

    // Import / export menus
    bindDropdown(dom.btnImportMenu, dom.importMenu);
    bindDropdown(dom.btnExportImg, dom.exportMenu);
    dom.exportMenu.querySelectorAll('[data-scale]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        handleImageExport(parseInt(this.dataset.scale, 10));
      });
    });
    document.addEventListener('click', closeMenus);
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      closeMenus();
      closeCPModal();
      closeFontSizesModal();
    });

    // Empty state (drop zone) actions
    dom.btnDropChoose.addEventListener('click', function () { dom.inputGpx.click(); });
    dom.btnLoadSample.addEventListener('click', loadSampleTrack);
    dom.btnDropImportJson.addEventListener('click', function () { dom.inputJson.click(); });

    // Step bar
    dom.stepButtons.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation(); // step 5 opens the export menu; keep the document handler from closing it
        goToStep(parseInt(this.dataset.step, 10));
      });
    });
    dom.stepHintAction.addEventListener('click', function (e) {
      e.stopPropagation();
      runStepAction(parseInt(this.dataset.step, 10));
    });

    dom.btnAddCp.addEventListener('click', handleAddCP);

    // Plan table event delegation
    dom.planTbody.addEventListener('input', handlePlanInput);
    dom.planTbody.addEventListener('change', handlePlanChange);
    dom.planTbody.addEventListener('click', handlePlanClick);
    dom.planTbody.addEventListener('dblclick', handlePlanDblClick);
    var hoveredRow = null;
    dom.planTbody.addEventListener('mouseover', function (e) {
      var row = e.target.closest('tr.plan-row');
      if (row === hoveredRow) return;
      hoveredRow = row;
      if (!state.activeRange) highlightRangeOnMap(rowRange(row));
    });
    dom.planTbody.addEventListener('mouseleave', function () {
      hoveredRow = null;
      if (!state.activeRange) TR.trailMap.clearSegmentHighlight();
    });

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

  // ── Dropdown Menus ──────────────────────────────────────────────────
  function bindDropdown(button, menu) {
    button.addEventListener('click', function (e) {
      e.stopPropagation();
      var willOpen = !menu.classList.contains('open');
      closeMenus();
      if (willOpen) openMenu(button, menu);
    });
    // Picking an item closes the menu (the document handler would too, but items stop nothing)
    menu.addEventListener('click', function (e) {
      if (e.target.closest('button')) closeMenus();
    });
  }

  function openMenu(button, menu) {
    menu.classList.add('open');
    button.setAttribute('aria-expanded', 'true');
  }

  function closeMenus() {
    document.querySelectorAll('.dropdown-menu.open').forEach(function (menu) { menu.classList.remove('open'); });
    document.querySelectorAll('[aria-expanded="true"]').forEach(function (btn) { btn.setAttribute('aria-expanded', 'false'); });
  }

  // Segmented controls and the language toggle mirror state (also after a JSON import)
  function syncViewControls() {
    dom.langButtons.forEach(function (btn) { btn.classList.toggle('active', btn.dataset.lang === state.language); });
    dom.colorModeButtons.forEach(function (btn) { btn.classList.toggle('active', btn.dataset.colorMode === state.colorMode); });
    dom.ratioButtons.forEach(function (btn) { btn.classList.toggle('active', btn.dataset.ratio === state.exportRatio); });
    dom.btnElevRaw.classList.toggle('active', state.elevationMode === 'raw');
    dom.btnElevSmooth.classList.toggle('active', state.elevationMode === 'smooth');
  }

  // ── Drag & Drop Upload ──────────────────────────────────────────────
  function bindDragAndDrop() {
    var depth = 0;
    function hasFiles(e) {
      return e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types || [], 'Files') !== -1;
    }
    document.addEventListener('dragenter', function (e) {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth++;
      document.body.classList.add('drag-over');
    });
    document.addEventListener('dragover', function (e) {
      if (!hasFiles(e)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });
    document.addEventListener('dragleave', function (e) {
      if (!hasFiles(e)) return;
      depth = Math.max(0, depth - 1);
      if (depth === 0) document.body.classList.remove('drag-over');
    });
    document.addEventListener('drop', function (e) {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth = 0;
      document.body.classList.remove('drag-over');
      var file = e.dataTransfer.files[0];
      if (!file) return;
      var ext = file.name.split('.').pop().toLowerCase();
      if (ext === 'gpx' || ext === 'kml' || ext === 'kmz') {
        loadTrackFile(file);
      } else if (ext === 'json') {
        importJsonFile(file);
      } else {
        toast(T[state.language].toastUnsupportedFile);
      }
    });
  }

  // ── Step Bar (workflow guidance) ────────────────────────────────────
  // Progress is derived from the data rather than enforced: every step stays clickable.
  function getStepStatus() {
    var hasTrack = !!state.trackData;
    var plan = computePlan();
    var hasTarget = getTargetMinutes() > 0;
    // Step 3 is met by a target time, or by typing every segment time by hand
    var timesSet = hasTarget || (plan.length > 1 && plan.every(function (entry) { return entry.segSource === 'manual'; }));
    var tuned = state.checkpoints.some(function (cp) { return cp.stopDuration > 0; }) ||
      (hasTarget && plan.some(function (entry, i) { return i > 0 && entry.segSource === 'manual'; }));
    var done = {
      1: hasTrack,
      2: hasTrack && state.checkpoints.length > 2,
      3: hasTrack && timesSet,
      4: hasTrack && tuned,
      5: state.hasExported
    };
    // Step 4 is optional fine-tuning, so the guidance skips from 3 to 5
    var current = !done[1] ? 1 : (!done[2] ? 2 : (!done[3] ? 3 : (!done[5] ? 5 : 0)));
    return { done: done, current: current };
  }

  function updateStepBar() {
    if (!dom.stepBar) return;
    var dict = T[state.language];
    var status = getStepStatus();

    dom.stepButtons.forEach(function (btn) {
      var n = parseInt(btn.dataset.step, 10);
      var isCurrent = (n === status.current);
      var isDone = !!status.done[n] && !isCurrent;
      btn.classList.toggle('current', isCurrent);
      btn.classList.toggle('done', isDone);
      btn.parentNode.classList.toggle('is-current', isCurrent);
      if (isCurrent) btn.setAttribute('aria-current', 'step'); else btn.removeAttribute('aria-current');
      btn.querySelector('.step-num').innerHTML = isDone
        ? '<svg class="icon" aria-hidden="true"><use href="#i-check"/></svg>'
        : String(n);
    });

    var cur = status.current;
    dom.stepHint.classList.toggle('all-done', !cur);
    dom.stepHintText.textContent = cur ? dict['hintStep' + cur] : dict.hintAllDone;
    var actionLabel = cur ? dict['hintStep' + cur + 'Action'] : '';
    dom.stepHintAction.textContent = actionLabel || '';
    dom.stepHintAction.dataset.step = String(cur);
    dom.stepHintAction.classList.toggle('hidden', !actionLabel);
  }

  function scrollToSection(el) {
    if (!el) return;
    var appBar = document.getElementById('app-bar');
    var offset = (appBar ? appBar.offsetHeight : 0) + 12;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - offset, behavior: 'smooth' });
  }

  function goToStep(n) {
    if (n === 1) {
      if (state.trackData) scrollToSection(dom.sectionProfile);
      else dom.inputGpx.click();
    } else if (n === 5) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      openMenu(dom.btnExportImg, dom.exportMenu);
    } else {
      scrollToSection(dom.sectionPlan);
      if (n === 3) dom.inputTargetTime.focus({ preventScroll: true });
    }
  }

  function runStepAction(n) {
    if (n === 1) {
      dom.inputGpx.click();
    } else if (n === 2) {
      handleAddCP();
      scrollToSection(dom.sectionPlan);
    } else {
      goToStep(n);
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
    dom.inputGpx.value = '';
    if (file) loadTrackFile(file);
  }

  function loadSampleTrack() {
    fetch(SAMPLE_TRACK_URL)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.text();
      })
      .then(function (text) {
        if (!state.raceName) {
          state.raceName = (state.language === 'zh') ? '示例赛道' : 'Sample course';
          dom.inputName.value = state.raceName;
        }
        loadTrackFile(new File([text], 'sample-trail.gpx', { type: 'application/gpx+xml' }));
      })
      .catch(function (err) {
        toast(T[state.language].toastSampleError + err.message);
      });
  }

  function loadTrackFile(file) {
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

      var importedWaypoints = [];
      if (trackData.waypoints && trackData.waypoints.length > 0 && state.checkpoints.length <= 2) {
        trackData.waypoints.forEach(function (wp) {
          if (wp.distance > 0.5 && wp.distance < totalDist - 0.5) {
            var wpCp = normalizeCP({
              name: wp.name || 'CP',
              distance: Math.round(wp.distance * 10) / 10,
              icon: 'classic',
              arrivalTime: '',
              segmentTime: '',
              notes: wp.desc || ''
            }, state.checkpoints.length);
            state.checkpoints.push(wpCp);
            importedWaypoints.push(wpCp);
          }
        });
      }

      state.activeRange = null;
      sortCheckpoints();
      normalizeAllCPs();
      TR.trailAnalysis.resetSegmentCache();
      renderAllComponents();

      var dict = T[state.language];
      var msg = dict.toastTrackSuccess + totalDist.toFixed(1) + dict.toastTrackSuccessMid + Math.round(trackData.totalAscent) + dict.toastTrackSuccessTail;
      if (importedWaypoints.length) {
        // Waypoints become checkpoints automatically; make that visible and reversible
        toast(msg + ' · ' + dict.toastWaypoints.replace('{n}', importedWaypoints.length), {
          actionLabel: dict.undo,
          onAction: function () {
            state.checkpoints = state.checkpoints.filter(function (cp) { return importedWaypoints.indexOf(cp) === -1; });
            state.activeCPIndex = 0;
            normalizeAllCPs();
            refreshAfterPlanChange(true);
          }
        });
      } else {
        toast(msg);
      }
    }).catch(function (err) {
      toast(T[state.language].toastTrackError + err.message);
    });
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
      updateArrivalTimes(); // segment D+ drives the time split
      renderAllComponents();
    }
  }

  // ── Rendering All Visual Components (Full Reactive Sync) ───────────
  function renderAllComponents() {
    if (!state.trackData) return;
    renderProfile();
    renderTrailSummaryStats();
    renderGradientDistribution();
    renderPlanTable();
    // Draw (and fit) the map last, once the panels around it have their final size
    TR.trailMap.drawMap(state.trackData, state.colorMode, state.checkpoints);
    updateStepBar();
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
      state.exportRatio,
      {
        colorMode: state.colorMode,
        activeSegment: state.activeRange,
        segments: segments,
        targetMinutes: getTargetMinutes(),
        onHover: function (ptIdx, pt, segIdx, seg) {
          TR.trailMap.updateMapCurrentPoint(ptIdx);
        },
        onSegmentHover: function (segIdx, seg) {
          var range = seg ? { startDist: seg.startDist, endDist: seg.endDist } : null;
          markPlanRows(range);
          if (!state.activeRange) highlightRangeOnMap(range);
        },
        onSegmentClick: function (segIdx, seg) {
          toggleActiveRange({ startDist: seg.startDist, endDist: seg.endDist });
        },
        onAddCheckpoint: function (distKm) {
          addCheckpointAt(Math.round(distKm * 10) / 10);
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

  // ── Segment Linkage (profile ⇄ plan table ⇄ map) ────────────────────
  // A segment is a distance range: the profile's split segments and the plan
  // table's CP-to-CP rows both resolve to one.
  function sameRange(a, b) {
    return !!(a && b) && Math.abs(a.startDist - b.startDist) < 1e-6 && Math.abs(a.endDist - b.endDist) < 1e-6;
  }

  function rowRange(row) {
    if (!row || row.dataset.segStart === undefined) return null;
    return { startDist: parseFloat(row.dataset.segStart), endDist: parseFloat(row.dataset.segEnd) };
  }

  function highlightRangeOnMap(range) {
    if (!state.trackpoints || !range) {
      TR.trailMap.clearSegmentHighlight();
      return;
    }
    TR.trailMap.highlightSegment(
      TR.trailMath.findNearestPointIndexByDistance(state.trackpoints, range.startDist),
      TR.trailMath.findNearestPointIndexByDistance(state.trackpoints, range.endDist)
    );
  }

  function toggleActiveRange(range) {
    state.activeRange = sameRange(state.activeRange, range) ? null : range;
    if (state.activeRange) highlightRangeOnMap(state.activeRange);
    else TR.trailMap.clearSegmentHighlight();
    markPlanRows(null);
    scheduleRender();
  }

  // Rows lying inside the active (clicked) or hovered range get a highlight
  function markPlanRows(hoverRange) {
    if (!dom.planTbody) return;
    dom.planTbody.querySelectorAll('tr.plan-row').forEach(function (tr) {
      var r = rowRange(tr);
      function inside(range) {
        return !!(r && range) && r.startDist >= range.startDist - 1e-6 && r.endDist <= range.endDist + 1e-6;
      }
      tr.classList.toggle('active-seg-row', inside(state.activeRange));
      tr.classList.toggle('hover-seg-row', inside(hoverRange));
    });
  }

  // ── Plan Table: checkpoints, segment stats and timing in one table ───
  // A bare number in the target field means hours ("14" → 14:00)
  function parseTargetTime(str) {
    str = String(str || '').trim();
    if (!str) return 0;
    if (/^\d+(\.\d+)?$/.test(str)) return Math.round(parseFloat(str) * 60);
    return TR.utils.parseTime(str);
  }

  function getTargetMinutes() {
    return parseTargetTime(state.targetTime);
  }

  function computePlan() {
    return TR.trailAnalysis.computeTimePlan(state.trackpoints, state.checkpoints, state.elevationMode, getTargetMinutes());
  }

  function renderPlanTable() {
    if (!dom.planTbody) return;
    var dict = T[state.language];
    var lang = state.language;
    var u = TR.utils;
    var pts = state.trackpoints;
    var plan = computePlan();
    var startInfo = parseStartTime(state.startTime);
    var cumulAscent = 0;
    var html = '';

    // Re-rendering replaces the inputs and buttons; remember which one had focus to restore it
    var focused = document.activeElement;
    var focusSelector = null;
    if (focused && dom.planTbody.contains(focused) && focused.dataset.idx !== undefined) {
      focusSelector = '[data-idx="' + focused.dataset.idx + '"]' + (focused.dataset.field
        ? '[data-field="' + focused.dataset.field + '"]'
        : '.' + focused.className.split(' ')[0]);
    }

    plan.forEach(function (entry, idx) {
      var cp = entry.cp;
      var gi = state.checkpoints.indexOf(cp);
      var isFirst = (idx === 0);
      var isLast = (idx === plan.length - 1);
      var prev = isFirst ? null : plan[idx - 1].cp;
      var badgeClass = isFirst ? 'cp-badge-start' : (isLast ? 'cp-badge-finish' : 'cp-badge-default');
      var badgeText = isFirst ? 'S' : (isLast ? 'F' : String(idx));
      var stats = (!isFirst && pts) ? u.segmentStats(pts, prev.distance, cp.distance, state.elevationMode) : null;
      if (stats) cumulAscent += stats.dPlus;

      var nameCell =
        '<input type="text" class="plan-input plan-input-name" data-idx="' + gi + '" data-field="name" value="' + esc(cp.name) + '" placeholder="' + esc(dict.placeholderCpNameInput) + '" aria-label="' + esc(dict.colName) + '">' +
        (pts ? '<div class="stat-secondary">' + dict.altitudeShort + ' ' + Math.round(u.interpolateElevation(pts, cp.distance)) + ' m</div>' : '');

      var distCell =
        '<input type="number" class="plan-input plan-input-num" data-idx="' + gi + '" data-field="distance" value="' + cp.distance + '" step="0.1" min="0" aria-label="' + esc(dict.colDist) + '">' +
        (isFirst ? '' : '<div class="stat-secondary">+' + (cp.distance - prev.distance).toFixed(1) + ' km</div>');

      var profileCell = (stats && state.trackData) ? generateMiniProfileSvg(state.trackData, prev.distance, cp.distance) : '';

      var elevCell = stats
        ? '<div class="stat-primary"><span class="gain">+' + stats.dPlus + '</span> / <span class="loss">−' + stats.dMinus + '</span> m</div>' +
          '<div class="stat-secondary">' + dict.cumulShort + ' +' + cumulAscent + ' m</div>'
        : '<div class="stat-secondary">–</div>';

      var timeCell = '<div class="stat-secondary">–</div>';
      if (!isFirst) {
        var manual = (entry.segSource === 'manual');
        var sourceLabel = manual ? dict.timeLocked : (entry.segSource === 'target' ? dict.timeAutoTarget : dict.timeAutoDefault);
        timeCell =
          '<div class="time-cell">' +
          '<input type="text" class="plan-input plan-input-time' + (manual ? ' is-manual' : '') + '" data-idx="' + gi + '" data-field="segmentTime" value="' + (manual ? esc(cp.segmentTime) : '') + '" placeholder="' + (entry.segEstimated ? '≈' : '') + u.formatTime(entry.segMinutes) + '" aria-label="' + esc(dict.colTime) + '" autocomplete="off">' +
          '<button type="button" class="btn-lock' + (manual ? ' locked' : '') + '" data-idx="' + gi + '" title="' + esc(manual ? dict.unlockTitle : dict.lockTitle) + '" aria-label="' + esc(manual ? dict.unlockTitle : dict.lockTitle) + '" aria-pressed="' + manual + '">' +
          '<svg class="icon" aria-hidden="true"><use href="#i-' + (manual ? 'lock' : 'unlock') + '"/></svg></button>' +
          '</div>' +
          '<div class="stat-secondary' + (manual ? ' is-locked' : '') + '">' + sourceLabel + '</div>';
      }

      var stopCell = (isFirst || isLast)
        ? '<div class="stat-secondary">–</div>'
        : '<input type="number" class="plan-input plan-input-stop" data-idx="' + gi + '" data-field="stopDuration" value="' + (cp.stopDuration || 0) + '" min="0" max="1440" step="1" aria-label="' + esc(dict.colStop) + '">';

      var dayNight = startInfo.isDate
        ? TR.trailAnalysis.getDayNightStatus(new Date(startInfo.dateObj.getTime() + entry.arrivalMinutes * 60000))
        : null;
      var etaCell =
        '<div class="stat-primary eta">' +
        (dayNight ? '<span class="daynight" title="' + dayNight.type + '">' + dayNight.icon + '</span>' : '') +
        (entry.arrivalEstimated ? '≈ ' : '') + formatArrivalTime(startInfo, entry.arrivalMinutes, lang) +
        '</div>' +
        ((entry.stopMinutes > 0 && !isLast)
          ? '<div class="stat-secondary">' + dict.departShort + ' ' + formatArrivalTime(startInfo, entry.departureMinutes, lang).split(' ').pop() + '</div>'
          : '');

      var actionsCell =
        '<button type="button" class="btn-settings" data-idx="' + gi + '" title="' + esc(dict.settingsCpTitle) + '" aria-label="' + esc(dict.settingsCpTitle) + '"><svg class="icon" aria-hidden="true"><use href="#i-sliders"/></svg></button>' +
        '<button type="button" class="btn-delete" data-idx="' + gi + '" title="' + esc(dict.deleteCpTitle) + '" aria-label="' + esc(dict.deleteCpTitle) + '"><svg class="icon" aria-hidden="true"><use href="#i-x"/></svg></button>';

      html +=
        '<tr class="plan-row' + (gi === state.activeCPIndex ? ' selected-row' : '') + (cp.useForIntermediateDistances === false ? ' is-minor' : '') + '" data-global-idx="' + gi + '"' +
        (isFirst ? '' : ' data-seg-start="' + prev.distance + '" data-seg-end="' + cp.distance + '"') + '>' +
        '<td class="col-plan-num"><span class="cp-table-badge ' + badgeClass + '">' + badgeText + '</span></td>' +
        '<td class="col-plan-name">' + nameCell + '</td>' +
        '<td class="col-plan-dist" data-label="' + esc(dict.colDist) + '">' + distCell + '</td>' +
        '<td class="col-plan-profile">' + profileCell + '</td>' +
        '<td class="col-plan-elev" data-label="' + esc(dict.segColGainLoss) + '">' + elevCell + '</td>' +
        '<td class="col-plan-time" data-label="' + esc(dict.colTime) + '">' + timeCell + '</td>' +
        '<td class="col-plan-stop" data-label="' + esc(dict.colStop) + '">' + stopCell + '</td>' +
        '<td class="col-plan-eta" data-label="' + esc(dict.colEta) + '">' + etaCell + '</td>' +
        '<td class="col-plan-actions">' + actionsCell + '</td>' +
        '</tr>';
    });

    dom.planTbody.innerHTML = html;
    renderPlanSummary(plan);
    markPlanRows(null);
    updateStepBar();

    if (focusSelector) {
      var again = dom.planTbody.querySelector(focusSelector);
      if (again) again.focus({ preventScroll: true });
    }
  }

  function renderPlanSummary(plan) {
    if (!dom.planSummary) return;
    var dict = T[state.language];
    var u = TR.utils;
    var last = plan[plan.length - 1];
    var cls = 'plan-summary';
    var text = '';
    if (state.trackData && last && plan.length > 1) {
      var finish = last.arrivalMinutes;
      var stops = plan.slice(0, -1).reduce(function (sum, e) { return sum + e.stopMinutes; }, 0);
      var stopsText = stops > 0 ? dict.summaryStops.replace('{t}', u.formatTime(stops)) : '';
      var target = getTargetMinutes();
      if (target > 0) {
        var diff = finish - target;
        if (diff > 0) {
          cls += ' over';
          text = dict.summaryOver.replace('{t}', u.formatTime(diff));
        } else if (diff < 0) {
          cls += ' under';
          text = dict.summaryUnder.replace('{t}', u.formatTime(-diff));
        } else {
          cls += ' ok';
          text = dict.summaryOnTarget.replace('{t}', u.formatTime(finish)) + stopsText;
        }
      } else {
        text = (last.arrivalEstimated ? dict.summaryEstimate : dict.summaryFinish).replace('{t}', u.formatTime(finish)) + stopsText;
      }
    }
    dom.planSummary.className = cls;
    dom.planSummary.textContent = text;
  }

  // Re-render everything a plan edit can affect
  function refreshAfterPlanChange(redrawMap) {
    TR.trailAnalysis.resetSegmentCache();
    renderPlanTable();
    scheduleRender();
    if (redrawMap && state.trackData) {
      TR.trailMap.drawMap(state.trackData, state.colorMode, state.checkpoints, true);
    }
  }

  function handlePlanClick(e) {
    var btn = e.target.closest('button');
    if (btn) {
      var idx = parseInt(btn.dataset.idx, 10);
      if (btn.classList.contains('btn-settings')) openCPModal(idx);
      else if (btn.classList.contains('btn-delete')) handleDeleteCP(idx);
      else if (btn.classList.contains('btn-lock')) toggleSegmentLock(idx);
      return;
    }
    if (e.target.closest('input')) return;
    var row = e.target.closest('tr.plan-row');
    if (!row) return;
    state.activeCPIndex = parseInt(row.dataset.globalIdx, 10);
    dom.planTbody.querySelectorAll('tr.selected-row').forEach(function (r) { r.classList.remove('selected-row'); });
    row.classList.add('selected-row');
    var range = rowRange(row);
    if (range) toggleActiveRange(range);
  }

  function handlePlanDblClick(e) {
    if (e.target.closest('input, button')) return;
    var row = e.target.closest('tr.plan-row');
    if (row) openCPModal(parseInt(row.dataset.globalIdx, 10));
  }

  function handlePlanInput(e) {
    if (!e.target.matches('input[data-field="name"]')) return;
    var cp = state.checkpoints[parseInt(e.target.dataset.idx, 10)];
    if (!cp) return;
    cp.name = e.target.value;
    scheduleRender();
  }

  function handlePlanChange(e) {
    if (!e.target.matches('input[data-field]')) return;
    var cp = state.checkpoints[parseInt(e.target.dataset.idx, 10)];
    if (!cp) return;
    var field = e.target.dataset.field;
    var val = e.target.value;
    var redrawMap = false;

    if (field === 'distance') {
      var km = parseFloat(val);
      cp.distance = (isFinite(km) && km >= 0) ? Math.round(km * 100) / 100 : 0;
      sortCheckpoints();
      state.activeCPIndex = state.checkpoints.indexOf(cp);
      redrawMap = true;
    } else if (field === 'segmentTime') {
      // Normalise "1h30" / "90" to H:MM; anything unparseable goes back to automatic
      var minutes = TR.utils.parseTime(val);
      cp.segmentTime = minutes > 0 ? TR.utils.formatTime(minutes) : '';
    } else if (field === 'stopDuration') {
      var stop = parseInt(val, 10);
      cp.stopDuration = (isFinite(stop) && stop >= 0) ? Math.min(stop, 1440) : 0;
    } else if (field === 'name') {
      cp.name = val.trim();
      redrawMap = true;
    }

    updateArrivalTimes();
    // Wait for the focus to move (Tab / click) so the re-render restores it on the new field
    setTimeout(function () { refreshAfterPlanChange(redrawMap); }, 0);
  }

  // Locked = the user's own time; unlocked = share of the target (or default pace)
  function toggleSegmentLock(idx) {
    var cp = state.checkpoints[idx];
    if (!cp) return;
    if (String(cp.segmentTime || '').trim() !== '') {
      cp.segmentTime = '';
    } else {
      var entry = computePlan().filter(function (e) { return e.cp === cp; })[0];
      cp.segmentTime = entry ? TR.utils.formatTime(entry.segMinutes) : '';
    }
    updateArrivalTimes();
    refreshAfterPlanChange(false);
  }

  function insertCheckpoint(cp) {
    state.checkpoints.push(cp);
    sortCheckpoints();
    normalizeAllCPs();
    state.activeCPIndex = state.checkpoints.indexOf(cp);
    refreshAfterPlanChange(true);
  }

  function removeCheckpoint(cp) {
    var i = state.checkpoints.indexOf(cp);
    if (i === -1) return;
    state.checkpoints.splice(i, 1);
    if (state.activeCPIndex >= state.checkpoints.length) state.activeCPIndex = state.checkpoints.length - 1;
    normalizeAllCPs();
    refreshAfterPlanChange(true);
  }

  function newCheckpoint(distance) {
    return normalizeCP({
      name: T[state.language].newCpName,
      distance: distance,
      icon: 'classic',
      arrivalTime: '',
      segmentTime: '',
      notes: ''
    }, state.checkpoints.length);
  }

  // "Add checkpoint" button: halfway between the selected CP and the next one
  function handleAddCP() {
    var activeCP = state.checkpoints[state.activeCPIndex];
    var newDist = 1.0;
    if (activeCP) {
      var sorted = state.checkpoints.slice().sort(function (a, b) { return a.distance - b.distance; });
      var at = sorted.indexOf(activeCP);
      newDist = (at !== -1 && at < sorted.length - 1)
        ? (activeCP.distance + sorted[at + 1].distance) / 2
        : activeCP.distance + 2.0;
    }
    addCheckpointAt(Math.round(newDist * 100) / 100);
  }

  // Also used by double-clicking the profile
  function addCheckpointAt(distance) {
    var dict = T[state.language];
    var cp = newCheckpoint(distance);
    insertCheckpoint(cp);
    toast(dict.toastCpAddedAt.replace('{d}', distance.toFixed(1)), {
      actionLabel: dict.undo,
      onAction: function () { removeCheckpoint(cp); }
    });
  }

  function handleDeleteCP(idx) {
    var dict = T[state.language];
    if (state.checkpoints.length <= 1) {
      toast(dict.toastKeepOne);
      return;
    }
    var cp = state.checkpoints[idx];
    if (!cp) return;
    removeCheckpoint(cp);
    toast(dict.toastDeleted, {
      actionLabel: dict.undo,
      onAction: function () { insertCheckpoint(cp); }
    });
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

    dom.modalCpTitle.textContent = (cp.name || 'CP' + cpIndex) + ' — ' + T[state.language].poiPanelTitle;

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
    var segMinutes = TR.utils.parseTime(dom.poiTimeDetail.value); // blank or unparseable → automatic
    cp.segmentTime = segMinutes > 0 ? TR.utils.formatTime(segMinutes) : '';
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
    refreshAfterPlanChange(true);
    closeCPModal();
  }

  // ── CP Normalization & Utilities ────────────────────────────────────
  function normalizeCP(cp, idx) {
    // Imported JSON may carry strings/garbage; these fields end up in innerHTML and toFixed()
    var dist = parseFloat(cp.distance);
    cp.distance = (isFinite(dist) && dist >= 0) ? dist : 0;
    var stop = parseInt(cp.stopDuration, 10);
    cp.stopDuration = (isFinite(stop) && stop >= 0) ? stop : 0;
    cp.name = (cp.name === null || cp.name === undefined) ? '' : String(cp.name);
    cp.notes = (cp.notes === null || cp.notes === undefined) ? '' : String(cp.notes);
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
    return cp;
  }

  // cp.arrivalTime mirrors the shared time plan (map popup, JSON export). Arrivals that
  // depend on an estimated segment stay blank so they are never re-read as user input.
  // cp.arrivalTime mirrors the shared time plan (map popup, JSON export). Arrivals that
  // depend on a default-pace guess stay blank; only segmentTime is ever read back as input.
  function updateArrivalTimes() {
    if (state.checkpoints[0]) state.checkpoints[0].segmentTime = '0:00';
    computePlan().forEach(function (entry) {
      entry.cp.arrivalTime = entry.arrivalEstimated ? '' : TR.utils.formatTime(entry.arrivalMinutes);
    });
  }

  function normalizeAllCPs() {
    state.checkpoints.forEach(function (cp, idx) {
      normalizeCP(cp, idx);
    });
    updateArrivalTimes();
  }

  // JSON from before segment times existed only has cumulative arrival times
  // (no segmentTime key at all); turn those into locked segment times.
  function migrateLegacyArrivalTimes(checkpoints) {
    var prevDeparture = 0;
    checkpoints.slice().sort(function (a, b) { return a.distance - b.distance; }).forEach(function (cp, idx) {
      var arrival = prevDeparture;
      if (idx === 0) {
        arrival = 0;
      } else if (cp.segmentTime !== undefined && String(cp.segmentTime).trim() !== '') {
        arrival = prevDeparture + TR.utils.parseTime(cp.segmentTime);
      } else if (cp.segmentTime === undefined && cp.arrivalTime) {
        arrival = TR.utils.parseTime(cp.arrivalTime);
        cp.segmentTime = TR.utils.formatTime(Math.max(0, arrival - prevDeparture));
      }
      prevDeparture = arrival + (parseInt(cp.stopDuration, 10) || 0);
    });
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
    if (str === null || str === undefined) return '';
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ── JSON Import / Export / Template ─────────────────────────────────
  function handleJsonImport() {
    var file = dom.inputJson.files[0];
    dom.inputJson.value = '';
    if (file) importJsonFile(file);
  }

  function importJsonFile(file) {
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
        if (data.language === 'zh' || data.language === 'en') state.language = data.language;
        if (['classic', 'gradient', 'elevation'].indexOf(data.colorMode) !== -1) state.colorMode = data.colorMode;
        if (['auto', '19.5-9', '20-9'].indexOf(data.exportRatio) !== -1) state.exportRatio = data.exportRatio;
        if (data.elevationMode === 'raw' || data.elevationMode === 'smooth') setElevationMode(data.elevationMode);
        if (data.startTime) {
          state.startTime = data.startTime;
          if (dom.inputStartTime) dom.inputStartTime.value = data.startTime;
        }
        var target = parseTargetTime(data.targetTime);
        state.targetTime = target > 0 ? TR.utils.formatTime(target) : '';
        dom.inputTargetTime.value = state.targetTime;
        if (Array.isArray(data.checkpoints)) {
          migrateLegacyArrivalTimes(data.checkpoints);
          state.checkpoints = data.checkpoints;
        }
        sortCheckpoints();
        normalizeAllCPs();
        state.activeCPIndex = 0;
        state.activeRange = null;
        applyLanguage();
        toast(T[state.language].toastImportSuccess);
      } catch (err) {
        toast(T[state.language].toastImportError + err.message);
      }
    };
    reader.readAsText(file);
  }

  function handleJsonExport() {
    var data = {
      raceName: state.raceName,
      elevationMode: state.elevationMode,
      colorMode: state.colorMode,
      exportRatio: state.exportRatio,
      fontSizeTitle: state.fontSizeTitle,
      fontSizeCPName: state.fontSizeCPName,
      fontSizeCPElev: state.fontSizeCPElev,
      fontSizeCPTime: state.fontSizeCPTime,
      fontSizeCPNotes: state.fontSizeCPNotes,
      fontSizeSegment: state.fontSizeSegment,
      fontSizeCumulDist: state.fontSizeCumulDist,
      language: state.language,
      startTime: state.startTime || '',
      targetTime: state.targetTime || '',
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
      targetTime: "14:00",
      // segmentTime "" = split automatically from targetTime; a value locks that segment
      checkpoints: [
        { name: isZH ? "起点" : "Start", distance: 0.0, segmentTime: "0:00", stopDuration: 0, icon: "start" },
        { name: "CP1", distance: 15.0, segmentTime: "1:45", stopDuration: 5, icon: "classic" },
        { name: "CP2", distance: 52.0, segmentTime: "", stopDuration: 15, icon: "dropbag" },
        { name: isZH ? "终点" : "Finish", distance: 100.0, segmentTime: "", icon: "finish" }
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
    var ratio = state.exportRatio;
    TR.exporter.exportToPNG(svgEl, scale, filename, ratio);
    toast(T[state.language].toastExporting + scale + '× PNG (' + ratio + ')…');
    state.hasExported = true;
    updateStepBar();
  }

  // options: { actionLabel, onAction } adds a button (e.g. "Undo") and keeps the toast up longer
  var toastTimer = null;
  function toast(msg, options) {
    options = options || {};
    dom.toastText.textContent = msg;
    dom.toastAction.onclick = null;
    if (options.actionLabel && options.onAction) {
      dom.toastAction.textContent = options.actionLabel;
      dom.toastAction.onclick = function () {
        dom.toast.classList.remove('show');
        options.onAction();
      };
      dom.toastAction.classList.remove('hidden');
    } else {
      dom.toastAction.classList.add('hidden');
    }
    dom.toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { dom.toast.classList.remove('show'); }, options.onAction ? 7000 : 3000);
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

    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var key = el.dataset.i18nAria;
      if (dict[key] !== undefined) el.setAttribute('aria-label', dict[key]);
    });

    document.documentElement.lang = (lang === 'zh') ? 'zh-CN' : 'en';
    syncViewControls();
    if (state.trackData) {
      TR.trailAnalysis.resetSegmentCache();
      renderAllComponents();
    } else {
      renderPlanTable();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
