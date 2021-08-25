import { Notes } from 'src/notes/notes.entity';
import { User } from 'src/users/users.entity';
import { LANGUAGE_CODE } from 'src/utils/enum';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Book extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  author: string;

  @Column({ nullable: true })
  cover_url: string;

  @Column({ nullable: true })
  rating: number;

  @Column({ nullable: true })
  publisher: string;

  @Column({ nullable: true })
  published: Date;

  @Column({
    type: 'enum',
    enum: LANGUAGE_CODE,
    default: LANGUAGE_CODE.VI,
  })
  language_code: LANGUAGE_CODE;

  @Column({ nullable: true })
  pages: number;

  @OneToMany(() => Notes, (notes) => notes.book, {
    cascade: ['insert', 'update'],
  })
  notes: Notes[];

  @Index('book_ownerId_index')
  @ManyToOne(() => User, (owner: User) => owner.books)
  public owner: User;

  @RelationId((book: Book) => book.owner)
  public ownerId: number;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  public created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  public updated_at: Date;

  @DeleteDateColumn()
  deleted_at?: Date;
}
