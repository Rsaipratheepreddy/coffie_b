import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from 'src/entities/profile.entity';
import * as puppeteer from 'puppeteer';
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

    async fetchProfileFromLinkedIn(userId: string, linkedinUrl: string): Promise<Profile> {
        if (!linkedinUrl.includes('linkedin.com/in/')) {
            throw new BadRequestException('Invalid LinkedIn profile URL');
        }

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
        });

        try {
            const page = await browser.newPage();
            await page.setViewport({ width: 1280, height: 800 });

            // Set cookies for authentication
            const cookies = process.env.LINKEDIN_COOKIES;
            if (!cookies) {
                throw new BadRequestException('LinkedIn authentication cookies not configured');
            }

            await page.setCookie({
                name: 'li_at',
                value: cookies,
                domain: '.linkedin.com'
            });

            await page.goto(linkedinUrl, { waitUntil: 'networkidle0' });

            const profileData = await page.evaluate(() => {
                const name = document.querySelector('h1')?.textContent?.trim() || '';
                const about = document.querySelector('.pv-about-section')?.textContent?.trim() || '';
                const profilePicture = document.querySelector('.pv-top-card-profile-picture__image')?.getAttribute('src') ||
                    document.querySelector('.profile-photo-edit__preview')?.getAttribute('src') || '';

                const experiences = Array.from(document.querySelectorAll('.experience-section .pv-entity__position-group'));
                const parsedExperiences = experiences.map(exp => ({
                    title: exp.querySelector('.pv-entity__summary-info h3')?.textContent?.trim() || '',
                    company: exp.querySelector('.pv-entity__secondary-title')?.textContent?.trim() || '',
                    duration: exp.querySelector('.pv-entity__date-range span:nth-child(2)')?.textContent?.trim() || '',
                    description: exp.querySelector('.pv-entity__description')?.textContent?.trim() || ''
                }));

                const education = Array.from(document.querySelectorAll('.education-section .pv-education-entity'));
                const parsedEducation = education.map(edu => ({
                    school: edu.querySelector('h3')?.textContent?.trim() || '',
                    degree: edu.querySelector('.pv-entity__degree-name .pv-entity__comma-item')?.textContent?.trim() || '',
                    fieldOfStudy: edu.querySelector('.pv-entity__fos .pv-entity__comma-item')?.textContent?.trim() || '',
                    duration: edu.querySelector('.pv-entity__dates span:nth-child(2)')?.textContent?.trim() || ''
                }));

                const skills = Array.from(document.querySelectorAll('.pv-skill-category-entity__name-text'))
                    .map(skill => skill.textContent?.trim())
                    .filter(Boolean);

                return { name, about, profilePicture, experiences: parsedExperiences, education: parsedEducation, skills };
            });

            const profile = await this.updateBaseProfileData(userId, {
                name: profileData.name,
                profilePicture: profileData.profilePicture
            });

            for (const exp of profileData.experiences) {
                const [startDate, endDate] = exp.duration.split(' - ');
                const experienceData: ExperienceDto = {
                    title: exp.title,
                    company: exp.company,
                    startDate: new Date(startDate || ''),
                    endDate: endDate ? new Date(endDate) : new Date(),
                    description: exp.description,
                    currentlyWorkHere: endDate === 'Present'
                };
                const experience = this.experiencesRepo.create(experienceData);
                experience.profile = profile;
                await this.experiencesRepo.save(experience);
            }

            for (const edu of profileData.education) {
                const [startDate, endDate] = edu.duration.split(' - ');
                const educationData: EducationDto = {
                    school: edu.school,
                    degree: edu.degree,
                    fieldOfStudy: edu.fieldOfStudy,
                    startDate: new Date(startDate || ''),
                    endDate: new Date(endDate || '')
                };
                const education = this.educationRepo.create(educationData);
                education.profile = profile;
                await this.educationRepo.save(education);
            }

            if (profileData.skills.length > 0) {
                const backgroundData: BackgroundDto = {
                    skills: profileData.skills
                };
                const background = this.backgroundsRepo.create(backgroundData);
                background.profile = profile;
                await this.backgroundsRepo.save(background);
            }

            return this.getProfileByUserId(userId);
        } catch (error) {
            throw new BadRequestException(`Failed to fetch LinkedIn profile: ${error.message}`);
        } finally {
            await browser.close();
        }
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
