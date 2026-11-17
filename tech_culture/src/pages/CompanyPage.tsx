import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { CompanyHeader } from "../components/CompanyHeader";
import { CompanyLeaders } from "../components/CompanyLeaders";
import { CompanyServices } from "../components/CompanyServices";
import { CompanySoftwareList } from "../components/CompanySoftwareList";
import { RevenueBreakdown } from "../components/RevenueBreakdown";
import { Timeline } from "../components/Timeline";
import { useCompanies } from "../hooks/useCompanies";

export function CompanyPage() {
  const { id = "" } = useParams<{ id: string }>();
  const { getCompany, getEvents } = useCompanies();

  const company = getCompany(id);
  const events = useMemo(() => getEvents(id), [getEvents, id]);

  if (!company) {
    return (
      <>
        <p>Entreprise introuvable.</p>
        <Link to="/">Retour à l'accueil</Link>
      </>
    );
  }

  return (
    <>
      <div className="company-brand">
        <Link className="back-button" to="/">
          <ArrowLeft size={18} aria-hidden="true" />
          Retour
        </Link>
        <h1 className="company-brand__name">
          {company.logo ? (
            <img
              className="company-brand__logo"
              src={company.logo}
              alt={company.nom}
            />
          ) : (
            company.nom
          )}
        </h1>
      </div>
      {company.banniere && (
        <img className="company-banner" src={company.banniere} alt="" />
      )}
      <CompanyHeader company={company} />
      <div className="company-panels">
        <CompanyLeaders leaders={company.dirigeants} />
        <RevenueBreakdown company={company} />
      </div>
      <CompanyServices services={company.services} />
      <CompanySoftwareList software={company.logiciels} />
      <h2>Frise chronologique</h2>
      <Timeline events={events} />
    </>
  );
}
