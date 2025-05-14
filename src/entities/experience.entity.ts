import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
} from 'typeorm';
import { Profile } from './profile.entity';

@Entity()
export class Experience {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    company: string;

    @Column('date', { nullable: true })
    startDate?: Date;

    @Column('date', { nullable: true })
    endDate?: Date;

    @Column({ default: false })
    currentlyWorkHere: boolean;

    @Column({ nullable: true })
    description?: string;

    @ManyToOne(() => Profile, profile => profile.experiences, {
        onDelete: 'CASCADE',
        eager: false,
    })
    profile: Profile;
}
