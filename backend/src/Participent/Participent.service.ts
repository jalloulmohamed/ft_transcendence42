/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreateConversationParams} from 'src/utils/types';

@Injectable()
export class ParticipentService {

    constructor(private prisma : PrismaService)
    {

    }

    async findParticipent(params : CreateConversationParams, user : User)
    {
        // const chatroom = this.prisma.chatRoom.findUnique()
        const chat = await this.prisma.chatParticipents.findFirst({
          where: {
            OR: [
              { sender: { display_name: params.display_name }, recipientId: user.id },
              { senderId: user.id, recipient: { display_name: params.display_name } },
            ],
          },
        });
        return chat;
    }
 

    async CreateParticipent(params : CreateConversationParams, user : User)
    {
      const newParticipent = await this.prisma.chatParticipents.create({
        data: {
          sender: {
            connect: { id: user.id }
          },
          recipient: {
            connect: { display_name: params.display_name}
          }
        }
      });

        return newParticipent
    }
 


async  findParticipentChat(user :User) {
  const chatParticipents = await this.prisma.chatParticipents.findMany({
    where: {
      OR: [
        { senderId: user.id },
        { recipientId: user.id },
      ],
    },
    include: {
      sender: true,
      recipient: true,
      lastMessage: true,
    },
    orderBy: {
      lastMessage: {
        createdAt: 'desc', // Order by createdAt of the lastMessage in descending order
      },
    },
  
  });

  return chatParticipents;
}










}