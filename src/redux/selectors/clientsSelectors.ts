// filepath: /Users/abraham/Development/flex-job-reports-mobile/src/redux/selectors/clientsSelectors.ts
import { RootState } from '../store';
import { ClientAndAddresses } from '../../types/ClientAndAddresses';

export const selectClients = (state: RootState): ClientAndAddresses[] => state.clients.clients;
export const selectClientsLoading = (state: RootState): boolean => state.clients.clientsLoading;
export const selectError = (state: RootState): string | null => state.clients.error;
export const selectHasMore = (state: RootState): boolean => state.clients.hasMore;
export const selectClientPage = (state: RootState): number => state.clients.page;