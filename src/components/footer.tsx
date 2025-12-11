import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-pm-light-dark border-t border-gray-200 dark:border-pm-light-gray mt-10">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-pm-gray mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} BBP. Todos os direitos reservados.
          </div>
          <div className="flex space-x-6">
            <Link href="/privacy" className="text-sm text-gray-500 hover:text-pm-dark dark:text-pm-gray dark:hover:text-white">
              Privacidade
            </Link>
            <Link href="/terms" className="text-sm text-gray-500 hover:text-pm-dark dark:text-pm-gray dark:hover:text-white">
              Termos de Uso
            </Link>
            <Link href="/learn" className="text-sm text-gray-500 hover:text-pm-dark dark:text-pm-gray dark:hover:text-white">
              Aprenda
            </Link>
            <Link href="/careers" className="text-sm text-gray-500 hover:text-pm-dark dark:text-pm-gray dark:hover:text-white">
              Carreiras
            </Link>
            <Link href="/press" className="text-sm text-gray-500 hover:text-pm-dark dark:text-pm-gray dark:hover:text-white">
              Imprensa
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

