import Usuario from "../../../models/Usuario";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // 1. Pegue o CPF também vindo do frontend
      const { nome, email, senha, cpf } = req.body;

      // Validação simples
      if (!cpf) return res.status(400).json({ error: "O CPF é obrigatório" });

      const hash = bcrypt.hashSync(senha, 10);

      // 2. Inclua o CPF na criação do registro no MySQL
      const usuario = await Usuario.create({ 
        nome, 
        email, 
        senha: hash,
        cpf // Certifique-se que o campo no models/Usuario.js tem esse nome
      });

      res.status(201).json({ 
        id: usuario.id, 
        nome: usuario.nome, 
        email: usuario.email,
        cpf: usuario.cpf 
      });
    } catch (error) {
      // Caso o e-mail ou CPF já existam (duplicidade)
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: "E-mail ou CPF já cadastrado" });
      }
      res.status(500).json({ error: "Erro ao criar usuário: " + error.message });
    }
  } else {
    res.status(405).end("Método não permitido");
  }
}