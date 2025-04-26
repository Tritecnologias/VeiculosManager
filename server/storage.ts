import { db } from "@db";
import { eq, and, desc } from "drizzle-orm";
import { 
  brands, 
  models, 
  versions, 
  colors, 
  vehicles,
  versionColors,
  paintTypes,
  settings,
  optionals,
  versionOptionals,
  directSales,
  BrandInsert,
  ModelInsert,
  VersionInsert,
  ColorInsert,
  VehicleInsert,
  VersionColorInsert,
  PaintTypeInsert,
  SettingsInsert,
  OptionalInsert,
  VersionOptionalInsert,
  DirectSaleInsert
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
    orderBy: colors.name,
    with: {
      paintType: true
    }
  });
}

export async function getColorById(id: number) {
  return db.query.colors.findFirst({
    where: eq(colors.id, id),
    with: {
      paintType: true
    }
  });
}

export async function createColor(data: ColorInsert) {
  const [newColor] = await db.insert(colors).values(data).returning();
  return getColorById(newColor.id); // Retorna com a relação carregada
}

export async function updateColor(id: number, data: ColorInsert) {
  const [updatedColor] = await db.update(colors)
    .set(data)
    .where(eq(colors.id, id))
    .returning();
  
  if (!updatedColor) return null;
  
  return getColorById(updatedColor.id); // Retorna com a relação carregada
}

export async function deleteColor(id: number) {
  await db.delete(colors).where(eq(colors.id, id));
}

// Paint Types
export async function getPaintTypes() {
  return db.query.paintTypes.findMany({
    orderBy: paintTypes.name
  });
}

export async function getPaintTypeById(id: number) {
  return db.query.paintTypes.findFirst({
    where: eq(paintTypes.id, id)
  });
}

export async function createPaintType(data: PaintTypeInsert) {
  const [newPaintType] = await db.insert(paintTypes).values(data).returning();
  return newPaintType;
}

export async function updatePaintType(id: number, data: PaintTypeInsert) {
  const [updatedPaintType] = await db.update(paintTypes)
    .set(data)
    .where(eq(paintTypes.id, id))
    .returning();
  
  return updatedPaintType;
}

export async function deletePaintType(id: number) {
  await db.delete(paintTypes).where(eq(paintTypes.id, id));
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
      // Access modelId through the loaded relation
      const versionData = vc.version as any;
      if (!versionData || !versionData.modelId) return false;
      return versionData.modelId === options.modelId;
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
  console.log(`[updateVehicle] Attempting to update vehicle with ID ${id}`);
  console.log('[updateVehicle] Data:', JSON.stringify(data, null, 2));
  
  try {
    const [updatedVehicle] = await db.update(vehicles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(vehicles.id, id))
      .returning();
    
    console.log('[updateVehicle] Update result:', updatedVehicle ? 'Success' : 'Not found');
    
    if (!updatedVehicle) return null;
    
    const result = await getVehicleById(updatedVehicle.id);
    console.log('[updateVehicle] Retrieved updated vehicle successfully');
    return result;
  } catch (error) {
    console.error('[updateVehicle] Error updating vehicle:', error);
    throw error;
  }
}

export async function deleteVehicle(id: number) {
  await db.delete(vehicles).where(eq(vehicles.id, id));
}

// Funções para gerenciar configurações
export async function getSettings() {
  return await db.query.settings.findMany({
    orderBy: (settings, { asc }) => [asc(settings.key)]
  });
}

export async function getSettingByKey(key: string) {
  return await db.query.settings.findFirst({
    where: (settings, { eq }) => eq(settings.key, key)
  });
}

export async function getSetting(id: number) {
  return await db.query.settings.findFirst({
    where: (settings, { eq }) => eq(settings.id, id)
  });
}

export async function createSetting(data: SettingsInsert) {
  const [setting] = await db.insert(settings).values(data).returning();
  return setting;
}

export async function updateSetting(id: number, data: Partial<SettingsInsert>) {
  const [setting] = await db.update(settings)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(settings.id, id))
    .returning();
  return setting;
}

export async function updateSettingByKey(key: string, value: string) {
  const [setting] = await db.update(settings)
    .set({ value, updatedAt: new Date() })
    .where(eq(settings.key, key))
    .returning();
  return setting;
}

export async function deleteSetting(id: number) {
  const [setting] = await db.delete(settings)
    .where(eq(settings.id, id))
    .returning();
  return setting;
}

