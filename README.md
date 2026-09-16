# Hank Chang | IoT Systems & Telemetry Console
> **Assignment**: DIC 1 (Do In Class 1) — Personal Page & Live Time System  
> **Author**: Hank Chang  
> **Institution**: National Chung Hsing University (NCHU IoT 2026)  
> **Repository**: [https://github.com/hankyyyyyy/NCHU_IOT](https://github.com/hankyyyyyy/NCHU_IOT)

---

## 🔗 Live Demonstration

👉 **Live Site**: [https://hankyyyyyy.github.io/NCHU_IOT/](https://hankyyyyyy.github.io/NCHU_IOT/)

![Live Console Preview](demo_preview.png)

---

## 🎨 Original Design Philosophy (DIC 1 Guidelines)

This project strictly adheres to the course assignment mandate: **"Do not directly copy the teacher's template; engineer your own distinctive personal style."**

Every visual layer, structural layout, animation, and interaction has been built from scratch to reflect an original **IoT Systems & Telemetry Console**:

### 1. Asymmetric Split-Console Layout
- Replaces the generic vertical card stack with an asymmetric dual-column console layout:
  - **Left Identity Column**: Massive modern typography (`HANK CHANG.`), researcher tagline, hardware competency badges, and quick actions.
  - **Right Telemetry Column**: Radial orbital time station with a sweeping SVG progress dial and multi-hub timezone switcher.

### 2. Radial Orbital SVG Clock Engine
- An original circular SVG ring dial dynamically calculating the exact second's progress via `stroke-dashoffset` interpolation.
- **Multi-Hub Timezone Switcher**: Clickable timezone buttons (`Taipei UTC+8`, `Tokyo +9`, `London +1`, `New York -4`, `San Francisco -7`) that immediately convert the main clock display and date to that locale.
- **Dynamic Daytime Indicator**: Context-aware greetings that adapt to morning, afternoon, evening, and night.
- Day progress meter tracking percentage of the day completed.

### 3. Interactive CLI Cyber Terminal
- An in-browser command-line interface with interactive prompt `hank@nchu:~$`.
- Supports built-in commands (`help`, `about`, `projects`, `time`, `contact`, `clear`) and one-click quick action chips.

### 4. Real-Time Hardware Telemetry Simulation
- Live telemetry stats monitoring simulated ESP32 gateway ping latency with dynamic jitter, MCU clock frequency, and memory buffer.
- Keyframe animated continuous signal continuity waveform.

### 5. Dynamic Theme Accent Engine
- On-the-fly theme switcher allowing visitors to toggle between **Amber Horizon** (`#f59e0b`), **Cyber Emerald** (`#10b981`), and **Electric Cyan** (`#00f2fe`) with persistent state.

### 6. Auto-Saving Research Notes Pad
- Integrated quick notes memo area that saves input automatically to browser `localStorage` with real-time feedback.

---

## 🛠️ Technology Stack

| Layer | Technology | Usage & Implementation |
| :--- | :--- | :--- |
| **Structure** | Semantic HTML5 | Clean accessible markup with unique element IDs and responsive containers |
| **Styling** | Vanilla CSS3 | Custom blueprint grid overlay, CSS custom properties, theme accents, glass panels |
| **Typography** | Google Fonts | `Space Grotesk` (headings/numbers), `Plus Jakarta Sans` (body), `JetBrains Mono` (telemetry/CLI) |
| **Logic** | Vanilla JavaScript (ES6+) | SVG radial calculation, timezone conversion, CLI command parser, autosave engine |
| **Deployment** | GitHub Pages & Git | Static cloud hosting and automated continuous deployment |

---

## 📊 Project Architecture & Workflow

```mermaid
flowchart TD
    subgraph S1["Phase 1: Original Concept Definition"]
        A["Course Mandate: DIC 1"] --> B["Objective: 100% Original Design"]
        B --> C1["Layout: Asymmetric Split Console"]
        B --> C2["Clock: Radial SVG Orbital Dial"]
        B --> C3["Interactivity: CLI Terminal & Hubs"]
    end

    subgraph S2["Phase 2: Frontend Engineering"]
        C1 & C2 & C3 --> D["index.html (Semantic Structure)"]
        D --> E["style.css (Blueprint Grid & Glassmorphism)"]
        D --> F["app.js (Radial Math & Timezone Engine)"]
    end

    subgraph S3["Phase 3: Real-Time Telemetry & State"]
        F --> G1["Circular Seconds SVG Math (1000ms loop)"]
        F --> G2["Multi-Zone Converter (Intl.DateTimeFormat)"]
        F --> G3["Interactive Terminal Parser"]
        F --> G4["Theme Accent Switcher (localStorage)"]
    end

    subgraph S4["Phase 4: Cloud Deployment"]
        G1 & G2 & G3 & G4 --> H["Git Version Control"]
        H --> I["Push to GitHub (hankyyyyyy/NCHU_IOT)"]
        I --> J["Live Deployment via GitHub Pages"]
    end

    classDef phase fill:#0d111a,stroke:#f59e0b,stroke-width:2px,color:#fff;
    classDef step fill:#131722,stroke:#ff5722,stroke-width:1.5px,color:#f8fafc;
    class S1,S2,S3,S4 phase;
    class A,B,C1,C2,C3,D,E,F,G1,G2,G3,G4,H,I,J step;
```

---

## 📦 How to Run Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/hankyyyyyy/NCHU_IOT.git
   cd NCHU_IOT
   ```

2. **Open directly**:
   - Double-click `index.html` in any modern web browser.

3. **Or serve via Python**:
   ```bash
   python -m http.server 3000
   ```
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 📂 Project Structure

```
.
├── .gitignore          # Git exclusion rules
├── README.md           # Comprehensive project documentation & architecture
├── app.js              # Radial SVG dial, timezone switcher, CLI terminal & state
├── demo_preview.png    # Live preview screenshot
├── index.html          # Semantic HTML5 asymmetric console structure
└── style.css           # Blueprint grid, theme accents, and responsive layout
```

---

© 2026 **Hank Chang** • National Chung Hsing University (NCHU IoT)
