# Chrome AI Playground

A modern web application that leverages Chrome 138+'s built-in AI APIs for translation, language detection, and text summarization. Built with React, TypeScript, Tailwind CSS, and Magic UI components for stunning visual effects.

## 🚀 Features

### 🌐 AI Translator
- Real-time translation between multiple languages
- Intuitive interface with source and target language selection
- Powered by Chrome's Translator API
- Support for 15+ languages including English, Spanish, French, German, Italian, Portuguese, Russian, Chinese, Japanese, Korean, and more

### 🔍 Language Detector
- Automatic detection of any text's language
- Confidence levels for enhanced accuracy
- Utilizes Chrome's Language Detector API
- Instant results with percentage confidence scores

### 📝 AI Summarizer
- Generate concise summaries of long texts
- Multiple summary types: TL;DR, key points, teaser, headline
- Customizable summary length and format
- Based on Chrome's Summarizer API

### ✨ Visual Effects & Animations
- Smooth animations with Motion (Framer Motion)
- Animated grid patterns in background
- Magic cards with cursor tracking effects
- Blur fade entrance animations
- HyperText animated title
- Progress indicators with smooth transitions
- Responsive design with dark/light theme support

## 🛠️ Tech Stack

- **React 18** - Modern UI framework with hooks
- **TypeScript** - Static typing for enhanced development
- **Tailwind CSS** - Utility-first CSS framework
- **Motion (Framer Motion)** - Production-ready motion library
- **Magic UI** - Specialized components with advanced effects
- **Shadcn/ui** - High-quality UI component library
- **Sonner** - Toast notifications
- **Vite** - Fast build tool and development server
- **Chrome AI APIs** - Built-in browser AI capabilities

## 📋 Prerequisites

### Chrome Setup (REQUIRED)

This application requires Chrome 138+ with specific experimental features enabled:

1. **Download Chrome Canary/Dev**: 
   - Chrome Canary: https://www.google.com/chrome/canary/
   - Chrome Dev: https://www.google.com/chrome/dev/

2. **Enable Chrome Flags**:
   Navigate to `chrome://flags` and enable the following flags:
   ```
   #optimization-guide-on-device-model - Enabled
   #prompt-api-for-gemini-nano - Enabled
   #summarization-api-for-gemini-nano - Enabled
   #translation-api - Enabled
   #language-detection-api - Enabled
   ```

3. **Configure Gemini Nano**:
   - Go to `chrome://components`
   - Find "Optimization Guide On Device Model"
   - Click "Check for update"
   - Restart Chrome after update completes

4. **Verify APIs**:
   - Open DevTools (F12)
   - In Console, verify: 
     ```javascript
     console.log(window.Translator);
     console.log(window.LanguageDetector);
     console.log(window.Summarizer);
     ```
   - All should return objects (not undefined)

## 🚀 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd chromeAI
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   - Navigate to `http://localhost:5173`
   - Ensure you're using Chrome 138+ with enabled flags

## 💡 Usage Guide

### AI Translator
1. Select source and target languages from the dropdown
2. Enter text in the translation textarea
3. Click "Translate" button
4. View real-time translation results
5. Toast notifications confirm successful operations

### Language Detector
1. Enter any text in the analysis textarea
2. Click "Detect Language" button
3. Get detected language with confidence percentage
4. Results show language code and accuracy level

### AI Summarizer
1. Select desired summary type (TL;DR, Key Points, Teaser, Headline)
2. Enter long text content
3. Click "Generate Summary" button
4. Receive concise, formatted summary

## 🎨 Visual Features

### Animations & Effects
- **Animated Grid Pattern**: Dynamic background grid with opacity transitions
- **Blur Fade**: Smooth element entrance animations
- **Motion Transitions**: Scale, rotate, and position animations
- **HyperText**: Character-by-character text animation
- **Progress Indicators**: Real-time operation feedback

### UI Components
- **Magic UI Integration**: Advanced visual effects and interactions
- **Responsive Tabs**: Clean organization of different AI features
- **Custom Language Selector**: Searchable combobox with flag icons
- **Card Components**: Elevated containers with hover effects
- **Toast Notifications**: User feedback for all operations

## 🔧 Project Structure

```
src/
├── components/
│   ├── ui/
│   │   ├── blur-fade.tsx         # Entrance animation effect
│   │   ├── button.tsx            # Custom button component
│   │   ├── card.tsx              # Card container component
│   │   ├── input.tsx             # Input form component
│   │   ├── label.tsx             # Form label component
│   │   ├── progress.tsx          # Progress bar component
│   │   ├── select.tsx            # Select dropdown component
│   │   ├── tabs.tsx              # Tab navigation component
│   │   ├── textarea.tsx          # Text area component
│   │   └── sonner.tsx            # Toast notification component
│   ├── magicui/
│   │   ├── animated-grid-pattern.tsx  # Animated background pattern
│   │   └── hyper-text.tsx        # Animated text component
│   └── Languague.tsx             # Language selection combobox
├── lib/
│   └── utils.ts                  # Utility functions
├── App.tsx                       # Main application component
├── main.tsx                      # Application entry point
└── index.css                     # Global styles and CSS variables
```

## 🎯 Browser Compatibility

- **Chrome 138+** (Required) - Full feature support
- **Chrome Canary/Dev** - Recommended for latest features
- **Other Browsers** - Not supported (APIs unavailable)

## 🔍 API Availability

The application automatically checks for API availability and provides user feedback:
- Green status: All APIs available and ready
- Yellow status: Some APIs may be loading
- Red status: APIs unavailable (check Chrome version and flags)

## 🚨 Troubleshooting

### Common Issues

1. **APIs not available**:
   - Verify Chrome version (138+ required)
   - Check all flags are enabled in `chrome://flags`
   - Restart Chrome after enabling flags

2. **Gemini Nano not working**:
   - Update components in `chrome://components`
   - Wait for model download to complete
   - Check internet connection for initial download

3. **Translations failing**:
   - Some language pairs may not be supported
   - Check console for specific error messages
   - Try different language combinations

## 📝 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Chrome 138+
5. Submit a pull request

## 🌟 Features Roadmap

- [ ] Batch translation support
- [ ] Custom language model fine-tuning
- [ ] Export functionality for results
- [ ] Voice input/output integration
- [ ] Real-time collaborative translation

---

**Note**: This application uses experimental Chrome APIs that are under active development. Features may change or become unavailable in different configurations. Always use the latest Chrome Canary or Dev build for the best experience.

**Disclaimer**: Chrome AI APIs are experimental and may not be available in all regions or Chrome configurations. This project is for demonstration and educational purposes.
