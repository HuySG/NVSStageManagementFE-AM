"use client";
import { useContext, useState } from "react";
import { AuthContext } from "../AuthProvider";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const LOGO_URL =
  "https://firebasestorage.googleapis.com/v0/b/nvs-system.firebasestorage.app/o/attachments%2FHCMCONS_Logo.png?alt=media&token=d6df365d-8944-43b0-8bcf-ec36ba0cc6b1";

const Login = () => {
  const auth = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!auth) return <div>Loading...</div>;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await auth.login(email, password);
      toast.success("Đăng nhập thành công!");
    } catch (err: any) {
      const message = err?.message || "";
      if (message.includes("Invalid email")) {
        setError("Email hoặc mật khẩu không đúng.");
        toast.error("Email hoặc mật khẩu không đúng.");
      } else {
        setError("Đăng nhập thất bại. Vui lòng thử lại.");
        toast.error("Có lỗi xảy ra, vui lòng thử lại sau.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-200 via-pink-50 to-white transition-all dark:from-gray-900 dark:via-indigo-900 dark:to-gray-950">
      <div className="flex w-full max-w-md flex-col items-center rounded-3xl bg-white/90 px-8 py-10 shadow-2xl dark:bg-[#191b28]/90 md:p-12">
        <img
          src={LOGO_URL}
          alt="NVS Logo"
          className="mb-4 h-20 w-20 rounded-full border-4 border-white object-cover shadow-md dark:border-indigo-900"
        />
        <h2 className="mb-2 text-center text-3xl font-extrabold tracking-tight text-blue-700 dark:text-white">
          Đăng nhập hệ thống Quản Lý Tài Sản
        </h2>
        <p className="mb-6 text-center text-sm text-gray-500 dark:text-gray-300">
          Vui lòng đăng nhập để tiếp tục quản lý tài sản, công việc và dự án của
          bạn.
        </p>
        <form onSubmit={handleLogin} className="w-full space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              autoComplete="username"
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-[#232446] dark:text-white dark:focus:ring-indigo-800"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-[#232446] dark:text-white dark:focus:ring-indigo-800"
              required
            />
          </div>
          {error && <p className="text-center text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 font-bold text-white shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Đang đăng nhập...
              </>
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
