import {
  deleteObject,
  getDownloadURL,
  listAll,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import type {
  FirebaseStorage,
  StorageReference,
  UploadTaskSnapshot,
} from 'firebase/storage';
import { useCallback, useState } from 'react';

import { storage } from '@/lib/firebase';

import { useAuth } from './useAuth';

interface UseStorageReturn {
  uploadFile: (
    file: File,
    path?: string,
    metadata?: Record<string, unknown>
  ) => Promise<string | null>;
  deleteFile: (filePath: string, isUserFile?: boolean) => Promise<boolean>;
  getFileURL: (
    filePath: string,
    isUserFile?: boolean
  ) => Promise<string | null>;
  listFiles: (
    directoryPath?: string,
    isUserDirectory?: boolean
  ) => Promise<Array<{ name: string; fullPath: string; url: string }>>;
  getStorageRef: (filePath: string) => StorageReference;
  getUserStorageRef: (filePath: string) => StorageReference | null;
  uploading: boolean;
  progress: number;
  error: Error | null;
  downloadURL: string | null;
}

/**
 * Custom hook for interacting with Firebase Storage
 * @param storagePath - Base path in storage bucket for operations
 */
export function useStorage(storagePath: string = 'uploads'): UseStorageReturn {
  const { user } = useAuth();
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<Error | null>(null);
  const [downloadURL, setDownloadURL] = useState<string | null>(null);

  /**
   * Get a storage reference
   * @param filePath - Path to the file, will be appended to base path
   */
  const getStorageRef = useCallback(
    (filePath: string): StorageReference => {
      const fullPath = `${storagePath}/${filePath}`;
      return ref(storage as FirebaseStorage, fullPath);
    },
    [storagePath]
  );

  /**
   * Get a user-specific storage reference
   * @param filePath - Path to the file, will be appended to user ID and base path
   */
  const getUserStorageRef = useCallback(
    (filePath: string): StorageReference | null => {
      if (!user) return null;

      const fullPath = `${storagePath}/${user.id}/${filePath}`;
      return ref(storage as FirebaseStorage, fullPath);
    },
    [user, storagePath]
  );

  /**
   * Upload a file to Firebase Storage
   * @param file - File to upload
   * @param path - Path where to store the file (optional)
   * @param metadata - File metadata (optional)
   */ const uploadFile = useCallback(
    async (
      file: File,
      path?: string,
      metadata?: Record<string, unknown>
    ): Promise<string | null> => {
      if (!storage) return null;

      setUploading(true);
      setProgress(0);
      setError(null);
      setDownloadURL(null);

      try {
        // Create unique filename
        const fileExtension = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;

        // Determine full path
        const filePath =
          path !== undefined && path !== '' ? `${path}/${fileName}` : fileName;
        const storageRef = user
          ? getUserStorageRef(filePath)
          : getStorageRef(filePath);

        if (storageRef == null) {
          throw new Error('Failed to create storage reference');
        }

        // Start upload with progress monitoring
        const uploadTask = uploadBytesResumable(storageRef, file, metadata);

        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot: UploadTaskSnapshot) => {
              const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setProgress(progress);
            },
            error => {
              const errorObject =
                error instanceof Error ? error : new Error(String(error));
              setError(errorObject);
              setUploading(false);
              reject(error);
            },
            () => {
              // Handle completion asynchronously
              void (async () => {
                try {
                  const downloadURL = await getDownloadURL(
                    uploadTask.snapshot.ref
                  );
                  setDownloadURL(downloadURL);
                  setUploading(false);
                  setProgress(100);
                  resolve(downloadURL);
                } catch (err: unknown) {
                  setError(
                    err instanceof Error
                      ? err
                      : new Error('Failed to get download URL')
                  );
                  setUploading(false);
                  reject(err);
                }
              })();
            }
          );
        });
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err : new Error('Unknown upload error')
        );
        setUploading(false);
        return null;
      }
    },
    [user, getUserStorageRef, getStorageRef]
  );

  /**
   * Delete a file from Firebase Storage
   * @param filePath - Path to the file to delete
   * @param isUserFile - Whether the file is in a user's directory
   */
  const deleteFile = useCallback(
    async (filePath: string, isUserFile: boolean = true): Promise<boolean> => {
      if (!storage) return false;

      try {
        const storageRef =
          isUserFile && user
            ? getUserStorageRef(filePath)
            : getStorageRef(filePath);

        if (storageRef == null) {
          throw new Error('Failed to create storage reference');
        }

        await deleteObject(storageRef);
        return true;
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err : new Error('Failed to delete file')
        );
        return false;
      }
    },
    [user, getUserStorageRef, getStorageRef]
  );

  /**
   * Get download URL for a file
   * @param filePath - Path to the file
   * @param isUserFile - Whether the file is in a user's directory
   */
  const getFileURL = useCallback(
    async (
      filePath: string,
      isUserFile: boolean = true
    ): Promise<string | null> => {
      if (!storage) return null;

      try {
        const storageRef =
          isUserFile && user
            ? getUserStorageRef(filePath)
            : getStorageRef(filePath);

        if (storageRef == null) {
          throw new Error('Failed to create storage reference');
        }

        const url = await getDownloadURL(storageRef);
        return url;
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err : new Error('Failed to get file URL')
        );
        return null;
      }
    },
    [user, getUserStorageRef, getStorageRef]
  );

  /**
   * List all files in a directory
   * @param directoryPath - Path to the directory
   * @param isUserDirectory - Whether the directory is in a user's directory
   */
  const listFiles = useCallback(
    async (directoryPath: string = '', isUserDirectory: boolean = true) => {
      if (!storage) return [];

      try {
        const directoryRef =
          isUserDirectory && user
            ? getUserStorageRef(directoryPath)
            : getStorageRef(directoryPath);

        if (directoryRef == null) {
          throw new Error('Failed to create storage reference');
        }

        const result = await listAll(directoryRef);

        // Get download URLs for all items
        const filesPromises = result.items.map(async itemRef => {
          const url = await getDownloadURL(itemRef);
          return {
            name: itemRef.name,
            fullPath: itemRef.fullPath,
            url,
          };
        });

        const files = await Promise.all(filesPromises);
        return files;
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err : new Error('Failed to list files')
        );
        return [];
      }
    },
    [user, getUserStorageRef, getStorageRef]
  );

  return {
    uploadFile,
    deleteFile,
    getFileURL,
    listFiles,
    getStorageRef,
    getUserStorageRef,
    uploading,
    progress,
    error,
    downloadURL,
  };
}

export default useStorage;
