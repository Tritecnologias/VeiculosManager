import { db } from "./index";
import { 
  brands, 
  models, 
  versions, 
  colors, 
  vehicles,
  userRoles,
  users,
  BrandInsert,
  ModelInsert,
  VersionInsert,
  ColorInsert,
  VehicleInsert,
  UserRoleInsert,
  UserInsert
} from "@shared/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "../server/auth";

async function seed() {
  try {
    console.log("Starting database seeding...");

    // Seed brands
    const brandData: BrandInsert[] = [
      { name: "Volkswagen" },
      { name: "Chevrolet" },
      { name: "Fiat" },
      { name: "Toyota" },
      { name: "Hyundai" }
    ];

    for (const brand of brandData) {
      const existingBrand = await db.query.brands.findFirst({
        where: eq(brands.name, brand.name)
      });

      if (!existingBrand) {
        await db.insert(brands).values(brand);
        console.log(`Added brand: ${brand.name}`);
      }
    }

    // Get all brands for reference
    const allBrands = await db.query.brands.findMany();
    const brandMap = new Map(allBrands.map(brand => [brand.name, brand.id]));

    // Seed models
    const modelData: (Omit<ModelInsert, 'brandId'> & { brandName: string })[] = [
      { name: "Virtus", brandName: "Volkswagen" },
      { name: "Polo", brandName: "Volkswagen" },
      { name: "T-Cross", brandName: "Volkswagen" },
      { name: "Nivus", brandName: "Volkswagen" },
      { name: "Jetta", brandName: "Volkswagen" },
      { name: "Onix", brandName: "Chevrolet" },
      { name: "Tracker", brandName: "Chevrolet" },
      { name: "Spin", brandName: "Chevrolet" },
      { name: "Cruze", brandName: "Chevrolet" },
      { name: "Pulse", brandName: "Fiat" },
      { name: "Argo", brandName: "Fiat" },
      { name: "Corolla", brandName: "Toyota" },
      { name: "Corolla Cross", brandName: "Toyota" },
      { name: "HB20", brandName: "Hyundai" },
      { name: "Creta", brandName: "Hyundai" }
    ];

    for (const model of modelData) {
      const brandId = brandMap.get(model.brandName);
      if (!brandId) continue;

      const existingModel = await db.query.models.findFirst({
        where: eq(models.name, model.name)
      });

      if (!existingModel) {
        await db.insert(models).values({
          name: model.name,
          brandId
        });
        console.log(`Added model: ${model.name} (${model.brandName})`);
      }
    }

    // Get all models for reference
    const allModels = await db.query.models.findMany({
      with: {
        brand: true
      }
    });
    
    const modelMap = new Map(
      allModels.map(model => [`${model.name}-${model.brand.name}`, model.id])
    );

    // Seed versions
    const versionData: (Omit<VersionInsert, 'modelId'> & { modelName: string, brandName: string })[] = [
      { name: "Sense TSI 116CV", modelName: "Virtus", brandName: "Volkswagen" },
      { name: "Comfortline TSI 116CV", modelName: "Virtus", brandName: "Volkswagen" },
      { name: "Highline TSI 150CV", modelName: "Virtus", brandName: "Volkswagen" },
      { name: "Track 1.0", modelName: "Polo", brandName: "Volkswagen" },
      { name: "MPI 1.0", modelName: "Polo", brandName: "Volkswagen" },
      { name: "TSI 1.0", modelName: "Polo", brandName: "Volkswagen" },
      { name: "GTS 1.4", modelName: "Polo", brandName: "Volkswagen" },
      { name: "200 TSI", modelName: "T-Cross", brandName: "Volkswagen" },
      { name: "Comfortline TSI", modelName: "T-Cross", brandName: "Volkswagen" },
      { name: "Highline TSI", modelName: "T-Cross", brandName: "Volkswagen" },
      { name: "LT 1.0", modelName: "Onix", brandName: "Chevrolet" },
      { name: "Premier 1.0 Turbo", modelName: "Onix", brandName: "Chevrolet" },
      { name: "LTZ 1.0 Turbo", modelName: "Onix", brandName: "Chevrolet" },
      { name: "Trekking 1.3", modelName: "Argo", brandName: "Fiat" },
      { name: "Drive 1.0", modelName: "Argo", brandName: "Fiat" },
      { name: "GLi 2.0", modelName: "Corolla", brandName: "Toyota" },
      { name: "XEi 2.0", modelName: "Corolla", brandName: "Toyota" },
      { name: "Sense 1.0", modelName: "HB20", brandName: "Hyundai" },
      { name: "Comfort 1.0", modelName: "HB20", brandName: "Hyundai" },
      { name: "Limited 1.0 Turbo", modelName: "HB20", brandName: "Hyundai" }
    ];

    for (const version of versionData) {
      const modelId = modelMap.get(`${version.modelName}-${version.brandName}`);
      if (!modelId) continue;

      const existingVersion = await db.query.versions.findFirst({
        where: eq(versions.name, version.name)
      });

      if (!existingVersion) {
        await db.insert(versions).values({
          name: version.name,
          modelId
        });
        console.log(`Added version: ${version.name} (${version.modelName} ${version.brandName})`);
      }
    }

    // Seed colors
    const colorData: ColorInsert[] = [
      { 
        name: "Preto Ninja", 
        hexCode: "#000000", 
        additionalPrice: 0,
        imageUrl: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80"
      },
      { 
        name: "Branco Cristal", 
        hexCode: "#FFFFFF", 
        additionalPrice: 900,
        imageUrl: "https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80"
      },
      { 
        name: "Cinza Platinum", 
        hexCode: "#808080", 
        additionalPrice: 1650,
        imageUrl: "https://images.unsplash.com/photo-1612997951749-ae9c3fffaef3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80"
      },
      { 
        name: "Azul Biscay", 
        hexCode: "#0073CF", 
        additionalPrice: 1650,
        imageUrl: "https://images.unsplash.com/photo-1516298252535-cf2ac5147b9b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80"
      },
      { 
        name: "Prata Sirius", 
        hexCode: "#C0C0C0", 
        additionalPrice: 1650,
        imageUrl: "https://images.unsplash.com/photo-1669894762347-87ef99eeb00d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80"
      },
      { 
        name: "Vermelho Tornado", 
        hexCode: "#FF0000", 
        additionalPrice: 1950,
        imageUrl: "https://images.unsplash.com/photo-1544304071-d406d7748a71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80"
      }
    ];

    for (const color of colorData) {
      const existingColor = await db.query.colors.findFirst({
        where: eq(colors.name, color.name)
      });

      if (!existingColor) {
        await db.insert(colors).values(color);
        console.log(`Added color: ${color.name}`);
      }
    }

    // Get a version for seeding the first vehicle
    const virtusVersion = await db.query.versions.findFirst({
      where: eq(versions.name, "Sense TSI 116CV"),
      with: {
        model: {
          with: {
            brand: true
          }
        }
      }
    });

    // Get a color for seeding
    const blackColor = await db.query.colors.findFirst({
      where: eq(colors.name, "Preto Ninja")
    });

    // Seed first vehicle if we have version and color
    if (virtusVersion && blackColor) {
      const existingVehicle = await db.query.vehicles.findFirst({
        where: eq(vehicles.versionId, virtusVersion.id)
      });

      if (!existingVehicle) {
        const vehicleData: VehicleInsert = {
          versionId: virtusVersion.id,
          colorId: blackColor.id,
          year: 2025,
          publicPrice: 105990,
          situation: "available",
          description: "Volkswagen Virtus Sense TSI 1.0 Flex 2025 - Veículo com excelente eficiência de combustível, design moderno e espaçoso porta-malas.",
          engine: "1.0 TSI",
          fuelType: "flex",
          transmission: "automatic",
          isActive: true,
          pcdIpiIcms: 93695.15,
          pcdIpi: 102176.21,
          taxiIpiIcms: 89915.07,
          taxiIpi: 102176.21
        };

        await db.insert(vehicles).values(vehicleData);
        console.log(`Added vehicle: ${virtusVersion.model.brand.name} ${virtusVersion.model.name} ${virtusVersion.name}`);
      }
    }

    // Seed second vehicle - Polo
    const poloVersion = await db.query.versions.findFirst({
      where: eq(versions.name, "Track 1.0"),
      with: {
        model: {
          with: {
            brand: true
          }
        }
      }
    });

    const silverColor = await db.query.colors.findFirst({
      where: eq(colors.name, "Prata Sirius")
    });

    if (poloVersion && silverColor) {
      const existingVehicle = await db.query.vehicles.findFirst({
        where: eq(vehicles.versionId, poloVersion.id)
      });

      if (!existingVehicle) {
        const vehicleData: VehicleInsert = {
          versionId: poloVersion.id,
          colorId: silverColor.id,
          year: 2025,
          publicPrice: 89990,
          situation: "available",
          description: "Volkswagen Polo Track 1.0 Flex Manual 2025 - Compacto, econômico e confiável. Ideal para o dia a dia na cidade.",
          engine: "1.0",
          fuelType: "flex",
          transmission: "manual",
          isActive: true,
          pcdIpiIcms: 79191.2,
          pcdIpi: 86390.4,
          taxiIpiIcms: 76491.5,
          taxiIpi: 86390.4
        };

        await db.insert(vehicles).values(vehicleData);
        console.log(`Added vehicle: ${poloVersion.model.brand.name} ${poloVersion.model.name} ${poloVersion.name}`);
      }
    }

    // Seed third vehicle - T-Cross
    const tCrossVersion = await db.query.versions.findFirst({
      where: eq(versions.name, "Comfortline TSI"),
      with: {
        model: {
          with: {
            brand: true
          }
        }
      }
    });

    const blueColor = await db.query.colors.findFirst({
      where: eq(colors.name, "Azul Biscay")
    });

    if (tCrossVersion && blueColor) {
      const existingVehicle = await db.query.vehicles.findFirst({
        where: eq(vehicles.versionId, tCrossVersion.id)
      });

      if (!existingVehicle) {
        const vehicleData: VehicleInsert = {
          versionId: tCrossVersion.id,
          colorId: blueColor.id,
          year: 2025,
          publicPrice: 149990,
          situation: "coming-soon",
          description: "Volkswagen T-Cross Comfortline TSI 1.4 Automático 2025 - SUV compacto com excelente espaço interno, tecnologia embarcada e performance.",
          engine: "1.4 TSI",
          fuelType: "flex",
          transmission: "automatic",
          isActive: true,
          pcdIpiIcms: 131991.2,
          pcdIpi: 143990.4,
          taxiIpiIcms: 127491.5,
          taxiIpi: 143990.4
        };

        await db.insert(vehicles).values(vehicleData);
        console.log(`Added vehicle: ${tCrossVersion.model.brand.name} ${tCrossVersion.model.name} ${tCrossVersion.name}`);
      }
    }

    // Seed user roles (níveis de acesso)
    console.log("Seeding user roles...");
    const roleData: UserRoleInsert[] = [
      { 
        name: "Usuário", 
        description: "Usuário comum com acesso somente de visualização" 
      },
      { 
        name: "Cadastrador", 
        description: "Usuário com permissão para criar e editar registros, mas sem acesso administrativo" 
      },
      { 
        name: "Administrador", 
        description: "Usuário com acesso completo ao sistema, incluindo gerenciamento de usuários" 
      }
    ];

    for (const role of roleData) {
      const existingRole = await db.query.userRoles.findFirst({
        where: eq(userRoles.name, role.name)
      });

      if (!existingRole) {
        await db.insert(userRoles).values(role);
        console.log(`Added user role: ${role.name}`);
      }
    }

    // Get admin role for reference
    const adminRole = await db.query.userRoles.findFirst({
      where: eq(userRoles.name, "Administrador")
    });

    if (adminRole) {
      // Seed admin user
      console.log("Seeding administrator user...");
      
      const adminEmail = "wanderson.martins.silva@gmail.com";
      const existingAdmin = await db.query.users.findFirst({
        where: eq(users.email, adminEmail)
      });

      if (!existingAdmin) {
        const password = await hashPassword("admin123"); // Senha temporária que deverá ser alterada no primeiro acesso
        
        const adminUser: UserInsert = {
          name: "Wanderson Martins Silva",
          email: adminEmail,
          password,
          roleId: adminRole.id,
          isActive: true
        };

        await db.insert(users).values(adminUser);
        console.log(`Added administrator user: ${adminEmail}`);
      }
    }

    console.log("Database seeding completed successfully!");
  }
  catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
