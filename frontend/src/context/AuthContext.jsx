import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [simulatedRole, setSimulatedRole] = useState(null); // 'creator' | 'partner' | null

    const fetchRoomStatus = async () => {
        try {
            const res = await axiosInstance.get('room/status/');
            if (res.data.has_room) {
                setRoom(res.data.room);
            } else {
                setRoom(null);
            }
            return res.data;
        } catch (err) {
            console.error('Failed to fetch room status:', err);
            return null;
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('access_token');
            const savedUser = localStorage.getItem('user_info');
            if (token) {
                if (savedUser) {
                    try {
                        setUser(JSON.parse(savedUser));
                    } catch (e) {
                        setUser({ isAuthenticated: true });
                    }
                } else {
                    setUser({ isAuthenticated: true });
                }
                await fetchRoomStatus();
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (username, password) => {
        try {
            const response = await axiosInstance.post('token/', {
                username,
                password
            });
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            
            const userInfo = { isAuthenticated: true, username };
            localStorage.setItem('user_info', JSON.stringify(userInfo));
            setUser(userInfo);

            const statusRes = await fetchRoomStatus();
            return { success: true, room: statusRes?.room };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.detail || error.response?.data?.error || 'Invalid credentials. Please try again.' 
            };
        }
    };

    const createRoom = async (data) => {
        try {
            const res = await axiosInstance.post('room/create/', data);
            localStorage.setItem('access_token', res.data.access);
            localStorage.setItem('refresh_token', res.data.refresh);

            const userInfo = { isAuthenticated: true, username: res.data.user.username, id: res.data.user.id };
            localStorage.setItem('user_info', JSON.stringify(userInfo));
            setUser(userInfo);
            setRoom(res.data.room);

            return { success: true, room: res.data.room };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to create room. Please verify your details.'
            };
        }
    };

    const joinRoom = async (data) => {
        try {
            const res = await axiosInstance.post('room/join/', data);
            localStorage.setItem('access_token', res.data.access);
            localStorage.setItem('refresh_token', res.data.refresh);

            const userInfo = { isAuthenticated: true, username: res.data.user.username, id: res.data.user.id };
            localStorage.setItem('user_info', JSON.stringify(userInfo));
            setUser(userInfo);
            setRoom(res.data.room);

            return { success: true, room: res.data.room };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to join partner room.'
            };
        }
    };

    const loginWithCode = async (data) => {
        try {
            const res = await axiosInstance.post('room/login/', data);
            localStorage.setItem('access_token', res.data.access);
            localStorage.setItem('refresh_token', res.data.refresh);

            const userInfo = { isAuthenticated: true, username: res.data.user.username, id: res.data.user.id };
            localStorage.setItem('user_info', JSON.stringify(userInfo));
            setUser(userInfo);
            setRoom(res.data.room);

            return { success: true, room: res.data.room };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to sign in. Please verify your room code and date of togetherness.'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_info');
        setUser(null);
        setRoom(null);
        setSimulatedRole(null);
    };

    const deleteAccount = async () => {
        try {
            await axiosInstance.post('user/delete-account/');
        } catch (err) {
            console.error('Error during delete-account API call:', err);
        } finally {
            logout();
        }
    };

    // Helper to determine effective user perspective
    const resolvedRole = (room?.my_role && room.my_role !== 'visitor') ? room.my_role : 'creator';
    const effectiveRole = simulatedRole || resolvedRole;
    const isCreatorEffective = effectiveRole === 'creator';
    
    // My gender and partner's gender based on current effective perspective
    const effectiveMyGender = isCreatorEffective 
        ? (room?.creator_gender || 'girl') 
        : (room?.partner_gender || 'boy');

    const effectivePartnerGender = isCreatorEffective 
        ? (room?.partner_gender || 'boy') 
        : (room?.creator_gender || 'girl');

    // Pet names:
    // creator_pet_name is what the partner calls the creator
    // partner_pet_name is what the creator calls the partner
    const effectiveMyPetName = isCreatorEffective 
        ? (room?.creator_pet_name || '') 
        : (room?.partner_pet_name || '');

    const effectivePartnerPetName = isCreatorEffective 
        ? (room?.partner_pet_name || '') 
        : (room?.creator_pet_name || '');


    return (
        <AuthContext.Provider value={{
            user,
            room,
            setRoom,
            loading,
            login,
            createRoom,
            joinRoom,
            loginWithCode,
            logout,
            deleteAccount,
            fetchRoomStatus,
            effectiveRole,
            simulatedRole,
            setSimulatedRole,
            effectiveMyGender,
            effectivePartnerGender,
            effectiveMyPetName,
            effectivePartnerPetName,
        }}>
            {children}
        </AuthContext.Provider>
    );
};
