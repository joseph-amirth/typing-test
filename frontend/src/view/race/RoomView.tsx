import { useParams } from "react-router-dom";

function RoomView() {
  const { room } = useParams();

  return <div className="RoomView">{room}</div>;
}

export default RoomView;
