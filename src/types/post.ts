export interface Post {
  id: string;
  title: string;
  productName: string;
  price?: string;
  oldPrice?: string;
  description: string;
  features?: string;
  location?: string;
  deliveryInfo?: string;
  contactInfo?: string;
  callToAction?: string;
  images: string[];          // base64 data URLs or image URLs
  caption?: string;          // AI-generated or custom caption
  templateId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface PostTemplate {
  id: string;
  name: string;
  content: string;           // e.g. "{product_name}\nPrice: {price}\n{description}..."
  variables: string[];       // list of variables used
  isDefault?: boolean;
  createdAt: number;
  updatedAt: number;
}

export type VariableMap = Record<string, string | undefined>;
