import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const gerarToken = (usuario) => {
  return jwt.sign({ id: usuario.id, email: usuario.email }, "segredo123", { expiresIn: "1h" });
};

export const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Token ausente" });
  const token = authHeader.split(" ")[1];
  try {
    req.user = jwt.verify(token, "segredo123");
    next();
  } catch {
    res.status(403).json({ error: "Token inválido" });
  }
};
