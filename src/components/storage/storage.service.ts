import {
  BadGatewayException,
  Inject,
  Injectable,
  NotFoundException,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import * as randomstring from 'randomstring';
import { AmazonS3Service } from './s3.storage';
import { MulterFile } from '../../shared/interfaces/multer-file.interface';
import {
  AbortMultipartUploadInput,
  CompletedSingleUpload,
  CompleteMultipartUploadInput,
  DeleteFileInput,
  FileKeyGeneratorOptions,
  FileValidationOptions,
  InitiateMultipartUploadInput,
  PartUploadInput,
  UploadInput,
} from './storage.interface';

@Injectable()
export class StorageService {
  constructor(@Inject(AmazonS3Service) private readonly s3: AmazonS3Service) {}

  private get bucket(): string {
    return process.env.AWS_S3_BUCKET_NAME as string;
  }

  validateFile(file: MulterFile, options: FileValidationOptions): void {
    if (options.maxSizeInBytes && file.size > options.maxSizeInBytes) {
      throw new PayloadTooLargeException(
        'File size exceeds the maximum allowed limit',
      );
    }

    if (options.allowedTypes && !options.allowedTypes.includes(file.mimetype)) {
      throw new UnsupportedMediaTypeException('Invalid file type');
    }
  }

  private generateKey(options: FileKeyGeneratorOptions): string {
    const folder = options.folder ? options.folder.replace(/\/?$/, '/') : '';
    const key = options.key || randomstring.generate(25);

    return `${folder}${key}.${options.extension}`;
  }

  /**
   * Returns a file's extension, without a preceding dot (.)
   */
  resolveExtension(file: MulterFile): string {
    return file.originalname.split('.').pop() as string;
  }

  private keyFor(input: UploadInput): string {
    return this.generateKey({
      key: input.key,
      folder: input.folder,
      extension: input.extension || this.resolveExtension(input.body),
    });
  }

  /**
   * Uploads into an S3 bucket
   */
  async upload(input: UploadInput): Promise<CompletedSingleUpload> {
    const key = this.keyFor(input);

    await this.s3.putObject({
      key,
      contentType: input.contentType || input.body.mimetype,
      body: input.body.buffer,
      bucket: input.bucket || this.bucket,
    });

    return { key };
  }

  async delete(input: DeleteFileInput): Promise<void> {
    await this.s3.deleteObject({
      key: input.key,
      bucket: input.bucket || this.bucket,
    });
  }

  async replace(
    currentKey: string,
    input: UploadInput,
  ): Promise<CompletedSingleUpload> {
    const key = this.keyFor(input);

    await this.s3.replaceObject(currentKey, {
      key,
      bucket: input.bucket || this.bucket,
      contentType: input.contentType || input.body.mimetype,
      body: input.body.buffer,
    });

    return { key };
  }

  async getFile(key: string, bucket?: string): Promise<Buffer> {
    try {
      return await this.s3.getObject({ key, bucket: bucket || this.bucket });
    } catch (error) {
      if ((error as any)?.$metadata?.httpStatusCode === 404) {
        throw new NotFoundException('File not found');
      }

      throw new BadGatewayException(
        'Unable to retrieve file. Please try again later',
      );
    }
  }

  async renameObject(
    currentKey: string,
    newKey: string,
    bucket?: string,
  ): Promise<void> {
    const targetBucket = bucket || this.bucket;

    try {
      await this.s3.copyObject(currentKey, newKey, targetBucket);
      await this.s3.deleteObject({ key: currentKey, bucket: targetBucket });
    } catch {
      throw new BadGatewayException(
        'Unable to rename file. Please try again later',
      );
    }
  }

  async initiateMultipartUpload(
    params: InitiateMultipartUploadInput,
  ): Promise<{ uploadId: string }> {
    return this.s3.initiateMultipartUpload({
      ...params,
      bucket: params.bucket || this.bucket,
    });
  }

  async uploadPart(params: PartUploadInput): Promise<{ ETag: string }> {
    return this.s3.uploadPart({
      ...params,
      bucket: params.bucket || this.bucket,
    });
  }

  async abortMultipartUpload(params: AbortMultipartUploadInput): Promise<void> {
    await this.s3.abortMultipartUpload({
      ...params,
      bucket: params.bucket || this.bucket,
    });
  }

  async completeMultipartUpload(params: CompleteMultipartUploadInput) {
    return this.s3.completeMultipartUpload({
      ...params,
      bucket: params.bucket || this.bucket,
    });
  }
}
