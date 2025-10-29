# Interactive Utilities Suite

A comprehensive educational toolkit for design education, featuring design logic logs, case study tracking, AI prompt tools, video embedding, and resource management.

## 🌟 Features

### 1. Design Logic Logs (P-04 to P-06 Templates)
- **P-04**: Problem Definition & Context Analysis
- **P-05**: Creative Ideation & Solution Exploration
- **P-06**: Solution Evaluation & Reflection

**Features:**
- Interactive forms with pre-filled guidance
- Local storage persistence
- PDF export and print capabilities
- Iteration tracking
- Chinese font optimization

### 2. Case Study Tracker
- Persistent project management across lessons and cards
- Timeline view for project milestones
- Reference aggregation (lessons, cards, external resources)
- Resource management
- Status tracking (planning, in-progress, completed, archived)
- Tag-based organization

### 3. AI Prompt Cards
- Pre-configured prompt templates for design tasks
- One-click copy to clipboard
- Share functionality
- Version history tracking
- Export to text and PDF formats
- Category-based filtering

### 4. Video Embedding
- Support for Bilibili and Tencent Video (China-friendly)
- YouTube and Vimeo support
- Lazy loading for performance
- Privacy-respecting parameters
- Graceful fallback with error messaging
- Mobile-responsive design

### 5. Download Center
- Centralized resource management
- Strapi CMS integration
- File integrity verification (checksums)
- Offline availability indicators
- Search and filter capabilities
- Multiple file format support

### 6. PDF Export Utilities
- Server-side rendering optimization
- Chinese font support (Noto Sans SC, PingFang SC, Microsoft YaHei)
- Clean print layouts
- Metadata inclusion
- Multi-page support

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd interactive-utilities-suite
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure:
- `STRAPI_API_URL`: Your Strapi backend URL
- `STRAPI_API_TOKEN`: API token for Strapi authentication
- `NEXT_PUBLIC_APP_URL`: Your application URL

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
interactive-utilities-suite/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── design-logs/        # Design log templates
│   │   ├── case-studies/       # Case study tracker
│   │   ├── ai-prompts/         # AI prompt tools
│   │   ├── videos/             # Video gallery
│   │   ├── downloads/          # Download center
│   │   └── documentation/      # User documentation
│   ├── components/             # React components
│   │   ├── DesignLogForm.tsx   # Design log form component
│   │   ├── CaseStudyTracker.tsx # Case tracker component
│   │   ├── AIPromptCard.tsx    # AI prompt card component
│   │   ├── VideoEmbed.tsx      # Video embedding component
│   │   └── DownloadCenter.tsx  # Download center component
│   ├── lib/                    # Utility libraries
│   │   ├── utils.ts            # General utilities
│   │   ├── storage.ts          # Local storage management
│   │   ├── pdf-export.ts       # PDF export utilities
│   │   └── strapi.ts           # Strapi API integration
│   ├── types/                  # TypeScript type definitions
│   └── tests/                  # Test files
├── public/                     # Static assets
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── next.config.js              # Next.js configuration
└── README.md                   # This file
```

## 🧪 Testing

Run tests:
```bash
npm test
# or
yarn test
```

Run tests in watch mode:
```bash
npm run test:watch
# or
yarn test:watch
```

## 🔧 Configuration

### Strapi Integration

The download center integrates with Strapi CMS. To set up:

1. Install and configure Strapi
2. Create a content type called "Downloadable Resources" with fields:
   - title (Text)
   - description (Rich Text)
   - category (Text)
   - fileType (Text)
   - fileSize (Number)
   - file (Media)
   - checksum (Text)
   - offlineAvailable (Boolean)

3. Configure API permissions in Strapi
4. Update environment variables with your Strapi URL and API token

### Video Platform Support

Configure video embeds by providing video objects with:
- `platform`: 'bilibili' | 'tencent' | 'youtube' | 'vimeo'
- `videoId`: Platform-specific video identifier
- `title`: Video title
- `thumbnail`: (optional) Thumbnail image URL
- `duration`: (optional) Video duration

## 📖 Documentation

Comprehensive user documentation is available at `/documentation` route, including:

- Design Logic Log usage guide
- Case Study Tracker instructions
- AI Prompt Tool best practices
- Video embedding guidelines
- Download Center management
- FAQ and troubleshooting

## 🎨 Customization

### Styling
The project uses Tailwind CSS. Customize colors, fonts, and spacing in `tailwind.config.ts`.

### Chinese Font Support
Fonts are optimized for Chinese text:
- Noto Sans SC
- PingFang SC
- Microsoft YaHei

Add or modify fonts in `tailwind.config.ts` and `globals.css`.

## 🌐 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## 📝 Development Guidelines

### Code Style
- TypeScript for type safety
- Functional React components with hooks
- Tailwind CSS for styling
- ESLint for code quality

### Component Guidelines
- Keep components focused and reusable
- Use TypeScript interfaces for props
- Implement loading and error states
- Follow accessibility best practices

### Storage
- Use localStorage for client-side persistence
- Implement error handling for storage operations
- Provide export/backup functionality

## 🚢 Deployment

### Build for Production

```bash
npm run build
# or
yarn build
```

### Start Production Server

```bash
npm start
# or
yarn start
```

### Deploy to Vercel

The easiest way to deploy is using Vercel:

```bash
npm install -g vercel
vercel
```

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write or update tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Next.js team for the excellent framework
- Tailwind CSS for the utility-first CSS framework
- Strapi for the headless CMS
- All contributors and educators who provided feedback

## 📧 Support

For support, please:
- Check the documentation at `/documentation`
- Open an issue on GitHub
- Contact the development team

## 🗺️ Roadmap

Future enhancements:
- [ ] Real-time collaboration features
- [ ] Advanced analytics and insights
- [ ] Mobile app version
- [ ] Integration with more video platforms
- [ ] AI-powered design suggestions
- [ ] Multi-language support
- [ ] Cloud storage sync

## 📊 Performance

The application is optimized for:
- Fast initial page load
- Lazy loading of heavy components
- Efficient local storage usage
- Optimized PDF generation
- Responsive design for all devices

## 🔒 Privacy & Security

- All design logs stored locally
- No user data sent to servers without consent
- Privacy-respecting video embeds
- Secure Strapi API integration
- HTTPS recommended for production

---

Built with ❤️ for design education
