import Post from "./Post";
import React, { useEffect } from "react";
import PostSkeleton from "../skeletons/PostSkeleton";

import { useQuery } from '@tanstack/react-query'



const Posts = ({ feedType, username, userId }) => {


    const getPostEndPoint = () => {
        switch (feedType) {
            case "foryou":
                return "/api/posts/all";
            case "following":
                return "/api/posts/following";
            case "posts":
                return `/api/posts/user/${username}`
            case "likes":
                return `/api/posts/like/${userId}`
            default:
                return "/api/posts/all";
        }
    }

    const POST_ENDPOIND = getPostEndPoint();

    const { data: posts, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ["posts"],
        queryFn: async () => {
            // const res = await fetch(POST_ENDPOIND);
            // const data = await res.json();
            // return data

            try {
                const res = await fetch(POST_ENDPOIND);
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || "something went wrong")

                }
                return data

            } catch (error) {
                throw new Error(error)

            }
        }
    })

    useEffect(() => {
        refetch()
    }, [feedType, refetch, username])
    return (
        <>
            {(isLoading || isRefetching) && (
                <div className='flex flex-col justify-center'>
                    <PostSkeleton />
                    <PostSkeleton />
                    <PostSkeleton />
                </div>
            )}
            {!isLoading && !isRefetching && posts?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
            {!isLoading && !isRefetching && posts && (
                <div>
                    {posts.map((post) => (
                        <Post key={post._id} post={post} />
                    ))}
                </div>
            )}
        </>
    );
};
export default Posts;