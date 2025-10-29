import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { User, MapPin, FileText, Edit, Key, Plus, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import maleAvatar from "@/assets/male-avatar.png";
import femaleAvatar from "@/assets/female-avatar.png";
import {
	getOrCreateUserProfile,
	updateUserProfile,
	listAddresses,
	addAddress as addAddressApi,
	deleteAddress as deleteAddressApi,
	setDefaultAddress as setDefaultAddressApi,
	addDocument as addDocumentApi,
	listDocuments as listDocumentsApi,
	deleteDocument as deleteDocumentApi,
	updateDocument as updateDocumentApi,
} from "@/services/firestore";
// Using native date input for calendar UI

interface Address {
  id: string;
  type: string;
  address: string;
  city: string;
  isDefault: boolean;
}

interface Document {
  id: string;
  type: string;
  number: string;
  frontImage?: string;
  backImage?: string;
}

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("about");
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  
  // Profile data state
  const [profileData, setProfileData] = useState({
    name: user?.displayName || "",
    email: user?.email || "",
    phone: "",
    address: "",
    gender: "",
    dob: "",
    createdOn: "",
  });

  // Addresses state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addAddressForm, setAddAddressForm] = useState({
    type: "Home",
    address: "",
    city: "",
  });

  // Documents state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [newDocument, setNewDocument] = useState({
    type: "CNIC",
    number: "",
    frontImage: null as File | null,
    backImage: null as File | null,
    frontPreviewUrl: "" as string,
    backPreviewUrl: "" as string,
  });
  const [isEditingDocument, setIsEditingDocument] = useState(false);
  const [isDocFormEditing, setIsDocFormEditing] = useState(true);
  const [editDocument, setEditDocument] = useState({
    id: "",
    type: "CNIC",
    number: "",
    frontImage: null as File | null,
    backImage: null as File | null,
    frontPreviewUrl: "" as string,
    backPreviewUrl: "" as string,
  });

  // Document number validation state
  const [documentNumberError, setDocumentNumberError] = useState("");

  // Supported document formats for Pakistan
  const DOCUMENT_FORMATS: Record<string, { placeholder: string; hint: string; regex: RegExp; inputMode: React.HTMLAttributes<HTMLInputElement>["inputMode"]; maxLength: number; digitsOnly: boolean; sanitizer?: (v: string) => string }> = {
    CNIC: {
      placeholder: "42101-1234567-8",
      hint: "CNIC format: #####-#######-#",
      regex: /^\d{5}-\d{7}-\d{1}$/,
      inputMode: "numeric",
      maxLength: 15,
      digitsOnly: false,
      sanitizer: (v: string) => {
        const digits = v.replace(/\D/g, "").slice(0, 13);
        if (digits.length <= 5) return digits;
        if (digits.length <= 12) return `${digits.slice(0,5)}-${digits.slice(5)}`;
        return `${digits.slice(0,5)}-${digits.slice(5,12)}-${digits.slice(12,13)}`;
      },
    },
    "Driving License": {
      placeholder: "DL-12345-21",
      hint: "Format: DL-12345-21 or 12345-21",
      regex: /^(DL-)?\d{5}-\d{2}$/,
      inputMode: "text",
      maxLength: 11,
      digitsOnly: false,
      sanitizer: (v: string) => {
        let raw = v.toUpperCase().replace(/[^A-Z0-9]/g, "");
        const hasDL = raw.startsWith("DL");
        if (hasDL) raw = raw.slice(2); // remove DL for digit processing
        const digits = raw.replace(/\D/g, "");
        const first = digits.slice(0, 5);
        const last = digits.slice(5, 7);
        const core = last ? `${first}-${last}` : first;
        return hasDL ? (first ? `DL-${core}` : "DL-") : core;
      },
    },
    Passport: {
      placeholder: "ABC1234567",
      hint: "Passport must be 3 letters followed by 7 digits",
      regex: /^[A-Z]{3}\d{7}$/,
      inputMode: "text",
      maxLength: 10,
      digitsOnly: false,
      sanitizer: (v: string) => {
        const raw = v.toUpperCase().replace(/[^A-Z0-9]/g, "");
        const letters = raw.replace(/[^A-Z]/g, "").slice(0, 3);
        const digits = raw.replace(/\D/g, "").slice(0, 7);
        return (letters + digits).slice(0, 10);
      },
    },
  };

  const currentDocFormat = DOCUMENT_FORMATS[newDocument.type] || DOCUMENT_FORMATS["CNIC"];

  // File input refs to reliably trigger native picker
  const frontFileInputRef = useRef<HTMLInputElement | null>(null);
  const backFileInputRef = useRef<HTMLInputElement | null>(null);
  const editFrontFileInputRef = useRef<HTMLInputElement | null>(null);
  const editBackFileInputRef = useRef<HTMLInputElement | null>(null);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Helper to get today's date in local timezone as YYYY-MM-DD
  const getTodayLocalYMD = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format phone number for Pakistan (+92 XXX XXXXXXXX)
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // If starts with 92, treat as country code
    if (digits.startsWith('92')) {
      const rest = digits.slice(2);
      if (rest.length <= 3) return `+92 ${rest}`;
      if (rest.length <= 10) return `+92 ${rest.slice(0, 3)} ${rest.slice(3)}`;
      return `+92 ${rest.slice(0, 3)} ${rest.slice(3, 10)}`;
    }
    
    // If starts with 0, remove it and add +92
    if (digits.startsWith('0')) {
      const rest = digits.slice(1);
      if (rest.length <= 3) return `+92 ${rest}`;
      if (rest.length <= 10) return `+92 ${rest.slice(0, 3)} ${rest.slice(3)}`;
      return `+92 ${rest.slice(0, 3)} ${rest.slice(3, 10)}`;
    }
    
    // Otherwise format as regular number
    if (digits.length <= 3) return `+92 ${digits}`;
    if (digits.length <= 10) return `+92 ${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `+92 ${digits.slice(0, 3)} ${digits.slice(3, 10)}`;
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!user) {
      toast.error("Please login to save your profile");
      return;
    }
    try {
      await updateUserProfile(user.uid, {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address,
        gender: profileData.gender,
        dob: profileData.dob,
      });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (e: any) {
      console.error('Update profile error', e);
      toast.error(e?.message || "Failed to update profile");
    }
  };

  const handleChangePassword = () => {
    setIsChangingPassword(true);
  };

  const handleSavePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    toast.success("Password changed successfully!");
    setIsChangingPassword(false);
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleAddAddress = async () => {
    if (!user) {
      toast.error("Please login to add address");
      return;
    }
    if (!addAddressForm.address.trim() || !addAddressForm.city.trim()) {
      toast.error("Please enter address and city");
      return;
    }
    const newAddressData = {
      type: addAddressForm.type,
      address: addAddressForm.address.trim(),
      city: addAddressForm.city.trim(),
      isDefault: false,
    };
    try {
      const created = await addAddressApi(user.uid, newAddressData);
      setAddresses([...addresses, created]);
      toast.success("Address added successfully!");
      setIsAddingAddress(false);
      setAddAddressForm({ type: "Home", address: "", city: "" });
    } catch (e) {
      toast.error("Failed to add address");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!user) return;
    try {
      await deleteAddressApi(user.uid, id);
      setAddresses(addresses.filter(addr => addr.id !== id));
      toast.success("Address deleted successfully!");
    } catch (e) {
      toast.error("Failed to delete address");
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    if (!user) return;
    try {
      await setDefaultAddressApi(user.uid, id);
      setAddresses(addresses.map(addr => ({ ...addr, isDefault: addr.id === id })));
      toast.success("Default address updated!");
    } catch (e) {
      toast.error("Failed to set default address");
    }
  };

  const handleFileUpload = (type: 'front' | 'back', file: File) => {
    if (type === 'front') {
      const url = URL.createObjectURL(file);
      setNewDocument({ ...newDocument, frontImage: file, frontPreviewUrl: url });
    } else {
      const url = URL.createObjectURL(file);
      setNewDocument({ ...newDocument, backImage: file, backPreviewUrl: url });
    }
  };

  const validateDocumentNumber = () => {
    const value = newDocument.number.trim();
    if (!value) {
      setDocumentNumberError("Document number is required");
      return false;
    }
    if (!currentDocFormat.regex.test(value)) {
      setDocumentNumberError("Invalid format. " + currentDocFormat.hint);
      return false;
    }
    setDocumentNumberError("");
    return true;
  };

  const validateEditDocumentNumber = () => {
    const fmt = DOCUMENT_FORMATS[editDocument.type] || DOCUMENT_FORMATS["CNIC"];
    const value = editDocument.number.trim();
    if (!value) {
      setDocumentNumberError("Document number is required");
      return false;
    }
    if (!fmt.regex.test(value)) {
      setDocumentNumberError("Invalid format. " + fmt.hint);
      return false;
    }
    setDocumentNumberError("");
    return true;
  };

  const handleSubmitDocument = async () => {
    if (!user) {
      toast.error("Please login to submit documents");
      return;
    }
    if (!validateDocumentNumber() || !newDocument.frontImage || !newDocument.backImage) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      // Prevent duplicates: if a doc of same type exists, update it instead of creating another
      const existing = documents.find((d) => d.type === newDocument.type);
      if (existing) {
        const updated = await updateDocumentApi(user.uid, existing.id, {
          type: newDocument.type,
          number: newDocument.number,
          frontFile: newDocument.frontImage,
          backFile: newDocument.backImage,
        });
        setDocuments(documents.map(d => d.id === updated.id ? { id: updated.id, type: updated.type, number: updated.number, frontImage: updated.frontImageUrl, backImage: updated.backImageUrl } : d));
        toast.success(`Document (${updated.type}) updated successfully.`);
      } else {
      const saved = await addDocumentApi(user.uid, {
        type: newDocument.type,
        number: newDocument.number,
        frontFile: newDocument.frontImage,
        backFile: newDocument.backImage,
      });
      setDocuments([
        ...documents,
        {
          id: saved.id,
          type: saved.type,
          number: saved.number,
          frontImage: saved.frontImageUrl,
          backImage: saved.backImageUrl,
        },
      ]);
        toast.success(`Document (${saved.type}) uploaded successfully.`);
      }
      setNewDocument({ type: "CNIC", number: "", frontImage: null, backImage: null, frontPreviewUrl: "", backPreviewUrl: "" });
    } catch (e) {
      toast.error("Failed to submit document");
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!user) return;
    try {
      await deleteDocumentApi(user.uid, id);
      setDocuments(documents.filter(doc => doc.id !== id));
      toast.success("Document deleted successfully!");
    } catch (e) {
      toast.error("Failed to delete document");
    }
  };

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const profile = await getOrCreateUserProfile(user.uid, { name: user.displayName || "", email: user.email || "" });
      setProfileData({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
        gender: profile.gender || "",
        dob: profile.dob || "",
        createdOn: profile.createdOn?.toDate ? profile.createdOn.toDate().toLocaleString() : "",
      });
      const [addr, docs] = await Promise.all([listAddresses(user.uid), listDocumentsApi(user.uid)]);
      setAddresses(addr);
      setDocuments(
        docs.map((d) => ({ id: d.id, type: d.type, number: d.number, frontImage: d.frontImageUrl, backImage: d.backImageUrl }))
      );
    };
    load();
  }, [user]);

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
            {/* Profile Header */}
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-border shadow-lg overflow-hidden">
                      <img 
                        src={profileData.gender.toLowerCase() === 'male' ? maleAvatar : femaleAvatar}
                        alt={profileData.gender}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h1 className="text-3xl font-bold text-primary mb-2">{profileData.name}</h1>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-green-600 font-medium">Active</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <Button
                          onClick={handleEditProfile}
                          className="shadow-red"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          EDIT
                        </Button>
                        <Button
                          onClick={handleChangePassword}
                          variant="outline"
                          className="border-primary text-primary hover:bg-primary hover:text-white"
                        >
                          <Key className="h-4 w-4 mr-2" />
                          CHANGE PASSWORD
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="about" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  About
                </TabsTrigger>
                <TabsTrigger value="addresses" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Addresses
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documents
                </TabsTrigger>
              </TabsList>

              {/* About Tab */}
              <TabsContent value="about" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>CONTACT INFORMATION</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Phone</Label>
                        <Input
                          value={profileData.phone}
                          onChange={(e) => {
                            const formatted = formatPhoneNumber(e.target.value);
                            setProfileData({ ...profileData, phone: formatted });
                          }}
                          placeholder="+92 3XX XXXXXXXX"
                          disabled={!isEditing}
                        />
                      </div>
                      {/* Address field removed as requested */}
                      <div>
                        <Label>Email</Label>
                        <Input
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>BASIC INFORMATION</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Gender</Label>
                        <select
                          value={profileData.gender}
                          onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                          disabled={!isEditing}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                      <div>
                        <Label>Date of Birth</Label>
                        {isEditing ? (
                          <div className="flex gap-2">
                        <Input
                          type="date"
                          value={profileData.dob}
                          onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                              max={getTodayLocalYMD()}
                        />
                            {/* Today button intentionally removed as requested */}
                          </div>
                        ) : (
                          <Input value={profileData.dob} disabled />
                        )}
                      </div>
                      <div>
                        <Label>Created On</Label>
                        <Input
                          value={profileData.createdOn}
                          disabled
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {isEditing && (
                  <div className="flex gap-3">
                    <Button onClick={handleSaveProfile} className="bg-red-600 hover:bg-red-700">
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Addresses Tab */}
              <TabsContent value="addresses" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Addresses</h2>
                  <Button onClick={() => setIsAddingAddress(true)} className="shadow-red">
                    <Plus className="h-4 w-4 mr-2" />
                    ADD ADDRESS
                  </Button>
                </div>

                <div className="grid gap-4">
                  {addresses.map((address) => (
                    <Card key={address.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary">
                                {address.type}
                              </Badge>
                            </div>
                            <p className="text-lg font-medium">{address.address}</p>
                            <p className="text-muted-foreground">{address.city}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteAddress(address.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="space-y-6">
                <h2 className="text-2xl font-bold">UPDATE DOCUMENTS</h2>

                {/* Document Form */}
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Document Type</Label>
                        <select
                          value={newDocument.type}
                          onChange={(e) => {
                            setNewDocument({ ...newDocument, type: e.target.value, number: "" });
                            setDocumentNumberError("");
                          }}
                          disabled={!isDocFormEditing}
                          className="w-full p-2 border border-gray-300 rounded-md disabled:opacity-60"
                        >
                          <option value="CNIC">CNIC</option>
                          <option value="Driving License">Driving License</option>
                          <option value="Passport">Passport</option>
                        </select>
                      </div>
                      <div>
                        <Label>Document Number *</Label>
                        <Input
                          value={newDocument.number}
                          onChange={(e) => {
                            let v = e.target.value;
                            if (currentDocFormat.sanitizer) {
                              v = currentDocFormat.sanitizer(v);
                            } else if (currentDocFormat.digitsOnly) {
                              v = v.replace(/\D/g, "");
                            }
                            if (currentDocFormat.maxLength) v = v.slice(0, currentDocFormat.maxLength);
                            setNewDocument({ ...newDocument, number: v });
                            if (documentNumberError) setDocumentNumberError("");
                          }}
                          onBlur={validateDocumentNumber}
                          placeholder={currentDocFormat.placeholder}
                          inputMode={currentDocFormat.inputMode}
                          maxLength={currentDocFormat.maxLength}
                          disabled={!isDocFormEditing}
                        />
                        <p className="text-xs text-muted-foreground mt-1">{currentDocFormat.hint}</p>
                        {documentNumberError && (
                          <p className="text-xs text-red-600 mt-1">{documentNumberError}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Front Image *</Label>
                        <div className={`border-2 border-dashed border-gray-300 rounded-lg p-4 text-center ${!isDocFormEditing ? 'opacity-60' : ''}`}>
                          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          {newDocument.frontPreviewUrl && (
                            <div className="mb-2">
                              <img src={newDocument.frontPreviewUrl} alt="Front preview" className="mx-auto max-h-28 object-contain rounded" />
                            </div>
                          )}
                          <input
                            ref={frontFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleFileUpload('front', e.target.files[0])}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => frontFileInputRef.current?.click()}
                            disabled={!isDocFormEditing}
                          >
                              Choose File
                            </Button>
                          <p className="text-sm text-gray-500 mt-1">
                            {newDocument.frontImage ? newDocument.frontImage.name : "No file chosen"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <Label>Back Image *</Label>
                        <div className={`border-2 border-dashed border-gray-300 rounded-lg p-4 text-center ${!isDocFormEditing ? 'opacity-60' : ''}`}>
                          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          {newDocument.backPreviewUrl && (
                            <div className="mb-2">
                              <img src={newDocument.backPreviewUrl} alt="Back preview" className="mx-auto max-h-28 object-contain rounded" />
                            </div>
                          )}
                          <input
                            ref={backFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleFileUpload('back', e.target.files[0])}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => backFileInputRef.current?.click()}
                            disabled={!isDocFormEditing}
                          >
                              Choose File
                            </Button>
                          <p className="text-sm text-gray-500 mt-1">
                            {newDocument.backImage ? newDocument.backImage.name : "No file chosen"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {isDocFormEditing ? (
                      <Button onClick={async () => { await handleSubmitDocument(); setIsDocFormEditing(false); }} className="w-full shadow-red">
                        Save
                      </Button>
                    ) : (
                      <div className="flex justify-end">
                        <Button variant="outline" onClick={() => setIsDocFormEditing(true)}>Edit</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Submitted Documents */}
                {documents.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Submitted Documents</h3>
                    <div className="grid gap-4">
                      {documents.map((doc) => (
                        <Card key={doc.id}>
                          <CardContent className="p-4">
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                  <p className="font-medium">{doc.type}</p>
                                  <p className="text-sm text-muted-foreground mb-3">{doc.number}</p>
                                  {(doc.frontImage || doc.backImage) && (
                                    <div className="flex gap-4 items-start">
                                      {doc.frontImage && (
                                        <div className="text-center">
                                          <img src={doc.frontImage} alt="Front" className="h-20 w-auto rounded border" />
                                          <p className="text-xs text-muted-foreground mt-1">Front</p>
                                        </div>
                                      )}
                                      {doc.backImage && (
                                        <div className="text-center">
                                          <img src={doc.backImage} alt="Back" className="h-20 w-auto rounded border" />
                                          <p className="text-xs text-muted-foreground mt-1">Back</p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setIsEditingDocument(true);
                                          setEditDocument({
                                            id: doc.id,
                                            type: doc.type,
                                            number: doc.number,
                                            frontImage: null,
                                            backImage: null,
                                        frontPreviewUrl: doc.frontImage || "",
                                        backPreviewUrl: doc.backImage || "",
                                          });
                                          setDocumentNumberError("");
                                        }}
                                      >
                                        Edit
                                      </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteDocument(doc.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                                    </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Add Address Modal */}
            {isAddingAddress && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <Card className="w-full max-w-lg">
                  <CardHeader>
                    <CardTitle>Add Address</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Type</Label>
                        <select
                          value={addAddressForm.type}
                          onChange={(e) => setAddAddressForm({ ...addAddressForm, type: e.target.value })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="Home">Home</option>
                          <option value="Office">Office</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <Label>City</Label>
                        <Input
                          value={addAddressForm.city}
                          onChange={(e) => setAddAddressForm({ ...addAddressForm, city: e.target.value })}
                          placeholder="e.g., Karachi"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Address</Label>
                        <Input
                          value={addAddressForm.address}
                          onChange={(e) => setAddAddressForm({ ...addAddressForm, address: e.target.value })}
                          placeholder="House #, Street, Area"
                        />
                      </div>
                      {/* Default address control removed as requested */}
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button onClick={handleAddAddress} className="bg-red-600 hover:bg-red-700">Save Address</Button>
                      <Button variant="outline" onClick={() => { setIsAddingAddress(false); }}>Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Password Change Modal */}
            {isChangingPassword && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <Card className="w-full max-w-md">
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Current Password</Label>
                      <Input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>New Password</Label>
                      <Input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Confirm New Password</Label>
                      <Input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={handleSavePassword} className="bg-red-600 hover:bg-red-700">
                        Save Password
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsChangingPassword(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Edit Document Modal */}
            {isEditingDocument && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <Card className="w-full max-w-2xl">
                  <CardHeader>
                    <CardTitle>Edit Document</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Document Type</Label>
                        <select
                          value={editDocument.type}
                          onChange={(e) => { setEditDocument({ ...editDocument, type: e.target.value, number: "" }); setDocumentNumberError(""); }}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="CNIC">CNIC</option>
                          <option value="Driving License">Driving License</option>
                          <option value="Passport">Passport</option>
                        </select>
                      </div>
                      <div>
                        <Label>Document Number *</Label>
                        <Input
                          value={editDocument.number}
                          onChange={(e) => {
                            const fmt = DOCUMENT_FORMATS[editDocument.type];
                            let v = e.target.value;
                            if (fmt.sanitizer) v = fmt.sanitizer(v);
                            else if (fmt.digitsOnly) v = v.replace(/\D/g, "");
                            if (fmt.maxLength) v = v.slice(0, fmt.maxLength);
                            setEditDocument({ ...editDocument, number: v });
                            if (documentNumberError) setDocumentNumberError("");
                          }}
                          onBlur={validateEditDocumentNumber}
                          placeholder={(DOCUMENT_FORMATS[editDocument.type] || DOCUMENT_FORMATS["CNIC"]).placeholder}
                          inputMode={(DOCUMENT_FORMATS[editDocument.type] || DOCUMENT_FORMATS["CNIC"]).inputMode}
                          maxLength={(DOCUMENT_FORMATS[editDocument.type] || DOCUMENT_FORMATS["CNIC"]).maxLength}
                        />
                        <p className="text-xs text-muted-foreground mt-1">{(DOCUMENT_FORMATS[editDocument.type] || DOCUMENT_FORMATS["CNIC"]).hint}</p>
                        {documentNumberError && (
                          <p className="text-xs text-red-600 mt-1">{documentNumberError}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Front Image</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          {editDocument.frontPreviewUrl && (
                            <div className="mb-2">
                              <img src={editDocument.frontPreviewUrl} alt="Front preview" className="mx-auto max-h-28 object-contain rounded" />
                            </div>
                          )}
                          <input
                            ref={editFrontFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                const f = e.target.files[0];
                                setEditDocument({ ...editDocument, frontImage: f, frontPreviewUrl: URL.createObjectURL(f) });
                              }
                            }}
                            className="hidden"
                          />
                          <Button variant="outline" size="sm" onClick={() => editFrontFileInputRef.current?.click()}>Choose File</Button>
                        </div>
                      </div>
                      <div>
                        <Label>Back Image</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          {editDocument.backPreviewUrl && (
                            <div className="mb-2">
                              <img src={editDocument.backPreviewUrl} alt="Back preview" className="mx-auto max-h-28 object-contain rounded" />
                            </div>
                          )}
                          <input
                            ref={editBackFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                const f = e.target.files[0];
                                setEditDocument({ ...editDocument, backImage: f, backPreviewUrl: URL.createObjectURL(f) });
                              }
                            }}
                            className="hidden"
                          />
                          <Button variant="outline" size="sm" onClick={() => editBackFileInputRef.current?.click()}>Choose File</Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={async () => {
                          if (!user) return;
                          if (!validateEditDocumentNumber()) return;
                          try {
                            const updated = await updateDocumentApi(user.uid, editDocument.id, {
                              type: editDocument.type,
                              number: editDocument.number,
                              frontFile: editDocument.frontImage,
                              backFile: editDocument.backImage,
                            });
                            setDocuments(documents.map(d => d.id === updated.id ? { id: updated.id, type: updated.type, number: updated.number, frontImage: updated.frontImageUrl, backImage: updated.backImageUrl } : d));
                            toast.success("Document updated successfully!");
                            setIsEditingDocument(false);
                          } catch (e) {
                            toast.error("Failed to update document");
                          }
                        }}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditingDocument(false)}>Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
