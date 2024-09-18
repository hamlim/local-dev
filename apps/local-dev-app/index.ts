import { Database } from "bun:sqlite";
import type { Domain } from "./types";
import { parseDSL, updateHostsFile } from "./utils";

let db = new Database("./domains.db");

function comment(
  _str: TemplateStringsArray,
  ..._replacements: Array<unknown>
) {}

comment`
# Localdev:

## Hosts File Syntax

> [!danger]
> **Warning:** It's recommended to **not** manually add these entries to the hosts file. Instead, visit the [Localdev Dashboard](http://dashboard.localdev:80) to add or remove entries.

The hosts file syntax is as follows:

~~~shell
# localdev::<id>
# note: Some notes here
<ip>  <subdomain>.localdev # port:<port>
# localdev::<id>
# note: Notes...
# note: more lines here
<ip>  <another subdomain>.localdev # port:<port>
~~~
`;

type Logger = (...args: Array<unknown>) => void;

function noop() {}

function logger(...args: Array<unknown>): void {
  console.log(...args);
}

function createDebug(namespace: string): Logger {
  let shouldLog = false;
  let debug: string;
  try {
    debug = process.env.DEBUG || "";
  } catch {
    debug = "";
  }
  if (
    debug === namespace ||
    debug.startsWith(namespace) ||
    namespace.startsWith(debug) ||
    debug === "*"
  ) {
    shouldLog = true;
  }
  if (!shouldLog) {
    return noop;
  }
  return logger;
}

let initialHostsFile = await Bun.file(`/etc/hosts`).text();

try {
  db.query(`CREATE TABLE IF NOT EXISTS domains (
  id INTEGER PRIMARY KEY NOT NULL,
  domain TEXT NOT NULL,
  port INT NOT NULL,
  targetIP TEXT NOT NULL,
  note TEXT
);`).run();

  // Sync with hosts file
  let entries = parseDSL(initialHostsFile);
  let hasDashboardConfigured = false;
  if (entries.length) {
    // Is this really what we want to do?
    // Treats the hosts file as the source of truth which is good I guess
    db.query("delete from domains").run();
    let idx = 0;
    for (let entry of entries) {
      if (entry.domain === "dashboard.localdev") {
        hasDashboardConfigured = true;
      }
      db.query(
        "insert into domains (id, domain, port, targetIP, note) values ($id, $domain, $port, $targetIP, $note)",
      )
        // @ts-expect-error
        .run({
          $domain: entry.domain,
          $port: entry.port,
          $targetIP: entry.targetIP,
          $note: entry.note,
          $id: idx++,
        });
    }
  }
  if (!hasDashboardConfigured) {
    let dashboard = {
      note: `Localdev Dashboard - DO NOT REMOVE!`,
      domain: "dashboard.localdev",
      port: 42069,
      targetIP: "127.0.0.1",
      id: 0,
    };
    db.query(
      "insert into domains (id, domain, port, targetIP, note) values ($id, $domain, $port, $targetIP, $note)",
    ).run({
      $domain: dashboard.domain,
      $port: dashboard.port,
      $targetIP: dashboard.targetIP,
      $note: dashboard.note,
      $id: dashboard.id,
    });
    await Bun.write(
      `/etc/hosts`,
      `${initialHostsFile}\n# localdev::<${dashboard.id}>\n# note: ${dashboard.note}\n${dashboard.targetIP} ${dashboard.domain} # port:${dashboard.port}`,
    );
  }
} catch (e) {
  console.log(e);
}

console.log(`Server running at http://dashboard.localdev`);
let cmd = ["bun", "run", "start-dashboard"];
if (process.env.NODE_ENV === "development") {
  cmd = ["bun", "next", "dev", "--port", "42069"];
}

let dashboardProc = Bun.spawn({ cmd });

let debug = createDebug("localdev");

