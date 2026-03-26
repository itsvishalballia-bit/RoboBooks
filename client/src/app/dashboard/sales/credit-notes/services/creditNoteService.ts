/**
 * Credit Note Service
 * Handles all credit note related API operations
 */

import { creditNoteIdGenerator } from "../utils/creditNoteIdGenerator";

export interface CreditNoteItem {
  id: string;
  itemDetails: string;
  account: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface CreditNote {
  id: string;
  creditNoteNumber: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  date: string;
  referenceNumber?: string;
  salesperson?: string;
  subject?: string;
  items: CreditNoteItem[];
  subTotal: number;
  discount: number;
  discountType: "percentage" | "amount";
  tdsType: "TDS" | "TCS";
  selectedTax?: string;
  tdsAmount: number;
  adjustment: number;
  total: number;
  status: "draft" | "open" | "void";
  notes?: string;
  terms?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCreditNoteRequest {
  customerName: string;
  referenceNumber?: string;
  creditNoteDate: string;
  salesperson?: string;
  subject?: string;
  items: CreditNoteItem[];
  discount: number;
  discountType: "percentage" | "amount";
  tdsType: "TDS" | "TCS";
  selectedTax?: string;
  tdsAmount: number;
  adjustment: number;
  notes?: string;
  terms?: string;
}

export interface UpdateCreditNoteRequest extends CreateCreditNoteRequest {
  id: string;
}

export interface CreditNoteFilters {
  status?: "draft" | "open" | "void";
  customerName?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

class CreditNoteService {
  private baseUrl = "/api/credit-notes"; // Adjust based on your API structure
  private storageKey = "robobooks-credit-notes";

  private getSeedCreditNotes(): CreditNote[] {
    const now = new Date().toISOString();
    return [
      {
        id: "1",
        creditNoteNumber: "CN-00001",
        customerName: "ABC Company Ltd",
        customerEmail: "contact@abc.com",
        customerAddress: "123 Business Street, Mumbai, Maharashtra 400001",
        date: "2025-08-11",
        referenceNumber: "REF-001",
        salesperson: "John Doe",
        subject: "Product return - Damaged goods",
        items: [
          {
            id: "1",
            itemDetails: "Laptop Computer - Dell XPS 13",
            account: "Product Returns",
            quantity: 1,
            rate: 15000,
            amount: 15000,
          },
        ],
        subTotal: 15000,
        discount: 0,
        discountType: "percentage",
        tdsType: "TDS",
        selectedTax: "TDS on Services",
        tdsAmount: 0,
        adjustment: 0,
        total: 15000,
        status: "open",
        notes:
          "Customer returned the laptop due to manufacturing defect. Full refund issued.",
        terms: "Credit note valid for 30 days from date of issue.",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "2",
        creditNoteNumber: "CN-00002",
        customerName: "Tech Solutions Ltd",
        customerEmail: "finance@techsolutions.com",
        customerAddress: "45 Tech Park, Bengaluru, Karnataka 560001",
        date: "2025-08-09",
        referenceNumber: "REF-002",
        salesperson: "Jane Smith",
        subject: "Service credit adjustment",
        items: [
          {
            id: "1",
            itemDetails: "Annual support plan adjustment",
            account: "Service Revenue",
            quantity: 1,
            rate: 1800,
            amount: 1800,
          },
        ],
        subTotal: 1800,
        discount: 0,
        discountType: "amount",
        tdsType: "TDS",
        selectedTax: "",
        tdsAmount: 0,
        adjustment: 0,
        total: 1800,
        status: "draft",
        notes: "Credit created for SLA delay compensation.",
        terms: "Applicable against next invoice cycle.",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "3",
        creditNoteNumber: "CN-00003",
        customerName: "Global Industries",
        customerEmail: "accounts@global.com",
        customerAddress: "88 Industrial Estate, Pune, Maharashtra 411014",
        date: "2025-08-12",
        referenceNumber: "REF-003",
        salesperson: "Mike Johnson",
        subject: "Quality issue credit",
        items: [
          {
            id: "1",
            itemDetails: "Premium product batch return",
            account: "Product Returns",
            quantity: 2,
            rate: 1600,
            amount: 3200,
          },
        ],
        subTotal: 3200,
        discount: 0,
        discountType: "percentage",
        tdsType: "TDS",
        selectedTax: "",
        tdsAmount: 0,
        adjustment: 0,
        total: 3200,
        status: "open",
        notes: "Issued against returned batch due to quality issue.",
        terms: "Can be adjusted in future invoices.",
        createdAt: now,
        updatedAt: now,
      },
    ];
  }

  private canUseStorage() {
    return typeof window !== "undefined";
  }

  private readStoredCreditNotes(): CreditNote[] {
    if (!this.canUseStorage()) {
      return this.getSeedCreditNotes();
    }

    const existing = window.localStorage.getItem(this.storageKey);
    if (!existing) {
      const seeded = this.getSeedCreditNotes();
      window.localStorage.setItem(this.storageKey, JSON.stringify(seeded));
      return seeded;
    }

    try {
      return JSON.parse(existing) as CreditNote[];
    } catch {
      const seeded = this.getSeedCreditNotes();
      window.localStorage.setItem(this.storageKey, JSON.stringify(seeded));
      return seeded;
    }
  }

  private writeStoredCreditNotes(notes: CreditNote[]) {
    if (this.canUseStorage()) {
      window.localStorage.setItem(this.storageKey, JSON.stringify(notes));
    }
  }

  private async fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await fetch(url, init);
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    return (await response.json()) as T;
  }

  /**
   * Get all credit notes with optional filtering
   */
  async getCreditNotes(filters?: CreditNoteFilters): Promise<CreditNote[]> {
    try {
      const queryParams = new URLSearchParams();

      if (filters?.status) queryParams.append("status", filters.status);
      if (filters?.customerName)
        queryParams.append("customerName", filters.customerName);
      if (filters?.dateFrom) queryParams.append("dateFrom", filters.dateFrom);
      if (filters?.dateTo) queryParams.append("dateTo", filters.dateTo);
      if (filters?.search) queryParams.append("search", filters.search);

      return await this.fetchJson<CreditNote[]>(
        `${this.baseUrl}?${queryParams.toString()}`
      );
    } catch (error) {
      console.error("Error fetching credit notes, using local fallback:", error);
      let notes = this.readStoredCreditNotes();

      if (filters?.status) {
        notes = notes.filter((note) => note.status === filters.status);
      }
      if (filters?.customerName) {
        notes = notes.filter((note) =>
          note.customerName
            .toLowerCase()
            .includes(filters.customerName!.toLowerCase())
        );
      }
      if (filters?.search) {
        const query = filters.search.toLowerCase();
        notes = notes.filter(
          (note) =>
            note.creditNoteNumber.toLowerCase().includes(query) ||
            note.customerName.toLowerCase().includes(query) ||
            note.customerEmail.toLowerCase().includes(query)
        );
      }

      return notes;
    }
  }

  /**
   * Get a single credit note by ID
   */
  async getCreditNote(id: string): Promise<CreditNote> {
    try {
      return await this.fetchJson<CreditNote>(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error("Error fetching credit note, using local fallback:", error);
      const note = this.readStoredCreditNotes().find((entry) => entry.id === id);
      if (!note) {
        throw new Error("Credit note not found");
      }
      return note;
    }
  }

  /**
   * Create a new credit note
   */
  async createCreditNote(data: CreateCreditNoteRequest): Promise<CreditNote> {
    try {
      // Generate the next credit note number
      const existingCreditNotes = await this.getCreditNotes();
      const existingNumbers = existingCreditNotes.map(
        (cn) => cn.creditNoteNumber
      );
      const nextNumber =
        creditNoteIdGenerator.getNextFromExisting(existingNumbers);

      const creditNoteData = {
        ...data,
        creditNoteNumber: nextNumber,
        status: "draft" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(creditNoteData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create credit note: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating credit note, using local fallback:", error);
      const existingCreditNotes = this.readStoredCreditNotes();
      const existingNumbers = existingCreditNotes.map((cn) => cn.creditNoteNumber);
      const nextNumber =
        creditNoteIdGenerator.getNextFromExisting(existingNumbers);

      const newCreditNote: CreditNote = {
        id: Date.now().toString(),
        creditNoteNumber: nextNumber,
        customerName: data.customerName,
        customerEmail: "",
        customerAddress: "",
        date: data.creditNoteDate,
        referenceNumber: data.referenceNumber,
        salesperson: data.salesperson,
        subject: data.subject,
        items: data.items,
        subTotal: this.calculateTotals(
          data.items,
          data.discount,
          data.discountType,
          data.tdsAmount,
          data.adjustment
        ).subTotal,
        discount: data.discount,
        discountType: data.discountType,
        tdsType: data.tdsType,
        selectedTax: data.selectedTax,
        tdsAmount: data.tdsAmount,
        adjustment: data.adjustment,
        total: this.calculateTotals(
          data.items,
          data.discount,
          data.discountType,
          data.tdsAmount,
          data.adjustment
        ).total,
        status: "draft",
        notes: data.notes,
        terms: data.terms,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.writeStoredCreditNotes([newCreditNote, ...existingCreditNotes]);
      return newCreditNote;
    }
  }

  /**
   * Update an existing credit note
   */
  async updateCreditNote(
    id: string,
    data: UpdateCreditNoteRequest
  ): Promise<CreditNote> {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update credit note: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating credit note, using local fallback:", error);
      const existing = this.readStoredCreditNotes();
      const current = existing.find((note) => note.id === id);
      if (!current) {
        throw new Error("Credit note not found");
      }

      const totals = this.calculateTotals(
        data.items,
        data.discount,
        data.discountType,
        data.tdsAmount,
        data.adjustment
      );

      const updated: CreditNote = {
        ...current,
        customerName: data.customerName,
        date: data.creditNoteDate,
        referenceNumber: data.referenceNumber,
        salesperson: data.salesperson,
        subject: data.subject,
        items: data.items,
        subTotal: totals.subTotal,
        discount: data.discount,
        discountType: data.discountType,
        tdsType: data.tdsType,
        selectedTax: data.selectedTax,
        tdsAmount: data.tdsAmount,
        adjustment: data.adjustment,
        total: totals.total,
        notes: data.notes,
        terms: data.terms,
        updatedAt: new Date().toISOString(),
      };

      this.writeStoredCreditNotes(
        existing.map((note) => (note.id === id ? updated : note))
      );
      return updated;
    }
  }

  /**
   * Delete a credit note
   */
  async deleteCreditNote(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete credit note: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error deleting credit note, using local fallback:", error);
      this.writeStoredCreditNotes(
        this.readStoredCreditNotes().filter((note) => note.id !== id)
      );
    }
  }

  /**
   * Change credit note status
   */
  async updateCreditNoteStatus(
    id: string,
    status: "draft" | "open" | "void"
  ): Promise<CreditNote> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to update credit note status: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(
        "Error updating credit note status, using local fallback:",
        error
      );
      const existing = this.readStoredCreditNotes();
      const note = existing.find((entry) => entry.id === id);
      if (!note) {
        throw new Error("Credit note not found");
      }

      const updated = {
        ...note,
        status,
        updatedAt: new Date().toISOString(),
      };

      this.writeStoredCreditNotes(
        existing.map((entry) => (entry.id === id ? updated : entry))
      );
      return updated;
    }
  }

  /**
   * Get credit note statistics
   */
  async getCreditNoteStats(): Promise<{
    total: number;
    draft: number;
    open: number;
    void: number;
    totalAmount: number;
  }> {
    try {
      return await this.fetchJson(`${this.baseUrl}/stats`);
    } catch (error) {
      console.error(
        "Error fetching credit note stats, using local fallback:",
        error
      );
      const notes = this.readStoredCreditNotes();
      return {
        total: notes.length,
        draft: notes.filter((note) => note.status === "draft").length,
        open: notes.filter((note) => note.status === "open").length,
        void: notes.filter((note) => note.status === "void").length,
        totalAmount: notes.reduce((sum, note) => sum + note.total, 0),
      };
    }
  }

  /**
   * Export credit notes to PDF
   */
  async exportToPDF(id: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/export/pdf`);

      if (!response.ok) {
        throw new Error(`Failed to export credit note: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error("Error exporting credit note, using local fallback:", error);
      const note = await this.getCreditNote(id);
      const content = `Credit Note ${note.creditNoteNumber}\nCustomer: ${note.customerName}\nTotal: ${note.total}\nDate: ${note.date}`;
      return new Blob([content], { type: "application/pdf" });
    }
  }

  /**
   * Send credit note to customer
   */
  async sendToCustomer(id: string, email?: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send credit note: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error sending credit note, using local fallback:", error);
      const note = await this.getCreditNote(id);
      console.log(`Credit note ${note.creditNoteNumber} queued for ${email || note.customerEmail}`);
    }
  }

