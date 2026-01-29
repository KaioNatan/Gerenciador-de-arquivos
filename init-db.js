// init-db.js
import sequelize from "./config/database.js";
import Usuario from "./models/Usuario.js";
import Arquivo from "./models/Arquivo.js";

async function init() {
  try {
    console.log("⏳ Conectando ao banco de dados...");
    await sequelize.authenticate();
    console.log("✅ Conexão estabelecida com sucesso.");

    console.log("⏳ Sincronizando modelos (criando tabelas)...");
    // force: false evita apagar dados existentes. 
    // alter: true atualiza as colunas se você mudou algo no model.
    await sequelize.sync({ alter: true });
    
    console.log("🚀 Banco de dados pronto para uso!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao inicializar o banco:", error);
    process.exit(1);
  }
}

init();