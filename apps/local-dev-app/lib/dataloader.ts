import type { Domain } from "../types";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { redirect } from "next/navigation";

async function loadDomainsImpl(): Promise<Array<Domain>> {
  let domainsRes = await fetch("http://dashboard.localdev/api/list");
  let domains = await domainsRes.json();
  return domains;
}

export let loadDomains = unstable_cache(loadDomainsImpl, ["domains"], {
  tags: ["domains"],
});

async function loadDomainImpl(domainID: number): Promise<Domain | undefined> {
  let domains = await loadDomains();
  return domains.find((domain) => domain.id === domainID);
}

export let loadDomain = unstable_cache(loadDomainImpl, ["domain"], {
  tags: ["domain"],
});

export async function updateDomain(
  domainID: number,
  data: Partial<Domain>,
): Promise<void> {
  await fetch("http://dashboard.localdev/api/update", {
    method: "POST",
    body: JSON.stringify({
      id: domainID,
      ...data,
    }),
  });

  revalidateTag("domains");
  revalidatePath(`/${domainID}`);
}

export async function createDomain(data: Omit<Domain, "id">): Promise<void> {
  await fetch("http://dashboard.localdev/api/add", {
    method: "POST",
    body: JSON.stringify(data),
  });

  revalidatePath("/");
  revalidateTag("domains");
  redirect("/");
}
