
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsOptional,
    IsInt,
    Min,
    Max,
    IsUrl,
    IsUUID,
    IsArray,
    ArrayNotEmpty,
    ValidateNested,
    IsBoolean,
    IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProfileDto {
    @ApiPropertyOptional({ description: 'Full name of the user', example: 'Saipratheep Reddy' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ description: 'Age in years', example: 23, minimum: 0, maximum: 120 })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(120)
    age?: number;

    @ApiPropertyOptional({ description: 'Location (city, country)', example: 'Hyderabad, India' })
    @IsOptional()
    @IsString()
    location?: string;

    @ApiPropertyOptional({ description: 'Public LinkedIn profile URL', example: 'https://www.linkedin.com/in/jane-doe' })
    @IsOptional()
    @IsUrl({}, { message: 'linkedin must be a valid URL' })
    linkedin?: string;

    @ApiPropertyOptional({ description: 'Calendly or other scheduling link', example: 'https://calendly.com/saipratheep/30min' })
    @IsOptional()
    @IsUrl({}, { message: 'schedulingLink must be a valid URL' })
    schedulingLink?: string;

    @ApiPropertyOptional({ description: 'Comma-separated list of personal IDEs/tools you use', example: 'VSCode, WebStorm' })
    @IsOptional()
    @IsString()
    myIdes?: string;
}

export class PromptDto {
    @ApiProperty({ example: 'Generate a professional summary' })
    prompt: string;

    @ApiProperty({ example: 'Use this to create a two–sentence summary for a LinkedIn bio', required: false })
    description?: string;
}

export class BackgroundDto {
    @ApiPropertyOptional({ example: 'Full-time', description: 'Commitment level' })
    commitmentLevel?: string;

    @ApiPropertyOptional({ example: 'Yes', description: 'Equity expectation' })
    equityException?: string;

    @ApiPropertyOptional({ example: 'Looking to match experienced founders', description: 'Matching intention' })
    matchingIntention?: string;

    @ApiPropertyOptional({ example: 2, description: 'Number of founders in current venture' })
    numberOfFounders?: number;

    @ApiPropertyOptional({ example: 'Built two startups before', description: 'Prior startup experience' })
    priorStartUpExperience?: string;

    @ApiPropertyOptional({
        type: [String],
        example: ['TypeScript', 'NestJS', 'Docker'],
        description: 'List of skills'
    })
    @IsOptional()
    @IsArray()
    skills?: string[];

    @ApiPropertyOptional({ example: 'I love building scalable back-ends', description: 'Free-form background description' })
    description?: string;
}

export class ExperienceDto {
    @ApiProperty({ example: 'Senior Software Engineer' })
    title: string;

    @ApiProperty({ example: 'Acme Corp' })
    company: string;

    @ApiPropertyOptional({
        description: 'ISO date of start',
        example: '2020-01-15',
        format: 'date'
    })
    @IsOptional()
    @IsDateString()
    @Type(() => Date)
    startDate?: Date;

    @ApiPropertyOptional({
        description: 'ISO date of start',
        example: '2020-01-15',
        format: 'date'
    })
    @IsOptional()
    @IsDateString()
    @Type(() => Date)
    endDate?: Date;

    @ApiProperty({ description: 'Currently working here?', example: false })
    currentlyWorkHere: boolean;

    @ApiPropertyOptional({ example: 'Led a team of 5 engineers...', description: 'Role description' })
    description?: string;
}

export class EducationDto {
    @ApiProperty({ example: 'State University' })
    school: string;

    @ApiProperty({ example: 'B.Sc. Computer Science' })
    degree: string;

    @ApiPropertyOptional({ example: 'Software Engineering', description: 'Field of study' })
    fieldOfStudy?: string;

    @IsOptional()
    @IsDateString()
    @Type(() => Date)
    startDate?: Date;

    @IsOptional()
    @IsDateString()
    @Type(() => Date)
    endDate?: Date;

    @ApiPropertyOptional({ example: 'Magna cum laude', description: 'Additional details' })
    description?: string;
}

