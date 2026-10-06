import { Link } from 'react-router-dom';
import { Badge, Button, Card, CardBody, CardFooter, CardHeader } from './ui';

function TopicCard({ topic }) {
  return (
    <Card className="group overflow-hidden transition-transform duration-300 hover:-translate-y-1">
      <CardHeader className="flex items-center justify-between gap-3 border-transparent">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Topic</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">{topic.name}</h2>
        </div>
        <Badge tone="indigo">Start here</Badge>
      </CardHeader>
      <CardBody className="space-y-5">
        <p className="text-sm leading-6 text-slate-600">
          {topic.description || 'Learn the concepts, practice with quizzes, and track your progress.'}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to={`/topics/${topic.id}`}>
            <Button size="sm">Open topic</Button>
          </Link>
          <Link to={`/topics/${topic.id}/lessons`}>
            <Button variant="secondary" size="sm">
              View lessons
            </Button>
          </Link>
        </div>
      </CardBody>
      <CardFooter className="border-transparent pt-0 text-sm text-slate-500">
        Built for guided practice and quick review.
      </CardFooter>
    </Card>
  );
}

export default TopicCard;