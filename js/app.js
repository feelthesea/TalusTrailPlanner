/**
 * Talus - Trail Roadbook Generator — Main Application (v4)
 *
 * Wires together: GPX parser, CP table editor, SVG profile renderer, image export,
 * and the advanced detailed horizontal Points of Interest editing panel.
 */
(function () {
  'use strict';

  var TR = window.TrailRoadbook;

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
    checkpoints: [
      { name: 'Start',  distance: 0, icon: 'start',  arrivalTime: '0:00', notes: '' },
      { name: 'Finish', distance: 0, icon: 'finish', arrivalTime: '', notes: '' }
    ]
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

    normalizeAllCPs();
    bindEvents();
    bindPOIEvents();
    renderCPTable();
    renderPOITabs();
    loadActiveCPDetails();
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
      name: '新检查点',
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
    toast('已添加新CP点，位置为 ' + newDist + ' 公里 ✓');
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
      toast('GPX 载入成功：共 ' + pts.length + ' 个坐标点，全长 ' + totalDist.toFixed(1) + ' 公里 ✓');
    }).catch(function (err) {
      toast('GPX 错误：' + err.message);
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
        if (Array.isArray(data.checkpoints)) {
          state.checkpoints = data.checkpoints;
        }
        sortCheckpoints();
        normalizeAllCPs();
        state.activeCPIndex = 0;
        renderCPTable();
        renderPOITabs();
        loadActiveCPDetails();
        scheduleRender();
        toast('配置导入成功 ✓');
      } catch (err) {
        toast('导入格式错误：' + err.message);
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
    toast('配置导出成功 ✓');
  }

  // ── Image Export ────────────────────────────────────────────────────
  function handleImageExport(scale) {
    if (!state.trackpoints) {
      toast('请先上传比赛路线的 GPX 文件。');
      return;
    }
    var svgEl = dom.profileContainer.querySelector('svg');
    if (!svgEl) {
      toast('无法生成导出图片。');
      return;
    }
    var filename = (state.raceName || 'roadbook').replace(/[^a-zA-Z0-9_\-\u4e00-\u9fff]/g, '_');
    var ratio = dom.exportRatio.value;

    TR.exporter.exportToPNG(svgEl, scale, filename, ratio);
    toast('正在导出 ' + scale + '× PNG 图片 (' + ratio + ')…');
  }

  // ── CP Table Rendering ──────────────────────────────────────────────
  function renderCPTable() {
    dom.cpTbody.innerHTML = '';
    
    var sortedCps = state.checkpoints.slice();
    
    sortedCps.forEach(function (cp, idx) {
      var globalIdx = state.checkpoints.indexOf(cp);
      var isSelected = (globalIdx === state.activeCPIndex);
      var tr = document.createElement('tr');
      if (isSelected) tr.classList.add('selected-row');
      
      // Dynamic sequence label: S, 1, 2, 3..., F
      var seqLabel = (idx === 0) ? 'S' : (idx === sortedCps.length - 1 ? 'F' : idx);

      tr.innerHTML =
        '<td class="col-num">' + seqLabel + '</td>' +
        '<td class="col-name"><input type="text" data-idx="' + globalIdx + '" data-field="name" value="' + esc(cp.name) + '" placeholder="CP名称"></td>' +
        '<td class="col-dist"><input type="number" data-idx="' + globalIdx + '" data-field="distance" value="' + cp.distance + '" step="0.1" min="0" placeholder="0.0"></td>' +
        '<td class="col-icon"><select data-idx="' + globalIdx + '" data-field="icon">' +
          iconOptions(cp.icons[0].symbol) +
        '</select></td>' +
        '<td class="col-time"><input type="text" data-idx="' + globalIdx + '" data-field="arrivalTime" value="' + esc(cp.arrivalTime) + '" placeholder="抵达用时 H:MM"></td>' +
        '<td class="col-notes"><textarea data-idx="' + globalIdx + '" data-field="notes" placeholder="备注">' + esc(cp.notes) + '</textarea></td>' +
        '<td class="col-action"><button class="btn-delete" data-idx="' + globalIdx + '" title="删除此CP">✕</button></td>';
      
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
      toast('必须保留至少一个检查点。');
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
    toast('检查点已删除 ✓');
  }

  function iconOptions(selected) {
    var opts = [
      ['start',  '🟢 起点 (Start)'],
      ['finish', '🔴 终点 (Finish)'],
      ['water',  '💧 水站 (Water)'],
      ['food',   '🍽️ 补给站 (Food)'],
      ['cutoff', '⚠️ 关门点 (Cutoff)'],
      ['cp',     '📍 检查点 (CP)'],
      ['chapel', '⛪ 教堂 (Chapel)'],
      ['danger', '⚡ 危险 (Danger)'],
      ['peak',   '🏔️ 山峰 (Peak)'],
      ['medical','🏥 医疗点 (Medical)'],
      ['toilet', '🚽 厕所 (Toilet)'],
      ['info',   'ℹ️ 咨询处 (Info)']
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
    addTab.textContent = '+ 添加';
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
    var template = {
      raceName: "Talus 经典越野跑 100K",
      fontSizeTitle: 18,
      fontSizeCPName: 12,
      fontSizeCPElev: 11,
      fontSizeCPTime: 11,
      fontSizeCPNotes: 10,
      fontSizeSegment: 11,
      fontSizeCumulDist: 12,
      imageTheme: "day",
      checkpoints: [
        {
          name: "起点 (Couvet)",
          distance: 0.0,
          arrivalTime: "0:00",
          notes: "检查装备 / 起跑",
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
            rightBottom: "起跑点", rightMiddle: "海拔 727m", rightTop: ""
          }
        },
        {
          name: "CP1 (Noiraigue)",
          distance: 12.2,
          arrivalTime: "1:15",
          notes: "提供热食 / 水",
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
            rightBottom: "首个补给", rightMiddle: "关门时间 3h", rightTop: ""
          }
        },
        {
          name: "CP2 (Chasseron)",
          distance: 40.5,
          arrivalTime: "4:35",
          notes: "高海拔山顶 / 强风",
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
            leftBottom: "关门点 13:30", leftMiddle: "", leftTop: "",
            rightBottom: "", rightMiddle: "", rightTop: ""
          }
        },
        {
          name: "终点 (Couvet)",
          distance: 108.7,
          arrivalTime: "13:35",
          notes: "完赛包领取",
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
            rightBottom: "完赛拱门", rightMiddle: "海拔 727m", rightTop: ""
          }
        }
      ]
    };
    var json = JSON.stringify(template, null, 2);
    var blob = new Blob([json], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'talus_roadbook_template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 3000);
    toast('模板 JSON 下载成功 ✓');
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

  // ── Boot ────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
