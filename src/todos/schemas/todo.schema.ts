import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import * as mongoose from 'mongoose';

export type TodoDocument = Todo & Document;

@Schema({ timestamps: true, versionKey: false })
export class Todo extends Document {
  @Prop()
  text: string;

  @Prop()
  img: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    autopopulate: true,
  })
  creator: User | string;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);
