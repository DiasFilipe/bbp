"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_LIQUIDITY_PARAMETER } from "@/lib/constants";

export default function CreateMarketPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [resolveAt, setResolveAt] = useState("");
  const [outcomes, setOutcomes] = useState(["", ""]); // Start with two outcome fields
  const [liquidityParameter, setLiquidityParameter] = useState(
    DEFAULT_LIQUIDITY_PARAMETER.toString()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleOutcomeChange = (index: number, value: string) => {
    const newOutcomes = [...outcomes];
    newOutcomes[index] = value;
    setOutcomes(newOutcomes);
  };

  const addOutcomeField = () => {
    setOutcomes([...outcomes, ""]);
  };

  const removeOutcomeField = (index: number) => {
    const newOutcomes = outcomes.filter((_, i) => i !== index);
    setOutcomes(newOutcomes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Basic client-side validation (more robust validation will be added later)
    if (!title || !description || !category || !resolveAt || outcomes.filter(o => o.trim() !== "").length < 2) {
      setError("Preencha todos os campos e informe pelo menos dois resultados.");
      setIsLoading(false);
      return;
    }

    const liquidityNumber = Number(liquidityParameter);
    if (!Number.isFinite(liquidityNumber) || liquidityNumber <= 0) {
      setError("Informe um parametro de liquidez valido (maior que zero).");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/markets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          category,
          resolveAt: new Date(resolveAt).toISOString(), // Ensure ISO format for backend
          outcomes: outcomes.filter(o => o.trim() !== "").map(o => ({ title: o })), // Map to { title: string } objects
          liquidityParameter: liquidityNumber,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao criar o mercado.");
      }

      router.push("/markets"); // Redirect to markets page on success
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Criar novo mercado</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        {error && <p className="text-red-500 text-center">{error}</p>}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Titulo
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Descricao
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          ></textarea>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Categoria
          </label>
          <input
            type="text"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>

        <div>
          <label htmlFor="resolveAt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Data e hora de resolucao
          </label>
          <input
            type="datetime-local"
            id="resolveAt"
            value={resolveAt}
            onChange={(e) => setResolveAt(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>

        <div>
          <label htmlFor="liquidityParameter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Parametro de liquidez (LMSR)
          </label>
          <input
            type="number"
            id="liquidityParameter"
            min="1"
            step="1"
            value={liquidityParameter}
            onChange={(e) => setLiquidityParameter(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Valores maiores deixam os precos menos volateis.
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Resultados (minimo dois)</label>
          {outcomes.map((outcome, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={outcome}
                onChange={(e) => handleOutcomeChange(index, e.target.value)}
                placeholder={`Resultado ${index + 1}`}
                className="block w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required={index < 2} // Make first two outcomes required
              />
              {outcomes.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOutcomeField(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Remover
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addOutcomeField}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Adicionar resultado
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-700 dark:hover:bg-green-800"
        >
          {isLoading ? "Criando..." : "Criar mercado"}
        </button>
      </form>
    </div>
  );
}
