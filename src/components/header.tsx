"use client";

import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { useSession, signOut } from 'next-auth/react';

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-pm-gray"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="bg-white dark:bg-pm-light-dark border-b border-gray-200 dark:border-pm-light-gray">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center space-x-8">
          <div className="text-2xl font-bold">
            <Link href="/">BBP</Link>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar mercados"
              className="bg-gray-100 dark:bg-pm-dark border border-gray-300 dark:border-pm-light-gray rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-pm-blue"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
          </div>
        </div>
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/markets" className="text-gray-500 hover:text-pm-dark dark:text-pm-gray dark:hover:text-white text-sm font-medium">
            Mercados
          </Link>
          <Link href="/portfolio" className="text-gray-500 hover:text-pm-dark dark:text-pm-gray dark:hover:text-white text-sm font-medium">
            Portfólio
          </Link>
          <Link href="/leaderboard" className="text-gray-500 hover:text-pm-dark dark:text-pm-gray dark:hover:text-white text-sm font-medium">
            Ranking
          </Link>
          <Link href="/markets/create" className="text-gray-500 hover:text-pm-dark dark:text-pm-gray dark:hover:text-white text-sm font-medium">
            Criar Mercado
          </Link>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {status === 'authenticated' && session.user ? (
              <>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500 dark:text-pm-gray">
                    Bem-vindo, {session.user.name || session.user.email}
                  </span>
                  <span className="text-sm font-bold text-pm-green">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(session.user.balance || 0)}
                  </span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="bg-gray-200 hover:bg-gray-300 text-pm-dark dark:bg-pm-light-gray dark:hover:bg-pm-gray dark:text-white px-4 py-2 rounded-md text-sm font-semibold"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link href="/signup">
                  <button className="bg-pm-blue text-white px-4 py-2 rounded-md text-sm font-semibold">
                    Cadastrar
                  </button>
                </Link>
                <Link href="/login">
                  <button className="bg-gray-200 hover:bg-gray-300 text-pm-dark dark:bg-pm-light-gray dark:hover:bg-pm-gray dark:text-white px-4 py-2 rounded-md text-sm font-semibold">
                    Entrar
                  </button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
