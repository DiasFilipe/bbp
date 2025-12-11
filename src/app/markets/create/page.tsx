// src/app/markets/create/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateMarketPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [resolveAt, setResolveAt] = useState('');
  const [outcomes, setOutcomes] = useState(['', '']); // Start with two outcome fields
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAddOutcome = () => {
    setOutcomes([...outcomes, '']);
  };

  const handleOutcomeChange = (index: number, value: string) => {
    const newOutcomes = [...outcomes];
    newOutcomes[index] = value;
    setOutcomes(newOutcomes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Basic validation
    if (!title || !description || !category || !resolveAt || outcomes.some(o => !o)) {
      setError('Please fill in all fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/markets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          category,
          resolveAt: new Date(resolveAt).toISOString(),
          outcomes: outcomes.map(title => ({ title })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create market');
      }

      // Redirect to the homepage or the new market page after creation
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-4xl font-bold mb-8">Criar Novo Mercado</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium">
            Título
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pm-blue focus:ring-pm-blue dark:bg-pm-light-dark dark:border-pm-light-gray"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Descrição
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pm-blue focus:ring-pm-blue dark:bg-pm-light-dark dark:border-pm-light-gray"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium">
            Categoria
          </label>
          <input
            id="category"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pm-blue focus:ring-pm-blue dark:bg-pm-light-dark dark:border-pm-light-gray"
          />
        </div>

        <div>
          <label htmlFor="resolveAt" className="block text-sm font-medium">
            Data de Resolução
          </label>
          <input
            id="resolveAt"
            type="datetime-local"
            value={resolveAt}
            onChange={(e) => setResolveAt(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pm-blue focus:ring-pm-blue dark:bg-pm-light-dark dark:border-pm-light-gray"
          />
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Resultados Possíveis</h3>
          <div className="space-y-2">
            {outcomes.map((outcome, index) => (
              <input
                key={index}
                type="text"
                value={outcome}
                onChange={(e) => handleOutcomeChange(index, e.target.value)}
                placeholder={`Resultado ${index + 1}`}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pm-blue focus:ring-pm-blue dark:bg-pm-light-dark dark:border-pm-light-gray"
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddOutcome}
            className="mt-2 text-sm text-pm-blue hover:underline"
          >
            + Adicionar outro resultado
          </button>
        </div>
        
        {error && <p className="text-pm-red">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-pm-blue text-white px-4 py-2 rounded-md text-base font-semibold hover:bg-opacity-90 disabled:bg-opacity-50"
        >
          {isSubmitting ? 'Criando...' : 'Criar Mercado'}
        </button>
      </form>
    </div>
  );
}
