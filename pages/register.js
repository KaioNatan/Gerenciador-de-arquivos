import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Register() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    cpf: ''
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Usuário criado com sucesso!');
        router.push('/login'); // Redireciona para o login após sucesso
      } else {
        setError(data.error || 'Erro ao registrar usuário');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px', fontFamily: 'Arial' }}>
      <h1>Criar Nova Conta</h1>
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '350px', padding: '20px', border: '1px solid #ccc', borderRadius: '10px' }}>
        
        <input 
          type="text" placeholder="Nome Completo" required
          value={formData.nome}
          onChange={(e) => setFormData({...formData, nome: e.target.value})}
          style={{ padding: '10px' }}
        />

        <input 
          type="text" placeholder="CPF (Apenas números)" required
          value={formData.cpf}
          onChange={(e) => setFormData({...formData, cpf: e.target.value})}
          style={{ padding: '10px' }}
        />

        <input 
          type="email" placeholder="Email" required
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          style={{ padding: '10px' }}
        />

        <input 
          type="password" placeholder="Senha" required
          value={formData.senha}
          onChange={(e) => setFormData({...formData, senha: e.target.value})}
          style={{ padding: '10px' }}
        />

        {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}

        <button type="submit" style={{ padding: '10px', backgroundColor: '#4a4a8c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Cadastrar
        </button>

        <p style={{ textAlign: 'center', fontSize: '14px' }}>
          Já tem uma conta? <a href="/login">Faça Login</a>
        </p>
      </form>
    </div>
  );
}