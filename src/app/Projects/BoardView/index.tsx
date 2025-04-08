import {
  TaskUser,
  useGetTasksQuery,
  useGetUsersQuery,
  User,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
} from "@/state/api";
import React, { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Task as TaskType } from "@/state/api";
import { EllipsisVertical, MessageSquareMore, Plus, X } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";

type BoardProps = {
  id: string;
  setIsModaNewTasklOpen: (isOpen: boolean) => void;
};
const taskStatus = ["ToDo", "WorkInProgress", "UnderReview", "Completed"];

const convertUsersToTaskUsers = (users: User[]): TaskUser[] => {
  return users.map((user) => ({
    userID: user.id, // Assuming 'id' in User corresponds to 'userID' in TaskUser
    fullName: user.fullName, // Adjust based on actual User type properties
    pictureProfile: user.pictureProfile, // Adjust based on actual User type properties
  }));
};

const BoardView = ({ id, setIsModaNewTasklOpen }: BoardProps) => {
  const [editingTask, setEditingTask] = useState<TaskType | null>(null);
  const {
    data: tasks,
    isLoading,
    error,
    refetch,
  } = useGetTasksQuery({ projectId: id }, { refetchOnMountOrArgChange: true });
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [updateTask] = useUpdateTaskMutation();
  const { data: users } = useGetUsersQuery(undefined);
  const moveTask = async (taskId: string, toStatus: string) => {
    await updateTaskStatus({ taskId, status: toStatus });
    refetch(); // Fetch lại danh sách task ngay sau khi update
  };

  const handleTaskEdit = async (updatedTask: Partial<TaskType>) => {
    if (editingTask) {
      await updateTask({
        taskID: editingTask.taskID,
        ...updatedTask,
      });
      setEditingTask(null);
      refetch();
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occured while fetching tasks</div>;

  return (
    <>
      <DndProvider backend={HTML5Backend}>
        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
          {taskStatus.map((status) => (
            <TaskColumn
              key={status}
              status={status}
              tasks={tasks?.filter((task) => task.status === status) || []}
              moveTask={moveTask}
              setIsModaNewTasklOpen={setIsModaNewTasklOpen}
              onEditTask={setEditingTask}
            />
          ))}
        </div>
      </DndProvider>

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          users={users ? convertUsersToTaskUsers(users) : []}
          onClose={() => setEditingTask(null)}
          onSave={handleTaskEdit}
        />
      )}
    </>
  );
};
type TaskColumnProps = {
  status: string;
  tasks: TaskType[];
  moveTask: (taskId: string, toStatus: string) => void;
  setIsModaNewTasklOpen: (isOpen: boolean) => void;
  onEditTask: (task: TaskType) => void;
};
const TaskColumn = ({
  status,
  tasks,
  moveTask,
  setIsModaNewTasklOpen,
  onEditTask,
}: TaskColumnProps) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "task",
    drop: (item: { id: string }) => moveTask(item.id, status),
    collect: (monitor) => ({ isOver: !!monitor.isOver() }),
  }));

  const tasksCount = tasks.filter((task) => task.status === status).length;
  const statusColor: any = {
    ToDo: "#2563EB",
    WorkInProgress: "#059669",
    UnderReview: "#D97706",
    Completed: "#000000",
  };
  return (
    <div
      ref={(instance) => {
        drop(instance);
      }}
      className={`sl:py-4 rounded-lg py-2 xl:px-2 ${isOver ? "bg-blue-100 dark:bg-neutral-950" : ""}`}
    >
      <div className="mb-3 flex w-full">
        <div
          className={`w-2 !bg-[${statusColor[status]}] rounded-s-lg`}
          style={{ backgroundColor: statusColor[status] }}
        />
        <div className="flex w-full items-center justify-between rounded-e-lg bg-white px-5 py-4 dark:bg-dark-secondary">
          <h3 className="flex items-center text-lg font-semibold dark:text-white">
            {status}{" "}
            <span
              className="ml-2 inline-block rounded-full bg-gray-200 p-1 text-center text-sm leading-none dark:bg-dark-tertiary"
              style={{ width: "1.5rem", height: "1.5rem" }}
            >
              {tasksCount}
            </span>
          </h3>
          <div className="flex items-center gap-1">
            <button className="flex h-6 w-5 items-center justify-center dark:text-neutral-500">
              <EllipsisVertical size={26} />
            </button>
            <button
              className="flex h-6 w-6 items-center justify-center rounded bg-gray-200 dark:bg-dark-tertiary dark:text-white"
              onClick={() => setIsModaNewTasklOpen(true)}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {tasks
        .filter((task) => task.status === status)
        .map((task) => (
          <Task key={task.taskID} task={task} onEditTask={onEditTask} />
        ))}
    </div>
  );
};

