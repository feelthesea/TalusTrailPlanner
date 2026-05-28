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
      ratio16_9: "16:9 横屏 (如 iPhone 6/7/8, 经典安卓机型)",
      ratio19_5_9: "19.5:9 横屏 (如 iPhone X/11-16, 主流全面屏)",
      ratio4_3: "4:3 横屏 (如 iPad, 平板电脑)",
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
      colTime: "抵达cp点总用时",
      colNotes: "备注 (支持回车多行)",
      addCpBtn: "＋ 添加 CP 点",
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
      poiCol4Title: "图表内嵌自定义标注 (支持旋转/排列)",
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
      placeholderTimeInput: "抵达用时 H:MM",
      placeholderNotesInput: "备注",
      placeholderTextNone: "无",
      
      defaultStartName: "起点",
      defaultFinishName: "终点"
    },
    en: {
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
      ratio16_9: "16:9 Landscape (e.g. iPhone 6/7/8)",
      ratio19_5_9: "19.5:9 Landscape (e.g. iPhone X/11-16)",
      ratio4_3: "4:3 Landscape (e.g. iPad)",
      downloadPng: "Download Image ▾",
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
      colTime: "Total Time to CP",
      colNotes: "Notes (supports Enter)",
      addCpBtn: "＋ Add Checkpoint",
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
      placeholderTimeInput: "Time H:MM",
      placeholderNotesInput: "Notes",
      placeholderTextNone: "None",
      
      defaultStartName: "Start",
      defaultFinishName: "Finish"
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
    fontSizeTitle: 18,     // Individual roadbook element font sizes (Requested)
    fontSizeCPName: 12,
    fontSizeCPElev: 11,
    fontSizeCPTime: 11,
    fontSizeCPNotes: 10,
    fontSizeSegment: 11,
    fontSizeCumulDist: 12,
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
    if (cp.axisThickness === undefined) cp.axisThickness = 2;
    if (cp.axisBroken === undefined) cp.axisBroken = false;

    if (cp.textColor === undefined) cp.textColor = '#4e4e4e';
    if (cp.textSize === undefined) cp.textSize = 10;
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
    return cp;
  }

  function normalizeAllCPs() {
    var cumul = 0;
    state.checkpoints.forEach(function (cp, idx) {
      normalizeCP(cp, idx);
      
      // Legacy conversion: if arrivalTime is empty/undefined but segmentTime has value
      if (!cp.arrivalTime && cp.segmentTime) {
        var seg = TR.utils.parseTime(cp.segmentTime);
        cumul += seg;
        cp.arrivalTime = TR.utils.formatTime(cumul);
      } else if (cp.arrivalTime) {
        // Keep track of cumulative sum just in case there are mixed fields
        cumul = TR.utils.parseTime(cp.arrivalTime);
      }
    });
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
    dom.btnPoiTabUp       = document.getElementById('btn-poi-tab-up'); // scrolls horizontally left now
    dom.btnPoiTabDown     = document.getElementById('btn-poi-tab-down'); // scrolls horizontally right now
    dom.poiIntermediate   = document.getElementById('poi-intermediate');
    dom.poiPosition       = document.getElementById('poi-position');
    dom.poiIconSize       = document.getElementById('poi-icon-size');
    dom.poiIconRotation   = document.getElementById('poi-icon-rotation');

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

      tr.innerHTML =
        '<td class="col-num">' + seqLabel + '</td>' +
        '<td class="col-name"><input type="text" data-idx="' + globalIdx + '" data-field="name" value="' + esc(cp.name) + '" placeholder="' + T[lang].placeholderCpNameInput + '"></td>' +
        '<td class="col-dist"><input type="number" data-idx="' + globalIdx + '" data-field="distance" value="' + cp.distance + '" step="0.1" min="0" placeholder="0.0"></td>' +
        '<td class="col-icon"><select data-idx="' + globalIdx + '" data-field="icon">' +
          iconOptions(cp.icons[0].symbol) +
        '</select></td>' +
        '<td class="col-time"><input type="text" data-idx="' + globalIdx + '" data-field="arrivalTime" value="' + esc(cp.arrivalTime) + '" placeholder="' + T[lang].placeholderTimeInput + '"></td>' +
        '<td class="col-notes"><textarea data-idx="' + globalIdx + '" data-field="notes" placeholder="' + T[lang].placeholderNotesInput + '">' + esc(cp.notes) + '</textarea></td>' +
        '<td class="col-action"><button class="btn-delete" data-idx="' + globalIdx + '" title="' + T[lang].deleteCpTitle + '">✕</button></td>';
      
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
      renderCPTable();
      renderPOITabs();
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
    dom.btnPoiTabUp.addEventListener('click', function () {
      dom.poiTabs.scrollLeft -= 80;
    });
    dom.btnPoiTabDown.addEventListener('click', function () {
      dom.poiTabs.scrollLeft += 80;
    });

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

    dom.poiIconSize.addEventListener('change', function () {
      var activeCP = state.checkpoints[state.activeCPIndex];
      if (activeCP) {
        activeCP.iconSize = parseInt(this.value, 10) || 20;
        scheduleRender();
      }
    });

    dom.poiIconRotation.addEventListener('change', function () {
      var activeCP = state.checkpoints[state.activeCPIndex];
      if (activeCP) {
        activeCP.iconRotation = parseInt(this.value, 10) || 0;
        scheduleRender();
      }
    });

    dom.poiAxisThickness.addEventListener('change', function () {
      var activeCP = state.checkpoints[state.activeCPIndex];
      if (activeCP) {
        activeCP.axisThickness = parseInt(this.value, 10) || 2;
        scheduleRender();
      }
    });

    dom.poiAxisBroken.addEventListener('change', function () {
      var activeCP = state.checkpoints[state.activeCPIndex];
      if (activeCP) {
        activeCP.axisBroken = this.checked;
        scheduleRender();
      }
    });

    dom.poiTextSize.addEventListener('change', function () {
      var activeCP = state.checkpoints[state.activeCPIndex];
      if (activeCP) {
        activeCP.textSize = parseInt(this.value, 10) || 10;
        scheduleRender();
      }
    });

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
      var colorHex     = groupEl.querySelector('.poi-color-hex');
      var colorPicker  = groupEl.querySelector('.poi-color-picker');
      var toggleWhite  = groupEl.querySelector('.toggle-btn[data-val="White"]');
      var toggleBlack  = groupEl.querySelector('.toggle-btn[data-val="Black"]');

      symbolSelect.addEventListener('change', function () {
        var activeCP = state.checkpoints[state.activeCPIndex];
        if (activeCP) {
          activeCP.icons[iconIdx].symbol = this.value;
          
          if (this.value && !activeCP.icons[iconIdx].color) {
            var col = getLegacyIconColor(this.value);
            activeCP.icons[iconIdx].color = col;
            colorPicker.value = col;
            colorHex.value = col;
          }
          renderCPTable();
          scheduleRender();
        }
      });

      bindColorPicker(colorPicker, colorHex, function (col) {
        var activeCP = state.checkpoints[state.activeCPIndex];
        if (activeCP) {
          activeCP.icons[iconIdx].color = col;
          scheduleRender();
        }
      });

      function setToggle(val) {
        var activeCP = state.checkpoints[state.activeCPIndex];
        if (activeCP) {
          activeCP.icons[iconIdx].iconColor = val;
          if (val === 'White') {
            toggleWhite.classList.add('active');
            toggleBlack.classList.remove('active');
          } else {
            toggleBlack.classList.add('active');
            toggleWhite.classList.remove('active');
          }
          scheduleRender();
        }
      }
      toggleWhite.addEventListener('click', function () { setToggle('White'); });
      toggleBlack.addEventListener('click', function () { setToggle('Black'); });
    });
  }

  // Render navigation tabs in POI panel
  function renderPOITabs() {
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

  // Load details of the active CP into form controls
  function loadActiveCPDetails() {
    var cp = state.checkpoints[state.activeCPIndex];
    if (!cp) return;

    dom.poiIntermediate.checked = !!cp.useForIntermediateDistances;
    dom.poiPosition.value = cp.distance;
    dom.poiIconSize.value = cp.iconSize;
    dom.poiIconRotation.value = cp.iconRotation;

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
    dom.poiAxisBroken.checked = !!cp.axisBroken;

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
      groupEl.querySelector('.poi-color-picker').value = ico.color;
      groupEl.querySelector('.poi-color-hex').value = ico.color;

      var toggleWhite = groupEl.querySelector('.toggle-btn[data-val="White"]');
      var toggleBlack = groupEl.querySelector('.toggle-btn[data-val="Black"]');

      if (ico.iconColor === 'White') {
        toggleWhite.classList.add('active');
        toggleBlack.classList.remove('active');
      } else {
        toggleBlack.classList.add('active');
        toggleWhite.classList.remove('active');
      }
    });
  }

  // ── Profile Rendering Debouncer ────────────────────────────────────
  var renderTimer = null;

  function scheduleRender() {
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
      checkpoints: [
        {
          name: isZH ? "起点 (Couvet)" : "Start (Couvet)",
          distance: 0.0,
          arrivalTime: "0:00",
          notes: isZH ? "检查装备 / 起跑" : "Gear Check / Start",
          useForIntermediateDistances: true,
          iconSize: 20,
          iconRotation: 0,
          icons: [
            { symbol: "start", color: "#059669", iconColor: "White" },
            { symbol: "", color: "#4e4e4e", iconColor: "White" },
            { symbol: "", color: "#4e4e4e", iconColor: "White" }
          ],
          axisColor: "#059669",
          axisThickness: 2,
          axisBroken: false,
          textColor: "#0f172a",
          textSize: 10,
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
          notes: isZH ? "提供热食 / 水" : "Hot Food & Water",
          useForIntermediateDistances: true,
          iconSize: 20,
          iconRotation: 0,
          icons: [
            { symbol: "food", color: "#ea580c", iconColor: "White" },
            { symbol: "water", color: "#0284c7", iconColor: "White" },
            { symbol: "", color: "#4e4e4e", iconColor: "White" }
          ],
          axisColor: "rgba(100,116,139,0.35)",
          axisThickness: 2,
          axisBroken: true,
          textColor: "#0f172a",
          textSize: 9,
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
          notes: isZH ? "高海拔山顶 / 强风" : "High Summit & Strong Wind",
          useForIntermediateDistances: true,
          iconSize: 20,
          iconRotation: 0,
          icons: [
            { symbol: "peak", color: "#2563eb", iconColor: "White" },
            { symbol: "cutoff", color: "#dc2626", iconColor: "White" },
            { symbol: "", color: "#4e4e4e", iconColor: "White" }
          ],
          axisColor: "#dc2626",
          axisThickness: 2.5,
          axisBroken: false,
          textColor: "#dc2626",
          textSize: 10,
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
          notes: isZH ? "完赛包领取" : "Finish Bag Collection",
          useForIntermediateDistances: true,
          iconSize: 20,
          iconRotation: 0,
          icons: [
            { symbol: "finish", color: "#dc2626", iconColor: "White" },
            { symbol: "", color: "#4e4e4e", iconColor: "White" },
            { symbol: "", color: "#4e4e4e", iconColor: "White" }
          ],
          axisColor: "#dc2626",
          axisThickness: 2,
          axisBroken: false,
          textColor: "#0f172a",
          textSize: 10,
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

  // ── i18n Declarative Dynamic Switcher ──────────────────────────────
  function applyLanguage() {
    var lang = state.language;
    var dict = T[lang];

    // 1. Translate all static elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.dataset.i18n;
      if (dict[key] !== undefined) {
        var iconEl = el.querySelector('.icon');
        if (iconEl) {
          el.innerHTML = '';
          el.appendChild(iconEl);
          el.appendChild(document.createTextNode(' ' + dict[key]));
        } else {
          el.textContent = dict[key];
        }
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
      dom.exportRatio.options[1].text = dict.ratio16_9;
      dom.exportRatio.options[2].text = dict.ratio19_5_9;
      dom.exportRatio.options[3].text = dict.ratio4_3;
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
