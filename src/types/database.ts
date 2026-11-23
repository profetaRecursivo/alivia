// Tipos de datos que reflejan exactamente el esquema de Supabase

export interface Product {
  id: string;
  pharmacy_id?: string;
  barcode?: string;
  commercial_name: string;
  generic_name?: string;
  concentration?: string;
  dosage_form: string;
  presentation?: string;
  laboratory?: string;
  min_stock_alert: number;
  is_active: boolean;
}

export interface Batch {
  id: string;
  product_id: string;
  storage_location_id?: string;
  batch_code: string;
  expiration_date: string; // YYYY-MM-DD
  current_stock: number;
  unit_price: number;
  unit_measure: string;
  status: 'ACTIVE' | 'EXPIRED' | 'DEPLETED' | 'RECALLED';
  // Campos relacionados opcionales de consulta
  products?: Product;
  storage_locations?: { name: string; section_code?: string };
}

export interface Sale {
  id: string;
  pharmacy_id?: string;
  user_id?: string;
  sale_number?: string;
  total_amount: number;
  status: 'COMPLETED' | 'CANCELLED_BY_UNDO';
  sale_date: string;
}

export interface Discard {
  id: string;
  batch_id: string;
  quantity: number;
  reason: 'EXPIRED' | 'DAMAGED_DETERIORATED' | 'RETURN_TO_SUPPLIER' | 'RECALLED_BY_LAB';
  notes?: string;
  discard_date: string;
}

export interface InventoryMovement {
  id: string;
  batch_id: string;
  movement_type: 'SALE' | 'DISCARD' | 'ENTRY' | 'ADJUSTMENT';
  quantity: number;
  previous_stock: number;
  resulting_stock: number;
  reason?: string;
  movement_date: string;
}
