"use client";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed } from "@/state";
import {
  Home,
  LockIcon,
  LucideChartNoAxesGantt,
  ScrollText,
  Warehouse,
  X,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import UserProfile from "../UserProfile/index";
import { useGetUserInfoQuery } from "@/state/api/modules/userApi";

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );
  const { data: user, isLoading, error } = useGetUserInfoQuery();

  const role = user?.role?.roleName;
  // Loading/error UI
  if (isLoading) return <div>Đang tải...</div>;
  if (error || !user) return <div>Lỗi tải thông tin người dùng</div>;

  // Sidebar styles
  const sidebarClassnames = `
    fixed left-0 top-0 z-40 h-full flex flex-col justify-between
    transition-all duration-300 bg-white dark:bg-[#18192c] shadow-xl
    ${isSidebarCollapsed ? "w-0 hidden" : "w-64"}
  `;

  return (
    <div className={sidebarClassnames}>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="relative flex items-center justify-between px-6 pb-2 pt-5">
          <span className="text-2xl font-extrabold tracking-tight text-blue-700 dark:text-white">
            NVS
          </span>
          {!isSidebarCollapsed && (
            <button
              aria-label="Đóng sidebar"
              className="group rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => dispatch(setIsSidebarCollapsed(true))}
            >
              <X className="h-6 w-6 text-gray-800 group-hover:text-blue-700 dark:text-gray-200" />
            </button>
          )}
        </div>

        {/* TEAM/DEPARTMENT */}
        <div className="flex items-center gap-4 border-y bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-[#232446]">
          <div className="relative flex-shrink-0">
            <Image
              src="https://firebasestorage.googleapis.com/v0/b/nvs-system.firebasestorage.app/o/attachments%2FHCMCONS_Logo.png?alt=media&token=d6df365d-8944-43b0-8bcf-ec36ba0cc6b1"
              alt="logo"
              width={42}
              height={42}
              className="rounded-full border border-blue-200 bg-white p-1 dark:border-gray-700"
            />
          </div>
          <div className="flex flex-col">
            <h3 className="text-base font-semibold leading-tight tracking-wide text-gray-800 dark:text-gray-100">
              {user.department?.name || "No Department"}
            </h3>
            <div className="mt-1 flex items-center gap-1">
              <LockIcon className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">Private</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-1 flex-col gap-1 py-5">
          {role === "Leader" ? (
            <>
              <SidebarLink icon={Home} label="Home" href="/" />
              <SidebarLink
                icon={LucideChartNoAxesGantt}
                label="Danh Sách Công Việc"
                href="/tasks"
              />
              <SidebarLink
                icon={ScrollText}
                label="Yêu cầu tài sản"
                href="/requests"
              />
              <SidebarLink icon={Warehouse} label="Tài Sản" href="/assets" />
              <SidebarLink
                icon={Warehouse}
                label="Tài Sản Đang Mượn"
                href="/borrowAssets"
              />
              <SidebarLink
                icon={Warehouse}
                label="Tài Sản Trả Lại"
                href="/return-request"
              />
            </>
          ) : (
            <>
              <SidebarLink icon={Home} label="Home" href="/" />
              <SidebarLink icon={User} label="Tasks" href="/staff-tasks" />
            </>
          )}
        </nav>
      </div>
      {/* User profile at bottom */}
      <div className="mb-3 px-3">
        <UserProfile />
      </div>
    </div>
  );
};

interface SiderlinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
}

const SidebarLink = ({ href, icon: Icon, label }: SiderlinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link href={href} className="block w-full">
      <div
        className={`group relative my-1 flex items-center gap-3 rounded-lg px-7 py-3 font-medium transition-all ${
          isActive
            ? "bg-blue-100 text-blue-700 shadow dark:bg-[#23274B] dark:text-blue-300"
            : "text-gray-700 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-[#20223b]"
        } `}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <span className="truncate">{label}</span>
        {isActive && (
          <span className="absolute left-0 top-2 h-7 w-[4px] rounded-r bg-blue-600"></span>
        )}
      </div>
    </Link>
  );
};

export default Sidebar;
