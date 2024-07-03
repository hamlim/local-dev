import { CheckIcon } from "~/components/icons";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { createDomain } from "~/lib/dataloader";

export default async function NewDomain() {
  async function newDomainAction(formData: FormData) {
    "use server";

    await createDomain({
      domain: formData.get("domain") as string,
      targetIP: formData.get("targetIP") as string,
      port: Number(formData.get("port") as string),
      note: formData.get("note") as string,
    });
  }

  return (
    <div className="flex flex-col p-6">
      <form action={newDomainAction}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">New Domain</h2>
          <div className="flex items-center gap-2">
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
              <Input id="domain" name="domain" type="text" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="targetIP">Target Port</Label>
              <Input id="targetIP" name="targetIP" type="string" defaultValue="127.0.0.1" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="port">Target Port</Label>
              <Input id="port" name="port" type="number" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="note">Notes</Label>
              <Textarea id="note" name="note" rows={4} />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
