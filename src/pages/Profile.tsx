import { useEffect, useState } from "react";
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
} from "@/services/firestore";

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

  // Documents state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [newDocument, setNewDocument] = useState({
    type: "CNIC",
    number: "",
    frontImage: null as File | null,
    backImage: null as File | null
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

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
    const newAddressData = {
      type: "Home",
      address: "New Address",
      city: "Karachi",
      isDefault: addresses.length === 0,
    };
    try {
      const created = await addAddressApi(user.uid, newAddressData);
      setAddresses([...addresses, created]);
      toast.success("Address added successfully!");
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
      setNewDocument({ ...newDocument, frontImage: file });
    } else {
      setNewDocument({ ...newDocument, backImage: file });
    }
  };

  const handleSubmitDocument = async () => {
    if (!user) {
      toast.error("Please login to submit documents");
      return;
    }
    if (!newDocument.number || !newDocument.frontImage || !newDocument.backImage) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
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
      setNewDocument({ type: "CNIC", number: "", frontImage: null, backImage: null });
      toast.success("Document submitted successfully!");
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
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label>Address</Label>
                        <Input
                          value={profileData.address}
                          onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
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
                        <Input
                          value={profileData.gender}
                          onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label>Date of Birth</Label>
                        <Input
                          value={profileData.dob}
                          onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                          disabled={!isEditing}
                        />
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
                  <Button onClick={handleAddAddress} className="shadow-red">
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
                              <Badge variant={address.isDefault ? "default" : "secondary"}>
                                {address.type}
                              </Badge>
                              {address.isDefault && (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  Default
                                </Badge>
                              )}
                            </div>
                            <p className="text-lg font-medium">{address.address}</p>
                            <p className="text-muted-foreground">{address.city}</p>
                          </div>
                          <div className="flex gap-2">
                            {!address.isDefault && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSetDefaultAddress(address.id)}
                              >
                                Set Default
                              </Button>
                            )}
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
                          onChange={(e) => setNewDocument({ ...newDocument, type: e.target.value })}
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
                          value={newDocument.number}
                          onChange={(e) => setNewDocument({ ...newDocument, number: e.target.value })}
                          placeholder="Enter document number"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Front Image *</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleFileUpload('front', e.target.files[0])}
                            className="hidden"
                            id="front-upload"
                          />
                          <label htmlFor="front-upload" className="cursor-pointer">
                            <Button variant="outline" size="sm">
                              Choose File
                            </Button>
                          </label>
                          <p className="text-sm text-gray-500 mt-1">
                            {newDocument.frontImage ? newDocument.frontImage.name : "No file chosen"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <Label>Back Image *</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleFileUpload('back', e.target.files[0])}
                            className="hidden"
                            id="back-upload"
                          />
                          <label htmlFor="back-upload" className="cursor-pointer">
                            <Button variant="outline" size="sm">
                              Choose File
                            </Button>
                          </label>
                          <p className="text-sm text-gray-500 mt-1">
                            {newDocument.backImage ? newDocument.backImage.name : "No file chosen"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button onClick={handleSubmitDocument} className="w-full shadow-red">
                      Submit
                    </Button>
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
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">{doc.type}</p>
                                <p className="text-sm text-muted-foreground">{doc.number}</p>
                              </div>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteDocument(doc.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

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
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
