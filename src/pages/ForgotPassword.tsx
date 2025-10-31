import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { auth } from "@/config/firebase";
import { fetchSignInMethodsForEmail, sendPasswordResetEmail } from "firebase/auth";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmed || !emailRegex.test(trimmed)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      // First: attempt to send reset email for password-based accounts
      await sendPasswordResetEmail(auth, trimmed);
      toast.success("A password reset link has been sent to your email.");
      setEmail("");
      return;
    } catch (err: any) {
      // If that fails, determine why by checking sign-in methods
      try {
        const methods = await fetchSignInMethodsForEmail(auth, trimmed);
        if (!methods || methods.length === 0) {
          toast.error("No account found with this email address.");
        } else if (methods.includes("password")) {
          // If password is linked but send failed, show the specific error
          if (err?.code === "auth/too-many-requests") {
            toast.error("Too many attempts. Please try again later.");
          } else if (err?.code === "auth/invalid-email") {
            toast.error("Please enter a valid email address.");
          } else {
            toast.error(err?.message || "Failed to send reset email");
          }
        } else if (methods.includes("google.com")) {
          toast.error("This account was created using Google Sign-In. Please sign in with Google instead.");
        } else {
          toast.error("This account uses a social login provider. Please sign in with your provider.");
        }
      } catch (lookupErr) {
        // Fallback if provider lookup fails
        if (err?.code === "auth/invalid-email") {
          toast.error("Please enter a valid email address.");
        } else {
          toast.error("No account found with this email address.");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Back to Login Link */}
          <div className="mb-6">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </div>

          <Card className="shadow-lg border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
              <p className="text-muted-foreground">Enter your email to receive a reset link</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 text-base font-medium shadow-red" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Remembered your password?{" "}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Go back to Login
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default ForgotPassword;
