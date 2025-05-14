import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from 'src/entities/profile.entity';
import { User } from 'src/entities/user.entity';
import { Background } from 'src/entities/background.entity';
import { Experience } from 'src/entities/experience.entity';
import { Education } from 'src/entities/education.entity';
import {
    BackgroundDto,
    EducationDto,
    ExperienceDto,
    PromptDto,
    UpdateProfileDto,
} from './dtos/profile.dto';
import { DEFAULT_PROMPTS } from 'src/constants';

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(User)
        private usersRepo: Repository<User>,
        @InjectRepository(Profile)
        private profilesRepo: Repository<Profile>,
        @InjectRepository(Background)
        private backgroundsRepo: Repository<Background>,
        @InjectRepository(Experience)
        private experiencesRepo: Repository<Experience>,
        @InjectRepository(Education)
        private educationRepo: Repository<Education>,
    ) { }

    async updateBaseProfileData(userId: string, profileData: UpdateProfileDto): Promise<Profile> {
        const user = await this.usersRepo.findOne({ where: { id: userId }, relations: ['profile'] });
        if (!user) throw new NotFoundException(`User with id=${userId} not found`);
        if (!user.profile) {
            const newProfile = this.profilesRepo.create(profileData);
            user.profile = newProfile;
            await this.usersRepo.save(user);
            return newProfile;
        }
        Object.assign(user.profile, profileData);
        await this.usersRepo.save(user);
        return user.profile;
    }

    async getProfileByUserId(userId: string): Promise<Profile> {
        const profile = await this.profilesRepo.findOne({
            where: { user: { id: userId } },
            relations: ['user', 'background', 'experiences', 'education'],
        });
        if (!profile) throw new NotFoundException(`Profile for user id=${userId} not found`);
        return profile;
    }

    async getAllPrompts() {
        return { prompts: DEFAULT_PROMPTS };
    }

    async updatePromptInProfile(userId: string, newPrompt: PromptDto): Promise<Profile> {
        const profile = await this.profilesRepo.findOne({
            where: { user: { id: userId } },
            relations: ['user'],
        });
        if (!profile) throw new NotFoundException(`Profile for user id=${userId} not found`);
        let replaced = false;
        const updated = profile.selectedPromptIds.map(entry => {
            try {
                const obj = JSON.parse(entry);
                if (obj.prompt === newPrompt.prompt) {
                    replaced = true;
                    return JSON.stringify({ prompt: newPrompt.prompt, description: newPrompt.description ?? null });
                }
            } catch { }
            return entry;
        });
        if (!replaced) throw new BadRequestException(`Prompt "${newPrompt.prompt}" not found in profile`);
        profile.selectedPromptIds = updated;
        return this.profilesRepo.save(profile);
    }

    async addPromptToProfile(userId: string, prompt: PromptDto): Promise<Profile> {
        const profile = await this.profilesRepo.findOne({
            where: { user: { id: userId } },
            relations: ['user'],
        });
        if (!profile) throw new NotFoundException(`Profile for user id=${userId} not found`);
        if ((profile.selectedPromptIds?.length ?? 0) >= 3)
            throw new BadRequestException(`Cannot add more than 3 prompts`);
        profile.selectedPromptIds = [
            ...(profile.selectedPromptIds || []),
            JSON.stringify({ prompt: prompt.prompt, description: prompt.description ?? null }),
        ];
        return this.profilesRepo.save(profile);
    }

    async addBackgroundToProfile(userId: string, data: BackgroundDto): Promise<Profile> {
        const profile = await this.profilesRepo.findOne({
            where: { user: { id: userId } },
            relations: ['user', 'background'],
        });
        if (!profile) throw new NotFoundException(`Profile for user id=${userId} not found`);
        if (profile.background) throw new BadRequestException(`Background already exists`);
        const background = this.backgroundsRepo.create({ ...data, profile });
        profile.background = background;
        return this.profilesRepo.save(profile);
    }

    async updateBackgroundToProfile(backgroundId: string, data: BackgroundDto): Promise<Background> {
        const background = await this.backgroundsRepo.findOne({ where: { id: backgroundId } });
        if (!background) throw new NotFoundException(`Background with id=${backgroundId} not found`);
        Object.assign(background, data);
        return this.backgroundsRepo.save(background);
    }

    async addExperienceToProfile(userId: string, data: ExperienceDto): Promise<Profile> {
        const profile = await this.profilesRepo.findOne({
            where: { user: { id: userId } },
            relations: ['user', 'experiences'],
        });
        if (!profile) throw new NotFoundException(`Profile for user id=${userId} not found`);
        if (profile.experiences?.some(exp => exp.company === data.company && exp.title === data.title))
            throw new BadRequestException(`Experience already exists`);
        const experience = this.experiencesRepo.create({ ...data, profile });
        profile.experiences = [...(profile.experiences || []), experience];
        return this.profilesRepo.save(profile);
    }

    async updateExperienceToProfile(experienceId: string, data: ExperienceDto): Promise<Experience> {
        const experience = await this.experiencesRepo.findOne({ where: { id: experienceId } });
        if (!experience) throw new NotFoundException(`Experience with id=${experienceId} not found`);
        Object.assign(experience, data);
        return this.experiencesRepo.save(experience);
    }

    async deleteExperienceFromProfile(experienceId: string): Promise<void> {
        const experience = await this.experiencesRepo.findOne({ where: { id: experienceId } });
        if (!experience) throw new NotFoundException(`Experience with id=${experienceId} not found`);
        await this.experiencesRepo.remove(experience);
    }

    async addEducationToProfile(userId: string, data: EducationDto): Promise<Profile> {
        const profile = await this.profilesRepo.findOne({
            where: { user: { id: userId } },
            relations: ['user', 'education'],
        });
        if (!profile) throw new NotFoundException(`Profile for user id=${userId} not found`);
        if (profile.education?.some(edu => edu.school === data.school && edu.degree === data.degree))
            throw new BadRequestException(`Education already exists`);
        const education = this.educationRepo.create({ ...data, profile });
        profile.education = [...(profile.education || []), education];
        return this.profilesRepo.save(profile);
    }

    async updateEducationToProfile(educationId: string, data: EducationDto): Promise<Education> {
        const education = await this.educationRepo.findOne({ where: { id: educationId } });
        if (!education) throw new NotFoundException(`Education with id=${educationId} not found`);
        Object.assign(education, data);
        return this.educationRepo.save(education);
    }

    async deleteEducationFromProfile(educationId: string): Promise<void> {
        const education = await this.educationRepo.findOne({ where: { id: educationId } });
        if (!education) throw new NotFoundException(`Education with id=${educationId} not found`);
        await this.educationRepo.remove(education);
    }
}
