import React, { useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import JobReportPage from "../clients/report/[systemId]";
import {
  fetchClientById,
  resetClient,
} from "../../../../redux/actions/clientDetailsActions";
import { useDispatch } from "react-redux";
import LoadingComponent from "../../../../components/LoadingComponent";
import { useSelector } from "react-redux";
import { selectJobReportHistoryLoading } from "../../../../redux/selectors/jobReportSelector";
import { selectClientDetailsLoading } from "../../../../redux/selectors/clientDetailsSelector";

const JobReportHistoryPage = () => {
  const params = useLocalSearchParams();
  const dispatch = useDispatch();
  const clientDetailsLoading = useSelector(selectClientDetailsLoading);
  const jobReportId = params.jobReportId as string;
  const clientId = params.clientId as string;
  const systemId = params.systemId as string;

  useEffect(() => {
    if (clientId) {
      dispatch(fetchClientById(Number.parseInt(clientId)));
    }
    return () => {
      dispatch(resetClient());
    };
  }, []);

  if (clientDetailsLoading) return <LoadingComponent />;

  return (
    <JobReportPage
      jobReportId={jobReportId}
      viewOnly={true}
      systemId={parseInt(systemId)}
    />
  );
};

export default JobReportHistoryPage;
