import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import React from "react";
import Posts from "../../components/common/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditProfileModal";

import { POSTS } from "../../utils/db/dummy";

import { FaArrowLeft } from "react-icons/fa6";
import { IoCalendarOutline } from "react-icons/io5";
import { FaLink } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import usefollow from "../../hooks/userFollow";
import toast from "react-hot-toast";

const ProfilePage = () => {
    const [coverImg, setCoverImg] = useState(null);
    const [profileImg, setProfileImg] = useState(null);
    const [feedType, setFeedType] = useState("posts");
    const queryClient = useQueryClient()
    const coverImgRef = useRef(null);
    const profileImgRef = useRef(null);
    const { username } = useParams();

    const { data: authUser } = useQuery({ queryKey: ["authUser"] })
    const { follow, ispending } = usefollow()


    const { data: user, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ["userprofile"],
        queryFn: async () => {
            try {
                const res = await fetch(`/api/users/profile/${username}`)
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || "something went wrong")

                }
                return data
            } catch (error) {
                throw new Error(error);

            }
        }
    })
    const AmIFollowing
        = authUser?.following?.includes(user?._id);


    const { mutate: updateProfile, ispending: isupdatingProfile } = useMutation({
        mutationFn: async () => {
            try {
                const res = await fetch(`/api/users/update`, {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify({
                        coverImg,
                        profileImg
                    })
                });

                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || "something went wrong");
                }
                return data;
            } catch (error) {
                throw new Error(error.message);
            }
        },
        onSuccess: () => {
            toast.success("Profile updated");
            Promise.all([
                queryClient.invalidateQueries({ queryKey: ["authUser"] }),
                queryClient.invalidateQueries({ queryKey: ["userProfile"] })
            ]);
        },
        onError: () => {
            toast.error("Error updating profile");
        }
    });


    const isMyProfile = authUser._id === user?._id;
    const handleImgChange = (e, state) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                state === "coverImg" && setCoverImg(reader.result);
                state === "profileImg" && setProfileImg(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    useEffect(() => {
        refetch();
    }, [username, refetch])
    useEffect(() => {
        feedType
    }, [feedType])
    console.log("fudh" + user);

    const dateString = user?.createdAt;
    const date = new Date(dateString);

    const day = date.getUTCDate();
    const month = date.toLocaleString('default', { month: 'short' }); // e.g., "May"
    const year = date.getUTCFullYear();

    const formattedDate = `${day}-${month}-${year}`;
    console.log(formattedDate); // Output: "14-Aug-2024"


    console.log("Cover Image URL:", user?.coverImg);
    console.log("profile Image URL:", user?.profileImg);
    console.log("Cover Image URL:", user?.fullName);
    console.log("Cover Image URL:", user?.username);
    console.log("Cover Image URL:", user?._id);
    console.log("Cover Image URL:", user?.email);


    return (
        <>
            <div className='flex-[4_4_0]  border-r border-gray-700 min-h-screen '>
                {/* HEADER */}
                {(isLoading || isRefetching) && <ProfileHeaderSkeleton />}
                {!isLoading && !isRefetching && !user && <p className='text-center text-lg mt-4'>User not found</p>}
                <div className='flex flex-col'>
                    {!isLoading && !isRefetching && user && (
                        <>
                            <div className='flex gap-10 px-4 py-2 items-center'>
                                <Link to='/'>
                                    <FaArrowLeft className='w-4 h-4' />
                                </Link>
                                <div className='flex flex-col'>
                                    <p className='font-bold text-lg'>{user?.fullName}</p>
                                    <span className='text-sm text-slate-500'>{POSTS?.length} posts</span>
                                </div>
                            </div>
                            {/* COVER IMG */}
                            <div className='relative group/cover'>
                                <img
                                    src={coverImg || user?.coverImg || "/cover.png"}

                                    className='h-52 w-full object-cover'
                                    alt='cover image'
                                />
                                {isMyProfile && (
                                    <div
                                        className='absolute top-2 right-2 rounded-full p-2 bg-gray-800 bg-opacity-75 cursor-pointer opacity-0 group-hover/cover:opacity-100 transition duration-200'
                                        onClick={() => coverImgRef.current.click()}
                                    >
                                        <MdEdit className='w-5 h-5 text-white' />
                                    </div>
                                )}

                                <input
                                    type='file'
                                    accept="image/*"
                                    hidden
                                    ref={coverImgRef}
                                    onChange={(e) => handleImgChange(e, "coverImg")}
                                />
                                <input
                                    type='file'
                                    accept="image/*"
                                    hidden
                                    ref={profileImgRef}
                                    onChange={(e) => handleImgChange(e, "profileImg")}
                                />
                                {/* USER AVATAR */}
                                <div className='avatar absolute -bottom-16 left-4'>
                                    <div className='w-32 rounded-full relative group/avatar'>
                                        {/* {alert(user?.profileImg)}
                                        {alert(user?.coverImg)} */}
                                        <img src={profileImg || user?.profileimg || "/avatar-placeholder.png"} />
                                        <div className='absolute top-5 right-3 p-1 bg-primary rounded-full group-hover/avatar:opacity-100 opacity-0 cursor-pointer'>
                                            {isMyProfile && (
                                                <MdEdit
                                                    className='w-4 h-4 text-white'
                                                    onClick={() => profileImgRef.current.click()}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='flex justify-end px-4 mt-5'>
                                {isMyProfile && <EditProfileModal />}
                                {!isMyProfile && (
                                    <button
                                        className='btn btn-outline rounded-full btn-sm'
                                        onClick={() => follow(user?._id)}
                                    >
                                        {ispending && "Loading..."}
                                        {!ispending && AmIFollowing

                                            && "Unfollow"}
                                        {!ispending && !AmIFollowing

                                            && "follow"}
                                    </button>
                                )}
                                {(coverImg || profileImg) && (
                                    <button
                                        className='btn btn-primary rounded-full btn-sm text-white px-4 ml-2'
                                        onClick={() => updateProfile()}

                                    >
                                        {isupdatingProfile ? "updating" : "Update"}

                                    </button>
                                )}
                            </div>

                            <div className='flex flex-col gap-4 mt-14 px-4'>
                                <div className='flex flex-col'>
                                    <span className='font-bold text-lg'>{user?.fullName}</span>
                                    <span className='text-sm text-slate-500'>@{user?.username}</span>
                                    <span className='text-sm my-1'>{user?.bio}</span>
                                </div>

                                <div className='flex gap-2 flex-wrap'>
                                    {user?.link && (
                                        <div className='flex gap-1 items-center '>
                                            <>
                                                <FaLink className='w-3 h-3 text-slate-500' />
                                                <a
                                                    href='https://youtube.com/@asaprogrammer_'
                                                    target='_blank'
                                                    rel='noreferrer'
                                                    className='text-sm text-blue-500 hover:underline'
                                                >
                                                    youtube.com/@asaprogrammer_
                                                </a>
                                            </>
                                        </div>
                                    )}
                                    <div className='flex gap-2 items-center'>
                                        <IoCalendarOutline className='w-4 h-4 text-slate-500' />
                                        <span className='text-sm text-slate-500'>joined {formattedDate}</span>
                                    </div>
                                </div>
                                <div className='flex gap-2'>
                                    <div className='flex gap-1 items-center'>
                                        <span className='font-bold text-xs'>{user?.following.length}</span>
                                        <span className='text-slate-500 text-xs'>Following</span>
                                    </div>
                                    <div className='flex gap-1 items-center'>
                                        <span className='font-bold text-xs'>{user?.followers.length}</span>
                                        <span className='text-slate-500 text-xs'>Followers</span>
                                    </div>
                                </div>
                            </div>
                            <div className='flex w-full border-b border-gray-700 mt-4'>
                                <div
                                    className='flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 relative cursor-pointer'
                                    onClick={() => setFeedType("posts")}
                                >
                                    Posts
                                    {feedType === "posts" && (
                                        <div className='absolute bottom-0 w-10 h-1 rounded-full bg-primary' />
                                    )}
                                </div>
                                <div
                                    className='flex justify-center flex-1 p-3 text-slate-500 hover:bg-secondary transition duration-300 relative cursor-pointer'
                                    onClick={() => setFeedType("likes")}
                                >
                                    Likes
                                    {feedType === "likes" && (
                                        <div className='absolute bottom-0 w-10  h-1 rounded-full bg-primary' />
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    <Posts feedType={feedType} username={username} userId={user?._id} />
                </div>
            </div>
        </>
    );
};
export default ProfilePage;