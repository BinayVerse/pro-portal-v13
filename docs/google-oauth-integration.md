# Google OAuth Integration for Google Drive

This document describes the Google OAuth integration that allows users to connect their Google Drive account and select files directly through the Google Picker interface.

## Features

- **OAuth2 Flow**: Secure authentication with Google Drive using OAuth2
- **Interactive File Selection**: Users can browse and select files from their Google Drive using Google Picker
- **Multi-file Selection**: Support for selecting multiple files at once
- **File Type Filtering**: Automatically filters supported file types (PDF, Word, TXT, CSV, Markdown, Images)
- **Access Token Management**: Handles OAuth access tokens securely

## Implementation

### Composable: `useGoogleDrive`

The main integration is handled by the `useGoogleDrive` composable located at `composables/useGoogleDrive.ts`.

#### Key Methods:

- `signInWithGoogle()`: Initiates the OAuth flow and opens the file picker
- `createPicker(accessToken)`: Creates and displays the Google Picker interface
- `pickerCallback(data)`: Handles the response from the picker when files are selected

#### Usage Example:

```typescript
const googleDrive = useGoogleDrive()

// Initiate OAuth flow and file selection
await googleDrive.signInWithGoogle()
```

### Component Integration

The integration is used in the `ArtefactUploadModal.vue` component under the "Google Drive" tab.

#### Flow:

1. User selects a file category
2. User clicks "Sign in with Google Drive" button
3. OAuth popup opens for Google authentication
4. Google Picker interface opens showing user's Drive files
5. User selects files and confirms
6. Files are processed and uploaded to the system

### Configuration

Ensure the following environment variables are set:

```env
NUXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### Google API Setup

The integration loads the following Google APIs:

1. **Google Identity Services (GIS)**: `https://accounts.google.com/gsi/client`
   - Used for OAuth2 authentication
2. **Google API Client**: `https://apis.google.com/js/api.js`
   - Used for Google Picker functionality

### Supported File Types

The integration automatically filters and supports these file types:

- **Documents**: PDF, Word (.doc, .docx), TXT, Markdown
- **Data**: CSV
- **Images**: PNG, JPEG, JPG

### Security Features

- OAuth2 secure authentication flow
- Access tokens are handled securely and not stored permanently
- File downloads use proper authorization headers
- Automatic cleanup of tokens and picker instances

### Error Handling

The integration includes comprehensive error handling for:

- Missing Google Client ID configuration
- API loading failures
- Authentication errors
- File selection cancellation
- Upload failures

### Backend Integration

The selected files are processed by the existing backend endpoints:

- Files with OAuth tokens use authenticated Google Drive API calls
- Files are downloaded and uploaded to S3 storage
- Database records are created for tracking

## Usage Tips

1. **Category Selection**: Users must select a file category before initiating the OAuth flow
2. **Popup Blockers**: Ensure popup blockers are disabled for the authentication flow
3. **File Limits**: The system respects Google Drive API limits and file size restrictions
4. **Multiple Selections**: Users can select multiple files at once using Ctrl/Cmd+click

## Troubleshooting

### Common Issues:

1. **"Google Client ID is missing"**: Ensure `NUXT_PUBLIC_GOOGLE_CLIENT_ID` is configured
2. **Popup blocked**: Check browser popup blocker settings
3. **Authentication failed**: User may need to clear browser cache or try incognito mode
4. **Picker not loading**: Check network connectivity and Google API availability

### Debug Mode:

The composable includes console logging for debugging. Check browser console for detailed error messages.
