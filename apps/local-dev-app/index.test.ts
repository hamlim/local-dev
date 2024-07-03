import { expect, test } from "bun:test";
import { parseDSL } from "./index";

// Test case
test("parseDSL should correctly parse the input string", () => {
  const input = `
    # localdev::1
    # note: Some notes here
    192.168.1.1  sub1.localdev # port:8080
    # localdev::2
    # note: Notes...
    # note: more lines here
    192.168.1.2  sub2.localdev # port:9090
    `;

  const expectedOutput = [
    { id: 1, domain: "sub1.localdev", port: 8080, note: "Some notes here", targetIP: "192.168.1.1" },
    { id: 2, domain: "sub2.localdev", port: 9090, note: "Notes...\nmore lines here", targetIP: "192.168.1.2" },
  ];

  const result = parseDSL(input);
  expect(result).toEqual(expectedOutput);
});
