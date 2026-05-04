'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Loader2, Smartphone, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

function MockPaymentContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const [processing, setProcessing] = useState(false);
    
    // Params from backend
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');
    const requestId = searchParams.get('requestId');
    
    if (!orderId || !amount) {
        return <div className="p-8 text-center text-red-500">Invalid Payment Params</div>
    }

    const handlePayment = async (status: 'success' | 'failed') => {
        setProcessing(true);
        try {
            // Mock the Webhook Call from "MoMo Server" to "Our Server"
            // In real life, MoMo Server does this. Here, Browser does it.
            const webhookPayload = {
                partnerCode: "MOCK_PARTNER",
                accessKey: "MOCK_ACCESS",
                requestId: requestId,
                amount: amount,
                orderId: orderId,
                orderInfo: "Mock Payment",
                orderType: "momo_wallet",
                transId: `TRANS-${Date.now()}`,
                resultCode: status === 'success' ? 0 : 1006,
                message: status === 'success' ? "Success" : "User cancelled",
                payType: "qr",
                responseTime: Date.now(),
                extraData: "",
                signature: "MOCK_SIGNATURE" // Our mock provider ignores this or checks for valid mock sig
            };
            
            // Call the webhook endpoint (proxied via our API client for convenience, 
            // but effectively hitting the backend)
            // Note: We use the momo endpoint we defined in backend
            await api.post('/payments/momo/webhook/', webhookPayload);
            
            // Redirect back to main app
            if (status === 'success') {
                router.push(`/checkout/success?order_id=${orderId}`);
            } else {
                router.push(`/checkout?error=cancelled`);
            }
            
        } catch (error) {
            console.error("Mock Webhook Failed", error);
            toast({
                title: "System Error",
                description: "Failed to simulate callback",
                variant: 'destructive'
            });
            setProcessing(false);
        }
    };

    return (
        <Card className="max-w-md w-full p-6 shadow-xl border-pink-200 bg-pink-50/50">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Smartphone className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">MoMo Simulator</h1>
                <p className="text-sm text-gray-500 font-mono mt-1">Dev Mode Checkpoint</p>
            </div>
            
            <div className="space-y-4 bg-white p-4 rounded-xl border border-pink-100 mb-6">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Order ID</span>
                    <span className="font-mono font-bold text-gray-900">{orderId}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-bold text-pink-600 text-lg">{parseInt(amount).toLocaleString()} đ</span>
                </div>
            </div>

            <div className="space-y-3">
                <Button 
                    className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg"
                    onClick={() => handlePayment('success')}
                    disabled={processing}
                >
                    {processing ? <Loader2 className="animate-spin" /> : <CheckCircle className="mr-2 w-5 h-5" />}
                    Approve Payment (Success)
                </Button>
                
                <Button 
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50 h-12"
                    onClick={() => handlePayment('failed')}
                    disabled={processing}
                >
                    <XCircle className="mr-2 w-5 h-5" />
                    Reject Payment (Fail)
                </Button>
            </div>
            
             <p className="text-xs text-center text-gray-400 mt-6">
                This is a MOCK payment page. No real money is charged.
            </p>
        </Card>
    );
}

export default function MockMoMoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Suspense fallback={<div>Loading...</div>}>
         <MockPaymentContent />
      </Suspense>
    </div>
  );
}
