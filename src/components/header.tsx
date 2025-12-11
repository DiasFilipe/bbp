import Link from 'next/link';

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
  return (
    <header className="bg-pm-light-dark border-b border-pm-light-gray">
      <div className="container mx-auto flex items-center justify-between p-4 text-white">
        <div className="flex items-center space-x-8">
          <div className="text-2xl font-bold">
            <Link href="/">BBP</Link>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search markets"
              className="bg-pm-dark border border-pm-light-gray rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-pm-blue"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
          </div>
        </div>
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/markets" className="text-pm-gray hover:text-white text-sm font-medium">
            Markets
          </Link>
          <Link href="/portfolio" className="text-pm-gray hover:text-white text-sm font-medium">
            Portfolio
          </Link>
          <Link href="/leaderboard" className="text-pm-gray hover:text-white text-sm font-medium">
            Leaderboard
          </Link>
          <div className='flex items-center space-x-2'>
            <button className="bg-pm-blue text-white px-4 py-2 rounded-md text-sm font-semibold">
              Sign Up
            </button>
            <button className="bg-pm-light-gray text-white px-4 py-2 rounded-md text-sm font-semibold">
              Log In
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
