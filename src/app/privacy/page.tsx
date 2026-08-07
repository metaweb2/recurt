import { PublicInfoPage } from "@/components/public-info-page";
export default function Page(){return <PublicInfoPage eyebrow="Legal" title="Privacy Policy" description="How OBE BILLA INTERNATIONAL handles recruitment and account information." cta={false} sections={[
{title:"Information We Collect",description:"Account, contact, employment, education, application and document metadata needed to provide recruitment services."},
{title:"How Information Is Used",description:"To match jobs, manage applications, communicate updates, verify documents, support placements and meet legal obligations."},
{title:"Access & Security",description:"Role-based access, secure sessions, audit logging and restricted document workflows protect information."},
{title:"Retention",description:"Records are retained according to recruitment, contractual, statutory and legitimate business requirements."},
{title:"Your Choices",description:"You may request profile correction, communication preference changes or account assistance through Contact Us."},
{title:"Contact",description:"Privacy questions can be sent to contact@obebilla.com."}
]} />}
