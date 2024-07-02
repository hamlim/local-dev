import { GlobeIcon } from "~/components/icons";

export default function Component() {
  return (
    <div className="flex flex-col p-6">
      <div className="mt-6 flex-1 overflow-auto">
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <GlobeIcon className="h-12 w-12 text-muted-foreground" />
          <div className="text-center text-muted-foreground">
            <h3 className="text-lg font-semibold">No Domain Selected</h3>
            <p>Select a domain from the list to view and edit its details.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
