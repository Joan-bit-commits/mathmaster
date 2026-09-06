import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
export const useScanStore = create(persist((set) => ({ scans: [], currentScan: null, addScan: (scan) => set((state) => ({ scans: [scan, ...state.scans].slice(0, 20) })), setCurrentScan: (scan) => set({ currentScan: scan }), clearScans: () => set({ scans: [], currentScan: null }) }), { name: 'mathmaster-scans', storage: createJSONStorage(() => AsyncStorage) }));