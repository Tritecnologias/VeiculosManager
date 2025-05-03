import { pgTable, text, serial, integer, decimal, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Base tables
export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const paintTypes = pgTable("paint_types", {
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
  paintTypeId: integer("paint_type_id").references(() => paintTypes.id),
  hexCode: text("hex_code").notNull(),
  additionalPrice: decimal("additional_price", { precision: 10, scale: 2 }).default("0").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const versionColors = pgTable("version_colors", {
  id: serial("id").primaryKey(),
  versionId: integer("version_id").references(() => versions.id).notNull(),
  colorId: integer("color_id").references(() => colors.id).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).default("0").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Tabela para Opcionais
export const optionals = pgTable("optionals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Tabela para associar opcionais às versões
export const versionOptionals = pgTable("version_optionals", {
  id: serial("id").primaryKey(),
  versionId: integer("version_id").references(() => versions.id).notNull(),
  optionalId: integer("optional_id").references(() => optionals.id).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
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
  vehicles: many(vehicles),
  versionColors: many(versionColors),
  versionOptionals: many(versionOptionals)
}));

export const paintTypesRelations = relations(paintTypes, ({ many }) => ({
  colors: many(colors)
}));

export const colorsRelations = relations(colors, ({ one, many }) => ({
  paintType: one(paintTypes, { fields: [colors.paintTypeId], references: [paintTypes.id] }),
  vehicles: many(vehicles),
  versionColors: many(versionColors)
}));

export const versionColorsRelations = relations(versionColors, ({ one }) => ({
  version: one(versions, { fields: [versionColors.versionId], references: [versions.id] }),
  color: one(colors, { fields: [versionColors.colorId], references: [colors.id] })
}));

// Relações para tabelas de opcionais
export const optionalsRelations = relations(optionals, ({ many }) => ({
  versionOptionals: many(versionOptionals)
}));

export const versionOptionalsRelations = relations(versionOptionals, ({ one }) => ({
  version: one(versions, { fields: [versionOptionals.versionId], references: [versions.id] }),
  optional: one(optionals, { fields: [versionOptionals.optionalId], references: [optionals.id] })
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

export const paintTypeInsertSchema = createInsertSchema(paintTypes, {
  name: (schema) => schema.min(2, "O nome deve ter pelo menos 2 caracteres")
});
export type PaintTypeInsert = z.infer<typeof paintTypeInsertSchema>;
export const paintTypeSelectSchema = createSelectSchema(paintTypes);
export type PaintType = z.infer<typeof paintTypeSelectSchema>;

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

export const versionColorInsertSchema = createInsertSchema(versionColors);
export type VersionColorInsert = z.infer<typeof versionColorInsertSchema>;
export const versionColorSelectSchema = createSelectSchema(versionColors);
export type VersionColor = z.infer<typeof versionColorSelectSchema>;

export const vehicleInsertSchema = createInsertSchema(vehicles, {
  description: (schema) => schema.min(10, "A descrição deve ter pelo menos 10 caracteres")
});
export type VehicleInsert = z.infer<typeof vehicleInsertSchema>;
export const vehicleSelectSchema = createSelectSchema(vehicles);
export type Vehicle = z.infer<typeof vehicleSelectSchema>;

// Schemas para Opcionais
export const optionalInsertSchema = createInsertSchema(optionals, {
  name: (schema) => schema.min(2, "O nome deve ter pelo menos 2 caracteres"),
  description: (schema) => schema.optional()
});
export type OptionalInsert = z.infer<typeof optionalInsertSchema>;
export const optionalSelectSchema = createSelectSchema(optionals);
export type Optional = z.infer<typeof optionalSelectSchema>;

// Schemas para Versão-Opcionais
export const versionOptionalInsertSchema = createInsertSchema(versionOptionals);
export type VersionOptionalInsert = z.infer<typeof versionOptionalInsertSchema>;
export const versionOptionalSelectSchema = createSelectSchema(versionOptionals);
export type VersionOptional = z.infer<typeof versionOptionalSelectSchema>;

// Definição da tabela de configurações
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  label: text("label").notNull(),
  type: text("type").default("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const settingsInsertSchema = createInsertSchema(settings, {
  key: (schema) => schema.min(2, "Chave deve ter pelo menos 2 caracteres"),
  value: (schema) => schema.min(1, "Valor não pode estar vazio"),
  label: (schema) => schema.min(2, "Rótulo deve ter pelo menos 2 caracteres")
});
export type SettingsInsert = z.infer<typeof settingsInsertSchema>;
export const settingsSelectSchema = createSelectSchema(settings);
export type Settings = z.infer<typeof settingsSelectSchema>;

// Definição da tabela de Vendas Diretas
export const directSales = pgTable("direct_sales", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }).notNull(),
  brandId: integer("brand_id").references(() => brands.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const directSalesRelations = relations(directSales, ({ one }) => ({
  brand: one(brands, {
    fields: [directSales.brandId],
    references: [brands.id]
  })
}));

export const directSalesInsertSchema = createInsertSchema(directSales, {
  name: (schema) => schema.min(2, "Nome deve ter pelo menos 2 caracteres"),
  discountPercentage: (schema) => schema.min(0, "Percentual de desconto não pode ser negativo")
});
export type DirectSaleInsert = z.infer<typeof directSalesInsertSchema>;
export const directSalesSelectSchema = createSelectSchema(directSales);
export type DirectSale = z.infer<typeof directSalesSelectSchema>;

// Sistema de autenticação e controle de acesso
export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  roleId: integer("role_id").references(() => userRoles.id).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userRolesRelations = relations(userRoles, ({ many }) => ({
  users: many(users),
}));

export const usersRelations = relations(users, ({ one }) => ({
  role: one(userRoles, { fields: [users.roleId], references: [userRoles.id] }),
}));

export const userRoleInsertSchema = createInsertSchema(userRoles, {
  name: (schema) => schema.min(3, "Nome do papel deve ter pelo menos 3 caracteres")
});
export type UserRoleInsert = z.infer<typeof userRoleInsertSchema>;
export const userRoleSelectSchema = createSelectSchema(userRoles);
export type UserRole = z.infer<typeof userRoleSelectSchema>;

export const userInsertSchema = createInsertSchema(users, {
  name: (schema) => schema.min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: (schema) => schema.email("Email inválido"),
  password: (schema) => schema.min(6, "Senha deve ter pelo menos 6 caracteres"),
});
export type UserInsert = z.infer<typeof userInsertSchema>;
export const userSelectSchema = createSelectSchema(users);
export type User = z.infer<typeof userSelectSchema>;

// Tabela para permissões personalizadas por papel
export const customPermissions = pgTable("custom_permissions", {
  id: serial("id").primaryKey(),
  roleName: text("role_name").notNull(),
  permissions: json("permissions").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const customPermissionsInsertSchema = createInsertSchema(customPermissions);
export type CustomPermissionsInsert = z.infer<typeof customPermissionsInsertSchema>;
export const customPermissionsSelectSchema = createSelectSchema(customPermissions);
export type CustomPermissions = z.infer<typeof customPermissionsSelectSchema>;
