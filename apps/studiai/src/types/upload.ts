export interface UploadedFile {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    uploadedAt: Date;
}

export interface UploadProgress {
    percentage: number;
    bytesUploaded: number;
    totalBytes: number;
}

export interface FileUploadProps {
    accept?: string;
    maxSize?: number;
    multiple?: boolean;
    onUpload: (files: File[]) => void;
    onError?: (error: Error) => void;
    className?: string;
    children?: React.ReactNode;
}

export interface UseFileUploadOptions {
    accept?: string;
    maxSize?: number;
    multiple?: boolean;
    autoUpload?: boolean;
}

export interface UseFileUploadReturn {
    files: UploadedFile[];
    isUploading: boolean;
    progress: UploadProgress | null;
    uploadFiles: (files: File[]) => Promise<UploadedFile[]>;
    removeFile: (id: string) => void;
    clearFiles: () => void;
    error: Error | null;
}

export interface UploadConfig {
    maxFileSize: number;
    allowedTypes: string[];
    uploadEndpoint: string;
    chunkSize?: number;
}
