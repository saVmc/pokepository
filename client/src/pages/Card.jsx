import { useParams } from "react-router-dom";

import CardStats from "../components/other/CardStats";

export default function Card() {
  const { id } = useParams();

  return (
    <main className="page">
      <CardStats id={id} />
    </main>
  );
}
