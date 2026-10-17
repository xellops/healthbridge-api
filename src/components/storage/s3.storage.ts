import {
  InternalServerErrorException,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  S3Client,
  S3ClientConfig,
  PutObjectCommand,
  PutObjectCommandOutput,
  DeleteObjectCommand,
  GetObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  CopyObjectCommand,
  AbortMultipartUploadCommand,
} from '@aws-sdk/client-s3';
import {
  AbortMultipartUploadInput,
  CompleteMultipartUploadInput,
  PartUploadInput,
} from './storage.interface';

interface S3ObjectParams {
  /** The name of the file as it is saved in S3 */
  key: string;
  bucket: string;
}

interface S3PutObjectParams extends S3ObjectParams {
  contentType: string;
  body: Buffer;
}

interface S3MultipartUploadParams extends S3ObjectParams {
  contentType: string;
}

@Injectable()
export class AmazonS3Service {
  private readonly logger = new Logger(AmazonS3Service.name);
  private readonly s3: S3Client;

  constructor() {
    const config: S3ClientConfig = { region: process.env.AWS_S3_BUCKET_REGION };

    // In production, credentials come from the environment's IAM role.
    if (process.env.NODE_ENV !== 'production') {
      config.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
      };
    }

    this.s3 = new S3Client(config);
  }

  private handleError(error: unknown): never {
    this.logger.error('Upload client error', error);
    throw new InternalServerErrorException(
      'We are unable to save the uploaded file at the moment. Please try again later.',
    );
  }

  async putObject(params: S3PutObjectParams): Promise<PutObjectCommandOutput> {
    try {
      return await this.s3.send(
        new PutObjectCommand({
          Bucket: params.bucket,
          Key: params.key,
          ContentType: params.contentType,
          Body: params.body,
        }),
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteObject(params: S3ObjectParams) {
    return this.s3.send(
      new DeleteObjectCommand({ Bucket: params.bucket, Key: params.key }),
    );
  }

  /**
   * Uploads the new file, then deletes the current one.
   */
  async replaceObject(currentKey: string, params: S3PutObjectParams) {
    await this.putObject(params);

    if (params.key !== currentKey) {
      await this.deleteObject({ key: currentKey, bucket: params.bucket });
    }
  }

  async getObject(params: S3ObjectParams): Promise<Buffer> {
    const object = await this.s3.send(
      new GetObjectCommand({ Bucket: params.bucket, Key: params.key }),
    );

    if (!object.Body) {
      throw new InternalServerErrorException('File has no content');
    }

    return Buffer.from(await object.Body.transformToByteArray());
  }

  async initiateMultipartUpload(params: S3MultipartUploadParams) {
    const response = await this.s3.send(
      new CreateMultipartUploadCommand({
        Bucket: params.bucket,
        Key: params.key,
        ContentType: params.contentType,
      }),
    );

    return { uploadId: response.UploadId as string };
  }

  async uploadPart(params: PartUploadInput & { bucket: string }) {
    const response = await this.s3.send(
      new UploadPartCommand({
        Bucket: params.bucket,
        Key: params.key,
        UploadId: params.uploadId,
        Body: params.body.buffer,
        PartNumber: params.partNumber,
      }),
    );

    return { ETag: response.ETag as string };
  }

  async completeMultipartUpload(
    params: CompleteMultipartUploadInput & { bucket: string },
  ) {
    const response = await this.s3.send(
      new CompleteMultipartUploadCommand({
        Bucket: params.bucket,
        Key: params.key,
        UploadId: params.uploadId,
        MultipartUpload: { Parts: params.parts },
      }),
    );

    return { FileUrl: response.Location };
  }

  async abortMultipartUpload(
    params: AbortMultipartUploadInput & { bucket: string },
  ) {
    await this.s3.send(
      new AbortMultipartUploadCommand({
        Bucket: params.bucket,
        Key: params.key,
        UploadId: params.uploadId,
      }),
    );
  }

  async copyObject(sourceKey: string, destinationKey: string, bucket: string) {
    return this.s3.send(
      new CopyObjectCommand({
        Bucket: bucket,
        Key: destinationKey,
        CopySource: `${bucket}/${sourceKey}`,
      }),
    );
  }
}
