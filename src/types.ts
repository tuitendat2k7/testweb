export interface MenuItem {
  id: number;
  spotId: number;
  name: string;
  price: number;
  image: string | null;
  isPopular: boolean | null;
  createdAt: string | null;
}

export interface Deal {
  id: number;
  spotId: number;
  title: string;
  description: string | null;
  discountCode: string | null;
  expiryDate: string | null;
  createdAt: string | null;
  spot?: Spot | null;
}

export interface Review {
  id: number;
  spotId: number;
  reviewerName: string;
  reviewerEmail?: string | null;
  reviewerUid?: string | null;
  rating: number;
  comment: string;
  createdAt?: string | null;
}

export interface Spot {
  id: number;
  name: string;
  description: string | null;
  category: string; // 'food' | 'drink' | 'shopping'
  address: string;
  school: string | null;
  lat: number;
  lng: number;
  wifi: boolean | null;
  studySpot: boolean | null;
  priceRange: string | null;
  createdAt: string | null;
  deals?: Deal[];
  menuItems?: MenuItem[];
  reviews?: Review[];
}

export interface UserProfile {
  id: number;
  uid: string;
  email: string;
  name: string | null;
  role: 'student' | 'admin';
  createdAt: string | null;
}
