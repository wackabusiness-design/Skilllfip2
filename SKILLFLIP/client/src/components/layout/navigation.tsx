import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, LogOut, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const navigationItems = [
    { href: "/browse", label: "Browse Skills" },
    { href: "/flip-nights", label: "Flip Nights" },
    { href: "/about", label: "About" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const userNavigationItems = isAuthenticated
    ? [
        { href: "/dashboard", label: "Dashboard" },
        ...(user?.role === "creator" ? [{ href: "/list-skill", label: "List Skill" }] : []),
        ...(user?.role === "admin" ? [{ href: "/admin", label: "Admin" }] : []),
      ]
    : [];

  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-primary cursor-pointer">SkillFlip</h1>
            </Link>
            
            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-8">
                {/* Search Section */}
                <form onSubmit={handleSearch} className="relative">
                  <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2 min-w-[300px]">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Book or list a skill..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border-0 bg-transparent focus:ring-0 focus:border-0 text-sm placeholder:text-gray-500"
                    />
                    <Button type="submit" size="sm" className="h-7 px-3 text-xs">
                      Search
                    </Button>
                  </div>
                </form>
                
                {/* Navigation Links */}
                <div className="flex items-baseline space-x-6">
                  {navigationItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <span
                        className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                          isActive(item.href)
                            ? "text-primary border-b-2 border-primary"
                            : "text-gray-700 hover:text-primary"
                        }`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {user?.role !== "creator" && (
                  <Button
                    variant="outline"
                    className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                    onClick={() => window.location.href = "/api/login"}
                  >
                    Become a Creator
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.profileImageUrl} alt={user?.email} />
                        <AvatarFallback>
                          {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">
                          {user?.firstName && user?.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user?.email}
                        </p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    {userNavigationItems.map((item) => (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href}>
                          <span className="cursor-pointer">{item.label}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a href="/api/logout" className="cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => window.location.href = "/api/login"}
                >
                  Sign In
                </Button>
                <Button onClick={() => window.location.href = "/api/login"}>
                  Get Started
                </Button>
                <Button
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  onClick={() => window.location.href = "/api/login"}
                >
                  List Your Skill
                </Button>
              </>
            )}
          </div>

          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" className="h-6 w-6 p-0">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-8">
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch} className="mb-4">
                    <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                      <Search className="h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Book or list a skill..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border-0 bg-transparent focus:ring-0 focus:border-0 text-sm placeholder:text-gray-500"
                      />
                      <Button type="submit" size="sm" className="h-7 px-3 text-xs">
                        Search
                      </Button>
                    </div>
                  </form>
                  
                  {navigationItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <span
                        className={`block px-3 py-2 text-base font-medium transition-colors cursor-pointer ${
                          isActive(item.href)
                            ? "text-primary"
                            : "text-gray-700 hover:text-primary"
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </span>
                    </Link>
                  ))}
                  
                  {isAuthenticated ? (
                    <>
                      <div className="border-t pt-4">
                        {userNavigationItems.map((item) => (
                          <Link key={item.href} href={item.href}>
                            <span
                              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary transition-colors cursor-pointer"
                              onClick={() => setIsOpen(false)}
                            >
                              {item.label}
                            </span>
                          </Link>
                        ))}
                      </div>
                      <a
                        href="/api/logout"
                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary transition-colors"
                      >
                        Log out
                      </a>
                    </>
                  ) : (
                    <div className="border-t pt-4 space-y-2">
                      <Button
                        className="w-full"
                        onClick={() => {
                          window.location.href = "/api/login";
                          setIsOpen(false);
                        }}
                      >
                        Sign In
                      </Button>
                      <Button
                        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                        onClick={() => {
                          window.location.href = "/api/login";
                          setIsOpen(false);
                        }}
                      >
                        List Your Skill
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
