import { InputType, Field } from '@nestjs/graphql';
import { LANGUAGE_CODE } from 'src/utils/enum';

@InputType()
export class CreateBookInput {
  @Field()
  title: string;

  @Field()
  author: string;

  @Field({ nullable: true })
  cover_url: string;

  @Field({ nullable: true })
  rating: number;

  @Field({ nullable: true })
  publisher: string;

  @Field({ nullable: true })
  published: Date;

  @Field({ defaultValue: LANGUAGE_CODE.VI })
  language_code: LANGUAGE_CODE;

  @Field({ nullable: true })
  pages: number;
}
