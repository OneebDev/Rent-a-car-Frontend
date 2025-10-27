import { useState } from "react";
import { X, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-hot-toast";
import type { Car } from "@/data/carsData";
// import { supabase } from "@/integrations/supabase/client"; // Commented out - using Resend directly

interface BookingModalProps {
  car: Car;
  isOpen: boolean;
  onClose: () => void;
}

const BookingModal = ({ car, isOpen, onClose }: BookingModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cnic: "",
    pickupDate: "",
    pickupTime: "10:00",
    returnDate: "",
    returnTime: "10:00",
    pickupLocation: "",
    dropoffLocation: "",
  });
  const [differentDropoff, setDifferentDropoff] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  // CNIC validation function for Pakistan format (42101-1234567-8)
  const validateCNIC = (cnic: string) => {
    const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
    return cnicRegex.test(cnic);
  };

  // CNIC input formatting function
  const formatCNIC = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as 42101-1234567-8
    if (digits.length <= 5) {
      return digits;
    } else if (digits.length <= 12) {
      return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    } else {
      return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
    }
  };

  const calculateDays = () => {
    if (!formData.pickupDate || !formData.returnDate) return 0;
    const pickup = new Date(formData.pickupDate);
    const returnDate = new Date(formData.returnDate);
    const diff = returnDate.getTime() - pickup.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const calculateTotal = () => {
    const days = calculateDays();
    let total = days * car.pricePerDay;

    // Apply discount if applicable
    if (car.discounts) {
      const applicableDiscount = car.discounts
        .filter((d) => days >= d.days)
        .sort((a, b) => b.percentage - a.percentage)[0];

      if (applicableDiscount) {
        total = total * (1 - applicableDiscount.percentage / 100);
      }
    }

    return total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }

    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.cnic || !formData.pickupDate || !formData.returnDate || !formData.pickupLocation) {
      toast.error("Please fill in all fields");
      return;
    }

    if (differentDropoff && !formData.dropoffLocation) {
      toast.error("Please fill in drop-off location");
      return;
    }

    if (new Date(formData.returnDate) <= new Date(formData.pickupDate)) {
      toast.error("Return date must be after pickup date");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Phone validation (basic)
    const phoneRegex = /^\+?[\d\s-()]+$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    // CNIC validation
    if (!validateCNIC(formData.cnic)) {
      toast.error("Please enter a valid CNIC in format: 42101-1234567-8");
      return;
    }

    // Set submitting state and clear form immediately
    setIsSubmitting(true);
    
    // Clear form fields immediately after starting submission
    setFormData({
      name: "",
      email: "",
      phone: "",
      cnic: "",
      pickupDate: "",
      pickupTime: "10:00",
      returnDate: "",
      returnTime: "10:00",
      pickupLocation: "",
      dropoffLocation: "",
    });
    setDifferentDropoff(false);

    // Send email notification using Resend directly
    try {
      const emailData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        cnic: formData.cnic,
        carName: car.name,
        pickupLocation: formData.pickupLocation,
        dropoffLocation: differentDropoff ? formData.dropoffLocation : formData.pickupLocation,
        pickupDate: formData.pickupDate,
        pickupTime: formData.pickupTime,
        returnDate: formData.returnDate,
        returnTime: formData.returnTime,
        totalDays: days.toString(),
        totalPrice: total.toFixed(2),
      };
      
      console.log('Sending email with data:', emailData);
      console.log('CNIC being sent:', emailData.cnic);
      
      // Call your backend API endpoint that uses Resend
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://rent-a-car-backend-t3c9.vercel.app'}/api/send-booking-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'booking',
          data: emailData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      toast.success(`Booking request submitted! We'll contact you at ${formData.email}`);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Booking submitted but email notification failed");
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  const days = calculateDays();
  const total = calculateTotal();
  const savings = days > 0 ? days * car.pricePerDay - total : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl pr-8">Book {car.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pb-2">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Personal Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+92 3XX XXXXXXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnic">CNIC Number *</Label>
              <Input
                id="cnic"
                type="text"
                placeholder="42101-1234567-8"
                value={formData.cnic}
                onChange={(e) => {
                  const formatted = formatCNIC(e.target.value);
                  setFormData({ ...formData, cnic: formatted });
                }}
                maxLength={15}
              />
            </div>
          </div>

          {/* Rental Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Rental Details</h3>

            <div className="space-y-2">
              <Label htmlFor="pickup-location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Pick-up location *
              </Label>
              <Input
                id="pickup-location"
                placeholder="Airport, city or station"
                value={formData.pickupLocation}
                onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2 py-2">
              <Checkbox
                id="different-dropoff"
                checked={differentDropoff}
                onCheckedChange={(checked) => {
                  setDifferentDropoff(checked as boolean);
                  if (!checked) {
                    setFormData({ ...formData, dropoffLocation: "" });
                  }
                }}
              />
              <label
                htmlFor="different-dropoff"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Drop car off at different location
              </label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dropoff-location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-secondary" />
                Drop-off location {differentDropoff && "*"}
              </Label>
              <Input
                id="dropoff-location"
                placeholder="Airport, city or station"
                value={differentDropoff ? formData.dropoffLocation : formData.pickupLocation}
                onChange={(e) => setFormData({ ...formData, dropoffLocation: e.target.value })}
                disabled={!differentDropoff}
                className={!differentDropoff ? "opacity-50 cursor-not-allowed" : ""}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pickup-date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Pick-up date *
                </Label>
                <Input
                  id="pickup-date"
                  type="date"
                  min={today}
                  value={formData.pickupDate}
                  onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickup-time">Time *</Label>
                <Input
                  id="pickup-time"
                  type="time"
                  value={formData.pickupTime}
                  onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="return-date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-secondary" />
                  Drop-off date *
                </Label>
                <Input
                  id="return-date"
                  type="date"
                  min={formData.pickupDate || today}
                  value={formData.returnDate}
                  onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="return-time">Time *</Label>
                <Input
                  id="return-time"
                  type="time"
                  value={formData.returnTime}
                  onChange={(e) => setFormData({ ...formData, returnTime: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Price Summary */}
          {days > 0 && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h3 className="font-semibold text-lg mb-3">Price Summary</h3>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rental Period:</span>
                <span className="font-medium">{days} {days === 1 ? 'day' : 'days'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Daily Rate:</span>
                <span className="font-medium">Rs {car.pricePerDay}/day</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-sm text-primary">
                  <span>Discount Applied:</span>
                  <span className="font-medium">-Rs {savings.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t border-border pt-2 mt-2">
                <span>Total:</span>
                <span className="text-primary">Rs {total.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 shadow-red" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Confirm Booking"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
