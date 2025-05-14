import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
} from 'typeorm';
import { Profile } from './profile.entity';

@Entity()
export class Education {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    school: string;

    @Column()
    degree: string;

    @Column({ nullable: true })
    fieldOfStudy?: string;

    @Column('date', { nullable: true })
    startDate?: Date;

    @Column('date', { nullable: true })
    endDate?: Date;

    @Column({ nullable: true })
    description?: string;

    @ManyToOne(() => Profile, profile => profile.education, {
        onDelete: 'CASCADE',
    })
    profile: Profile;
}
