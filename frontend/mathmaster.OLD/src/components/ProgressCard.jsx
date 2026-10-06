import { Button, Card, CardBody, CardFooter, CardHeader, ProgressBar } from './ui';

function ProgressCard({ title, progress, description }) {
  return (
    <Card>
      <CardHeader className="border-transparent">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Progress</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-950">{title}</h2>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-4xl font-semibold tracking-tight text-slate-950">{progress}%</p>
            <p className="mt-1 text-sm text-slate-500">Completed</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
            On track
          </div>
        </div>
        <ProgressBar value={progress} />
        <p className="text-sm leading-6 text-slate-600">{description}</p>
      </CardBody>
      <CardFooter className="border-transparent pt-0">
        <Button variant="secondary" size="sm">
          View details
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ProgressCard;