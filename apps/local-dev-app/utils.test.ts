import { expect, test } from "bun:test";
import { parseDSL, updateHostsFile } from "./utils";

// Test case
// test("parseDSL should correctly parse the input string", () => {
//   const input = `
//     # localdev::1
//     # note: Some notes here
//     192.168.1.1  sub1.localdev # port:8080
//     # localdev::2
//     # note: Notes...
//     # note: more lines here
//     192.168.1.2  sub2.localdev # port:9090
//     `;

//   const expectedOutput = [
//     { id: 1, domain: "sub1.localdev", port: 8080, note: "Some notes here", targetIP: "192.168.1.1" },
//     { id: 2, domain: "sub2.localdev", port: 9090, note: "Notes...\nmore lines here", targetIP: "192.168.1.2" },
//   ];

//   const result = parseDSL(input);
//   expect(result).toEqual(expectedOutput);
// });

test("updateHostsFile should correctly update the hosts file", () => {
  const input = `
    # localdev::1
    # note: Some notes here
    192.168.1.1  sub1.localdev # port:8080
    # localdev::2
    # note: Notes...
    # note: more lines here
    192.168.1.2  sub2.localdev # port:9090
    `;

  let existing = parseDSL(input)[0];

  let updates = {
    id: 1,
    port: 8888,
  };

  let result = updateHostsFile(input, updates, existing);

  expect(parseDSL(result)).toEqual([
    {
      id: 2,
      domain: "sub2.localdev",
      port: 9090,
      note: "Notes...\nmore lines here",
      targetIP: "192.168.1.2",
    },
    {
      id: 1,
      domain: "sub1.localdev",
      port: 8888,
      note: "Some notes here",
      targetIP: "192.168.1.1",
    },
  ]);
});

test("updateHostsFile should correctly update the hosts file", () => {
  const input = `
    # localdev::1
    # note: Some notes here
    192.168.1.1  sub1.localdev # port:8080
    # localdev::2
    # note: Notes...
    # note: more lines here
    192.168.1.2  sub2.localdev # port:9090
    `;

  let existing = parseDSL(input)[0];

  let updates = {
    id: 1,
    port: 8888,
    note: "Some\nnotes\nhere\n",
    domain: "newsub1.localdev",
  };

  let result = updateHostsFile(input, updates, existing);

  expect(parseDSL(result)).toEqual([
    {
      id: 2,
      domain: "sub2.localdev",
      port: 9090,
      note: "Notes...\nmore lines here",
      targetIP: "192.168.1.2",
    },
    {
      id: 1,
      domain: "newsub1.localdev",
      port: 8888,
      note: "Some\nnotes\nhere\n",
      targetIP: "192.168.1.1",
    },
  ]);
});
