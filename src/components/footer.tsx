import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-pm-light-dark border-t border-pm-light-gray mt-10">
      <div className="container mx-auto py-8 px-4 text-white">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-pm-gray mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} BBP. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <Link href="/privacy" className="text-sm text-pm-gray hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-pm-gray hover:text-white">
              Terms of Use
            </Link>
            <Link href="/learn" className="text-sm text-pm-gray hover:text-white">
              Learn
            </Link>
            <Link href="/careers" className="text-sm text-pm-gray hover:text-white">
              Careers
            </Link>
            <Link href="/press" className="text-sm text-pm-gray hover:text-white">
              Press
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

