import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Importado para usar a logo
import Head from 'next/head';   // Importado para adicionar o favicon
import { useRouter } from 'next/router';
import { HouseLine, Cardholder, ArrowFatLinesUp, ArrowFatLinesDown, Article, Tag } from 'phosphor-react';

const ThemeSwitcher = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark';
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDarkMode(!isDarkMode);
  };

  return (
    <button onClick={toggleTheme} className="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sidebar-light dark:focus:ring-offset-background-dark dark:focus:ring-white">
      {isDarkMode ? '☀️' : '🌙'}
    </button>
  );
};

const navigation = [
  { name: 'Home', href: '/', icon: HouseLine },
  { name: 'Contas', href: '/contas', icon: Cardholder },
  { name: 'Categorias', href: '/categorias', icon: Tag },
  { name: 'Receitas', href: '/receitas', icon: ArrowFatLinesDown },
  { name: 'Despesas', href: '/despesas', icon: ArrowFatLinesUp },
  { name: 'Relatórios', href: '/relatorios', icon: Article },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const NavLinks = () => (
    <nav className="flex-1 space-y-1 px-2 py-4">
      {navigation.map((item) => {
        const Icon = item.icon; 
        return (
          <Link
            key={item.name}
            href={item.href}
            className={classNames(
              router.pathname === item.href
                ? 'bg-white/20 text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white',
              'group flex items-center rounded-md px-2 py-2 text-sm font-medium'
            )}
          >
            <Icon
              className={classNames(
                router.pathname === item.href ? 'text-white' : 'text-white/70 group-hover:text-white',
                'mr-3 h-6 w-6 flex-shrink-0'
              )}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Bloco Head para adicionar o favicon e o título da página */}
      <Head>
        <title>FinTrack - Seu Rastreador Financeiro</title>
        <link rel="icon" href="/favicon.png" />
      </Head>

      <div className="flex h-screen overflow-hidden bg-background-light text-text-light dark:bg-background-dark dark:text-text-dark">
        {/* Sidebar para Desktop */}
        <aside className="hidden md:flex md:flex-shrink-0">
          <div className="flex w-64 flex-col bg-sidebar-light dark:bg-sidebar-dark">
            <div className="flex flex-shrink-0 items-center px-4 h-16">
              {/* O texto "FinTrack" foi substituído pela sua logo */}
              <Image
                src="/logo.png"
                alt="FinTrack Logo"
                width={150} 
                height={45}
                priority
              />
            </div>
            <div className="flex flex-1 flex-col overflow-y-auto">
              <NavLinks />
            </div>
          </div>
        </aside>

        {/* Sidebar para Mobile (overlay) */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
            <div className="relative flex w-full max-w-xs flex-1 flex-col bg-sidebar-light dark:bg-sidebar-dark">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex h-10 w-10 items-center justify-center rounded-full text-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Fechar sidebar</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex flex-shrink-0 items-center px-4 h-16">
                 {/* Logo também na versão mobile */}
                 <Image
                    src="/logo.png"
                    alt="FinTrack Logo"
                    width={150}
                    height={45}
                    priority
                  />
              </div>
              <div className="mt-5 h-0 flex-1 overflow-y-auto">
                <NavLinks />
              </div>
            </div>
            <div className="w-14 flex-shrink-0"></div>
          </div>
        )}

        {/* Área de Conteúdo Principal */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-card-light dark:bg-card-dark shadow">
            <button
              type="button"
              className="border-r border-gray-200 dark:border-gray-700 px-4 text-gray-500 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Abrir sidebar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
            </button>
            <div className="flex flex-1 justify-end px-4 items-center">
               <ThemeSwitcher />
            </div>
          </header>

          <main className="flex-1">
            <div className="p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}