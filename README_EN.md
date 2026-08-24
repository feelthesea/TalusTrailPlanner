# 🏔️ Talus - Trail Roadbook Generator & Trail Analytics

[简体中文](README.md) | [English](README_EN.md)

**Talus** is an interactive **trail running roadbook and elevation profile analytics tool** designed for runners, coaches, and race directors.

Upload GPX / KML / KMZ route files, explore the interactive map with real-time elevation profile synchronization, analyze 6-level uphill and downhill gradient distributions with practical technique coaching, view multi-mode segment breakdowns, configure aid stations (Checkpoints) with custom icons and annotations via a floating modal, and export crisp, wallpaper-ready roadbook images tailored to modern smartphone screen ratios.

> [!NOTE]
> 👤 **Developer**: Built by **Laurent L** via Vibe Coding.  
> 🔒 **100% Client-Side Privacy**: Runs completely inside your web browser. All GPX / KML / KMZ parsing, math calculations, and PNG exports happen locally. **No track data is ever uploaded to any server.**

---

## ✨ Key Features

- 📈 **Unified Interactive Elevation Profile**: Combines high-fidelity vector roadbook publishing with 60fps real-time exploration. Hovering or touching displays a live crosshair with elevation, distance, and slope grade, seamlessly synchronized with the map location cursor.
- 🎨 **3 Profile Color Schemes**: Switch instantly between "Classic Sisyf Bars", "Grade Gradient", and "Elevation Gradient".
- 🗺️ **Interactive Trail Map**: Supports Tianditu (Road/Satellite/Terrain), Gaode (Hybrid/Road with automatic WGS-84 to GCJ-02 reprojection), OpenStreetMap, OpenTopoMap, and CyclOSM.
- ⚡ **Dual Elevation Calculation Modes**: Switch between "Raw Data" and "Smooth Filter (4m Hysteresis)" to filter out barometric/GPS jitter and match official race data.
- 📐 **6-Level Gradient Distribution & Practical Technical Tips**: Breaks down routes into Flat (≤5%), Gentle (5-10%), Moderate (10-15%), Steep (15-25%), Very Steep (25-35%), and Extremely Steep (>35%) for uphill and downhill, complete with cadence, pole technique, and posture recommendations.
- 📋 **Multi-Mode Segment Statistics**: Analyze by Checkpoints, Auto Slope Variation, 1 km intervals, or 5 km intervals. Click any segment to highlight it simultaneously on the elevation profile and map.
- 📍 **Floating Checkpoint Settings Modal**: Click any CP row or the "⚙️" icon to open a modal for configuring 12 aid station icons, guide axis colors/thickness, and 6 custom inside-chart annotations (with rotation/alignment).
- 📊 **3-Line Pointed Segment Info Boxes**: Displays segment distance, climb (green `▲`), and descent (red `▼`) in clean hexagonal badges.
- 📱 **Multi-Ratio Wallpaper Export**: Supports Auto-fit (no padding), 19.5:9 (iPhone 17/16/15 iOS lockscreen wallpaper), and 20:9 (Xiaomi, Huawei, Android full-screen wallpaper) with 1×, 2× HD, and 3× Ultra HD print resolutions.
- 📥 **JSON Import / Export / Template**: Save all checkpoints and visual settings as a local JSON file to resume editing anytime.

---

## 📖 Step-by-Step User Guide

### Step 1: Import Your Route Track File (GPX/KML/KMZ)
1. Click **"📂 Upload Track (GPX/KML/KMZ)"** on the toolbar.
2. Select your route file (`.gpx`, `.kml`, or `.kmz`).
3. The application automatically computes and updates all 3 sections:
   - **Zone 1**: Generates the elevation profile with Start & Finish checkpoints;
   - **Zone 2**: Centers the interactive map with color-coded tracklines and calculates 8 summary metrics + 6-level gradient distributions;
   - **Zone 3**: Populates the Checkpoint list and segment statistics table.

### Step 2: Configure Race Information & Calculation Modes
1. Enter the **Race Name** (e.g. `UTMB 2026 100K`).
2. Select the **Start Time** (e.g. `Fri 18:00`) to compute passage times and weekdays for each station.
3. Choose the **⚡ Elevation Calc Mode**:
   - **Smooth (4m)** (Recommended): Filters sensor noise to reflect realistic climbing effort;
   - **Raw Data**: Displays raw cumulative GPS elevation.
