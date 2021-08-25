import { Field, Int, ObjectType } from '@nestjs/graphql';
import { User } from 'src/users/graphql/users.model';
import { LANGUAGE_CODE } from 'src/utils/enum';

@ObjectType()
export class Book {
  @Field(() => Int)
  id: number;

  @Field()
  title: string;

  @Field(() => String)
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

  @Field(() => Int)
  ownerId: number;

  @Field(() => User)
  owner: User;
}
