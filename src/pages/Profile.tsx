import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { User, FileText, Edit, Key, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
	listDocuments as listDocumentsApi,
	upsertDocument,
} from "@/services/firestore";

interface Address {
  id: string;
  type: string;
  address: string;
  city: string;
  isDefault: boolean;
}

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("about");
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSavingDocs, setIsSavingDocs] = useState(false);
  
  const frontInputRef = useRef<HTMLInputElement | null>(null);
  const backInputRef = useRef<HTMLInputElement | null>(null);

  const [profileData, setProfileData] = useState({
    name: user?.displayName || "",
    email: user?.email || "",
    phone: "",
    address: "",
    gender: "",
    dob: "",
    createdOn: "",
  });

  const [addresses, setAddresses] = useState<Address[]>([]);

  const [docId, setDocId] = useState<string | undefined>(undefined);
  const [docType, setDocType] = useState("CNIC");
  const [docNumber, setDocNumber] = useState("");
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);

  const formatCnic = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 13);
    const p1 = digits.slice(0, 5);
    const p2 = digits.slice(5, 12);
    const p3 = digits.slice(12, 13);
    return [p1, p2 && `-${p2}`, p3 && `-${p3}`].filter(Boolean).join("");
  };
  const formatDrivingLicense = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 7);
    return digits.length <= 5 ? digits : `${digits.slice(0, 5)}-${digits.slice(5)}`;
  };
  const docNumberPlaceholder = docType === 'CNIC' ? 'CNIC format: #####-#######-#' : 'Format: DL-12345-21 or 12345-21';
  const docNumberMaxLength = docType === 'CNIC' ? 15 : 8;
  const handleDocumentNumberChange = (v: string) => setDocNumber(docType === 'CNIC' ? formatCnic(v) : formatDrivingLicense(v));

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.startsWith('92')) {
      const rest = digits.slice(2);
      if (rest.length <= 3) return `+92 ${rest}`;
      if (rest.length <= 10) return `+92 ${rest.slice(0, 3)} ${rest.slice(3)}`;
      return `+92 ${rest.slice(0, 3)} ${rest.slice(3, 10)}`;
    }
    if (digits.startsWith('0')) {
      const rest = digits.slice(1);
      if (rest.length <= 3) return `+92 ${rest}`;
      if (rest.length <= 10) return `+92 ${rest.slice(0, 3)} ${rest.slice(3)}`;
      return `+92 ${rest.slice(0, 3)} ${rest.slice(3, 10)}`;
    }
    if (digits.length <= 3) return `+92 ${digits}`;
    if (digits.length <= 10) return `+92 ${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `+92 ${digits.slice(0, 3)} ${digits.slice(3, 10)}`;
  };

  const handleEditProfile = () => setIsEditing(true);

  const handleSaveProfile = async () => {
    if (!user) return toast.error("Please login to save your profile");
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
      toast.error(e?.message || "Failed to update profile");
    }
  };

  const handleSaveDocuments = async () => {
    if (!user) return toast.error("Please login to save documents");
    if (isSavingDocs) return;
    if (!docNumber) return toast.error("Enter document number");
    if (!docId && (!frontFile || !backFile)) {
      return toast.error("Please upload both Front and Back images");
    }
    // Immediately lock UI and show a loading toast
    setIsEditing(false);
    setIsSavingDocs(true);
    const toastId = toast.loading("Saving your documents...");

    (async () => {
      try {
        const saved = await upsertDocument(user.uid, {
          id: docId,
          type: docType,
          number: docNumber,
          frontFile: frontFile || null,
          backFile: backFile || null,
        });
        setDocId(saved.id);
        setFrontPreview(saved.frontImageUrl);
        setBackPreview(saved.backImageUrl);
        setFrontFile(null);
        setBackFile(null);
        toast.success("Documents saved successfully!", { id: toastId });
      } catch (e: any) {
        console.error('Documents save error', e);
        toast.error(e?.message || "Failed to save documents", { id: toastId });
        // Optional: allow re-edit on failure
        setIsEditing(true);
      } finally {
        setIsSavingDocs(false);
      }
    })();
  };

  const handleFrontPick = (file: File) => {
    setFrontFile(file);
    const url = URL.createObjectURL(file);
    setFrontPreview((prev) => { if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev); return url; });
  };
  const handleBackPick = (file: File) => {
    setBackFile(file);
    const url = URL.createObjectURL(file);
    setBackPreview((prev) => { if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev); return url; });
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
      if (docs.length > 0) {
        const d = docs[0];
        setDocId(d.id);
        setDocType(d.type === 'Driving License' ? 'Driving License' : 'CNIC');
        setDocNumber(d.number || "");
        setFrontPreview(d.frontImageUrl || null);
        setBackPreview(d.backImageUrl || null);
        setIsEditing(false);
      }
    };
    load();
    return () => {
      setFrontPreview((prev) => { if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev); return null; });
      setBackPreview((prev) => { if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev); return null; });
    };
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <div className="pt-20 flex-grow">
        <div className="container mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-6xl mx-auto">
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-border shadow-lg overflow-hidden">
                      <img src={profileData.gender.toLowerCase() === 'male' ? maleAvatar : femaleAvatar} alt={profileData.gender} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h1 className="text-3xl font-bold text-primary mb-2">{profileData.name}</h1>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-green-600 font-medium">Active</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button onClick={() => setIsEditing(true)} className="shadow-red">
                          <Edit className="h-4 w-4 mr-2" />
                          EDIT
                        </Button>
                        <Button onClick={() => setIsChangingPassword(true)} variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                          <Key className="h-4 w-4 mr-2" />
                          CHANGE PASSWORD
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="about" className="flex items-center gap-2"><User className="h-4 w-4" />About</TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center gap-2"><FileText className="h-4 w-4" />Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-6">
                <Card>
                  <CardHeader><CardTitle>CONTACT INFORMATION</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Phone</Label>
                        <Input value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: formatPhoneNumber(e.target.value) })} placeholder="+92 3XX XXXXXXXX" disabled={!isEditing} />
                      </div>
                      <div>
                        <Label>Address</Label>
                        <Input value={profileData.address} onChange={(e) => setProfileData({ ...profileData, address: e.target.value })} disabled={!isEditing} />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} disabled={!isEditing} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>BASIC INFORMATION</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Gender</Label>
                        <select value={profileData.gender} onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })} disabled={!isEditing} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                      <div>
                        <Label>Date of Birth</Label>
                        <Input type="date" value={profileData.dob} onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })} disabled={!isEditing} />
                      </div>
                      <div>
                        <Label>Created On</Label>
                        <Input value={profileData.createdOn} disabled />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {isEditing && (
                  <div className="flex gap-3">
                    <Button onClick={handleSaveProfile} className="bg-red-600 hover:bg-red-700">Save Changes</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="documents" className="space-y-6">
                <Card>
                  <CardHeader><CardTitle>DOCUMENTS</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Document Type</Label>
                        <select value={docType} onChange={(e) => setDocType(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" disabled={!isEditing}>
                          <option value="CNIC">CNIC</option>
                          <option value="Driving License">Driving License</option>
                        </select>
                      </div>
                      <div>
                        <Label>Document Number *</Label>
                        <Input value={docNumber} onChange={(e) => handleDocumentNumberChange(e.target.value)} placeholder={docType === 'CNIC' ? '42101-1234567-8' : 'DL-12345-21 or 12345-21'} maxLength={docNumberMaxLength} disabled={!isEditing} />
                        <p className="text-xs text-muted-foreground mt-1">{docNumberPlaceholder}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Front Image *</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          {frontPreview ? <img src={frontPreview} alt="Front preview" className="mx-auto h-24 object-contain mb-2" /> : <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />}
                          <input ref={frontInputRef} type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFrontPick(e.target.files[0])} className="hidden" />
                          <Button variant="outline" size="sm" onClick={() => frontInputRef.current?.click()} disabled={!isEditing}>Choose File</Button>
                          <p className="text-sm text-gray-500 mt-1">{frontFile ? frontFile.name : (frontPreview ? 'Selected' : 'No file chosen')}</p>
                        </div>
                      </div>
                      <div>
                        <Label>Back Image *</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          {backPreview ? <img src={backPreview} alt="Back preview" className="mx-auto h-24 object-contain mb-2" /> : <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />}
                          <input ref={backInputRef} type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleBackPick(e.target.files[0])} className="hidden" />
                          <Button variant="outline" size="sm" onClick={() => backInputRef.current?.click()} disabled={!isEditing}>Choose File</Button>
                          <p className="text-sm text-gray-500 mt-1">{backFile ? backFile.name : (backPreview ? 'Selected' : 'No file chosen')}</p>
                        </div>
                      </div>
                    </div>
                    {isEditing && (
                      <div className="flex gap-3">
                        <Button onClick={handleSaveDocuments} disabled={isSavingDocs} className="bg-red-600 hover:bg-red-700">{isSavingDocs ? 'Saving...' : 'Save'}</Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSavingDocs}>Cancel</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
