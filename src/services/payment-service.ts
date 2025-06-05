import axios from "axios";
import { AggregatedDonation, RawDonation } from "../@types/chabad";

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
  async fetchAndAggregateDonations(): Promise<AggregatedDonation[]> {
    const { data } = await axios.get('https://matara.pro/nedarimplus/Reports/Manage3.aspx', {
      params: {
        Action: 'GetHistoryJson',
        MosadNumber: '7013920',
        ApiPassword: 'fp203',
      },
    });

    const aggregatedMap = new Map<string, AggregatedDonation>();

    data.forEach((item: RawDonation) => {
      const name = item.ClientName?.trim() || '—';
      const lizchut = item.Groupe?.trim() || '';
      const date = item.TransactionTime?.split(' ')[0] || '';

      const amount = parseFloat(item.Amount) || 0;
      const tashloumim = parseInt(item.Tashloumim || '1');
      const first = parseFloat(item.FirstTashloum || '0');
      const next = parseFloat(item.NextTashloum || '0');

      const fullAmount =
        item.TransactionType === 'תשלומים'
          ? first + next * (tashloumim - 1)
          : amount;

      if (aggregatedMap.has(name)) {
        const existing = aggregatedMap.get(name)!;
        aggregatedMap.set(name, {
          ...existing,
          amount: existing.amount + fullAmount,
        });
      } else {
        aggregatedMap.set(name, { name, amount: fullAmount, lizchut, date });
      }
    });

    return Array.from(aggregatedMap.values());
  },
};