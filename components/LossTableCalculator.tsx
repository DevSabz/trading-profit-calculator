'use client'

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"

interface Asset {
  name: string;
  pointsMovement: number;
  pipMovement: number;
  lotSize: number;
  pipValue: number;
}

const initialAssets: Asset[] = [
  { name: 'GOLD', pointsMovement: -2000, pipMovement: -200, lotSize: 1.00, pipValue: 19 },
  { name: 'US100', pointsMovement: -2000, pipMovement: -200, lotSize: 1.00, pipValue: 10 },
  { name: 'US30', pointsMovement: -2000, pipMovement: -200, lotSize: 1.00, pipValue: 10 },
];

const LossTableCalculator: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>(initialAssets);

  const handleInputChange = (index: number, field: keyof Asset, value: string) => {
    const updatedAssets = [...assets];
    let numValue = parseFloat(value);

    if (field === 'lotSize' && numValue < 0) {
      numValue = 0;
    }

    if (field === 'pipMovement') {
      updatedAssets[index].pointsMovement = numValue * 10;
    } else if (field === 'pointsMovement') {
      updatedAssets[index].pipMovement = numValue / 10;
    }

    updatedAssets[index] = {
      ...updatedAssets[index],
      [field]: numValue
    };

    setAssets(updatedAssets);
  };

  const calculateLoss = (asset: Asset): number => {
    return Math.abs(asset.pipMovement * asset.pipValue * asset.lotSize);
  };

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Points Movement</TableHead>
              <TableHead>Pip Movement</TableHead>
              <TableHead>Lot Size</TableHead>
              <TableHead>Loss (ZAR)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset, index) => (
              <TableRow key={index}>
                <TableCell>{asset.name}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={asset.pointsMovement}
                    onChange={(e) => handleInputChange(index, 'pointsMovement', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={asset.pipMovement}
                    onChange={(e) => handleInputChange(index, 'pipMovement', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={asset.lotSize.toFixed(2)}
                    min="0"
                    step="0.01"
                    onChange={(e) => handleInputChange(index, 'lotSize', e.target.value)}
                  />
                </TableCell>
                <TableCell>ZAR {calculateLoss(asset).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default LossTableCalculator;