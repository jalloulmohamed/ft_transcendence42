"use client";

import CoversationSideBar from "../../components/CoversationSideBar/ConversationSideBar";
import { useContext, useEffect, useState , PropsWithChildren} from "react";
import MessagePanel from "../../components/messages/MessagePanel";
import {socketContext } from "../../utils/context/socketContext";
import { useDispatch } from "react-redux"
import { AppDispatch } from "../../store"
import { fetchGetRequestThunk, fetchNumberPending } from "../../store/requestSlice";
import { fetchGetAllFriendsThunk } from "../../store/friendsSlice";
import { fetchBlockedUsers, fetchBlocksThunk } from "../../store/blockSlice";
import { fetchUsersThunk } from "../../store/usersSlice";
import { fetchConversationThunk } from "../../store/conversationSlice";
import { fetchMessagesThunk } from "../../store/messageSlice";
import { ConversationTypes, messageTypes } from "../../utils/types";
import { fetchCountNotification, fetchNotificationThunk } from "../../store/notificationSlice";
import { useRouter } from "next/navigation";
import { fetchGetRequestsThunk } from "../../store/requestsSlice";
import AuthCheck from "@/app/utils/AuthCheck";

const ConversationChannelPagechat = () => { 
  const { updateChannel, channel } = useContext(socketContext);

   
    const socket = useContext(socketContext).socket
    const route = useRouter();
	const dispatch= useDispatch<AppDispatch>();

  useEffect(() => {
    

    socket.on('AcceptNotification', (data : any) => {
      dispatch(fetchGetRequestThunk());
      dispatch(fetchGetAllFriendsThunk());
      dispatch(fetchCountNotification());
      dispatch(fetchNumberPending());
      dispatch(fetchNotificationThunk());
      dispatch(fetchCountNotification());
      dispatch(fetchGetRequestsThunk());
      dispatch(fetchBlocksThunk());
		  dispatch(fetchBlockedUsers());
		  dispatch(fetchUsersThunk());



    });
		socket.on('newFriendRequest', (data : any) => {
			dispatch(fetchGetRequestThunk());
      dispatch(fetchNumberPending());
      dispatch(fetchCountNotification());
      dispatch(fetchNotificationThunk());
      dispatch(fetchGetRequestsThunk());

      dispatch(fetchBlocksThunk());
		  dispatch(fetchBlockedUsers());
		  dispatch(fetchUsersThunk());
		  dispatch(fetchGetAllFriendsThunk());



		  });
    socket.on('newRequestToPlay', (data : any)=>{
      dispatch(fetchCountNotification());
      dispatch(fetchNotificationThunk());
    })

    socket.on('RefusePLayNotification', (data : any)=>{
      dispatch(fetchCountNotification());
      dispatch(fetchNotificationThunk());
    })
    socket.on('RefuseNotification', (data : any) => {
      dispatch(fetchGetRequestThunk());
      dispatch(fetchNumberPending());
      dispatch(fetchNotificationThunk());
      dispatch(fetchCountNotification());
      dispatch(fetchGetRequestsThunk());
      dispatch(fetchBlocksThunk());
		dispatch(fetchBlockedUsers());
		dispatch(fetchUsersThunk());
		dispatch(fetchGetAllFriendsThunk());


    })
    socket.on('deleteNOtification', (data : any)=>{
      dispatch(fetchNotificationThunk());
      dispatch(fetchCountNotification());
    })
    socket.on('blockNotification', (data : any) =>{
      console.log("here bloque chat socket");
      dispatch(fetchBlocksThunk());
      dispatch(fetchGetAllFriendsThunk());
      dispatch(fetchGetRequestsThunk());
      dispatch(fetchBlockedUsers());

		dispatch(fetchUsersThunk());

    
      if(data)
        dispatch(fetchMessagesThunk(data.id));


      if (channel && channel.id) {
        dispatch(fetchMessagesThunk(channel.id));
      }
      
    })
    socket.on('debloqueNotification', (data : any)=>{
      console.log("here debloque chat socket");

      dispatch(fetchBlocksThunk());
      dispatch(fetchGetAllFriendsThunk());
      dispatch(fetchGetRequestsThunk());
      dispatch(fetchBlockedUsers());
		  dispatch(fetchUsersThunk());
      if(data)
        dispatch(fetchMessagesThunk(data.id));


      
      if(channel != null)
      {
        dispatch(fetchMessagesThunk(channel.id));
      }

    })
    socket.on('online', (data : any)=>{
      dispatch(fetchUsersThunk())
      dispatch(fetchGetAllFriendsThunk());


    })
    socket.on('offline', (data : any)=>{
      dispatch(fetchUsersThunk())
      dispatch(fetchGetAllFriendsThunk());


    });
    socket.on('Ingame',  (data: any)=>{
      dispatch(fetchUsersThunk())
      dispatch(fetchGetAllFriendsThunk());
    })
    socket.on('IngameOffline', (data: any)=>{
      dispatch(fetchUsersThunk())
      dispatch(fetchGetAllFriendsThunk());
    })

		socket.on('createConversation', (data : any)=>{
      dispatch(fetchConversationThunk());
      if(data)
        dispatch(fetchMessagesThunk(data.chat.id));

    });
    socket.on('deleteFriendship', (data : any)=>{
      dispatch(fetchGetAllFriendsThunk());
    })
    socket.on('deleteConversation', (data : ConversationTypes)=>{
      if(data.id === channel?.id)
      {
        updateChannel(null);
      }
			dispatch(fetchConversationThunk());
      if (channel && channel.id) {
        dispatch(fetchMessagesThunk(channel.id));
      }
		  })
    socket.on('onMessage', (messages : messageTypes)=>{
			dispatch(fetchConversationThunk());
      if (channel && channel.id) {
        dispatch(fetchMessagesThunk(channel.id));
      }

		})
    
      return () => {
        socket.off('AcceptNotification');
        socket.off('newFriendRequest');
        socket.off('RefuseNotification');
        socket.off('blockNotification');
        socket.off('debloqueNotification');
        socket.off('online');
        socket.off('offline');
        socket.off('createConversation');
        socket.off('deleteConversation');
        socket.off('onMessage');
        socket.off('deleteFriendship');
        socket.off('Ingame');
        socket.off('IngameOffline');
        socket.off('newRequestToPlay');
        // socket.off('AcceptPLayNotification');
        socket.off('RefusePLayNotification');
        socket.off('deleteNOtification')


      };
		
	  }, [socket, dispatch, channel?.id, channel, updateChannel]);
    return ( 
      <AuthCheck>
        
        <div className=" flex h-screen  xl:container xl:mx-auto">  
          <div className={`h-full  xl:p-10 xl"pl-5 xl:pr-2 ${!channel ? 'block w-full xl:w-[35%]  ' : 'hidden xl:block  xl:w-[35%] '}`}>
            <CoversationSideBar />
          </div> 
          {channel ? 
            <div className="bg-white xl:m-10  xl:mr-10 xl:ml-2 w-full xl:w-[65%]  xl:rounded-[20px] xl:mt-32">
                <MessagePanel></MessagePanel> 
            </div>
          :
          <div className="xl:my-10 xl:mr-10  w-full xl:ml-2 xl:w-[65%]   xl:mt-32 hidden xl:flex items-center justify-center">Invite friend to new chat room</div>
        }
          </div>

        </AuthCheck>
    );
}
 
export default ConversationChannelPagechat;
