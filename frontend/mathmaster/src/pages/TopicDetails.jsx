import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import api from '../services/api';
import TopicDetails from './TopicDetails';
import { Card, CardHeader, CardBody, CardFooter } from 'shadcn-ui';

function App() {
  const [topics, setTopics] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/api/learning/topics');
        setTopics(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Learning Topics</h1>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topics.map((topic) => (
          <li key={topic.id}>
            <Link
              to={`/learning/topics/${topic.id}`}
              className="block bg-gray-100 p-4 rounded shadow"
            >
              <h2 className="text-lg font-semibold">{topic.name}</h2>
              <p className="text-gray-600">{topic.description}</p>
            </Link>
          </li>
        ))}
      </ul>
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Topic Details</h2>
        </CardHeader>
        <CardBody>
          <TopicDetails id={id} />
        </CardBody>
        <CardFooter>
          <Link to="/learning/topics" className="text-blue-500">
            Back to Topics
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default App;