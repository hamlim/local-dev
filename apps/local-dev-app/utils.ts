import type { Domain } from "./types";

export function parseDSL(input: string): Array<Domain> {
  let lines = input.split("\n");
  let entries: Array<Domain> = [];
  let currentNote = "";
  let currentID = Number.NaN;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    if (line.startsWith("# localdev::")) {
      currentID = Number.parseInt(line.substring(12), 10);
    } else if (line.startsWith("# note:")) {
      if (currentNote.length > 0) {
        currentNote += "\n";
      }
      currentNote += line.substring(7).trim();
    } else if (line.includes(".localdev") && line.includes("# port:")) {
      let parts = line.split(" ").filter(Boolean);
      let ip = parts[0];
      let domainPart = parts[1];
      let portPart = parts[parts.length - 1];
      let portMatch = portPart.match(/port:(\d+)/);

      if (portMatch) {
        let domain = domainPart.trim();
        let port = Number.parseInt(portMatch[1], 10);
        let note = currentNote;

        entries.push({
          id: currentID,
          domain,
          port,
          note,
          targetIP: ip,
        });
        currentNote = ""; // Reset the note after it's used
        currentID = Number.NaN;
      }
    }
  }

  return entries;
}

type RequireProperty<T, K extends keyof T> = T & { [P in K]-?: T[K] };

export function updateHostsFile(
  initialHostsFile: string,
  updates: RequireProperty<Partial<Domain>, "id">,
  existing: Domain,
): string {
  let lines = initialHostsFile.split("\n");
  let updatedLines = [];
  let within = false;
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (line.includes(`# localdev::${updates.id}`)) {
      within = true;
      lines[i] = "";
      updatedLines.push(`# localdev::${updates.id}`);
      let note = updates.note || existing.note;
      if (note) {
        let noteLines = note.split("\n");
        for (let noteLine of noteLines) {
          updatedLines.push(`# note: ${noteLine}`);
        }
      }
      updatedLines.push(
        `${updates.targetIP || existing.targetIP}  ${
          updates.domain || existing.domain
        } # port:${updates.port || existing.port}`,
      );
    } else if (within && !line.includes("# localdev::")) {
      lines[i] = "";
    } else if (within && line.includes("# localdev::")) {
      within = false;
    }
  }

  lines = [...lines.filter(Boolean), ...updatedLines];

  return lines.join("\n");
}
