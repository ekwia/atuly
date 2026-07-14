import { initializeApp } from "firebase/app";
import { 
  initializeFirestore, 
  collection, 
  getDocs, 
  getDoc,
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where 
} from "firebase/firestore";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { Product, Order, Review, User } from "./types";
import { products as defaultProducts, reviews as defaultReviews } from "./data";

// Firebase credentials from generated configuration
const firebaseConfig = {
  apiKey: "AIzaSyCKd8tX9_yU7vIICYt0_ilLb_p7Y40fF5M",
  authDomain: "axiomatic-smile-607pf.firebaseapp.com",
  projectId: "axiomatic-smile-607pf",
  storageBucket: "axiomatic-smile-607pf.firebasestorage.app",
  messagingSenderId: "377825050042",
  appId: "1:377825050042:web:1a6e81bbd42945c2b3b183"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Use the specific firestore database ID provisioned for this applet with forced long polling
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, "ai-studio-atulyajewelers-31611d17-3baa-4cd7-8c83-6136b61819c8");

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider custom parameters if needed
googleProvider.setCustomParameters({
  prompt: "select_account"
});

const PRODUCTS_COLLECTION = "products";
const ORDERS_COLLECTION = "orders";

/**
 * Fetch products from Firestore.
 * If the collection is empty, automatically seed it with default catalog products.
 */
export async function getProductsFromDB(): Promise<Product[]> {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(productsRef);
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log("Firestore products collection is empty. Seeding default products...");
      await seedDefaultProducts();
      return getProductsFromDB();
    }
    
    const productsList: Product[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      productsList.push({
        id: data.id,
        title: data.title || "",
        price: Number(data.price) || 0,
        originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
        category: data.category || "",
        material: data.material || "",
        image: data.image || "",
        rating: Number(data.rating) || 5,
        ratingCount: Number(data.ratingCount) || 0,
        sold: Number(data.sold) || 0,
        badge: data.badge || undefined,
        description: data.description || "",
        attributes: data.attributes || []
      } as Product);
    });
    
    // Sort products by id ascending to keep original ordering
    return productsList.sort((a, b) => a.id - b.id);
  } catch (error) {
    console.error("Error fetching products from Firestore:", error);
    // Fallback to static products in case of error
    return defaultProducts;
  }
}

/**
 * Seeds default products to Firestore.
 */
async function seedDefaultProducts() {
  for (const prod of defaultProducts) {
    try {
      // Use the numeric product ID as the Firestore document key
      const docRef = doc(db, PRODUCTS_COLLECTION, String(prod.id));
      await setDoc(docRef, prod);
    } catch (err) {
      console.error(`Failed to seed product ${prod.id}:`, err);
    }
  }
  console.log("Finished seeding default products successfully!");
}

/**
 * Create or update a product in Firestore.
 */
export async function saveProductToDB(product: Product): Promise<void> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, String(product.id));
    await setDoc(docRef, product);
  } catch (error) {
    console.error("Error saving product to Firestore:", error);
    throw error;
  }
}

/**
 * Delete a product from Firestore.
 */
export async function deleteProductFromDB(id: number): Promise<void> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, String(id));
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting product from Firestore:", error);
    throw error;
  }
}

/**
 * Fetch all orders from Firestore.
 * Can be optionally filtered by user email.
 */
export async function getOrdersFromDB(email?: string): Promise<Order[]> {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    let q = query(ordersRef, orderBy("createdAt", "desc"));
    
    if (email) {
      // Direct query filter if email is specified
      q = query(ordersRef, where("customerEmail", "==", email.toLowerCase().trim()), orderBy("createdAt", "desc"));
    }
    
    const querySnapshot = await getDocs(q);
    const ordersList: Order[] = [];
    
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      ordersList.push({
        id: docSnap.id,
        customerName: data.customerName || "",
        customerEmail: data.customerEmail || "",
        customerPhone: data.customerPhone || "",
        shippingAddress: data.shippingAddress || "",
        city: data.city || "",
        pincode: data.pincode || "",
        items: data.items || [],
        subtotal: Number(data.subtotal) || 0,
        gst: Number(data.gst) || 0,
        grandTotal: Number(data.grandTotal) || 0,
        status: data.status || "Pending",
        createdAt: data.createdAt || new Date().toISOString(),
        paymentStatus: data.paymentStatus || "Unpaid"
      } as Order);
    });
    
    return ordersList;
  } catch (error) {
    console.error("Error fetching orders from Firestore:", error);
    return [];
  }
}

/**
 * Add a new order to Firestore.
 */
