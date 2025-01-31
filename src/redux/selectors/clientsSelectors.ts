// filepath: /Users/abraham/Development/flex-job-reports-mobile/src/redux/selectors/clientsSelectors.ts
import { Client } from '../../types/Client';
import { RootState } from '../store';

export const selectClients = (state: RootState): Client[] => state.clients.clients;
export const selectClientsLoading = (state: RootState): boolean => state.clients.clientsLoading;
export const selectError = (state: RootState): string | null => state.clients.error;
export const selectHasMore = (state: RootState): boolean => state.clients.hasMore;
export const selectClientPage = (state: RootState): number => state.clients.page;