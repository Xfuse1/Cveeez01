import { Timestamp } from 'firebase/firestore';

export interface CVInterface {
  cvId?: string; // optional when creating a new CV
  userId: string;
  cvData: any; // structured CV JSON produced by the AI builder
  pdfUrl?: string; // optional until PDF is generated
  title: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
