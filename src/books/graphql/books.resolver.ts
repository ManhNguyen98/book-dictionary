import { Inject, UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Info,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import {
  parseResolveInfo,
  ResolveTree,
  simplifyParsedResolveInfoFragmentWithType,
} from 'graphql-parse-resolve-info';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { GraphqlJwtRefreshGuard } from 'src/auth/guards/graphql-jwt-refresh.guard';
import RequestWithUser from 'src/auth/types/requestWithUser.interface';
import { BooksService } from 'src/books/books.service';
import { PUB_SUB } from 'src/pubsub.module';
import { User } from 'src/users/graphql/users.model';
import { UsersService } from 'src/users/users.service';
import { CreateBookInput } from './book.input';
import { Book } from './books.model';
import { PaginationArgs } from './pagination.args';

const BOOK_ADDED_EVENT = 'bookAdded';
@Resolver(() => Book)
export class BooksResolver {
  constructor(
    private booksService: BooksService,
    private usersService: UsersService,
    @Inject(PUB_SUB) private pubSub: RedisPubSub,
  ) {}

  @Subscription(() => Book)
  bookAdded() {
    return this.pubSub.asyncIterator(BOOK_ADDED_EVENT);
  }

  @Query(() => [Book])
  async books(
    @Args() queryMeta: PaginationArgs,
    @Info() info: GraphQLResolveInfo,
  ) {
    const parsedInfo = parseResolveInfo(info) as ResolveTree;
    const simplifiedInfo = simplifyParsedResolveInfoFragmentWithType(
      parsedInfo,
      info.returnType,
    );

    const books =
      'owner' in simplifiedInfo.fields
        ? await this.booksService.getBooksWithAuthors(
            queryMeta.page,
            queryMeta.limit,
          )
        : await this.booksService.findAll(queryMeta.page, queryMeta.limit);
    return books.items;
  }

  @ResolveField('owner', () => User)
  async getOwner(@Parent() book: Book) {
    const { ownerId } = book;
    return this.usersService.getById(ownerId);
  }

  @Mutation(() => Book)
  @UseGuards(GraphqlJwtRefreshGuard)
  async createBook(
    @Args('input') createBookInput: CreateBookInput,
    @Context() context: { req: RequestWithUser },
  ) {
    const newBook = await this.booksService.create(
      createBookInput,
      context.req.user,
    );
    this.pubSub.publish(BOOK_ADDED_EVENT, { bookAdded: newBook });
    return newBook;
  }
}
