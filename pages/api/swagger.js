import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import express from "express";

const app = express();

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Gerenciador de Arquivos",
      version: "1.0.0",
      description: "Gerenciador de arquivos PDF com CPF, RG, Histórico Escolar, Certidão e Comprovante de Residência",
    },
    servers: [{ url: "http://localhost:3000/api" }],
  },
  apis: ["./pages/api/**/*.js"], // Lê todos os comentários Swagger nos arquivos da pasta API
};

const swaggerSpec = swaggerJsdoc(options);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
