import { PublicInfoPage } from "@/components/public-info-page";
export default function Page(){return <PublicInfoPage eyebrow="Help Center" title="Frequently Asked Questions" description="Answers to common candidate and employer questions." sections={[
{title:"Is candidate registration free?",description:"Yes. Candidates can register, complete their profile, search jobs and track applications."},
{title:"How do employers submit requirements?",description:"Create a client account and use the Requirements module, or contact our team."},
{title:"How is application status updated?",description:"Authorized recruiters update ATS stages and every change is stored in status history."},
{title:"Are documents secure?",description:"Document records use controlled access and verification status. Production storage credentials can be connected separately."},
{title:"Does the system send email?",description:"Yes. Resend and SendGrid-ready mail integration is available through environment configuration."},
{title:"Do you handle overseas hiring?",description:"Yes. The overseas pipeline covers selection, documents, medical, visa, ticket, travel and joining."}
]} />}