4. Select the **🎨 Profile Color Mode**: Switch between Classic Sisyf Bars, Grade Gradient, and Elevation Gradient.

### Step 3: Add & Configure Checkpoints / Aid Stations
1. **Add a Checkpoint**: Click **"＋ Add Checkpoint"** in Zone 3.
2. **In-place Table Editing**:
   - Modify the **CP Name** directly in the table row;
   - Adjust the **Distance (km)**; the table automatically re-sorts and updates the roadbook;
   - Enter estimated segment time or arrival time.
3. **Open Detailed Visual Settings Modal**:
   - Click the **"⚙️"** settings icon (or double-click the row);
   - In the popup modal, configure:
     - **Station Symbol**: Start 🟢, Finish 🏁, Water Point 💧, Classic Aid 🍉, Drop Bag 🛍️, Assisted Aid 🤝, Peak 🏔️, Checkpoint 🚩, Danger ⚡;
     - **Vertical Guide Axis**: Line color and thickness (px);
     - **Inside Chart Annotations**: Add text at 6 positions (Top/Middle/Bottom on Left and Right) for pacing tips, pole reminders, or cutoff times, with customizable font size and 90° rotation;
     - **Stop Duration**: Aid station resting time in minutes;
   - Click **"✓ Save & Apply"**; changes immediately reflect on the profile and map.

### Step 4: Interactive Analytics & Live Tracking
1. **Real-time Map Sync**: Move your mouse or finger across the elevation profile in Zone 1. A crosshair displays instantaneous distance, altitude, and slope grade, while the red marker on the Leaflet map in Zone 2 tracks along the route.
2. **Base Map Switching**: Switch between Tianditu, Gaode, OpenStreetMap, OpenTopoMap, and CyclOSM.
3. **Slope Coaching**: Review the gradient distribution bars and read technical advice on stride length, poles, and impact absorption.
4. **Segment Statistics**: In Zone 3, switch between Checkpoints, Slope Changes, 1 km, and 5 km modes. Click any row to highlight the segment on both the elevation profile and the map.

### Step 5: Granular Font Adjustments & High-Resolution PNG Export
1. **Adjust Font Sizes**: Use the sidebar panel in Zone 1 to fine-tune font sizes (in pixels) for the title, CP names, segment climbs, times, notes, and cumulative distances.
2. **Select Aspect Ratio**:
   - **Auto-fit (No Padding)**: Clean and compact;
   - **19.5:9 Landscape**: Tailored for iPhone 17/16/15 lockscreen wallpapers;
   - **20:9 Landscape**: Tailored for Android (Xiaomi, Huawei, Samsung) full-screen wallpapers.
3. **Download PNG**: Click **"🖼️ Download PNG ▾"** and choose **1× Standard**, **2× HD (Recommended)**, or **3× Ultra HD (Print)**.
4. **Backup Configuration**: Click **"📤 Export JSON"** to save your roadbook configuration to your computer.

---

## 🚀 Live Demo & Local Setup

### 1. Online Access
Visit the live GitHub Pages deployment:  
**🔗 [https://feelthesea.github.io/TalusTrailPlanner/](https://feelthesea.github.io/TalusTrailPlanner/)**

### 2. Run Locally
```bash
# 1. Clone the repository
git clone https://github.com/feelthesea/TalusTrailPlanner.git

# 2. Enter project directory
cd TalusTrailPlanner

# 3. Start a local HTTP server (e.g. with Python)
python -m http.server 8080

# 4. Open in browser: http://localhost:8080
```

---

## 🙏 Acknowledgements

This project references and incorporates algorithms and UI design patterns from the open-source project **[TrailScope](https://github.com/GSUI5051/TrailScope)** for map interaction, elevation smoothing, gradient distribution, and segment statistics.

Special thanks to **TrailScope** (https://github.com/GSUI5051/TrailScope) and its author!

---

## 🤝 Contribution & Feedback

If you find **Talus** useful for your training or race organization, feel free to share your roadbooks!  
For bug reports or feature suggestions, please open an **Issue** or submit a **Pull Request**.

Happy trails and safe running! 🏃‍♂️🏔️