export async function addOrderToDB(order: Order): Promise<void> {
  try {
    // Save with the specific order.id as document name
    const docRef = doc(db, ORDERS_COLLECTION, order.id);
    const orderData = {
      ...order,
      customerEmail: order.customerEmail.toLowerCase().trim()
    };
    await setDoc(docRef, orderData);
  } catch (error) {
    console.error("Error adding order to Firestore:", error);
    throw error;
  }
}

/**
 * Update the status of an order.
 */
export async function updateOrderStatusInDB(orderId: string, status: Order['status']): Promise<void> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, { status });
  } catch (error) {
    console.error("Error updating order status in Firestore:", error);
    throw error;
  }
}

/**
 * Update the payment status of an order.
 */
export async function updateOrderPaymentStatusInDB(orderId: string, paymentStatus: Order['paymentStatus']): Promise<void> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, { paymentStatus });
  } catch (error) {
    console.error("Error updating order payment status in Firestore:", error);
    throw error;
  }
}

// --- PRODUCT REVIEWS OPERATIONS ---
const REVIEWS_COLLECTION = "reviews";

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Fetch reviews for a specific product.
 * If the collection is empty for this product, we seed it with some default reviews.
 */
export async function getReviewsFromDB(productId: number): Promise<Review[]> {
  try {
    const reviewsRef = collection(db, REVIEWS_COLLECTION);
    const q = query(reviewsRef, where("productId", "==", productId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log(`No reviews found for product ${productId}. Seeding default reviews...`);
      await seedDefaultReviewsForProduct(productId);
      // Query again
      const refreshedSnapshot = await getDocs(q);
      const reviewsList: Review[] = [];
      refreshedSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        reviewsList.push({
          id: docSnap.id,
          name: data.name || "",
          date: data.date || "",
          avatar: data.avatar || "",
          rating: Number(data.rating) || 5,
          text: data.text || "",
          productId: Number(data.productId)
        });
      });
      return reviewsList;
    }
    
    const reviewsList: Review[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      reviewsList.push({
        id: docSnap.id,
        name: data.name || "",
        date: data.date || "",
        avatar: data.avatar || "",
        rating: Number(data.rating) || 5,
        text: data.text || "",
        productId: Number(data.productId)
      });
    });
    
    return reviewsList;
  } catch (error) {
    console.error(`Error fetching reviews for product ${productId}:`, error);
    // Return filtered static reviews as fallback
    return defaultReviews.map(r => ({ ...r, productId }));
  }
}

/**
 * Seeds default reviews for a product if none exist in the DB.
 */
async function seedDefaultReviewsForProduct(productId: number) {
  for (const [index, rev] of defaultReviews.entries()) {
    try {
      const docId = `seeded-rev-${productId}-${index}`;
      const docRef = doc(db, REVIEWS_COLLECTION, docId);
      const reviewPayload = {
        id: docId,
        productId,
        name: rev.name,
        email: `${rev.name.toLowerCase().replace(" ", "")}@gmail.com`,
        rating: rev.rating,
        text: rev.text,
        date: rev.date,
        avatar: rev.avatar
      };
      await setDoc(docRef, reviewPayload);
    } catch (err) {
      console.error(`Failed to seed review for product ${productId}:`, err);
    }
  }
}

/**
 * Add a new review to the database.
 */
export async function addReviewToDB(review: Omit<Review, "id"> & { email: string }): Promise<Review> {
  const path = REVIEWS_COLLECTION;
  try {
    const reviewsRef = collection(db, REVIEWS_COLLECTION);
    const newDocRef = doc(reviewsRef); // generate safe Firestore ID
    const docId = newDocRef.id;
    
    const finalReview = {
      ...review,
      id: docId,
      productId: Number(review.productId)
    };
    
    await setDoc(doc(db, REVIEWS_COLLECTION, docId), finalReview);
    return finalReview;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

/**
 * Fetch a user profile document from Firestore.
 */
export async function getUserProfileFromDB(uid: string): Promise<User | null> {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as User;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile from Firestore:", error);
    return null;
  }
}

/**
 * Save or update a user profile document in Firestore.
 */
export async function saveUserProfileToDB(uid: string, userProfile: User): Promise<void> {
  const path = `users/${uid}`;
  try {
    const docRef = doc(db, "users", uid);
    const profileData = {
      uid,
      name: userProfile.name,
      email: userProfile.email.toLowerCase().trim(),
      picture: userProfile.picture || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(userProfile.name)}`,
      role: userProfile.role || "user"
    };
    await setDoc(docRef, profileData);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}
