export type CreateBitInput = {
    FirstName: string;
    LastName: string;
    Phone: string;      // ספרות בלבד
    Mail?: string;
    Amount: number;     // ₪
    Comment?: string;
    Groupe?: string;    // קטגוריה/קמפיין אם יש
    ref?: string;       // מזהה מגייס / קמפיין פנימי
};

export type NedarimBitCreatePayload = {
    Action: "CreateTransaction";
    MosadId: string;     // .env
    ApiValid: string;    // .env
    Zeout?: string;
    ClientName: string;
    Street?: string;
    City?: string;
    Phone: string;       // ספרות בלבד
    Mail?: string;
    Amount: string;      // 2 ספרות דצימליות כמחרוזת
    Groupe?: string;
    Comment?: string;
    Param2: string;      // מזהה ייחודי אצלך
    UrlSuccess: string;
    UrlFailure: string;
    CallBack: string;    // כתובת הקאלבק שלך
};

export type BitCallbackPayload = {
    Status?: string;          // "OK" או אחר
    CreatedDate?: string;
    ClientId?: string;
    Zeout?: string;
    ClientName?: string;
    Adresse?: string;
    Phone?: string;
    Mail?: string;
    Amount?: string;          // "1.00"
    Month?: string;
    TransactionType?: string; // "ביט" וכו'
    Currency?: string;
    NextDate?: string;
    AuthorisationNumber?: string;
    LastNum?: string;
    Tokef?: string;
    Groupe?: string;
    Comments?: string;
    MosadNumber?: string;
    MasofId?: string;
    ID?: string;              // מזהה עסקה בנדרים
    DebitIframe?: string;
    Param1?: string;
    Param2?: string;          // ← חשוב לשיוך
    Alert?: string;
};
export interface IBitPayment {
    param2: string;                     // מזהה ייחודי לעסקה
    status: "pending" | "paid" | "error";
    amount?: number;
    nedarimId?: string;
    clientName?: string;
    phone?: string;
    mail?: string;
    comment?: string;
    ref?: string;
    raw?: any;
}
