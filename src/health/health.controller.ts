import { Controller, Get, HttpStatus, Res } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  status(@Res() res) {
    return res.status(HttpStatus.OK).json({
      msg: 'Life is good.',
    });
  }
}
