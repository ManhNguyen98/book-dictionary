import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from 'src/books/books.entity';
import { NotesController } from './notes.controller';
import { Notes } from './notes.entity';
import { NotesService } from './notes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notes, Book])],
  providers: [NotesService],
  controllers: [NotesController],
})
export class NotesModule {}
