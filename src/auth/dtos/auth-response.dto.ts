import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
    @ApiProperty({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'JWT access token',
    })
    access_token: string;

    @ApiProperty({
        example: '3600',
        description: 'Token expiration in seconds',
    })
    expires_in: number;
}
