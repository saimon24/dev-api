import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import * as mongoose from 'mongoose';

export type TodoDocument = Todo & Document;

@Schema({ timestamps: true, versionKey: false })
export class Todo extends Document {
  @Prop({ required: true })
  task: string;

  @Prop()
  desc: string;

  @Prop()
  img: string;

  @Prop({ default: false })
  private: boolean;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    autopopulate: true,
  })
  creator: User | string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    autopopulate: true,
  })
  assigned_to: User | string;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);
