import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import * as mongoose from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true, versionKey: false })
export class Message extends Document {
  @Prop({ required: true })
  text: string;

  @Prop()
  img: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    autopopulate: true,
  })
  user: User | string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
