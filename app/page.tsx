import {redirect} from "next/navigation";

export default function Page() {
  redirect('/dashboard');
  return <div><p>Wrong page..</p></div>
}
