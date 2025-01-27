import React, { useEffect } from "react";
import SectionedClientsList from "./SectionedClientsList";
import EmptyClients from "./EmptyClients";
import {
  selectClients,
  selectClientsLoading,
  selectError,
  selectHasMore,
} from "../../redux/selectors/clientsSelectors";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { fetchClients } from "../../redux/actions/clientsActions";
import { selectAppCompanyAndUser } from "../../redux/selectors/sessionDataSelectors";

const ClientsList = () => {
  const dispatch = useDispatch();
  const clients = useSelector(selectClients);
  const loading = useSelector(selectClientsLoading);
  const hasMore = useSelector(selectHasMore);
  const error = useSelector(selectError);
  const { appCompany } = useSelector(selectAppCompanyAndUser);

  const onEndReached = () => {
    if (loading || !hasMore) return;
    dispatch(fetchClients());
  };

  useEffect(() => {
    if (appCompany) dispatch(fetchClients());
  }, [appCompany, dispatch]);

  return (
    <SectionedClientsList
      clients={clients}
      loading={loading}
      error={error}
      onEndReached={onEndReached}
      ListEmptyComponent={<EmptyClients />}
    />
  );
};

export default ClientsList;