/**
 * Talus - Trail Roadbook Generator — Main Application (v5)
 *
 * Wires together: GPX parser, CP table editor, SVG profile renderer, image export,
 * and the advanced detailed horizontal Points of Interest editing panel.
 * Equipped with full dynamic Chinese/English localization (i18n).
 */
(function () {
  'use strict';

  var TR = window.TrailRoadbook;

  // ── i18n Translation Dictionary ─────────────────────────────────────
  var T = {
    zh: {
      pageTitle: "🏔️ Talus - Trail Roadbook Generator",
      headerSubtitle: "越野跑路书生成器",
      vibeCodedBy: "Vibe coded by",
      uploadGpx: "上传 GPX",
      raceNameLabel: "比赛名称",
      importJson: "导入 JSON",
      downloadTemplate: "下载模板",
      exportJson: "导出 JSON",
      languageLabel: "🌐 语言 / Language",
      exportRatioLabel: "导出比例",
      ratioAuto: "默认自适应 (无白边)",
      ratio19_5_9: "19.5:9横屏（iPhone 17/16）",
      ratio20_9: "20:9（小米、华为 Pura、主流安卓）",
      downloadPng: "下载图片 ▾",
      scale1: "1× 标准分辨率",
      scale2: "2× 高清 (推荐)",
      scale3: "3× 超高清 (打印)",
      placeholderText: "上传 GPX 文件以生成高程剖面图",
      placeholderTextSub: "Upload a GPX file to generate the elevation profile",
      cpTableTitle: "📍 CP 点 / 补给站 列表",
      colNum: "#",
      colName: "名称",
      colDist: "距起点 (km)",
      colIcon: "首选图标",
      colTime: "分段用时",
      colNotes: "备注 (支持回车多行)",
      addCpBtn: "添加 CP 点",
      poiPanelTitle: "📍 检查点详细视觉配置",
      poiTabAdd: "+ 添加",
      poiCol1Title: "基本信息与全局字号",
      poiCol1Pos: "CP位置距离 (公里)",
      poiCol1Intermediate: "用于分段统计点 (划分子赛段)",
      poiCol1FontSizesTitle: "各元素字号大小设置 (像素)",
      fsLabelTitle: "比赛名称",
      fsLabelCpName: "CP点名称",
      fsLabelCpElev: "CP点海拔",
      fsLabelCpTime: "预计用时",
      fsLabelCpNotes: "备注信息",
      fsLabelSegment: "区间分段",
      fsLabelCumulDist: "底部累计距离",
      poiCol2Title: "图标与标志组合 (最多叠加3层)",
      poiCol2Size: "图标绘制大小",
      poiCol2Rot: "图标旋转角度 (°)",
      poiIconGroup0: "图标 1 (首选)",
      poiIconGroup1: "图标 2",
      poiIconGroup2: "图标 3",
      poiLabelSymbol: "符号",
      poiLabelBg: "背景颜色",
      poiLabelGlyph: "图案",
      btnWhite: "白",
      btnBlack: "黑",
      poiCol3Title: "垂直指示辅助线",
      poiCol3Color: "指示线颜色",
      poiCol3Thickness: "指示线粗细 (px)",
      poiCol3Broken: "指示线在海拔曲线处断开",
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
      
      iconStart: "🟢 起点 (Start)",
      iconFinish: "🔴 终点 (Finish)",
      iconWater: "💧 水站 (Water)",
      iconFood: "🍽️ 补给站 (Food)",
      iconCutoff: "⚠️ 关门点 (Cutoff)",
      iconCp: "📍 检查点 (CP)",
      iconChapel: "⛪ 教堂 (Chapel)",
      iconDanger: "⚡ 危险 (Danger)",
      iconPeak: "🏔️ 山峰 (Peak)",
      iconMedical: "🏥 医疗点 (Medical)",
      iconToilet: "🚽 厕所 (Toilet)",
      iconInfo: "ℹ️ 咨询处 (Info)",
      iconNone: "(无图标)",
      
      toastAddCp: "已添加新CP点，位置为 ",
      toastAddCpTail: " 公里 ✓",
      toastGpxSuccess: "GPX 载入成功：共 ",
      toastGpxSuccessMid: " 个坐标点，全长 ",
      toastGpxSuccessTail: " 公里 ✓",
      toastGpxError: "GPX 错误：",
      toastImportSuccess: "配置导入成功 ✓",
      toastImportError: "导入格式错误：",
      toastExportSuccess: "配置导出成功 ✓",
      toastGpxFirst: "请先上传比赛路线的 GPX 文件。",
      toastExporting: "正在导出 ",
      toastKeepOne: "必须保留至少一个检查点。",
      toastDeleted: "检查点已删除 ✓",
      toastTemplateSuccess: "模板 JSON 下载成功 ✓",
      newCpName: "新检查点",
      deleteCpTitle: "删除此CP",
      placeholderCpNameInput: "CP名称",
      placeholderTimeInput: "用时 H:MM",
      placeholderNotesInput: "备注",
      placeholderTextNone: "无",
      
      defaultStartName: "起点",
      defaultFinishName: "终点",

      // New Summary & Checklist Keys
      summaryTitle: "📋 计划汇总",
      verificationTitle: "✓ 计划检查",
      labelCourse: "路线",
      labelTemps: "用时",
      labelPlan: "计划",
      labelOptimiste: "乐观",
      labelPessimiste: "悲观",
      labelArriveeEstime: "预计到达",
      labelWaterAvg: "平均水分",
      labelCarbsAvg: "平均碳水",
      labelSodiumAvg: "平均钠",
      labelCaffeineAvg: "平均咖啡因",
      labelWaterTotal: "总水分",
      labelCarbsTotal: "总碳水",
      labelSodiumTotal: "总钠",
      labelCaffeineTotal: "总咖啡因",
      labelSugarCubeEq: "块方糖",
      labelWater: "水分补充 (mL/h)",
      labelCarbs: "碳水化合物 (g/h)",
      labelSodium: "电解质钠 (mg/L)",
      labelCaffeine: "咖啡因 (mg/h)",

      checkDistOk: "检查点距离顺序递增正常",
      checkDistErr: "警告：检查点距离未按递增顺序排列",
      checkFinishOk: "终点距离与路线全长匹配",
      checkFinishWarn: "提示：设定的终点距离与 GPX 全长不完全匹配 (相差较远)",
      checkPacesOk: "各赛段配速估算均合理",
      checkPaceFast: "警告：CP {name} 速度过快 (>25 points/h)",
      checkPaceSlow: "警告：CP {name} 速度过慢 (<2 points/h)",
      checkPaceMissing: "提示：CP {name} 缺失用时",
      checkWaterOk: "平均水分摄入适中 (400-800 mL/h)",
      checkWaterLow: "提示：水分补充偏低 (<400 mL/h)，可能脱水",
      checkWaterHigh: "提示：水分补充过高 (>800 mL/h)，增加胃肠负担",
      checkCarbsOk: "平均碳水摄入达标 (30-100 g/h)",
      checkCarbsLow: "提示：碳水补充偏低 (<30 g/h)，可能能量不足(Bonk)",
      checkCarbsHigh: "提示：碳水补充过高 (>100 g/h)，可能引起肠胃不适",
      checkSodiumOk: "平均电解质/钠浓度合理 (300-700 mg/L)",
      checkSodiumZero: "警告：未配置任何钠补充，容易引起抽筋",
      checkSodiumLow: "提示：平均钠浓度偏低 (<300 mg/L)，容易发生低钠血症",
      checkSodiumHigh: "提示：平均钠浓度偏高 (>700 mg/L)，可能会增加口渴感",
      checkCaffOk: "总咖啡因摄入安全",
      checkCaffHigh: "警告：总咖啡因摄入偏高 (>400 mg)，注意心慌/神经过敏风险",
      checkGpxMissing: "提示：上传 GPX 文件后可自动检查越野爬升和速度"
    },
    en: {
      pageTitle: "🏔️ Talus - Trail Roadbook Generator",
      headerSubtitle: "Trail Roadbook Generator",
      vibeCodedBy: "Vibe coded by",
      uploadGpx: "Upload GPX",
      raceNameLabel: "Race Name",
      importJson: "Import JSON",
      downloadTemplate: "Template",
      exportJson: "Export JSON",
      languageLabel: "🌐 语言 / Language",
      exportRatioLabel: "Aspect Ratio",
      ratioAuto: "Auto-fit (No Padding)",
      ratio19_5_9: "19.5:9 Landscape (iPhone 17/16)",
      ratio20_9: "20:9 Landscape (Xiaomi/Huawei/Android)",
      downloadPng: "Download PNG ▾",
      scale1: "1× Standard",
      scale2: "2× HD (Recommended)",
      scale3: "3× Ultra HD (Print)",
      placeholderText: "Upload a GPX file to generate the elevation profile",
      placeholderTextSub: "Upload a GPX file to generate the elevation profile",
      cpTableTitle: "📍 Checkpoint / CP List",
      colNum: "#",
      colName: "Name",
      colDist: "Distance (km)",
      colIcon: "Primary Icon",
      colTime: "Segment Duration",
      colNotes: "Notes (supports Enter)",
      addCpBtn: "Add Checkpoint",
      poiPanelTitle: "📍 Checkpoint Visual Settings",
      poiTabAdd: "+ Add",
      poiCol1Title: "Basic Info & Font Sizes",
      poiCol1Pos: "CP Distance (km)",
      poiCol1Intermediate: "Use for segment split stats",
      poiCol1FontSizesTitle: "Granular Font Sizes (px)",
      fsLabelTitle: "Race Title",
      fsLabelCpName: "CP Name",
      fsLabelCpElev: "CP Elev",
      fsLabelCpTime: "Time",
      fsLabelCpNotes: "Notes",
      fsLabelSegment: "Segment",
      fsLabelCumulDist: "Cumul Dist",
      poiCol2Title: "Icon Stack Configuration (Max 3)",
      poiCol2Size: "Icon Scale Size",
      poiCol2Rot: "Icon Rotation (°)",
      poiIconGroup0: "Icon 1 (Primary)",
      poiIconGroup1: "Icon 2",
      poiIconGroup2: "Icon 3",
      poiLabelSymbol: "Symbol",
      poiLabelBg: "Bg Color",
      poiLabelGlyph: "Glyph",
      btnWhite: "White",
      btnBlack: "Black",
      poiCol3Title: "Vertical Guide Axis",
      poiCol3Color: "Line Color",
      poiCol3Thickness: "Line Thickness (px)",
      poiCol3Broken: "Break line under curve",
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
      iconFinish: "🔴 Finish",
      iconWater: "💧 Water",
      iconFood: "🍽️ Food",
      iconCutoff: "⚠️ Cutoff",
      iconCp: "📍 Checkpoint (CP)",
      iconChapel: "⛪ Chapel",
      iconDanger: "⚡ Danger",
      iconPeak: "🏔️ Peak",
      iconMedical: "🏥 Medical",
      iconToilet: "🚽 Toilet",
      iconInfo: "ℹ️ Info",
      iconNone: "(No Icon)",
      
      toastAddCp: "Added new Checkpoint at ",
      toastAddCpTail: " km ✓",
      toastGpxSuccess: "GPX loaded successfully: ",
      toastGpxSuccessMid: " trackpoints, total ",
      toastGpxSuccessTail: " km ✓",
      toastGpxError: "GPX Error: ",
      toastImportSuccess: "Configuration imported successfully ✓",
      toastImportError: "Import format error: ",
      toastExportSuccess: "Configuration exported successfully ✓",
      toastGpxFirst: "Please upload the GPX route file first.",
      toastExporting: "Exporting ",
      toastKeepOne: "Must keep at least one checkpoint.",
      toastDeleted: "Checkpoint deleted ✓",
      toastTemplateSuccess: "Template JSON downloaded successfully ✓",
      newCpName: "New Checkpoint",
      deleteCpTitle: "Delete Checkpoint",
      placeholderCpNameInput: "CP Name",
      placeholderTimeInput: "Duration H:MM",
      placeholderNotesInput: "Notes",
      placeholderTextNone: "None",
      
      defaultStartName: "Start",
      defaultFinishName: "Finish",

      // New Summary & Checklist Keys
      summaryTitle: "📋 Plan Summary",
      verificationTitle: "✓ Plan Verification",
      labelCourse: "Course",
      labelTemps: "Duration",
      labelPlan: "Target",
      labelOptimiste: "Optimistic",
      labelPessimiste: "Pessimistic",
      labelArriveeEstime: "Estimated Arrival",
      labelWaterAvg: "Avg Water",
      labelCarbsAvg: "Avg Carbs",
      labelSodiumAvg: "Avg Sodium",
      labelCaffeineAvg: "Avg Caffeine",
      labelWaterTotal: "Total Water",
      labelCarbsTotal: "Total Carbs",
      labelSodiumTotal: "Total Sodium",
      labelCaffeineTotal: "Total Caffeine",
      labelSugarCubeEq: "sugar cubes",
      labelWater: "Water Intake (mL/h)",
      labelCarbs: "Carbohydrates (g/h)",
      labelSodium: "Sodium Conc. (mg/L)",
      labelCaffeine: "Caffeine (mg/h)",

      checkDistOk: "Checkpoint distances are strictly increasing",
      checkDistErr: "Warning: Checkpoint distances are not strictly increasing",
      checkFinishOk: "Finish distance matches GPX total length",
      checkFinishWarn: "Tip: Finish distance does not match GPX total length",
      checkPacesOk: "All segment paces are realistic",
      checkPaceFast: "Warning: CP {name} effort speed is too fast (>25 points/h)",
      checkPaceSlow: "Warning: CP {name} effort speed is too slow (<2 points/h)",
      checkPaceMissing: "Tip: CP {name} segment duration is missing",
      checkWaterOk: "Average hydration rate is balanced (400-800 mL/h)",
      checkWaterLow: "Tip: Hydration is low (<400 mL/h), risk of dehydration",
      checkWaterHigh: "Tip: Hydration is high (>800 mL/h), risk of stomach distress",
      checkCarbsOk: "Carbohydrate intake is on target (30-100 g/h)",
      checkCarbsLow: "Tip: Carbs are low (<30 g/h), risk of bonking",
      checkCarbsHigh: "Tip: Carbs are high (>100 g/h), risk of GI distress",
      checkSodiumOk: "Sodium concentration is balanced (300-700 mg/L)",
      checkSodiumZero: "Warning: No sodium replacement configured, risk of cramping",
      checkSodiumLow: "Tip: Sodium concentration is low (<300 mg/L)",
      checkSodiumHigh: "Tip: Sodium concentration is high (>700 mg/L)",
      checkCaffOk: "Total caffeine is within safe limits",
      checkCaffHigh: "Warning: Total caffeine is high (>400 mg)",
      checkGpxMissing: "Tip: Upload a GPX file to automatically check climb and segment paces"
    }
  };

  function detectLanguage() {
    var lang = navigator.language || navigator.userLanguage || 'en';
    lang = lang.toLowerCase();
    if (lang.indexOf('zh') !== -1) {
      return 'zh';
    }
    return 'en';
  }

  // ── State ──────────────────────────────────────────────────────────
  var state = {
    trackpoints: null,     // parsed GPX data
    gpxFileName: '',
    raceName: '',
    activeCPIndex: 0,      // selected CP in POI editor
    fontSizeTitle: 16,     // Individual roadbook element font sizes (Requested)
    fontSizeCPName: 14,    // Default CP Name to 14px
    fontSizeCPElev: 14,
    fontSizeCPTime: 20,    // Default Expected Time to 20px
    fontSizeCPNotes: 18,   // Default Notes Info to 18px
    fontSizeSegment: 16,
    fontSizeCumulDist: 16,
    imageTheme: 'day',     // preserved for configuration backward compatibility
    language: 'zh',        // active language
    checkpoints: []        // dynamically initialized
  };

  // Helper colors matching profile.js
  var C = {
    iconStart:     '#27ae60',
    iconFinish:    '#c0392b',
    iconWater:     '#2e86c1',
    iconFood:      '#e67e22',
    iconCutoff:    '#e74c3c',
    iconDefault:   '#5b7db1',
    cpLine:        'rgba(120,120,140,0.30)',
    cpLineStart:   '#27ae60',
    cpLineFinish:  '#c0392b',
  };

  function getLegacyIconColor(symbol) {
    switch (symbol) {
      case 'start':   return C.iconStart;
      case 'finish':  return C.iconFinish;
      case 'water':   return C.iconWater;
      case 'food':    return C.iconFood;
      case 'cutoff':  return C.iconCutoff;
      default:        return C.iconDefault;
    }
  }

  function getLegacyCPLineColor(symbol) {
    switch (symbol) {
      case 'start':  return C.cpLineStart;
      case 'finish': return C.cpLineFinish;
      default:       return C.cpLine;
    }
  }

  // Schema normalization
  function normalizeCP(cp, idx) {
    if (cp.useForIntermediateDistances === undefined) cp.useForIntermediateDistances = true;
    if (cp.iconSize === undefined) cp.iconSize = 20;
    if (cp.iconRotation === undefined) cp.iconRotation = 0;

    if (!cp.icons || !Array.isArray(cp.icons)) {
      var sym = cp.icon || (idx === 0 ? 'start' : 'cp');
      cp.icons = [
        { symbol: sym, color: getLegacyIconColor(sym), iconColor: 'White' },
        { symbol: '', color: '#4e4e4e', iconColor: 'White' },
        { symbol: '', color: '#4e4e4e', iconColor: 'White' }
      ];
    }
    // Deep clone icons array just in case
    cp.icons = cp.icons.map(function (ico) {
      return {
        symbol: ico.symbol || '',
        color: ico.color || '#4e4e4e',
        iconColor: ico.iconColor || 'White'
      };
    });

    if (cp.axisColor === undefined) cp.axisColor = getLegacyCPLineColor(cp.icons[0].symbol);
    if (cp.axisThickness === undefined) cp.axisThickness = 1; // Default to 1px
    if (cp.axisBroken === undefined) cp.axisBroken = true; // Default broken gap to true

    if (cp.textColor === undefined) cp.textColor = '#1e293b';
    if (cp.textSize === undefined) cp.textSize = 18; // Default inside chart text size to 18px
    if (cp.textOrientation === undefined) cp.textOrientation = 'To the right';

    if (!cp.texts) {
      cp.texts = {
        leftBottom: '', leftMiddle: '', leftTop: '',
        rightBottom: '', rightMiddle: '', rightTop: ''
      };
    }
    if (cp.arrivalTime === undefined) {
      cp.arrivalTime = '';
    }
    if (cp.segmentTime === undefined) {
      cp.segmentTime = '';
    }
    if (cp.water === undefined) cp.water = 0;
    if (cp.carbs === undefined) cp.carbs = 0;
    if (cp.sodium === undefined) cp.sodium = 0;
    if (cp.caffeine === undefined) cp.caffeine = 0;

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
        cumul += seg;
        cp.arrivalTime = TR.utils.formatTime(cumul);
      }
    });
  }

  function normalizeAllCPs() {
    var prevCumul = 0;
    state.checkpoints.forEach(function (cp, idx) {
      normalizeCP(cp, idx);
      
      // Calculate segmentTime from arrivalTime if segmentTime is not defined (backward compatibility)
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
        if (idx === 0) {
          prevCumul = 0;
        } else {
          prevCumul += TR.utils.parseTime(cp.segmentTime);
        }
      }
    });

    updateArrivalTimes();
  }

  // ── DOM references ──────────────────────────────────────────────────
  var dom = {};

  function init() {
    dom.btnGpx       = document.getElementById('btn-gpx');
    dom.inputGpx     = document.getElementById('input-gpx');
    dom.inputName    = document.getElementById('input-name');
    dom.btnImport    = document.getElementById('btn-import');
    dom.inputJson    = document.getElementById('input-json');
    dom.btnTemplateJson = document.getElementById('btn-template-json');
    dom.btnExportJson= document.getElementById('btn-export-json');
    dom.btnExportImg = document.getElementById('btn-export-img');
    dom.exportMenu   = document.getElementById('export-menu');
    dom.exportRatio  = document.getElementById('export-ratio');
    dom.selectLang   = document.getElementById('select-lang');
    dom.profileContainer = document.getElementById('profile-container');
    dom.placeholder  = document.getElementById('profile-placeholder');
    dom.cpTbody      = document.getElementById('cp-tbody');
    dom.btnAddCp     = document.getElementById('btn-add-cp');
    dom.toast        = document.getElementById('toast');

    // POI Editor Panel references
    dom.poiPanel          = document.getElementById('poi-panel');
    dom.poiTabs           = document.getElementById('poi-tabs');
    dom.btnPoiTabUp       = document.getElementById('btn-poi-tab-up');
    dom.btnPoiTabDown     = document.getElementById('btn-poi-tab-down');
    dom.poiIntermediate   = document.getElementById('poi-intermediate');
    dom.poiPosition       = document.getElementById('poi-position');
    dom.poiIconSize       = document.getElementById('poi-icon-size');
    dom.poiIconRotation   = document.getElementById('poi-icon-rotation');

    // Linking CP details input fields in right pane
    dom.poiNameDetail     = document.getElementById('poi-name-detail');
    dom.poiTimeDetail     = document.getElementById('poi-time-detail');
    dom.poiNotesDetail    = document.getElementById('poi-notes-detail');
    dom.poiWater          = document.getElementById('poi-water');
    dom.poiCarbs          = document.getElementById('poi-carbs');
    dom.poiSodium         = document.getElementById('poi-sodium');
    dom.poiCaffeine       = document.getElementById('poi-caffeine');
    dom.inputStartTime    = document.getElementById('input-start-time');
    dom.summaryContent    = document.getElementById('summary-content');
    dom.checksContent     = document.getElementById('checks-content');

    // Granular roadbook element font size controls (Requested)
    dom.fsTitle       = document.getElementById('fs-title');
    dom.fsCPName      = document.getElementById('fs-cpname');
    dom.fsCPElev      = document.getElementById('fs-cpelev');
    dom.fsCPTime      = document.getElementById('fs-cptime');
    dom.fsCPNotes     = document.getElementById('fs-cpnotes');
    dom.fsSegment     = document.getElementById('fs-segment');
    dom.fsCumulDist   = document.getElementById('fs-cumuldist');

    dom.poiAxisColor      = document.getElementById('poi-axis-color');
    dom.poiAxisColorHex   = document.getElementById('poi-axis-color-hex');
    dom.poiAxisThickness   = document.getElementById('poi-axis-thickness');
    dom.poiAxisBroken     = document.getElementById('poi-axis-broken');

    dom.poiTextColor      = document.getElementById('poi-text-color');
    dom.poiTextColorHex   = document.getElementById('poi-text-color-hex');
    dom.poiTextSize       = document.getElementById('poi-text-size');
    dom.poiTextOrientation = document.getElementById('poi-text-orientation');

    dom.poiTxtLeftBottom  = document.getElementById('poi-txt-left-bottom');
    dom.poiTxtLeftMiddle  = document.getElementById('poi-txt-left-middle');
    dom.poiTxtLeftTop     = document.getElementById('poi-txt-left-top');
    dom.poiTxtRightBottom = document.getElementById('poi-txt-right-bottom');
    dom.poiTxtRightMiddle = document.getElementById('poi-txt-right-middle');
    dom.poiTxtRightTop    = document.getElementById('poi-txt-right-top');

    // Detect browser language and initialize dynamic checkpoints
    state.language = detectLanguage();
    if (state.checkpoints.length === 0) {
      var isZH = (state.language === 'zh');
      state.checkpoints = [
        { name: isZH ? '起点' : 'Start',  distance: 0, icon: 'start',  arrivalTime: '0:00', notes: '' },
        { name: isZH ? '终点' : 'Finish', distance: 0, icon: 'finish', arrivalTime: '', notes: '' }
      ];
    }

    populateStartTimeOptions('周五 18:00');
    state.startTime = dom.inputStartTime ? dom.inputStartTime.value : '周五 18:00';
    normalizeAllCPs();
    bindEvents();
    bindPOIEvents();
    applyLanguage(); // Automatically translates all static HTML on first load
  }

  // ── Event Bindings ──────────────────────────────────────────────────
  function bindEvents() {
    // GPX upload
    dom.btnGpx.addEventListener('click', function () { dom.inputGpx.click(); });
    dom.inputGpx.addEventListener('change', handleGpxUpload);

    // Race name
    dom.inputName.addEventListener('input', function () {
      state.raceName = this.value;
      scheduleRender();
    });

    // Start time
    if (dom.inputStartTime) {
      dom.inputStartTime.addEventListener('change', function () {
        state.startTime = this.value;
        scheduleRender();
      });
    }

    // JSON import
    dom.btnImport.addEventListener('click', function () { dom.inputJson.click(); });
    dom.inputJson.addEventListener('change', handleJsonImport);
    dom.btnTemplateJson.addEventListener('click', handleJsonTemplateDownload);

    // JSON export
    dom.btnExportJson.addEventListener('click', handleJsonExport);

    // Language selector change
    dom.selectLang.addEventListener('change', function () {
      state.language = this.value;
      applyLanguage();
    });

    // Image export dropdown
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

    // Add CP Point (Inserting after active CP)
    dom.btnAddCp.addEventListener('click', handleAddCP);

    // Image export ratio change triggers live preview update (Requested)
    dom.exportRatio.addEventListener('change', scheduleRender);
  }

  // Add CP point immediately after the selected active CP
  function handleAddCP() {
    var activeCP = state.checkpoints[state.activeCPIndex];
    var newDist = 0;
    if (activeCP) {
      // Find the next CP in terms of distance
      var sorted = state.checkpoints.slice().sort(function (a, b) { return a.distance - b.distance; });
      var activeIdxInSorted = sorted.indexOf(activeCP);
      if (activeIdxInSorted !== -1 && activeIdxInSorted < sorted.length - 1) {
        // Place halfway between active and next
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
      icon: 'water',
      arrivalTime: '',
      notes: ''
    }, state.checkpoints.length);

    state.checkpoints.push(newCP);
    
    // Sort all checkpoints by distance
    sortCheckpoints();
    normalizeAllCPs();

    // Select the newly added CP as active
    state.activeCPIndex = state.checkpoints.indexOf(newCP);

    renderCPTable();
    renderPOITabs();
    loadActiveCPDetails();
    scheduleRender();
    toast(T[state.language].toastAddCp + newDist + T[state.language].toastAddCpTail);
  }

  function sortCheckpoints() {
    state.checkpoints.sort(function (a, b) { return a.distance - b.distance; });
  }

  // ── GPX Upload ──────────────────────────────────────────────────────
  function handleGpxUpload() {
    var file = dom.inputGpx.files[0];
    if (!file) return;
    state.gpxFileName = file.name;

    TR.gpxParser.parseFile(file).then(function (pts) {
      state.trackpoints = pts;
      // Auto-set finish distance
      var totalDist = pts[pts.length - 1].distance;
      state.checkpoints.forEach(function (cp) {
        if (cp.icons && cp.icons[0] && cp.icons[0].symbol === 'finish' && cp.distance === 0) {
          cp.distance = Math.round(totalDist * 100) / 100;
        } else if (cp.icon === 'finish' && cp.distance === 0) {
          cp.distance = Math.round(totalDist * 100) / 100;
        }
      });
      sortCheckpoints();
      normalizeAllCPs();
      renderCPTable();
      renderPOITabs();
      loadActiveCPDetails();
      renderProfile();
      toast(T[state.language].toastGpxSuccess + pts.length + T[state.language].toastGpxSuccessMid + totalDist.toFixed(1) + T[state.language].toastGpxSuccessTail);
    }).catch(function (err) {
      toast(T[state.language].toastGpxError + err.message);
    });

    dom.inputGpx.value = '';
  }

  // ── JSON Import / Export ────────────────────────────────────────────
  function handleJsonImport() {
    var file = dom.inputJson.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var data = JSON.parse(e.target.result);
        if (data.raceName) {
          state.raceName = data.raceName;
          dom.inputName.value = data.raceName;
        }
        if (data.globalFontSize) {
          var gfs = parseInt(data.globalFontSize, 10) || 13;
          state.fontSizeTitle     = gfs + 5;
          state.fontSizeCPName    = gfs - 1;
          state.fontSizeCPElev    = gfs - 2;
          state.fontSizeCPTime    = gfs - 2;
          state.fontSizeCPNotes   = gfs - 3;
          state.fontSizeSegment   = gfs - 2;
          state.fontSizeCumulDist = gfs - 1;
        }
        if (data.fontSizeTitle)     state.fontSizeTitle     = parseInt(data.fontSizeTitle, 10);
        if (data.fontSizeCPName)    state.fontSizeCPName    = parseInt(data.fontSizeCPName, 10);
        if (data.fontSizeCPElev)    state.fontSizeCPElev    = parseInt(data.fontSizeCPElev, 10);
        if (data.fontSizeCPTime)    state.fontSizeCPTime    = parseInt(data.fontSizeCPTime, 10);
        if (data.fontSizeCPNotes)   state.fontSizeCPNotes   = parseInt(data.fontSizeCPNotes, 10);
        if (data.fontSizeSegment)   state.fontSizeSegment   = parseInt(data.fontSizeSegment, 10);
        if (data.fontSizeCumulDist) state.fontSizeCumulDist = parseInt(data.fontSizeCumulDist, 10);

        if (data.imageTheme) {
          state.imageTheme = data.imageTheme;
        }
        if (data.language) {
          state.language = data.language;
        }
        if (data.startTime) {
          state.startTime = data.startTime;
          populateStartTimeOptions(data.startTime);
        }
        if (Array.isArray(data.checkpoints)) {
          state.checkpoints = data.checkpoints;
        }
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
      fontSizeTitle: state.fontSizeTitle,
      fontSizeCPName: state.fontSizeCPName,
      fontSizeCPElev: state.fontSizeCPElev,
      fontSizeCPTime: state.fontSizeCPTime,
      fontSizeCPNotes: state.fontSizeCPNotes,
      fontSizeSegment: state.fontSizeSegment,
      fontSizeCumulDist: state.fontSizeCumulDist,
      imageTheme: state.imageTheme,
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

  // ── Image Export ────────────────────────────────────────────────────
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

  // ── CP Table Rendering ──────────────────────────────────────────────
  function renderCPTable() {
    dom.cpTbody.innerHTML = '';
    
    var sortedCps = state.checkpoints.slice();
    var lang = state.language;
    
    sortedCps.forEach(function (cp, idx) {
      var globalIdx = state.checkpoints.indexOf(cp);
      var isSelected = (globalIdx === state.activeCPIndex);
      var tr = document.createElement('tr');
      if (isSelected) tr.classList.add('selected-row');
      
      // Dynamic sequence label: S, 1, 2, 3..., F
      var seqLabel = (idx === 0) ? 'S' : (idx === sortedCps.length - 1 ? 'F' : idx);

      var detailsHtml = '';
      if (idx > 0) {
        var cpPrev = sortedCps[idx - 1];
        var cpCurr = cp;
        var segDist = cpCurr.distance - cpPrev.distance;
        var segDPlus = 0;
        var segDMinus = 0;
        if (state.trackpoints && state.trackpoints.length > 0) {
          var stats = TR.utils.segmentStats(state.trackpoints, cpPrev.distance, cpCurr.distance);
          segDPlus = stats.dPlus;
          segDMinus = stats.dMinus;
        }
        var segTimeMins = TR.utils.parseTime(cpCurr.segmentTime || '');
        var segHours = segTimeMins / 60;
        
        var targetTimeStr = TR.utils.formatTime(segTimeMins);
        var segEffortDist = segDist + (segDPlus / 100);
        var targetRate = segTimeMins > 0 ? (segEffortDist / segHours).toFixed(1) : '0.0';
        
        // Nutrition hourly targets
        var water = cpCurr.water || 0;
        var carbs = cpCurr.carbs || 0;
        var sodium = cpCurr.sodium || 0;
        var caffeine = cpCurr.caffeine || 0;
        
        detailsHtml = 
          '<td class="col-details">' +
          '  <div class="seg-stats-row">' +
          '    <span>' + segDist.toFixed(1) + ' km</span> · ' +
          '    <span class="gain">+' + Math.round(segDPlus) + 'm</span> · ' +
          '    <span class="loss">-' + Math.round(segDMinus) + 'm</span> · ' +
          '    <span>⏱ ' + targetTimeStr + '</span> · ' +
          '    <span class="pace">' + targetRate + ' pts/h</span>' +
          '  </div>' +
          '  <div class="seg-nut-row">' +
          '    <span class="nut-label">Nutrition</span>' +
          '    <span class="nut-val nut-water">' + water + ' mL/h</span>' +
          '    <span class="nut-val nut-carbs">' + carbs + ' g/h</span>' +
          '    <span class="nut-val nut-sodium">' + sodium + ' mg/L</span>' +
          '    <span class="nut-val nut-caff">' + caffeine + ' mg/h</span>' +
          '  </div>' +
          '</td>';
      }

      tr.innerHTML =
        '<td class="col-num">' + seqLabel + '</td>' +
        '<td class="col-name"><input type="text" data-idx="' + globalIdx + '" data-field="name" value="' + esc(cp.name) + '" placeholder="' + T[lang].placeholderCpNameInput + '"></td>' +
        '<td class="col-dist"><input type="number" data-idx="' + globalIdx + '" data-field="distance" value="' + cp.distance + '" step="0.1" min="0" placeholder="0.0"></td>' +
        '<td class="col-time"><input type="text" data-idx="' + globalIdx + '" data-field="segmentTime" value="' + esc(cp.segmentTime || '') + '" placeholder="' + T[lang].placeholderTimeInput + '"' + (idx === 0 ? ' disabled' : '') + '></td>' +
        '<td class="col-action"><button class="btn-delete" data-idx="' + globalIdx + '" title="' + T[lang].deleteCpTitle + '">✕</button></td>' +
        detailsHtml;
      
      // Highlight row on click
      tr.addEventListener('click', function (e) {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'BUTTON') {
          state.activeCPIndex = globalIdx;
          renderCPTable();
          renderPOITabs();
          loadActiveCPDetails();
        }
      });

      dom.cpTbody.appendChild(tr);
    });

    // Bind events on inputs
    dom.cpTbody.querySelectorAll('input, select, textarea').forEach(function (el) {
      el.addEventListener('change', handleCPTableChange);
      el.addEventListener('input', handleCPTableChange);
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
    var idx   = parseInt(e.target.dataset.idx, 10);
    var field = e.target.dataset.field;
    var val   = e.target.value;

    if (field === 'distance') {
      val = parseFloat(val) || 0;
      state.checkpoints[idx].distance = val;
      
      var curCP = state.checkpoints[idx];
      sortCheckpoints();
      state.activeCPIndex = state.checkpoints.indexOf(curCP);
      updateArrivalTimes();
      renderCPTable();
      renderPOITabs();
    } else if (field === 'segmentTime') {
      state.checkpoints[idx].segmentTime = val;
      updateArrivalTimes();
      renderCPTable();
    } else if (field === 'icon') {
      state.checkpoints[idx].icons[0].symbol = val;
      state.checkpoints[idx].icons[0].color = getLegacyIconColor(val);
      state.checkpoints[idx].axisColor = getLegacyCPLineColor(val);
    } else {
      state.checkpoints[idx][field] = val;
    }

    loadActiveCPDetails();
    scheduleRender();
  }

  function handleDeleteCP(idx) {
    if (state.checkpoints.length <= 1) {
      toast(T[state.language].toastKeepOne);
      return;
    }
    state.checkpoints.splice(idx, 1);
    
    // Adjust active index
    if (state.activeCPIndex >= state.checkpoints.length) {
      state.activeCPIndex = state.checkpoints.length - 1;
    }
    
    sortCheckpoints();
    normalizeAllCPs();
    renderCPTable();
    renderPOITabs();
    loadActiveCPDetails();
    scheduleRender();
    toast(T[state.language].toastDeleted);
  }

  function iconOptions(selected) {
    var lang = state.language;
    var dict = T[lang];
    var opts = [
      ['start',  dict.iconStart],
      ['finish', dict.iconFinish],
      ['water',  dict.iconWater],
      ['food',   dict.iconFood],
      ['cutoff', dict.iconCutoff],
      ['cp',     dict.iconCp],
      ['chapel', dict.iconChapel],
      ['danger', dict.iconDanger],
      ['peak',   dict.iconPeak],
      ['medical',dict.iconMedical],
      ['toilet', dict.iconToilet],
      ['info',   dict.iconInfo]
    ];
    return opts.map(function (o) {
      return '<option value="' + o[0] + '"' + (o[0] === selected ? ' selected' : '') + '>' + o[1] + '</option>';
    }).join('');
  }

  function esc(str) {
    if (!str) return '';
    return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ── Points of Interest Sidebar Panel ───────────────────────────────
  function bindPOIEvents() {
    // Horizontal Tab scroll (left/right)
    if (dom.btnPoiTabUp) {
      dom.btnPoiTabUp.addEventListener('click', function () {
        dom.poiTabs.scrollLeft -= 80;
      });
    }
    if (dom.btnPoiTabDown) {
      dom.btnPoiTabDown.addEventListener('click', function () {
        dom.poiTabs.scrollLeft += 80;
      });
    }

    // Bidirectional sync for Right-side CP Details Panel inputs
    if (dom.poiNameDetail) {
      dom.poiNameDetail.addEventListener('input', function () {
        var activeCP = state.checkpoints[state.activeCPIndex];
        if (activeCP) {
          activeCP.name = this.value;
          renderCPTable(); // Sync to left table
          scheduleRender(); // Redraw chart
        }
      });
    }
    if (dom.poiTimeDetail) {
      dom.poiTimeDetail.addEventListener('input', function () {
        var activeCP = state.checkpoints[state.activeCPIndex];
        if (activeCP) {
          activeCP.arrivalTime = this.value;
          renderCPTable(); // Sync to left table
          scheduleRender(); // Redraw chart
        }
      });
    }
    if (dom.poiNotesDetail) {
      dom.poiNotesDetail.addEventListener('input', function () {
        var activeCP = state.checkpoints[state.activeCPIndex];
        if (activeCP) {
          activeCP.notes = this.value;
          renderCPTable(); // Sync to left table
          scheduleRender(); // Redraw chart
        }
      });
    }

    // Bidirectional color picker binding
    function bindColorPicker(pickerEl, hexEl, updateCallback) {
      pickerEl.addEventListener('input', function () {
        hexEl.value = this.value;
        updateCallback(this.value);
      });
      hexEl.addEventListener('change', function () {
        var val = this.value;
        if (/^#[0-9A-F]{6}$/i.test(val)) {
          pickerEl.value = val;
          updateCallback(val);
        }
      });
    }

    // Bind Axis color
    bindColorPicker(dom.poiAxisColor, dom.poiAxisColorHex, function (col) {
      var activeCP = state.checkpoints[state.activeCPIndex];
      if (activeCP) {
        activeCP.axisColor = col;
        scheduleRender();
      }
    });

    // Bind Text color
    bindColorPicker(dom.poiTextColor, dom.poiTextColorHex, function (col) {
      var activeCP = state.checkpoints[state.activeCPIndex];
      if (activeCP) {
        activeCP.textColor = col;
        scheduleRender();
      }
    });

    // Bind 7 Granular Font Size number inputs (Requested)
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
      var inputEl = document.getElementById(id);
      if (inputEl) {
        var handler = function () {
          state[fsMap[id]] = parseInt(this.value, 10) || 10;
          scheduleRender();
        };
        inputEl.addEventListener('change', handler);
        inputEl.addEventListener('input', handler);
      }
    });

    // Form fields changes
    dom.poiIntermediate.addEventListener('change', function () {
      var activeCP = state.checkpoints[state.activeCPIndex];
      if (activeCP) {
        activeCP.useForIntermediateDistances = this.checked;
        scheduleRender();
      }
    });

    dom.poiPosition.addEventListener('change', function () {
      var activeCP = state.checkpoints[state.activeCPIndex];
      if (activeCP) {
        activeCP.distance = parseFloat(this.value) || 0;
        sortCheckpoints();
        state.activeCPIndex = state.checkpoints.indexOf(activeCP);
        renderCPTable();
        renderPOITabs();
        scheduleRender();
      }
    });

    var handlerIconSize = function () {
      var activeCP = state.checkpoints[state.activeCPIndex];
      if (activeCP) {
        activeCP.iconSize = parseInt(this.value, 10) || 20;
        scheduleRender();
      }
    };
    dom.poiIconSize.addEventListener('change', handlerIconSize);
    dom.poiIconSize.addEventListener('input', handlerIconSize);

    var handlerIconRotation = function () {
      var activeCP = state.checkpoints[state.activeCPIndex];
      if (activeCP) {
        activeCP.iconRotation = parseInt(this.value, 10) || 0;
        scheduleRender();
      }
    };
    dom.poiIconRotation.addEventListener('change', handlerIconRotation);
    dom.poiIconRotation.addEventListener('input', handlerIconRotation);

    var handlerAxisThickness = function () {
      var activeCP = state.checkpoints[state.activeCPIndex];
      if (activeCP) {
        activeCP.axisThickness = parseInt(this.value, 10) || 1;
        scheduleRender();
      }
    };
    dom.poiAxisThickness.addEventListener('change', handlerAxisThickness);
    dom.poiAxisThickness.addEventListener('input', handlerAxisThickness);

    if (dom.poiAxisBroken) {
      dom.poiAxisBroken.addEventListener('change', function () {
        var activeCP = state.checkpoints[state.activeCPIndex];
        if (activeCP) {
          activeCP.axisBroken = this.checked;
          scheduleRender();
        }
      });
    }

    var handlerTextSize = function () {
      var activeCP = state.checkpoints[state.activeCPIndex];
      if (activeCP) {
        activeCP.textSize = parseInt(this.value, 10) || 18;
        scheduleRender();
      }
    };
    dom.poiTextSize.addEventListener('change', handlerTextSize);
    dom.poiTextSize.addEventListener('input', handlerTextSize);

    dom.poiTextOrientation.addEventListener('change', function () {
      var activeCP = state.checkpoints[state.activeCPIndex];
      if (activeCP) {
        activeCP.textOrientation = this.value;
        scheduleRender();
      }
    });

    // Associated texts input bindings
    var textMap = {
      'poi-txt-left-bottom': 'leftBottom',
      'poi-txt-left-middle': 'leftMiddle',
      'poi-txt-left-top':    'leftTop',
      'poi-txt-right-bottom':'rightBottom',
      'poi-txt-right-middle':'rightMiddle',
      'poi-txt-right-top':   'rightTop'
    };
    Object.keys(textMap).forEach(function (id) {
      document.getElementById(id).addEventListener('input', function () {
        var activeCP = state.checkpoints[state.activeCPIndex];
        if (activeCP) {
          activeCP.texts[textMap[id]] = this.value;
          scheduleRender();
        }
      });
    });

    // Icon Row bindings (Icon 1, 2, 3)
    dom.poiPanel.querySelectorAll('.poi-icon-group').forEach(function (groupEl) {
      var iconIdx = parseInt(groupEl.dataset.iconIndex, 10);
      var symbolSelect = groupEl.querySelector('.poi-symbol-select');

      symbolSelect.addEventListener('change', function () {
        var activeCP = state.checkpoints[state.activeCPIndex];
        if (activeCP) {
          activeCP.icons[iconIdx].symbol = this.value;
          renderCPTable();
          scheduleRender();
        }
      });
    });

    // Nutrition inputs bindings
    if (dom.poiWater) {
      dom.poiWater.addEventListener('change', function () {
        var activeCP = state.checkpoints[state.activeCPIndex];
        if (activeCP) {
          activeCP.water = parseFloat(this.value) || 0;
          renderCPTable();
          scheduleRender();
        }
      });
    }
    if (dom.poiCarbs) {
      dom.poiCarbs.addEventListener('change', function () {
        var activeCP = state.checkpoints[state.activeCPIndex];
        if (activeCP) {
          activeCP.carbs = parseFloat(this.value) || 0;
          renderCPTable();
          scheduleRender();
        }
      });
    }
    if (dom.poiSodium) {
      dom.poiSodium.addEventListener('change', function () {
        var activeCP = state.checkpoints[state.activeCPIndex];
        if (activeCP) {
          activeCP.sodium = parseFloat(this.value) || 0;
          renderCPTable();
          scheduleRender();
        }
      });
    }
    if (dom.poiCaffeine) {
      dom.poiCaffeine.addEventListener('change', function () {
        var activeCP = state.checkpoints[state.activeCPIndex];
        if (activeCP) {
          activeCP.caffeine = parseFloat(this.value) || 0;
          renderCPTable();
          scheduleRender();
        }
      });
    }
  }

  // Render navigation tabs in POI panel
  function renderPOITabs() {
    if (!dom.poiTabs) return;
    dom.poiTabs.innerHTML = '';
    var lang = state.language;
    
    state.checkpoints.forEach(function (cp, idx) {
      var isSelected = (idx === state.activeCPIndex);
      var tab = document.createElement('button');
      tab.className = 'poi-tab' + (isSelected ? ' active' : '');
      
      // Auto Label CP (S / 1 / 2... / F)
      var seqLabel = (idx === 0) ? 'S' : (idx === state.checkpoints.length - 1 ? 'F' : idx);
      tab.textContent = seqLabel + ': ' + (cp.distance.toFixed(1)) + 'k';
      
      tab.addEventListener('click', function () {
        state.activeCPIndex = idx;
        renderCPTable();
        renderPOITabs();
        loadActiveCPDetails();
      });
      dom.poiTabs.appendChild(tab);
    });

    var addTab = document.createElement('button');
    addTab.className = 'poi-tab poi-tab-add';
    addTab.textContent = T[lang].poiTabAdd;
    addTab.addEventListener('click', handleAddCP);
    dom.poiTabs.appendChild(addTab);
  }

  // Helper to sync select values and create custom options if needed
  function syncSelectValue(selectEl, value) {
    if (!selectEl) return;
    var valStr = String(value);
    // Check if option exists
    var exists = false;
    for (var i = 0; i < selectEl.options.length; i++) {
      if (selectEl.options[i].value === valStr) {
        exists = true;
        break;
      }
    }
    if (!exists && valStr && valStr !== '0' && valStr !== 'undefined') {
      var opt = document.createElement('option');
      opt.value = valStr;
      var suffix = '';
      if (selectEl.id === 'poi-water') suffix = ' mL/h';
      else if (selectEl.id === 'poi-carbs') suffix = ' g/h';
      else if (selectEl.id === 'poi-sodium') suffix = ' mg/L';
      else if (selectEl.id === 'poi-caffeine') suffix = ' mg/h';
      opt.textContent = valStr + suffix;
      selectEl.appendChild(opt);
    }
    selectEl.value = valStr;
  }

  // Load details of the active CP into form controls
  function loadActiveCPDetails() {
    var cp = state.checkpoints[state.activeCPIndex];
    if (!cp) return;

    dom.poiIntermediate.checked = !!cp.useForIntermediateDistances;
    dom.poiPosition.value = cp.distance;
    dom.poiIconSize.value = cp.iconSize;
    dom.poiIconRotation.value = cp.iconRotation;

    // Basic CP details input synchronization
    if (dom.poiNameDetail) dom.poiNameDetail.value = cp.name || '';
    if (dom.poiTimeDetail) {
      dom.poiTimeDetail.value = cp.segmentTime || '';
      dom.poiTimeDetail.disabled = (state.activeCPIndex === 0);
    }
    if (dom.poiNotesDetail) dom.poiNotesDetail.value = cp.notes || '';

    // Nutrition details sync (Sisyf style select dropdowns)
    syncSelectValue(dom.poiWater, cp.water || 0);
    syncSelectValue(dom.poiCarbs, cp.carbs || 0);
    syncSelectValue(dom.poiSodium, cp.sodium || 0);
    syncSelectValue(dom.poiCaffeine, cp.caffeine || 0);

    // Granular Font Sizes sync (Requested)
    if (dom.fsTitle) dom.fsTitle.value = state.fontSizeTitle;
    if (dom.fsCPName) dom.fsCPName.value = state.fontSizeCPName;
    if (dom.fsCPElev) dom.fsCPElev.value = state.fontSizeCPElev;
    if (dom.fsCPTime) dom.fsCPTime.value = state.fontSizeCPTime;
    if (dom.fsCPNotes) dom.fsCPNotes.value = state.fontSizeCPNotes;
    if (dom.fsSegment) dom.fsSegment.value = state.fontSizeSegment;
    if (dom.fsCumulDist) dom.fsCumulDist.value = state.fontSizeCumulDist;

    // Axis settings
    dom.poiAxisColor.value = cp.axisColor || '#4e4e4e';
    dom.poiAxisColorHex.value = cp.axisColor || '#4e4e4e';
    dom.poiAxisThickness.value = cp.axisThickness;
    if (dom.poiAxisBroken) dom.poiAxisBroken.checked = !!cp.axisBroken;

    // Associated texts
    dom.poiTextColor.value = cp.textColor || '#4e4e4e';
    dom.poiTextColorHex.value = cp.textColor || '#4e4e4e';
    dom.poiTextSize.value = cp.textSize;
    dom.poiTextOrientation.value = cp.textOrientation || 'To the right';

    dom.poiTxtLeftBottom.value  = cp.texts.leftBottom || '';
    dom.poiTxtLeftMiddle.value  = cp.texts.leftMiddle || '';
    dom.poiTxtLeftTop.value     = cp.texts.leftTop || '';
    dom.poiTxtRightBottom.value = cp.texts.rightBottom || '';
    dom.poiTxtRightMiddle.value = cp.texts.rightMiddle || '';
    dom.poiTxtRightTop.value    = cp.texts.rightTop || '';

    // Load multiple icons row values
    dom.poiPanel.querySelectorAll('.poi-icon-group').forEach(function (groupEl) {
      var iconIdx = parseInt(groupEl.dataset.iconIndex, 10);
      var ico = cp.icons[iconIdx] || { symbol: '', color: '#4e4e4e', iconColor: 'White' };

      groupEl.querySelector('.poi-symbol-select').value = ico.symbol;
    });
  }

  // ── Start Time Parsing & Arrival formatting ───────────────────────────
  function parseStartTime(str) {
    str = (str || '周五 18:00').toLowerCase();
    var dayOffset = 4; // Default Friday (0 = Mon, 1 = Tue, 2 = Wed, 3 = Thu, 4 = Fri, 5 = Sat, 6 = Sun)
    
    if (str.indexOf('mon') !== -1 || str.indexOf('一') !== -1 || str.indexOf('lun') !== -1) dayOffset = 0;
    else if (str.indexOf('tue') !== -1 || str.indexOf('二') !== -1 || str.indexOf('mar') !== -1) dayOffset = 1;
    else if (str.indexOf('wed') !== -1 || str.indexOf('三') !== -1 || str.indexOf('mer') !== -1) dayOffset = 2;
    else if (str.indexOf('thu') !== -1 || str.indexOf('四') !== -1 || str.indexOf('jeu') !== -1) dayOffset = 3;
    else if (str.indexOf('fri') !== -1 || str.indexOf('五') !== -1 || str.indexOf('ven') !== -1) dayOffset = 4;
    else if (str.indexOf('sat') !== -1 || str.indexOf('六') !== -1 || str.indexOf('sam') !== -1) dayOffset = 5;
    else if (str.indexOf('sun') !== -1 || str.indexOf('日') !== -1 || str.indexOf('dim') !== -1) dayOffset = 6;
    
    var timeMatch = str.match(/(\d{1,2})[:：](\d{2})/);
    var hour = 6; // Default 6:00
    var min = 0;
    if (timeMatch) {
      hour = parseInt(timeMatch[1], 10);
      min = parseInt(timeMatch[2], 10);
    }
    
    return { dayOffset: dayOffset, hour: hour, min: min };
  }

  function formatArrivalTime(startInfo, durationMinutes, lang) {
    var totalMins = startInfo.dayOffset * 24 * 60 + startInfo.hour * 60 + startInfo.min + durationMinutes;
    var day = Math.floor(totalMins / (24 * 60)) % 7;
    var restMins = totalMins % (24 * 60);
    var hour = Math.floor(restMins / 60);
    var min = restMins % 60;
    
    var daysZH = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    var daysEN = ['Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.', 'Sun.'];
    var daysFR = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.']; // Sisyf style french
    
    var dayStr = '';
    if (lang === 'zh') dayStr = daysZH[day];
    else if (lang === 'fr') dayStr = daysFR[day];
    else dayStr = daysEN[day];
    
    return dayStr + ' ' + (hour < 10 ? '0' : '') + hour + ':' + (min < 10 ? '0' : '') + min;
  }

  // ── Update Summary Panel and Verification Checklist ───────────────────
  function updateSummaryAndChecks() {
    if (!dom.summaryContent || !dom.checksContent) return;
    
    var lang = state.language;
    var dict = T[lang];

    // 1. Gather stats
    var totalDist = 0;
    var totalDPlus = 0;
    var totalDMinus = 0;

    if (state.trackpoints && state.trackpoints.length > 0) {
      var stats = TR.utils.segmentStats(state.trackpoints, 0, state.trackpoints[state.trackpoints.length - 1].distance);
      totalDist = stats.distance;
      totalDPlus = stats.dPlus;
      totalDMinus = stats.dMinus;
    } else {
      if (state.checkpoints.length > 0) {
        totalDist = state.checkpoints[state.checkpoints.length - 1].distance;
      }
    }

    // Target Time (base prediction)
    var totalTargetMinutes = 0;
    state.checkpoints.forEach(function (cp, idx) {
      if (idx > 0) {
        totalTargetMinutes += TR.utils.parseTime(cp.segmentTime || '');
      }
    });

    var targetTimeStr = TR.utils.formatTime(totalTargetMinutes);
    var optMins = Math.round(totalTargetMinutes * 0.95);
    var pesMins = Math.round(totalTargetMinutes * 1.08);

    var optTimeStr = TR.utils.formatTime(optMins);
    var pesTimeStr = TR.utils.formatTime(pesMins);

    // Effort points (Points = Distance + D+/100)
    var effortPoints = totalDist + (totalDPlus / 100);
    var targetRate = totalTargetMinutes > 0 ? (effortPoints / (totalTargetMinutes / 60)).toFixed(1) : '0.0';
    var optRate = optMins > 0 ? (effortPoints / (optMins / 60)).toFixed(1) : '0.0';
    var pesRate = pesMins > 0 ? (effortPoints / (pesMins / 60)).toFixed(1) : '0.0';

    // Arrival Day/Times
    var startInfo = parseStartTime(state.startTime);
    var arrivalStr = formatArrivalTime(startInfo, totalTargetMinutes, lang);
    var optArrivalStr = formatArrivalTime(startInfo, optMins, lang);
    var pesArrivalStr = formatArrivalTime(startInfo, pesMins, lang);

    // Hydration and Nutrition
    var totalWater = 0;
    var totalCarbs = 0;
    var totalSodium = 0;
    var totalCaffeine = 0;

    state.checkpoints.forEach(function (cp, idx) {
      if (idx > 0) {
        var segTimeMins = TR.utils.parseTime(cp.segmentTime || '');
        var segHours = segTimeMins / 60;
        
        var wRate = parseFloat(cp.water) || 0;
        var cRate = parseFloat(cp.carbs) || 0;
        var sConc = parseFloat(cp.sodium) || 0;
        var cafRate = parseFloat(cp.caffeine) || 0;
        
        var segWater = wRate * segHours;
        var segCarbs = cRate * segHours;
        var segCaff = cafRate * segHours;
        var segSod = segWater * (sConc / 1000);
        
        totalWater += segWater;
        totalCarbs += segCarbs;
        totalCaffeine += segCaff;
        totalSodium += segSod;
      }
    });

    var totalHours = totalTargetMinutes / 60;
    var avgWater = totalHours > 0 ? Math.round(totalWater / totalHours) : 0;
    var avgCarbs = totalHours > 0 ? (totalCarbs / totalHours).toFixed(1) : '0.0';
    var avgCaffeine = totalHours > 0 ? (totalCaffeine / totalHours).toFixed(1) : '0.0';
    var avgSodium = totalWater > 0 ? Math.round((totalSodium * 1000) / totalWater) : 0; // mg/L of water

    var sugarCubes = Math.round(totalCarbs / 5);

    // Render Summary HTML
    var summaryHtml = 
      '<div class="summary-group">' +
      '  <div class="summary-group-title">' + dict.labelCourse + '</div>' +
      '  <div class="summary-row"><span class="summary-label">Distance</span><span class="summary-val">' + totalDist.toFixed(1) + ' km</span></div>' +
      '  <div class="summary-row"><span class="summary-label">Gain / Loss</span><span class="summary-val"><span style="color:var(--success)">+' + totalDPlus + 'm</span> / <span style="color:var(--danger)">-' + totalDMinus + 'm</span></span></div>' +
      '</div>' +
      '<div class="summary-group">' +
      '  <div class="summary-group-title">' + dict.labelTemps + '</div>' +
      '  <div class="summary-row"><span class="summary-label">' + dict.labelPlan + '</span><span class="summary-val">' + targetTimeStr + '<span class="summary-val-sub">' + (lang === 'zh' ? '' : 'soit ') + targetRate + ' points/h</span></span></div>' +
      '  <div class="summary-row"><span class="summary-label">' + dict.labelOptimiste + '</span><span class="summary-val">' + optTimeStr + '<span class="summary-val-sub">' + (lang === 'zh' ? '' : 'soit ') + optRate + ' points/h</span></span></div>' +
      '  <div class="summary-row"><span class="summary-label">' + dict.labelPessimiste + '</span><span class="summary-val">' + pesTimeStr + '<span class="summary-val-sub">' + (lang === 'zh' ? '' : 'soit ') + pesRate + ' points/h</span></span></div>' +
      '</div>' +
      '<div class="summary-group">' +
      '  <div class="summary-group-title">' + dict.labelArriveeEstime + '</div>' +
      '  <div class="summary-row"><span class="summary-label">' + dict.labelPlan + '</span><span class="summary-val">' + arrivalStr + '</span></div>' +
      '  <div class="summary-row"><span class="summary-label">' + dict.labelOptimiste + '</span><span class="summary-val">' + optArrivalStr + '</span></div>' +
      '  <div class="summary-row"><span class="summary-label">' + dict.labelPessimiste + '</span><span class="summary-val">' + pesArrivalStr + '</span></div>' +
      '</div>' +
      '<div class="summary-group">' +
      '  <div class="summary-group-title">' + (lang === 'zh' ? '平均补给' : 'Nutrition (Average)') + '</div>' +
      '  <div class="summary-row"><span class="summary-label">' + dict.labelWaterAvg + '</span><span class="summary-val">' + avgWater + ' mL/h</span></div>' +
      '  <div class="summary-row"><span class="summary-label">' + dict.labelCarbsAvg + '</span><span class="summary-val">' + avgCarbs + ' g/h</span></div>' +
      '  <div class="summary-row"><span class="summary-label">' + dict.labelSodiumAvg + '</span><span class="summary-val">' + avgSodium + ' mg/L</span></div>' +
      '  <div class="summary-row"><span class="summary-label">' + dict.labelCaffeineAvg + '</span><span class="summary-val">' + avgCaffeine + ' mg/h</span></div>' +
      '</div>' +
      '<div class="summary-group">' +
      '  <div class="summary-group-title">' + (lang === 'zh' ? '累计补给' : 'Nutrition (Total)') + '</div>' +
      '  <div class="summary-row"><span class="summary-label">' + dict.labelWaterTotal + '</span><span class="summary-val">' + (totalWater/1000).toFixed(1) + ' L</span></div>' +
      '  <div class="summary-row"><span class="summary-label">' + dict.labelCarbsTotal + '</span><span class="summary-val">' + Math.round(totalCarbs) + ' g<span class="summary-val-sub">= ' + sugarCubes + ' ' + dict.labelSugarCubeEq + '</span></span></div>' +
      '  <div class="summary-row"><span class="summary-label">' + dict.labelSodiumTotal + '</span><span class="summary-val">' + (totalSodium/1000).toFixed(1) + ' g</span></div>' +
      '  <div class="summary-row"><span class="summary-label">' + dict.labelCaffeineTotal + '</span><span class="summary-val">' + Math.round(totalCaffeine) + ' mg</span></div>' +
      '</div>';
    
    dom.summaryContent.innerHTML = summaryHtml;

    // 2. Perform Verification Checklist
    var checks = [];

    // Rule 1: Checkpoint distance ordering
    var distOk = true;
    for (var i = 1; i < state.checkpoints.length; i++) {
      if (state.checkpoints[i].distance < state.checkpoints[i - 1].distance) {
        distOk = false;
        break;
      }
    }
    if (distOk) {
      checks.push({ status: 'ok', text: dict.checkDistOk });
    } else {
      checks.push({ status: 'danger', text: dict.checkDistErr });
    }

    // Rule 2: Finish distance matches GPX length (if trackpoints loaded)
    if (state.trackpoints && state.trackpoints.length > 0) {
      var gpxLen = state.trackpoints[state.trackpoints.length - 1].distance;
      var lastCpDist = state.checkpoints[state.checkpoints.length - 1].distance;
      if (Math.abs(lastCpDist - gpxLen) < 1.0) {
        checks.push({ status: 'ok', text: dict.checkFinishOk });
      } else {
        checks.push({ status: 'warning', text: dict.checkFinishWarn });
      }
    } else {
      checks.push({ status: 'warning', text: dict.checkGpxMissing });
    }

    // Rule 3: Pace/Speed check for each segment
    var pacesOk = true;
    var badPaceCps = [];
    var missingTimeCps = [];

    for (var i = 1; i < state.checkpoints.length; i++) {
      var cpPrev = state.checkpoints[i - 1];
      var cpCurr = state.checkpoints[i];
      var segTimeMins = TR.utils.parseTime(cpCurr.segmentTime || '');

      if (segTimeMins <= 0) {
        missingTimeCps.push(cpCurr.name || ('CP' + i));
        pacesOk = false;
        continue;
      }

      var segDist = cpCurr.distance - cpPrev.distance;
      var segDPlus = 0;
      if (state.trackpoints && state.trackpoints.length > 0) {
        var segStats = TR.utils.segmentStats(state.trackpoints, cpPrev.distance, cpCurr.distance);
        segDPlus = segStats.dPlus;
      }

      var segEffortDist = segDist + (segDPlus / 100);
      var segHours = segTimeMins / 60;
      var segSpeed = segEffortDist / segHours; // effort-km/h (points/h)

      if (segSpeed > 25) {
        badPaceCps.push({ name: cpCurr.name || ('CP' + i), reason: 'fast' });
        pacesOk = false;
      } else if (segSpeed < 2) {
        badPaceCps.push({ name: cpCurr.name || ('CP' + i), reason: 'slow' });
        pacesOk = false;
      }
    }

    if (pacesOk) {
      checks.push({ status: 'ok', text: dict.checkPacesOk });
    } else {
      missingTimeCps.forEach(function (name) {
        checks.push({ status: 'warning', text: dict.checkPaceMissing.replace('{name}', name) });
      });
      badPaceCps.forEach(function (item) {
        var tmpl = item.reason === 'fast' ? dict.checkPaceFast : dict.checkPaceSlow;
        checks.push({ status: 'warning', text: tmpl.replace('{name}', item.name) });
      });
    }

    // Rule 4: Hydration rate target (400-800 mL/h)
    if (avgWater >= 400 && avgWater <= 800) {
      checks.push({ status: 'ok', text: dict.checkWaterOk });
    } else if (avgWater < 400) {
      if (totalWater > 0 || totalTargetMinutes > 0) {
        checks.push({ status: 'warning', text: dict.checkWaterLow });
      } else {
        checks.push({ status: 'ok', text: dict.checkWaterOk });
      }
    } else if (avgWater > 800) {
      checks.push({ status: 'warning', text: dict.checkWaterHigh });
    }

    // Rule 5: Carbohydrate rate target (30-100 g/h)
    var carbsNum = parseFloat(avgCarbs);
    if (carbsNum >= 30 && carbsNum <= 100) {
      checks.push({ status: 'ok', text: dict.checkCarbsOk });
    } else if (carbsNum < 30) {
      if (totalCarbs > 0 || totalTargetMinutes > 0) {
        checks.push({ status: 'warning', text: dict.checkCarbsLow });
      } else {
        checks.push({ status: 'ok', text: dict.checkCarbsOk });
      }
    } else if (carbsNum > 100) {
      checks.push({ status: 'warning', text: dict.checkCarbsHigh });
    }

    // Rule 6: Sodium concentration target (300-700 mg/L of water)
    if (totalWater > 0) {
      if (totalSodium === 0) {
        checks.push({ status: 'danger', text: dict.checkSodiumZero });
      } else if (avgSodium >= 300 && avgSodium <= 700) {
        checks.push({ status: 'ok', text: dict.checkSodiumOk });
      } else if (avgSodium < 300) {
        checks.push({ status: 'warning', text: dict.checkSodiumLow });
      } else {
        checks.push({ status: 'warning', text: dict.checkSodiumHigh });
      }
    } else if (totalSodium > 0) {
      checks.push({ status: 'warning', text: dict.checkSodiumHigh });
    } else {
      // No sodium and no water hydration planned yet
      checks.push({ status: 'ok', text: dict.checkSodiumOk });
    }

    // Rule 7: Caffeine safety ceiling (<= 400 mg total)
    if (totalCaffeine <= 400) {
      checks.push({ status: 'ok', text: dict.checkCaffOk });
    } else {
      checks.push({ status: 'danger', text: dict.checkCaffHigh });
    }

    // Render checks HTML
    var checksHtml = '';
    checks.forEach(function (c) {
      var icon = '🟢';
      var textClass = '';
      if (c.status === 'warning') {
        icon = '🟡';
        textClass = ' warning';
      } else if (c.status === 'danger') {
        icon = '🔴';
        textClass = ' danger';
      }
      
      checksHtml += 
        '<div class="check-item">' +
        '  <span class="check-icon">' + icon + '</span>' +
        '  <span class="check-text' + textClass + '">' + c.text + '</span>' +
        '</div>';
    });

    dom.checksContent.innerHTML = checksHtml;
  }

  // ── Profile Rendering Debouncer ────────────────────────────────────
  var renderTimer = null;

  function scheduleRender() {
    updateSummaryAndChecks();
    if (renderTimer) clearTimeout(renderTimer);
    renderTimer = setTimeout(renderProfile, 150);
  }

  function renderProfile() {
    if (!state.trackpoints) return;

    if (dom.placeholder) {
      dom.placeholder.style.display = 'none';
    }

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
      dom.exportRatio.value
    );
  }

  // ── JSON Template Download ──────────────────────────────────────────
  function handleJsonTemplateDownload() {
    var isZH = (state.language === 'zh');
    var template = {
      raceName: isZH ? "Talus 经典越野跑 100K" : "Talus Classic Trail 100K",
      fontSizeTitle: 18,
      fontSizeCPName: 12,
      fontSizeCPElev: 11,
      fontSizeCPTime: 11,
      fontSizeCPNotes: 10,
      fontSizeSegment: 11,
      fontSizeCumulDist: 12,
      imageTheme: "day",
      language: state.language,
      startTime: isZH ? "周五 06:00" : "Fri 06:00",
      checkpoints: [
        {
          name: isZH ? "起点 (Couvet)" : "Start (Couvet)",
          distance: 0.0,
          arrivalTime: "0:00",
          segmentTime: "0:00",
          water: 0,
          carbs: 0,
          sodium: 0,
          caffeine: 0,
          notes: isZH ? "检查装备 / 起跑" : "Gear Check / Start",
          useForIntermediateDistances: true,
          iconSize: 20,
          iconRotation: 0,
          icons: [
            { symbol: "start", color: "#0d5236", iconColor: "White" },
            { symbol: "", color: "#4e4e4e", iconColor: "White" },
            { symbol: "", color: "#4e4e4e", iconColor: "White" }
          ],
          axisColor: "#0d5236",
          axisThickness: 1,
          axisBroken: true,
          textColor: "#1e293b",
          textSize: 18,
          textOrientation: "To the right",
          texts: {
            leftBottom: "", leftMiddle: "", leftTop: "",
            rightBottom: isZH ? "起跑点" : "Start Line",
            rightMiddle: isZH ? "海拔 727m" : "Elev 727m",
            rightTop: ""
          }
        },
        {
          name: "CP1 (Noiraigue)",
          distance: 12.2,
          arrivalTime: "1:15",
          segmentTime: "1:15",
          water: 500,
          carbs: 45,
          sodium: 200,
          caffeine: 0,
          notes: isZH ? "提供热食 / 水" : "Hot Food & Water",
          useForIntermediateDistances: true,
          iconSize: 20,
          iconRotation: 0,
          icons: [
            { symbol: "food", color: "#d97706", iconColor: "White" },
            { symbol: "water", color: "#0284c7", iconColor: "White" },
            { symbol: "", color: "#4e4e4e", iconColor: "White" }
          ],
          axisColor: "rgba(100,116,139,0.18)",
          axisThickness: 1,
          axisBroken: true,
          textColor: "#1e293b",
          textSize: 18,
          textOrientation: "To the right",
          texts: {
            leftBottom: "", leftMiddle: "", leftTop: "",
            rightBottom: isZH ? "首个补给" : "First Aid",
            rightMiddle: isZH ? "关门时间 3h" : "Cutoff 3h",
            rightTop: ""
          }
        },
        {
          name: "CP2 (Chasseron)",
          distance: 40.5,
          arrivalTime: "4:35",
          segmentTime: "3:20",
          water: 750,
          carbs: 60,
          sodium: 300,
          caffeine: 50,
          notes: isZH ? "高海拔山顶 / 强风" : "High Summit & Strong Wind",
          useForIntermediateDistances: true,
          iconSize: 20,
          iconRotation: 0,
          icons: [
            { symbol: "peak", color: "#475569", iconColor: "White" },
            { symbol: "cutoff", color: "#b91c1c", iconColor: "White" },
            { symbol: "", color: "#4e4e4e", iconColor: "White" }
          ],
          axisColor: "#b91c1c",
          axisThickness: 1,
          axisBroken: true,
          textColor: "#b91c1c",
          textSize: 18,
          textOrientation: "To the right",
          texts: {
            leftBottom: isZH ? "关门点 13:30" : "Cutoff 13:30",
            leftMiddle: "", leftTop: "",
            rightBottom: "", rightMiddle: "", rightTop: ""
          }
        },
        {
          name: isZH ? "终点 (Couvet)" : "Finish (Couvet)",
          distance: 108.7,
          arrivalTime: "13:35",
          segmentTime: "9:00",
          water: 1200,
          carbs: 100,
          sodium: 500,
          caffeine: 100,
          notes: isZH ? "完赛包领取" : "Finish Bag Collection",
          useForIntermediateDistances: true,
          iconSize: 20,
          iconRotation: 0,
          icons: [
            { symbol: "finish", color: "#b91c1c", iconColor: "White" },
            { symbol: "", color: "#4e4e4e", iconColor: "White" },
            { symbol: "", color: "#4e4e4e", iconColor: "White" }
          ],
          axisColor: "#b91c1c",
          axisThickness: 1,
          axisBroken: true,
          textColor: "#1e293b",
          textSize: 18,
          textOrientation: "To the right",
          texts: {
            leftBottom: "", leftMiddle: "", leftTop: "",
            rightBottom: isZH ? "完赛拱门" : "Finish Arch",
            rightMiddle: isZH ? "海拔 727m" : "Elev 727m",
            rightTop: ""
          }
        }
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

  // ── Toast ───────────────────────────────────────────────────────────
  var toastTimer = null;

  function toast(msg) {
    dom.toast.textContent = msg;
    dom.toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      dom.toast.classList.remove('show');
    }, 3000);
  }

  function populateStartTimeOptions(selectedValue) {
    if (!dom.inputStartTime) return;

    if (selectedValue === undefined) {
      selectedValue = dom.inputStartTime.value || state.startTime || '周五 18:00';
    }

    dom.inputStartTime.innerHTML = '';

    var lang = state.language;
    var daysZH = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    var daysEN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    var displayDays = (lang === 'zh') ? daysZH : daysEN;
    var options = [];
    var matched = false;

    for (var d = 0; d < 7; d++) {
      var valDay = daysZH[d];
      var textDay = displayDays[d];

      for (var h = 0; h < 24; h++) {
        for (var m = 0; m < 60; m += 30) {
          var timeStr = (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
          var val = valDay + ' ' + timeStr;
          var label = textDay + ' ' + timeStr;
          options.push({ val: val, label: label });
          if (val === selectedValue) {
            matched = true;
          }
        }
      }
    }

    if (!matched && selectedValue) {
      var parsed = parseStartTime(selectedValue);
      var normalizedVal = daysZH[parsed.dayOffset] + ' ' + (parsed.hour < 10 ? '0' : '') + parsed.hour + ':' + (parsed.min < 10 ? '0' : '') + parsed.min;
      var normalizedText = displayDays[parsed.dayOffset] + ' ' + (parsed.hour < 10 ? '0' : '') + parsed.hour + ':' + (parsed.min < 10 ? '0' : '') + parsed.min;

      var alreadyIn = false;
      for (var i = 0; i < options.length; i++) {
        if (options[i].val === normalizedVal) {
          alreadyIn = true;
          selectedValue = normalizedVal;
          break;
        }
      }

      if (!alreadyIn) {
        options.unshift({ val: normalizedVal, label: normalizedText });
        selectedValue = normalizedVal;
      }
    }

    options.forEach(function (opt) {
      var optionEl = document.createElement('option');
      optionEl.value = opt.val;
      optionEl.textContent = opt.label;
      dom.inputStartTime.appendChild(optionEl);
    });

    dom.inputStartTime.value = selectedValue;
    state.startTime = selectedValue;
  }

  // ── i18n Declarative Dynamic Switcher ──────────────────────────────
  function applyLanguage() {
    var lang = state.language;
    var dict = T[lang];

    // 1. Translate all static elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.dataset.i18n;
      if (dict[key] !== undefined) {
        el.textContent = dict[key];
      }
    });

    // 2. Translate placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.dataset.i18nPlaceholder;
      if (dict[key] !== undefined) {
        el.setAttribute('placeholder', dict[key]);
      }
    });

    // 3. Translate titles (tooltips)
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      var key = el.dataset.i18nTitle;
      if (dict[key] !== undefined) {
        el.setAttribute('title', dict[key]);
      }
    });

    // Sync dropdown state
    if (dom.selectLang) {
      dom.selectLang.value = lang;
    }

    // Translate dynamic options in Export Ratio Select
    if (dom.exportRatio) {
      dom.exportRatio.options[0].text = dict.ratioAuto;
      dom.exportRatio.options[1].text = dict.ratio19_5_9;
      dom.exportRatio.options[2].text = dict.ratio20_9;
    }

    // Translate Image Resolution options
    if (dom.exportMenu) {
      var scaleBtns = dom.exportMenu.querySelectorAll('button');
      if (scaleBtns.length === 3) {
        scaleBtns[0].textContent = dict.scale1;
        scaleBtns[1].textContent = dict.scale2;
        scaleBtns[2].textContent = dict.scale3;
      }
    }

    // Re-populate and translate start time select options
    populateStartTimeOptions(state.startTime);

    // Trigger full layout redraw
    renderCPTable();
    renderPOITabs();
    loadActiveCPDetails();
    scheduleRender();
  }

  // ── Boot ────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
