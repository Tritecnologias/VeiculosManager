import { db } from "../db";
import { settings } from "../shared/schema";
import { eq } from "drizzle-orm";

async function setupCompanySettings() {
  console.log("Configurando opções de personalização da empresa...");

  // Lista de configurações que devem existir
  const requiredSettings = [
    {
      key: "company_name",
      value: "Vendas Corporativas",
      label: "Nome da empresa",
      type: "text",
    },
    {
      key: "company_logo_url",
      value: "",
      label: "URL do logo da empresa",
      type: "text",
    },
    {
      key: "remove_dealer_text",
      value: "false",
      label: "Remover texto 'Dealers' do logo padrão",
      type: "boolean",
    }
  ];

  // Verificar quais configurações já existem
  for (const setting of requiredSettings) {
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

  console.log("Configurações de empresa verificadas com sucesso!");
}

// Executar a função de configuração
setupCompanySettings()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Erro ao configurar settings:", error);
    process.exit(1);
  });