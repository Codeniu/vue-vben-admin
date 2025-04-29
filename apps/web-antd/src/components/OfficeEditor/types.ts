export interface Seat {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  employee: string;
  status: SeatStatus;
  selected: boolean;
}

export type SeatStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';

export interface StatusColors {
  available: string;
  occupied: string;
  reserved: string;
  maintenance: string;
}

export interface OfficeEditorProps {
  width?: number;
  height?: number;
  initialData?: Seat[];
}
