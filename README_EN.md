# 🏔️ Talus - Trail Roadbook Generator & Trail Analytics

[简体中文](README.md) | [English](README_EN.md)

**Talus** is an interactive **trail running roadbook and pacing planner** for runners, coaches, and race directors.

Load a GPX / KML / KMZ route, mark your checkpoints on the elevation profile, enter one target finish time to have it split across segments, lock and fine-tune the parts you know, then export a high-resolution roadbook image sized for phone screens. A map, grade distribution, and technique tips help you get to know the course.

> [!NOTE]
> 👤 **Developer**: Built by **Laurent L** via Vibe Coding.  
> 🔒 **100% Client-Side Privacy**: Everything runs in your browser. Track parsing, calculations, PNG exports, and autosave happen locally. **No track data is ever uploaded.**

---

## ✨ Key Features

- 🧭 **Guided steps**: A step bar at the top (Upload track → Set checkpoints → Target time → Fine-tune → Export) ticks itself off from your data and tells you what to do next. Every step stays clickable; nothing is forced.
- 📂 **Drag and drop**: Drop a GPX / KML / KMZ track or a JSON settings file anywhere on the page. No file at hand? Start with "Try a sample course".
- 📍 **Checkpoints**: GPX waypoints become checkpoints automatically (with Undo). **Double-click** the profile to add a checkpoint right there, and edit names and distances directly in the plan table.
- 🎯 **Target time split**: Enter a target finish time and it is split across segments by "effort distance" (km + D+ in m ÷ 100). Typing a segment time locks it 🔒; the remaining segments are re-balanced so the total always matches the target.
- 📋 **Race plan table**: One row per checkpoint with distance, segment mini profile, gain / loss, segment time, stop time, ETA (with a day/night icon), and the segment's carbs / water / sodium needs, all editable inline. On phones each row becomes a card.
- 🍌 **Fuel needs**: Each segment's carbs, water, and sodium, worked out from its planned time (stops not included). Defaults are carbs 40–90 g/h, water 450–750 ml/h, sodium 300–600 mg/h; change them to your own range or a single number. The race total is shown above the table.
- 🌙 **Real sunrise, sunset, and night sections**: Sunrise and sunset are computed for the course's location and race date, in the race's local time zone (guessed from the course; pick it by hand for races abroad if needed). The icon next to each ETA shows daylight, around sunset, night, or around sunrise, and the profile shades the sections where you'll need a headlamp.
- ⛰️ **Climb list and high-altitude hints**: Main climbs found from the terrain (where, which segment, length, gain, average grade, steepest 200 m, top altitude); click one to locate it on the profile and map. Courses above 2,500 m also get the high-altitude stretches, the planned time up there, an altitude-sickness note, and 2,500 m / 3,500 m reference lines on the profile.
- 💾 **Local autosave**: The track and every setting are saved in this browser and come back next time; "Import ▾ → New roadbook" clears them.
- 📈 **Interactive roadbook profile**: Move over the profile to see distance, altitude, and grade while the map marker follows. Clicking a table row or a profile segment highlights it on the profile, map, and table at once.
- 🎨 **3 color modes**: Classic bars, grade gradient, elevation gradient.
- ⚡ **2 gain algorithms**: Smooth (4 m hysteresis, filters GPS / barometer noise and is closer to watch and official figures) and raw data.
- 🗺️ **Multi-source map**: OpenStreetMap, OSM Humanitarian, OpenTopoMap (contour/topographic), CyclOSM, plus Tianditu (road / satellite / terrain) and Gaode (hybrid / road, with automatic WGS-84 → GCJ-02 correction); switch at any time. Importing a track switches to the Tianditu road map in China and to OpenStreetMap elsewhere. Tick "Hiking routes" to overlay waymarked hiking routes from [Waymarked Trails](https://hiking.waymarkedtrails.org) (not available on Gaode, whose coordinate system doesn't line up). If you pick Tianditu and its tiles fail to load, the map falls back automatically.
- 📐 **6-level grade distribution and tips**: Uphill and downhill split into 6 levels (≤5%, 5–10%, 10–15%, 15–25%, 25–35%, >35%) with cadence, pole, posture, and shock-absorption advice.
- 🖌️ **Checkpoint styling**: 9 aid-station icons, guide line color and thickness, custom labels at 6 positions inside the chart (with rotation), and multi-line notes.
- 📱 **Wallpaper-ready export**: Canvas ratio Auto, 19.5:9 (iPhone and similar), or 20:9 (most Android phones), at 1× / 2× / 3×. Exported images embed the web fonts, so they match what you see on screen.
- 🖨️ **A4 printable plan**: One page with the roadbook profile, the plan table (with fuel needs and day/night), and the climb list. Print it, or save it as a PDF from the print dialog.
- 💾 **JSON settings import / export**: Saves checkpoints, target time, locked segments, and all visual settings so you can pick up where you left off.

---

## 📖 Step-by-Step Guide

The page reads top to bottom in workflow order: **Roadbook profile → Race plan → Map and grade analysis**. The step bar always shows where you are.

### Step 1: Upload the track
1. **Drop** a `.gpx`, `.kml`, or `.kmz` file on the page, or click "Choose file" in the profile area (also under "Import ▾ → Upload track file" in the top bar).
2. On load, Talus automatically:
   - draws the elevation profile and places the finish at the end of the track;
   - turns GPX waypoints into checkpoints (Undo is in the notification);
   - uses the first point's timestamp as the start time, if the track has one;
   - switches the base map to suit the region: Tianditu road map in China, OpenStreetMap elsewhere. If the current base map already suits that region (say satellite in China, or OpenTopoMap abroad), your choice is kept.
3. Just exploring? Click "Try a sample course" to load a synthetic ~42 km demo course.

### Step 2: Set checkpoints
- **Double-click the profile** to add a checkpoint at that distance.
- **Add checkpoint** inserts one halfway between the selected checkpoint and the next.
- **Edit names and distances in the race plan table**; rows re-sort by distance.
- Click the **settings button** on a row (or double-click the row) for details: aid-station icon, guide line, in-chart labels, notes, and "Use for segment split stats" (whether it splits the segment boxes under the profile).
- Deleting a checkpoint can be undone from the notification too.

### Step 3: Set your target time
1. Above the race plan table, set the **Start time** and **Target finish**. The target accepts `14:00`, `13h30`, or just `14` (meaning 14 hours). Enter the start in the race's local time; the **Time zone** next to it is guessed from the course and shows that day's sunrise and sunset, so check it for races abroad.
2. Segment times are split by effort distance (km + D+ in m ÷ 100) and marked "From target"; arrival times appear on the profile.
3. The summary above the table tells you whether the plan hits the target, or by how much locked segments and stops overshoot it.

> No target? Blank segments use a default pace (12 min/km + 10 min per 100 m of climb) and are marked `≈`. These estimates appear in the table only, never on the exported roadbook.

### Step 4: Fine-tune (optional)
- **Lock a segment** by typing its time, e.g. `1:45`, `1h45`, or `105` (minutes). It gets a lock 🔒 and the other unlocked segments are re-balanced. Click the lock to go back to automatic.
- **Stop times**: Enter the minutes spent at each aid station in the "Stop" column. Stops count toward the total; the ETA excludes the stop at that checkpoint, and the leave time is shown underneath.
- The icon next to each ETA shows daylight ☀️, around sunset 🌅, night 🌙, or around sunrise 🌄, from the real sun altitude at that checkpoint and time. Shading on the profile marks the planned night sections (lighter for twilight), so you know when you'll need a headlamp.
- **Fuel needs**: In the "Fuel per hour" row, enter carbs (g), water (ml), and sodium (mg) per hour as a range (`40-90`) or one number (`60`); leave a field blank to hide it. The last column shows each segment's amounts, from its planned time without aid-station stops. For reference: up to about 90 g/h of carbs in races over 2 hours, 30–50 g/h typical in ultras over 6 hours; water 450–750 ml/h; sodium 300–600 mg/h (about 500–700 mg per litre), per the [ISSN ultra-marathon position stand (Tiller et al., 2019)](https://pmc.ncbi.nlm.nih.gov/articles/PMC6839090/).

### Step 5: Export the roadbook
1. Pick the **Canvas** ratio in the profile header (it also changes the on-screen preview):
   - **Auto**: compact, no padding;
   - **19.5:9**: iPhone and similar phones;
   - **20:9**: most Android phones (Xiaomi, Huawei, Samsung, and others).
2. Adjust **Colors**, **Gain** algorithm, and **Font sizes** in the same header if needed (race title, CP names, altitude, times, notes, segment boxes, and bottom distances each have their own size).
3. Click **"Export ▾"** in the top bar and choose **Standard 1×**, **HD 2×** (recommended), or **Ultra HD 3×** to download the PNG.
4. Choose **"Print race plan"** for the A4 sheet (or save it as a PDF from the print dialog); Ctrl+P prints the same sheet.
5. Choose **"Export roadbook settings"** to save a JSON file, and restore it later with "Import ▾ → Import roadbook settings". The JSON doesn't contain the track itself, so upload the same track as well. In the same browser you don't need to: the track and settings are saved automatically and come back next time.

### Reference: climbs and altitude
**Climbs and altitude**, at the bottom of the page, finds the main climbs from the terrain. It complements the checkpoint-based plan: the plan tells you how much you climb between two checkpoints, the climb list tells you where the hard climbs are, how long and steep they are, and which segment they fall in. Click a row to locate it on the profile and map. On courses above 2,500 m it also lists the high-altitude stretches and the planned time spent up there.

---

## 🗂️ Settings File Format

"Import ▾ → Download template" gives you an example. Main fields:

```json
{
  "raceName": "Talus Classic Trail 100K",
  "startTime": "2026-08-28T06:00",
  "utcOffset": "auto",
  "targetTime": "14:00",
  "carbsPerHour": "40-90",
  "waterPerHour": "450-750",
  "sodiumPerHour": "300-600",
  "elevationMode": "smooth",
  "colorMode": "classic",
  "exportRatio": "20-9",
  "checkpoints": [
    { "name": "Start", "distance": 0, "segmentTime": "0:00", "icon": "start" },
    { "name": "CP1", "distance": 15, "segmentTime": "1:45", "stopDuration": 5, "icon": "classic" },
    { "name": "CP2", "distance": 52, "segmentTime": "", "stopDuration": 15, "icon": "dropbag" },
    { "name": "Finish", "distance": 100, "segmentTime": "", "icon": "finish" }
  ]
}
```

- An empty `segmentTime` means "split from the target time"; a value locks that segment.
- `stopDuration` is in minutes.
- `utcOffset` is the race's time zone: `auto` guesses it from the course, or give a fixed value such as `+02:00`.
- `carbsPerHour` / `waterPerHour` / `sodiumPerHour` are the hourly carbs (g), water (ml), and sodium (mg), as a range or one number; an empty string hides that line.
- Older files that only have `arrivalTime` (cumulative arrival times) still import and are converted to segment times.

---

## 🚀 Live Demo & Local Setup

### 1. Online Access
Visit the live GitHub Pages deployment:  
**🔗 [https://feelthesea.github.io/TalusTrailPlanner/](https://feelthesea.github.io/TalusTrailPlanner/)**

### 2. Run Locally
Talus is a static site with no build step. The sample course and the export fonts are loaded over HTTP, so serve the folder rather than opening `index.html` directly.

```bash
# 1. Clone the repository
git clone https://github.com/feelthesea/TalusTrailPlanner.git

# 2. Enter project directory
cd TalusTrailPlanner

# 3. Start a local HTTP server (e.g. with Python)
python -m http.server 8080

# 4. Open in browser: http://localhost:8080
```

### 3. Code Structure
| File | Role |
|---|---|
| `index.html` / `style.css` | Page structure, styles, and line icons |
| `js/app.js` | State, Chinese / English UI, step bar, race plan table, import / export |
| `js/gpx-parser.js` | GPX / KML / KMZ parsing, distance and grade calculation |
| `js/trail-math.js` | Color scales, coordinate correction, gain algorithms |
| `js/trail-analysis.js` | Grade distribution, segment statistics, target time split, climb detection, high-altitude stretches |
| `js/sun.js` | Sun altitude, sunrise / sunset, race time zone |
| `js/storage.js` | Local autosave (localStorage + IndexedDB) |
| `js/profile.js` | SVG roadbook profile and its interactions |
| `js/trail-map.js` | Leaflet map and base map sources |
| `js/export.js` | PNG export with embedded fonts |
| `fonts/` | Self-hosted web fonts |
| `samples/sample-trail.gpx` | Sample course (synthetic demo track) |

---

## 🙏 Acknowledgements

This project references and incorporates algorithms and UI design patterns from the open-source project **[TrailScope](https://github.com/GSUI5051/TrailScope)** for map interaction, elevation smoothing, gradient distribution, and segment statistics.

Special thanks to **TrailScope** (https://github.com/GSUI5051/TrailScope) and its author!

The Barlow Condensed, IBM Plex Mono, and Plus Jakarta Sans web fonts are licensed under the SIL Open Font License 1.1; see the `fonts/` folder.

---

## 🤝 Contribution & Feedback

If you find **Talus** useful for your training or race organization, feel free to share your roadbooks!  
For bug reports or feature suggestions, please open an **Issue** or submit a **Pull Request**.

Happy trails and safe running! 🏃‍♂️🏔️