// Opcionais
export async function getOptionals() {
  return db.query.optionals.findMany({
    orderBy: optionals.name
  });
}

export async function getOptionalById(id: number) {
  return db.query.optionals.findFirst({
    where: eq(optionals.id, id)
  });
}

export async function createOptional(data: OptionalInsert) {
  const [newOptional] = await db.insert(optionals).values({
    ...data,
    updatedAt: new Date()
  }).returning();
  return newOptional;
}

export async function updateOptional(id: number, data: OptionalInsert) {
  const [updatedOptional] = await db.update(optionals)
    .set({
      ...data,
      updatedAt: new Date()
    })
    .where(eq(optionals.id, id))
    .returning();
  
  return updatedOptional;
}

export async function deleteOptional(id: number) {
  await db.delete(optionals).where(eq(optionals.id, id));
}

// Opcionais das Versões
export async function getVersionOptionals(options: { modelId?: number, versionId?: number } = {}) {
  const query: any = {};
  
  if (options.versionId) {
    query.where = eq(versionOptionals.versionId, options.versionId);
  }
  
  const results = await db.query.versionOptionals.findMany({
    ...query,
    orderBy: desc(versionOptionals.createdAt),
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
      optional: true
    }
  });
  
  // Filter by modelId if provided (needs to be done post-query due to relations)
  if (options.modelId && results.length > 0) {
    return results.filter(vo => {
      // Access modelId through the loaded relation
      const versionData = vo.version as any;
      if (!versionData || !versionData.modelId) return false;
      return versionData.modelId === options.modelId;
    });
  }
  
  return results;
}

export async function getVersionOptionalById(id: number) {
  return db.query.versionOptionals.findFirst({
    where: eq(versionOptionals.id, id),
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
      optional: true
    }
  });
}

export async function createVersionOptional(data: VersionOptionalInsert) {
  const [newVersionOptional] = await db.insert(versionOptionals).values({
    ...data,
    updatedAt: new Date()
  }).returning();
  
  return getVersionOptionalById(newVersionOptional.id);
}

export async function updateVersionOptional(id: number, data: VersionOptionalInsert) {
  const [updatedVersionOptional] = await db.update(versionOptionals)
    .set({
      ...data,
      updatedAt: new Date()
    })
    .where(eq(versionOptionals.id, id))
    .returning();
  
  if (!updatedVersionOptional) return null;
  
  return getVersionOptionalById(updatedVersionOptional.id);
}

export async function deleteVersionOptional(id: number) {
  await db.delete(versionOptionals).where(eq(versionOptionals.id, id));
}

// Vendas Diretas
export async function getDirectSales() {
  return db.query.directSales.findMany({
    orderBy: directSales.name,
    with: {
      brand: true
    }
  });
}

export async function getDirectSaleById(id: number) {
  return db.query.directSales.findFirst({
    where: eq(directSales.id, id),
    with: {
      brand: true
    }
  });
}

export async function createDirectSale(data: DirectSaleInsert) {
  const [newDirectSale] = await db.insert(directSales).values({
    ...data,
    updatedAt: new Date()
  }).returning();
  return getDirectSaleById(newDirectSale.id);
}

export async function updateDirectSale(id: number, data: DirectSaleInsert) {
  const [updatedDirectSale] = await db.update(directSales)
    .set({
      ...data,
      updatedAt: new Date()
    })
    .where(eq(directSales.id, id))
    .returning();
  
  if (!updatedDirectSale) return null;
  
  return getDirectSaleById(updatedDirectSale.id);
}

export async function deleteDirectSale(id: number) {
  await db.delete(directSales).where(eq(directSales.id, id));
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
  
  getPaintTypes,
  getPaintTypeById,
  createPaintType,
  updatePaintType,
  deletePaintType,
  
  getVersionColors,
  getVersionColorById,
  createVersionColor,
  updateVersionColor,
  deleteVersionColor,
  
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  
  getOptionals,
  getOptionalById,
  createOptional,
  updateOptional,
  deleteOptional,
  
  getVersionOptionals,
  getVersionOptionalById,
  createVersionOptional,
  updateVersionOptional,
  deleteVersionOptional,
  
  getDirectSales,
  getDirectSaleById,
  createDirectSale,
  updateDirectSale,
  deleteDirectSale,
  
  getSettings,
  getSettingByKey,
  getSetting,
  createSetting,
  updateSetting,
  updateSettingByKey,
  deleteSetting
};
