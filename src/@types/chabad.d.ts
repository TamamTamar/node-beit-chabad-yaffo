

export type ParashaInput = {
    source: string;          // שם המחבר
    title: string;           // כותרת הפרשה
    miniText: string;        // טקסט מקוצר שמתאר את הפרשה
    alt: string;             // תיאור התמונה (alt)
    image: IImage;    // תמונה של הפרשה
    longText: longText[]; // רשימת עמודי הפרשה
};

export type longText = {
    title?: string; // כותרת של עמוד
    text: string;  // תוכן של עמוד
};

export type Parasha = ParashaInput & {
    _id: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
};

export type IImage = {
    url: string;
    alt?: string;
  };

  interface PaymentParams {
    mosadId: string;
    apiValid: string;
    zeout: string;
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    phone: string;
    email: string;
    amount: number;
    paymentType: string;  // 'Ragil', 'HK', 'CreateToken'
    currency: number;  // 1 (שקל) | 2 (דולר)
    callbackUrl: string;
  }
  