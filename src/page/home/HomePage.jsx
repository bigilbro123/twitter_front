
import React from "react";

import { useState } from "react";

import Posts from "../../components/common/Posts";
import CreatePost from "./CreatePost";

const HomePage = () => {
    const [feedType, setFeedType] = useState("forYou");

    return (
        <>
            <div className='flex-[4_4_0] mr-auto border-r border-gray-700 min-h-screen'>
                {/* Header */}
                <div className='flex w-full border-b border-gray-700'>
                    <div
                        className={
                            "flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 cursor-pointer relative"
                        }
                        onClick={() => setFeedType("forYou")}
                    >
                        For you
                        {feedType === "forYou" && (
                            <div className='absolute bottom-0 w-10  h-1 rounded-full bg-primary'></div>
                        )}
                    </div>
                    <div
                        className='flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 cursor-pointer relative'
                        onClick={() => setFeedType("following")}
                    >
                        Following
                        {feedType === "following" && (
                            <div className='absolute bottom-0 w-10  h-1 rounded-full bg-primary'></div>
                        )}
                    </div>
                </div>

                {/*  CREATE POST INPUT */}
                {<CreatePost />}

                {/* POSTS */}
                {<Posts feedType={feedType} />}
                <>
                    {/* <div className="flex w-100 flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <div className="skeleton h-16 w-16 shrink-0 rounded-full"></div>
                            <div className="flex flex-col gap-4">
                                <div className="skeleton h-4 w-20"></div>
                                <div className="skeleton h-4 w-28"></div>
                            </div>
                        </div>
                        <div className="skeleton h-32 w-full"></div>
                    </div> */}
                </>
            </div>
        </>
    );
};
export default HomePage;