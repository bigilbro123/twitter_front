import React from "react";
import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './page/home/HomePage.jsx';
import SignUpPage from './page/auth/singup/SingUpPage.jsx'
import LoginPage from './page/auth/login/LoginPage.jsx';
import Sidebar from './components/common/Sidebar.jsx';
import RightPanel from "./components/common/RightPanel.jsx";
import Notification from "./page/notification/NotificationPage.jsx";
import ProfilePage from "./page/profile/ProfilePage.jsx";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner.jsx";

const App = () => {
    const { data: authUser, isLoading, error, isError } = useQuery({
        queryKey: ['authUser'],
        queryFn: async () => {
            const res = await fetch("api/auth/me");
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "something went wrong");
            }
            console.log("auth user is:", data);
            return data;
        }
    });

    if (isLoading) {
        return (
            <div className="h-screen flex justify-center items-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className='flex max-w-6xl mx-auto'>
            {authUser ? <Sidebar /> : null}
            <Routes>
                <Route path='/' element={authUser ? <HomePage /> : <Navigate to='/login' />} />
                <Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to='/' />} />
                <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to='/' />} />
                <Route path='/notifications' element={authUser ? <Notification /> : <Navigate to='/login' />} />
                <Route path='/profile/:username' element={authUser ? <ProfilePage /> : <Navigate to='/login' />} />
            </Routes>
            {authUser ? <RightPanel /> : null}


            <Toaster />
        </div>
    );
};

export default App;
