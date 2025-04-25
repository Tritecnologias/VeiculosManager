import { pgTable, text, serial, integer, decimal, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Base tables
export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const models = pgTable("models", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  brandId: integer("brand_id").references(() => brands.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const versions = pgTable("versions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  modelId: integer("model_id").references(() => models.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const colors = pgTable("colors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  hexCode: text("hex_code").notNull(),
  additionalPrice: decimal("additional_price", { precision: 10, scale: 2 }).default("0").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  versionId: integer("version_id").references(() => versions.id).notNull(),
  colorId: integer("color_id").references(() => colors.id),
  year: integer("year").notNull(),
  publicPrice: decimal("public_price", { precision: 10, scale: 2 }).notNull(),
  situation: text("situation").notNull().$type<'available' | 'unavailable' | 'coming-soon'>().default('available'),
  description: text("description").notNull(),
  engine: text("engine").notNull(),
  fuelType: text("fuel_type").notNull().$type<'flex' | 'gasoline' | 'diesel' | 'electric' | 'hybrid'>(),
  transmission: text("transmission").notNull().$type<'manual' | 'automatic' | 'cvt' | 'dct'>(),
  isActive: boolean("is_active").default(true).notNull(),
  pcdIpiIcms: decimal("pcd_ipi_icms", { precision: 10, scale: 2 }).notNull(),
  pcdIpi: decimal("pcd_ipi", { precision: 10, scale: 2 }).notNull(),
  taxiIpiIcms: decimal("taxi_ipi_icms", { precision: 10, scale: 2 }).notNull(),
  taxiIpi: decimal("taxi_ipi", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Relations
export const brandsRelations = relations(brands, ({ many }) => ({
  models: many(models)
}));

export const modelsRelations = relations(models, ({ one, many }) => ({
  brand: one(brands, { fields: [models.brandId], references: [brands.id] }),
  versions: many(versions)
}));

export const versionsRelations = relations(versions, ({ one, many }) => ({
  model: one(models, { fields: [versions.modelId], references: [models.id] }),
  vehicles: many(vehicles)
}));

export const colorsRelations = relations(colors, ({ many }) => ({
  vehicles: many(vehicles)
}));

export const vehiclesRelations = relations(vehicles, ({ one }) => ({
  version: one(versions, { fields: [vehicles.versionId], references: [versions.id] }),
  color: one(colors, { fields: [vehicles.colorId], references: [colors.id] }),
}));

// Validation schemas
export const brandInsertSchema = createInsertSchema(brands, {
  name: (schema) => schema.min(2, "O nome deve ter pelo menos 2 caracteres")
});
export type BrandInsert = z.infer<typeof brandInsertSchema>;
export const brandSelectSchema = createSelectSchema(brands);
export type Brand = z.infer<typeof brandSelectSchema>;

export const modelInsertSchema = createInsertSchema(models, {
  name: (schema) => schema.min(2, "O nome deve ter pelo menos 2 caracteres")
});
export type ModelInsert = z.infer<typeof modelInsertSchema>;
export const modelSelectSchema = createSelectSchema(models);
export type Model = z.infer<typeof modelSelectSchema>;

export const versionInsertSchema = createInsertSchema(versions, {
  name: (schema) => schema.min(2, "O nome deve ter pelo menos 2 caracteres")
});
export type VersionInsert = z.infer<typeof versionInsertSchema>;
export const versionSelectSchema = createSelectSchema(versions);
export type Version = z.infer<typeof versionSelectSchema>;

export const colorInsertSchema = createInsertSchema(colors, {
  name: (schema) => schema.min(2, "O nome deve ter pelo menos 2 caracteres"),
  hexCode: (schema) => schema.min(4, "Código hexadecimal inválido")
});
export type ColorInsert = z.infer<typeof colorInsertSchema>;
export const colorSelectSchema = createSelectSchema(colors);
export type Color = z.infer<typeof colorSelectSchema>;

export const vehicleInsertSchema = createInsertSchema(vehicles, {
  description: (schema) => schema.min(10, "A descrição deve ter pelo menos 10 caracteres")
});
export type VehicleInsert = z.infer<typeof vehicleInsertSchema>;
export const vehicleSelectSchema = createSelectSchema(vehicles);
export type Vehicle = z.infer<typeof vehicleSelectSchema>;
