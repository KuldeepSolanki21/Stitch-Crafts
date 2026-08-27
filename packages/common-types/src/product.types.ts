export interface IProductVariant {
  id: string;
  productId: string;
  colorName: string;
  colorHex: string;
  size?: string | null;
  sku: string;
  priceDelta: number;
  stock: number;
  images: string[];
}

export interface IProduct {
  id: string;
  title: string;
  slug: string;
  description: string;
  details?: Record<string, any> | null;
  price: number;
  discountPrice?: number | null;
  stock: number;
  sku: string;
  images: string[];
  categoryId: string;
  featured: boolean;
  isPublished: boolean;
  variants?: IProductVariant[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image: string;
  parentId?: string | null;
  isActive: boolean;
  children?: ICategory[];
}