type TaskProps = {
  task: TaskType;
  onEditTask: (task: TaskType) => void;
};
const Task = ({ task, onEditTask }: TaskProps) => {
  const [{ isDragging }, drop] = useDrag(() => ({
    type: "task",
    item: { id: task.taskID },
    collect: (monitor: any) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));
  const taskTagsSplit = task.tag ? task.tag.split(",") : [];
  const formattedStartDate = task.startDate
    ? format(new Date(task.startDate), "P")
    : "";
  [];
  const formattedDueDate = task.endDate
    ? format(new Date(task.endDate), "P")
    : "";

  // const numberOfComments = (task.comments && task.comments.length) || 0;
  const PriorityTag = ({ priority }: { priority: TaskType["priority"] }) => (
    <div
      className={`rounded-full px-2 py-1 text-xs font-semibold ${
        priority === "Urgent"
          ? "bg-red-200 text-red-700"
          : priority === "High"
            ? "bg-yellow-200 text-yellow-700"
            : priority === "Medium"
              ? "bg-green-200 text-green-700"
              : priority === "Low"
                ? "bg-blue-200 text-blue-700"
                : "bg-gray-200 text-gray-700"
      }`}
    >
      {priority}
    </div>
  );
  return (
    <div
      ref={(instance) => {
        drop(instance);
      }}
      className={`mb-4 rounded-md bg-white shadow dark:bg-dark-secondary ${
        isDragging ? "opacity-50" : "opacity-100"
      } cursor-pointer`}
      onClick={() => onEditTask(task)}
    >
      {task.attachments && task.attachments.length > 0 && (
        <Image
          src={`/${task.attachments}`}
          alt={task.attachments}
          width={400}
          height={200}
          className="h-auto w-full rounded-t-md"
        />
      )}
      <div className="p-4 md:p-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {task.priority && <PriorityTag priority={task.priority} />}
            <div className="flex gap-2">
              {taskTagsSplit.map((tag) => (
                <div
                  key={tag}
                  className="rounded-full bg-blue-100 px-2 py-1 text-xs"
                >
                  {""}
                  {tag}
                </div>
              ))}
            </div>
          </div>
          <button className="flex h-6 w-4 flex-shrink-0 items-center justify-center dark:text-neutral-500">
            <EllipsisVertical size={26} />
          </button>
        </div>
        <div className="my-3 flex justify-between">
          <h4 className="text-md font-bold dark:text-white">{task.title}</h4>
          {/* {typeof task.points === "number" && (
            <div className="text-xs font-semibold dark:text-white">
              {task.points} pts
            </div>
          )} */}
        </div>
        <div className="text-xs text-gray-500 dark:text-neutral-500">
          {formattedStartDate && <span>{formattedStartDate} - </span>}
          {formattedDueDate && <span>{formattedDueDate}</span>}
        </div>
        <p className="text-sm text-gray-600 dark:text-neutral-500">
          {task.description}
        </p>
        <div className="mt-4 border-t border-gray-200 dark:border-stroke-dark" />
        <div className="mt-3 flex items-center justify-between">
          <div className="flex -space-x-[6px] overflow-hidden">
            {task.assignedUsers &&
              task.assignedUsers?.map((taskUser) => (
                <Image
                  key={taskUser.userID} // Đặt key bằng userId
                  src={`/${taskUser.pictureProfile}`} // Lấy avatar đúng
                  alt={taskUser.fullName! || "User"} // Tránh lỗi nếu không có username
                  width={30}
                  height={30}
                  className="h-8 w-8 rounded-full border-2 border-white object-cover dark:border-dark-secondary"
                />
              ))}

            {/* {task.author && (
              <Image
                key={task.author.userId}
                src={`/${task.author.profilePictureUrl!}`}
                alt={task.author.username}
                width={30}
                height={30}
                className="h-8 w-8 rounded-full border-2 border-white object-cover dark:border-dark-secondary"
              />
            )} */}
          </div>
          {/* <div className="flex items-center text-gray-500 dark:text-neutral-500">
            <MessageSquareMore size={20} />
            <span className="ml-1 text-sm dark:text-neutral-400">
              {numberOfComments}
            </span>
          </div> */}
        </div>
      </div>
    </div>
  );
};

type EditTaskModalProps = {
  task: TaskType;
  users: TaskUser[];
  onClose: () => void;
  onSave: (updatedTask: Partial<TaskType>) => void;
};

const EditTaskModal = ({
  task,
  users,
  onClose,
  onSave,
}: EditTaskModalProps) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState<TaskType["priority"]>(task.priority);
  const [startDate, setStartDate] = useState(
    task.startDate ? format(new Date(task.startDate), "yyyy-MM-dd") : "",
  );
  const [endDate, setEndDate] = useState(
    task.endDate ? format(new Date(task.endDate), "yyyy-MM-dd") : "",
  );
  const [tags, setTags] = useState(task.tag || "");
  const [assignedUsers, setAssignedUsers] = useState<TaskUser[]>(
    task.assignedUsers || [],
  );

  const handleSave = () => {
    onSave({
      title,
      description,
      priority,
      startDate: startDate ? new Date(startDate).toISOString() : undefined,
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
      tag: tags,
      assignedUsers: assignedUsers,
    });
  };

  const handleAddUser = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUserId = e.target.value;
    const selectedUser = users.find((user) => user.userID === selectedUserId);

    if (
      selectedUser &&
      !assignedUsers.some((u) => u.userID === selectedUserId)
    ) {
      setAssignedUsers([...assignedUsers, selectedUser]);
    }
  };

  const handleRemoveUser = (userIdToRemove: string) => {
    setAssignedUsers(
      assignedUsers.filter((user) => user.userID !== userIdToRemove),
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 dark:bg-dark-secondary">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task Title"
            className="w-full rounded border p-2 dark:bg-dark-tertiary dark:text-white"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Task Description"
            className="h-24 w-full rounded border p-2 dark:bg-dark-tertiary dark:text-white"
          />

          <div>
            <label className="mb-2 block dark:text-white">Priority</label>
            <select
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as TaskType["priority"])
              }
              className="w-full rounded border p-2 dark:bg-dark-tertiary dark:text-white"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-2 block dark:text-white">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded border p-2 dark:bg-dark-tertiary dark:text-white"
              />
            </div>
            <div className="flex-1">
              <label className="mb-2 block dark:text-white">Due Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded border p-2 dark:bg-dark-tertiary dark:text-white"
              />
            </div>
          </div>

          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags (comma-separated)"
            className="w-full rounded border p-2 dark:bg-dark-tertiary dark:text-white"
          />

          <div>
            <label className="mb-2 block dark:text-white">Assign Users</label>
            <select
              onChange={handleAddUser}
              className="mb-2 w-full rounded border p-2 dark:bg-dark-tertiary dark:text-white"
            >
              <option value="">Select User to Assign</option>
              {users.map((user) => (
                <option key={user.userID} value={user.userID}>
                  {user.fullName}
                </option>
              ))}
            </select>

            <div className="flex flex-wrap gap-2">
              {assignedUsers.map((user) => (
                <div
                  key={user.userID}
                  className="flex items-center gap-2 rounded-full bg-gray-200 px-3 py-1"
                >
                  <span>{user.fullName}</span>
                  <button
                    onClick={() => handleRemoveUser(user.userID)}
                    className="text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            className="mt-4 w-full rounded bg-blue-500 py-2 text-white transition hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoardView;
