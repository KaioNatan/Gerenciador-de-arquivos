import nextConnect from 'next-connect';
import multer from 'multer';
import path from 'path';
import Arquivo from '../../../models/Arquivo';
import Usuario from '../../../models/Usuario';
import { verificarToken } from '../../../utils/auth';

// Configurar storage
const storage = multer.diskStorage({
  destination: './public/uploads',
  filename: async (req, file, cb) => {
    const usuario = await Usuario.findByPk(req.user.id);
    const tipo = req.body.tipo_documento;

    let prefixo;
    switch(tipo) {
      case 'CPF': prefixo = `cpf_${usuario.cpf}`; break;
      case 'RG/CIN': prefixo = `rg_${usuario.cpf}`; break;
      case 'Historico Escolar': prefixo = `historico_${usuario.cpf}`; break;
      case 'Certidao Nascimento': prefixo = `certidao_${usuario.cpf}`; break;
      case 'Comprovante Residencia': prefixo = `residencia_${usuario.cpf}`; break;
      default: prefixo = `doc_${usuario.cpf}`;
    }

    const extensao = path.extname(file.originalname).toLowerCase();
    if (extensao !== ".pdf") {
      return cb(new Error("Apenas arquivos PDF são permitidos"));
    }

    const nome_armazenado = `${prefixo}${extensao}`;
    cb(null, nome_armazenado);
  }
});


const upload = multer({ storage });

const apiRoute = nextConnect();

// Autenticação
apiRoute.use(async (req, res, next) => {
    await verificarToken(req, res, next);
});

// POST Upload
apiRoute.post(upload.single('file'), async (req, res) => {
    const { tipo_documento } = req.body;
    const usuario_id = req.user.id;
    const { originalname, filename, size } = req.file;

    const arquivo = await Arquivo.create({
        usuario_id,
        tipo_documento,
        nome_original: originalname,
        nome_armazenado: filename,
        caminho_arquivo: `/uploads/${filename}`,
        tamanho: size
    });

    res.status(201).json(arquivo);
});

export default apiRoute;
export const config = { api: { bodyParser: false } };
