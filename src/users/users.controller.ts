import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Request,
  Res,
  HttpStatus,
  NotAcceptableException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto, @Res() res) {
    try {
      const user = await this.usersService.create(createUserDto);
      const result = user.toObject();
      delete result.password;
      return res.status(HttpStatus.OK).json(result);

      return;
    } catch (e) {
      return res.status(HttpStatus.CONFLICT).json({
        msg: `Can't create user with those credentials.`,
      });
    }
  }

  @UseGuards(AuthGuard())
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(AuthGuard())
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(AuthGuard())
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
    @Res() res,
  ) {
    const userId = req.user.id;
    if (userId != id) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        msg: 'You are not allowed to update other users.',
      });
    }
    const updated = await this.usersService.update(id, updateUserDto);

    return res.status(HttpStatus.OK).json(updated);
  }

  @UseGuards(AuthGuard())
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req, @Res() res) {
    const userId = req.user.id;

    if (userId != id) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        msg: 'You are not allowed to delete other users.',
      });
    }
    await this.usersService.remove(id);

    return res.status(HttpStatus.OK).json({
      msg: 'User deleted.',
    });
  }
}
