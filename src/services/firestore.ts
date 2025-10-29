import { db, storage } from "@/config/firebase";
import {
	collection,
	doc,
	getDoc,
	setDoc,
	updateDoc,
	serverTimestamp,
	addDoc,
	getDocs,
	query,
	where,
	Timestamp,
	deleteDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

// Types
export interface UserProfile {
	uid: string;
	name: string;
	email: string;
	phone?: string;
	address?: string;
	gender?: string;
	dob?: string;
	createdOn: Timestamp;
}

export interface AddressItem {
	id: string;
	type: string;
	address: string;
	city: string;
	isDefault: boolean;
}

export interface DocumentItem {
	id: string;
	type: string;
	number: string;
	frontImageUrl: string;
	backImageUrl: string;
	createdAt: Timestamp;
}

export type BookingStatus = "active" | "scheduled" | "completed" | "cancelled";

export interface BookingItem {
	id: string;
	carName: string;
	pickupDate: string;
	returnDate: string;
	pickupLocation: string;
	dropoffLocation: string;
	totalDays: number;
	totalPrice: number;
	status: BookingStatus;
	bookingDate: string;
	rating?: number;
}

// Collection helpers
const userDoc = (uid: string) => doc(db, "users", uid);
const addressesCol = (uid: string) => collection(db, "users", uid, "addresses");
const documentsCol = (uid: string) => collection(db, "users", uid, "documents");
const bookingsCol = (uid: string) => collection(db, "users", uid, "bookings");

// User Profile
export async function getOrCreateUserProfile(uid: string, defaults: Partial<UserProfile> = {}) {
	const uref = userDoc(uid);
	const snap = await getDoc(uref);
	if (!snap.exists()) {
		const payload: Omit<UserProfile, "createdOn"> & { createdOn: any } = {
			uid,
			name: defaults.name || "",
			email: defaults.email || "",
			phone: defaults.phone || "",
			address: defaults.address || "",
			gender: defaults.gender || "",
			dob: defaults.dob || "",
			createdOn: serverTimestamp(),
		};
		await setDoc(uref, payload);
		const created = await getDoc(uref);
		return created.data() as UserProfile;
	}
	return snap.data() as UserProfile;
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
	const uref = userDoc(uid);
	// Use setDoc with merge to avoid failures if the doc doesn't exist yet
	await setDoc(uref, data as any, { merge: true });
	const updated = await getDoc(uref);
	return updated.data() as UserProfile;
}

// Addresses
export async function listAddresses(uid: string): Promise<AddressItem[]> {
	const qs = await getDocs(addressesCol(uid));
	return qs.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AddressItem, "id">) }));
}

export async function addAddress(uid: string, item: Omit<AddressItem, "id">): Promise<AddressItem> {
	if (item.isDefault) {
		// ensure only one default: unset others
		const current = await getDocs(addressesCol(uid));
		await Promise.all(
			current.docs.map((docSnap) => updateDoc(docSnap.ref, { isDefault: false }))
		);
	}
	const refDoc = await addDoc(addressesCol(uid), item);
	return { id: refDoc.id, ...item };
}

export async function setDefaultAddress(uid: string, id: string) {
	const qs = await getDocs(addressesCol(uid));
	await Promise.all(
		qs.docs.map((docSnap) => updateDoc(docSnap.ref, { isDefault: docSnap.id === id }))
	);
}

export async function deleteAddress(uid: string, id: string) {
	await deleteDoc(doc(db, "users", uid, "addresses", id));
}

// Documents
export async function uploadDocumentImages(
	uid: string,
	docId: string,
	front: File,
	back: File
) {
	const frontRef = ref(storage, `users/${uid}/documents/${docId}/front`);
	const backRef = ref(storage, `users/${uid}/documents/${docId}/back`);
	await uploadBytes(frontRef, front);
	await uploadBytes(backRef, back);
	const [frontUrl, backUrl] = await Promise.all([
		getDownloadURL(frontRef),
		getDownloadURL(backRef),
	]);
	return { frontUrl, backUrl };
}

export async function addDocument(
	uid: string,
	data: { type: string; number: string; frontFile: File; backFile: File }
): Promise<DocumentItem> {
	const tempDoc = await addDoc(documentsCol(uid), {
		type: data.type,
		number: data.number,
		createdAt: serverTimestamp(),
		frontImageUrl: "",
		backImageUrl: "",
	});
	const { frontUrl, backUrl } = await uploadDocumentImages(uid, tempDoc.id, data.frontFile, data.backFile);
	await updateDoc(tempDoc, { frontImageUrl: frontUrl, backImageUrl: backUrl });
	return {
		id: tempDoc.id,
		type: data.type,
		number: data.number,
		frontImageUrl: frontUrl,
		backImageUrl: backUrl,
		createdAt: Timestamp.now(),
	};
}

export async function listDocuments(uid: string): Promise<DocumentItem[]> {
	const qs = await getDocs(documentsCol(uid));
	return qs.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<DocumentItem, "id">) }));
}

export async function deleteDocument(uid: string, id: string) {
	await deleteDoc(doc(db, "users", uid, "documents", id));
}

export async function updateDocument(
  uid: string,
  id: string,
  data: { type?: string; number?: string; frontFile?: File | null; backFile?: File | null }
): Promise<DocumentItem> {
  const dref = doc(db, "users", uid, "documents", id);
  const toUpdate: any = {};
  if (data.type !== undefined) toUpdate.type = data.type;
  if (data.number !== undefined) toUpdate.number = data.number;

  // If any new files provided, upload and set URLs
  if (data.frontFile) {
    const frontRef = ref(storage, `users/${uid}/documents/${id}/front`);
    await uploadBytes(frontRef, data.frontFile);
    toUpdate.frontImageUrl = await getDownloadURL(frontRef);
  }
  if (data.backFile) {
    const backRef = ref(storage, `users/${uid}/documents/${id}/back`);
    await uploadBytes(backRef, data.backFile);
    toUpdate.backImageUrl = await getDownloadURL(backRef);
  }

  if (Object.keys(toUpdate).length > 0) {
    await updateDoc(dref, toUpdate);
  }
  const snap = await getDoc(dref);
  return { id, ...(snap.data() as Omit<DocumentItem, "id">) };
}

// Bookings
export async function addBooking(uid: string, booking: Omit<BookingItem, "id">): Promise<BookingItem> {
	const refCreated = await addDoc(bookingsCol(uid), booking);
	return { id: refCreated.id, ...booking } as BookingItem;
}

export async function listBookingsByStatus(uid: string) {
	const qs = await getDocs(bookingsCol(uid));
	const all = qs.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<BookingItem, "id">) }));
	return {
		active: all.filter((b) => b.status === "active"),
		scheduled: all.filter((b) => b.status === "scheduled"),
		history: all.filter((b) => b.status === "completed" || b.status === "cancelled"),
	};
}


