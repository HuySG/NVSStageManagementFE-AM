"use client";

import React from "react";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import { useCreatePreparationTaskMutation } from "@/state/api/modules/requestApi";

const CreatePreparationTaskPage = () => {
  const { requestId, projectId, departmentId } = useParams();
  const [createPreparationTask, { isLoading }] =
    useCreatePreparationTaskMutation();

  const handleCreateTask = async () => {
    try {
      await createPreparationTask(requestId as string).unwrap();
      toast.success("Preparation task created successfully!");
      // 👉 Sau khi tạo task có thể redirect về danh sách hoặc detail page
    } catch (error) {
      console.error("Failed to create preparation task:", error);
      toast.error("Failed to create preparation task.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="mb-10 text-center text-3xl font-bold text-gray-800">
        Create Preparation Task
      </h1>

      <div className="mx-auto max-w-2xl space-y-6 rounded-xl bg-white p-6 shadow">
        <p className="text-sm text-gray-700">
          Confirm to create a Preparation Task for assets allocated under this
          request.
        </p>

        <button
          onClick={handleCreateTask}
          disabled={isLoading}
          className="w-full rounded-md bg-green-600 py-3 text-white transition hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? "Creating..." : "Create Preparation Task"}
        </button>
      </div>
    </div>
  );
};

export default CreatePreparationTaskPage;
