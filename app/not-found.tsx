import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Ghost } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-black text-white gap-6 text-center px-4">
      <Ghost className="h-24 w-24 text-purple-600 animate-bounce" />
      <div className="space-y-2">
        <h1 className="text-6xl font-extrabold tracking-tight lg:text-8xl text-purple-600 mb-4">
          404
        </h1>
        <h2 className="text-3xl font-bold text-white mb-2">Page Not Found</h2>
        <p className="max-w-[500px] text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          Oops! The page you are looking for seems to have vanished into the digital void.
        </p>
      </div>
      <Link href="/">
        <Button className="bg-white text-black hover:bg-gray-200 font-bold px-8 py-6 text-lg">
          Go back home
        </Button>
      </Link>
    </div>
  );
}
