"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Trash2, CreditCard, ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getCourseThumbnail } from "@/lib/image-utils";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, removeFromCart, clearCart, totalPrice, itemCount, checkoutIds, setCheckoutSelection, selectedTotal } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [purchasedIds, setPurchasedIds] = useState<number[]>([]);

  useEffect(() => {
      async function checkPurchased() {
          if (user) {
              try {
                  const { getMyCourses } = await import('@/lib/api');
                  const data = await getMyCourses();
                  const ids = data.courses?.map((c: any) => c.course.id) || [];
                  setPurchasedIds(ids);
              } catch (e) {
                  console.error("Failed to check purchased courses", e);
              }
          }
      }
      checkPurchased();
  }, [user]);

  // Auto-select all on mount if selection is empty (default behavior)
  // Or keep as is. Let's auto-select all for UX if nothing selected.
  /*
  useEffect(() => {
    if (items.length > 0 && checkoutIds.length === 0) {
        setCheckoutSelection(items.map(i => i.id));
    }
  }, [items]);
  */
  
  const toggleSelection = (id: number) => {
      if (checkoutIds.includes(id)) {
          setCheckoutSelection(checkoutIds.filter(i => i !== id));
      } else {
          setCheckoutSelection([...checkoutIds, id]);
      }
  };

  const handleSelectAll = (checked: boolean) => {
      if (checked) {
          // Only select items that are NOT purchased
          const availableIds = items.filter(i => !purchasedIds.includes(i.id)).map(i => i.id);
          setCheckoutSelection(availableIds);
      } else {
          setCheckoutSelection([]);
      }
  };

  const handleCheckout = () => {
      router.push('/checkout');
  };

  if (itemCount === 0) {
    return (
      <div className="container mx-auto py-20 px-4">
        <div className="text-center max-w-md mx-auto">
          <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-6" />
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">
            Keep shopping to find a course!
          </p>
          <Link href="/">
            <Button size="lg">Keep Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
          </Button>
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <p className="text-gray-600 mb-4 flex items-center gap-2">
            <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                checked={items.length > 0 && checkoutIds.length === items.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
            />
            <span>Select all ({itemCount} items)</span>
          </p>
          
          {items.map((item) => (
            <Card key={item.id} className="flex flex-col sm:flex-row">
              <div className="flex items-center pl-4 py-4 sm:py-0">
                  {purchasedIds.includes(item.id) ? (
                      <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full whitespace-nowrap">
                          Purchased
                      </span>
                  ) : (
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        checked={checkoutIds.includes(item.id)}
                        onChange={() => toggleSelection(item.id)}
                      />
                  )}
              </div>
              <div className="sm:w-40 h-32 sm:h-auto overflow-hidden rounded-t-lg sm:rounded-l-lg sm:rounded-t-none">
                <img
                  src={getCourseThumbnail(item.id, item.thumbnail)}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="flex-1 p-4 flex flex-col sm:flex-row justify-between">
                <div className="flex-1">
                  <Link href={`/course/${item.slug}`}>
                    <h3 className="font-semibold hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">
                    By {item.instructor_name}
                  </p>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between mt-4 sm:mt-0 sm:ml-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      {formatPrice(item.current_price)}
                    </p>
                    {item.has_discount && (
                      <p className="text-sm text-gray-400 line-through">
                        {formatPrice(item.price)}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={clearCart}
            className="mt-4"
          >
            Clear Cart
          </Button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({checkoutIds.length} items)</span>
                <span className="font-medium">{formatPrice(selectedTotal)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(selectedTotal)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              {user ? (
                <Button 
                    className="w-full h-12 text-lg font-bold bg-purple-600 hover:bg-purple-700" 
                    size="lg" 
                    onClick={handleCheckout} 
                    disabled={isCheckingOut || checkoutIds.length === 0}
                >
                  Proceed to Checkout
                </Button>
              ) : (
                <div className="w-full space-y-2">
                  <Link href="/login?redirect=/cart" className="block">
                    <Button className="w-full" size="lg">
                      Log in to Checkout
                    </Button>
                  </Link>
                  <p className="text-xs text-center text-gray-500">
                    New to Studigo?{" "}
                    <Link href="/register" className="text-primary hover:underline">
                      Sign up
                    </Link>
                  </p>
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* Mobile Sticky Checkout Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
          <div className="flex items-center justify-between mb-2">
               <span className="text-gray-600 font-medium">Total:</span>
               <span className="text-xl font-bold text-primary">{formatPrice(selectedTotal)}</span>
          </div>
          <Button 
                className="w-full h-12 text-lg font-bold bg-purple-600 hover:bg-purple-700" 
                onClick={handleCheckout} 
                disabled={isCheckingOut || checkoutIds.length === 0}
            >
              Checkout ({checkoutIds.length})
          </Button>
      </div>

      {/* Spacer to prevent content from being hidden behind sticky bar */}
      <div className="h-24 lg:hidden"></div>

    </div>
  );
}
