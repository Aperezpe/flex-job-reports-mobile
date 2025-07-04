import { useLocalSearchParams } from "expo-router";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import {
  fetchClientById,
} from "../../../redux/actions/clientDetailsActions";
import { selectClientDetailsLoading } from "../../../redux/selectors/clientDetailsSelector";
import LoadingComponent from "../../../components/LoadingComponent";
import JobReport from "../../../components/JobReport";

const JobReportModal = () => {
  const params = useLocalSearchParams();
  const dispatch = useDispatch();
  const clientDetailsLoading = useSelector(selectClientDetailsLoading);

  const jobReportId = params.jobReportId as string;
  const clientId = params.clientId as string;
  const systemId = params.systemId as string;
  const viewOnly = (params.viewOnly as string) === "true";

  useEffect(() => {
    if (clientId) {
      dispatch(fetchClientById(Number.parseInt(clientId)));
    }
    return () => {
      // dispatch(resetClient()); // TODO: Check if even necessary?
    };
  }, []);

  if (clientDetailsLoading) return <LoadingComponent />;

  return (
    <JobReport
      jobReportId={jobReportId}
      viewOnly={viewOnly}
      systemId={parseInt(systemId)}
    />
  );
};

export default JobReportModal;
