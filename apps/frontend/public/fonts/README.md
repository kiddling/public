# Self-Hosted Fonts Directory

This directory is for self-hosted font files to ensure reliable font loading for users in China, avoiding potential CDN blocking issues.

## Recommended Font: Source Han Sans CN

Source Han Sans (思源黑体) is an excellent choice for Chinese typography. It's an open-source Pan-CJK typeface family designed by Adobe in collaboration with Google.

### How to Add Fonts

1. **Download Font Files**
   - Visit [Adobe Fonts - Source Han Sans](https://github.com/adobe-fonts/source-han-sans)
   - Download the CN (Simplified Chinese) subset for smaller file sizes
   - Use WOFF2 format for best compression and browser support

2. **Subset Fonts (Recommended)**
   To reduce file size, create subsets containing only the characters you need:

   ```bash
   # Install fonttools
   pip install fonttools brotli

   # Create a subset (example with common Chinese characters)
   pyftsubset SourceHanSansCN-Regular.otf \
     --text-file=common-chars.txt \
     --output-file=source-han-sans-cn-regular.woff2 \
     --flavor=woff2 \
     --layout-features='*' \
     --no-hinting
   ```

3. **Name Convention**
   - Regular weight: `source-han-sans-cn-regular.woff2`
   - Medium weight: `source-han-sans-cn-medium.woff2`
   - Bold weight: `source-han-sans-cn-bold.woff2`

4. **Activate Fonts**
   After adding font files here:
   - Uncomment the `@font-face` declarations in `assets/css/fonts.css`
   - Uncomment the font preload links in `nuxt.config.ts` (app.head.link)
   - Uncomment 'Source Han Sans CN' in `tailwind.config.ts` (fontFamily.sans)

### File Size Guidelines

- **Full fonts**: 5-15 MB per weight (not recommended)
- **Subsetted fonts**: 500 KB - 2 MB per weight (recommended)
- **Minimal subset**: 200-500 KB per weight (for specific use cases)

For most applications, include:

- Regular (400)
- Medium (500)
- Bold (700)

### Font Display Strategy

The project uses `font-display: swap` to ensure text remains visible during font loading:

- Text appears immediately using fallback fonts
- Custom fonts swap in when loaded
- No blank text (FOIT - Flash of Invisible Text)

### Browser Support

WOFF2 format is supported by:

- Chrome 36+
- Firefox 39+
- Safari 12+
- Edge 14+
- All modern mobile browsers

### Testing

After adding fonts, test the loading:

```bash
# Start dev server
pnpm dev

# Check in browser DevTools:
# - Network tab: Verify font files load
# - Performance tab: Check font render timing
# - Lighthouse: Test performance impact
```

### Alternative: System Fonts

The project is configured to use system fonts by default, which:

- Load instantly (zero network requests)
- Are optimized for each platform
- Provide good Chinese typography support

System font stack (in `tailwind.config.ts`):

- PingFang SC (macOS/iOS)
- Hiragino Sans GB (older macOS)
- Microsoft YaHei (Windows)
- WenQuanYi Micro Hei (Linux)

For many projects, system fonts are sufficient and preferred.
