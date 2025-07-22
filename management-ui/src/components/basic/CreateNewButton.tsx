import "./CreateNewButton.css";

interface Props {
  onClick: () => void;
}

export default function CreateNewButton({ onClick }: Props) {
  return (
    <button className="create-new-button" onClick={onClick}>
      + Create New
    </button>
  );
}
