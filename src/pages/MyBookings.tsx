import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, Car, CheckCircle, XCircle, AlertCircle, Eye, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { listBookingsByStatus } from "@/services/firestore";

interface Booking {
  id: string;
  carName: string;
  carImage: string;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  dropoffLocation: string;
  totalDays: number;
  totalPrice: number;
  status: 'active' | 'scheduled' | 'completed' | 'cancelled';
  bookingDate: string;
  rating?: number;
}

const MyBookings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("active");

  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const res = await listBookingsByStatus(user.uid);
      // flatten with tag retained if needed; we can compute per status below
      const all = [...res.active, ...res.scheduled, ...res.history] as unknown as Booking[];
      setBookings(all);
    };
    load();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'scheduled':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      scheduled: "secondary",
      completed: "outline",
      cancelled: "destructive"
    } as const;

    const colors = {
      active: "bg-green-100 text-green-800 border-green-200",
      scheduled: "bg-blue-100 text-blue-800 border-blue-200",
      completed: "bg-gray-100 text-gray-800 border-gray-200",
      cancelled: "bg-red-100 text-red-800 border-red-200"
    };

    return (
      <Badge 
        variant={variants[status as keyof typeof variants] || "outline"}
        className={colors[status as keyof typeof colors] || ""}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleCancelBooking = (id: string) => {
    setBookings(bookings.map(booking => 
      booking.id === id 
        ? { ...booking, status: 'cancelled' as const }
        : booking
    ));
    toast.success("Booking cancelled successfully!");
  };

  const handleRateBooking = (id: string, rating: number) => {
    setBookings(bookings.map(booking => 
      booking.id === id 
        ? { ...booking, rating }
        : booking
    ));
    toast.success("Thank you for your rating!");
  };

  const handleViewDetails = (booking: Booking) => {
    toast.success(`Viewing details for ${booking.carName}`);
    // Here you would typically open a modal or navigate to details page
  };

  const activeBookings = bookings.filter(b => b.status === 'active');
  const scheduledBookings = bookings.filter(b => b.status === 'scheduled');
  const historyBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Car Image */}
            <div className="md:w-48 w-full h-32 md:h-32 bg-muted rounded-lg flex items-center justify-center">
              <Car className="h-12 w-12 text-muted-foreground" />
            </div>

            {/* Booking Details */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                <div>
                  <h3 className="text-xl font-semibold text-primary">{booking.carName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(booking.status)}
                    {getStatusBadge(booking.status)}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">Rs {booking.totalPrice.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{booking.totalDays} days</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Pickup:</span>
                  <span>{new Date(booking.pickupDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Return:</span>
                  <span>{new Date(booking.returnDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Pickup:</span>
                  <span>{booking.pickupLocation}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Dropoff:</span>
                  <span>{booking.dropoffLocation}</span>
                </div>
              </div>

              {/* Rating for completed bookings */}
              {booking.status === 'completed' && booking.rating && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Your Rating:</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < booking.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(booking)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                
                {booking.status === 'active' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCancelBooking(booking.id)}
                  >
                    Cancel Booking
                  </Button>
                )}

                {booking.status === 'scheduled' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCancelBooking(booking.id)}
                  >
                    Cancel Booking
                  </Button>
                )}

                {booking.status === 'completed' && !booking.rating && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Rate:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRateBooking(booking.id, star)}
                        className="text-gray-300 hover:text-yellow-400 transition-colors"
                      >
                        <Star className="h-4 w-4" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <div className="pt-20 flex-grow">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto"
          >
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-primary mb-2">My Bookings</h1>
              <p className="text-muted-foreground">Manage your car rental bookings</p>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="active" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Active ({activeBookings.length})
                </TabsTrigger>
                <TabsTrigger value="scheduled" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Scheduled ({scheduledBookings.length})
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  History ({historyBookings.length})
                </TabsTrigger>
              </TabsList>

              {/* Active Bookings */}
              <TabsContent value="active" className="space-y-6">
                {activeBookings.length > 0 ? (
                  <div className="space-y-4">
                    {activeBookings.map((booking) => (
                      <BookingCard key={booking.id} booking={booking} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Car className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Active Bookings</h3>
                      <p className="text-muted-foreground">You don't have any active bookings at the moment.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Scheduled Bookings */}
              <TabsContent value="scheduled" className="space-y-6">
                {scheduledBookings.length > 0 ? (
                  <div className="space-y-4">
                    {scheduledBookings.map((booking) => (
                      <BookingCard key={booking.id} booking={booking} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Clock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Scheduled Bookings</h3>
                      <p className="text-muted-foreground">You don't have any scheduled bookings.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* History Bookings */}
              <TabsContent value="history" className="space-y-6">
                {historyBookings.length > 0 ? (
                  <div className="space-y-4">
                    {historyBookings.map((booking) => (
                      <BookingCard key={booking.id} booking={booking} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Booking History</h3>
                      <p className="text-muted-foreground">You haven't completed any bookings yet.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MyBookings;
