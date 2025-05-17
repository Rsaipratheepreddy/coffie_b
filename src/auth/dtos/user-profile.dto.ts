import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'Unique identifier of the user'
    })
    id: string;

    @ApiProperty({
        example: '+919876543210',
        description: 'Mobile number of the user'
    })
    mobile: string;

    @ApiProperty({
        example: '2025-05-17T18:25:43.511Z',
        description: 'When the user was created'
    })
    createdAt: Date;

    @ApiProperty({
        example: '2025-05-17T18:25:43.511Z',
        description: 'When the user was last updated'
    })
    updatedAt: Date;
}
