"use client";
import { ReactNode, createContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { User } from "@/state/api";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, setAuthData } from "@/state";
import {
  useGetUserInfoQuery,
  useLoginUserMutation,
} from "@/state/api/modules/userApi";
import { RootState } from "./redux";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user, isAuthenticated, token, expireTime } = useSelector(
    (state: RootState) => state.global,
  );
  const [loginUser] = useLoginUserMutation();
  const { data: userInfo, refetch } = useGetUserInfoQuery(undefined, {
    skip: !token,
  });

  // Kiểm tra token và cập nhật auth data nếu token hợp lệ
  useEffect(() => {
    if (token && expireTime) {
      const now = Date.now();
      if (now > expireTime) {
        dispatch(logoutUser());
        router.push("/login");
      } else {
        if (!isAuthenticated && userInfo) {
          dispatch(setAuthData({ user: userInfo, token, expireTime }));
        }
        setTimeout(() => dispatch(logoutUser()), expireTime - now);
      }
    } else if (!token && pathname !== "/login") {
      router.push("/login");
    }
  }, [
    pathname,
    token,
    userInfo,
    expireTime,
    dispatch,
    router,
    isAuthenticated,
  ]);

  // Cập nhật auth data khi có thông tin người dùng mới
  useEffect(() => {
    if (userInfo && token) {
      dispatch(setAuthData({ user: userInfo, token, expireTime: expireTime! }));
    }
  }, [userInfo, token, expireTime, dispatch]);

  const login = async (email: string, password: string) => {
    try {
      const res = await loginUser({ email, password }).unwrap();
      const expire = Date.now() + 60 * 60 * 1000; // Token hết hạn sau 1 giờ

      if (res.result.authenticated) {
        dispatch(
          setAuthData({
            user: res.result.user,
            token: res.result.token,
            expireTime: expire,
          }),
        );
        router.push("/home");
      } else {
        throw new Error("Sai tài khoản hoặc mật khẩu");
      }
    } catch (err: unknown) {
      let errorMessage = "Đăng nhập thất bại. Vui lòng thử lại.";
      if (err && typeof err === "object" && "message" in err) {
        errorMessage = (err as { message: string }).message;
      }
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    dispatch(logoutUser());
    router.push("/login");
  };

  if (!isAuthenticated && pathname !== "/login") {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