let server = Bun.serve({
  port: 80,
  async fetch(request) {
    let host = request.headers.get("host") || "";

    let configuredDomains = db
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      .query<Domain, any>("select * from domains")
      .all();

    let matchingDomain = configuredDomains.find((d) => host.includes(d.domain));

    if (
      matchingDomain &&
      matchingDomain.domain !== "dashboard.localdev" &&
      request.headers.get("x-redirected") !== "true"
    ) {
      let url = new URL(request.url);
      url.port = matchingDomain.port.toString();
      debug(`Redirecting to ${url}`);

      let resp = await fetch(url.toString(), request);
      // copy the response headers over
      let headers = new Headers(resp.headers);
      headers.delete("content-encoding");
      headers.delete("content-length");
      return new Response(resp.body, {
        headers,
        status: resp.status,
        statusText: resp.statusText,
      });
    }

    let path = new URL(request.url).pathname;
    let method = request.method;
    debug(`Request: ${method} ${path}`);

    switch (`${method} ${path}`) {
      case "POST /api/add": {
        let data = await request.json();
        if (
          !data.domain ||
          !data.port ||
          Number.isNaN(data.port) ||
          !data.targetIP
        ) {
          return new Response(
            `Invalid data:\n\n${JSON.stringify(data, null, 2)}`,
            {
              status: 500,
            },
          );
        }
        let currDomains = db.query("select * from domains").all();
        db.query(
          "insert into domains (id, domain, port, targetIP, note) values ($id, $domain, $port, $targetIP, $note)",
        ).get({
          $domain: data.domain,
          $targetIP: data.targetIP,
          $port: data.port,
          $note: data.note || "",
          $id: currDomains.length,
        });
        initialHostsFile += `\n# localdev::${currDomains.length}`;
        if (data.note) {
          let noteLines = data.note.split("\n");
          for (let line of noteLines) {
            initialHostsFile += `\n# note: ${line}`;
          }
        }
        initialHostsFile += `\n${data.targetIP}  ${data.domain}.localdev # port:${data.port}`;
        Bun.write(`/etc/hosts`, initialHostsFile);
        return new Response(`Added ${data.domain}`);
      }
      case "POST /api/update": {
        let data = await request.json();
        if (!data.id) {
          return new Response(
            `Invalid data:\n\n${JSON.stringify(data, null, 2)}`,
            {
              status: 500,
            },
          );
        }
        let existing = db
          .query("select * from domains where id = $id")
          .get({ $id: data.id }) as unknown as Domain | undefined;
        if (!existing) {
          return new Response(`Domain with ID ${data.id} not found!`, {
            status: 404,
          });
        }
        db.query(
          "update domains set domain = $domain, port = $port, targetIP = $targetIP, note = $note where id = $id",
        ).run({
          $id: data.id,
          $domain: data.domain || existing.domain,
          $port: data.port ? Number(data.port) : existing.port,
          $targetIP: data.targetIP || existing.targetIP,
          $note: data.note || existing.note,
        });

        let updatedHostFile = updateHostsFile(initialHostsFile, data, existing);

        Bun.write(`/etc/hosts`, updatedHostFile);
        return new Response(`Updated ${data.domain}`);
      }
      case "GET /api/reset": {
        db.query("delete from domains").run();
        server.stop(true);
        dashboardProc.kill();
        return new Response(`Reset complete!`);
      }
      case "GET /api/list": {
        let res = db.query("select * from domains").all();
        return new Response(JSON.stringify(res, null, 2));
      }
      default: {
        if (matchingDomain && matchingDomain.domain === "dashboard.localdev") {
          debug(`Redirecting to dashboard (http://127.0.0.1:42069)`);
          request.headers.append("x-redirected", "true");
          let targetURL = new URL(request.url);
          targetURL.protocol = "http";
          targetURL.host = "127.0.0.1";
          targetURL.port = "42069";
          let resp = await fetch(targetURL, request);
          // copy the response headers over
          let headers = new Headers(resp.headers);
          headers.delete("content-encoding");
          headers.delete("content-length");
          return new Response(resp.body, {
            headers,
            status: resp.status,
            statusText: resp.statusText,
          });
        }
        return new Response(`Failed to route to requested host!`, {
          status: 500,
        });
      }
    }
  },
});
