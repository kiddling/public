# Design Log Tool Documentation

## Overview

The Design Log Tool provides a comprehensive solution for creating, managing, and sharing teaching design logs with persistence, autosave, version history, and export capabilities.

## Features

- **Local Persistence**: All data is stored in IndexedDB for offline access
- **Autosave**: Changes are automatically saved every 30 seconds
- **Version History**: Manual saves create version snapshots for easy recovery
- **JSON Import/Export**: Share and backup logs in JSON format
- **PDF Export**: Generate professional PDFs with Chinese font support
- **Print Support**: Optimized CSS for browser printing

## Storage Schema

### Design Log Data Structure

```typescript
interface DesignLogData {
  id: string                    // Unique identifier
  title: string                 // Log title (required)
  schoolName?: string           // School name
  courseName?: string           // Course name
  teacherName?: string          // Teacher name
  date?: string                 // Date in YYYY-MM-DD format
  objective?: string            // Teaching objectives
  content?: string              // Teaching content
  reflection?: string           // Teaching reflection
  attachments?: Array<{         // File attachments
    id: string
    name: string
    type: string
    size: number
    dataUrl?: string            // Base64 encoded file data
  }>
  updatedAt: number             // Last update timestamp
  createdAt: number             // Creation timestamp
}
```

### Version History Structure

```typescript
interface DesignLogVersion {
  id: string                    // Unique version identifier
  logId: string                 // Reference to the design log
  data: DesignLogData           // Complete snapshot of the log
  timestamp: number             // Version creation timestamp
  description?: string          // Optional version description
}
```

## Autosave Behavior

### Automatic Saving

- **Interval**: Every 30 seconds
- **Trigger**: Only saves if there are unsaved changes
- **Debounce**: Changes trigger a 1-second debounced save
- **Indicator**: Visual indicator shows save status:
  - "保存中..." (Saving...)
  - "上次保存: X 分钟前" (Last saved: X minutes ago)
  - Yellow dot indicates unsaved changes

### Manual Saving

- Click "手动保存" (Manual Save) button to force save
- Manual saves create version snapshots
- Useful for creating recovery points at important stages

### Save States

The application tracks the following states:

- `isSaving`: Boolean indicating if a save is in progress
- `lastSaved`: Date of the last successful save
- `hasUnsavedChanges`: Boolean indicating if there are pending changes
- `error`: String containing the last error message (if any)

## Version History

### Creating Versions

- Versions are automatically created on manual save
- Each version contains a complete snapshot of the log
- Versions are sorted by timestamp (newest first)

### Restoring Versions

1. Click "版本历史" (Version History) button
2. Browse available versions with timestamps
3. Click "恢复此版本" (Restore this version)
4. Confirm the restoration
5. The log is immediately updated and saved

### Version Retention

- Versions are stored indefinitely in IndexedDB
- Manual deletion of versions is not currently supported
- Consider implementing cleanup policies for old versions if needed

## Import/Export

### JSON Export

**Usage:**
1. Click "导出 JSON" (Export JSON) button
2. File is automatically downloaded with format: `design-log-{title}-{timestamp}.json`

**JSON Format:**
```json
{
  "id": "1234567890-abc123",
  "title": "Example Log",
  "schoolName": "Example School",
  "courseName": "Mathematics",
  "teacherName": "Teacher Name",
  "date": "2025-01-01",
  "objective": "Teaching objectives...",
  "content": "Teaching content...",
  "reflection": "Reflections...",
  "attachments": [],
  "updatedAt": 1704067200000,
  "createdAt": 1704067200000
}
```

### JSON Import

**Usage:**
1. Click "导入 JSON" (Import JSON) button
2. Select a JSON file
3. Choose import mode:
   - **Replace**: Overwrites current log (if creating new)
   - **Merge**: Keeps current ID but imports all other data

**Validation:**
- JSON structure is validated before import
- Required fields: `id`, `title`, `updatedAt`, `createdAt`
- Invalid imports display error message

**Error Handling:**
- "Invalid JSON format": File is not valid JSON
- "Invalid design log data structure": JSON doesn't match schema

### PDF Export

**Usage:**
1. Click "导出 PDF" (Export PDF) button
2. PDF is generated and automatically downloaded

**PDF Features:**
- A4 page size with proper margins
- Optional cover page with school branding
- Structured sections for all log fields
- Attachment list (metadata only)
- Generation timestamp footer
- Chinese typography support

**Customization Options:**
```typescript
interface PDFExportOptions {
  includeCoverPage?: boolean
  schoolName?: string
  courseName?: string
  teacherName?: string
  branding?: {
    logo?: string
    primaryColor?: string
    secondaryColor?: string
  }
}
```

**Limitations:**
- Attachment files are listed but not embedded in PDF
- Limited font selection (Roboto default)
- No custom page layouts
- Images in attachments are not rendered

### Browser Printing

**Usage:**
1. Use browser's print function (Ctrl+P or Cmd+P)
2. Print dialog shows optimized layout
3. Buttons and unnecessary UI elements are hidden

**Print Styles:**
- White background for all sections
- Removed shadows and borders
- Hidden action buttons
- Clean, professional layout

## Data Recovery

### Recovering from Crashes

1. Design logs are automatically saved to IndexedDB
2. On page reload, the last saved state is restored
3. Check "上次保存" (Last Saved) indicator for save status

### Recovering Old Versions

1. Open the log
2. Click "版本历史" (Version History)
3. Select the desired version
4. Click "恢复此版本" (Restore this version)

