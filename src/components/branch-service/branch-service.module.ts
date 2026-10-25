import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchService } from './branch-service.entity';
import { BranchServiceService } from './branch-service.service';
import { BranchServiceController } from './branch-service.controller';
import { BranchModule } from '../branch/branch.module';
import { ServiceModule } from '../service/service.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BranchService]),
    BranchModule,
    ServiceModule,
  ],
  controllers: [BranchServiceController],
  providers: [BranchServiceService],
  exports: [BranchServiceService],
})
export class BranchServiceModule {}
