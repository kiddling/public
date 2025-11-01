# PDF Fonts Directory

This directory is reserved for custom font files to be embedded in PDF exports.

## Chinese Font Support

To enable Chinese font support in PDFs:

1. Obtain a Chinese font file (e.g., Noto Sans SC, Source Han Sans)
2. Convert the font to Base64 or keep as TTF/OTF
3. Update `utils/design-log-pdf.ts` to register the font with pdfmake

## Example Font Registration

```typescript
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'

// Load custom fonts
pdfMake.vfs = pdfFonts.pdfMake.vfs
pdfMake.fonts = {
  ...pdfMake.fonts,
  NotoSansSC: {
    normal: 'NotoSansSC-Regular.ttf',
    bold: 'NotoSansSC-Bold.ttf',
    italics: 'NotoSansSC-Regular.ttf',
    bolditalics: 'NotoSansSC-Bold.ttf'
  }
}

// Use in document definition
const docDefinition = {
  defaultStyle: {
    font: 'NotoSansSC'
  },
  // ... rest of definition
}
```

## Font Licensing

Ensure you have the proper license to embed and distribute any fonts used in your PDFs.

### Recommended Open Source Chinese Fonts

- **Noto Sans SC**: Google's open-source font (OFL license)
- **Source Han Sans**: Adobe's open-source font (OFL license)
- **WenQuanYi**: Open-source Chinese font (GPL license)

## Current Implementation

The current PDF export uses the default Roboto font which has limited Chinese character support. For production use with Chinese content, you should:

1. Add a Chinese font to this directory
2. Update the PDF utility to use the Chinese font
3. Test with various Chinese characters

## File Size Considerations

Chinese fonts are typically 10-20MB in size. Consider:
- Using subset fonts with only required characters
- Hosting fonts on CDN if deploying to web
- Implementing lazy loading for PDF export feature
