// Base entity types
export interface Brand {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Model {
  id: number;
  name: string;
  brandId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ModelWithBrand extends Model {
  brand: Brand;
}

export interface Version {
  id: number;
  name: string;
  modelId: number;
}

export interface VersionWithModel extends Version {
  model: ModelWithBrand;
}

export interface PaintType {
  id: number;
  name: string;
}

export interface Color {
  id: number;
  name: string;
  hexCode: string;
  additionalPrice: number;
  imageUrl?: string;
  paintTypeId?: number | null;
  paintType?: PaintType;
  createdAt?: string;
  updatedAt?: string;
}

// Vehicle related types
export type FuelType = 'flex' | 'gasoline' | 'diesel' | 'electric' | 'hybrid';
export type TransmissionType = 'manual' | 'automatic' | 'cvt' | 'dct';
export type VehicleSituation = 'available' | 'unavailable' | 'coming-soon';
export type VehicleStatus = 'active' | 'inactive';

export interface Vehicle {
  id: number;
  versionId: number;
  colorId?: number;
  year: number;
  publicPrice: number;
  situation: VehicleSituation;
  description: string;
  engine: string;
  fuelType: FuelType;
  transmission: TransmissionType;
  isActive: boolean;
  pcdIpiIcms: number;
  pcdIpi: number;
  taxiIpiIcms: number;
  taxiIpi: number;
  version: VersionWithModel;
  color?: Color;
  createdAt?: string;
  updatedAt?: string;
}
