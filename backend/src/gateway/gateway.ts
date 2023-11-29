/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { AuthenticatedSocket } from 'src/utils/interfaces';
import { IGateWaySession } from './gateway.session';
import { Services } from 'src/utils/constants';
import { Inject } from '@nestjs/common';
import { Message, User } from '@prisma/client';
import { Client } from 'socket.io/dist/client';
import { PrismaService } from 'prisma/prisma.service';
@WebSocketGateway({
	cors: {
		origin: ['http://localhost:3000'],
		credentials: true,
	},
})
/******any user that will be connected it will send to it that event son this wrong
 * we need to send it only to a correct user that i choose to send it the message how i can do that ?
 *
 * we need to bassicaly map the user session to there socket (the id of our socket is client.id in tha how we know
 * who actually emit the event to )
 *
 * firstly we need to go aheadand figure out who the user is and we need bassicaly map the user to the correct
 * socket id so this how we can know who we can emit the event to */

/****We can use an adapter to apply middleWare on the socket */
export class MessagingGateWay implements OnGatewayConnection {
	constructor(
		@Inject(Services.GATEWAY_SESSION_MANAGER)
		private readonly sessions: IGateWaySession,
		private readonly prisma: PrismaService,
	) {}
	@WebSocketServer()
	server: Server;

	handleConnection(socket: AuthenticatedSocket, ...args: any[]) {
		// console.log("new Incoming connection");
		// console.log(socket.user);
		// this.sessions.setUserSocket(socket.user.sub, socket);
		// socket.emit('connected', {status : 'good'});
		// console.log("the session is");
		// console.log(this.sessions.getSockets());
		// if(socket.user.id)
		//     console.log(socket.user.email ,"is online");
	}

	@SubscribeMessage('createMessage')
	handleCreateMessage(@MessageBody() data: any) {
		// console.log("create message")
	}

	// @SubscribeMessage('onUserTyping')
	// handleUserTyping(@MessageBody() data : any){
	//     console.log(data);
	//     console.log("User is typing");

	// }

	@SubscribeMessage('getOnlineUsers')
	handleGetOnlineUsers(socket: AuthenticatedSocket) {
		// console.log("get online users*****************");
		// console.log(this.server.sockets.adapter.rooms);
		const onlineUsers: User[] = [];
		for (const [roomId, roomSet] of this.server.sockets.adapter.rooms) {
			const roomSockets = Array.from(roomSet);
			// console.log("here******");

			for (const socketId of roomSockets) {
				const user = this.sessions.getUserBySocketId(socketId);
				// console.log("this user is -->", user);

				if (user) {
					onlineUsers.push(user);
				}
			}
		}
		socket.emit('getOnlineUsers', onlineUsers);

		return onlineUsers;
	}

	@SubscribeMessage('onClientConnect')
	onClientConnect(
		@MessageBody() data: any,
		@ConnectedSocket() Client: AuthenticatedSocket,
	) {
		// console.log("onClient connect*****************");
		// console.log(data);
		// console.log(Client.user);
	}

	@OnEvent('message.create')
	handleMessageCreateEvent(payload: Message) {
		// console.log("create message*************");
		// console.log(payload);
		// we are going to emit this onMessage event
		// this.server.emit('onMessage', payload);
		const { senderId, recipientId } = payload;
		const senderSocket = this.sessions.getUserSocket(senderId);
		const recipientSocket = this.sessions.getUserSocket(recipientId);
		// console.log("senderSocket", senderSocket);
		// console.log("recipientSocket", recipientSocket)
		// console.log("senderId", payload.senderId);
		if (senderSocket && recipientSocket) {
			senderSocket.emit('onMessage', payload);
			recipientSocket.emit('onMessage', payload);
		} // }else{
		//     console.log("The recipient is not authenticated:");
		// }
	}
}
/****Whenever we created a message an event was emitted */
