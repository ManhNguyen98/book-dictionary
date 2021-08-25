import { LANGUAGE_CODE } from 'src/utils/enum';

export class CreateBookDto {
  title: string;
  author: string;
  cover_url: string;
  rating: number;
  published: Date;
  publisher: string;
  language_code: LANGUAGE_CODE;
  pages: number;
}
