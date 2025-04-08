"use client";
import React, { useState } from "react";

// Custom StatsCard component implementation

const HomePage = () => {
  const [approvalRequests, setApprovalRequests] = useState([
    {
      id: 1,
      assetName: "Apple MacBook Air",
      employeeId: "KF 001",
      employeeName: "Cristiano",
      department: "Product Design",
    },
    {
      id: 2,
      assetName: "Apple MacBook Air",
      employeeId: "KF 001",
      employeeName: "Amelia",
      department: "Product Design",
    },
    {
      id: 3,
      assetName: "Apple MacBook Air",
      employeeId: "KF 001",
      employeeName: "Jessica",
      department: "Product Design",
    },
    {
      id: 4,
      assetName: "Apple MacBook Air",
      employeeId: "KF 001",
      employeeName: "Monica",
      department: "Product Design",
    },
    {
      id: 5,
      assetName: "Apple MacBook Air",
      employeeId: "KF 001",
      employeeName: "Ronaldo",
      department: "Product Design",
    },
  ]);

  const [upcomingDueDates, setUpcomingDueDates] = useState([
    { id: 1, dueDate: "15 Sep 2023", dueType: "License Renew", assets: 3 },
    { id: 2, dueDate: "18 Sep 2023", dueType: "License Renew", assets: 3 },
    { id: 3, dueDate: "25 Sep 2023", dueType: "License Renew", assets: 3 },
    { id: 4, dueDate: "30 Sep 2023", dueType: "License Renew", assets: 3 },
  ]);

  const [selectedMonth, setSelectedMonth] = useState("September");
  const [selectedRequestType, setSelectedRequestType] =
    useState("Asset Requests");

  // const handleApprove = (id) => {
  //   // Handle approval logic
  //   console.log(`Approved request ${id}`);
  // };

  // const handleReject = (id) => {
  //   // Handle rejection logic
  //   console.log(`Rejected request ${id}`);
  // };

  // const handleSendBack = (id) => {
  //   // Handle send back logic
  //   console.log(`Sent back request ${id}`);
  // };

  // Icons for stats cards
  const requestIcon = (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm0 2h8v12H6V4z"
        clipRule="evenodd"
      />
    </svg>
  );

  const returnIcon = (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
        clipRule="evenodd"
      />
    </svg>
  );

  const complaintIcon = (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z"
        clipRule="evenodd"
      />
    </svg>
  );

  const disposalIcon = (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-800">
      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Asset Requests"
          value={25}
          change={2.78}
          icon={requestIcon}
        />
        <StatsCard
          title="Asset Returns"
          value={15}
          change={-2.78}
          icon={returnIcon}
        />
        <StatsCard
          title="Asset Complaints"
          value={15}
          change={2.78}
          icon={complaintIcon}
        />
        <StatsCard
          title="Asset Disposals"
          value={10}
          change={-2.78}
          icon={disposalIcon}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Asset Approvals Section */}
        <div className="lg:col-span-2">
          <div className="rounded-lg bg-white shadow dark:bg-gray-700">
            <div className="border-b border-gray-200 p-4 dark:border-gray-600">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Asset Approvals
              </h2>
            </div>
            <div className="p-4">
              <div className="mb-4 flex justify-between">
                <h3 className="font-bold text-gray-700 dark:text-gray-200">
                  ASSET APPROVALS
                </h3>
                <div className="flex items-center">
                  <select
                    className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm"
                    value={selectedRequestType}
                    onChange={(e) => setSelectedRequestType(e.target.value)}
                  >
                    <option>Asset Requests</option>
                    <option>Asset Returns</option>
                    <option>Asset Complaints</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Asset Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Employee ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Employee Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Department
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-600 dark:bg-gray-700">
                    {approvalRequests.map((request) => (
                      <tr key={request.id}>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                          {request.assetName}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-blue-600">
                          {request.employeeId}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                          <div className="flex items-center">
                            <img
                              src="/api/placeholder/24/24"
                              alt="Employee"
                              className="mr-2 h-6 w-6 rounded-full"
                            />
                            {request.employeeName}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                          {request.department}
                        </td>
                        <td className="space-x-2 whitespace-nowrap px-4 py-3 text-sm">
                          <button
                            // onClick={() => handleApprove(request.id)}
                            className="rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600"
                          >
                            Approve
                          </button>
                          <button
                            // onClick={() => handleReject(request.id)}
                            className="rounded border border-gray-300 bg-white px-3 py-1 text-gray-800 hover:bg-gray-100"
                          >
                            Reject
                          </button>
                          <button
                            // onClick={() => handleSendBack(request.id)}
                            className="rounded border border-gray-300 bg-white px-3 py-1 text-gray-800 hover:bg-gray-100"
                          >
                            Send Back
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebars */}
        <div className="space-y-6">
          {/* Upcoming Due Dates */}
          <div className="rounded-lg bg-white shadow dark:bg-gray-700">
            <div className="border-b border-gray-200 p-4 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  UPCOMING DUE DATES
                </h2>
                <select
                  className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  <option>September</option>
                  <option>October</option>
                  <option>November</option>
                </select>
              </div>
            </div>
            <div className="p-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Due Date
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Due Type
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Assets
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-600 dark:bg-gray-700">
                  {upcomingDueDates.map((due) => (
                    <tr key={due.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                        {due.dueDate}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                        {due.dueType}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                        <div className="flex items-center">
                          <div className="flex -space-x-2">
                            <img
                              src="/api/placeholder/24/24"
                              alt="Asset"
                              className="h-6 w-6 rounded-full border-2 border-white"
                            />
                            <img
                              src="/api/placeholder/24/24"
                              alt="Asset"
                              className="h-6 w-6 rounded-full border-2 border-white"
                            />
                            <img
                              src="/api/placeholder/24/24"
                              alt="Asset"
                              className="h-6 w-6 rounded-full border-2 border-white"
                            />
                          </div>
                          <span className="ml-2 text-blue-600">
                            + {due.assets} more
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Assets Hub */}
          <div className="rounded-lg bg-white shadow dark:bg-gray-700">
            <div className="border-b border-gray-200 p-4 dark:border-gray-600">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                ASSETS HUB
              </h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <div className="mb-1 flex justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Total Assets
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      50,00,000
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div className="h-2 w-full rounded-full bg-blue-600"></div>
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Assigned Assets
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      25,00,000
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div className="h-2 w-1/2 rounded-full bg-blue-600"></div>
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      In Stock Assets
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      25,567
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div className="h-2 w-1/6 rounded-full bg-blue-600"></div>
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Unallocated Assets
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      5,789
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div className="h-2 w-1/12 rounded-full bg-blue-600"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, change, icon }) => {
  const isPositive = change >= 0;

  return (
    <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-700">
      <div className="mb-2 flex justify-between">
        <h3 className="font-medium text-gray-700 dark:text-gray-200">
          {title}
        </h3>
        <span className="text-blue-600">{icon}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-3xl font-bold">{value}</span>
        <div className="mt-1 flex items-center">
          <span
            className={`text-xs ${isPositive ? "text-green-600" : "text-red-600"} flex items-center`}
          >
            {isPositive ? (
              <svg
                className="mr-1 h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            ) : (
              <svg
                className="mr-1 h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            )}
            {Math.abs(change)}%
          </span>
          <span className="ml-1 text-xs text-gray-500">
            compared to last week
          </span>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
