
import React from "react";
import { Link } from "react-router-dom";
import { Zap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const WhyLightningFast = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-black">
    <div className="max-w-lg w-full p-8 rounded-3xl bg-black/70 border border-gray-800/60 shadow-2xl text-center">
      <Zap className="mx-auto text-pink-400 mb-5" size={48} />
      <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-yellow-400 bg-clip-text text-transparent">Why Lightning Fast?</h1>
      <p className="text-gray-300 mb-8 text-lg">
        CryptoSafeSend is optimized for speed – create, claim, and manage your secure ETH transfers in seconds, all with minimal gas fees.
      </p>
      <Link to="/">
        <Button variant="outline" className="bg-black/30 border-gray-700/50 text-white hover:bg-black/60">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to App
        </Button>
      </Link>
    </div>
  </div>
);

export default WhyLightningFast;
