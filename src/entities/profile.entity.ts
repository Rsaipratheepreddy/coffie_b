// src/profiles/entities/profile.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    OneToMany,
    ManyToMany,
    JoinTable,
    JoinColumn,
} from 'typeorm';
import { Prompt } from './prompt.entity';
import { Background } from './background.entity';
import { Experience } from './experience.entity';
import { Education } from './education.entity';
import { User } from './user.entity';

@Entity()
export class Profile {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    name?: string;

    @Column('int', { nullable: true })
    age?: number;

    @Column({ nullable: true })
    location?: string;

    @Column({ nullable: true })
    linkedin?: string;

    @Column({ nullable: true })
    schedulingLink?: string;

    @Column({ nullable: true })
    myIdes?: string;

    @Column({ type: 'jsonb', nullable: false, default: [] })
    selectedPromptIds: string[];

    @OneToOne(() => Background, { cascade: true, eager: true })
    @JoinColumn()
    background: Background;

    @OneToMany(() => Experience, exp => exp.profile, { cascade: true, eager: true })
    experiences: Experience[];

    @OneToMany(() => Education, edu => edu.profile, { cascade: true, eager: true })
    education: Education[];

    @OneToOne(() => User, user => user.profile)
    user: User;
}
