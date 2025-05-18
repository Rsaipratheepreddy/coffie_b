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
    async generateRandomProfile(userId: string): Promise<Profile> {
        const user = await this.usersRepo.findOne({ where: { id: userId }, relations: ['profile'] });
        if (!user) throw new NotFoundException(`User with id=${userId} not found`);

        const names = ['John Doe', 'Jane Smith', 'Alex Johnson', 'Emily Brown', 'Michael Davis'];
        const locations = ['New York, NY', 'San Francisco, CA', 'London, UK', 'Toronto, ON', 'Sydney, AU'];
        const randomName = names[Math.floor(Math.random() * names.length)];
        const randomAge = Math.floor(Math.random() * (40 - 22 + 1)) + 22;
        const randomLocation = locations[Math.floor(Math.random() * locations.length)];
        const randomLinkedin = `https://linkedin.com/in/${randomName.replace(' ', '').toLowerCase()}`;
        const randomProfilePicture = `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`;
        const randomSchedulingLink = `https://calendly.com/${randomName.replace(' ', '').toLowerCase()}`;

        const profileData = {
            name: randomName,
            age: randomAge,
            location: randomLocation,
            linkedin: randomLinkedin,
            profilePicture: randomProfilePicture,
            schedulingLink: randomSchedulingLink,
            myIdes: 'Random ideas or description here.',
            selectedPromptIds: [],
        };

        let profile: Profile;
        if (!user.profile) {
            profile = this.profilesRepo.create(profileData);
            user.profile = profile;
        } else {
            Object.assign(user.profile, profileData);
            profile = user.profile;
        }

        await this.usersRepo.save(user).catch(err => {
            throw new Error(`Failed to save user profile: ${err.message}`);
        });

        // Generate random background
        const commitmentLevels = ['Full-time', 'Part-time', 'Consulting'];
        const equityExceptions = ['Yes', 'No', 'Negotiable'];
        const matchingIntentions = ['Co-founder', 'Early Employee', 'Advisor'];
        const backgroundData = {
            commitmentLevel: commitmentLevels[Math.floor(Math.random() * commitmentLevels.length)],
            equityException: equityExceptions[Math.floor(Math.random() * equityExceptions.length)],
            matchingIntention: matchingIntentions[Math.floor(Math.random() * matchingIntentions.length)],
            numberOfFounders: Math.floor(Math.random() * (5 - 1 + 1)) + 1, // Random between 1 and 5
            priorStartUpExperience: Math.random() > 0.5 ? 'Yes' : 'No',
            skills: ['JavaScript', 'Python', 'Marketing', 'Product Management', 'UI/UX Design', 'Sales'].slice(0, Math.floor(Math.random() * 3) + 2),
            description: 'A passionate professional with diverse skills and experience.',
        };

        const background = this.backgroundsRepo.create(backgroundData);
        profile.background = background;
        await this.profilesRepo.save(profile).catch(err => {
            throw new Error(`Failed to save profile background: ${err.message}`);
        });

        // Generate random experiences (3 to 5)
        const companies = ['Google', 'Microsoft', 'Amazon', 'Facebook', 'Apple', 'Netflix'];
        const titles = ['Software Engineer', 'Product Manager', 'Data Scientist', 'Marketing Lead', 'UX Designer', 'Sales Manager'];
        const numExperiences = Math.floor(Math.random() * (5 - 3 + 1)) + 3; // Random between 3 and 5
        const experiences = [];
        for (let i = 0; i < numExperiences; i++) {
            const startYear = 2015 + i;
            const currentlyWorkHere = i === numExperiences - 1 && Math.random() > 0.7;
            const company = companies[Math.floor(Math.random() * companies.length)];
            const title = titles[Math.floor(Math.random() * titles.length)];
            const experienceData = {
                title: title,
                company: company,
                startDate: `${startYear}-01-01`,
                endDate: currentlyWorkHere ? null : `${startYear + 2}-12-31`,
                currentlyWorkHere,
                description: `Worked on various projects at ${company} as a ${title}.`,
            };
            const experience = this.experiencesRepo.create(experienceData);
            experience.profile = profile;
            experiences.push(experience);
        }
        await this.experiencesRepo.save(experiences).catch(err => {
            throw new Error(`Failed to save experiences: ${err.message}`);
        });

        const schools = ['MIT', 'Stanford', 'Harvard', 'Oxford', 'Cambridge'];
        const degrees = ['B.Sc. Computer Science', 'MBA', 'B.A. Economics', 'M.Sc. Data Science', 'B.Eng. Mechanical Engineering'];
        const fieldsOfStudy = ['Computer Science', 'Business Administration', 'Economics', 'Data Science', 'Mechanical Engineering'];
        const educations = [];
        for (let i = 0; i < 2; i++) {
            const startYear = 2010 + (i * 2);
            const school = schools[Math.floor(Math.random() * schools.length)];
            const fieldOfStudy = fieldsOfStudy[Math.floor(Math.random() * fieldsOfStudy.length)];
            const educationData = {
                school: school,
                degree: degrees[Math.floor(Math.random() * degrees.length)],
                fieldOfStudy: fieldOfStudy,
                startDate: `${startYear}-09-01`,
                endDate: `${startYear + 4}-06-30`,
                description: `Studied ${fieldOfStudy} at ${school}.`,
            };
            const education = this.educationRepo.create(educationData);
            education.profile = profile;
            educations.push(education);
        }
        await this.educationRepo.save(educations).catch(err => {
            throw new Error(`Failed to save educations: ${err.message}`);
        });

        if (DEFAULT_PROMPTS && DEFAULT_PROMPTS.length > 0) {
            const numPrompts = Math.min(Math.floor(Math.random() * 3) + 1, DEFAULT_PROMPTS.length); // Random number between 1 and 3, limited by available prompts
            const selectedPrompts = DEFAULT_PROMPTS.sort(() => 0.5 - Math.random()).slice(0, numPrompts).filter(p => p !== null && p !== undefined) as any[];
            const dummyDescriptions = [
                "Tell me about a challenge you've overcome.",
                "What's a hobby you're passionate about?",
                "Describe a memorable travel experience."
            ];
            profile.selectedPromptIds = selectedPrompts.map((p, index) => {
                let promptText = '';
                if (typeof p === 'object' && p !== null && 'prompt' in p) {
                    promptText = p.prompt;
                } else if (typeof p === 'string') {
                    promptText = p;
                } else {
                    promptText = String(p);
                }
                const description = typeof p === 'object' && p !== null && 'description' in p && p.description ? p.description : dummyDescriptions[index];
                return JSON.stringify({
                    prompt: promptText,
                    description: description
                });
            });
        } else {
            profile.selectedPromptIds = [];
        }

        await this.profilesRepo.save(profile).catch(err => {
            throw new Error(`Failed to save final profile with prompts: ${err.message}`);
        });
        return profile;
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
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--window-size=1920x1080',
                '--disable-notifications'
            ],
            defaultViewport: { width: 1920, height: 1080 }
        });

        try {
            const page = await browser.newPage();

            // Clear cookies & storage
            await page.deleteCookie(...(await page.cookies()));
            const client = await page.target().createCDPSession();
            await client.send('Network.clearBrowserCache');
            await client.send('Network.clearBrowserCookies');
            await client.send('Storage.clearDataForOrigin', {
                origin: 'https://www.linkedin.com',
                storageTypes: 'local_storage,session_storage'
            });

            // Set LinkedIn cookies
            const liAt = process.env.LINKEDIN_COOKIES_LI_AT;
            const jsessionId = process.env.LINKEDIN_COOKIES_JSESSIONID;
            if (!liAt || !jsessionId) {
                throw new BadRequestException('Missing LinkedIn cookies. Set LINKEDIN_COOKIES_LI_AT and LINKEDIN_COOKIES_JSESSIONID in .env');
            }
            await page.setCookie(
                { name: 'li_at', value: liAt, domain: '.linkedin.com' },
                { name: 'JSESSIONID', value: jsessionId, domain: '.linkedin.com' }
            );

            // Set timeouts
            page.setDefaultNavigationTimeout(60000);
            page.setDefaultTimeout(60000);

            // Block unnecessary resources to speed up loading
            await page.setRequestInterception(true);
            page.on('request', req => {
                const url = req.url().toLowerCase();
                if (req.resourceType() === 'image' || url.endsWith('.css') || url.includes('analytics')) {
                    return req.abort();
                }
                req.continue();
            });
            page.on('response', async response => {
                if (response.status() >= 400) {
                    console.error(`Error response: ${response.status()} for URL: ${response.url()}`);
                    if (response.status() === 502) {
                        throw new BadRequestException(`Received 502 Bad Gateway error from LinkedIn. This is likely a temporary server issue on LinkedIn's end. Please try again later.`);
                    }
                }
            });

            // Check session validity
            try {
                const apiResp = await page.goto('https://www.linkedin.com/voyager/api/me', {
                    waitUntil: 'networkidle2',
                    timeout: 20000
                });
                if (!apiResp || apiResp.status() !== 200) {
                    throw new BadRequestException(
                        'LinkedIn session invalid. Please refresh your cookies in .env file. Steps:\n' +
                        '1. Login to LinkedIn in your browser\n' +
                        '2. Open DevTools (F12)\n' +
                        '3. Go to Application > Cookies > linkedin.com\n' +
                        '4. Copy values for li_at and JSESSIONID\n' +
                        '5. Update LINKEDIN_COOKIES_LI_AT and LINKEDIN_COOKIES_JSESSIONID in .env'
                    );
                }
            } catch (err) {
                throw new BadRequestException(
                    'Failed to verify LinkedIn session. Error: ' + err.message + '\n' +
                    'Please refresh your cookies in .env file following these steps:\n' +
                    '1. Login to LinkedIn in your browser\n' +
                    '2. Open DevTools (F12)\n' +
                    '3. Go to Application > Cookies > linkedin.com\n' +
                    '4. Copy values for li_at and JSESSIONID\n' +
                    '5. Update LINKEDIN_COOKIES_LI_AT and LINKEDIN_COOKIES_JSESSIONID in .env'
                );
            }

            // Load profile page
            try {
                await page.goto(linkedinUrl, { waitUntil: 'networkidle2', timeout: 30000 });
                await page.waitForSelector('h1', { timeout: 10000 });
            } catch (err) {
                const isLoginPage = await page.evaluate(() =>
                    !!document.querySelector('.login__form') ||
                    window.location.href.includes('linkedin.com/login')
                );
                if (isLoginPage) {
                    throw new BadRequestException(
                        'LinkedIn authentication failed. Update your li_at/JSESSIONID cookies in .env file. Steps:\n' +
                        '1. Login to LinkedIn in your browser\n' +
                        '2. Open DevTools (F12)\n' +
                        '3. Go to Application > Cookies > linkedin.com\n' +
                        '4. Copy values for li_at and JSESSIONID\n' +
                        '5. Update LINKEDIN_COOKIES_LI_AT and LINKEDIN_COOKIES_JSESSIONID in .env'
                    );
                }
                throw new BadRequestException(
                    'Failed to load LinkedIn profile. Please ensure the profile URL is correct and publicly accessible. Error: ' + err.message
                );
            }

            // Extract profile data
            const profileData = await page.evaluate(() => {
                const name = document.querySelector('h1')?.textContent?.trim() || '';
                const about = document.querySelector('.pv-about-section')?.textContent?.trim() || '';
                const profilePicture =
                    document.querySelector('.pv-top-card-profile-picture__image')?.getAttribute('src') ||
                    document.querySelector('.profile-photo-edit__preview')?.getAttribute('src') || '';

                const experiences = Array.from(document.querySelectorAll('.experience-section .pv-entity__position-group'));
                const parsedExperiences = experiences.map(exp => ({
                    title: exp.querySelector('.pv-entity__summary-info h3')?.textContent?.trim() || '',
                    company: exp.querySelector('.pv-entity__secondary-title')?.textContent?.trim() || '',
                    duration: exp.querySelector('.pv-entity__date-range')?.textContent?.trim() || '',
                    description: exp.querySelector('.pv-entity__description')?.textContent?.trim() || ''
                }));

                const education = Array.from(document.querySelectorAll('.education-section .pv-education-entity'));
                const parsedEducation = education.map(edu => ({
                    school: edu.querySelector('.pv-entity__school-name')?.textContent?.trim() || '',
                    degree: edu.querySelector('.pv-entity__degree-name')?.textContent?.trim() || '',
                    fieldOfStudy: edu.querySelector('.pv-entity__fos')?.textContent?.trim() || '',
                    duration: edu.querySelector('.pv-entity__date-range')?.textContent?.trim() || ''
                }));

                const skills = Array.from(document.querySelectorAll('.pv-skill-category-entity__name-text'))
                    .map(el => el.textContent?.trim())
                    .filter(Boolean);

                return { name, about, profilePicture, experiences: parsedExperiences, education: parsedEducation, skills };
            });

            // Save profile data to database
            const profile = await this.updateBaseProfileData(userId, {
                name: profileData.name,
                profilePicture: profileData.profilePicture
            });

            for (const exp of profileData.experiences) {
                const [startDate, endDate] = exp.duration.split(' - ');
                const dto: ExperienceDto = {
                    title: exp.title,
                    company: exp.company,
                    startDate: new Date(startDate || ''),
                    endDate: new Date(endDate || ''),
                    description: exp.description,
                    currentlyWorkHere: endDate === 'Present'
                };
                const entity = this.experiencesRepo.create(dto);
                entity.profile = profile;
                await this.experiencesRepo.save(entity);
            }

            for (const edu of profileData.education) {
                const [startDate, endDate] = edu.duration.split(' - ');
                const dto: EducationDto = {
                    school: edu.school,
                    degree: edu.degree,
                    fieldOfStudy: edu.fieldOfStudy,
                    startDate: new Date(startDate || ''),
                    endDate: new Date(endDate || '')
                };
                const entity = this.educationRepo.create(dto);
                entity.profile = profile;
                await this.educationRepo.save(entity);
            }

            if (profileData.skills.length) {
                const dto: BackgroundDto = { skills: profileData.skills };
                const entity = this.backgroundsRepo.create(dto);
                entity.profile = profile;
                await this.backgroundsRepo.save(entity);
            }

            return this.getProfileByUserId(userId);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
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