export class GetProfileDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440010' })
    id: string;

    @ApiPropertyOptional({ example: 'Saipratheep Reddy' })
    name?: string;

    @ApiPropertyOptional({ example: 23 })
    age?: number;

    @ApiPropertyOptional({ example: 'Hyderabad, India' })
    location?: string;

    @ApiPropertyOptional({ example: 'https://www.linkedin.com/in/saipratheepreddy' })
    linkedin?: string;

    @ApiPropertyOptional({ example: 'https://calendly.com/saipratheep/30min' })
    schedulingLink?: string;

    @ApiPropertyOptional({ example: 'VSCode, WebStorm' })
    myIdes?: string;

    @ApiProperty({ type: [PromptDto] })
    @ValidateNested({ each: true })
    @Type(() => PromptDto)
    selectedPrompts: PromptDto[];

    @ApiProperty({ type: BackgroundDto })
    @ValidateNested()
    @Type(() => BackgroundDto)
    background: BackgroundDto;

    @ApiProperty({ type: [ExperienceDto] })
    @ValidateNested({ each: true })
    @Type(() => ExperienceDto)
    experiences: ExperienceDto[];

    @ApiProperty({ type: [EducationDto] })
    @ValidateNested({ each: true })
    @Type(() => EducationDto)
    education: EducationDto[];
}

// ---- additional DTOs for mutations ----

export class AddBackgroundDto {
    @ApiPropertyOptional({ description: 'Commitment level', example: 'Full-time' })
    @IsOptional()
    @IsString()
    commitmentLevel?: string;

    @ApiPropertyOptional({ description: 'Equity expectation', example: 'Yes' })
    @IsOptional()
    @IsString()
    equityException?: string;

    @ApiPropertyOptional({ description: 'Matching intention', example: 'Looking to match experienced founders' })
    @IsOptional()
    @IsString()
    matchingIntention?: string;

    @ApiPropertyOptional({ description: 'Number of founders', example: 2 })
    @IsOptional()
    @IsInt()
    numberOfFounders?: number;

    @ApiPropertyOptional({ description: 'Prior startup experience', example: 'Built two startups before' })
    @IsOptional()
    @IsString()
    priorStartUpExperience?: string;

    @ApiPropertyOptional({
        type: [String],
        description: 'List of skills',
        example: ['TypeScript', 'NestJS']
    })
    @IsOptional()
    @IsArray()
    skills?: string[];

    @ApiPropertyOptional({ description: 'Background description', example: 'I love scalable back-ends' })
    @IsOptional()
    @IsString()
    description?: string;
}

export class UpdateBackgroundDto extends AddBackgroundDto {
    @ApiProperty({ description: 'Background record UUID', example: '550e8400-e29b-41d4-a716-446655440001' })
    @IsUUID()
    id: string;
}

export class AddExperienceDto {
    @ApiProperty({ example: 'Senior Software Engineer' })
    @IsString()
    title: string;

    @ApiProperty({ example: 'Acme Corp' })
    @IsString()
    company: string;

    @ApiPropertyOptional({ description: 'ISO start date', example: '2020-01-15' })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional({ description: 'ISO end date', example: '2023-05-01' })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiProperty({ description: 'Currently working here?', example: false })
    @IsBoolean()
    currentlyWorkHere: boolean;

    @ApiPropertyOptional({ description: 'Role description', example: 'Led a team…' })
    @IsOptional()
    @IsString()
    description?: string;
}

export class UpdateExperienceDto extends AddExperienceDto {
    @ApiProperty({ description: 'Experience record UUID', example: '550e8400-e29b-41d4-a716-446655440002' })
    @IsUUID()
    id: string;
}

export class DeleteExperienceDto {
    @ApiProperty({ description: 'Experience record UUID', example: '550e8400-e29b-41d4-a716-446655440002' })
    @IsUUID()
    id: string;
}

export class AddEducationDto {
    @ApiProperty({ example: 'State University' })
    @IsString()
    school: string;

    @ApiProperty({ example: 'B.Sc. Computer Science' })
    @IsString()
    degree: string;

    @ApiPropertyOptional({ description: 'Field of study', example: 'Software Engineering' })
    @IsOptional()
    @IsString()
    fieldOfStudy?: string;

    @ApiPropertyOptional({ description: 'ISO start date', example: '2016-08-01' })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional({ description: 'ISO end date', example: '2020-05-15' })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiPropertyOptional({ description: 'Additional details', example: 'Magna cum laude' })
    @IsOptional()
    @IsString()
    description?: string;
}

export class UpdateEducationDto extends AddEducationDto {
    @ApiProperty({ description: 'Education record UUID', example: '550e8400-e29b-41d4-a716-446655440003' })
    @IsUUID()
    id: string;
}

export class DeleteEducationDto {
    @ApiProperty({ description: 'Education record UUID', example: '550e8400-e29b-41d4-a716-446655440003' })
    @IsUUID()
    id: string;
}
