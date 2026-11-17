interface CompanyServicesProps {
  services: string[];
}

export function CompanyServices({ services }: CompanyServicesProps) {
  return (
    <section className="company-panel services">
      <h2 className="company-panel__title">Services proposés</h2>
      <ul className="software__list">
        {services.map((service) => (
          <li key={service} className="software__chip">
            {service}
          </li>
        ))}
      </ul>
    </section>
  );
}
