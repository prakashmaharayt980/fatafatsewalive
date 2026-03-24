'use client'
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
import { placeholderimg } from '../CommonVue/Image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../context/AuthContext';
import { useShallow } from 'zustand/react/shallow';

import type { NavbarItem } from '../context/navbar.interface';

const MobileSidebar = ({ open, toggleMobileMenu, initialNavItems, openCart, openWishlist, navbarExtradata = [] }: {
  open: boolean;
  toggleMobileMenu: () => void;
  initialNavItems: NavbarItem[];
  openCart: () => void;
  openWishlist: () => void;
  navbarExtradata?: { path: string, title: string, icon: React.ReactNode | null }[];
}) => {
  const router = useRouter();
  const { user, isLoggedIn, logout, setloginDailogOpen } = useAuthStore(useShallow(state => ({
    user: state.user,
    isLoggedIn: state.isLoggedIn,
    logout: state.logout,
    setloginDailogOpen: state.setloginDailogOpen
  })));


  const handlerouter = (path: string) => {
    router.push(path);
    toggleMobileMenu();
  };

  const handleCategoryClick = (item: { slug: string }) => {
    router.push(`/category/${item.slug}`);
    toggleMobileMenu();
  };

  const handleLogout = () => {
    logout();
    toggleMobileMenu();
  };



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
                sizes="112px"
              />
            </div>
          </div>

          {/* User Section */}
          <div className="px-4 py-3 bg-slate-50/50">
            {isLoggedIn ? (
              <div
                onClick={() => handlerouter('/profile')}
                className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] cursor-pointer hover:shadow-md transition-all border border-slate-100/80 group"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--colour-fsP2)] to-blue-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <User className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-[var(--colour-fsP2)] transition-colors">
                    {user?.name || 'My Account'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {user?.email || 'View your profile'}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 group-hover:text-[var(--colour-fsP2)] transition-colors" strokeWidth={2.5} />
              </div>
            ) : (
              <div
                onClick={() => { toggleMobileMenu(); setloginDailogOpen?.(true); }}
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-[var(--colour-fsP2)] to-blue-600 rounded-xl shadow-[0_4px_12px_-4px_rgba(6,81,237,0.4)] cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all text-white group"
              >
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <User className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    Login / Register
                  </p>
                  <p className="text-xs text-white/80 truncate">
                    Access your account & orders
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/80 shrink-0 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
              </div>
            )}
          </div>


          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto">
            <div className="px-4 py-2">
              <p className="px-1 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Browse Categories
              </p>
            </div>
            <div className="px-3">
              {(Array.isArray(initialNavItems) ? initialNavItems : []).map((category, index) => (
                <div key={index} className="mb-1 relative">
                  {category.children?.length > 0 ? (
                    <Accordion type="single" collapsible>
                      <AccordionItem value={`item-${index}`} className="border-none">
                        <AccordionTrigger className="group flex items-center justify-between px-3 py-3 w-full rounded-xl hover:bg-slate-50 text-[14px] font-semibold text-slate-800 transition-colors data-[state=open]:text-[var(--colour-fsP2)] data-[state=open]:bg-blue-50/50 hover:no-underline flex-1">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 shrink-0 flex items-center justify-center bg-white rounded-lg shadow-sm border border-slate-100 group-data-[state=open]:border-blue-100 group-data-[state=open]:shadow-blue-100/50 transition-all">
                              <Image
                                src={category.thumb?.url || placeholderimg}
                                alt={category.title}
                                width={18}
                                height={18}
                                className="object-contain"
                                onError={(e) => { e.currentTarget.src = placeholderimg; }}
                              />
                            </div>
                            <span className="font-semibold">{category.title}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-2 pt-1 px-4">
                          <div className="flex flex-col gap-0.5 mt-1 ml-4 border-l-2 border-slate-100 pl-3">
                            {category.children.map((item, itemIndex) => (
                              <button
                                key={itemIndex}
                                onClick={() => {
                                  router.push(`/category/${category.slug}?category=${item.slug}`);
                                  toggleMobileMenu();
                                }}
                                className="w-full text-left flex items-center gap-3 px-3 py-2 text-[13px] text-slate-600 hover:text-[var(--colour-fsP2)] hover:bg-blue-50/30 rounded-lg transition-colors cursor-pointer group relative"
                              >
                                <span className="absolute -left-[14px] top-1/2 -translate-y-1/2 w-2 h-[2px] bg-slate-100 group-hover:bg-[var(--colour-fsP2)] transition-colors" />
                                <span className="absolute -left-[15px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-[var(--colour-fsP2)] transition-colors" />
                                <span className="line-clamp-2 font-medium">{item.name || item.title}</span>
                              </button>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ) : (
                    <button
                      onClick={() => handleCategoryClick(category)}
                      className="w-full flex items-center justify-between px-3 py-3 rounded-xl text-[14px] font-semibold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 shrink-0 flex items-center justify-center bg-white rounded-lg shadow-sm border border-slate-100 group-hover:border-blue-100 group-hover:shadow-blue-100/50 transition-all">
                          <Image
                            src={category.thumb?.url || placeholderimg}
                            alt={category.title}
                            width={18}
                            height={18}
                            className="object-contain"
                            onError={(e) => {
                              e.currentTarget.src = placeholderimg;

                            }}
                          />
                        </div>
                        <span className="group-hover:text-[var(--colour-fsP2)] transition-colors font-semibold">{category.title}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[var(--colour-fsP2)] transition-colors" strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Extra Navigation Links (Explore Features) */}
            {navbarExtradata?.length > 0 && (
              <div className="mt-2 px-3 pt-4 border-t border-slate-100">
                <p className="px-1 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Explore More
                </p>
                <div className="flex flex-col gap-1">
                  {navbarExtradata.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlerouter(item.path)}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium text-slate-700 hover:bg-slate-50 hover:text-[var(--colour-fsP2)] transition-colors cursor-pointer group"
                    >
                      <div className="w-8 h-8 shrink-0 flex items-center justify-center bg-white rounded-lg shadow-sm border border-slate-100 group-hover:border-blue-100 group-hover:shadow-blue-100/50 transition-all text-slate-400 group-hover:text-[var(--colour-fsP2)]">
                        {item.icon}
                      </div>
                      <span>{item.title}</span>
                      <ChevronRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-[var(--colour-fsP2)] transition-colors" strokeWidth={2.5} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Account Links for Logged In Users */}
            {isLoggedIn && (
              <div className="mt-2 px-3 pt-4 pb-4 border-t border-slate-100">
                <p className="px-1 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Account
                </p>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handlerouter('/profile?tab=orders')}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium text-slate-700 hover:bg-slate-50 hover:text-[var(--colour-fsP2)] transition-colors cursor-pointer group"
                  >
                    <div className="w-8 h-8 shrink-0 flex items-center justify-center bg-white rounded-lg shadow-sm border border-slate-100 group-hover:border-blue-100 group-hover:shadow-blue-100/50 transition-all text-slate-400 group-hover:text-[var(--colour-fsP2)]">
                      <Package className="w-4 h-4" strokeWidth={2.5} />
                    </div>
                    <span>My Orders</span>
                  </button>
                  <button
                    onClick={() => handlerouter('/profile?tab=profile')}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium text-slate-700 hover:bg-slate-50 hover:text-[var(--colour-fsP2)] transition-colors cursor-pointer group"
                  >
                    <div className="w-8 h-8 shrink-0 flex items-center justify-center bg-white rounded-lg shadow-sm border border-slate-100 group-hover:border-blue-100 group-hover:shadow-blue-100/50 transition-all text-slate-400 group-hover:text-[var(--colour-fsP2)]">
                      <Settings className="w-4 h-4" strokeWidth={2.5} />
                    </div>
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer group mt-2"
                  >
                    <div className="w-8 h-8 shrink-0 flex items-center justify-center bg-white rounded-lg shadow-sm border border-red-100 group-hover:border-red-200 group-hover:shadow-red-100/50 transition-all text-red-400 group-hover:text-red-600">
                      <LogOut className="w-4 h-4" strokeWidth={2.5} />
                    </div>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </nav>


        </div>
      </SheetContent>
    </Sheet>
  );
};

export default React.memo(MobileSidebar);