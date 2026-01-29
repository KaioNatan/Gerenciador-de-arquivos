import { useState } from 'react';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', senha: '' });
  const [mensagem, setMensagem] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token); // Salva o JWT para a Home usar
        router.push('/'); // Redireciona para a Dashboard (index.js)
      } else {
        setMensagem(`Erro: ${data.error}`);
      }
    } catch (err) {
      setMensagem('Erro ao conectar com o servidor.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px', fontFamily: 'Arial' }}>
      <h1>Acessar Gerenciador</h1>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '350px', padding: '20px', border: '1px solid #ccc', borderRadius: '10px', backgroundColor: '#fff' }}>
        
        <input 
          type="email" 
          placeholder="Seu email" 
          required
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})} 
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        
        <input 
          type="password" 
          placeholder="Sua senha" 
          required
          value={formData.senha}
          onChange={(e) => setFormData({...formData, senha: e.target.value})} 
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />

        {mensagem && <p style={{ color: 'red', fontSize: '14px', textAlign: 'center' }}>{mensagem}</p>}

        <button type="submit" style={{ padding: '10px', backgroundColor: '#4a4a8c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          Entrar
        </button>

        <p style={{ textAlign: 'center', fontSize: '14px', marginTop: '10px' }}>
          Não tem conta? <a href="/register" style={{ color: '#4a4a8c', fontWeight: 'bold', textDecoration: 'none' }}>Registre-se agora</a>
        </p>
      </form>
    </div>
  );
}