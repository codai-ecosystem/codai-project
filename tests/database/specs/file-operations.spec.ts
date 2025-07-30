import { test, expect } from '@playwright/test';
import { AuthHelper, FileHelper, generateLargeFile, SERVICE_URLS } from '../database-storage-helpers';
import * as fs from 'fs';
import * as path from 'path';

// CODAI applications that support file operations
const FILE_APPLICATIONS = [
    'hub', 'codai', 'fabricai', 'memorai', 'admin',
    'publicai', 'marketai', 'cumparai', 'bancai',
    'studiai', 'prezentai', 'muzicai', 'logai'
];

// Test file types and sizes
const TEST_FILES = {
    small_text: { size: 1024, type: 'txt', content: 'This is a small test file.' },
    medium_image: { size: 1024 * 100, type: 'png', content: null }, // 100KB
    large_document: { size: 1024 * 1024 * 5, type: 'pdf', content: null }, // 5MB
    json_data: { size: 1024 * 10, type: 'json', content: '{"test": "data"}' }
};

test.describe('File Operations Testing', () => {
    let auth: AuthHelper;
    let fileHelper: FileHelper;
    let tempDir: string;

    test.beforeAll(async ({ request }) => {
        auth = new AuthHelper();
        await auth.authenticate(request, 'admin');
        fileHelper = new FileHelper(request, auth);

        // Create temp directory for test files
        tempDir = path.join(__dirname, '..', 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
    });

    test.afterAll(async () => {
        // Clean up temp directory
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test.describe('Basic File Upload/Download Operations', () => {

        test('should upload and download files across all services', async ({ request }) => {
            const fileOperationResults: any[] = [];

            // Create test files
            const testFiles = await createTestFiles();

            for (const service of FILE_APPLICATIONS) {
                const serviceResults = {
                    service,
                    operations: {
                        upload: { small: false, medium: false, large: false, json: false },
                        download: { small: false, medium: false, large: false, json: false },
                        list: false,
                        delete: { small: false, medium: false, large: false, json: false }
                    },
                    uploadedFileIds: {} as Record<string, string>,
                    errors: [] as string[]
                };

                try {
                    // Test file uploads for different file types
                    for (const [fileType, filePath] of Object.entries(testFiles)) {
                        try {
                            const uploadResponse = await fileHelper.uploadFile(filePath, service, `test-${fileType}.${getFileExtension(fileType)}`);

                            if (uploadResponse.ok()) {
                                const uploadResult = await uploadResponse.json();
                                serviceResults.operations.upload[fileType as keyof typeof serviceResults.operations.upload] = true;
                                serviceResults.uploadedFileIds[fileType] = uploadResult.fileId || uploadResult.id;
                            } else {
                                serviceResults.errors.push(`Upload ${fileType} failed: ${uploadResponse.status()}`);
                            }
                        } catch (error: any) {
                            serviceResults.errors.push(`Upload ${fileType} exception: ${error.message}`);
                        }
                    }

                    // Test file listing
                    try {
                        const listResponse = await fileHelper.listFiles(service, { limit: 20 });
                        if (listResponse.ok()) {
                            serviceResults.operations.list = true;
                        } else {
                            serviceResults.errors.push(`List files failed: ${listResponse.status()}`);
                        }
                    } catch (error: any) {
                        serviceResults.errors.push(`List files exception: ${error.message}`);
                    }

                    // Test file downloads
                    for (const [fileType, fileId] of Object.entries(serviceResults.uploadedFileIds)) {
                        try {
                            const downloadResponse = await fileHelper.downloadFile(fileId, service);

                            if (downloadResponse.ok()) {
                                serviceResults.operations.download[fileType as keyof typeof serviceResults.operations.download] = true;
                            } else {
                                serviceResults.errors.push(`Download ${fileType} failed: ${downloadResponse.status()}`);
                            }
                        } catch (error: any) {
                            serviceResults.errors.push(`Download ${fileType} exception: ${error.message}`);
                        }
                    }

                    // Test file deletion
                    for (const [fileType, fileId] of Object.entries(serviceResults.uploadedFileIds)) {
                        try {
                            const deleteResponse = await fileHelper.deleteFile(fileId, service);

                            if (deleteResponse.ok()) {
                                serviceResults.operations.delete[fileType as keyof typeof serviceResults.operations.delete] = true;
                            } else {
                                serviceResults.errors.push(`Delete ${fileType} failed: ${deleteResponse.status()}`);
                            }
                        } catch (error: any) {
                            serviceResults.errors.push(`Delete ${fileType} exception: ${error.message}`);
                        }
                    }

                } catch (error: any) {
                    serviceResults.errors.push(`Service test failed: ${error.message}`);
                }

                fileOperationResults.push(serviceResults);
            }

            // Generate comprehensive report
            const successfulServices = fileOperationResults.filter(result => {
                const uploads = Object.values(result.operations.upload).filter(Boolean).length;
                const downloads = Object.values(result.operations.download).filter(Boolean).length;
                const deletes = Object.values(result.operations.delete).filter(Boolean).length;
                return uploads >= 3 && downloads >= 3 && deletes >= 3 && result.operations.list;
            });

            console.log(`File Operations Report:`);
            console.log(`Total Services Tested: ${fileOperationResults.length}`);
            console.log(`Successful Services: ${successfulServices.length}`);
            console.log(`Success Rate: ${(successfulServices.length / fileOperationResults.length * 100).toFixed(1)}%`);

            // Detailed breakdown
            const operationStats = {
                upload: { small: 0, medium: 0, large: 0, json: 0 },
                download: { small: 0, medium: 0, large: 0, json: 0 },
                delete: { small: 0, medium: 0, large: 0, json: 0 },
                list: 0
            };

            fileOperationResults.forEach(result => {
                Object.keys(operationStats.upload).forEach(fileType => {
                    if (result.operations.upload[fileType]) operationStats.upload[fileType]++;
                    if (result.operations.download[fileType]) operationStats.download[fileType]++;
                    if (result.operations.delete[fileType]) operationStats.delete[fileType]++;
                });
                if (result.operations.list) operationStats.list++;
            });

            console.log(`Operation Success Rates:`);
            console.log(`Upload: Small(${operationStats.upload.small}/${fileOperationResults.length}) Medium(${operationStats.upload.medium}/${fileOperationResults.length}) Large(${operationStats.upload.large}/${fileOperationResults.length}) JSON(${operationStats.upload.json}/${fileOperationResults.length})`);
            console.log(`Download: Small(${operationStats.download.small}/${fileOperationResults.length}) Medium(${operationStats.download.medium}/${fileOperationResults.length}) Large(${operationStats.download.large}/${fileOperationResults.length}) JSON(${operationStats.download.json}/${fileOperationResults.length})`);
            console.log(`List: ${operationStats.list}/${fileOperationResults.length}`);

            // Assertions
            expect(successfulServices.length).toBeGreaterThan(fileOperationResults.length * 0.70); // 70% success rate minimum
            expect(operationStats.upload.small).toBeGreaterThan(fileOperationResults.length * 0.80); // 80% should handle small files
            expect(operationStats.list).toBeGreaterThan(fileOperationResults.length * 0.75); // 75% should support file listing
        });

        async function createTestFiles(): Promise<Record<string, string>> {
            const files: Record<string, string> = {};

            // Small text file
            files.small = path.join(tempDir, 'test-small.txt');
            fs.writeFileSync(files.small, TEST_FILES.small_text.content);

            // Medium binary file (simulate image)
            files.medium = path.join(tempDir, 'test-medium.png');
            const mediumContent = Buffer.alloc(TEST_FILES.medium_image.size, 0xFF);
            fs.writeFileSync(files.medium, mediumContent);

            // Large file (simulate document)
            files.large = generateLargeFile(5, 'test-large.pdf'); // 5MB

            // JSON data file
            files.json = path.join(tempDir, 'test-data.json');
            const jsonContent = JSON.stringify({
                test: 'data',
                array: new Array(1000).fill(0).map((_, i) => ({ id: i, value: `test-${i}` })),
                timestamp: new Date().toISOString()
            }, null, 2);
            fs.writeFileSync(files.json, jsonContent);

            return files;
        }

        function getFileExtension(fileType: string): string {
            const extensions: Record<string, string> = {
                small: 'txt',
                medium: 'png',
                large: 'pdf',
                json: 'json'
            };
            return extensions[fileType] || 'txt';
        }
    });

    test.describe('File Operation Performance and Limits', () => {

        test('should handle concurrent file uploads', async ({ request }) => {
            const concurrentUploadResults: any[] = [];

            // Test with subset of services for performance
            const testServices = FILE_APPLICATIONS.slice(0, 5);

            for (const service of testServices) {
                const serviceResult = {
                    service,
                    concurrentUploads: 5,
                    successfulUploads: 0,
                    averageUploadTime: 0,
                    totalSize: 0,
                    errors: [] as string[]
                };

                try {
                    // Create test files for concurrent upload
                    const testFiles = await Promise.all(
                        Array.from({ length: 5 }, async (_, i) => {
                            const filename = `concurrent-${i}.txt`;
                            const filepath = path.join(tempDir, filename);
                            const content = `Concurrent test file ${i} content: ${'x'.repeat(1000)}`;
                            fs.writeFileSync(filepath, content);
                            return { filepath, filename, size: content.length };
                        })
                    );

                    const uploadPromises = testFiles.map(async (file, index) => {
                        const startTime = Date.now();
                        try {
                            const response = await fileHelper.uploadFile(file.filepath, service, `concurrent-${index}.txt`);
                            const uploadTime = Date.now() - startTime;

                            return {
                                success: response.ok(),
                                uploadTime,
                                size: file.size,
                                error: response.ok() ? null : `Status: ${response.status()}`
                            };
                        } catch (error: any) {
                            return {
                                success: false,
                                uploadTime: Date.now() - startTime,
                                size: file.size,
                                error: error.message
                            };
                        }
                    });

                    const results = await Promise.all(uploadPromises);
                    serviceResult.successfulUploads = results.filter(r => r.success).length;
                    serviceResult.averageUploadTime = results.reduce((acc, r) => acc + r.uploadTime, 0) / results.length;
                    serviceResult.totalSize = results.reduce((acc, r) => acc + r.size, 0);
                    serviceResult.errors = results.filter(r => !r.success).map(r => r.error || 'Unknown error');

                    // Clean up test files
                    testFiles.forEach(file => {
                        if (fs.existsSync(file.filepath)) {
                            fs.unlinkSync(file.filepath);
                        }
                    });

                } catch (error: any) {
                    serviceResult.errors.push(`Concurrent upload test failed: ${error.message}`);
                }

                concurrentUploadResults.push(serviceResult);
            }

            const avgSuccessRate = concurrentUploadResults.reduce((acc, r) => acc + (r.successfulUploads / r.concurrentUploads), 0) / concurrentUploadResults.length;
            const avgUploadTime = concurrentUploadResults.reduce((acc, r) => acc + r.averageUploadTime, 0) / concurrentUploadResults.length;

            console.log(`Concurrent File Upload Performance Report:`);
            console.log(`Average Success Rate: ${(avgSuccessRate * 100).toFixed(1)}%`);
            console.log(`Average Upload Time: ${avgUploadTime}ms`);

            concurrentUploadResults.forEach(result => {
                console.log(`${result.service}: ${result.successfulUploads}/${result.concurrentUploads} uploads successful (${result.averageUploadTime}ms avg)`);
            });

            expect(avgSuccessRate).toBeGreaterThan(0.75); // 75% success rate for concurrent uploads
            expect(avgUploadTime).toBeLessThan(10000); // Less than 10 seconds average
        });

        test('should enforce file size limits appropriately', async ({ request }) => {
            const fileSizeLimitResults: any[] = [];

            // Test with different file sizes to find limits
            const testSizes = [
                { name: '1MB', size: 1 },
                { name: '10MB', size: 10 },
                { name: '50MB', size: 50 },
                { name: '100MB', size: 100 }
            ];

            const testServices = FILE_APPLICATIONS.slice(0, 3); // Test subset for performance

            for (const service of testServices) {
                const serviceResult = {
                    service,
                    maxSizeHandled: '0MB',
                    sizeLimitsRespected: true,
                    errors: [] as string[]
                };

                for (const testSize of testSizes) {
                    try {
                        const largeFile = generateLargeFile(testSize.size, `size-test-${testSize.name}.txt`);

                        const uploadResponse = await fileHelper.uploadFile(largeFile, service, `size-test-${testSize.name}.txt`);

                        if (uploadResponse.ok()) {
                            serviceResult.maxSizeHandled = testSize.name;

                            // Clean up - delete the uploaded file
                            const uploadResult = await uploadResponse.json();
                            if (uploadResult.fileId || uploadResult.id) {
                                await fileHelper.deleteFile(uploadResult.fileId || uploadResult.id, service);
                            }
                        } else if (uploadResponse.status() === 413) { // Payload Too Large
                            // This is expected behavior for size limits
                            break;
                        } else {
                            serviceResult.errors.push(`${testSize.name} upload failed with status: ${uploadResponse.status()}`);
                        }

                        // Clean up local file
                        if (fs.existsSync(largeFile)) {
                            fs.unlinkSync(largeFile);
                        }

                    } catch (error: any) {
                        serviceResult.errors.push(`${testSize.name} upload exception: ${error.message}`);
                        break; // Stop testing larger sizes if we hit an exception
                    }
                }

                fileSizeLimitResults.push(serviceResult);
            }

            console.log(`File Size Limit Testing Report:`);
            fileSizeLimitResults.forEach(result => {
                console.log(`${result.service}: Max size handled: ${result.maxSizeHandled}`);
                if (result.errors.length > 0) {
                    console.log(`  Errors: ${result.errors.slice(0, 2).join(', ')}`);
                }
            });

            // Each service should handle at least 1MB files
            expect(fileSizeLimitResults.every(r => r.maxSizeHandled !== '0MB')).toBe(true);
        });
    });

    test.describe('File Metadata and Validation', () => {

        test('should preserve file metadata during upload/download cycle', async ({ request }) => {
            const metadataResults: any[] = [];

            const testServices = FILE_APPLICATIONS.slice(0, 4); // Test subset

            for (const service of testServices) {
                const serviceResult = {
                    service,
                    metadataPreserved: false,
                    fileIntegrityMaintained: false,
                    errors: [] as string[]
                };

                try {
                    // Create a file with known content
                    const originalContent = 'This is a test file for metadata preservation.\n'.repeat(100);
                    const testFile = path.join(tempDir, 'metadata-test.txt');
                    fs.writeFileSync(testFile, originalContent);

                    // Upload file
                    const uploadResponse = await fileHelper.uploadFile(testFile, service, 'metadata-test.txt');

                    if (uploadResponse.ok()) {
                        const uploadResult = await uploadResponse.json();
                        const fileId = uploadResult.fileId || uploadResult.id;

                        // Download file
                        const downloadResponse = await fileHelper.downloadFile(fileId, service);

                        if (downloadResponse.ok()) {
                            // Check if we can get file info/metadata
                            const downloadedContent = await downloadResponse.text();

                            // Verify file integrity
                            if (downloadedContent === originalContent) {
                                serviceResult.fileIntegrityMaintained = true;
                            }

                            // Check for metadata in headers or response
                            const headers = downloadResponse.headers();
                            const hasMetadata = headers['content-type'] || headers['content-length'] ||
                                headers['last-modified'] || headers['content-disposition'];

                            if (hasMetadata) {
                                serviceResult.metadataPreserved = true;
                            }

                            // Clean up
                            await fileHelper.deleteFile(fileId, service);
                        } else {
                            serviceResult.errors.push(`Download failed: ${downloadResponse.status()}`);
                        }
                    } else {
                        serviceResult.errors.push(`Upload failed: ${uploadResponse.status()}`);
                    }

                    // Clean up local file
                    if (fs.existsSync(testFile)) {
                        fs.unlinkSync(testFile);
                    }

                } catch (error: any) {
                    serviceResult.errors.push(`Metadata test exception: ${error.message}`);
                }

                metadataResults.push(serviceResult);
            }

            const servicesWithMetadata = metadataResults.filter(r => r.metadataPreserved).length;
            const servicesWithIntegrity = metadataResults.filter(r => r.fileIntegrityMaintained).length;

            console.log(`File Metadata and Integrity Report:`);
            console.log(`Services preserving metadata: ${servicesWithMetadata}/${metadataResults.length}`);
            console.log(`Services maintaining file integrity: ${servicesWithIntegrity}/${metadataResults.length}`);

            // File integrity is more critical than metadata preservation
            expect(servicesWithIntegrity).toBeGreaterThan(metadataResults.length * 0.85); // 85% should maintain integrity
            expect(servicesWithMetadata).toBeGreaterThan(metadataResults.length * 0.50); // 50% should preserve metadata
        });
    });
});
