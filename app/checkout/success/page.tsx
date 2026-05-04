'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

function CheckoutSuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const orderId = searchParams.get('order_id');
    
    const { removeBatch } = useCart();

    useEffect(() => {
        const confirmOrder = async () => {
            if (!orderId) return;
            
            try {
                // Fetch order details to know what was purchased
                // We use our new /api/payments/orders/<id>/ endpoint
                const { api } = await import('@/lib/api');
                const { data } = await api.get(`/payments/orders/${orderId}/`);
                
                if (data.purchased_course_ids) {
                    console.log("Removing purchased items from cart:", data.purchased_course_ids);
                    removeBatch(data.purchased_course_ids);
                }
            } catch (error) {
                console.error("Failed to confirm order details", error);
            }
        };

        confirmOrder();
    }, [orderId]);

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 p-4">
            <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-xl">
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">Payment Successful!</h1>
                    <p className="text-gray-600">
                        Thank you for your purchase. Your courses are now available in your learning dashboard.
                    </p>
                </div>

                <div className="pt-6 space-y-3">
                    <Link href="/my-courses">
                        <Button className="w-full h-12 text-lg bg-purple-600 hover:bg-purple-700">
                            Go to My Learning
                        </Button>
                    </Link>
                    <Link href="/">
                        <Button variant="outline" className="w-full">
                            Browse More Courses
                        </Button>
                    </Link>
                </div>
            </Card>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center">Loading...</div>}>
            <CheckoutSuccessContent />
        </Suspense>
    );
}
