'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Lock, CreditCard, Smartphone } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';
import { getCourseThumbnail } from '@/lib/image-utils';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function CheckoutPage() {
  const { checkoutItems: items, selectedTotal: totalPrice, checkoutIds } = useCart();
  const itemCount = items.length;
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  const handleCheckout = async () => {
    if (!user) {
        toast({
            title: "Authentication Required",
            description: "Please login to complete your purchase.",
            variant: "destructive"
        });
        return;
    }
    
    setLoading(true);
    try {
        const courseIds = items.map(item => item.id);
        const { data } = await api.post('/payments/checkout/', {
            course_ids: courseIds,
            payment_method: paymentMethod
        });
        
        if (data.payment_url) {
            // Unified redirect for both Stripe and MoMo
            window.location.href = data.payment_url;
        } else if (data.checkout_url) {
            // Legacy support
            window.location.href = data.checkout_url;
        } else if (data.free) {
            // Success free enrollment
            window.location.href = `/checkout/success?order_id=${data.order_id}`;
        }
    } catch (error: any) {
        console.error("Checkout error", error);
        let errorMessage = error.response?.data?.error || "Something went wrong. Please try again.";
        
        if (error.response?.status === 503) {
            errorMessage = "Payment system is currently unavailable. Please try again later.";
        }
        
        toast({
            title: "Checkout Failed",
            description: errorMessage,
            variant: "destructive"
        });
        setLoading(false);
    }
  };

  if (itemCount === 0) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
             <div className="text-center">
                 <h1 className="text-2xl font-bold text-gray-900">Your cart is empty</h1>
                 <a href="/" className="text-purple-600 hover:underline mt-4 block">Continue Shopping</a>
             </div>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Order Items */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
                            <span>Order Details</span>
                            <span className="text-sm font-normal text-gray-500">{itemCount} Courses</span>
                        </h2>
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4 border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                                    <div className="w-24 h-16 relative rounded overflow-hidden bg-gray-200">
                                        <Image 
                                            src={getCourseThumbnail(item.id, item.thumbnail)} 
                                            alt={item.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900 line-clamp-1">{item.title}</h3>
                                        <p className="text-sm text-gray-500">{item.instructor_name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-purple-700">{formatPrice(item.current_price)}</p>
                                         {item.has_discount && (
                                            <p className="text-xs text-gray-400 line-through">{formatPrice(item.price)}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                    
                     {/* Payment Method Selection */}
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* Stripe Option */}
                            <div>
                                <RadioGroupItem value="stripe" id="stripe" className="peer sr-only" />
                                <Label
                                    htmlFor="stripe"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-purple-600 peer-data-[state=checked]:bg-purple-50 cursor-pointer transition-all"
                                >
                                    <CreditCard className="mb-3 h-6 w-6 text-gray-700" />
                                    <span className="font-semibold">International Card</span>
                                    <span className="text-xs text-center text-gray-500 mt-1">Visa, Mastercard, AMEX</span>
                                </Label>
                            </div>

                            {/* MoMo Option */}
                            <div>
                                <RadioGroupItem value="momo" id="momo" className="peer sr-only" />
                                <Label
                                    htmlFor="momo"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-pink-600 peer-data-[state=checked]:bg-pink-50 cursor-pointer transition-all"
                                >
                                    <Smartphone className="mb-3 h-6 w-6 text-pink-600" />
                                    <span className="font-semibold">MoMo Wallet</span>
                                    <span className="text-xs text-center text-gray-500 mt-1">Scan QR Code</span>
                                </Label>
                            </div>
                        </RadioGroup>
                    </Card>

                     <div className="flex items-center gap-2 text-sm text-gray-500 bg-white p-4 rounded-lg border">
                        <Lock className="w-4 h-4 text-green-600" />
                        <span>Generic secure encryption is used to protect your personal details.</span>
                    </div>
                </div>

                {/* Right Column: Summary & Payment */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-8 p-6 shadow-lg border-purple-100">
                        <h2 className="text-xl font-bold mb-6">Summary</h2>
                        
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Original Price</span>
                                <span>{formatPrice(totalPrice)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Discounts</span>
                                <span>-</span>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg flex justify-between font-bold text-xl text-gray-900 border border-gray-100">
                                <span>Total</span>
                                <span className="text-purple-700">{formatPrice(totalPrice)}</span>
                            </div>
                        </div>
                        
                        <Button 
                            size="lg" 
                            className={`w-full h-12 text-lg font-bold shadow-md transition-all hover:scale-[1.02] ${
                                paymentMethod === 'momo' 
                                ? 'bg-pink-600 hover:bg-pink-700' 
                                : 'bg-purple-600 hover:bg-purple-700'
                            }`}
                            onClick={handleCheckout}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                `Pay with ${paymentMethod === 'momo' ? 'MoMo' : 'Card'}`
                            )}
                        </Button>
                        
                        <p className="text-xs text-center text-gray-500 mt-4 leading-relaxed">
                            {paymentMethod === 'momo' 
                                ? 'You will be redirected to MoMo app/website to verify payment.'
                                : 'Secured by Stripe. Your card information receives bank-grade security.'
                            }
                        </p>
                    </Card>
                </div>
            </div>
        </div>

        {/* Mobile Sticky Pay Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
             <div className="flex items-center justify-between mb-2">
                 <span className="text-gray-600 font-medium">Total:</span>
                 <span className="text-xl font-bold text-purple-700">{formatPrice(totalPrice)}</span>
            </div>
            <Button 
                size="lg" 
                className={`w-full h-12 text-lg font-bold shadow-md ${
                    paymentMethod === 'momo' 
                    ? 'bg-pink-600 hover:bg-pink-700' 
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
                onClick={handleCheckout}
                disabled={loading}
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                    </>
                ) : (
                    `Pay with ${paymentMethod === 'momo' ? 'MoMo' : 'Card'}`
                )}
            </Button>
        </div>
        
        {/* Spacer */}
        <div className="h-28 lg:hidden"></div>
    </div>
  );
}
