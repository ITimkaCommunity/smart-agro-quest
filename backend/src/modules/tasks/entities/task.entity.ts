import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  instructions: string;

  @Column({ type: 'uuid' })
  zoneId: string;

  @Column({ type: 'int', nullable: true })
  difficulty: number;

  @Column({ type: 'int', default: 100 })
  experienceReward: number;

  @Column({ type: 'int', default: 1 })
  requiredLevel: number;

  @Column({ type: 'int', array: true, default: '{}' })
  targetGrades: number[];

  @Column({ type: 'text', array: true, default: '{}' })
  attachmentUrls: string[];

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  zone?: any;
}
