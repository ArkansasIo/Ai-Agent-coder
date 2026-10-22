export type Modelfile = {
  from?: string;
  parameters: Map<string, string>;
  template?: string;
  system?: string;
  adapter?: string;
  license?: string;
  messages: Array<{ role: string; content: string }>;
  requires?: string[];
};

function tripleQuoted(lines: string[], start: number): { value: string; next: number } {
  const first = lines[start];
  const marker = first.indexOf('"""');
  if (marker < 0) throw new Error(`Invalid multiline directive at line ${start + 1}`);
  const tail = first.slice(marker + 3);
  if (tail.includes('"""')) return { value: tail.split('"""', 1)[0], next: start + 1 };
  const out = [tail];
  let i = start + 1;
  for (; i < lines.length; i++) {
    const end = lines[i].indexOf('"""');
    if (end >= 0) return { value: out.concat(lines[i].slice(0, end)).join("\n"), next: i + 1 };
    out.push(lines[i]);
  }
  throw new Error(`Unterminated multiline directive at line ${start + 1}`);
}

export function parseModelfile(text: string): Modelfile {
  const result: Modelfile = { parameters: new Map(), messages: [] };
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  for (let i = 0; i < lines.length;) {
    const raw = lines[i].trim();
    if (!raw || raw.startsWith("#")) { i++; continue; }
    const match = raw.match(/^(FROM|PARAMETER|TEMPLATE|SYSTEM|ADAPTER|LICENSE|MESSAGE|REQUIRES)\b\s*(.*)$/i);
    if (!match) throw new Error(`Unknown directive at line ${i + 1}: ${raw}`);
    const directive = match[1].toUpperCase();
    const arg = match[2].trim();
    if (["TEMPLATE", "SYSTEM", "LICENSE"].includes(directive) && arg.startsWith('"""')) {
      const block = tripleQuoted(lines, i);
      if (directive === "TEMPLATE") result.template = block.value;
      else if (directive === "SYSTEM") result.system = block.value;
      else result.license = block.value;
      i = block.next;
      continue;
    }
    switch (directive) {
      case "FROM": result.from = arg; break;
      case "PARAMETER": {
        const p = arg.match(/^(\S+)\s+(.+)$/);
        if (!p) throw new Error(`Invalid PARAMETER at line ${i + 1}`);
        result.parameters.set(p[1], p[2]);
        break;
      }
      case "TEMPLATE": result.template = arg; break;
      case "SYSTEM": result.system = arg; break;
      case "ADAPTER": result.adapter = arg; break;
      case "LICENSE": result.license = arg; break;
      case "REQUIRES": result.requires = arg.split(/\s+/).filter(Boolean); break;
      case "MESSAGE": {
        const m = arg.match(/^(system|user|assistant|tool)\s+(.+)$/i);
        if (!m) throw new Error(`Invalid MESSAGE at line ${i + 1}`);
        result.messages.push({ role: m[1].toLowerCase(), content: m[2] });
        break;
      }
    }
    i++;
  }
  if (!result.from) throw new Error("Modelfile requires FROM");
  return result;
}
