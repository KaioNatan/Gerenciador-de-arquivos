import Arquivo from '../../../models/Arquivo';
import Usuario from '../../../models/Usuario';
import { verificarToken } from '../../../utils/auth';

export default async function handler(req, res) {
  try {
    // Autenticação
    await verificarToken(req, res);

    // GET: buscar arquivos pelo CPF
    if (req.method === "GET") {
      const { cpf } = req.query;
      if (!cpf) return res.status(400).json({ error: "CPF não informado" });

      const usuario = await Usuario.findOne({ where: { cpf } });
      if (!usuario) return res.status(404).json({ error: "Usuário não encontrado" });

      const arquivos = await Arquivo.findAll({ where: { usuario_id: usuario.id } });

      return res.status(200).json({
        usuario: { nome: usuario.nome, cpf: usuario.cpf, email: usuario.email },
        arquivos: arquivos.map(a => ({
          tipo_documento: a.tipo_documento,
          nome_original: a.nome_original,
          nome_armazenado: a.nome_armazenado,
          caminho_arquivo: a.caminho_arquivo,
          tamanho: a.tamanho,
          data_upload: a.data_upload,
        })),
      });
    }

    // POST: cadastrar usuário ou upload de arquivo
    if (req.method === "POST") {
      const { cpf, nome, email, tipo_documento, nome_original, caminho_arquivo, tamanho } = req.body;

      if (cpf && nome && email) {
        // Cadastrar usuário
        const [usuario, created] = await Usuario.findOrCreate({
          where: { cpf },
          defaults: { nome, email }
        });

        return res.status(created ? 201 : 200).json({ usuario, created });
      }

      if (cpf && tipo_documento && nome_original && caminho_arquivo) {
        // Vincular arquivo a um usuário existente
        const usuario = await Usuario.findOne({ where: { cpf } });
        if (!usuario) return res.status(404).json({ error: "Usuário não encontrado para vincular arquivo" });

        const arquivo = await Arquivo.create({
          usuario_id: usuario.id,
          tipo_documento,
          nome_original,
          nome_armazenado: nome_original,
          caminho_arquivo,
          tamanho,
        });

        return res.status(201).json({ arquivo });
      }

      return res.status(400).json({ error: "Dados insuficientes para cadastrar usuário ou arquivo" });
    }

    return res.status(405).json({ error: "Método não permitido" });

  } catch (error) {
    console.error("Erro na API /arquivos:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}
