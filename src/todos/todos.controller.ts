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
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@UseGuards(AuthGuard())
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  create(@Body() createTodoDto: CreateTodoDto, @Request() req) {
    createTodoDto.creator = req.user.id;
    return this.todosService.create(createTodoDto);
  }

  @Get()
  findAll() {
    return this.todosService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req, @Res() res) {
    try {
      const task = await this.todosService.findOne(id);
      if (!task) {
        return res.status(HttpStatus.NOT_FOUND).json({
          msg: 'No task found.',
        });
      }
      const creator = (task.creator as any)._id.toString();

      if (task.private && creator != req.user.id) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          msg: 'You are not allowed to view private tasks.',
        });
      }
      return res.status(HttpStatus.OK).json(task);
    } catch (e) {
      return res.status(HttpStatus.NOT_FOUND).json({
        msg: 'No task found.',
      });
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
    @Request() req,
    @Res() res,
  ) {
    try {
      const task = await this.todosService.findOne(id);
      if (!task) {
        return res.status(HttpStatus.NOT_FOUND).json({
          msg: 'No task found.',
        });
      }
      const creator = (task.creator as any)._id.toString();

      if (task.private && creator != req.user.id) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          msg: 'You are not allowed to update private tasks of oither people.',
        });
      }

      const todo = await this.todosService.update(id, updateTodoDto);
      return res.status(HttpStatus.OK).json(todo);
    } catch (e) {
      return res.status(HttpStatus.NOT_FOUND).json({
        msg: 'No task found.',
      });
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req, @Res() res) {
    try {
      const task = await this.todosService.findOne(id);
      if (!task) {
        return res.status(HttpStatus.NOT_FOUND).json({
          msg: 'No task found.',
        });
      }
      console.log('the task: ', task);

      const creator = (task.creator as any)._id.toString();

      if (task.private && creator != req.user.id) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          msg: 'You are not allowed to delete private tasks of oither people.',
        });
      }

      await this.todosService.remove(id);
      return res.status(HttpStatus.OK).json({ msg: 'Task deleted.' });
    } catch (e) {
      return res.status(HttpStatus.NOT_FOUND).json({
        msg: 'No task found.',
      });
    }
  }

  @Post(':id/img')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadFile(
    @Param('id') todoId,
    @UploadedFile() file,
    @Request() req,
    @Res() res,
  ) {
    const url = req.protocol + '://' + req.get('host') + '/todos/' + file.path;

    const todo = await this.todosService.update(todoId, { img: url });
    if (!todo) throw new NotFoundException('Todo does not exist');
    return res.status(HttpStatus.OK).json(todo);
  }

  @Get('uploads/:filename')
  async getImage(@Param('filename') filename, @Res() res) {
    res.sendFile(filename, { root: 'uploads' });
  }
}
