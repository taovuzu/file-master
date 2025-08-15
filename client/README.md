# FileMaster - Professional PDF Tools Platform

A modern, feature-rich PDF processing platform built with React and Vite, designed to provide comprehensive PDF manipulation tools with a beautiful, responsive interface.

## ✨ Features

### PDF Operations
- **Merge PDF**: Combine multiple PDF files into one document
- **Split PDF**: Separate PDF into multiple files by pages or ranges
- **Compress PDF**: Reduce file size while maintaining quality
- **Convert PDF**: Convert to Word, Excel, or image formats
- **Protect PDF**: Add password protection and encryption
- **Unlock PDF**: Remove password protection securely
- **Rotate PDF**: Rotate pages to correct orientation
- **Add Watermarks**: Text and image watermarks with positioning
- **Add Page Numbers**: Various numbering formats and positions

### User Experience
- **Drag & Drop Upload**: Modern file upload with progress tracking
- **Real-time Processing**: Live progress updates and status tracking
- **File Validation**: Comprehensive file type and size validation
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Theme System**: Light/dark mode support
- **Performance Monitoring**: Core Web Vitals tracking

### Security & Privacy
- **Secure Processing**: Files automatically deleted after processing
- **No Registration**: Use tools without creating an account
- **Privacy First**: No file storage or data collection
- **Encryption**: Secure file transfer and processing

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite
- **UI Framework**: Ant Design + Tailwind CSS
- **State Management**: Redux Toolkit + React Context
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **File Handling**: React Dropzone
- **PDF Processing**: PDF.js + React PDF

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd file-master/client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
src/
├── apps/                 # Main application entry points
├── components/           # Reusable UI components
├── pages/               # Page components
├── layout/              # Layout components
├── hooks/               # Custom React hooks
├── context/             # React context providers
├── redux/               # Redux store and slices
├── utils/               # Utility functions
├── router/              # Routing configuration
├── forms/               # Form components
├── services/            # API services
├── request/             # HTTP request handling
└── style/               # Global styles and themes
```

## 🎨 Design System

The project uses a comprehensive design system with:
- **Design Tokens**: Typography, spacing, colors, shadows
- **Component Library**: Reusable UI components
- **Theme System**: Light/dark mode with CSS custom properties
- **Responsive Design**: Mobile-first approach

See [STYLE_GUIDE.md](src/style/STYLE_GUIDE.md) for detailed styling guidelines.

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Analytics
VITE_GA_MEASUREMENT_ID=your-ga-id
VITE_ANALYTICS_ENDPOINT=/api/analytics

# API Configuration
VITE_API_BASE_URL=https://api.example.com
VITE_API_TIMEOUT=30000

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PERFORMANCE_MONITORING=true
```

### Code Quality

- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting (configured via ESLint)
- **TypeScript Ready**: Designed for TypeScript migration
- **JSDoc**: Comprehensive documentation

## 🧪 Testing

```bash
# Unit tests (when implemented)
npm run test:unit

# Integration tests (when implemented)
npm run test:integration

# E2E tests (when implemented)
npm run test:e2e
```

## 📦 Performance

### Optimizations
- **Code Splitting**: Route-based lazy loading
- **Bundle Analysis**: Webpack bundle analyzer integration
- **Image Optimization**: WebP support and lazy loading
- **Caching**: Service worker and browser caching

### Monitoring
- **Core Web Vitals**: LCP, FID, CLS tracking
- **Custom Metrics**: Component render times, API response times
- **Performance Budgets**: Automated budget checking

## 🔒 Security

### File Security
- **Validation**: File type and size validation
- **Sanitization**: File name and content sanitization
- **Encryption**: Secure file transfer
- **Deletion**: Automatic file cleanup

### Application Security
- **HTTPS**: Secure communication
- **CSP**: Content Security Policy
- **XSS Protection**: Input sanitization
- **CSRF Protection**: Cross-site request forgery prevention

## 🌐 Internationalization

The application is prepared for internationalization with:
- **i18n Ready**: Internationalization framework structure
- **RTL Support**: Right-to-left language support
- **Locale Detection**: Automatic language detection

## 📱 Mobile Support

- **Responsive Design**: Mobile-first approach
- **Touch Friendly**: Touch-optimized interactions
- **Progressive Web App**: PWA capabilities ready
- **Offline Support**: Service worker implementation

## 🚀 Deployment

### Build Process
```bash
# Development build
npm run build

# Preview build
npm run preview
```

### Deployment Options
- **Vercel**: Zero-config deployment
- **Netlify**: Static site hosting
- **AWS S3**: Cloud hosting
- **Docker**: Containerized deployment

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards
- Follow ESLint rules
- Use consistent formatting with Prettier
- Document functions and components with JSDoc
- Write tests for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Documentation**: [docs.example.com](https://docs.example.com)
- **Issues**: [GitHub Issues](https://github.com/example/file-master/issues)
- **Discussions**: [GitHub Discussions](https://github.com/example/file-master/discussions)
- **Email**: support@example.com

---

**Built with ❤️ by the FileMaster Team**
