import { create } from "zustand";
export const useDocumentsStore = create((set) => ({
  documents: [],
  uploadingDocs: {},
  setDocuments: (documents) => set({ documents }),
  addDocument: (document) =>
    set((state) => ({ documents: [document, ...state.documents] })),
  updateDocument: (id, patch) =>
    set((state) => ({
      documents: state.documents.map((item) =>
        String(item.id) === String(id) ? { ...item, ...patch } : item,
      ),
    })),
  removeDocument: (id) =>
    set((state) => ({
      documents: state.documents.filter(
        (item) => String(item.id) !== String(id),
      ),
    })),
  setUploadProgress: (id, progress) =>
    set((state) => ({
      uploadingDocs: { ...state.uploadingDocs, [id]: progress },
    })),
}));
