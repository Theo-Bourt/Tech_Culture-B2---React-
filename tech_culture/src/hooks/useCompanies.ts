import companiesData from "../data/companies.json";
import eventsData from "../data/events.json";
import relationsData from "../data/relations.json";
import type { Company, CompanyRelation, TechEvent } from "../types";

const companies = companiesData as Company[];
const events = eventsData as TechEvent[];
const relations = relationsData as CompanyRelation[];

function getCompany(id: string): Company | undefined {
  return companies.find((company) => company.id === id);
}

function getEvents(companyId: string): TechEvent[] {
  return events.filter((event) => event.entrepriseId === companyId);
}

const api = { companies, relations, getCompany, getEvents };

export function useCompanies() {
  return api;
}

