"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { Calendar, Download, ChevronDown, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from "date-fns";

export function ReportFilters({ data = [], totalIncome = 0, period = "" }: { data?: any[], totalIncome?: number, period?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  
  const [showCustom, setShowCustom] = useState(false);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const setPreset = (preset: "today" | "week" | "month" | "all") => {
    let from: string | null = null;
    let to: string | null = null;
    const now = new Date();

    if (preset === "today") {
      from = format(startOfDay(now), "yyyy-MM-dd");
      to = format(endOfDay(now), "yyyy-MM-dd");
    } else if (preset === "week") {
      from = format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
      to = format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
    } else if (preset === "month") {
      from = format(startOfMonth(now), "yyyy-MM-dd");
      to = format(endOfMonth(now), "yyyy-MM-dd");
    }

    updateParams({ from, to });
    setShowCustom(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const exportPDF = () => {
    if (!data.length) return;
    
    // Dynamically import jspdf to avoid SSR issues if necessary, though this is a client component
    import('jspdf').then(async (jsPDFModule) => {
      const jsPDF = jsPDFModule.default;
      const { default: autoTable } = await import('jspdf-autotable');
      
      const doc = new jsPDF();
      
      // Add Title
      doc.setFontSize(18);
      doc.text("Income Report", 14, 22);
      
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Period: ${period}`, 14, 30);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 36);

      // Define columns
      const tableHead = [["Customer Name", "Contact", "Total Payable", "Advance Paid"]];
      
      // Define rows
      const tableRows = data.map(b => [
        b.guest?.fullName || "N/A",
        b.guest?.phone || "N/A",
        `LKR ${Number(b.grandTotal).toLocaleString()}`,
        `LKR ${Number(b.paidAmount).toLocaleString()}`
      ]);

      // Add Table
      autoTable(doc, {
        startY: 45,
        head: tableHead,
        body: tableRows,
        foot: [["TOTAL COLLECTED INCOME", "", "", `LKR ${totalIncome.toLocaleString()}`]],
        theme: 'striped',
        headStyles: { fillColor: [24, 24, 27], textColor: [255, 255, 255] },
        footStyles: { fillColor: [24, 24, 27], textColor: [255, 255, 255], fontStyle: 'bold' },
      });

      // Save the PDF
      doc.save(`income_report_${period.replace(/ /g, "_")}.pdf`);
    });
  };


  const isActive = (preset: string) => {
    const now = new Date();
    if (preset === "all") return !fromParam && !toParam;
    if (preset === "today") return fromParam === format(startOfDay(now), "yyyy-MM-dd");
    if (preset === "week") return fromParam === format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
    if (preset === "month") return fromParam === format(startOfMonth(now), "yyyy-MM-dd");
    return false;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-xl">
          {[
            { id: "all", label: "All Time" },
            { id: "today", label: "Today" },
            { id: "week", label: "This Week" },
            { id: "month", label: "This Month" },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => setPreset(preset.id as any)}
              className={cn(
                "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                isActive(preset.id)
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900"
              )}
            >
              {preset.label}
            </button>
          ))}
          <button
            onClick={() => setShowCustom(!showCustom)}
            className={cn(
              "px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2",
              showCustom || (fromParam && !isActive("today") && !isActive("week") && !isActive("month"))
                ? "bg-white text-blue-600 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900"
            )}
          >
            Custom
            <ChevronDown className={cn("h-3 w-3 transition-transform", showCustom && "rotate-180")} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportPDF}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-zinc-900/10 transition-all hover:bg-zinc-800 active:scale-95 no-print"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </button>
          <button
            onClick={handlePrint}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-all no-print"
            title="Print Page View"
          >
            <Calendar className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showCustom && (
        <div className="flex items-center gap-4 p-4 bg-white border border-zinc-200 rounded-2xl animate-in no-print">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">From Date</label>
            <input
              type="date"
              value={fromParam || ""}
              onChange={(e) => updateParams({ from: e.target.value })}
              className="block w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-2 text-sm font-bold text-zinc-900 focus:bg-white outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">To Date</label>
            <input
              type="date"
              value={toParam || ""}
              onChange={(e) => updateParams({ to: e.target.value })}
              className="block w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-2 text-sm font-bold text-zinc-900 focus:bg-white outline-none"
            />
          </div>
          <button 
            onClick={() => updateParams({ from: null, to: null })}
            className="mt-5 text-xs font-bold text-zinc-400 hover:text-red-500 transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {fromParam && toParam && (
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 bg-zinc-50 px-4 py-2 rounded-xl w-fit">
          <Calendar className="h-3.5 w-3.5" />
          Report Period: {format(new Date(fromParam), "MMM dd, yyyy")} — {format(new Date(toParam), "MMM dd, yyyy")}
        </div>
      )}
    </div>
  );
}
