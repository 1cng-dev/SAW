import { createContext, useContext, useState, ReactNode } from "react";
import type { DateRangeOption } from "../components/ui/DateRangeFilter";

interface DateRangeContextType {
  dateRange: DateRangeOption;
  setDateRange: (range: DateRangeOption) => void;
  getDateRangeParams: () => { dateFrom?: string; dateTo?: string };
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

export function DateRangeProvider({ children }: { children: ReactNode }) {
  const [dateRange, setDateRange] = useState<DateRangeOption>("7d");

  const getDateRangeParams = () => {
    const now = new Date();
    const to = now.toISOString().slice(0, 10);
    let from: string | undefined;

    switch (dateRange) {
      case "today":
        from = to;
        break;
      case "7d":
        now.setDate(now.getDate() - 7);
        from = now.toISOString().slice(0, 10);
        break;
      case "30d":
        now.setDate(now.getDate() - 30);
        from = now.toISOString().slice(0, 10);
        break;
      case "90d":
        now.setDate(now.getDate() - 90);
        from = now.toISOString().slice(0, 10);
        break;
      case "custom":
        // For custom, return undefined so caller can set their own dates
        return { dateFrom: undefined, dateTo: undefined };
      default:
        from = undefined;
    }

    return { dateFrom: from, dateTo: to };
  };

  return (
    <DateRangeContext.Provider value={{ dateRange, setDateRange, getDateRangeParams }}>
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange() {
  const context = useContext(DateRangeContext);
  if (!context) {
    throw new Error("useDateRange must be used within a DateRangeProvider");
  }
  return context;
}
