// config/database.js
import { Sequelize } from "sequelize";

const sequelize = new Sequelize("gerenciador", "root", "senha123", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

// Força a autenticação e sincronização
sequelize.authenticate()
  .then(() => sequelize.sync())
  .then(() => console.log("Tabelas prontas!"))
  .catch(err => console.log("Erro ao sincronizar:", err));

export default sequelize;