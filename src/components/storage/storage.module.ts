import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { AmazonS3Service } from './s3.storage';

@Module({
  providers: [StorageService, AmazonS3Service],
  exports: [StorageService],
})
export class StorageModule {}
