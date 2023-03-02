import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { Model } from 'mongoose';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  create(createDto: CreateMessageDto) {
    const item = new this.messageModel(createDto);
    return item.save();
  }

  findAll(documentsToSkip = 0, limitOfDocuments?: number) {
    const query = this.messageModel
      .find()
      .sort({ _id: 1 })
      .skip(documentsToSkip);

    if (limitOfDocuments) {
      query.limit(limitOfDocuments);
    }
    return query;
  }

  findUserTasks(id) {
    return this.messageModel.find({ user: id });
  }

  findOne(id: string) {
    return this.messageModel.findById(id);
  }

  update(id: string, updateTodoDto) {
    return this.messageModel.findByIdAndUpdate(id, updateTodoDto, {
      new: true,
    });
  }

  remove(id: string) {
    return this.messageModel.deleteOne({ _id: id }).exec();
  }
}
