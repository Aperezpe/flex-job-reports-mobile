import { useLocalSearchParams } from "expo-router";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { selectClientDetailsLoading } from "../../redux/selectors/clientDetailsSelector";
import { fetchClientById } from "../../redux/actions/clientDetailsActions";
import LoadingComponent from "../../components/LoadingComponent";
import JobReportPage from "../../components/JobReportPage";

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
  }, []);

  if (clientDetailsLoading) return <LoadingComponent />;

  return (
    <JobReportPage
      jobReportId={jobReportId}
      viewOnly={viewOnly}
      systemId={parseInt(systemId)}
    />
  );
};

export default JobReportModal;
