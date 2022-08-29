import { Controller, Get, HttpStatus, Res } from '@nestjs/common';

@Controller('')
export class AppController {
  @Get()
  status(@Res() res) {
    return res.status(HttpStatus.OK).json({
      msg: 'Dev API up and running 🚀',
    });
  }
}
