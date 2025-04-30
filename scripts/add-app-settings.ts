import { db } from '../db';
import { settings } from '../shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Adiciona as configurações relacionadas à personalização da aplicação
 */
async function addAppSettings() {
  try {
    console.log('Verificando e adicionando configurações da aplicação...');
    
    // Verificar se a configuração de nome da aplicação já existe
    const existingAppName = await db.query.settings.findFirst({
      where: eq(settings.key, 'app_name')
    });
    
    // Adicionar configuração de nome da aplicação se não existir
    if (!existingAppName) {
      await db.insert(settings).values({
        key: 'app_name',
        value: '',
        label: 'Nome da Aplicação',
        type: 'text'
      });
      console.log('Configuração de nome da aplicação adicionada.');
    } else {
      console.log('Configuração de nome da aplicação já existe.');
    }
    
    // Verificar se a configuração de favicon já existe
    const existingAppFavicon = await db.query.settings.findFirst({
      where: eq(settings.key, 'app_favicon')
    });
    
    // Adicionar configuração de favicon se não existir
    if (!existingAppFavicon) {
      await db.insert(settings).values({
        key: 'app_favicon',
        value: '',
        label: 'URL do Favicon',
        type: 'text'
      });
      console.log('Configuração de favicon da aplicação adicionada.');
    } else {
      console.log('Configuração de favicon da aplicação já existe.');
    }
    
    console.log('Configurações da aplicação verificadas e atualizadas com sucesso!');
  } catch (error) {
    console.error('Erro ao adicionar configurações da aplicação:', error);
  } finally {
    process.exit(0);
  }
}

// Executar a função
addAppSettings();