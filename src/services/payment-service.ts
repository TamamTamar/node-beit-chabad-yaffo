export const paymentService = {
  handleCallback: async (data: any) => {

      try {
          console.log("Received callback from Nedarim Plus:", data);
  
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
  
};