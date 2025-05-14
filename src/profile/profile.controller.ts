// src/profile/profile.controller.ts
import {
    Controller,
    Get,
    Patch,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Request,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import {
    UpdateProfileDto,
    PromptDto,
    BackgroundDto,
    ExperienceDto,
    EducationDto,
} from './dtos/profile.dto';
import { Profile } from 'src/entities/profile.entity';
import { Background } from 'src/entities/background.entity';
import { Experience } from 'src/entities/experience.entity';
import { Education } from 'src/entities/education.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';

@ApiTags('Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@Controller('profile')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) { }

    @Get('me')
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiOkResponse({ type: Profile })
    me(@Request() req): Promise<Profile> {
        console.log('req.user', req.user);
        return this.profileService.getProfileByUserId(req.user.id);
    }

    @Patch('base')
    @ApiOperation({ summary: 'Update base profile data' })
    @ApiOkResponse({ type: Profile })
    @ApiBadRequestResponse()
    updateBase(
        @Request() req,
        @Body() dto: UpdateProfileDto,
    ): Promise<Profile> {
        return this.profileService.updateBaseProfileData(req.user.id, dto);
    }

    @Get('prompts')
    @ApiOperation({ summary: 'Get default prompts' })
    @ApiOkResponse({ description: 'List of default prompts' })
    getPrompts() {
        return this.profileService.getAllPrompts();
    }

    @Post('prompts')
    @ApiOperation({ summary: 'Add a prompt to profile' })
    @ApiOkResponse({ type: Profile })
    @ApiBadRequestResponse()
    addPrompt(
        @Request() req,
        @Body() dto: PromptDto,
    ): Promise<Profile> {
        return this.profileService.addPromptToProfile(req.user.id, dto);
    }

    @Put('prompts')
    @ApiOperation({ summary: 'Update a prompt in profile' })
    @ApiOkResponse({ type: Profile })
    @ApiBadRequestResponse()
    updatePrompt(
        @Request() req,
        @Body() dto: PromptDto,
    ): Promise<Profile> {
        return this.profileService.updatePromptInProfile(req.user.id, dto);
    }

    @Post('background')
    @ApiOperation({ summary: 'Add background to profile' })
    @ApiOkResponse({ type: Profile })
    @ApiBadRequestResponse()
    addBackground(
        @Request() req,
        @Body() dto: BackgroundDto,
    ): Promise<Profile> {
        return this.profileService.addBackgroundToProfile(req.user.id, dto);
    }

    @Put('background/:id')
    @ApiOperation({ summary: 'Update background' })
    @ApiOkResponse({ type: Background })
    @ApiBadRequestResponse()
    updateBackground(
        @Param('id') id: string,
        @Body() dto: BackgroundDto,
    ): Promise<Background> {
        return this.profileService.updateBackgroundToProfile(id, dto);
    }

    @Post('experiences')
    @ApiOperation({ summary: 'Add experience to profile' })
    @ApiOkResponse({ type: Profile })
    @ApiBadRequestResponse()
    addExperience(
        @Request() req,
        @Body() dto: ExperienceDto,
    ): Promise<Profile> {
        return this.profileService.addExperienceToProfile(req.user.id, dto);
    }

    @Put('experiences/:id')
    @ApiOperation({ summary: 'Update experience' })
    @ApiOkResponse({ type: Experience })
    @ApiBadRequestResponse()
    updateExperience(
        @Param('id') id: string,
        @Body() dto: ExperienceDto,
    ): Promise<Experience> {
        return this.profileService.updateExperienceToProfile(id, dto);
    }

    @Delete('experiences/:id')
    @ApiOperation({ summary: 'Delete experience' })
    @ApiOkResponse({ description: 'Experience deleted' })
    deleteExperience(
        @Param('id') id: string,
    ): Promise<void> {
        return this.profileService.deleteExperienceFromProfile(id);
    }

    @Post('education')
    @ApiOperation({ summary: 'Add education to profile' })
    @ApiOkResponse({ type: Profile })
    @ApiBadRequestResponse()
    addEducation(
        @Request() req,
        @Body() dto: EducationDto,
    ): Promise<Profile> {
        return this.profileService.addEducationToProfile(req.user.id, dto);
    }

    @Put('education/:id')
    @ApiOperation({ summary: 'Update education' })
    @ApiOkResponse({ type: Education })
    @ApiBadRequestResponse()
    updateEducation(
        @Param('id') id: string,
        @Body() dto: EducationDto,
    ): Promise<Education> {
        return this.profileService.updateEducationToProfile(id, dto);
    }

    @Delete('education/:id')
    @ApiOperation({ summary: 'Delete education' })
    @ApiOkResponse({ description: 'Education deleted' })
    deleteEducation(
        @Param('id') id: string,
    ): Promise<void> {
        return this.profileService.deleteEducationFromProfile(id);
    }
}