import { unstable_noStore } from "next/cache";
import { notFound } from "next/navigation";
import { CheckIcon, TrashIcon } from "~/components/icons";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { loadDomain, updateDomain } from "~/lib/dataloader";

export default async function EditDomain({
  params: { domainID },
}: { params: { domainID: string } }) {
  unstable_noStore();
  let domain = await loadDomain(Number(domainID));

  if (!domain) {
    notFound();
  }

  async function updateDomainAction(formData: FormData) {
    "use server";

    let domain = formData.get("domain") as string;
    let targetIP = formData.get("targetIP") as string;
    let port = Number(formData.get("port") as string);
    let note = formData.get("note") as string;

    await updateDomain(Number(domainID), { domain, port, note, targetIP });
  }

  return (
    <div className="flex flex-col p-6">
      <form action={updateDomainAction}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Domain Details</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <TrashIcon className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <Button size="sm">
              <CheckIcon className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
        <div className="mt-6 flex-1 overflow-auto">
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                name="domain"
                type="text"
                defaultValue={domain?.domain}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="targetIP">Target IP:</Label>
              <Input
                id="targetIP"
                name="targetIP"
                type="string"
                defaultValue={domain?.targetIP}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="port">Target Port</Label>
              <Input
                id="port"
                name="port"
                type="number"
                defaultValue={domain?.port}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="note"
                name="note"
                rows={4}
                defaultValue={domain.note}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
