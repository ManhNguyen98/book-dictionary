import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as redisStore from 'cache-manager-redis-store';
import { BooksResolver } from './graphql/books.resolver';
import { Notes } from 'src/notes/notes.entity';
import { NotesService } from 'src/notes/notes.service';
import { SearchModule } from 'src/search/search.module';
import { BooksController } from './books.controller';
import { Book } from './books.entity';
import { BooksService } from './books.service';
import BooksSearchService from './booksSearch.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        ttl: 120,
      }),
    }),
    TypeOrmModule.forFeature([Book, Notes]),
    SearchModule,
    UsersModule,
  ],
  providers: [BooksService, NotesService, BooksSearchService, BooksResolver],
  controllers: [BooksController],
})
export class BooksModule {}
