"use client";
import { ReactNode, createContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, setAuthData } from "@/state";
import {
  useGetUserInfoQuery,
  useLoginUserMutation,
} from "@/state/api/modules/userApi";
import { RootState } from "./redux";
import { User } from "@/types/user";
import { Loader2 } from "lucide-react";
import { baseApi } from "@/state/api/baseApi";

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

  const [isLoading, setIsLoading] = useState(true);
  const [loginUser] = useLoginUserMutation();
  const {
    data: userInfo,
    refetch,
    isFetching,
  } = useGetUserInfoQuery(undefined, {
    skip: !token,
  });

  // Xác thực khi có token, tự logout khi hết hạn hoặc chưa login
  useEffect(() => {
    const processAuth = async () => {
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
      setIsLoading(false);
    };

    processAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    token,
    expireTime,
    userInfo,
    isAuthenticated,
    pathname,
    dispatch,
    router,
  ]);

  // Chỉ cập nhật lại redux khi userInfo thay đổi
  useEffect(() => {
    if (userInfo && token) {
      dispatch(setAuthData({ user: userInfo, token, expireTime: expireTime! }));
      // KHÔNG redirect theo role ở đây nữa
    }
  }, [userInfo, token, expireTime, dispatch]);

  const login = async (email: string, password: string) => {
    try {
      const res = await loginUser({ email, password }).unwrap();
      const expire = Date.now() + 60 * 60 * 1000;

      if (res.result.authenticated) {
        dispatch(
          setAuthData({
            user: res.result.user,
            token: res.result.token,
            expireTime: expire,
          }),
        );
        router.push("/home"); // Redirect về dashboard chung
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
    dispatch(baseApi.util.resetApiState());
    router.push("/login");
  };

  // Loading UI trong AuthProvider
  if (isLoading || isFetching) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <span className="ml-3 text-lg text-blue-500">Đang xác thực...</span>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
