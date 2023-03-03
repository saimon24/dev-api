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
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { PaginationParams } from '../utils/paginationParams';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { createReadStream } from 'fs';

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
  findAll(@Query() { skip, limit }: PaginationParams) {
    return this.usersService.findAll(skip, limit);
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

  @UseGuards(AuthGuard())
  @Put(':id/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const randomName = req.params.id;
          cb(null, `${randomName}.png`);
        },
      }),
      fileFilter(req, file, cb) {
        if (req.user.id != req.params.id) {
          return cb(null, false);
        }
        return cb(null, true);
      },
    }),
  )
  async uploadFile(
    @Param('id') id,
    @UploadedFile() file,
    @Request() req,
    @Res() res,
  ) {
    try {
      if (id != req.user.id) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          msg: 'You are not allowed to update other avatars.',
        });
      }

      return res.status(HttpStatus.OK).json({
        msg: 'Avatar updated.',
      });
    } catch (e) {
      console.log('error: ', e);

      return res.status(HttpStatus.NOT_FOUND).json({
        msg: 'Encountered error: ' + e,
      });
    }
  }

  @Get(':id/avatar')
  async getImage(@Param('id') id, @Res() res) {
    if (!fs.existsSync(`uploads/avatars/${id}.png`)) {
      return res.status(HttpStatus.NOT_FOUND).json({
        msg: 'User has no avatar',
      });
    } else {
      res.sendFile(`${id}.png`, { root: 'uploads/avatars' });
    }
  }
}
