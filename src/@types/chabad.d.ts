

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
export interface PaymentInput {
  Mosad?: string;
  ApiValid?: string;
  Zeout?: string;
  FirstName: string;
  LastName?: string;
  Street?: string;
  City?: string;
  Phone?: string;
  Mail?: string;
  PaymentType?: string;
  Amount: number;
  Tashlumim?: number;
  Currency?: number;
  Groupe?: string;
  Comment?: string;
  CallBack?: string;
  CallBackMailError?: string;
  createdAt?: Date;
}
export interface PaymentDataToSave {
  FirstName: string;
  LastName: string;
  Phone?: string;
  Amount: number;
  Tashlumim: number;
  createdAt?: Date;
  lizchut?: string;
  Comment: string;
  ref?: string; // reference extracted from comment

}


export interface prices {
  adultPrice: number;
  childPrice: number;
  couplePrice: number;
}
export type RawDonation = {
  ClientName: string;
  Amount: string;
  TransactionType: string;
  Groupe: string;
  TransactionTime: string;
  Tashloumim?: string;
  FirstTashloum?: string;
  NextTashloum?: string;
};

export type AggregatedDonation = {
  name: string;
  amount: number;
  lizchut: string;
  date: string;
};