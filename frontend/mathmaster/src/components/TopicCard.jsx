import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardFooter } from 'shadcn-ui';

function TopicCard({ topic }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 cursor-pointer">
      <CardHeader>
        <h2 className="text-lg font-semibold">{topic.name}</h2>
      </CardHeader>
      <CardBody>
        <p className="text-gray-700">{topic.description}</p>
      </CardBody>
      <CardFooter>
        <Link to={`/learning/topics/${topic.id}`} className="text-blue-500">
          View Details
        </Link>
      </CardFooter>
      <button className="bg-blue-500 text-white py-2 px-4 rounded mt-4"> Start Learning</button>
    </div>
  );
}

export default TopicCard;