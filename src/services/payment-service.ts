import { PaymentDataToSave } from "../@types/chabad";
import { Payment } from "../db/models/PaymentModel";

export const paymentService = {
  handleCallback: async (data: any) => {

    try {
      console.log("Received callback from Nedarim Plus:" + JSON.stringify(data, null, 2));

      // כאן תוכל לבדוק את סטטוס העסקה ולעדכן את מסד הנתונים
      if (data.status === "SUCCESS") {
        console.log(`Transaction ${data.transactionId} completed successfully.`);
        // לדוגמה: עדכון מסד נתונים
      } else {
        console.log(`Transaction ${data.transactionId} failed.`);
        // לדוגמה: שמירת סטטוס שגיאה
      }
    } catch (error) {
      console.error("Error in Nedarim Service:", error);
      throw error;
    }

  },

  savePayment: async (data: PaymentDataToSave) => {
    // מחפשים תשלום קיים לפי הטלפון
    const existingPayment = await Payment.findOne({ FirstName: data.FirstName, LastName: data.LastName, Phone: data.Phone });

    if (existingPayment) {
      // אם יש, מחברים את הסכום החדש לישן
      existingPayment.Amount += data.Amount * data.Tashlumim;
      // אפשר לעדכן גם את Tashlumim אם תרצה, או להשאיר אותו כפי שהוא
      if (data.Tashlumim) {
        existingPayment.Tashlumim = data.Tashlumim;
      }
      await existingPayment.save();
      return existingPayment;
    } else {
      // אם לא קיים, יוצרים חדש
      const newPaymentData = {
        FirstName: data.FirstName,
        LastName: data.LastName,
        Phone: data.Phone,
        Amount: data.Amount * data.Tashlumim, // סכום כולל לפי מספר התשלומים
        Tashlumim: data.Tashlumim || 1,
        Comments: data.Comments,

      };

      const payment = new Payment(newPaymentData);
      await payment.save();
      return payment;
    }
  },

};
