

export type IName = {
  first: string;
  middle?: string;
  last: string;
};

export type IAddress = {
  street: string;
  city: string;
  state?: string;
  zip?: string;
  country: string;
  houseNumber: number;
};

export type IImage = {
  url: string;
  alt?: string;
};

export type IUserInput = {
  email: string;
  phone: string;
  password: string;
  /* isBusiness: boolean; */
  address: IAddress;
  name: IName;
  /*  image?: IImage;
   alt: string; */
};

export type IUser = IUserInput & {
  _id?: string;
  createdAt: Date;
  isAdmin: boolean;
  cart?: ICart[];
};


export type ILogin = {
  email: string;
  password: string;
};

export type IJWTPayload = {
  _id: string;
  isAdmin: boolean;
  /*   isBusiness: boolean; */
};



export interface ICartItem {
  productId: string;
  variantId: string;
  title: string;
  price: number;
  size: string;
  color: string; // Add color property
  quantity: number;
  mainImage: IImage;

}


export interface ICart {
  userId?: string; // הפיכת userId לאופציונלי כדי לתמוך במשתמשי אורח
  items: ICartItem[];
  isGuest?: boolean; // הוספת שדה חדש לזיהוי האם מדובר במשתמש אורח
}


export interface ICartWithTotals extends ICart {
  totalQuantity: number;
  totalPrice: number;
};


export type IColor = {
  name: string; // שם הצבע (לדוגמה: "red", "כחול")
  quantity: number; // כמות המלאי של הצבע הזה
};

export type IVariant = {
  _id?: string;
  size: string; // גודל המוצר (לדוגמה: "S", "M", "L")
  colors: IColor[]; // מערך של צבעים, לכל צבע יש כמות משלו
  price: number; // מחיר עבור הווריאנט הזה
};

export type IProductInput = {
  title: string; // כותרת המוצר
  subtitle: string; // תת כותרת
  description: string; // תיאור המוצר
  mainImage?: IImage; // תמונה ראשית (אופציונלית)
  images: IImage[]; // מערך של תמונות נוספות
  alt: string; // טקסט חלופי לתמונה
  variants: IVariant[]; // מערך של וריאנטים
  mainCategory: string; // קטגוריה ראשית
  tags: string[]; // תגים נוספים
};


export type IProduct = IProductInput & {
  _id: string;
  barcode: number;
  createdAt: Date;
  shoppingCart: string[];
  sold: number;
  userId: string;
};



export type IOrderProduct = {
  productId: string;
  quantity: number;
  size: string;
  price: number;
  title: string;
  color: string; // Add color property
};

// טיפוס עבור הזמנה
export type IOrder = {
  userId: string;
  products: IOrderProduct[];
  totalAmount: number;
  status: string;
  createdAt: Date;
  orderNumber: string;
};

export interface SalesByDateQuery {
  startDate: string;
  endDate: string;
}

export type IUpdateUserType = {
  name: {
    first: string;
    middle: string;
    last: string;
  };
  phone: string;
  address: {
    state: string;
    country: string;
    city: string;
    street: string;
    houseNumber: number;
    zip: number;
  };
};


export type IMessage = {
  fullName: string;
  email: string;
  phone: string;
  message: string;
  createdAt?: Date;
}

export type IPageComponent = {
  type: 'banner' | 'image' | 'title' | 'text'; // סוג הרכיב
  content: string; // תוכן הרכיב - טקסט או URL לתמונה
  image?: IImage; // מבנה של תמונה
  alt?: string; // תיאור התמונה (alt) מחוץ לשדה התמונה כדי לשמור על עקביות עם שאר המערכת
  styles?: {
    color?: string;
    fontSize?: string;
  };
  position?: {
    x: number; // מיקום אופקי
    y: number; // מיקום אנכי
  };
};

export type IPage = {
  _id?: string;
  title: string;
  components: IPageComponent[];
  createdAt: Date;
};



export type IParashaComponent = {
  type: 'banner' | 'title' | 'text'; // סוג הרכיב (כמו תוכן, תמונה, כותרת)
  content: string; // תוכן הרכיב - טקסט או URL לתמונה
  image: IImage; // מבנה של תמונה (לא חובה)
  alt?: string; // תיאור התמונה (alt)
};

export type IParasha = {
  _id?: string;
  title: string;
  components: IParashaComponent[];
  createdAt: Date;
  userId: string
};


// types/articleType.ts

export type IImages = {
  url: string;       // URL של התמונה
  alt: string;       // תיאור התמונה (alt)
  description?: string; // תיאור נוסף או כיתוב עבור התמונה
};

export type ArticleInput = {
  source: string;          // שם המחבר
  title: string;           // כותרת המאמר
  miniText: string;        // תקציר שמתאר את המאמר
  alt: string;
  mainImage?: IImages;          // תיאור התמונה (alt)
  images: IImages[];        // מערך של תמונות למאמר
  longText: ArticleLongText[];    // רשימת עמודי המאמר
};

export type ArticleLongText = {
  title?: string; // כותרת של עמוד
  text: string;  // תוכן של עמוד
};

export type Article = ArticleInput & {
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};




export type CarouselImage = CarouselImageInput & {
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export type CarouselImageInput = {
  url: string;
  alt: string;
/*   description?: string;
 */};

// סוג חדש לעדכון תמונה
export type CarouselImageUpdateInput = Partial<CarouselImageInput>;