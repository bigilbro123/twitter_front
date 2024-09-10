import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart, FaTrash, FaRegBookmark } from "react-icons/fa"; // All Fa icons imported from "react-icons/fa"
import { useState, useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";
import React from "react";
import { IoIosHeart } from "react-icons/io";

import { json, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";


const Post = ({ post }) => {
    console.log(post);

    const { data: authUser } = useQuery({ queryKey: ["authUser"] })
    const [comment, setComment] = useState("");
    const postOwner = post.user;
    const isLiked = post.likes.includes(authUser._id);
    // console.log(postOwner);
    const [timeDifference, setTimeDifference] = useState('');

    useEffect(() => {
        const calculateTimeDifference = () => {
            const currentTime = new Date();
            const createdAtTime = new Date(postOwner.createdAt);

            // Difference in milliseconds
            const diffInMs = currentTime - createdAtTime;

            // Convert to minutes, hours, days
            const diffInMinutes = Math.floor(diffInMs / 1000 / 60);
            const diffInHours = Math.floor(diffInMinutes / 60);
            const diffInDays = Math.floor(diffInHours / 24);

            let timeString;
            if (diffInDays >= 1) {
                const remainingHours = diffInHours % 24;
                timeString = `${diffInDays} day${diffInDays > 1 ? 's' : ''} and ${remainingHours} hour${remainingHours > 1 ? 's' : ''} ago`;
            } else if (diffInHours >= 1) {
                const remainingMinutes = diffInMinutes % 60;
                timeString = `${diffInHours} hour${diffInHours > 1 ? 's' : ''} and ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''} ago`;
            } else {
                timeString = `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
            }

            setTimeDifference(timeString);
        };

        // Calculate difference immediately and every second
        calculateTimeDifference();
        const interval = setInterval(calculateTimeDifference, 1000);

        return () => clearInterval(interval); // Cleanup on unmount
    }, [postOwner.createdAt]);

    console.log();

    const queryClient = useQueryClient()

    const isMyPost = authUser._id === post.user._id;

    const formattedDate = timeDifference;

    const isCommenting = false;

    const handleDeletePost = () => {
        deletePost()
    };

    const handlePostComment = (e) => {
        e.preventDefault();
        if (isCommenting) return;
        comments()
    };
    const { mutate: deletePost, isPending: isdeleting } = useMutation({
        mutationFn: async () => {
            try {
                const res = await fetch(`/api/posts/${post._id}`, {
                    method: "DELETE"

                })
                const data = await res.json();
                if (!res.ok) {


                    throw new Error(data.error || "something went wrong");

                }
            } catch (error) {
                throw new Error(error)
            }
        }, onSuccess: () => {
            toast.success("post deleted")
            queryClient.invalidateQueries({
                queryKey: ["posts"]
            })
        }
    })

    const { mutate: likePost, isPending: isLiking } = useMutation({
        mutationFn: async () => {
            try {
                const res = await fetch(`/api/posts/like/${post._id}`, {
                    method: "POST",
                })
                const data = await res.json();
                if (!res.ok) {


                    throw new Error(data.error || "something went wrong");

                }
                return data;
            } catch (error) {
                throw new Error(error)
            }
        },
        onSuccess: (updatedLikes) => {
            // toast.success("post liked successfully")
            // queryClient.invalidateQueries({ queryKey: ["posts"] })
            queryClient.setQueryData(['posts'], (oldData) => {
                return oldData.map((p) => {
                    if (p._id === post._id) {
                        return { ...p, likes: updatedLikes }
                    }
                    return p;
                })
            })
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })
    const handleLikePost = () => {
        if (isLiking) return;
        likePost()

    };

    const { mutate: comments, isPending: isCommentings } = useMutation({
        mutationFn: async () => {


            try {
                const res = await fetch(`/api/posts/comment/${post._id}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ text: comment })

                })
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || "something went wrong")
                }
                return data
            } catch (error) {
                throw new Error(error);


            }
        },
        onSuccess: () => {
            toast.success("Commenting successful");
            setComment("");
            queryClient.invalidateQueries({ queryKey: ['posts'] })
        },

        onError: () => {

        }
    })

    return (
        <>
            <div className='flex gap-2 items-start p-4 border-b border-gray-700'>
                <div className='avatar'>
                    <Link to={`/profile/${postOwner.username}`} className='w-8 rounded-full overflow-hidden'>
                        <img src={post.user.profileimg || "/avatar-placeholder.png"} style={{ borderRadius: "30%" }} />
                    </Link>
                </div>
                <div className='flex flex-col flex-1'>
                    <div className='flex gap-2 items-center'>
                        <Link to={`/profile/${postOwner.username}`} className='font-bold'>
                            {postOwner.fullName}
                        </Link>
                        <span className='text-gray-700 flex gap-1 text-sm'>
                            <Link to={`/profile/${postOwner.username}`}>@{postOwner.username}</Link>
                            <span>·</span>
                            <span>{formattedDate}</span>
                        </span>
                        {isMyPost && (
                            <span className='flex justify-end flex-1'>
                                {!isdeleting && (
                                    <FaTrash className='cursor-pointer hover:text-red-600' onClick={handleDeletePost} />
                                )}
                                {isdeleting && (
                                    <LoadingSpinner size="sm" />
                                )}
                            </span>

                        )}
                    </div>
                    <div className='flex flex-col gap-3 overflow-hidden'>
                        <span>{post.text}</span>
                        {post.img && (
                            <img
                                src={post.img}
                                className='h-80 object-contain rounded-lg border border-gray-700'
                                alt=''
                            />
                        )}
                    </div>
                    <div className='flex justify-between mt-3'>
                        <div className='flex gap-4 items-center w-2/3 justify-between'>
                            <div
                                className='flex gap-1 items-center cursor-pointer group'
                                onClick={() => document.getElementById("comments_modal" + post._id).showModal()}
                            >{post.comments.length > 0 ? (
                                <>
                                    <FaRegComment color="blue" className='w-4 h-4 text-slate-500 group-hover:text-sky-400' />
                                    <span className='text-sm text-slate-500 group-hover:text-sky-400'>
                                        {post.comments.length}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <FaRegComment className='w-4 h-4 text-slate-500 group-hover:text-sky-400' />
                                    <span className='text-sm text-slate-500 group-hover:text-sky-400'>
                                        0
                                    </span>
                                </>
                            )}


                            </div>
                            {/* We're using Modal Component from DaisyUI */}
                            <dialog id={`comments_modal${post._id}`} className='modal border-none outline-none'>
                                <div className='modal-box rounded border border-gray-600'>
                                    <h3 className='font-bold text-lg mb-4'>COMMENTS</h3>
                                    <div className='flex flex-col gap-3 max-h-60 overflow-auto'>
                                        {post.comments.length === 0 && (
                                            <p className='text-sm text-slate-500'>
                                                No comments yet 🤔 Be the first one 😉
                                            </p>
                                        )}
                                        {post.comments.map((comment) => (
                                            <div key={comment._id} className='flex gap-2 items-start'>
                                                <div className='avatar'>
                                                    <div className='w-8 rounded-full'>
                                                        <img
                                                            src={comment.user.profileImg || "/avatar-placeholder.png"}
                                                        />
                                                    </div>
                                                </div>

                                                <div className='flex flex-col'>
                                                    <div className='flex items-center gap-1'>
                                                        <span className='font-bold'>{comment.user.fullName}</span>
                                                        <span className='text-gray-700 text-sm'>


                                                            @{comment.user.username}
                                                        </span>
                                                    </div>
                                                    <div className='text-sm'>{comment.text}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <form
                                        className='flex gap-2 items-center mt-4 border-t border-gray-600 pt-2'
                                        onSubmit={handlePostComment}
                                    >
                                        <textarea
                                            className='textarea w-full p-1 rounded text-md resize-none border focus:outline-none  border-gray-800'
                                            placeholder='Add a comment...'
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                        />
                                        <button className='btn btn-primary rounded-full btn-sm text-white px-4'>
                                            {isCommenting ? (
                                                <span className='loading loading-spinner loading-md'></span>
                                            ) : (
                                                "Post"
                                            )}
                                        </button>
                                    </form>
                                </div>
                                <form method='dialog' className='modal-backdrop'>
                                    <button className='outline-none'>close</button>
                                </form>
                            </dialog>
                            <div className='flex gap-1 items-center group cursor-pointer'>
                                <BiRepost className='w-6 h-6  text-slate-500 group-hover:text-green-500' />
                                <span className='text-sm text-slate-500 group-hover:text-green-500'>0</span>
                            </div>
                            <div className='flex gap-1 items-center group cursor-pointer' onClick={handleLikePost}>
                                {isLiking && <LoadingSpinner size="sm" />}
                                {!isLiked && !isLiking && (
                                    <FaRegHeart className='w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500' />
                                )}
                                {isLiked && !isLiking && <IoIosHeart color="red" />}

                                <span
                                    className={`text-sm text-slate-500 group-hover:text-pink-500 ${isLiked ? "text-pink-500" : ""
                                        }`}
                                >
                                    {post.likes.length}
                                </span>
                            </div>
                        </div>
                        <div className='flex w-1/3 justify-end gap-2 items-center'>
                            <FaRegBookmark className='w-4 h-4 text-slate-500 cursor-pointer' />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
export default Post;