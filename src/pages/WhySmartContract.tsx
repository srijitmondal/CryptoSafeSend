
import React from "react";
import { Link } from "react-router-dom";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const WhySmartContract = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-black">
    <div className="max-w-lg w-full p-8 rounded-3xl bg-black/70 border border-gray-800/60 shadow-2xl text-center">
      <Shield className="mx-auto text-purple-400 mb-5" size={48} />
      <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Why Smart Contract?</h1>
      <p className="text-gray-300 mb-8 text-lg">
        CryptoSafeSend uses transparent, secure, and immutable Ethereum smart contracts. No central authority can freeze, censor, or steal your funds.
      </p>
      <Link to="/">
        <Button variant="outline" className="bg-black/30 border-gray-700/50 text-white hover:bg-black/60">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to App
        </Button>
      </Link>
    </div>
  </div>
);

export default WhySmartContract;
