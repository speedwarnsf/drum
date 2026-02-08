# Drum Practice App - Production Ready

A comprehensive, production-grade drum practice application with advanced audio features, real-time feedback, and gamified learning progression. Built for serious drummers who want to improve their timing, technique, and musicality.

## 🎯 Key Features

### 🎵 **Advanced Audio Engine**
- **Bulletproof Metronome:** Web Audio API-powered with multiple click sounds
- **Low-Latency Tap Detection:** Real-time onset detection with frequency analysis
- **Audio Recording:** High-quality practice session recording with playback
- **Multiple Click Sounds:** Woodblock, rim shot, digital, cowbell, hi-hat options
- **Tempo Trainer:** Gradual BPM increases for building speed

### 🎓 **Comprehensive Learning System**
- **40 Essential Rudiments:** Complete PAS rudiment library with notation
- **Visual Music Notation:** Interactive drum notation with proper sticking
- **Spaced Repetition:** SM-2 algorithm for optimal skill retention
- **Structured Curriculum:** Progressive learning path with prerequisites
- **Practice Recommendations:** AI-powered daily lesson generation

### 📊 **Advanced Progress Tracking**
- **Achievement System:** 25+ unlockable badges across 6 categories
- **Practice Streaks:** Gamified consistency tracking with visual calendar
- **Detailed Analytics:** Session history, accuracy trends, skill progression
- **Real-time Feedback:** Beat accuracy visualization and timing analysis

### 📱 **Production Mobile Experience**
- **Optimized Tap Pads:** Low-latency drum kit interface
- **Haptic Feedback:** Physical feedback for enhanced practice experience
- **PWA Support:** Offline practice, home screen installation
- **Touch-optimized:** Professional mobile drum interface

### 🎨 **Visual Feedback System**
- **Real-time Waveform:** Live audio visualization during practice
- **Beat Accuracy Display:** Visual timing feedback with tolerance zones
- **Progress Charts:** Weekly/monthly practice visualization
- **Skill Radar:** Multi-dimensional skill level tracking

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Payments:** Stripe
- **Audio:** Web Audio API, MediaRecorder API
- **PWA:** Service Worker, Manifest, Offline support
- **Styling:** Modern CSS with production-grade responsive design

## Complete Feature Set

### 🥁 **Core Practice Features**
- AI-generated personalized practice plans
- Adaptive difficulty based on performance feedback
- Pattern library with 50+ drum grooves across 9 categories
- Audiation training with Gordon Method syllables
- Maintenance mode for pattern retention
- Competency gates with diagnostic assessments

### 🎯 **Advanced Practice Tools**
- **Enhanced Metronome:** Multiple sounds, gap drills, visual pulse
- **Tempo Trainer:** Automatic BPM progression for building speed
- **Beat Accuracy Tracker:** Real-time timing feedback with tolerance zones
- **Practice Session Timer:** Automatic session tracking and statistics
- **Recording System:** Session recording with community feedback sharing

### 📈 **Progress & Analytics**
- Practice streak tracking with calendar visualization
- Detailed session statistics and performance metrics
- Skill progression tracking across timing, technique, rudiments, creativity
- Achievement system with common, rare, epic, and legendary badges
- Weekly and monthly practice analytics
- Personal best tracking and milestone celebrations

### 🎮 **Gamification & Motivation**
- **25+ Achievements:** Practice sessions, streaks, accuracy, tempo milestones
- **Progress Dashboard:** Comprehensive visual progress tracking
- **Streak System:** Daily practice streaks with fire emoji motivation
- **Skill Leveling:** RPG-style skill progression system
- **Community Features:** Share recordings and get feedback

### 📱 **Mobile & PWA**
- **Progressive Web App:** Install to home screen, works offline
- **Service Worker:** Background sync, push notifications, cache management
- **Responsive Design:** Optimized for all screen sizes
- **Touch Interface:** Professional drum pad layout with haptic feedback
- **Offline Practice:** Core features work without internet connection

