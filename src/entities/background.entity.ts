import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
} from 'typeorm';
import { Profile } from './profile.entity';

@Entity()
export class Background {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    commitmentLevel?: string;

    @Column({ nullable: true })
    equityException?: string;

    @Column({ nullable: true })
    matchingIntention?: string;

    @Column('int', { nullable: true })
    numberOfFounders?: number;

    @Column({ nullable: true })
    priorStartUpExperience?: string;

    @Column('text', { array: true, nullable: true })
    skills?: string[];

    @Column({ nullable: true })
    description?: string;

    @OneToOne(() => Profile, profile => profile.background)
    profile: Profile;
}
