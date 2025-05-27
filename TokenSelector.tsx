import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Coins, DollarSign, TrendingDown, Shield } from "lucide-react";

export interface SupportedToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  icon: string;
  isStablecoin: boolean;
  minimumAmount: string;
  balance?: string;
}

interface TokenSelectorProps {
  selectedToken: SupportedToken | null;
  onTokenSelect: (token: SupportedToken) => void;
  amount: string;
  onAmountChange: (amount: string) => void;
  label?: string;
}

// Supported tokens configuration with Bitcoin
export const SUPPORTED_TOKENS: SupportedToken[] = [
  {
    address: "0x0000000000000000000000000000000000000000", // ETH
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    icon: "⟐",
    isStablecoin: false,
    minimumAmount: "0.001",
  },
  {
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    decimals: 8,
    icon: "₿",
    isStablecoin: false,
    minimumAmount: "0.0001",
  },
  {
    address: "0xA0b86a33E6417aB0C8a3cf5e7c8D9Ca57fE9B4d2",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    icon: "🔵",
    isStablecoin: true,
    minimumAmount: "1",
  },
  {
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    symbol: "DAI",
    name: "Dai Stablecoin",
    decimals: 18,
    icon: "🟡",
    isStablecoin: true,
    minimumAmount: "1",
  },
  {
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    icon: "🟢",
    isStablecoin: true,
    minimumAmount: "1",
  },
];

export default function TokenSelector({ 
  selectedToken, 
  onTokenSelect, 
  amount, 
  onAmountChange, 
  label = "Payment Amount" 
}: TokenSelectorProps) {
  const [showAllTokens, setShowAllTokens] = useState(false);

  const formatBalance = (balance: string, decimals: number) => {
    const num = parseFloat(balance);
    return num.toFixed(decimals > 6 ? 4 : 2);
  };

  const validateAmount = (value: string): boolean => {
    if (!selectedToken || !value) return false;
    const numValue = parseFloat(value);
    const minAmount = parseFloat(selectedToken.minimumAmount);
    return numValue >= minAmount;
  };

  const getTokenRecommendation = (token: SupportedToken) => {
    if (token.isStablecoin) {
      return {
        type: "stable",
        message: "Stable value - No volatility risk",
        icon: <Shield className="w-4 h-4 text-green-500" />
      };
    } else {
      return {
        type: "volatile",
        message: "Price may fluctuate",
        icon: <TrendingDown className="w-4 h-4 text-yellow-500" />
      };
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">{label}</label>
          <Badge variant="outline" className="text-xs">
            <Coins className="w-3 h-3 mr-1" />
            Multi-Token Support
          </Badge>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg text-lg font-medium ${
                amount && !validateAmount(amount) 
                  ? "border-red-500 focus:border-red-500" 
                  : "border-gray-300 focus:border-blue-500"
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            />
          </div>
          
          {amount && selectedToken && !validateAmount(amount) && (
            <p className="text-sm text-red-500">
              Minimum amount: {selectedToken.minimumAmount} {selectedToken.symbol}
            </p>
          )}
        </div>

        {/* Token Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Payment Token</label>
          
          {/* Quick Selection - Popular Tokens */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {SUPPORTED_TOKENS.slice(0, 4).map((token) => {
              const isSelected = selectedToken?.address === token.address;
              const recommendation = getTokenRecommendation(token);
              
              return (
                <button
                  key={token.address}
                  onClick={() => onTokenSelect(token)}
                  className={`p-3 rounded-lg border transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{token.icon}</span>
                    <div className="text-left">
                      <div className="font-medium text-sm">{token.symbol}</div>
                      <div className="text-xs text-muted-foreground">{token.name}</div>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className="mt-2 flex items-center space-x-1">
                      {recommendation.icon}
                      <span className="text-xs text-muted-foreground">
                        {recommendation.message}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Token Details */}
          {selectedToken && (
            <Card className="bg-gray-50 dark:bg-gray-900">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{selectedToken.icon}</span>
                    <div>
                      <h3 className="font-medium">{selectedToken.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedToken.symbol} • {selectedToken.decimals} decimals
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {selectedToken.balance && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Balance: </span>
                        <span className="font-medium">
                          {formatBalance(selectedToken.balance, selectedToken.decimals)} {selectedToken.symbol}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-1 mt-1">
                      {getTokenRecommendation(selectedToken).icon}
                      <span className="text-xs text-muted-foreground">
                        {selectedToken.isStablecoin ? "Stablecoin" : "Volatile"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Platform Fee Information */}
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Platform Fee (2.5%)</span>
                    <span className="font-medium">
                      {amount ? (parseFloat(amount) * 0.025).toFixed(selectedToken.decimals > 6 ? 4 : 2) : "0"} {selectedToken.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-medium mt-1">
                    <span>Total Required</span>
                    <span>
                      {amount ? (parseFloat(amount) * 1.025).toFixed(selectedToken.decimals > 6 ? 4 : 2) : "0"} {selectedToken.symbol}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* More Tokens Dropdown */}
          {SUPPORTED_TOKENS.length > 4 && (
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => setShowAllTokens(!showAllTokens)}
                className="w-full"
              >
                {showAllTokens ? "Show Less" : "More Payment Options"}
              </Button>
              
              {showAllTokens && (
                <Select onValueChange={(address) => {
                  const token = SUPPORTED_TOKENS.find(t => t.address === address);
                  if (token) onTokenSelect(token);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose another token" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_TOKENS.slice(4).map((token) => (
                      <SelectItem key={token.address} value={token.address}>
                        <div className="flex items-center space-x-2">
                          <span>{token.icon}</span>
                          <span>{token.symbol} - {token.name}</span>
                          {token.isStablecoin && (
                            <Badge variant="secondary" className="text-xs">Stable</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
        </div>

        {/* Payment Security Notice */}
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-2">
            <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Secure Escrow:</strong> Your payment is held in a smart contract until work is completed. 
              Platform fees support dispute resolution and community governance.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}