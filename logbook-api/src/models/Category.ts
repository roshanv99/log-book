export interface Category {
  category_id: number;
  category_name: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface SubCategory {
  sub_category_id: number;
  category_id: number;
  sub_category_name: string;
  created_at?: Date;
  updated_at?: Date;
} 