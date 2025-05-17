import { IsMobilePhone, IsString, Length, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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


