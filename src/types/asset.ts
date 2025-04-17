import { ReactNode } from "react";
import { AssetCategory } from "./assetCategory";
import { AssetType } from "./assetType";

export interface Asset {
  returnDate: ReactNode;
  assetID: string;
  assetName: string;
  model: string;
  code: string;
  description: string;
  price: number;
  buyDate: string;
  status: string;
  location: string;
  createdBy: string;
  image: string;
  categoryId: string;
  category: AssetCategory; // Một tài sản chỉ thuộc một loại tài sản
  assetType: AssetType; // Một tài sản chỉ thuộc một kiểu tài sản
}
