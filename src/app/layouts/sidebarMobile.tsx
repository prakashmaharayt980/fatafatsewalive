import React from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Home, FileText, Calculator, User, ChevronRight, LogOut, Package, Settings } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { CompanyLogo } from '../CommonVue/Payment';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { navitems } from '@/app/context/GlobalData';


const MobileSidebar = ({ open, toggleMobileMenu, initialNavItems, openCart, openWishlist }: {
  open: boolean;
  toggleMobileMenu: () => void;
  initialNavItems: navitems[];
  openCart: () => void;
  openWishlist: () => void;
}) => {
  const router = useRouter();
  const { user, isLoggedIn, logout, setloginDailogOpen, isLoading } = useAuth();

  const loginNeed = () => {
    toggleMobileMenu();
    setloginDailogOpen(true);
  };

  const handlerouter = (path: string) => {
    router.push(path);
    toggleMobileMenu();
  };

  const handleCategoryClick = (item) => {
    // Navigate to category page with slug only, matching NavBar
    // Ensure no double slashes if slug starts with /
    const cleanSlug = item.slug.startsWith('/') ? item.slug.substring(1) : item.slug;
    router.push(`/categorys/${cleanSlug}`);
    toggleMobileMenu();
  };

  const handleLogout = () => {
    logout();
    toggleMobileMenu();
  };

  // Quick action items
  const quickActions = [
    { icon: Home, label: 'Home', path: '/', color: 'text-blue-600' },
    { icon: FileText, label: 'Blog', path: '/blog', color: 'text-emerald-600' },
    { icon: Calculator, label: 'EMI', path: '/emi', color: 'text-violet-600' },
  ];

  return (
    <Sheet open={open} onOpenChange={toggleMobileMenu}>
      <SheetContent
        side="left"
        className="p-0 w-[300px] max-w-[85vw] lg:hidden border-r-0 shadow-2xl [&>button]:hidden"
      >
        <div className="flex flex-col h-full bg-white">
          {/* Header */}
          <div className="px-4 py-3 flex items-center bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
            <div className="h-7 w-28 relative">
              <Image
                src={CompanyLogo}
                alt="Fatafatsewa Logo"
                className="w-auto h-full object-contain"
                fill
              />
            </div>
          </div>

          {/* User Section */}
          <div className="px-4 py-3 bg-slate-50/50">
            {!isLoggedIn ? (
              <Button
                onClick={loginNeed}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg h-10 cursor-pointer shadow-sm"
              >
                <User className="w-4 h-4 mr-2" />
                Sign In / Register
              </Button>
            ) : (
              <div
                onClick={() => handlerouter('/profile')}
                className="flex items-center gap-3 p-2.5 bg-white rounded-lg cursor-pointer hover:shadow-sm transition-all border border-slate-100"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {user?.name || 'My Account'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {user?.email || 'View your profile'}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="flex gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.path}
                  onClick={() => handlerouter(action.path)}
                  className="flex-1 flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-100"
                >
                  <action.icon className={`w-4.5 h-4.5 ${action.color}`} />
                  <span className="text-[11px] font-medium text-slate-600">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto">
            <div className="px-4 py-2">
              <p className="px-1 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Browse Categories
              </p>
            </div>
            <div className="px-3 space-y-0.5">
              {(Array.isArray(initialNavItems) ? initialNavItems : []).map((category, index) => (
                <div key={index}>
                  {category.children?.length > 0 ? (
                    <Accordion type="single" collapsible>
                      <AccordionItem value={`item-${index}`} className="border-none">
                        <AccordionTrigger className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 rounded-lg text-[13px] font-medium text-slate-700 [&[data-state=open]]:bg-slate-50 [&[data-state=open]]:text-slate-900">
                          {category.title}
                        </AccordionTrigger>
                        <AccordionContent className="pb-1 pl-2">
                          {category.children.map((section, sectionIndex) => (
                            <div key={sectionIndex} className="mb-2">
                              <p className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                                {section.title}
                              </p>
                              <div className="space-y-0.5">
                                {section.children?.map((item, itemIndex) => (
                                  <button
                                    key={itemIndex}
                                    onClick={() => handleCategoryClick(item)}
                                    className="w-full text-left block px-3 py-1.5 text-[12px] text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors cursor-pointer"
                                  >
                                    {item.title}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ) : (
                    <button
                      onClick={() => handleCategoryClick(category)}
                      className="w-full text-left px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                    >
                      {category.title}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Account Links for Logged In Users */}
            {isLoggedIn && (
              <div className="px-3 mt-4 pt-3 border-t border-slate-100">
                <p className="px-4 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Account
                </p>
                <div className="space-y-0.5">
                  <button
                    onClick={() => handlerouter('/profile?tab=orders')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Package className="w-4 h-4 text-slate-400" />
                    My Orders
                  </button>
                  <button
                    onClick={() => handlerouter('/profile?tab=profile')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </nav>

          {/* Bottom Section */}
          <div className="px-4 py-3 border-t border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  toggleMobileMenu();
                  openWishlist();
                }}
                className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Heart className="w-4 h-4 text-red-500" />
                Wishlist
              </button>
              <button
                onClick={() => {
                  toggleMobileMenu();
                  openCart();
                }}
                className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" />
                Cart
              </button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;