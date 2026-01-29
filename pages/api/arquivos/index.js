import nc from "next-connect";
import multer from "multer";
import Usuario from "../../../models/Usuario.js";
import Arquivo from "../../../models/Arquivo.js";

const upload = multer({
  storage: multer.diskStorage({
    destination: "./public/uploads",
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  }),
});

// Suporte híbrido para versões do next-connect
const apiRoute = nc({
  onError: (err, req, res) => {
    res.status(500).json({ error: `Erro no servidor: ${err.message}` });
  },
  onNoMatch: (req, res) => {
    res.status(405).json({ error: `Método ${req.method} não permitido` });
  },
});

apiRoute.use(upload.single("file"));

apiRoute.post(async (req, res) => {
  // O Multer coloca os textos em req.body e o arquivo em req.file
  const { cpf, tipo_documento, novo_nome_automatico } = req.body;

  if (!req.file) return res.status(400).json({ error: "Arquivo não enviado" });

  try {
    // 1. Busca ou cria o usuário
    let [usuario] = await Usuario.findOrCreate({
      where: { cpf },
      defaults: { nome: "Usuário Novo", email: `${cpf}@sistema.com`, senha: "123" }
    });

    // 2. SALVA NO BANCO COM O NOME FORMATADO
    const arquivo = await Arquivo.create({
      usuario_id: usuario.id,
      tipo_documento: tipo_documento,
      nome_original: req.file.originalname,
      // AQUI: Pegamos o nome que veio do frontend (ex: cpf_123.pdf)
      nome_armazenado: novo_nome_automatico,
      // O caminho aponta para o arquivo físico que o Multer salvou
      caminho_arquivo: `/uploads/${req.file.filename}`,
      tamanho: req.file.size,
      data_upload: new Date(),
    });

    res.status(201).json(arquivo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRoute.get(async (req, res) => {
  const { cpf } = req.query;
  try {
    const usuario = await Usuario.findOne({ where: { cpf } });
    if (!usuario) return res.status(404).json({ error: "Usuário não encontrado" });
    const arquivos = await Arquivo.findAll({ where: { usuario_id: usuario.id } });
    res.json({ usuario, arquivos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default apiRoute;

export const config = {
  api: { bodyParser: false },
};