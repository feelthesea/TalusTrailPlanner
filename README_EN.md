# 🏔️ Talus - Trail Roadbook Generator & Trail Analytics

[简体中文](README.md) | [English](README_EN.md)

**Talus** is a premium, interactive, and completely client-side trail-running elevation profile, map explorer, and roadbook generator designed for runners and race organizers. 

Simply import your GPX / KML / KMZ track file, inspect interactive maps and slope grade analytics, configure checkpoints (CPs), dynamically edit arrival times and notes, and export wallpaper-grade high-definition roadbook images tailored perfectly for modern mobile lockscreens.

> [!NOTE]
> 👤 **Creator**: Vibe coded by **Laurent L** in collaboration with the Antigravity AI coding assistant.
> 🔒 **100% Data Privacy**: Talus runs entirely in your local browser. All GPX/KML/KMZ parsing, elevation calculations, and image rendering are performed locally—**no data is ever uploaded to any server**.

---

## ✨ Core Features

- ☀️ **Universal High-Contrast Palette**: A single, premium, outdoors-optimized color scheme designed to ensure perfect legibility under blinding direct sunlight while remaining soft and comfortable on dimmed screens at night.
- ⚡ **Cumulative Elevation Calculation Modes**: Toggle between Raw GPS data and Smooth 4m Hysteresis Threshold Filtering to eliminate atmospheric/GPS elevation noise and match official race profiles.
- 🗺️ **Interactive Multi-layer Map (Interactive Map)**: Integrates Tianditu, Gaode Map (satellite/hybrid), OpenStreetMap, OpenTopoMap, and CyclOSM. Features real-time WGS-84 to GCJ-02 coordinate reprojection for Chinese layers and slope/elevation gradient color coding.
- 📈 **Real-Time Elevation & Grade Profile**: High-performance Canvas rendering with screen-aware LOD sampling, high/low point badges, and crosshair sync with the interactive map.
- 📐 **6-Level Gradient Distribution & Technical Tips**: Breaks down routes into 6 uphill and 6 downhill slope brackets with practical trail running and hiking pacing, cadence, and trekking pole technical advice.
- 📋 **Multi-Mode Segment Statistics**: Analyze route sections by Checkpoints/Waypoints, Automatic Slope Variation, 1 km intervals, or 5 km intervals. Click any segment to highlight it on both map and chart.
- ⏱️ **Cumulative Arrival Times & Dynamic Segment Calculations**: Simply enter your cumulative arrival times (`H:MM`) for each checkpoint. Talus will automatically calculate the segment interval time between adjacent checkpoints and render it on the chart.
- 📍 **Swiss-Canyon-Style Rotated CP Names**: Checkpoint names are displayed vertically parallel to the vertical guide axes, completely resolving horizontal label overlaps when checkpoints are densely populated.
- 📊 **Three-Line High-Fidelity Statistics Box**: Bottom segment statistics (Distance, D+ Climb `▲`, and D- Descent `▼`) are cleanly formatted into three structured rows for maximum readability.
- 🎭 **Custom Symbols & Icons**: Configure various station types (Water `💧`, Food `🍽️`, Medical `🏥`, Drop Bag `🛍️`, Peak `🏔️`) with 12 vector symbols.
- 📱 **Multi-Ratio Wallpapers**: Export PNGs in Auto-fit (No Padding), 19.5:9 Full-screen Landscape (perfect for iPhone 17/16), or 20:9 Landscape (perfect for Xiaomi, Huawei Pura, and mainstream Android screens) at 1× / 2× / 3× resolutions.
- 📥 **JSON Backup & Templates**: Easily import or export all your checkpoint visual configurations as a local JSON file for future edits, with a one-click template download feature.
- 🌐 **Dynamic UI Internationalization**: Full Chinese and English bilingual support with auto browser locale detection.

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

1. **Upload Track**: Click **"📂 Upload Track (GPX/KML/KMZ)"** to select your route file. The elevation roadbook, interactive map, slope distribution, and segment statistics will immediately render.
2. **Switch Modes & Map Layers**:
   - In the toolbar, toggle **"Elevation Calc: Smooth (4m) / Raw Data"**.
   - In the map card, switch map layers (Tianditu, Gaode, OpenTopoMap) and color coding (Grade vs Elevation).
3. **Inspect Slope & Segments**:
   - Check slope grade percentages and pacing/posture recommendations under **"Grade Distribution & Technical Tips"**.
   - Browse **"Segment Statistics"** by Checkpoints, Auto slope, or 1km/5km, and click any row to highlight the segment on the map.
4. **Setup Checkpoints**:
   - In the Checkpoint Table, customize names, distances (km), notes, and arrival times. Interval times will automatically compute.
5. **Customize & Export**:
   - Select checkpoint rows to tweak icons, guide lines, and inside-chart annotations.
   - Choose your target **"Aspect Ratio"** and click **"🖼️ Download PNG ▾"** to export high-definition wallpapers.

---

## 🙏 Acknowledgements

This project references and integrates core technical designs, elevation hysteresis algorithms, map interactivity, and slope analysis features from the outstanding open-source project **[TrailScope](https://github.com/GSUI5051/TrailScope)**.

We express our sincere gratitude to **TrailScope** (https://github.com/GSUI5051/TrailScope) and its creators for their exceptional contribution to the trail running and outdoor GIS community.

---

## 🤝 Contributing & Feedback

If you utilized **Talus** for your training or race planning, we'd love to see your exported roadbook wallpapers! 
For bug reports, feature requests, or contributions, feel free to open an **Issue** or submit a **Pull Request**.

Happy running and safe finishes! 跑出热爱，平安完赛！🏃‍♂️🏔️
