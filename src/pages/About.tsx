import { motion } from "framer-motion";
import { Award, Users, Car, Shield, Target, MapPin, Wrench, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import CarIcon from "@/components/CarIcon";
import mandviwallaHistory from "@/assets/mandviwalla-motors-history.png";

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To provide exceptional car rental experiences that exceed expectations through quality vehicles and outstanding service.",
    },
    {
      icon: CarIcon,
      title: "Customer First",
      description: "Your satisfaction is our priority. We go above and beyond to ensure every rental is smooth and enjoyable.",
    },
    {
      icon: Shield,
      title: "Trust & Safety",
      description: "All our vehicles are regularly maintained and fully insured for your peace of mind.",
    },
  ];

  const stats = [
    { icon: Car, number: "500+", label: "Vehicles" },
    { icon: Users, number: "50K+", label: "Happy Customers" },
    { icon: Award, number: "15+", label: "Years Experience" },
    { icon: Shield, number: "99.9%", label: "Customer Satisfaction" },
  ];

  const workshopFacilities = [
    {
      city: "Karachi",
      status: "Established",
      description: "Our flagship workshop facility in Karachi, equipped with state-of-the-art equipment and experienced technicians for premium car rental services.",
      services: ["Vehicle Pickup & Drop-off", "24/7 Roadside Assistance", "Fleet Maintenance", "Customer Support Center"],
      established: "2009"
    },
    {
      city: "Larkana",
      status: "Established",
      description: "Strategic workshop location serving Sindh region with comprehensive car rental and maintenance services.",
      services: ["Local Car Rentals", "Airport Transfers", "Fleet Management", "Customer Service"],
      established: "2015"
    },
    {
      city: "Islamabad",
      status: "Established",
      description: "Our capital city facility providing premium car rental services to Islamabad and surrounding areas.",
      services: ["Premium Car Rentals", "Corporate Fleet Services", "Airport Pickup/Drop", "24/7 Support"],
      established: "2024"
    },
    {
      city: "Lahore",
      status: "Coming Soon",
      description: "Expanding to the heart of Punjab! Our Lahore facility will bring world-class car rental services to Pakistan's cultural capital.",
      services: ["Premium Car Rentals", "Luxury Vehicle Fleet", "Corporate Services", "24/7 Support"],
      established: "2025"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="pt-20 flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-primary/10 via-secondary/10 to-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                About <span className="text-primary">M-Rent A Car</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Your trusted partner in premium car rentals since 2009. We're passionate about providing 
                exceptional vehicles and outstanding service to make every journey memorable.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold mb-6">Our Story</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Our legacy began in the 1950s with Mandviwalla Motors, a prestigious luxury car showroom 
                    in Karachi that introduced Pakistan to the world's finest automobiles. From those historic 
                    beginnings on the streets of Karachi, we established a reputation for excellence and trust.
                  </p>
                  <p>
                    Building on decades of automotive expertise and customer relationships, we evolved into 
                    M-Rent A Car - bringing the same commitment to luxury, quality, and service that defined 
                    Mandviwalla Motors. Today, our fleet of over 500 premium vehicles carries forward this 
                    rich heritage, serving thousands of satisfied customers who expect nothing but the best.
                  </p>
                  <p>
                    From classic Land Rovers and Toyota Coasters to modern luxury SUVs and sedans, we offer 
                    an unmatched selection of vehicles for every occasion. Whether it's a corporate rental, 
                    family trip, or special event, we provide the same dedication to quality and customer 
                    satisfaction that has been our hallmark for generations.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="relative"
              >
                <img
                  src={mandviwallaHistory}
                  alt="Mandviwalla Motors - Luxury Car Showroom in Karachi (1950s)"
                  className="rounded-2xl shadow-custom-lg"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Workshop Facilities */}
        <section className="py-20 bg-muted">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Workshop <span className="text-primary">Facilities</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Nationwide network of professional workshop facilities ensuring your vehicle receives 
                the best care and maintenance across Pakistan
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {workshopFacilities.map((workshop, index) => (
                <motion.div
                  key={workshop.city}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-red transition-shadow">
                    <CardContent className="pt-6">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                            <MapPin className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">{workshop.city}</h3>
                            <p className="text-sm text-muted-foreground">Est. {workshop.established}</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          workshop.status === 'Established' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {workshop.status}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        {workshop.description}
                      </p>

                      {/* Services */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                          <Wrench className="h-4 w-4 text-primary" />
                          <span className="font-semibold text-sm">Services Offered:</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {workshop.services.map((service, serviceIndex) => (
                            <div key={serviceIndex} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                              <span className="text-sm text-muted-foreground">{service}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Status Badge */}
                      {workshop.status === 'Coming Soon' && (
                        <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium text-purple-800">
                              Coming Soon - Watch This Space!
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="mt-12 text-center"
            >
              <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-xl border border-gray-200">
                <div className="flex items-center justify-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary to-red-600">
                    <MapPin className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold mb-6 text-primary">
                  Nationwide Service Network
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-4xl mx-auto text-lg mb-6">
                  Our comprehensive network of car rental facilities ensures that wherever you are in Pakistan, 
                  premium automotive services are never far away. From our established facilities in Karachi, 
                  Larkana, and Islamabad to our upcoming expansion in Lahore, we're committed to providing 
                  consistent, high-quality car rental experiences across the country.
                </p>
                
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
                    <div className="text-2xl font-bold text-primary mb-2">3</div>
                    <div className="text-sm text-muted-foreground font-medium">Established Locations</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
                    <div className="text-2xl font-bold text-primary mb-2">1</div>
                    <div className="text-sm text-muted-foreground font-medium">Coming Soon</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
                    <div className="text-2xl font-bold text-primary mb-2">24/7</div>
                    <div className="text-sm text-muted-foreground font-medium">Customer Support</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-muted">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Our <span className="text-secondary">Values</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-blue transition-shadow">
                    <CardContent className="pt-8 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-accent mb-6">
                        {value.icon === CarIcon ? (
                          <CarIcon size={32} className="text-white" />
                        ) : (
                          <value.icon className="h-8 w-8 text-white" />
                        )}
                      </div>
                      <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                      <p className="text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20 bg-accent text-accent-foreground">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <stat.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Our <span className="text-primary">Team</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Behind every great rental experience is our dedicated team of professionals, 
                committed to making your journey exceptional.
              </p>
              <p className="text-muted-foreground">
                From our customer service representatives to our vehicle maintenance specialists, 
                every team member shares our passion for excellence and customer satisfaction. 
                We're available 24/7 to ensure your rental experience is seamless from start to finish.
              </p>
            </motion.div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default About;
