import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity'; // ユーザーエンティティ
import { Post } from '../modules/posts/post.entity'; // 投稿エンティティ
import { CommentMention } from './comment-mention.entity';
import { CommentReaction } from './comment-reaction.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  postId: string; // 親投稿ID

  @Column()
  authorId: string; // コメント作成者ID

  @Column({ type: 'text' })
  body: string; // コメント本文

  @Column({ nullable: true })
  parentId: string | null; // 返信の場合の親コメントID

  // コメントに紐づく単一のメディア（画像または動画）のID（media モジュールで発行される UUID）を保存
  @Column({ type: 'uuid', nullable: true })
  mediaId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // リレーションは既存を維持
  @ManyToOne(() => User, (user) => user.comments)
  author: User;

  @ManyToOne(() => Post, (post) => post.comments)
  post: Post;

  @ManyToOne(() => Comment, (comment) => comment.children)
  parent: Comment;

  @OneToMany(() => Comment, (comment) => comment.parent)
  children: Comment[];

  @OneToMany(() => CommentReaction, (reaction) => reaction.comment)
  reactions: CommentReaction[];

  @OneToMany(() => CommentMention, (mention) => mention.comment)
  mentions: CommentMention[];
}