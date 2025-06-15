
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface FuelPricesGridProps {
  fuelPrices:
    | Array<{
        id: number;
        station_id: number;
        fuel_type: "PETROL" | "DIESEL" | "CNG" | "EV";
        price_per_litre: number;
        valid_from: string;
        created_by: number;
        created_at: string;
      }>
    | undefined;
  isOwner: boolean;
  isAdmin: boolean;
  onEdit: (fuelType: string, price: number, id: number) => void;
}

const getFuelTypeColor = (fuelType: string) => {
  switch (fuelType) {
    case 'PETROL': return 'bg-blue-100 text-blue-800';
    case 'DIESEL': return 'bg-orange-100 text-orange-800';
    case 'CNG': return 'bg-green-100 text-green-800';
    case 'EV': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const FuelPricesGrid: React.FC<FuelPricesGridProps> = ({
  fuelPrices,
  isOwner,
  isAdmin,
  onEdit,
}) => {
  if (!fuelPrices || fuelPrices.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {fuelPrices.map((price) => (
        <Card key={`${price.station_id}-${price.fuel_type}`}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5" />
                  {price.fuel_type}
                </CardTitle>
                <CardDescription>
                  Current Price
                </CardDescription>
              </div>
              <Badge className={getFuelTypeColor(price.fuel_type)}>
                {price.fuel_type}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary flex items-center gap-1">
              <IndianRupee className="w-5 h-5" />
              {price.price_per_litre.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              <div>Updated: {new Date(price.valid_from).toLocaleDateString()}</div>
              <div>Valid from: {new Date(price.valid_from).toLocaleString()}</div>
            </div>
            {(isOwner || isAdmin) && (
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => onEdit(price.fuel_type, price.price_per_litre, price.id)}
              >
                Edit
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
