import { redirect } from 'next/navigation';

export default function OnboardCustomerRedirect() {
  redirect('/collector/customers?add=1');
}
