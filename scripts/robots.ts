type Rule = { allow: boolean; pattern: string };
type Group = { agents: string[]; rules: Rule[]; delay: number };

export function robotsPolicy(text: string, path: string) {
  const groups: Group[] = [];
  let group: Group | undefined;
  let started = false;
  for (const line of text.split(/\r?\n/)) {
    const clean = line.split("#")[0].trim();
    const colon = clean.indexOf(":");
    if (colon < 0) continue;
    const key = clean.slice(0, colon).toLowerCase();
    const value = clean.slice(colon + 1).trim();
    if (key === "user-agent") {
      if (!group || started) {
        group = { agents: [], rules: [], delay: 0 };
        groups.push(group);
        started = false;
      }
      group.agents.push(value.toLowerCase());
    } else if (group) {
      started = true;
      if ((key === "allow" || key === "disallow") && value)
        group.rules.push({ allow: key === "allow", pattern: value });
      if (key === "crawl-delay" && Number.isFinite(Number(value)))
        group.delay = Math.max(group.delay, Number(value) * 1000);
    }
  }
  const agent = "atlastierralinkcheck";
  const specificity = (g: Group) =>
    Math.max(
      -1,
      ...g.agents.map((a) =>
        a === "*" ? 0 : agent.includes(a) ? a.length : -1,
      ),
    );
  const best = Math.max(-1, ...groups.map(specificity));
  const relevant = groups.filter((g) => specificity(g) === best && best >= 0);
  let allowed = true;
  let longest = -1;
  for (const rule of relevant.flatMap((g) => g.rules)) {
    const anchored = rule.pattern.endsWith("$");
    const raw = anchored ? rule.pattern.slice(0, -1) : rule.pattern;
    const pattern = raw
      .split("*")
      .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join(".*");
    const weight = raw.replaceAll("*", "").length;
    if (
      new RegExp("^" + pattern + (anchored ? "$" : "")).test(path) &&
      (weight > longest || (weight === longest && rule.allow))
    ) {
      longest = weight;
      allowed = rule.allow;
    }
  }
  return { allowed, delay: Math.max(1200, ...relevant.map((g) => g.delay)) };
}
