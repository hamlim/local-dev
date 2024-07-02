import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type Domain = {
  domainID: string;
  domain: string;
  port: number;
  notes?: string;
};

let domains: Array<Domain> = [
  {
    domainID: "123",
    domain: "foo-bar.local",
    port: 3000,
    notes: "This is a local development domain that proxies to port 3000.",
  },
  {
    domainID: "456",
    domain: "baz-qux.local",
    port: 3001,
  },
  {
    domainID: "789",
    domain: "qux-quux.local",
    port: 3002,
  },
];

export async function loadDomains(): Promise<Array<Domain>> {
  return domains;
}

export async function loadDomain(domainID: string): Promise<Domain | undefined> {
  return domains.find((domain) => domain.domainID === domainID);
}

export async function updateDomain(domainID: string, data: Partial<Domain>): Promise<void> {
  let domain = domains.find((domain) => domain.domainID === domainID);

  if (domain) {
    Object.assign(domain, data);
  }

  revalidatePath(`/${domainID}`);
}

export async function createDomain(data: Omit<Domain, "domainID">): Promise<void> {
  domains.push({ ...data, domainID: Math.random().toString(36).slice(2) });

  revalidatePath("/");
  redirect("/");
}
