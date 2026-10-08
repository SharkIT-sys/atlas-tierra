import { it, expect } from "vitest";
import { robotsPolicy } from "../scripts/robots";
it("respeta grupos con varios agentes, comodines y fin de ruta", () => {
  const rules = "User-agent: *\nUser-agent: OtherBot\nDisallow: /*.pdf$";
  expect(robotsPolicy(rules, "/doc/test.pdf").allowed).toBe(false);
  expect(robotsPolicy(rules, "/doc/test.pdf.html").allowed).toBe(true);
});
it("prioriza el agente específico y permite la regla más precisa", () => {
  const rules =
    "User-agent: *\nDisallow: /\nUser-agent: AtlasTierraLinkCheck\nDisallow: /private\nAllow: /private/public\nCrawl-delay: 4";
  expect(robotsPolicy(rules, "/private/x").allowed).toBe(false);
  expect(robotsPolicy(rules, "/private/public")).toEqual({
    allowed: true,
    delay: 4000,
  });
  expect(robotsPolicy(rules, "/index").allowed).toBe(true);
});
it("en empate prevalece Allow sin depender del orden", () => {
  expect(
    robotsPolicy("User-agent: *\nAllow: /x\nDisallow: /x", "/x").allowed,
  ).toBe(true);
});
