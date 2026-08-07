import { PublicInfoPage } from "@/components/public-info-page";
export default function Page(){return <PublicInfoPage eyebrow="Legal" title="Terms & Conditions" description="Terms governing use of the OBE BILLA recruitment platform." cta={false} sections={[
{title:"Platform Use",description:"Users must provide accurate information and use the platform only for legitimate recruitment purposes."},
{title:"Candidate Responsibility",description:"Candidates are responsible for truthful profile, experience and document information."},
{title:"Employer Responsibility",description:"Employers must provide lawful, accurate job terms and protect candidate information."},
{title:"Recruitment Outcomes",description:"Job availability, selection and joining depend on employer decisions and candidate eligibility."},
{title:"Prohibited Conduct",description:"Unauthorized access, scraping, impersonation, fraud and misuse of personal data are prohibited."},
{title:"Changes",description:"Terms may be updated to reflect legal, operational or service changes."}
]} />}
