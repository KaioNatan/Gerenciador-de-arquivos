import Usuario from "../../../models/Usuario";
import bcrypt from "bcryptjs";
import { gerarToken } from "../../../utils/auth";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { email, senha } = req.body;
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) return res.status(400).json({ error: "Usuário não encontrado" });

    const valido = await bcrypt.compare(senha, usuario.senha);
    if (!valido) return res.status(400).json({ error: "Senha incorreta" });

    const token = gerarToken(usuario);
    res.json({ token });
  } else {
    res.status(405).end("Método não permitido");
  }
}
