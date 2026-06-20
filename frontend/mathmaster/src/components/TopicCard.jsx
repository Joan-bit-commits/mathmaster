import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardFooter } from 'shadcn-ui';

function TopicCard({ topic }) {
  return (
    <Card className="bg-white shadow-md">
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
    </Card>
  );
}

export default TopicCard;