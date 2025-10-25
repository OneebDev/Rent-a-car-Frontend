import { motion } from "framer-motion";
import { Shield, Clock, ThumbsUp, Award, Star, Quote } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchForm from "@/components/SearchForm";
import CarCard from "@/components/CarCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { carsData } from "@/data/carsData";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const Home = () => {
  const featuredCars = carsData.sort((a, b) => b.rating - a.rating).slice(0, 6);

  const features = [
    { icon: Shield, title: "Best Price Guarantee", description: "Find the lowest prices or we'll refund the difference" },
    { icon: Clock, title: "24/7 Support", description: "Our team is always here to help you, anytime" },
    { icon: ThumbsUp, title: "Easy Booking", description: "Book your car in just a few clicks" },
    { icon: Award, title: "Premium Fleet", description: "Only the newest and best-maintained vehicles" },
  ];

  const testimonials = [
    { name: "Sarah Johnson", role: "Business Traveler", content: "Exceptional service! The BMW X5 was in perfect condition and the booking process was seamless.", rating: 5 },
    { name: "Michael Chen", role: "Family Vacation", content: "Great selection of vehicles. We rented a Yukon for our family trip and it was perfect!", rating: 5 },
    { name: "Emma Davis", role: "Weekend Getaway", content: "Affordable prices and excellent customer support. Will definitely rent from M-Rent again!", rating: 5 },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* 🌤 Light Theme Hero Section */}
      <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden bg-white pt-20 pb-16 sm:pb-20"  >
        {/* Animated Light Gradient Background */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(255,0,0,0.1) 40%, rgba(0,85,255,0.1) 100%)",
              "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(0,85,255,0.1) 40%, rgba(255,0,0,0.1) 100%)",
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />

        {/* Background Image (soft, not blurred) */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroBg})` }}
        />



        {/* Hero Text + Search Box */}
        <div className="relative z-10 text-center container mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight text-gray-900"
          >
            Premium <span className="text-red-600">Car Rental</span>
            <br />
            <motion.span
              className="bg-gradient-to-r from-red-600 to-blue-600 text-transparent bg-clip-text"
              animate={{ backgroundPosition: ["0%", "100%"] }}
              transition={{ duration: 6, repeat: Infinity, repeatType: "mirror" }}
            >
              Made Simple
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-sm sm:text-base md:text-lg lg:text-2xl mt-4 sm:mt-6 text-gray-700 max-w-3xl mx-auto px-4"
          >
            Pakistan's Premier Car Rental Service - Choose from our luxury fleet and elevate your driving experience.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-6 sm:mt-8 md:mt-10 px-4 sm:px-0 mb-8"
          >
            <SearchForm />
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 sm:py-20 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose <span className="text-primary">M-Rent A Car</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the difference with our premium service and commitment to excellence
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center h-full hover:shadow-red transition-shadow">
                  <CardContent className="pt-8 pb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-accent mb-4">
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Featured <span className="text-secondary">Vehicles</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover our handpicked selection of premium vehicles
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredCars.map((car, index) => (
              <CarCard key={car.id} car={car} index={index} />
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg" variant="outline" className="shadow-blue">
              <Link to="/cars">View All Vehicles</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              What Our <span className="text-primary">Customers Say</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Read reviews from our satisfied customers
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-blue transition-shadow">
                  <CardContent className="pt-6">
                    <Quote className="h-10 w-10 text-primary mb-4" />
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6 italic">
                      "{testimonial.content}"
                    </p>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

{/* CTA Section */}
<section className="py-20 bg-accent text-accent-foreground">
  <div className="container mx-auto px-4 text-center">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <h2 className="text-4xl md:text-5xl font-bold mb-6">
        Ready to Hit the Road?
      </h2>
      <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground">
        Book your perfect car today and enjoy an unforgettable driving experience
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {/* Browse Cars Button */}
        <Button
          asChild
          size="lg"
          className="shadow-red hover:scale-105 transition-transform duration-300"
        >
          <Link to="/cars">Browse Cars</Link>
        </Button>

        {/* Contact Us Button - stays same on hover */}
        <Button
          asChild
          size="lg"
          className="bg-black text-white border border-gray-400 hover:bg-black hover:text-white hover:border-gray-400 hover:shadow-lg hover:scale-105 transition-all duration-300"
        >
          <Link to="/contact">Contact Us</Link>
        </Button>
      </div>
    </motion.div>
  </div>
</section>


      <Footer />
    </div>
  );
};

export default Home;
