import { db } from "../db";
import { settings } from "../shared/schema";
import { eq } from "drizzle-orm";

async function addAppSettings() {
  console.log("Adicionando configurações de aplicativo...");

  // Lista de configurações que devem existir
  const appSettings = [
    {
      key: "app_name",
      value: "Vehicle Management System",
      label: "Nome da Aplicação",
      type: "text",
    },
    {
      key: "app_favicon",
      value: "",
      label: "URL do Favicon",
      type: "text",
    }
  ];

  // Verificar quais configurações já existem
  for (const setting of appSettings) {
    const existingSetting = await db.query.settings.findFirst({
      where: eq(settings.key, setting.key)
    });

    if (!existingSetting) {
      console.log(`Adicionando configuração: ${setting.key}`);
      await db.insert(settings).values(setting);
    } else {
      console.log(`Configuração já existe: ${setting.key}`);
    }
  }

  console.log("Configurações de aplicativo adicionadas com sucesso!");
}

// Executar a função de configuração
addAppSettings()
  .then(() => {
    console.log("Processo concluído com sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Erro ao configurar settings:", error);
    process.exit(1);
  });