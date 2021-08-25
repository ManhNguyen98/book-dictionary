import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Book } from 'src/books/graphql/books.model';

@ObjectType()
export class User {
  @Field(() => Int)
  id: number;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field(() => [Book])
  book: Book[];
}