### 🎵 **Music Education**
- **Rudiment Library:** Complete 40 essential rudiments from PAS
- **Music Notation:** Interactive drum notation with playback
- **Practice Tips:** Detailed guidance for each rudiment
- **Common Mistakes:** Learn what to avoid for faster progress
- **Video Integration:** Support for tutorial video links

### 🔊 **Audio Technology**
- **Web Audio API:** Professional-grade audio processing
- **Real-time Analysis:** Onset detection, frequency analysis, timing measurement
- **Low Latency:** Optimized for responsive drumming experience
- **Multiple Formats:** Support for various audio codecs
- **Background Audio:** Practice continues when app is backgrounded

## 🚀 Quick Start

### Production Deployment (repodrum.com)
The app is live and production-ready at **https://repodrum.com**

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open the enhanced practice interface:**
   - Main app: [http://localhost:3000/drum](http://localhost:3000/drum)
   - Enhanced practice: [http://localhost:3000/drum/practice-enhanced](http://localhost:3000/drum/practice-enhanced)

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Admin (optional - grants unlimited credits)
ADMIN_EMAIL=your_admin_email@example.com
NEXT_PUBLIC_ADMIN_EMAIL=your_admin_email@example.com

# OpenAI (for lesson generation)
OPENAI_API_KEY=your_openai_api_key
```

## 🎵 Practice Modes

### 1. Enhanced Practice Mode (`/drum/practice-enhanced`)
**Full-featured practice environment with all production tools**
- Real-time audio visualization
- Professional drum tap pad with haptic feedback  
- Beat accuracy analysis with visual feedback
- Multi-mode practice (Free, Rudiment, Tempo Training)
- Live session statistics and achievement tracking

### 2. AI-Generated Daily Cards (`/drum/today`)
**Personalized practice plans based on your progress**
- Adaptive difficulty based on recent performance
- Spaced repetition scheduling for optimal learning
- Integration with rudiment progression system
- Session recording and reflection tools

### 3. Rudiment Library (`/drum/patterns`) 
**Complete educational resource for drum rudiments**
- 40 essential rudiments with proper notation
- Interactive practice with visual feedback
- Progressive difficulty and prerequisite tracking
- Practice tips and common mistake guidance

### 4. Progress Dashboard (`/drum/progress`)
**Comprehensive analytics and achievement tracking**
- Practice streak visualization with calendar
- Skill progression radar charts
- Achievement gallery with rarity system
- Weekly and monthly practice analytics

## 🎯 Key Practice Features

### Enhanced Metronome
- **Multiple Click Sounds:** Classic, woodblock, rim shot, digital, cowbell, hi-hat
- **Tempo Trainer:** Gradual BPM increases for building speed
- **Gap Drills:** Practice with silent gaps to develop internal timing
- **Visual Pulse:** Beat visualization for visual learners
- **Low Latency:** Web Audio API for precise timing

### Real-Time Audio Analysis
- **Onset Detection:** Automatic detection of drum hits with frequency analysis
- **Beat Accuracy:** Visual feedback showing timing precision
- **Waveform Display:** Real-time audio visualization during practice
- **Recording System:** Session recording with playback and sharing

### Mobile Drum Interface
- **Touch-Optimized Pads:** Professional drum kit layout for mobile
- **Haptic Feedback:** Physical feedback for enhanced mobile practice
- **Low-Latency Audio:** Optimized for responsive drumming on mobile devices
- **PWA Support:** Install as app, works offline

### Achievement System
- **25+ Achievements** across 6 categories (Practice, Timing, Rudiments, Consistency, Milestones, Special)
- **Rarity Levels:** Common, Uncommon, Rare, Epic, Legendary badges
- **Real-time Notifications:** Unlock achievements during practice
- **Progress Tracking:** Visual progress bars for upcoming achievements

## 📱 PWA Features

### Offline Support
- **Core Features Available Offline:** Metronome, rudiment practice, local recording
- **Automatic Sync:** Uploads practice data when connection returns
- **Service Worker:** Background sync and cache management
- **Local Storage:** Save progress and practice sessions locally

### Home Screen Installation
- **Add to Home Screen:** Install as native app on mobile devices
- **App Shortcuts:** Quick access to practice modes from home screen
- **Background Audio:** Continue practice when app is backgrounded
- **Push Notifications:** Practice reminders and streak notifications

## 🔧 Technical Architecture

### Audio Engine
- **Web Audio API:** Professional-grade audio processing
- **MediaRecorder API:** High-quality session recording
- **Real-time Analysis:** FFT analysis for onset detection and frequency classification
- **Cross-browser Compatibility:** Fallback support for older browsers

### State Management
- **Local Storage:** Practice progress, achievements, user preferences
- **IndexedDB:** Large audio recordings and session data
- **Supabase Integration:** Cloud sync for user accounts
- **Real-time Updates:** Live progress tracking during sessions

### Performance Optimization
- **Service Worker Caching:** Aggressive caching for offline performance
- **Code Splitting:** Lazy loading of heavy audio processing components
- **Image Optimization:** Compressed assets and progressive loading
- **Mobile-First Design:** Optimized for mobile device performance

## Database Setup

The database schema is defined in `supabase/schema.sql`. Tables include:

- `drum_sessions` - Practice session logs
- `drum_profiles` - User settings (level, kit, goals)
- `drum_entitlements` - Lesson credits
- `drum_purchases` - Stripe purchase records
- `drum_lesson_uses` - Track which lessons have been used

To apply the schema to a new Supabase project, run the SQL in the Supabase dashboard or use:

```bash
npx supabase db push
```

## Regenerating Types

If you modify the database schema, regenerate TypeScript types:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/database.types.ts
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
# SM-2 spaced repetition algorithm tests (29 tests)
npx tsx test-spaced-repetition.ts

# Critical path tests (38 tests)
npx tsx tests/critical-paths.test.ts

# Database integration tests (requires Supabase env vars)
npx tsx test-spaced-repetition-e2e.ts
```

**Test Coverage:**
- SM-2 spaced repetition algorithm
- Pattern library structure and validation
- Quality rating system  
- Learning progression simulation
- Edge cases and boundary conditions
- Audio engine initialization and cleanup
- Achievement system progression logic
- Rudiment progression tracking
- Mobile touch interface responsiveness

### Manual Testing Checklist

**Audio Features:**
- [ ] Metronome starts/stops cleanly across different BPMs
- [ ] All click sounds work (classic, woodblock, rim, digital, cowbell, hihat)
- [ ] Tempo trainer increases BPM gradually as expected
- [ ] Audio recording captures and plays back correctly
- [ ] Tap detection responds accurately to drum hits

**Mobile Experience:**
- [ ] Tap pads respond to touch with minimal latency
- [ ] Haptic feedback works on supported devices
- [ ] App installs as PWA from home screen
- [ ] Offline practice mode functions without internet
- [ ] Orientation changes don't break layout

**Progress System:**
- [ ] Achievements unlock at correct milestones  
- [ ] Streak tracking updates correctly across days
- [ ] Progress dashboard shows accurate statistics
- [ ] Rudiment completion saves and syncs properly

### Spaced Repetition System

The app uses the SM-2 algorithm for optimal practice scheduling:
- **Quality ratings 0-5:** Control interval adjustments
- **Ease factor 1.3-3.0:** Personalizes difficulty
- **Automatic scheduling:** Reviews spaced for long-term retention

See `app/drum/_lib/spacedRepetition.ts` for the full implementation.

## Build

```bash
npm run build
npm run start
```

## 🚀 Production Deployment

### Vercel (Recommended)
1. **Connect Repository:** Link your GitHub repo to Vercel
2. **Environment Variables:** Add all required env vars in Vercel dashboard
3. **Build Settings:** 
   ```bash
   Build Command: npm run build
   Install Command: npm install
   Output Directory: .next
   ```
4. **Domain:** Configure custom domain (repodrum.com)
5. **Deploy:** Automatic deployments on push to main branch

### PWA Configuration
- **Manifest:** Configured in `/public/manifest.json`
- **Service Worker:** Located at `/public/sw.js`  
- **Icons:** All PWA icons in `/public/icons/`
- **Offline Support:** Automatically enabled via service worker

### Performance Optimizations
- **Image Optimization:** Next.js automatic image optimization
- **Code Splitting:** Lazy loading of audio components
- **Caching Strategy:** Aggressive service worker caching
- **Mobile Performance:** Optimized for mobile devices

### Monitoring & Analytics
- **Performance Tracking:** Real-time audio latency monitoring
- **User Analytics:** Practice session and achievement tracking
- **Error Reporting:** Client-side error tracking and reporting
- **Usage Metrics:** Feature adoption and engagement analysis

## 📊 Production Metrics

### Performance Targets
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s  
- **Audio Latency:** < 50ms on modern devices
- **Offline Functionality:** Core features 100% offline capable
- **Mobile Performance Score:** > 90 (Lighthouse)

### Browser Support
- **Modern Browsers:** Chrome 80+, Firefox 75+, Safari 14+, Edge 80+
- **Mobile Browsers:** iOS Safari 14+, Chrome Mobile 80+
- **PWA Support:** All modern browsers with service worker support
- **Audio API Support:** Web Audio API required for enhanced features

### Scalability Considerations
- **Database:** Supabase PostgreSQL with connection pooling
- **File Storage:** Supabase storage for audio recordings
- **CDN:** Vercel Edge Network for global performance
- **Caching:** Multi-layer caching (service worker, CDN, database)

## 🛠️ Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production
npm run build
```

### Code Organization
```
app/drum/
├── _lib/           # Core business logic
│   ├── audioEngine.ts      # Advanced metronome & audio
│   ├── tapDetection.ts     # Real-time tap detection
│   ├── rudimentLibrary.ts  # 40 essential rudiments
│   ├── achievementSystem.ts # Gamification system
│   └── spacedRepetition.ts # Learning algorithm
├── _ui/            # Production React components
│   ├── EnhancedMetronome.tsx
│   ├── DrumTapPad.tsx
│   ├── WaveformVisualizer.tsx
│   ├── RudimentNotation.tsx
│   └── ProgressDashboard.tsx
├── practice-enhanced/  # Main production interface
├── styles/         # Production-grade CSS
└── [routes]/       # Page routes
```

### Contribution Guidelines
1. **Feature Requests:** Open GitHub issues with detailed requirements
2. **Bug Reports:** Include browser info, steps to reproduce, audio setup
3. **Pull Requests:** Include tests, follow existing code patterns
4. **Audio Testing:** Test across different devices and audio setups
5. **Mobile Testing:** Verify touch interface and PWA functionality

## 🎵 Usage Examples

### For Practice
1. **Daily Practice:** Use `/drum/today` for AI-generated practice plans
2. **Rudiment Focus:** Use `/drum/practice-enhanced` in rudiment mode
3. **Speed Building:** Use tempo trainer for gradual BPM increases
4. **Timing Work:** Use beat accuracy analyzer for precision training

### For Learning
1. **Rudiment Study:** Browse complete library at `/drum/patterns`
2. **Progress Tracking:** Monitor improvement at `/drum/progress`
3. **Achievement Goals:** Work toward unlocking rare achievements
4. **Session Analysis:** Review recordings and timing accuracy

### For Mobile Practice
1. **Install PWA:** Add to home screen for native app experience
2. **Offline Practice:** Use core features without internet
3. **Haptic Feedback:** Enable for enhanced mobile drumming experience
4. **Quick Access:** Use home screen shortcuts for different practice modes

## 🤝 Support & Community

### Getting Help
- **Documentation:** Complete feature documentation in this README
- **Issues:** GitHub issues for bug reports and feature requests
- **Community:** Share recordings and get feedback via app

### Development Support
- **TypeScript:** Full type safety across the application
- **Modern React:** Latest React patterns with hooks and context
- **Web Standards:** Built on Web Audio API, Service Workers, PWA standards
- **Cross-platform:** Works on desktop, mobile, and tablet devices

## License

Private - All rights reserved

---

**Built with ❤️ for drummers who take their practice seriously**

*Experience professional-grade drum practice tools at [repodrum.com](https://repodrum.com)*
