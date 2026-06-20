import { Card, CardHeader, CardBody, CardFooter } from 'shadcn-ui';

function ProgressCard({ title, progress, description }) {
  return (
    <Card className="bg-gray-50">
      <CardHeader>
        <h2 className="text-xl font-semibold">{title}</h2>
      </CardHeader>
      <CardBody>
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold">{progress}%</h3>
          <div className="flex items-center">
            <span className="mr-2">Completed</span>
            <svg
              className="w-6 h-6 text-green-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414 1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <p className="mt-2">{description}</p>
      </CardBody>
      <CardFooter>
        <button className="bg-blue-500 text-white py-2 px-4 rounded">
          View Details
        </button>
      </CardFooter>
    </Card>
  );
}

export default ProgressCard;