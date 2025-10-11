import CompetitorList from "./CompetitorList";
import { competitorsData } from "./data";

function Competitors() {
  const { data } = competitorsData;

  const { competition } = data;

  return <CompetitorList competitors={competition.competitors} competitionId={competition.id} />;
}

export default Competitors;
