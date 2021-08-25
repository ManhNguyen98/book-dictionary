import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { SearchModule } from 'src/search/search.module';
import { ElasticsearchIndicator } from './elasticsearchHealthIndicator';
import HealthController from './health.controller';

@Module({
  imports: [TerminusModule, SearchModule],
  controllers: [HealthController],
  providers: [ElasticsearchIndicator],
})
export class HealthModule {}
