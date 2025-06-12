<div align="center">
  <img src="icons\assets\img\marquee-promo-tile.png" alt="OFE Auto-fill Extension" width="800" />
  
  <p><strong>🚀 Speed up your FEU Tech faculty evaluations with one click!</strong></p>
</div>

## ✨ What It Does

Automatically fills **all** evaluation fields on `solar.feutech.edu.ph` with your chosen rating level. Supports all rating types: numeric (1-5), quality levels (Poor-Outstanding), and agreement scales.

**Key Features:**
- 🎯 **One-Click Fill** - Fill entire evaluation forms instantly
- 👀 **Preview Mode** - See what will be selected before filling
- ⚙️ **6 Rating Levels** - Excellent, Good, Average, Below Average, Poor, N/A



## 🚀 Quick Setup

1. **Download** → [Get the latest release](https://github.com/GeloCreativeStudio/ofe-auto-fill/archive/refs/heads/main.zip)
2. **Install** → `chrome://extensions/` → Enable Developer Mode → Load unpacked
3. **Use** → Navigate to OFE page → Click extension icon → Select rating → Auto-Fill!

## 📖 Usage

1. Go to your FEU Tech evaluation page
2. Click the extension icon (should show "Ready to auto-fill")
3. Choose your rating level from dropdown
4. Hit **"Auto-Fill Evaluation"** or **"Preview Selection"**
5. Review and submit your evaluation

## 🛠️ For Developers

**Tech Stack:** Vanilla JS, Chrome Manifest V3, Chrome APIs (Storage, Tabs, Notifications)

```bash
# Quick start
git clone https://github.com/GeloCreativeStudio/ofe-auto-fill.git
cd ofe-auto-fill
# Load unpacked in chrome://extensions/
```

**Project Structure:**
```
src/
├── popup/          # Extension popup UI
├── content/        # Page interaction script  
└── background/     # Service worker
```

## ⚠️ Important Notes

- **Review Before Submit** - Always check your selections before submitting
- **Privacy First** - No data leaves your browser (local storage only)
- **Responsible Use** - Follow our university's evaluation policies

## 🐛 Troubleshooting

**Extension not working?**
- ✅ Ensure you're on: `solar.feutech.edu.ph/online/faculty/evaluation`
- ✅ Extension enabled in Chrome
- ✅ Try refreshing the page

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Educational Use Note:** While this software is open source under MIT License, please use it responsibly and in accordance with our university's evaluation policies.

---

<div align="center">
  <p><strong>Made with ❤️ for FEU Tech students</strong></p>
  <p>⭐ <a href="https://github.com/GeloCreativeStudio/ofe-auto-fill">Star us on GitHub</a> if this saves you time!</p>
</div>