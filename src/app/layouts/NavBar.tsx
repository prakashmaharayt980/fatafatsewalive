




'use client'
import React, { useMemo } from 'react';
import { Book, BookOpen, ChevronDown, CreditCard } from 'lucide-react';
import Link from 'next/link';
import nvaitemlist from './navitem.json';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { imglist } from '../CommonVue/Image';
import { navsection } from './sidebarMobile';





const NavBar = ({ navbaritems }: {
    navbaritems: navsection['result'];
}) => {

    const router = useRouter()
    // Memoize and validate navigation data to prevent unnecessary re-renders
    const validatedNavItems = useMemo(() => {
        if (!Array.isArray(nvaitemlist)) {
            console.warn('Navigation items should be an array');
            return [];
        }

        return nvaitemlist.filter((item, index) => {
            if (!item || typeof item !== 'object') {
                console.warn(`Invalid navigation item at index ${index}:`, item);
                return false;
            }

            if (!item.name || typeof item.name !== 'string') {
                console.warn(`Missing or invalid title at index ${index}:`, item);
                return false;
            }

            // Validate content structure if it exists
            if (item.children && Array.isArray(item.children)) {
                item.children = item.children.filter((contentItem, contentIndex) => {
                    if (!contentItem || typeof contentItem !== 'object') {
                        console.warn(`Invalid content item at ${index}-${contentIndex}:`, contentItem);
                        return false;
                    }

                    if (!contentItem.name) {
                        console.warn(`Missing innerTittle at ${index}-${contentIndex}:`, contentItem);
                        return false;
                    }

                    // Validate and filter children
                    if (contentItem.children && Array.isArray(contentItem.children)) {
                        contentItem.children = contentItem.children.filter((child, childIndex) => {
                            if (!child || typeof child !== 'object') {
                                console.warn(`Invalid child item at ${index}-${contentIndex}-${childIndex}:`, child);
                                return false;
                            }

                            if (!child.name || !child.slug) {
                                console.warn(`Missing title or 'to' property at ${index}-${contentIndex}-${childIndex}:`, child);
                                return false;
                            }

                            return true;
                        });
                    } else {
                        contentItem.children = [];
                    }

                    return true;
                });
            } else {
                item.children = [];
            }

            return true;
        });
    }, []);



    const getGridColumns = useMemo(() => (contentLength: number) => {
        if (contentLength <= 2) return 'grid-cols-2';
        if (contentLength <= 3) return 'grid-cols-3';
        return 'grid-cols-4';
    }, []);

    const getDropdownWidth = useMemo(() => (category: any) => {
        const contentLength = category.content?.length || 0;
        if (contentLength <= 2) return 'w-[500px]';
        if (contentLength <= 3) return 'w-[1000px]';
        return 'w-[1000px]';
    }, []);

    // Early return if no valid navigation items
    if (!validatedNavItems.length) {
        return (
            <nav className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-md">
                <div className="container mx-auto px-4 py-4">
                    <div className="text-white text-center">Navigation items not available</div>
                </div>
            </nav>
        );
    }

    const handlerouter = (path: string) => {
        router.push(path)
    }

    return (
        <nav className="bg-[var(--colour-fsP2)] shadow-md relative  hidden md:block">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex   items-center justify-center py-2 gap-0.5">
                    {validatedNavItems.map((category, categoryIndex) => (
                        <div key={categoryIndex} className="relative">
                            {category.children?.length > 0 ? (
                                <HoverCard openDelay={0} closeDelay={50}>
                                    <HoverCardTrigger asChild>
                                        <button aria-label={category.name} className="flex items-center cursor-pointer gap-1 rounded-lg px-3 py-2 text-sm font-medium text-white hover:bg-white/10 transition-all duration-200">
                                            <span className="truncate max-w-[160px]">{category.name}</span>
                                            <ChevronDown className="h-3.5 w-3.5" />
                                        </button>
                                    </HoverCardTrigger>
                                    <HoverCardContent
                                        className={`${getDropdownWidth(category)} bg-white cursor-pointer mx-4 mt-1 mb-8 rounded-xl shadow-lg border-0 p-4 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-orange-400 transition-colors`}
                                        align="start"
                                        sideOffset={8}
                                    >
                                        <div className={`grid ${getGridColumns(category.children.length)} gap-6`}>
                                            {category.children.map((innerItem, innerIndex) => (
                                                <div key={innerIndex} className="space-y-3">
                                                    <h3 className="text-sm font-semibold cursor-pointer text-orange-600 border-b border-orange-100 pb-2">
                                                        {innerItem.name}
                                                    </h3>
                                                    <div className="grid gap-2">
                                                        {innerItem.children?.map((child, childIndex) => (
                                                            <Link
                                                                key={childIndex}
                                                                href={child.slug}
                                                                className="flex items-center cursor-pointer gap-2 px-2 py-1.5 text-sm text-gray-600 hover:text-orange-500 hover:bg-orange-50/50 rounded-md transition-all duration-200 group"
                                                            >
                                                                <span className="group-hover:translate-x-0.5 transition-transform">
                                                                    {child.name}
                                                                </span>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </HoverCardContent>
                                </HoverCard>
                            ) : (

                                <></>
                                // <div className='flex flex-row gap-2'>


                                //     <button
                                //         aria-label='blog'
                                //         onClick={() => handlerouter('/blogs')}
                                //         className={`px-3 py-2 gap-1 cursor-pointer rounded-full text-sm items-center font-medium flex flex-row transition-all bg-white text-gray-700 border border-gray-300 hover:bg-gray-50`}
                                //     >

                                //         <Image
                                //             src={imglist.blog}
                                //             alt='blog icon'
                                //             height={20}
                                //             width={20}
                                //             priority
                                //         />
                                //         <span className={" font-medium items-center "}>Blog</span>
                                //     </button>
                                //     <button
                                //         aria-label='emi-calculator'
                                //         onClick={() => handlerouter('/emi')}

                                //         className={`px-3 py-2 gap-1 cursor-pointer rounded-full text-sm items-center font-medium flex flex-row transition-all bg-white text-gray-700 border border-gray-300 hover:bg-gray-50`}
                                //     >
                                //         <Image
                                //             src={imglist.emiCalcultorIocn}
                                //             alt='emi-calculator icon'
                                //             height={20}
                                //             width={20}
                                //             priority
                                //         />
                                //         <span className={" font-medium items-center "}>Emi Calcultor</span>



                                //     </button>

                                //     <button
                                //         aria-label='exchange'
                                //         onClick={() => handlerouter('/ExchangeProducts')}

                                //         className={`px-3 py-2 gap-1 cursor-pointer rounded-full text-sm items-center font-medium flex flex-row transition-all bg-white text-gray-700 border border-gray-300 hover:bg-gray-50`}
                                //     >
                                //         <Image
                                //             src={imglist.emiCalcultorIocn}
                                //             alt='exchange icon'
                                //             height={20}
                                //             width={20}
                                //             priority
                                //         />
                                //         <span className={" font-medium items-center "}>Exchange</span>



                                //     </button>

                                //     <button
                                //         aria-label='reviews'
                                //         onClick={() => handlerouter('/reviews')}

                                //         className={`px-3 py-2 gap-1 cursor-pointer rounded-full text-sm items-center font-medium flex flex-row transition-all bg-white text-gray-700 border border-gray-300 hover:bg-gray-50`}
                                //     >
                                //         <Image
                                //             src={imglist.emiCalcultorIocn}
                                //             alt='exchange icon'
                                //             height={20}
                                //             width={20}
                                //             priority
                                //         />
                                //         <span className={" font-medium items-center "}>Reviews</span>



                                //     </button>

                                //     <button
                                //         aria-label='reviews'
                                //         onClick={() => handlerouter('/reviews')}

                                //         className={`px-3 py-2 gap-1 cursor-pointer rounded-full text-sm items-center font-medium flex flex-row transition-all bg-white text-gray-700 border border-gray-300 hover:bg-gray-50`}
                                //     >
                                //         <Image
                                //             src={imglist.emiCalcultorIocn}
                                //             alt='exchange icon'
                                //             height={20}
                                //             width={20}
                                //             priority
                                //         />
                                //         <span className={" font-medium items-center "}>Repairs</span>



                                //     </button>

                                // </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default NavBar;