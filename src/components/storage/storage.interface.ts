import { Part } from '@aws-sdk/client-s3';
import { MulterFile } from '../../shared/interfaces/multer-file.interface';

export interface CompletedSingleUpload {
  /** This is the name of the file as it is saved in S3 */
  key: string;
}

export interface InitiateMultipartUploadInput {
  /** The name of the file as it will be saved in S3 */
  key: string;
  contentType: string;
  bucket?: string;
}

export interface PartUploadInput {
  /** The name of the file as it is saved in S3 */
  key: string;
  bucket?: string;
  partNumber: number;
  uploadId: string;
  body: MulterFile;
}

export interface AbortMultipartUploadInput {
  bucket?: string;
  uploadId: string;
  key: string;
}

export interface CompleteMultipartUploadInput extends AbortMultipartUploadInput {
  parts: Part[];
}

export interface UploadInput {
  /** When provided, this will be the name of the file as it is saved in S3, but without the extension */
  key?: string;
  contentType?: string;
  /** The extension of a file without the preceding dot (.). Defaults to the uploaded file's extension. */
  extension?: string;
  body: MulterFile;
  folder?: string;
  bucket?: string;
}

export interface DeleteFileInput {
  /** This is the name of the file as it is saved in S3 */
  key: string;
  bucket?: string;
}

export interface FileKeyGeneratorOptions {
  /** The extension of a file without the preceding dot (.) */
  extension: string;
  folder?: string;
  /** The name of the file. This will not include the extension of the file */
  key?: string;
}

export interface FileValidationOptions {
  maxSizeInBytes?: number;
  allowedTypes?: string[];
}
