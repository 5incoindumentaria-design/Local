export type ProductCategory = 'remeras' | 'pantalones' | 'buzos' | 'camperas' | 'vestidos' | 'faldas' | 'accesorios' | 'otros';
export type ProductGender = 'masculino' | 'femenino' | 'unisex';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  cost_price?: number | null;
  category: ProductCategory;
  category_id: string | null;
  gender: ProductGender;
  is_new: boolean;
  is_active: boolean;
  image_url: string | null;
  discount_percent?: number;
  discount_ends_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Color {
  id: string;
  name: string;
  hex_code: string;
  created_at: string;
}

export interface Size {
  id: string;
  name: string;
  display_order: number;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  color_id: string | null;
  size_id: string | null;
  stock: number;
  price?: number | null;
  discount_percent?: number;
  discount_ends_at?: string | null;
  created_at: string;
  updated_at: string;
  color?: Color;
  size?: Size;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  display_order: number;
  color_id: string | null;
  is_primary: boolean;
  created_at: string;
  color?: Color;
}

export interface ProductWithDetails extends Product {
  variants: ProductVariant[];
  images: ProductImage[];
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  remeras: 'Remeras',
  pantalones: 'Pantalones',
  buzos: 'Buzos',
  camperas: 'Camperas',
  vestidos: 'Vestidos',
  faldas: 'Faldas',
  accesorios: 'Accesorios',
  otros: 'Otros',
};

export const GENDER_LABELS: Record<ProductGender, string> = {
  masculino: 'Masculino',
  femenino: 'Femenino',
  unisex: 'Unisex',
};
