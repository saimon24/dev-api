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
  UseInterceptors,
  UploadedFile,
  Res,
  HttpStatus,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateMessageDto } from './dto/update-message-dto';
import { PaginationParams } from '../utils/paginationParams';

@UseGuards(AuthGuard())
@Controller('messages')
export class MessagesController {
  constructor(private readonly messageService: MessagesService) {}

  @Post()
  create(@Body() createDto: CreateMessageDto, @Request() req) {
    createDto.user = req.user.id;
    return this.messageService.create(createDto);
  }

  @Get()
  findAll(@Query() { skip, limit }: PaginationParams) {
    return this.messageService.findAll(skip, limit);
  }

  @Get('/me')
  findMyTasks(@Request() req) {
    return this.messageService.findUserTasks(req.user.id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateMessageDto,
    @Request() req,
    @Res() res,
  ) {
    try {
      const item = await this.messageService.findOne(id);
      if (!item) {
        return res.status(HttpStatus.NOT_FOUND).json({
          msg: 'No Message found.',
        });
      }
      const user = (item.user as any)._id.toString();

      if (user != req.user.id) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          msg: 'You are not allowed to update messages of other people.',
        });
      }

      const msg = await this.messageService.update(id, updateDto);
      return res.status(HttpStatus.OK).json(msg);
    } catch (e) {
      return res.status(HttpStatus.NOT_FOUND).json({
        msg: 'No message found.',
      });
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req, @Res() res) {
    try {
      const msg = await this.messageService.findOne(id);
      if (!msg) {
        return res.status(HttpStatus.NOT_FOUND).json({
          msg: 'No msg found.',
        });
      }

      const user = (msg.user as any)._id.toString();

      if (user != req.user.id) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          msg: 'You are not allowed to delete messages of other people.',
        });
      }

      await this.messageService.remove(id);
      return res.status(HttpStatus.OK).json({ msg: 'Message deleted.' });
    } catch (e) {
      return res.status(HttpStatus.NOT_FOUND).json({
        msg: 'No task found.',
      });
    }
  }
}
