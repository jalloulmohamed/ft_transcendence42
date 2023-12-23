"use client"
import { ToastContainer, toast } from 'react-toastify';
import React, { useState,useContext,useEffect } from 'react';
import { useDispatch,useSelector } from 'react-redux';
import { createRooms } from  '@/app/store/roomsSlice' // Update with the correct path
import {BiImageAdd} from 'react-icons/bi'
import {FaCheck} from 'react-icons/fa'
import { socketContext } from '@/app/utils/context/socketContext'
import { MemberUser } from '../cardMemberUser/MemberUser';
import { FriendsTypes } from '@/app/utils/types';
import Image from 'next/image';



interface CreateGroupsProps {
    setNewRooms: React.Dispatch<React.SetStateAction<boolean>>;
}


const CreatGroups: React.FC<CreateGroupsProps> = ({ setNewRooms }) => {
  const dispatch = useDispatch();

  const [groupName, setGroupName] = useState('');
  const [groupPrivacy, setGroupPrivacy] = useState('Public'); // Default to Public, you can change this based on your logic
  const [groupPassword, setGroupPassword] = useState('');
  const [grouImage,setGroupImage] = useState("")
  const [errorin , setError] = useState("");
  const { updateChannel,channel} = useContext(socketContext);
  const [idUserAdd,setIdUserAdd] = useState([]);
  const { rooms,status,error} = useSelector((state:any) => state.room);

  const handleCreateGroup = () => {
        if ((groupPrivacy === "Protected" &&  !groupPassword)) {
          toast.error("Password are required for a Protected group.")
          return;
        }
        if(!groupName)
        {
          toast.error("Group Name  are required.");
            return;
        }
        if(!groupPrivacy)
        {
          toast.error("Group Privacy are required.");
            return;
        }
        
          const newGroupData = {
            name: groupName,
            Privacy: groupPrivacy,
            password: groupPassword,
            picture: null,
            idUserAdd:idUserAdd 
          };
      
          dispatch(createRooms(newGroupData)).then(response => {
            if(response.error)
            {
              console.log(response)
              toast.error(response.payload)
            }
            else
            {
              toast.success("asdsadsadas")
              setNewRooms(false)
            }
          }).catch(error => {
            toast.success(error)
          });       
  };
    return (
        <div className="p-2 pt-4  h-[calc(100%-150px)]  overflow-auto no-scrollbar ">
            {errorin && <p  className=" bg-[#EA7F87] rounded-lg p-[10px]  w-full text-center">{errorin}</p>}
            <label className="mt-5 flex items-center justify-center" htmlFor="imagroupe">
                <Image src="" alt=""  width={30} height={30}/>
                <div className="bg-[#EFEFEF] p-10 rounded-full">
                    <BiImageAdd size={30} className="text-[#949494]"></BiImageAdd>
                </div>
            </label>
            <input type="file" id="imagroupe" className="hidden" />
            <div className="flex items-center justify-center">
                <input  value={groupName}
                        onChange={(e) => setGroupName(e.target.value)} 
                        className="rounded-full  my-5 text-black focus:outline-none   bg-[#D9D9D9] bg-opacity-20  p-3" placeholder="Group Name"></input>
            </div>
            <div className="flex items-center w-[90%] mx-auto justify-between text-black">
                <label>
                    <input
                    type="radio"
                    name="privacyOptions"
                    value="Public"
                    className="mr-2"
                    checked={groupPrivacy === 'Public'}
                    onChange={() => setGroupPrivacy('Public')}
                    />
                    Public
                </label>

                <label>
                    <input
                    type="radio"
                    name="privacyOptions"
                    value="Private"
                    className="mr-2"
                    checked={groupPrivacy === 'Private'}
                    onChange={() => setGroupPrivacy('Private')}
                    />
                    Private
                </label>

                <label>
                    <input
                    type="radio"
                    name="privacyOptions"
                    value="Protected"
                    className="mr-2"
                    checked={groupPrivacy === 'Protected'}
                    onChange={() => setGroupPrivacy('Protected')}
                    />
                    Protected
                </label>
                </div>
            {groupPrivacy ==="Protected" &&
              <div className="flex items-center justify-center mt-5 mx-auto">
                  <input value={groupPassword}
                        onChange={(e) => setGroupPassword(e.target.value)} className="rounded-full w-full   text-black focus:outline-none   bg-[#D9D9D9] bg-opacity-20  p-3" placeholder="Set a password for your group"></input>
              </div>
            }
      <div className="h-[50%] mt-5 min-h-[300px] p-1 text-black rounded-lg  bg-opacity-20 w-full  no-scrollbar">
            <MemberUser idUserAdd={idUserAdd} setIdUserAdd={setIdUserAdd}></MemberUser>
      </div>
            

				<div className="absolute  right-5 bottom-20 md:bottom-4  flex items-center">
					<button onClick={()=>{setNewRooms(false)}} className="text-[#5B8CD3] mr-4">Cancel</button>
					<button onClick={handleCreateGroup} className=" bg-[#5B8CD3] p-4 rounded-full ">
          {status === 'loading'   ?   <div className="flex items-center justify-center ">
                  <div
                  className=" text-[white]   h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                  role="status">
                  <span
                  className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
                  >Loading...</span>
                  </div>
                  </div> 
              :   <FaCheck />  }
					</button>
    
				</div>   
        </div>
    )
}
export default CreatGroups;