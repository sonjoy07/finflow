import { redirect } from 'next/navigation';

export default function WorkflowExecutionsPage() {
  redirect('/workflows?tab=executions');
}
