import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from 'src/books/books.entity';
import { Repository } from 'typeorm';
import { CreateNoteDto } from './dto/create-note.dto';
import { Notes } from './notes.entity';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Notes)
    private readonly notesRepository: Repository<Notes>,
    @InjectRepository(Book)
    private readonly booksRepository: Repository<Book>,
  ) {}

  async create(createNoteDto: CreateNoteDto): Promise<Notes> {
    const { book_id, page, note, is_read } = createNoteDto;
    const notes = new Notes();
    const book = await this.booksRepository.findOne(book_id);
    if (book.pages >= page) {
      notes.book = book;
      notes.page = page;
      notes.note = note;
      notes.is_read = is_read;
      return this.notesRepository.save(notes);
    }
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  async findAll(): Promise<Notes[]> {
    return this.notesRepository.find();
  }

  findOne(id: string): Promise<Notes> {
    return this.notesRepository.findOne(id);
  }

  markDelete(id: string): Promise<void> {
    this.notesRepository.softDelete(id);
    return;
  }

  findByBookId(id: string): Promise<Notes[]> {
    return this.notesRepository
      .createQueryBuilder('notes')
      .select('*')
      .where('notes.bookId = :bookId', { bookId: id })
      .getRawMany();
  }
}
