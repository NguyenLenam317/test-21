import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useUser } from '../UserContext';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from '@/components/ui/sheet';

const Header = () => {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { href: '/', label: 'Home', active: location === '/' },
    { href: '/weather', label: 'Weather', active: location === '/weather' },
    { href: '/health', label: 'Health', active: location === '/health' },
    { href: '/climate', label: 'Climate', active: location === '/climate' },
    { href: '/activities', label: 'Activities', active: location === '/activities' },
    { href: '/community', label: 'Community', active: location === '/community' },
  ];

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4">
        <div className="flex items-center">
          <span className="material-icons text-primary mr-2">eco</span>
          <h1 className="text-xl font-heading font-semibold text-primary">EcoSense Hanoi</h1>
        </div>
        
        <nav className="hidden md:flex space-x-1">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              <a className={`px-3 py-2 rounded-md text-sm font-medium ${
                link.active 
                  ? 'text-primary-dark'
                  : 'text-neutral-600 hover:bg-primary-light hover:bg-opacity-10'
              } transition-colors`}>
                {link.label}
              </a>
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center space-x-2">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <span className="material-icons">menu</span>
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col space-y-3 mt-8">
                {links.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <a 
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        link.active 
                          ? 'bg-primary text-white'
                          : 'text-neutral-600 hover:bg-neutral-100'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </a>
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <span className="material-icons">person</span>
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isAuthenticated ? (
                <>
                  <DropdownMenuItem disabled>
                    Signed in as {user?.username}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => logout()}>
                    Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem disabled>
                    Demo Mode
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
