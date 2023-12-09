"use client"

import CoversationSideBar from "@/app/components/CoversationSideBar/ConversationSideBar";
import MessagePanel from "@/app/components/messages/MessagePanel";
import {socketContext } from "@/app/utils/context/socketContext";
import { useDispatch } from "react-redux"
import { AppDispatch } from "@/app/store"
import { fetchGetRequestThunk } from "@/app/store/requestSlice";
import { useContext, useEffect } from "react";
import { fetchGetAllFriendsThunk } from "@/app/store/friendsSlice";
import { fetchBlocksThunk } from "@/app/store/blockSlice";



const ConversationChannelPage = () => {
  const socket = useContext(socketContext).socket

	const dispatch= useDispatch<AppDispatch>();

	useEffect(() => {
    socket.on('AcceptNotification', (data : any) => {
      dispatch(fetchGetRequestThunk());
      dispatch(fetchGetAllFriendsThunk());

    });
		socket.on('newFriendRequest', (data : any) => {
			dispatch(fetchGetRequestThunk());
		  });
    socket.on('RefuseNotification', (data : any) => {
      dispatch(fetchGetRequestThunk());
    })
    socket.on('blockNotification', (data : any) =>{
      dispatch(fetchBlocksThunk());
      dispatch(fetchGetAllFriendsThunk());

      
    })
    socket.on('debloqueNotification', (data : any)=>{
      dispatch(fetchBlocksThunk());
      dispatch(fetchGetAllFriendsThunk());

    })
		  
      return () => {
        socket.off('AcceptNotification');
        socket.off('newFriendRequest');
        socket.off('RefuseNotification');
        socket.off('blockNotification');
        socket.off('debloqueNotification');
      };
		
	  }, [socket, dispatch]);
  
    return ( 
            <div className=" flex h-screen  xl:container xl:mx-auto">
              <div className ="hidden xl:block h-full w-[35%] p-10 pl-5 pr-2 ">
                <CoversationSideBar/>
              </div>
                <div className="bg-white xl:m-10  xl:mr-10 xl:ml-2 w-full xl:w-[65%]  xl:rounded-[20px]">
                    <MessagePanel ></MessagePanel> 
                </div>
            </div>
     );
}
 
export default ConversationChannelPage;