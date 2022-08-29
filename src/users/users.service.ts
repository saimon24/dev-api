import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  create(createUserDto: CreateUserDto) {
    createUserDto.email = createUserDto.email.toLowerCase();
    const newUser = new this.userModel(createUserDto);
    return newUser.save();
  }

  findAll() {
    return this.userModel.find(
      {},
      {
        email: 1,
        username: 1,
        createdAt: 1,
        _id: 1,
      },
    );
  }

  findOne(id: string) {
    return this.userModel
      .findById(id, {
        email: 1,
        username: 1,
        createdAt: 1,
        _id: 1,
      })
      .exec();
  }

  findWithPw(id: string) {
    return this.userModel.findById(id);
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
  }

  remove(id: string) {
    return this.userModel.deleteOne({ _id: id }).exec();
  }

  findByEmail(email) {
    return this.userModel.findOne({ email }, 'password');
  }
}
