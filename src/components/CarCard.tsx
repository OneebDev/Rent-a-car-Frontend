import { Link } from "react-router-dom";
import { Users, Fuel, Gauge, Star, Luggage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Car } from "@/data/carsData";
import { motion } from "framer-motion";

interface CarCardProps {
  car: Car;
  index?: number;
}

const CarCard = ({ car, index = 0 }: CarCardProps) => {
  return (
    <Card className="group overflow-hidden hover:shadow-custom-lg transition-all duration-300 h-full flex flex-col">
        <CardHeader className="p-0 relative overflow-hidden">
          <div className="relative h-56 overflow-hidden">
            <img
              src={car.images[0]}
              alt={car.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 flex-grow">
          <div className="space-y-3">
            {/* Title and Price Row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-xl font-bold text-foreground leading-tight line-clamp-2">
                  {car.name}
                </h3>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="flex items-baseline gap-0.5 sm:gap-1">
                  <span className="text-lg sm:text-2xl font-bold text-primary">Rs</span>
                  <span className="text-xl sm:text-3xl font-bold text-primary">{car.pricePerDay}</span>
                </div>
                <span className="text-[10px] sm:text-xs text-muted-foreground">/day</span>
              </div>
            </div>

            {/* Badges and Rating Row */}
            <div className="flex items-center flex-wrap gap-2">
              <Badge variant="secondary" className="bg-blue-600 text-white hover:bg-blue-700 text-xs">
                {car.type}
              </Badge>
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                <span className="text-xs sm:text-sm font-semibold">{car.rating}</span>
                <span className="text-xs text-muted-foreground">(127 reviews)</span>
              </div>
              {car.discounts && car.discounts.length > 0 && (
                <Badge variant="destructive" className="text-xs ml-auto">
                  Save {car.discounts[0].percentage}% on {car.discounts[0].days}+ days
                </Badge>
              )}
            </div>

            {/* Car Details Grid */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm pt-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                <span>{car.seats} Seats</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Fuel className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-secondary flex-shrink-0" />
                <span>{car.fuel}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Gauge className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                <span>{car.transmission}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Luggage className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-secondary flex-shrink-0" />
                <span>{car.luggage} Bags</span>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 sm:p-5 pt-0">
          <Button asChild className="w-full shadow-red text-xs sm:text-sm font-semibold">
            <Link to={`/cars/${car.slug}`}>View Details</Link>
          </Button>
        </CardFooter>
      </Card>
  );
};

export default CarCard;
