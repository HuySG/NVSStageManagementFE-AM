"use client";

import { useParams } from "next/navigation";
import { useGetBorrowedAssetsQuery } from "@/state/api/modules/borrowAssetApi";
import { useGetAssetRequestsForManagerQuery } from "@/state/api/modules/requestApi";
import { useGetAssetByIdQuery } from "@/state/api/modules/assetApi";
import { format } from "date-fns";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const BorrowedAssetDetailPage = () => {
  const { projectId, departmentId, borrowedID } = useParams<{
    projectId: string;
    departmentId: string;
    borrowedID: string;
  }>();

  const { data: borrowedAssets = [] } = useGetBorrowedAssetsQuery();
  const { data: assetRequests = [] } = useGetAssetRequestsForManagerQuery();

  // Build taskID -> request map
  const requestMap: Record<string, any> = {};
  assetRequests?.forEach((request) => {
    if (request.task?.taskID) {
      requestMap[request.task.taskID] = request;
    }
  });
  console.log(borrowedID, borrowedAssets);
  const asset = borrowedAssets.find(
    (a) => (a.borrowedID || a.borrowedID) === borrowedID,
  );

  if (!asset) {
    return (
      <div className="p-8 text-center text-gray-500">
        Không tìm thấy tài sản.
      </div>
    );
  }

  const assetId = asset.assetID;
  const { data: assetDetail, isLoading: isLoadingAsset } = useGetAssetByIdQuery(
    assetId,
    { skip: !assetId },
  );

  const request = requestMap[asset.taskID];
  const borrower = request?.requesterInfo?.fullName ?? "Không rõ";
  const taskTitle = request?.task?.title ?? "Không rõ";
  const assetName = assetDetail?.assetName ?? "Không rõ";

  return (
    <div className="min-h-screen bg-white px-8 py-10">
      <Link
        href={`/borrowAssets/${projectId}/${departmentId}`}
        className="text-sm text-blue-600 hover:underline"
      >
        ← Quay lại danh sách tài sản
      </Link>

      <h1 className="mt-4 text-3xl font-bold text-gray-800">
        Chi tiết Tài sản Mượn
      </h1>

      <div className="mt-6 grid grid-cols-1 gap-6 text-sm text-gray-700 md:grid-cols-2">
        <div>
          <p className="font-medium text-gray-500">Mã tài sản:</p>
          <p>{assetId || "Không rõ"}</p>
        </div>
        <div>
          <p className="font-medium text-gray-500">Tên tài sản:</p>
          <p>{isLoadingAsset ? "Đang tải..." : assetName}</p>
        </div>
        <div>
          <p className="font-medium text-gray-500">Người mượn:</p>
          <p>{borrower}</p>
        </div>
        <div>
          <p className="font-medium text-gray-500">Task liên quan:</p>
          <p>{taskTitle}</p>
        </div>
        <div>
          <p className="font-medium text-gray-500">Thời gian mượn:</p>
          <p>{format(new Date(asset.borrowTime), "dd/MM/yyyy HH:mm")}</p>
        </div>
        <div>
          <p className="font-medium text-gray-500">Thời gian sử dụng:</p>
          <p>
            {format(new Date(asset.borrowTime), "dd/MM/yyyy")} -{" "}
            {format(new Date(asset.endTime), "dd/MM/yyyy")}
          </p>
        </div>
        <div>
          <p className="font-medium text-gray-500">Trạng thái:</p>
          <Badge variant="outline" className="text-xs">
            {asset.status}
          </Badge>
        </div>
        <div className="md:col-span-2">
          <p className="font-medium text-gray-500">Mô tả:</p>
          <p>{asset.description || "Không có mô tả"}</p>
        </div>
      </div>
    </div>
  );
};

export default BorrowedAssetDetailPage;
