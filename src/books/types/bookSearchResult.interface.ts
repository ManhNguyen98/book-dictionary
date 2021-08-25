import { BookSearchBody } from './bookSearchBody.interface';

export interface BookSearchResult {
  hits: {
    total: number;
    hits: Array<{
      _source: BookSearchBody;
    }>;
  };
}