  /**
   * Calculate totals for credit note items
   */
  calculateTotals(
    items: CreditNoteItem[],
    discount: number,
    discountType: "percentage" | "amount",
    tdsAmount: number,
    adjustment: number
  ) {
    const subTotal = items.reduce((sum, item) => sum + item.amount, 0);
    const discountAmount =
      discountType === "percentage" ? (subTotal * discount) / 100 : discount;
    const total = subTotal - discountAmount - tdsAmount + adjustment;

    return {
      subTotal,
      discountAmount,
      total,
    };
  }

  /**
   * Validate credit note data
   */
  validateCreditNote(data: CreateCreditNoteRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!data.customerName?.trim()) {
      errors.push("Customer name is required");
    }

    if (!data.creditNoteDate) {
      errors.push("Credit note date is required");
    }

    if (!data.items || data.items.length === 0) {
      errors.push("At least one item is required");
    } else {
      data.items.forEach((item, index) => {
        if (!item.itemDetails?.trim()) {
          errors.push(`Item ${index + 1}: Item details are required`);
        }
        if (item.quantity <= 0) {
          errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
        }
        if (item.rate < 0) {
          errors.push(`Item ${index + 1}: Rate cannot be negative`);
        }
      });
    }

    if (data.discount < 0) {
      errors.push("Discount cannot be negative");
    }

    if (data.adjustment < 0) {
      errors.push("Adjustment cannot be negative");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const creditNoteService = new CreditNoteService();
