import { useState, useEffect } from "react";

export default function Arquivos({ token }) {
  const [file, setFile] = useState(null);
  const [tipo, setTipo] = useState("CPF");
  const [cpfBusca, setCpfBusca] = useState("");
  const [resultado, setResultado] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert("Escolha um arquivo!");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("tipo_documento", tipo);

    const res = await fetch("http://localhost:3000/api/arquivos/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    const data = await res.json();
    alert(`Arquivo enviado: ${data.nome_armazenado}`);
    setFile(null);
  };

  const handleBusca = async () => {
    const res = await fetch(`http://localhost:3000/api/arquivos/busca?cpf=${cpfBusca}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setResultado(data);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Upload de Documentos</h1>
      <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
        <option>CPF</option>
        <option>RG/CIN</option>
        <option>Historico Escolar</option>
        <option>Certidao Nascimento</option>
        <option>Comprovante Residencia</option>
      </select>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>

      <h2>Buscar Documentos por CPF</h2>
      <input placeholder="Digite o CPF" value={cpfBusca} onChange={(e) => setCpfBusca(e.target.value)} />
      <button onClick={handleBusca}>Buscar</button>

      {resultado && (
        <div>
          <h3>Usuário: {resultado.usuario.nome} | CPF: {resultado.usuario.cpf}</h3>
          <ul>
            {resultado.arquivos.map(a => (
              <li key={a.id}>
                {a.tipo_documento}: <a href={a.caminho_arquivo} target="_blank">{a.nome_armazenado}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
