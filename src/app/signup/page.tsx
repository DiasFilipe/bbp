// src/app/signup/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sign up');
      }

      // Redirect to the login page after successful signup
      router.push('/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-sm">
      <h1 className="text-4xl font-bold mb-8 text-center">Cadastrar</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Nome
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pm-blue focus:ring-pm-blue dark:bg-pm-light-dark dark:border-pm-light-gray"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pm-blue focus:ring-pm-blue dark:bg-pm-light-dark dark:border-pm-light-gray"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Senha
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pm-blue focus:ring-pm-blue dark:bg-pm-light-dark dark:border-pm-light-gray"
          />
        </div>
        
        {error && <p className="text-pm-red text-center">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-pm-blue text-white px-4 py-2 rounded-md text-base font-semibold hover:bg-opacity-90 disabled:bg-opacity-50"
        >
          {isSubmitting ? 'Criando conta...' : 'Cadastrar'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        Já tem uma conta?{' '}
        <Link href="/login" className="text-pm-blue hover:underline">
          Faça login
        </Link>
      </p>
    </div>
  );
}
