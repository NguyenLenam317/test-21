import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserProfile } from '@/types';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface UserContextType {
  user: User | null;
  loading: boolean;
  hasSurveyCompleted: boolean;
  setHasSurveyCompleted: (value: boolean) => void;
  updateUserProfile: (profile: UserProfile) => Promise<void>;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  hasSurveyCompleted: false,
  setHasSurveyCompleted: () => {},
  updateUserProfile: async () => {},
  isAuthenticated: false,
  logout: async () => {},
});

export const useUser = () => useContext(UserContext);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSurveyCompleted, setHasSurveyCompleted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user/profile', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setHasSurveyCompleted(userData.hasSurveyCompleted);
        } else {
          // Create a demo user if not authenticated
          const demoUser: User = {
            id: 0,
            username: 'demo_user',
            hasSurveyCompleted: false,
            userProfile: undefined
          };
          setUser(demoUser);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Create a demo user if error
        const demoUser: User = {
          id: 0,
          username: 'demo_user',
          hasSurveyCompleted: false,
          userProfile: undefined
        };
        setUser(demoUser);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const updateUserProfile = async (profile: UserProfile) => {
    try {
      const response = await apiRequest('POST', '/api/user/profile', profile);
      if (response.ok) {
        const updatedUser = await response.json();
        setUser(prevUser => prevUser ? { ...prevUser, userProfile: updatedUser.userProfile } : null);
        toast({
          title: 'Profile Updated',
          description: 'Your profile has been successfully updated.',
        });
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update your profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const logout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout', {});
      setUser(null);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        hasSurveyCompleted,
        setHasSurveyCompleted,
        updateUserProfile,
        isAuthenticated: !!user && user.id !== 0,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
