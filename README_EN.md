# 🏔️ Talus - Trail Roadbook Generator

[简体中文](README.md) | [English](README_EN.md)

**Talus** is a premium, interactive, and completely client-side trail-running elevation profile and roadbook generator designed for runners and race organizers. 

Simply import your GPX track file, add checkpoints (CPs), dynamically edit cumulative arrival times and notes, and export wallpaper-grade high-definition roadbook images tailored perfectly for modern mobile lockscreens.

> [!NOTE]
> 👤 **Creator**: Vibe coded by **Laurent L** in collaboration with the Antigravity AI coding assistant.
> 🔒 **100% Data Privacy**: Talus runs entirely in your local browser. All GPX parsing, elevation calculations, and image rendering are performed locally—**no data is ever uploaded to any server**.

---

## ✨ Core Features

- ☀️ **Universal High-Contrast Palette**: A single, premium, outdoors-optimized color scheme designed to ensure perfect legibility under blinding direct sunlight while remaining soft and comfortable on dimmed screens at night.
- ⏱️ **Cumulative Arrival Times & Dynamic Segment Calculations**: Simply enter your cumulative arrival times (`H:MM`) for each checkpoint. Talus will automatically calculate the segment interval time between adjacent checkpoints and render it on the chart.
- 📍 **Swiss-Canyon-Style Rotated CP Names**: Checkpoint names are displayed vertically parallel to the vertical guide axes, completely resolving horizontal label overlaps when checkpoints are densely populated.
- 📊 **Three-Line High-Fidelity Statistics Box**: Bottom segment statistics (Distance, D+ Climb `▲`, and D- Descent `▼`) are cleanly formatted into three structured rows for maximum readability.
- 🎭 **Overlay Multi-Icon Stacking (Up to 3 layers)**: Each checkpoint supports up to 3 overlay icons (e.g. Water `💧` + Food `🍽️` + Medical `🏥`) with 12 premium vector icons.
- 📝 **Flexible Page Tweak Panel**:
  - Add custom inside-chart annotations (Associated Texts) supporting customized rotations and alignments.
  - Tweak granular font sizes (in pixels) for every element (Race name, CP Name, CP Elev, Time, Notes, Segments, Cumulative dist).
  - Vertical guide axes default to dynamic "break line under elevation curve" settings for a premium presentation.
- 📱 **Multi-Ratio Wallpapers**: Export PNGs in Auto-fit (No Padding), 19.5:9 Full-screen Landscape (perfect for iPhone 17/16), or 20:9 Landscape (perfect for Xiaomi, Huawei Pura, and mainstream Android screens) at 1× / 2× / 3× resolutions.
- 📥 **JSON Backup & Templates**: Easily import or export all your checkpoint visual configurations as a local JSON file for future edits, with a one-click template download feature.
- 🌐 **Dynamic UI Internationalization**: Supports full Chinese and English switching with automatic browser language locale detection.

---

## 🚀 Quick Start

### 1. Online Demo
Access and use Talus online immediately:
**🔗 [https://feelthesea.github.io/TalusTrailPlanner/](https://feelthesea.github.io/TalusTrailPlanner/)**

### 2. Local Run
To run or customize the project locally, simply follow these steps:
```bash
# 1. Clone the repository
git clone https://github.com/feelthesea/TalusTrailPlanner.git

# 2. Enter the folder
cd TalusTrailPlanner

# 3. Start a simple static web server (e.g. using Python)
python -m http.server 8080

# 4. Open in browser
# http://localhost:8080
```

---

## 📖 Step-by-Step Guide

1. **Upload Track**: Click **"📂 Upload GPX"** to select your GPX track file. The elevation profile will instantly render.
2. **Setup Checkpoints**:
   - In the Checkpoint Table, customize names, distances (km), notes (textarea supports multi-line enter key inputs which also wrap inside the SVG), and choose symbols.
   - **Time Inputs**: In the **"Total Time to CP"** column, input your overall elapsed arrival times (e.g., `4:35`). The interval times (e.g. `(3:20)`) will automatically compute and display between CP lines on the chart.
3. **Customize Visuals**:
   - Click any row in the CP table or click POI tabs at the bottom to select a checkpoint.
   - In the bottom dashboard, customize checkpoint icons, icon background colors, axes configurations, and inside-chart text annotations.
   - Adjust the granular font size input boxes on the left to achieve the perfect typographic balance.
4. **Export & Share**:
   - Choose your target **"Aspect Ratio"** in the toolbar.
   - Click **"🖼️ Download PNG ▾"** (we recommend **2× HD** or **3× Ultra HD** for sharp rendering).
   - Click **"📤 Export JSON"** to backup your checkpoint layout configurations!

---

## 📂 Configuration JSON Schema

Click the **"📋 Template"** button on the page to download a standard blueprint, or reference the schema below:

```json
{
  "raceName": "Race Name",
  "fontSizeTitle": 18,
  "fontSizeCPName": 12,
  "fontSizeCPElev": 11,
  "fontSizeCPTime": 11,
  "fontSizeCPNotes": 10,
  "fontSizeSegment": 11,
  "fontSizeCumulDist": 12,
  "language": "en",
  "checkpoints": [
    {
      "name": "Start Location",
      "distance": 0.0,
      "arrivalTime": "0:00",
      "notes": "Gear Check / Start",
      "useForIntermediateDistances": true,
      "iconSize": 20,
      "iconRotation": 0,
      "icons": [
        { "symbol": "start", "color": "#059669", "iconColor": "White" },
        { "symbol": "", "color": "#4e4e4e", "iconColor": "White" },
        { "symbol": "", "color": "#4e4e4e", "iconColor": "White" }
      ],
      "axisColor": "#059669",
      "axisThickness": 2,
      "axisBroken": false,
      "textColor": "#0f172a",
      "textSize": 10,
      "textOrientation": "To the right",
      "texts": {
        "leftBottom": "", "leftMiddle": "", "leftTop": "",
        "rightBottom": "", "rightMiddle": "Elev 727m", "rightTop": ""
      }
    }
  ]
}
```

---

## 🤝 Contributing & Feedback

If you utilized **Talus** for your training or race planning, we'd love to see your exported roadbook wallpapers! 
For bug reports, feature requests, or contributions, feel free to open an **Issue** or submit a **Pull Request**.

Happy running and safe finishes! 跑出热爱，平安完赛！🏃‍♂️🏔️
