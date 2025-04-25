import { db } from "@db";
import { eq, and, desc } from "drizzle-orm";
import { 
  brands, 
  models, 
  versions, 
  colors, 
  vehicles,
  versionColors,
  BrandInsert,
  ModelInsert,
  VersionInsert,
  ColorInsert,
  VehicleInsert,
  VersionColorInsert
} from "@shared/schema";

// Brands
export async function getBrands() {
  return db.query.brands.findMany({
    orderBy: brands.name
  });
}

export async function getBrandById(id: number) {
  return db.query.brands.findFirst({
    where: eq(brands.id, id)
  });
}

export async function createBrand(data: BrandInsert) {
  const [newBrand] = await db.insert(brands).values(data).returning();
  return newBrand;
}

export async function updateBrand(id: number, data: BrandInsert) {
  const [updatedBrand] = await db.update(brands)
    .set(data)
    .where(eq(brands.id, id))
    .returning();
  
  return updatedBrand;
}

export async function deleteBrand(id: number) {
  await db.delete(brands).where(eq(brands.id, id));
}

// Models
export async function getModels() {
  return db.query.models.findMany({
    orderBy: models.name,
    with: {
      brand: true
    }
  });
}

export async function getModelById(id: number) {
  return db.query.models.findFirst({
    where: eq(models.id, id),
    with: {
      brand: true
    }
  });
}

export async function createModel(data: ModelInsert) {
  const [newModel] = await db.insert(models).values(data).returning();
  return getModelById(newModel.id);
}

export async function updateModel(id: number, data: ModelInsert) {
  const [updatedModel] = await db.update(models)
    .set(data)
    .where(eq(models.id, id))
    .returning();
  
  if (!updatedModel) return null;
  
  return getModelById(updatedModel.id);
}

export async function deleteModel(id: number) {
  await db.delete(models).where(eq(models.id, id));
}

// Versions
export async function getVersions() {
  return db.query.versions.findMany({
    orderBy: versions.name,
    with: {
      model: {
        with: {
          brand: true
        }
      }
    }
  });
}

export async function getVersionById(id: number) {
  return db.query.versions.findFirst({
    where: eq(versions.id, id),
    with: {
      model: {
        with: {
          brand: true
        }
      }
    }
  });
}

export async function createVersion(data: VersionInsert) {
  const [newVersion] = await db.insert(versions).values(data).returning();
  return getVersionById(newVersion.id);
}

export async function updateVersion(id: number, data: VersionInsert) {
  const [updatedVersion] = await db.update(versions)
    .set(data)
    .where(eq(versions.id, id))
    .returning();
  
  if (!updatedVersion) return null;
  
  return getVersionById(updatedVersion.id);
}

export async function deleteVersion(id: number) {
  await db.delete(versions).where(eq(versions.id, id));
}

// Colors
export async function getColors() {
  return db.query.colors.findMany({
    orderBy: colors.name
  });
}

export async function getColorById(id: number) {
  return db.query.colors.findFirst({
    where: eq(colors.id, id)
  });
}

export async function createColor(data: ColorInsert) {
  const [newColor] = await db.insert(colors).values(data).returning();
  return newColor;
}

export async function updateColor(id: number, data: ColorInsert) {
  const [updatedColor] = await db.update(colors)
    .set(data)
    .where(eq(colors.id, id))
    .returning();
  
  return updatedColor;
}

export async function deleteColor(id: number) {
  await db.delete(colors).where(eq(colors.id, id));
}

// Version Colors
export async function getVersionColors(options: { modelId?: number, versionId?: number } = {}) {
  const query: any = {};
  
  if (options.versionId) {
    query.where = eq(versionColors.versionId, options.versionId);
  }
  
  const results = await db.query.versionColors.findMany({
    ...query,
    orderBy: desc(versionColors.createdAt),
    with: {
      version: {
        with: {
          model: {
            with: {
              brand: true
            }
          }
        }
      },
      color: true
    }
  });
  
  // Filter by modelId if provided (needs to be done post-query due to relations)
  if (options.modelId && results.length > 0) {
    return results.filter(vc => {
      if (!vc.version || !vc.version.modelId) return false;
      return vc.version.modelId === options.modelId;
    });
  }
  
  return results;
}

export async function getVersionColorById(id: number) {
  return db.query.versionColors.findFirst({
    where: eq(versionColors.id, id),
    with: {
      version: {
        with: {
          model: {
            with: {
              brand: true
            }
          }
        }
      },
      color: true
    }
  });
}

export async function createVersionColor(data: VersionColorInsert) {
  const [newVersionColor] = await db.insert(versionColors).values({
    ...data,
    updatedAt: new Date()
  }).returning();
  
  return getVersionColorById(newVersionColor.id);
}

export async function updateVersionColor(id: number, data: VersionColorInsert) {
  const [updatedVersionColor] = await db.update(versionColors)
    .set({
      ...data,
      updatedAt: new Date()
    })
    .where(eq(versionColors.id, id))
    .returning();
  
  if (!updatedVersionColor) return null;
  
  return getVersionColorById(updatedVersionColor.id);
}

export async function deleteVersionColor(id: number) {
  await db.delete(versionColors).where(eq(versionColors.id, id));
}

// Vehicles
export async function getVehicles() {
  return db.query.vehicles.findMany({
    orderBy: desc(vehicles.createdAt),
    with: {
      version: {
        with: {
          model: {
            with: {
              brand: true
            }
          }
        }
      },
      color: true
    }
  });
}

export async function getVehicleById(id: number) {
  return db.query.vehicles.findFirst({
    where: eq(vehicles.id, id),
    with: {
      version: {
        with: {
          model: {
            with: {
              brand: true
            }
          }
        }
      },
      color: true
    }
  });
}

export async function createVehicle(data: VehicleInsert) {
  const [newVehicle] = await db.insert(vehicles).values(data).returning();
  return getVehicleById(newVehicle.id);
}

export async function updateVehicle(id: number, data: VehicleInsert) {
  const [updatedVehicle] = await db.update(vehicles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(vehicles.id, id))
    .returning();
  
  if (!updatedVehicle) return null;
  
  return getVehicleById(updatedVehicle.id);
}

export async function deleteVehicle(id: number) {
  await db.delete(vehicles).where(eq(vehicles.id, id));
}

export const storage = {
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
  
  getModels,
  getModelById,
  createModel,
  updateModel,
  deleteModel,
  
  getVersions,
  getVersionById,
  createVersion,
  updateVersion,
  deleteVersion,
  
  getColors,
  getColorById,
  createColor,
  updateColor,
  deleteColor,
  
  getVersionColors,
  getVersionColorById,
  createVersionColor,
  updateVersionColor,
  deleteVersionColor,
  
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle
};
