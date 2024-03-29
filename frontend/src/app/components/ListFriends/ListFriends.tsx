import { AppDispatch } from "../../store";
import { getAllFriends } from "../../utils/api";
import {
	ConversationSideBarContainer,
	ConversationSideBarItem,
	IngameStyling,
	OflineStyling,
	OnlineStyling,
} from "../../utils/styles";
import {  FriendsTypes } from "../../utils/types";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faEllipsis } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { fetchBlockFriendThunk } from "../../store/blockSlice";
import {
	fetchGetAllFriendsThunk,
	fetchRemoveFriendship,
} from "../../store/friendsSlice";
import {  toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { socketContext } from "../../utils/context/socketContext";
import { fetchSendRequestPLay } from "../../store/requestSlice";
import { fetchUsersThunk } from "../../store/usersSlice";

const ListFriends = () => {
	const ToastError = (message: any) => {
		toast.error(message, {
			position: toast.POSITION.TOP_RIGHT,
			autoClose: 5000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
		});
	};

	const ToastSuccess = (message: any) => {
		toast.success(message, {
			position: toast.POSITION.TOP_RIGHT,
			autoClose: 5000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
		});
	};

	const [Friends, setFriends] = useState<FriendsTypes[]>([]);
	const { updateChannel, channel } = useContext(socketContext);
	const dispatch = useDispatch<AppDispatch>();
	const [openMenuId, setOpenMenuId] = useState<string | null>(null);
	const [change, setChange] = useState<{
		sideBar: boolean;
		chatBox: boolean;
		menu: boolean;
	}>({
		sideBar: false,
		chatBox: false,
		menu: false,
	});

	const { friends, status, error } = useSelector((state: any) => state.friends);
	const { users, Userstatus, Usererror } = useSelector(
		(state: any) => state.users,
	);
	const { Userdata} = useContext(socketContext);


	useEffect(() => {
		
		dispatch(fetchGetAllFriendsThunk());
		dispatch(fetchUsersThunk());
	}, [dispatch]);

	const router = useRouter();
	const handleFunction = (friends: FriendsTypes) => {
		let display_name;
		display_name = friends.display_name;
		return display_name;
	};

	const handleMenuClick = (friendId: string) => {
		setOpenMenuId(openMenuId === friendId ? null : friendId);
	};

	const handlleBloque = async (id: string) => {
		try {
			const res = await dispatch(fetchBlockFriendThunk(id));
			if (res.payload && typeof res.payload === "object") {
				const responseData = res.payload as {
					data?: { response?: { message?: string } };
				};
				const message = responseData.data?.response?.message;
				if (message) {
					ToastSuccess(message);
				} else {
					const responseData = res.payload as { message?: string };
					const message = responseData.message;
					if (message) ToastError(message);
				}
			}
		} catch (error) {
			ToastError("Failed to block this friend. Please try again.");
		}
	};
	const getDisplayUser = (friend : FriendsTypes) => {
		
		const truncatedDisplayName =
			friend.display_name.length > 10
				? `${friend.display_name.substring(0, 10)}...`
				: friend.display_name;

		return {
			...friend,
			display_name: truncatedDisplayName,
		};
	};


	return (
		<div className="mt-[10px]">
			<ConversationSideBarContainer>
				{friends.map(function (elem: FriendsTypes) {
					const user = users.find((user: any) => user.id === elem.id);
					const getStatusColor = () => {
						if (user) {
							switch (user.status) {
								case "online":
									return "green"; // Online status color
								case "offline":
									return "red"; // Offline status color
								case "ingame":
									return "blue"; // In-game status color
								default:
									return "black"; // Default color or any other status
							}
						}
						return "black"; // Default color if user not found
					};
					const handleRemoveFriendship = async () => {
						try {
							const res = dispatch(fetchRemoveFriendship(elem.display_name));
							ToastSuccess(
								`remove ${elem.display_name} from your list friends`,
							);
						} catch (err: any) {
							ToastError(
								`Error... while removing ${elem.display_name} from your list friends `,
							);
						}
					};

					const handlePLayingRequest = async (display_name: string) => {
						try {
							const response = await dispatch(
								fetchSendRequestPLay(display_name),
							);
							if (response.payload && response.payload.message) {
								const errorMessage = response.payload.message;
								ToastError(`Error: ${errorMessage}`);
							} else {
								ToastSuccess("PLay request sent successfully");
							}
						} catch (err: any) {
							ToastError(
								`Error: ${err.message || "An unexpected error occurred"}!`,
							);
						}
					};
					function handleClick() {
						router.push(`/dashboard/${elem.id}`);
					}
					return (
						<ConversationSideBarItem key={elem.id}>
							<div className="flex">
								<Image
									src={elem.avatar_url}
									className="h-14 w-14 rounded-[50%] bg-black "
									alt="Description of the image"
									width={60}
									height={60}
									priority={true}
								/>
								{getStatusColor() === "green" ? (
									<OnlineStyling />
								) : getStatusColor() === "red" ? (
									<OflineStyling />
								) : getStatusColor() === "blue" ?(
									<IngameStyling />
								) : <></>}
							</div>

							<div>
								<span className="ConversationName">{getDisplayUser(elem).display_name}</span>
							</div>

							<div className="absolute right-5 p-4">
								<FontAwesomeIcon
									icon={faEllipsis}
									className={`} transform cursor-pointer text-2xl text-black duration-500 ease-in-out hover:text-[--pink-color] lg:text-3xl`}
									onClick={() => handleMenuClick(elem.id)}
								/>

								{openMenuId === elem.id && (
									<div
										className={`absolute -top-[157px] right-3 z-10 w-[200px] flex-col items-center justify-evenly rounded-[15px] border-2 border-solid border-[#000000] bg-white p-2 font-['Whitney_Semibold'] `}
									>
										{" "}
										<button
											className={`my-1 h-[30px] w-full rounded-[15px] bg-[#d9d9d9] text-black hover:bg-[rgba(0,0,0,.2)]`}
											onClick={() => handleClick()}
										>
											View profile
										</button>
										<button
											className={`my-1 h-[30px] w-full rounded-[15px] bg-[#d9d9d9] text-black hover:bg-[rgba(0,0,0,.2)]`}
											onClick={() => handlePLayingRequest(elem.display_name)}
										>
											Invite To Play
										</button>
										<button
											className={` my-1 h-[30px] w-full rounded-[15px] bg-[#d9d9d9] text-black hover:bg-[rgba(0,0,0,.2)]`}
											onClick={() => handleRemoveFriendship()}
										>
											Remove Friendship
										</button>
										<button
											className={` my-1 h-[30px] w-full rounded-[15px] bg-[#EA7F87] text-black hover:bg-[rgba(0,0,0,.2)]`}
											value="Bloque"
											onClick={() => handlleBloque(elem.id)}
										>
											Bloque
										</button>
									</div>
								)}
							</div>
						</ConversationSideBarItem>
					);
				})}
			</ConversationSideBarContainer>
		</div>
	);
};

export default ListFriends;
