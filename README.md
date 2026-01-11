# 🛰️ Parabolic Dish Antenna Designer

An interactive 3D visualization tool for designing parabolic dish antenna skeletons with concentric circles and supporting ribs.

![Parabolic Dish Designer Screenshot](https://raw.githubusercontent.com/GThinesh/parabolic-dish-designer/main/screenshot.png)

## 🎯 Live Demo

[**Try it here →**](https://gthinesh.github.io/parabolic-dish-designer/)

## ✨ Features

- **Interactive 3D Visualization** - Rotate and zoom to inspect the dish structure
- **Adjustable Parameters** - Configure focal length, diameter, circles, and ribs
- **Real-time Measurements** - Get precise values for design planning:
  - Rib arc lengths (center to each circle)
  - Circle circumferences
  - Dish depth
  - F/D ratio

## 📐 Mathematical Background

### Parabolic Equation

The dish surface follows the paraboloid equation:

```
z = r² / (4f)
```

Where:
- `z` = height at radius r (meters)
- `r` = radial distance from center (meters)
- `f` = focal length (meters)

### Focus Point

The focus is located at coordinates `(0, 0, f)` - directly above the vertex at a distance equal to the focal length.

### Arc Length Calculation

The arc length along a rib from center to radius R is calculated using numerical integration:

```
L = ∫₀ᴿ √(1 + (dz/dr)²) dr

Where: dz/dr = r / (2f)
```

This gives the actual material length needed for each rib segment.

### F/D Ratio

The focal-length-to-diameter ratio determines the dish's "depth":
- **F/D < 0.25** - Very deep dish
- **F/D = 0.25** - Focus at dish edge level
- **F/D = 0.5** - Common for satellite dishes
- **F/D > 0.5** - Shallow dish

## 🚀 Usage

### Online
Visit the [live demo](https://gthinesh.github.io/parabolic-dish-designer/)

### Local Development
```bash
# Clone the repository
git clone https://github.com/GThinesh/parabolic-dish-designer.git
cd parabolic-dish-designer

# Start a local server (Python 3)
python -m http.server 8080

# Open in browser
# http://localhost:8080
```

## 🔧 Controls

| Control | Action |
|---------|--------|
| Left-click + Drag | Rotate view |
| Scroll wheel | Zoom in/out |
| Sliders | Adjust parameters |

## 📦 Files

| File | Description |
|------|-------------|
| `index.html` | Main HTML structure with control panel |
| `style.css` | Dark glassmorphism UI styling |
| `main.js` | Three.js 3D rendering and calculations |

## 🛠️ Built With

- [Three.js](https://threejs.org/) - 3D graphics library
- Vanilla JavaScript, HTML, CSS

## 📄 License

MIT License - feel free to use for your antenna projects!

---

Made with ❤️ for radio enthusiasts and antenna builders
