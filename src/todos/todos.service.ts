import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo, TodoDocument } from './schemas/todo.schema';

@Injectable()
export class TodosService {
  constructor(@InjectModel(Todo.name) private todoModel: Model<TodoDocument>) {}

  create(createTodoDto: CreateTodoDto) {
    const newTodo = new this.todoModel(createTodoDto);
    return newTodo.save();
  }

  findAll() {
    return this.todoModel.find({ private: false });
  }

  findUserTasks(id) {
    return this.todoModel.find({ creator: id });
  }

  findOne(id: string) {
    return this.todoModel.findById(id);
  }

  update(id: string, updateTodoDto) {
    return this.todoModel.findByIdAndUpdate(id, updateTodoDto, {
      new: true,
    });
  }

  remove(id: string) {
    return this.todoModel.deleteOne({ _id: id }).exec();
  }
}
