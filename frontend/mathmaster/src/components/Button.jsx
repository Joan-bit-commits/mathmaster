import { Button } from 'shadcn-ui';

function MyButton({ label, onClick }) {
  return (
    <Button
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

export default MyButton;