"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Loader2 } from 'lucide-react';
import { CategoryTree, getCategoryTree } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

export function MegaMenu() {
    const [tree, setTree] = useState<CategoryTree[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeL1, setActiveL1] = useState<CategoryTree | null>(null);
    const [activeL2, setActiveL2] = useState<CategoryTree | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const router = useRouter();

    useEffect(() => {
        const fetchTree = async () => {
            try {
                const data = await getCategoryTree();
                setTree(data);
                if (data.length > 0) {
                    setActiveL1(data[0]);
                }
            } catch (error) {
                console.error("Failed to fetch category tree", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTree();
    }, []);

    const showMenu = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(true);
    };

    const hideMenu = () => {
        timeoutRef.current = setTimeout(() => {
            setIsVisible(false);
        }, 150); // 150ms grace period to cross the gap
    };

    const handleMouseEnterL1 = (cat: CategoryTree) => {
        setActiveL1(cat);
        setActiveL2(null);
    };

    const handleMouseEnterL2 = (cat: CategoryTree) => {
        setActiveL2(cat);
    };

    const handleL2Click = (cat: CategoryTree) => {
        if (!cat.children || cat.children.length === 0) {
            router.push(`/categories/${cat.slug}`);
            setIsVisible(false);
        }
    };

    const { locale } = useLanguage();

    const getName = (cat: CategoryTree) => {
        return (locale === 'vi' && cat.name_vi) ? cat.name_vi : cat.name;
    };

    if (loading) return null;

    return (
        <div className="group inline-block relative h-full flex items-center">
            <Link 
                href="/categories" 
                onClick={() => setIsVisible(false)}
                onMouseEnter={showMenu}
                onMouseLeave={hideMenu}
            >
                <button className={cn(
                    "text-sm font-normal text-muted-foreground hover:text-foreground px-4 py-2 transition-colors",
                    isVisible && "text-foreground font-medium"
                )}>
                    Categories
                </button>
            </Link>

            {/* Dropdown Container */}
            <div 
                className={cn(
                    "absolute left-0 top-full pt-4 w-[1000px] z-50 transition-all duration-200 ease-in-out",
                    isVisible ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-2 pointer-events-none"
                )}
            >
                <div 
                    className="bg-white border shadow-xl rounded-lg overflow-hidden flex"
                    style={{ height: '500px' }}
                    onMouseEnter={showMenu}
                    onMouseLeave={hideMenu}
                >
                    
                    {/* Level 1 Column */}
                    <div className="w-64 border-r overflow-y-auto py-4 shrink-0">
                        {tree.map((cat) => (
                            <Link key={cat.id} href={`/categories/${cat.slug}`} onClick={() => setIsVisible(false)}>
                                <div 
                                    onMouseEnter={(e) => {
                                        e.preventDefault(); 
                                        handleMouseEnterL1(cat);
                                    }}
                                    className={cn(
                                        "px-4 py-2 m-1 mx-2 flex items-center justify-between cursor-pointer rounded-md text-sm",
                                        activeL1?.id === cat.id ? "bg-gray-100 text-indigo-600 font-medium" : "text-gray-700 hover:bg-gray-50"
                                    )}
                                >
                                    <span className="truncate">{getName(cat)}</span>
                                    {cat.children && cat.children.length > 0 && (
                                        <ChevronRight className="h-4 w-4 text-gray-400 shrink-0 ml-2" />
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Level 2 Column */}
                    {activeL1 && activeL1.children && activeL1.children.length > 0 && (
                        <div className="w-64 border-r overflow-y-auto py-4 bg-gray-50/50 shrink-0">
                             <div className="px-4 pb-2 mb-2 border-b text-xs font-bold text-gray-400 uppercase tracking-wider truncate">
                                {getName(activeL1)} Subcategories
                            </div>
                            {activeL1.children.map((cat) => (
                                <div 
                                    key={cat.id}
                                    onMouseEnter={() => handleMouseEnterL2(cat)}
                                    onClick={() => handleL2Click(cat)}
                                    className={cn(
                                        "px-4 py-2 m-1 mx-2 flex items-center justify-between cursor-pointer rounded-md text-sm",
                                        activeL2?.id === cat.id ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700 hover:bg-gray-100"
                                    )}
                                >
                                    <span className="truncate">{getName(cat)}</span>
                                    {cat.children && cat.children.length > 0 && (
                                        <ChevronRight className="h-4 w-4 text-gray-400 shrink-0 ml-2" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Level 3 Column (Topics) */}
                    {activeL2 && activeL2.children && activeL2.children.length > 0 && (
                        <div className="flex-1 overflow-y-auto py-4 px-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">
                                Popular Topics in {getName(activeL2)}
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {activeL2.children.map((cat) => (
                                    <Link 
                                        key={cat.id} 
                                        href={`/categories/${cat.slug}`}
                                        onClick={() => setIsVisible(false)}
                                        className="flex flex-col items-center justify-center text-center p-2 rounded-lg border hover:border-indigo-600 hover:shadow-sm transition-all group/item h-full"
                                    >
                                        <div className="font-medium text-gray-900 group-hover/item:text-indigo-600 text-sm line-clamp-2 leading-tight">
                                            {getName(cat)}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty State for L2/L3 */}
                    {(!activeL1?.children?.length) && (
                         <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                             Select a category to browse
                         </div>
                    )}
                </div>
            </div>
            
            {/* Backdrop for click-outside (optional, but hover is sufficient for desktop) */}
            {isVisible && (
                <div className="fixed inset-0 top-[128px] bg-black/20 z-30" />
            )}
        </div>
    );
}
