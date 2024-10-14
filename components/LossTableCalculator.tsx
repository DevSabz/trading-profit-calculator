'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { RotateCcw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Asset {
  id: string;
  name: string;
  pointsMovement: number;
  pipMovement: number;
  lotSize: string;
  pipValue: number;
}

const initialAssets: Asset[] = [
  { id: '1', name: 'GOLD', pointsMovement: 100, pipMovement: 10, lotSize: '1.00', pipValue: 19 },
  { id: '2', name: 'US100', pointsMovement: 100, pipMovement: 10, lotSize: '1.00', pipValue: 17.46 },
  { id: '3', name: 'US30', pointsMovement: 100, pipMovement: 10, lotSize: '1.00', pipValue: 17.46 },
];

const SabzPipOrPerishCalculator: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [startPrice, setStartPrice] = useState<string>('');
  const [endPrice, setEndPrice] = useState<string>('');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        setError(null);
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        if (!response.ok) {
          throw new Error('Failed to fetch exchange rate');
        }
        const data = await response.json();
        const zarRate = data.rates.ZAR;
        setExchangeRate(zarRate);
        setLastUpdateTime(new Date().toLocaleTimeString());

        // Update pip values for US100 and US30
        setAssets(prevAssets => prevAssets.map(asset =>
          asset.name === 'US100' || asset.name === 'US30'
            ? { ...asset, pipValue: zarRate }
            : asset
        ));
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
        setError('Failed to fetch the latest exchange rate. Please try again later.');
      }
    };

    fetchExchangeRate();
    const intervalId = setInterval(fetchExchangeRate, 60000); // Update every minute

    return () => clearInterval(intervalId);
  }, []);

  const handleInputChange = (index: number, field: keyof Asset, value: string) => {
    const updatedAssets = [...assets];

    if (field === 'lotSize') {
      const cleanedValue = value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1');
      const parts = cleanedValue.split('.');
      let formattedValue = parts[0];

      if (parts.length > 1) {
        formattedValue += '.' + parts[1].slice(0, 2);
      } else if (cleanedValue.endsWith('.')) {
        formattedValue += '.';
      }

      updatedAssets[index][field] = formattedValue;
    } else {
      const numValue = parseFloat(value);
      updatedAssets[index][field] = numValue;

      if (field === 'pipMovement') {
        updatedAssets[index].pointsMovement = numValue * 10;
      } else if (field === 'pointsMovement') {
        updatedAssets[index].pipMovement = numValue / 10;
      }
    }

    setAssets(updatedAssets);
  };

  const calculatePipMovement = () => {
    const selectedAsset = assets.find(asset => asset.id === selectedAssetId);
    if (selectedAsset && startPrice && endPrice) {
      const start = parseFloat(startPrice);
      const end = parseFloat(endPrice);
      if (!isNaN(start) && !isNaN(end)) {
        const pipMovement = (end - start) * (selectedAsset.name === 'GOLD' ? 10 : 1);
        const updatedAssets = assets.map(asset =>
          asset.id === selectedAssetId
            ? { ...asset, pipMovement: pipMovement, pointsMovement: pipMovement * 10 }
            : asset
        );
        setAssets(updatedAssets);
      }
    }
  };

  const calculateProfitLoss = (asset: Asset): number => {
    const lotSize = parseFloat(asset.lotSize) || 0;
    return asset.pipMovement * asset.pipValue * lotSize;
  };

  const getProfitLossLabel = (value: number): string => {
    if (value === 0) return 'P/L';
    return value > 0 ? 'Profit' : 'Loss';
  };

  const getProfitLossColor = (value: number): string => {
    if (value === 0) return 'bg-gray-500 hover:bg-gray-600';
    return value > 0 ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700';
  };

  const formatProfitLoss = (value: number): string => {
    if (value === 0) return '---';
    return `R${Math.abs(value).toFixed(2)}`;
  };

  const resetAssets = () => {
    setAssets(initialAssets);
    setStartPrice('');
    setEndPrice('');
    setSelectedAssetId('');
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>
          <div>Pip, Point & Profit Calculator</div>
          <div className="text-sm font-normal mt-2">Built by: Sabz from Phoenix, Hosh. We hustling. 👍📈</div>
          {exchangeRate !== null ? (
            <div className="text-sm font-normal mt-2 flex items-center">
              <Badge variant="outline" className="px-3 py-1 text-base">
                <span className="font-semibold">$1</span>
                <span className="mx-2">=</span>
                <span className="font-semibold">R{exchangeRate.toFixed(2)}</span>
              </Badge>
              <span className="ml-2 text-xs text-gray-500">
                (Updated: {lastUpdateTime})
              </span>
            </div>
          ) : (
            <div className="text-sm font-normal mt-2">Loading exchange rate...</div>
          )}
        </CardTitle>
      </CardHeader>
      <Separator className="mb-6" />
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="start-price">Start Price</Label>
              <Input
                id="start-price"
                type="number"
                value={startPrice}
                onChange={(e) => setStartPrice(e.target.value)}
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="end-price">End Price</Label>
              <Input
                id="end-price"
                type="number"
                value={endPrice}
                onChange={(e) => setEndPrice(e.target.value)}
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="asset-select">Select Asset</Label>
              <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
                <SelectTrigger id="asset-select">
                  <SelectValue placeholder="Select an asset" />
                </SelectTrigger>
                <SelectContent>
                  {assets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={calculatePipMovement} size="sm">
              Calculate Pip Movement
            </Button>
          </div>
        </div>
        <Separator className="my-6" />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Lot Size</TableHead>
              <TableHead>Pip Movement</TableHead>
              <TableHead>Point Movement</TableHead>
              <TableHead className="text-right w-1/4">
                {getProfitLossLabel(calculateProfitLoss(assets[0]))}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset, index) => {
              const profitLoss = calculateProfitLoss(asset);
              return (
                <TableRow key={asset.id}>
                  <TableCell>{asset.name}</TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={asset.lotSize}
                      onChange={(e) => handleInputChange(index, 'lotSize', e.target.value)}
                      placeholder="1.00"
                      className="text-right"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={asset.pipMovement}
                      onChange={(e) => handleInputChange(index, 'pipMovement', e.target.value)}
                      step="any"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={asset.pointsMovement}
                      onChange={(e) => handleInputChange(index, 'pointsMovement', e.target.value)}
                      step="any"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge className={`${getProfitLossColor(profitLoss)} text-white text-lg font-semibold px-3 py-1`}>
                      {formatProfitLoss(profitLoss)}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={resetAssets}>
            <RotateCcw className="mr-2 h-4 w-4" /> Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SabzPipOrPerishCalculator;