import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Fuel, Gauge, Luggage, MapPin, Star, Check, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageGallery from "@/components/ImageGallery";
import BookingModal from "@/components/BookingModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { carsData } from "@/data/carsData";

const CarDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const car = carsData.find((c) => c.slug === slug);

  if (!car) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Car Not Found</h1>
            <p className="text-muted-foreground mb-6">The vehicle you're looking for doesn't exist.</p>
            <Button asChild>
              <Link to="/cars">Browse All Cars</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const specs = [
    { icon: Users, label: "Seats", value: `${car.seats} Passengers` },
    { icon: Fuel, label: "Fuel", value: car.fuel },
    { icon: Gauge, label: "Transmission", value: car.transmission },
    { icon: Luggage, label: "Luggage", value: `${car.luggage} Bags` },
    { icon: MapPin, label: "Location", value: car.location },
    { icon: Calendar, label: "Year", value: car.year.toString() },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="pt-20 flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Results
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Images & Description */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image Gallery */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <ImageGallery images={car.images} carName={car.name} />
              </motion.div>

              {/* Car Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    {/* Mobile-optimized header */}
                    <div className="space-y-3">
                      {/* Title and Price Row */}
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="text-xl sm:text-3xl leading-tight flex-1">{car.name}</CardTitle>
                        <div className="text-right flex-shrink-0">
                          <div className="flex items-baseline gap-0.5 sm:gap-1">
                            <span className="text-lg sm:text-2xl font-bold text-primary">Rs</span>
                            <span className="text-2xl sm:text-4xl font-bold text-primary">{car.pricePerDay}</span>
                          </div>
                          <span className="text-xs sm:text-sm text-muted-foreground">/day</span>
                        </div>
                      </div>
                      
                      {/* Badges and Rating Row */}
                      <div className="flex items-center flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-blue-600 text-white hover:bg-blue-700 text-xs sm:text-sm">
                          {car.type}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-primary text-primary" />
                          <span className="font-semibold text-sm sm:text-base">{car.rating}</span>
                          <span className="text-muted-foreground text-xs sm:text-sm">(127 reviews)</span>
                        </div>
                        {car.discounts && car.discounts.length > 0 && (
                          <Badge variant="destructive" className="text-xs sm:text-sm ml-auto">
                            Save {car.discounts[0].percentage}% on {car.discounts[0].days}+ days
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Description</h3>
                      <p className="text-muted-foreground leading-relaxed">{car.description}</p>
                    </div>

                    <Separator />

                    {/* Specifications */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Specifications</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {specs.map((spec) => (
                          <div key={spec.label} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                            <spec.icon className="h-5 w-5 text-primary flex-shrink-0" />
                            <div>
                              <p className="text-xs text-muted-foreground">{spec.label}</p>
                              <p className="font-medium">{spec.value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Features */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Features & Amenities</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {car.features.map((feature) => (
                          <div key={feature} className="flex items-center gap-2">
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                              <Check className="h-3 w-3 text-primary" />
                            </div>
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Mileage Policy */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Mileage Policy</h3>
                      <p className="text-muted-foreground">{car.mileage}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right Column - Booking Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-24">
                <Card className="shadow-custom-lg">
                  <CardHeader>
                    <CardTitle>Book This Vehicle</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Daily Rate:</span>
                        <span className="font-semibold">Rs {car.pricePerDay}/day</span>
                      </div>
                      {car.discounts && car.discounts.length > 0 && (
                        <div className="text-sm text-primary">
                          <Check className="inline h-4 w-4 mr-1" />
                          Up to {car.discounts[car.discounts.length - 1].percentage}% off on long rentals
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={() => setIsBookingOpen(true)}
                      size="lg"
                      className="w-full shadow-red"
                    >
                      Book Now
                    </Button>

                    <div className="pt-4 border-t border-border space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Check className="h-4 w-4 text-primary" />
                        <span>Free cancellation up to 24 hours</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Check className="h-4 w-4 text-primary" />
                        <span>No hidden fees</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Check className="h-4 w-4 text-primary" />
                        <span>24/7 roadside assistance</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Check className="h-4 w-4 text-primary" />
                        <span>Fully insured vehicles</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h4 className="font-semibold">Need Help?</h4>
                      <p className="text-sm text-muted-foreground">
                        Our team is available 24/7 to assist you
                      </p>
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/contact">Contact Support</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />

      <BookingModal
        car={car}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </div>
  );
};

export default CarDetails;
