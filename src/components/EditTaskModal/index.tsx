"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { Task } from "@/types/task";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetUserByDepartmentQuery,
  useGetUserInfoQuery,
} from "@/state/api/modules/userApi";
import { useUpdateTaskMutation } from "@/state/api/modules/taskApi";

interface EditTaskModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditTaskModal({
  task,
  onClose,
  isOpen,
  onUpdate,
}: EditTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState<string>("");

  const { data: currentUser, isLoading: isUserLoading } = useGetUserInfoQuery();
  const { data: departmentUsers = [], isLoading: isUsersLoading } =
    useGetUserByDepartmentQuery(currentUser?.department?.id!, {
      skip: !currentUser?.department?.id,
    });

  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setAssigneeId(task.assigneeID || "");
    }
  }, [task]);

  const handleUpdate = async () => {
    if (!task) return;
    try {
      await updateTask({
        taskID: task.taskID,
        title,
        description,
        assigneeID: assigneeId,
        priority: task.priority,
        tag: task.tag,
        startDate: task.startDate,
        endDate: task.endDate,
        status: task.status,
        updateBy: currentUser?.id || "SYSTEM",
        updateDate: new Date().toISOString(),
        attachments: task.attachments ?? [],
        watchers: task.watchers ?? [],
      }).unwrap();
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <Label>Assignee</Label>
            <Select
              key={task.taskID}
              value={assigneeId}
              onValueChange={(value) => setAssigneeId(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select assignee">
                  {departmentUsers.find((u) => u.id === assigneeId)?.fullName ||
                    departmentUsers.find((u) => u.id === assigneeId)?.email ||
                    "Unknown"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {isUsersLoading || isUserLoading ? (
                  <SelectItem value="__loading" disabled>
                    Loading...
                  </SelectItem>
                ) : departmentUsers.length > 0 ? (
                  departmentUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.fullName || user.email}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="__empty" disabled>
                    No users found
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
