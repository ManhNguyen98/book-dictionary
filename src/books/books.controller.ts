import {
  Body,
  CacheInterceptor,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Render,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Book } from './books.entity';
import { BooksService } from './books.service';
import { NotesService } from '../notes/notes.service';
import { CreateBookDto } from './dto/create-book.dto';
import { cleanEmptyValues } from 'src/utils/helper';
import RequestWithUser from 'src/auth/types/requestWithUser.interface';
import JwtRefreshGuard from 'src/auth/guards/jwt-refresh.guard';
@Controller('books')
@UseGuards(JwtRefreshGuard)
export class BooksController {
  constructor(
    private readonly booksService: BooksService,
    private readonly notesService: NotesService,
  ) {}

  @Post()
  create(
    @Body() createBookDto: CreateBookDto,
    @Req() req: RequestWithUser,
  ): Promise<Book> {
    return this.booksService.create(createBookDto, req.user);
  }

  @UseInterceptors(CacheInterceptor)
  @Get()
  @Render('home')
  async root(
    @Query('author') author: string,
    @Query('language_code') language_code: string,
    @Query('publisher') publisher: string,
    @Query('rating') rating: string,
    @Query('search') search: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @Req() req: RequestWithUser,
  ) {
    let books = {};
    const rawParams = {
      author: author || '',
      language_code: language_code || '',
      publisher: publisher || '',
      rating: rating || '',
      owner: req.user,
    };
    const params = cleanEmptyValues(rawParams);
    if (search) {
      books = await this.booksService.searchForBooks(
        req.user,
        search,
        page,
        limit,
      );
    } else {
      books = await this.booksService.findAll(page, limit, params);
    }
    const filters = await this.booksService.getFilters(req.user);
    return { title: 'Book Dictionary | Home', books, filters };
  }

  @Get(':id')
  @Render('detail')
  async findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    const filters = await this.booksService.getFilters(req.user);
    const bookSelected = await this.booksService.findOne(id);
    if (bookSelected) {
      const notes = await this.notesService.findByBookId(id);
      return {
        title: `Book Dictionary | ${bookSelected.title}`,
        books: [bookSelected],
        bookSelected,
        filters,
        notes,
      };
    }
    throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
  }

  @Delete(':id')
  deleteOne(@Param('id') id: string): Promise<void> {
    return this.booksService.markDelete(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() newBook): Promise<Book> {
    return this.booksService.update(id, newBook);
  }
}
