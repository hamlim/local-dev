import Link from "next/link";
import { ChevronRightIcon, GlobeIcon, PlusIcon } from "~/components/icons";
import { Button } from "~/components/ui/button";
import { loadDomains } from "~/lib/dataloader";
import { cn } from "~/lib/utils";

export default async function Sidebar({ params }: { params?: { domainID: string } }) {
  let domains = await loadDomains();

  return (
    <div className="flex flex-col border-r bg-muted/40 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Local Domains</h2>
        <Button asChild size="sm">
          <Link href="/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            New Rule
          </Link>
        </Button>
      </div>
      <div className="mt-6 flex-1 overflow-auto">
        <ul className="grid gap-2">
          {domains.map(({ domainID, domain, port }) => (
            <li key={domainID}>
              <Button
                variant="outline"
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-4 py-2 text-left hover:bg-muted",
                  params?.domainID === domainID && "border-primary border-2",
                )}
                asChild
              >
                <Link href={`/${domainID}`}>
                  <div className="flex items-center gap-2">
                    <GlobeIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{domain}</div>
                      <div className="text-xs text-muted-foreground">Proxies to :{port}</div>
                    </div>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
