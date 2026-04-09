#!/usr/bin/env node
/**
 * Alexsander Xavier - 4338139
 * Script para inicializar o projeto completo
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname);
const dbPath = path.join(rootDir, 'prisma', 'dev.db');

console.log('🚀 Inicializando Raízes do Nordeste...');

// Verificar se o banco existe
const dbExists = fs.existsSync(dbPath);
if (!dbExists) {
  console.log('📊 Criando banco de dados...');
  try {
    execSync('cd "' + rootDir + '" && npx prisma db push --skip-generate', { stdio: 'inherit' });
    console.log('✅ Banco criado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao criar banco:', error.message);
    process.exit(1);
  }
}

// Seed do banco
console.log('🌱 Seedando banco de dados...');
try {
  execSync('cd "' + rootDir + '" && npm run db:seed', { stdio: 'inherit' });
  console.log('✅ Seed executado com sucesso');
} catch (error) {
  console.error('⚠️  Aviso ao executar seed:', error.message);
  // Não fazer exit aqui pois o seed pode ter parcialmente funcionado
}

console.log('✅ Inicialização concluída!');
console.log('');
console.log('Para iniciar o servidor:');
console.log('  > npm run start:dev');
console.log('');
console.log('Para iniciar o frontend:');
console.log('  > cd FrontEnd && npm run dev');
