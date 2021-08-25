import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { User } from 'src/users/users.entity';
import { LANGUAGES } from 'src/utils/constants';
import { formatDateToString, isEmpty } from 'src/utils/helper';
import { In, Repository } from 'typeorm';
import { Book } from './books.entity';
import BooksSearchService from './booksSearch.service';
import { CreateBookDto } from './dto/create-book.dto';

@Injectable()
export class BooksService {
  private readonly logger = new Logger(BooksService.name);
  constructor(
    @InjectRepository(Book)
    private readonly booksRepository: Repository<Book>,
    private readonly booksSearchService: BooksSearchService,
  ) {}

  async create(createBookDto: CreateBookDto, user: User): Promise<Book> {
    const {
      title,
      author,
      rating,
      published,
      publisher,
      language_code,
      pages,
      cover_url,
    } = createBookDto;
    const book = new Book();
    book.title = title;
    book.author = author;
    book.cover_url = cover_url;
    book.rating = rating > 0 ? rating : null;
    book.published = published;
    book.publisher = publisher;
    book.language_code = language_code;
    book.pages = pages || null;
    const newBook = await this.booksRepository.create({
      ...book,
      owner: user,
    });
    try {
      await this.booksRepository.save(newBook);
      this.booksSearchService.indexBook(newBook);
    } catch (error) {
      this.logger.error('Can not get books', error);
    }
    return newBook;
  }

  async findAll(page: number, limit: number, params = {}) {
    let query = '';
    if (!isEmpty(params)) {
      query = Object.entries(params).reduce((result, [key, value]) => {
        return `${key}=${value}`;
      }, '');
    }
    const originBooks = await this.paginate(
      {
        page,
        limit,
        route: `http://localhost:3030/books?${query}`,
      },
      { where: params },
    );
    const books = {
      ...originBooks,
      items: originBooks.items.map((b) => {
        const { created_at, published } = b;
        return {
          ...b,
          created_at: formatDateToString(created_at),
          published: published ? formatDateToString(published) : '',
        };
      }),
    };
    return books;
  }

  async findOne(id: string) {
    const book = await this.booksRepository.findOne(id);
    if (book) {
      const created_at = book?.created_at;
      const published = book?.published;
      return {
        ...book,
        created_at: formatDateToString(created_at),
        published: published ? formatDateToString(published) : '',
        publishedOrigin: published ? formatDateToString(published, '/') : '',
      };
    }
    this.logger.warn('Tried to access a book that does not exist.');
  }

  async markDelete(id: string): Promise<void> {
    this.booksRepository.softDelete(id);
    await this.booksSearchService.remove(id);
    return;
  }

  groupByAuthor(owner) {
    return this.booksRepository
      .createQueryBuilder('book')
      .select(['book.author', 'count(book.id) as book_qtt'])
      .where('ownerId = :ownerId', { ownerId: owner.id })
      .groupBy('book.author')
      .getRawMany();
  }

  async groupByLanguage(owner) {
    const originLanguages = await this.booksRepository
      .createQueryBuilder('book')
      .select(['book.language_code', 'count(book.id) as book_qtt'])
      .where('ownerId = :ownerId', { ownerId: owner.id })
      .groupBy('book.language_code')
      .getRawMany();
    return originLanguages.map((book) => {
      return {
        ...book,
        book_language_code_name: LANGUAGES[book.book_language_code],
      };
    });
  }

  groupByPublisher(owner) {
    return this.booksRepository
      .createQueryBuilder('book')
      .select(['book.publisher', 'count(book.id) as book_qtt'])
      .where('book.publisher != :publisher AND ownerId = :ownerId', {
        publisher: '',
        ownerId: owner.id,
      })
      .groupBy('book.publisher')
      .getRawMany();
  }

  groupByRate(owner) {
    return this.booksRepository
      .createQueryBuilder('book')
      .select(['book.rating', 'count(book.id) as book_qtt'])
      .where('book.rating != :rating AND ownerId = :ownerId', {
        rating: '',
        ownerId: owner.id,
      })
      .groupBy('book.rating')
      .getRawMany();
  }

  async getFilters(user) {
    return {
      authors: await this.groupByAuthor(user),
      languages: await this.groupByLanguage(user),
      publishers: await this.groupByPublisher(user),
      rates: await this.groupByRate(user),
    };
  }

  async getBooksWithAuthors(page?: number, limit?: number) {
    return await this.paginate(
      {
        page,
        limit,
        route: `http://localhost:3030/books`,
      },
      { relations: ['owner'] },
    );
  }

  async searchForBooks(user: User, text: string, page: number, limit: number) {
    const results = await this.booksSearchService.search(text);
    const ids = results.map((result) => result.id);
    if (!ids.length) {
      return [];
    }
    const originBooks = await this.paginate(
      {
        page,
        limit,
        route: `http://localhost:3030/books?search=${text}`,
      },
      { where: { id: In(ids), owner: user } },
    );
    return {
      ...originBooks,
      items: originBooks.items.map((b) => {
        const { created_at, published } = b;
        return {
          ...b,
          created_at: formatDateToString(created_at),
          published: formatDateToString(published),
        };
      }),
    };
  }

  async update(id, newBook) {
    const oldBook = await this.booksRepository.findOne(id);
    await this.booksRepository.save({
      ...oldBook,
      ...newBook,
      pages: newBook.pages || null,
    });
    const updatedBook = await this.booksRepository.findOne(id);
    if (updatedBook) {
      await this.booksSearchService.update(updatedBook);
      return updatedBook;
    }
    throw new HttpException('Not found', HttpStatus.NOT_FOUND);
  }

  paginate(
    options: IPaginationOptions,
    params: any,
  ): Promise<Pagination<Book>> {
    return paginate<Book>(this.booksRepository, options, params);
  }
}
