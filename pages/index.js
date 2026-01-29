"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
    const [token, setToken] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const router = useRouter();

    const [novoCpf, setNovoCpf] = useState("");
    const [cpfBusca, setCpfBusca] = useState("");
    const [resultado, setResultado] = useState(null);
    const [file, setFile] = useState(null);
    const [tipo, setTipo] = useState("CPF");

    useEffect(() => {
        const tokenSalvo = localStorage.getItem("token");
        if (!tokenSalvo) {
            router.push("/login");
        } else {
            setToken(tokenSalvo);
            setCarregando(false);
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/login");
    };

    const handleBusca = async () => {
        if (!cpfBusca) return alert("Digite um CPF!");
        const res = await fetch(`/api/arquivos?cpf=${cpfBusca}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) return alert(data.error);
        setResultado(data);
    };

    const gerarNomeAutomatico = (tipoDoc, cpfUsuario) => {
        const mapTipos = {
            "CPF": `cpf_${cpfUsuario}.pdf`,
            "RG/CIN": `rg_${cpfUsuario}.pdf`,
            "Comprovante Escolar-Histórico": `historico_${cpfUsuario}.pdf`,
            "Certidão de Nascimento": `certidao_${cpfUsuario}.pdf`,
            "Comprovante de Residência": `residencia_${cpfUsuario}.pdf`,
        };
        return mapTipos[tipoDoc] || `documento_${cpfUsuario}.pdf`;
    };

    const handleCadastrarPdf = async () => {
        if (!novoCpf || !file) return alert("Digite o CPF e escolha um arquivo PDF!");

        const formData = new FormData();
        formData.append("cpf", novoCpf);
        formData.append("tipo_documento", tipo);
        formData.append("novo_nome_automatico", gerarNomeAutomatico(tipo, novoCpf));
        formData.append("file", file);

        const res = await fetch("/api/arquivos", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        });

        if (!res.ok) {
            const data = await res.json();
            return alert(data.error);
        }

        alert("Arquivo PDF cadastrado com sucesso!");
        setFile(null);
        setNovoCpf("");
        handleBusca();
    };

    const handleDeletar = async (id) => {
        if (!confirm("Tem certeza que deseja deletar este arquivo?")) return;
        const res = await fetch(`/api/arquivos/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.status !== 204) return alert("Erro ao deletar");
        handleBusca();
    };

    const handleUpdate = async (id) => {
        const novoTipo = prompt("Digite o novo tipo do documento (Ex: RG, CPF, Histórico):");
        if (!novoTipo) return;

        const res = await fetch(`/api/arquivos/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ tipo_documento: novoTipo })
        });

        if (res.ok) {
            alert("Tipo atualizado!");
            handleBusca();
        } else {
            alert("Erro ao atualizar");
        }
    };

    if (carregando) return <p>Carregando...</p>;

    return (
        <div className="container">
            <header>
                <h1>📄 Gerenciador de Arquivos</h1>
                <p>Envie, busque e organize seus documentos PDF de forma simples</p>
                <button onClick={handleLogout} className="btn-logout">Sair</button>
            </header>

            <main>
                <section className="buscar">
                    <label htmlFor="busca-cpf" className="sr-only">Buscar por CPF:</label>
                    <input
                        id="busca-cpf"
                        placeholder="Digite o CPF para buscar"
                        value={cpfBusca}
                        onChange={(e) => setCpfBusca(e.target.value)}
                    />
                    <button onClick={handleBusca}>Buscar Documentos</button>
                </section>

                <section className="novo-arquivo">
                    <h3>Cadastrar Novo PDF</h3>
                    <div className="form-group">
                        <input
                            aria-label="CPF para cadastro"
                            placeholder="CPF do titular"
                            value={novoCpf}
                            onChange={(e) => setNovoCpf(e.target.value)}
                        />
                        <select
                            aria-label="Tipo de documento"
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value)}
                        >
                            <option>CPF</option>
                            <option>RG/CIN</option>
                            <option>Comprovante Escolar-Histórico</option>
                            <option>Certidão de Nascimento</option>
                            <option>Comprovante de Residência</option>
                        </select>
                        <input
                            type="file"
                            accept=".pdf"
                            aria-label="Selecionar PDF"
                            onChange={(e) => setFile(e.target.files[0])}
                        />
                        <button onClick={handleCadastrarPdf} className="btn-success">Cadastrar PDF</button>
                    </div>
                </section>

                {resultado && (
                    <section className="lista">
                        <h2>Usuário: {resultado.usuario.nome || "Não identificado"} | CPF: {resultado.usuario.cpf}</h2>
                        <div className="arquivos-grid">
                            {resultado.arquivos.length > 0 ? (
                                resultado.arquivos.map((a) => (
                                    <div className="card" key={a.id}>
                                        <div className="arquivo-info">
                                            <strong>{a.tipo_documento}:</strong>
                                            {/* Link para o arquivo usando o nome limpo armazenado no banco */}
                                            <a href={a.caminho_arquivo} target="_blank" rel="noopener noreferrer">
                                                {a.nome_armazenado}
                                            </a>
                                        </div>
                                        <div className="arquivo-actions">
                                            <button
                                                onClick={() => handleUpdate(a.id)}
                                                className="btn-edit"
                                                aria-label={`Editar tipo do documento ${a.tipo_documento}`}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDeletar(a.id)}
                                                className="btn-delete"
                                                aria-label={`Deletar documento ${a.tipo_documento}`}
                                            >
                                                Deletar
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>Nenhum arquivo encontrado para este CPF.</p>
                            )}
                        </div>
                    </section>
                )}
            </main>

            <style jsx>{`
                .container { font-family: sans-serif; background: #f4f4f9; min-height: 100vh; padding: 40px; color: #333; }
                header { text-align: center; margin-bottom: 40px; }
                h1 { color: #4a4a8c; }
                .btn-logout { background: #999; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; margin-top: 10px; }
                .buscar, .novo-arquivo { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-bottom: 20px; text-align: center; }
                input, select { padding: 10px; border-radius: 5px; border: 1px solid #ccc; margin: 5px; }
                button { padding: 10px 20px; border-radius: 5px; background: #4a4a8c; color: white; border: none; cursor: pointer; font-weight: bold; }
                button:hover { opacity: 0.9; }
                button:focus { outline: 3px solid #ffc107; }
                .arquivos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-top: 20px; }
                .card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: flex; flex-direction: column; justify-content: space-between; }
                .arquivo-info a { display: block; margin-top: 10px; color: #4a4a8c; font-weight: bold; word-break: break-all; }
                .arquivo-actions { margin-top: 15px; display: flex; gap: 10px; border-top: 1px solid #eee; padding-top: 10px; }
                .btn-edit { background: #ffc107; color: #333; flex: 1; }
                .btn-delete { background: #d7263d; color: white; flex: 1; }
                .btn-success { background: #28a745; }
                .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0; }
            `}</style>
        </div>
    );
}