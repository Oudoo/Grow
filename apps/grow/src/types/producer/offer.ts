export type OfferStatus = "draft" | "sent" | "accepted" | "declined";
export type ContractType = "full-time" | "part-time" | "contract";

export interface Offer {
  id: string;
  candidateId: string;
  offeredSalary: number;
  firstWorkingDate: string;
  contractType: ContractType;
  itEquipment: string | null;
  status: OfferStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OfferFormData {
  candidateId: string;
  offeredSalary: number;
  firstWorkingDate: string;
  contractType: ContractType;
  itEquipment: string;
}
