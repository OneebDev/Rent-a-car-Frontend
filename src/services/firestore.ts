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
	const existing = await getDoc(uref);
	if (!existing.exists()) {
		// When creating the profile for the first time, set createdOn
		await setDoc(uref, { ...data, createdOn: serverTimestamp() } as any, { merge: true });
	} else {
		await setDoc(uref, data as any, { merge: true });
	}
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
	return { id: refDoc.id, ...item } as AddressItem;
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

export async function listDocuments(uid: string) {
	const qs = await getDocs(documentsCol(uid));
	return qs.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

export async function upsertDocument(
	uid: string,
	options: {
		id?: string; // update when provided, else create
		type: string;
		number: string;
		frontFile?: File | null;
		backFile?: File | null;
	}
): Promise<{ id: string; type: string; number: string; frontImageUrl: string; backImageUrl: string; }> {
	if (options.id) {
		// Update existing doc
		const dref = doc(db, "users", uid, "documents", options.id);
		const snap = await getDoc(dref);
		let frontImageUrl = (snap.data()?.frontImageUrl as string) || "";
		let backImageUrl = (snap.data()?.backImageUrl as string) || "";
		if (options.frontFile) {
			const frontRef = ref(storage, `users/${uid}/documents/${options.id}/front`);
			await uploadBytes(frontRef, options.frontFile);
			frontImageUrl = await getDownloadURL(frontRef);
		}
		if (options.backFile) {
			const backRef = ref(storage, `users/${uid}/documents/${options.id}/back`);
			await uploadBytes(backRef, options.backFile);
			backImageUrl = await getDownloadURL(backRef);
		}
		await updateDoc(dref, {
			type: options.type,
			number: options.number,
			frontImageUrl,
			backImageUrl,
			createdAt: snap.data()?.createdAt || serverTimestamp(),
		});
		return { id: options.id, type: options.type, number: options.number, frontImageUrl, backImageUrl };
	}
	// Create new doc
	const created = await addDocument(uid, { type: options.type, number: options.number, frontFile: options.frontFile as File, backFile: options.backFile as File });
	return { id: created.id, type: created.type, number: created.number, frontImageUrl: created.frontImageUrl, backImageUrl: created.backImageUrl };
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


