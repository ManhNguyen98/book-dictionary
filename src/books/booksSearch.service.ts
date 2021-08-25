import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Book } from './books.entity';
import { BookSearchBody } from './types/bookSearchBody.interface';
import { BookSearchResult } from './types/bookSearchResult.interface';

@Injectable()
export default class BooksSearchService {
  index = 'book';

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async indexBook(book: Book) {
    return this.elasticsearchService.index<BookSearchResult, BookSearchBody>({
      index: this.index,
      body: {
        id: book.id,
        title: book.title,
        author: book.author,
        cover_url: book.cover_url,
        rating: book.rating,
        published: book.published,
        publisher: book.publisher,
        language_code: book.language_code,
        pages: book.pages,
      },
    });
  }

  async search(text: string) {
    const { body } = await this.elasticsearchService.search<BookSearchResult>({
      index: this.index,
      body: {
        query: {
          multi_match: {
            query: text,
            fields: ['title', 'author', 'publisher'],
          },
        },
      },
    });
    const hits = body.hits.hits;
    return hits.map((item) => item._source);
  }

  async remove(bookId: string) {
    this.elasticsearchService.deleteByQuery({
      index: this.index,
      body: {
        query: {
          match: {
            id: bookId,
          },
        },
      },
    });
  }

  async update(book: Book) {
    const newBody: BookSearchBody = {
      id: book.id,
      title: book.title,
      author: book.author,
      cover_url: book.cover_url,
      rating: book.rating,
      published: book.published,
      publisher: book.publisher,
      language_code: book.language_code,
      pages: book.pages,
    };

    const script = Object.entries(newBody).reduce((result, [key, value]) => {
      return `${result} ctx._source.${key}='${value}';`;
    }, '');

    return this.elasticsearchService.updateByQuery({
      index: this.index,
      body: {
        query: {
          match: {
            id: book.id,
          },
        },
        script: {
          inline: script,
        },
      },
    });
  }
}
