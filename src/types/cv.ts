// TODO: strict type: replace `any` type hints with proper Timestamp type from firebase/firestore
// For now, use `any` to avoid namespace type errors during TS2709 sweep

export interface CVInterface {
  cvId?: string; // optional when creating a new CV
  userId: string;
  cvData: any; // structured CV JSON produced by the AI builder
  pdfUrl?: string; // optional until PDF is generated
  title: string;
  createdAt: any; // TODO: replace with Timestamp type
  updatedAt: any; // TODO: replace with Timestamp type
}
