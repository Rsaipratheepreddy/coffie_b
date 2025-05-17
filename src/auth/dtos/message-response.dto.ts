import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
    @ApiProperty({
        example: 'Operation completed successfully',
        description: 'A message describing the result of the operation'
    })
    message: string;
}
