"use client";

import { useGetAssetByIdQuery } from "@/state/api/modules/assetApi";
import {
  useGetPendingReturnRequestsQuery,
  useGetReturnRequestByIdQuery,
  useProcessReturnRequestMutation,
} from "@/state/api/modules/returnRequestApi";
import {
  useGetUserByIdQuery,
  useGetUserInfoQuery,
} from "@/state/api/modules/userApi";
import { Building2, Mail, User2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { toast } from "react-toastify";

export default function RequestDetailPage() {
  const { requestId } = useParams();
  const router = useRouter();
  console.log("requestId", requestId);

  // Lấy thông tin leader đang đăng nhập
  const { data: leaderInfo, isLoading: loadingLeader } = useGetUserInfoQuery();
  const leaderId = leaderInfo?.id;

  // Lấy danh sách request và chọn request theo ID
  const { data: allRequests, isLoading: loadingRequests } =
    useGetPendingReturnRequestsQuery();
  const request = useMemo(
    () => allRequests?.find((r) => r.requestId === requestId),
    [allRequests, requestId],
  );

  // Lấy thông tin tài sản
  const { data: asset, isLoading: loadingAsset } = useGetAssetByIdQuery(
    request?.assetId || "",
  );
  const [processReturnRequest] = useProcessReturnRequestMutation();

  const [leaderNote, setLeaderNote] = useState("");
  const [damageFee, setDamageFee] = useState<number | "">("");
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  // Lấy thông tin yêu cầu trả theo ID
  const {
    data: returnRequest,
    isLoading: loadingRequest,
    error,
  } = useGetReturnRequestByIdQuery(requestId as string);

  const { data: staffInfo, isLoading: loadingStaff } = useGetUserByIdQuery(
    returnRequest?.staffId ?? "",
    {
      skip: !returnRequest?.staffId,
    },
  );
  const departmentId = staffInfo?.department?.id;

  const handleApprove = async () => {
    if (!leaderId) return;
    try {
      await processReturnRequest({
        requestId: requestId as string,
        leaderId,
        data: {
          approved: true,
          leaderNote,
          damageFee: damageFee === "" ? undefined : Number(damageFee),
        },
      });
      toast.success("Phê duyệt thành công!");
      router.push(`/return-request/${departmentId}`);
    } catch (err) {
      toast.error("Lỗi khi phê duyệt");
    }
  };

  const handleReject = async () => {
    if (!leaderId) return;
    try {
      await processReturnRequest({
        requestId: requestId as string,
        leaderId,
        data: {
          approved: false,
          leaderNote,
          rejectReason,
        },
      });
      toast.success("Đã từ chối yêu cầu");
      router.push(`/return-request/${departmentId}`);
    } catch (err) {
      toast.error("Lỗi khi từ chối yêu cầu");
    }
  };

  if (loadingLeader || loadingRequests || loadingAsset || !request)
    return <p className="p-6">Đang tải dữ liệu...</p>;
  if (loadingRequest || loadingStaff) {
    return (
      <div className="p-10 text-center text-gray-500">Đang tải dữ liệu...</div>
    );
  }

  if (!returnRequest) {
    return (
      <div className="text-center text-red-500">Không tìm thấy yêu cầu.</div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 px-10 py-10 lg:px-16">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">
        Chi tiết yêu cầu trả tài sản
      </h1>

      {/* Người gửi yêu cầu */}
      {staffInfo && (
        <div className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold text-gray-800">
            Người gửi yêu cầu
          </h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <User2 className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Họ tên:</span> {staffInfo.fullName}
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Email:</span> {staffInfo.email}
            </li>
            <li className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Phòng ban:</span>{" "}
              {staffInfo.department?.name ?? "Không rõ"}
            </li>
          </ul>
        </div>
      )}

      {/* Ảnh trả */}
      <div className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-gray-800">
          Hình ảnh trả
        </h2>
        {request.imageUrl ? (
          <img
            src={request.imageUrl}
            alt="Ảnh trả"
            className="max-h-80 w-full rounded-lg border object-contain"
          />
        ) : (
          <p className="text-sm italic text-gray-500">Không có hình ảnh</p>
        )}
      </div>

      {/* Thông tin tài sản */}
      <div className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-gray-800">
          Thông tin tài sản
        </h2>
        {asset ? (
          <ul className="space-y-1 text-sm text-gray-700">
            <li>
              <span className="font-medium">Tên:</span> {asset.assetName}
            </li>
            <li>
              <span className="font-medium">Loại:</span> {asset.assetType.name}
            </li>
            <li>
              <span className="font-medium">Phân loại:</span>{" "}
              {asset.category.name}
            </li>
          </ul>
        ) : (
          <p className="text-sm text-gray-500">
            Không tìm thấy thông tin tài sản
          </p>
        )}
      </div>

      {/* Ghi chú tình trạng */}
      <div className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-gray-800">
          Ghi chú tình trạng
        </h2>
        <p className="text-sm text-gray-700">
          {request.conditionNote || <i className="text-gray-400">Không có</i>}
        </p>
      </div>

      {/* Ghi chú và xử lý Leader */}
      <div className="mb-6 space-y-4 rounded-xl border bg-white p-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Ghi chú của Leader
          </label>
          <textarea
            className="mt-1 w-full rounded border p-2 text-sm"
            rows={3}
            value={leaderNote}
            onChange={(e) => setLeaderNote(e.target.value)}
          />
        </div>

        {!isRejecting && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phí hư hỏng (VNĐ)
            </label>
            <input
              type="number"
              className="mt-1 w-full rounded border p-2 text-sm"
              value={damageFee}
              onChange={(e) =>
                setDamageFee(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              placeholder="0"
            />
          </div>
        )}

        {isRejecting && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Lý do từ chối
            </label>
            <textarea
              className="mt-1 w-full rounded border p-2 text-sm"
              rows={2}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Nút xử lý */}
      <div className="flex flex-wrap gap-4">
        {!isRejecting ? (
          <>
            <button
              onClick={handleApprove}
              className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Phê duyệt
            </button>
            <button
              onClick={() => setIsRejecting(true)}
              className="rounded bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300"
            >
              Từ chối
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleReject}
              className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Xác nhận từ chối
            </button>
            <button
              onClick={() => setIsRejecting(false)}
              className="rounded bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300"
            >
              Huỷ
            </button>
          </>
        )}
      </div>
    </div>
  );
}
