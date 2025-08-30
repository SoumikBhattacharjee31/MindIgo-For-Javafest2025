import { useEffect, useState } from 'react';

export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  dateOfBirth: string;
  gender: string;
  profileImageUrl: string | null;
  createdAt: string;
  lastLoginAt: string;
  emailVerified: boolean;
}
const useStore = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const updateUser = (newUser: User | null) => {
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  return {
    user,
    setUser: updateUser,
  };
};
export default useStore;