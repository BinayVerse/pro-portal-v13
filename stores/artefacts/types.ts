export interface ArtefactGoogleDriveFile {
  id: string
  name: string
  mimeType: string
  size: string
  type: string
  webViewLink?: string
  thumbnailLink?: string
  modifiedTime?: string
  googleAccessToken?: string
}

export interface GoogleDriveResponse {
  statusCode: number
  status: string
  data: ArtefactGoogleDriveFile[]
  message: string
  otherFiles: number
}

export interface GoogleDriveFetchResult {
  success: boolean
  files: ArtefactGoogleDriveFile[]
  message: string
}

export interface DocumentCategory {
  id: string
  name: string
  org_id: string
  added_by?: number
  added_by_name?: string
  document_count?: number
  created_at?: string
  updated_at?: string
}
