import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Prompt {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    prompt: string;

    @Column({ nullable: true })
    description?: string;
}
