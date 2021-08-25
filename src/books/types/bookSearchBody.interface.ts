import { LANGUAGE_CODE } from 'src/utils/enum';

export interface BookSearchBody {
  id: number;
  title: string;
  author: string;
  cover_url: string;
  rating: number;
  published: Date;
  publisher: string;
  language_code: LANGUAGE_CODE;
  pages: number;
}