### Manual Backup

1. Regularly export logs to JSON
2. Store JSON files in a safe location
3. Can be imported back at any time

## Storage Management

### IndexedDB Structure

- **Database Name**: `design-log-db`
- **Database Version**: 1
- **Object Stores**:
  - `design-logs`: Main log storage
  - `design-log-versions`: Version history storage

### Storage Limits

- IndexedDB typically allows 50MB+ per domain
- Actual limit depends on browser and device
- Monitor attachment sizes to avoid exceeding limits

### Clearing Data

**Warning**: This operation cannot be undone!

```typescript
import { clearAllData } from '~/utils/design-log-storage'

// Clear all logs and versions
await clearAllData()
```

## Best Practices

### Regular Saving

- Trust the autosave but use manual save for important milestones
- Manual saves create version snapshots
- Save before making major changes

### Version Management

- Create versions at logical checkpoints
- Use descriptive version descriptions (if implementing)
- Regularly clean up old versions if storage is limited

### Attachments

- Keep attachment sizes reasonable (< 5MB each)
- Use compression for images when possible
- Consider external hosting for large files
- Store metadata and references instead of full files

### Backup Strategy

1. **Daily**: Rely on autosave for daily work
2. **Weekly**: Export to JSON for backup
3. **Monthly**: Archive old logs to external storage
4. **Before Major Changes**: Create manual version snapshot

### Data Migration

When moving to a new device:
1. Export all logs to JSON on old device
2. Store JSON files in cloud storage or transfer drive
3. Import logs on new device one by one

## Troubleshooting

### Autosave Not Working

**Symptoms**: Changes aren't being saved automatically

**Solutions**:
1. Check browser console for errors
2. Verify IndexedDB is enabled in browser settings
3. Check available storage space
4. Try manual save to test save functionality
5. Clear browser cache and reload

### Import Failed

**Symptoms**: "Invalid design log data structure" error

**Solutions**:
1. Verify JSON file is not corrupted
2. Check all required fields are present
3. Validate JSON syntax using a JSON validator
4. Ensure field types match schema

### PDF Export Issues

**Symptoms**: PDF doesn't generate or looks incorrect

**Solutions**:
1. Check browser console for errors
2. Verify pdfmake library is loaded
3. Reduce data size if very large
4. Try different browser
5. Clear browser cache

### Storage Full

**Symptoms**: Saves fail with storage errors

**Solutions**:
1. Delete old logs you no longer need
2. Remove large attachments
3. Export and archive old logs
4. Clear browser storage for other sites

### Version History Not Showing

**Symptoms**: Version history is empty

**Solutions**:
1. Versions are only created on manual save
2. Try creating a manual save
3. Check browser console for errors
4. Verify IndexedDB is working properly

## API Reference

### Storage Functions

```typescript
// Save/retrieve logs
await saveDesignLog(data: DesignLogData): Promise<void>
await getDesignLog(id: string): Promise<DesignLogData | undefined>
await getAllDesignLogs(): Promise<DesignLogData[]>
await deleteDesignLog(id: string): Promise<void>

// Version management
await saveVersion(version: DesignLogVersion): Promise<void>
await getVersion(id: string): Promise<DesignLogVersion | undefined>
await getVersionsByLogId(logId: string): Promise<DesignLogVersion[]>
await deleteVersion(id: string): Promise<void>

// Utilities
generateId(): string
validateDesignLogData(data: unknown): boolean
await exportToJSON(id: string): Promise<string>
await importFromJSON(json: string): Promise<DesignLogData>
await mergeImportedData(json: string, currentId?: string): Promise<DesignLogData>
await clearAllData(): Promise<void>
```

### Composable

```typescript
const {
  currentLog,           // Ref<DesignLogData | null>
  versions,             // Ref<DesignLogVersion[]>
  saveState,            // Ref<SaveState>
  manualSave,           // () => Promise<void>
  revertToVersion,      // (versionId: string) => Promise<void>
  createNewLog,         // () => void
  loadLog,              // (id: string) => Promise<void>
  exportLog,            // () => Promise<string>
  importLog,            // (json: string) => Promise<void>
  mergeImport,          // (json: string) => Promise<void>
} = useDesignLog(logId?: string)
```

### PDF Functions

```typescript
// Create PDF document definition
createDesignLogPDF(
  log: DesignLogData,
  options?: PDFExportOptions
): TDocumentDefinitions

// Generate PDF blob
await generatePDF(
  log: DesignLogData,
  options?: PDFExportOptions
): Promise<Blob>

// Download PDF
downloadPDF(blob: Blob, filename: string): void
```

## Future Enhancements

Potential improvements for future versions:

1. **Cloud Sync**: Sync logs across devices
2. **Collaboration**: Multi-user editing support
3. **Templates**: Pre-built log templates
4. **Search**: Full-text search across logs
5. **Tags**: Categorize logs with tags
6. **Export Formats**: Word, Excel, HTML exports
7. **Attachment Preview**: Image preview in PDF
8. **Version Diff**: Show changes between versions
9. **Auto-cleanup**: Automatic old version removal
10. **Batch Operations**: Export/import multiple logs

## Support

For issues or questions:
- Check browser console for error messages
- Review this documentation
- Test in different browsers
- Clear cache and try again
- Export data before troubleshooting

## Security Considerations

- All data stored locally in IndexedDB
- No server-side storage or transmission
- Attachments stored as base64 in IndexedDB
- Consider encryption for sensitive data
- Regular backups recommended
- Be cautious when sharing exported JSON files
