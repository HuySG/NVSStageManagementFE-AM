export interface Attachment {
  attachmentId: string; // Chỉnh từ id: String thành attachmentId: string
  fileUrl: string; // Chỉnh từ fileURL thành fileUrl để khớp với JSON
  fileName: string;
  taskId: string;
  uploadedById: string; // Chỉnh từ String thành string
}
