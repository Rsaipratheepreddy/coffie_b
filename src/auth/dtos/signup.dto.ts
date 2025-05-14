import { IsMobilePhone, IsString, Length, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
    @ApiProperty({ example: '+919876543210' })
    @IsMobilePhone()
    mobile: string;

    @ApiProperty({ example: 'strongPassword123' })
    @IsString()
    @MinLength(6)
    password: string;
}

export class LoginDto {
    @ApiProperty({ example: '+919876543210' })
    @IsMobilePhone()
    mobile: string;

    @ApiProperty({ example: 'strongPassword123' })
    @IsString()
    @MinLength(6)
    password: string;
}

export class RequestOtpDto {
    @ApiProperty({ example: '+919876543210' })
    @IsMobilePhone()
    mobile: string;
}


export class VerifyOtpDto {
    @ApiProperty({ example: '+919876543210' })
    @IsMobilePhone()
    mobile: string;

    @ApiProperty({ example: '123456' })
    @IsString()
    @Length(6, 6)
    otp: string;
}
