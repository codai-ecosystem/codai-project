'use client';

import type { JSX } from 'react';
import { useRef, useState, type ChangeEvent } from 'react';

import { Button, LoadingSpinner } from '@/components/ui';
import { useAuth, useStorage } from '@/hooks';

type FileUploaderProps = {
  onUploadComplete?: (url: string, filename: string) => void;
  maxSizeMB?: number;
  allowedTypes?: string[];
  userPath?: boolean;
  storagePath?: string;
  buttonText?: string;
};

export function FileUploader({
  onUploadComplete,
  maxSizeMB = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  userPath = true,
  storagePath = 'uploads',
  buttonText = 'Upload File',
}: FileUploaderProps): JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { user } = useAuth();
  const { uploadFile, uploading, progress, downloadURL } =
    useStorage(storagePath);

  // Click the hidden file input
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = event.target.files;

    if (!files || files.length === 0) {
      return;
    }
    const file = files[0];
    if (file == null) {
      return;
    }

    // Validate file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      setError(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
      event.target.value = '';
      return;
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File size exceeds the limit of ${maxSizeMB} MB`);
      event.target.value = '';
      return;
    }

    setSelectedFile(file);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (selectedFile == null) {
      setError('Please select a file first');
      return;
    }

    try {
      // Upload with a unique path based on file type
      const path = getPathByFileType(selectedFile.type);
      const url = await uploadFile(selectedFile, path, {
        contentType: selectedFile.type,
      });

      if (url != null && onUploadComplete) {
        onUploadComplete(url, selectedFile.name);
      }

      // Reset
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: unknown) {
      setError('Upload failed. Please try again.');
      console.error(err);
    }
  }; // Get appropriate storage path based on file type
  const getPathByFileType = (fileType: string) => {
    let basePath = '';
    if (fileType.startsWith('image/')) {
      basePath = 'images';
    } else if (fileType === 'application/pdf') {
      basePath = 'documents';
    } else {
      basePath = 'other';
    }

    // Include user path if enabled and user is available
    if (userPath === true && user !== null && user.id !== '') {
      return `${storagePath}/${user.id}/${basePath}`;
    }

    return `${storagePath}/${basePath}`;
  };

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept={allowedTypes.join(',')}
      />

      {/* UI */}
      <div className="flex flex-col items-start gap-4 md:flex-row">
        <div>
          <Button
            onClick={handleButtonClick}
            variant="outline"
            disabled={uploading}
          >
            {buttonText}
          </Button>
        </div>

        {selectedFile ? (
          <div className="flex-grow">
            <div className="flex items-center gap-2">
              <span className="max-w-[180px] truncate text-sm font-medium">
                {selectedFile.name}
              </span>
              <span className="text-xs text-muted-foreground">
                ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>

            <div className="mt-2">
              <Button
                onClick={() => {
                  void handleUpload();
                }}
                disabled={uploading}
                size="sm"
                variant="default"
              >
                {uploading ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner className="h-4 w-4" />
                    {progress.toFixed(0)}%
                  </span>
                ) : (
                  'Upload'
                )}
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Show progress bar during upload */}
      {uploading ? (
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}

      {/* Show download URL after successful upload */}
      {downloadURL != null && !uploading ? (
        <div className="break-all rounded-md bg-muted p-2 text-sm">
          <p className="mb-1 text-xs font-medium">File URL:</p>
          <a
            href={downloadURL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {downloadURL}
          </a>
        </div>
      ) : null}

      {/* Show error if any */}
      {error !== null && error !== '' ? (
        <div className="text-sm text-destructive">{error}</div>
      ) : null}
    </div>
  );
}
