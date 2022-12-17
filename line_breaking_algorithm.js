let UNICODE_15_CLASSES;
let UNICODE_15_WITH_L2_22_080R2_CLASSES;

onmessage = (e) => {
  let text;
  [text, UNICODE_15_CLASSES, UNICODE_15_WITH_L2_22_080R2_CLASSES, proposal] = e.data;
  let unicode_15_breaker = new LineBreaker(text);
  unicode_15_breaker.resolve_with_unicode_15();
  let proposed_breaker = new LineBreaker(text);
  if (proposal == "L2/22-280R2") {
    proposed_breaker.resolve_with_unicode_15_plus_l2_22_080r2();
  } else if (proposal == "quotes") {
    proposed_breaker.resolve_with_unicode_15_plus_quotes();
  }
  let unicode15 = "<span class='nobreak'>";
  unicode15 += break_to_html(
    unicode_15_breaker.resolved_breaks[0],
    unicode_15_breaker.resolved_breaks[0] === proposed_breaker.resolved_breaks[0]);
  for (let i = 0; i < unicode_15_breaker.original_code_points.length; ++i) {
    unicode15 += to_html(unicode_15_breaker.original_code_points[i]);
    unicode15 += break_to_html(
      unicode_15_breaker.resolved_breaks[i + 1],
      unicode_15_breaker.resolved_breaks[i + 1] === proposed_breaker.resolved_breaks[i + 1]);
  }
  unicode15 += "</span>";
  let proposed = "<span class='nobreak'>";
  proposed += break_to_html(
    proposed_breaker.resolved_breaks[0],
    unicode_15_breaker.resolved_breaks[0] === proposed_breaker.resolved_breaks[0]);
  for (let i = 0; i < proposed_breaker.original_code_points.length; ++i) {
    proposed += to_html(proposed_breaker.original_code_points[i]);
    proposed += break_to_html(
      proposed_breaker.resolved_breaks[i + 1],
      unicode_15_breaker.resolved_breaks[i + 1] === proposed_breaker.resolved_breaks[i + 1]);
  }
  proposed += "</span>";
  let msg = "";
  if (proposed_breaker.resolved_breaks.every((b, i) => b === unicode_15_breaker.resolved_breaks[i])) {
    msg = "The resolved breaks are identical.<br>"
  }
  postMessage([unicode15, proposed, msg + unicode_15_breaker.errors + proposed_breaker.errors]);
}

function break_to_html(type, same) {
  changed = same ? "unchanged" : "changed";
  if (type == "!") {
    return `</span><span class='mandatory ${changed}'><br></span><span class='nobreak'>`;
  } else if (type == "÷") {
    return `</span><span class='allowed ${changed}'><wbr></span><span class='nobreak'>`;
  } else if (type == "×") {
    return "";
  } else {
    alert(`unknown break type ${type}`);
  }
}

function to_html(c) {
  if (c === " ") {
    return "&nbsp;";
  } else if (c === "\t") {
    return "&#9;";
  } else if (c === "\r") {
    return "";
  } else if (c === "\n") {
    return "";
  } else if (c === "<") {
    return "&lt;";
  } else if (c === ">") {
    return "&gt;";
  } else if (c === "&") {
    return "&amp;";
  } else {
    return c;
  }
}

const SPECIALS_MAPPINGS = [["sot", "^"], ["eot", "$"], ["ALL", "."]]

class LineBreaker {
  constructor(s) {
    this.errors = "";
    this.original_code_points = Array.from(s);
    this.remapped_code_points = Array.from(this.original_code_points);
    this.resolved_breaks = new Array(this.remapped_code_points.length + 1);
    this.classes = new Map()
  }

  resolve_with_unicode_15() {
    this.classes = new Map(SPECIALS_MAPPINGS.concat(UNICODE_15_CLASSES));
    // LB1 defaults rephrased as remap rules.
    this.remap("(AI|SG|XX)", "a");
    this.remap("[SA&[\p{Mn}\p{Mc}]]", "\u{0300}");
    this.remap("[SA-[\p{Mn}\p{Mc}]]", "a");
    this.remap("CJ", "៖");

    this.regex_break("sot ÷");
    this.regex_break("! eot");
    this.regex_break("BK !");
    this.regex_break("CR × LF");
    this.regex_break("CR !");
    this.regex_break("LF !");
    this.regex_break("NL !");
    this.regex_break("× ( BK | CR | LF | NL )");
    this.regex_break("× SP");
    this.regex_break("× ZW");
    this.regex_break("ZW SP* ÷");
    this.regex_break("ZWJ ×");
    this.remap("([^BK,CR,LF,NL,SP,ZW]) (CM | ZWJ)*", "$1");
    this.remap("CM", "a");
    this.regex_break("× WJ");
    this.regex_break("WJ ×");
    this.regex_break("GL ×");
    this.regex_break("[^SP,BA,HY] × GL");
    this.regex_break("× CL");
    this.regex_break("× CP");
    this.regex_break("× EX");
    this.regex_break("× IS");
    this.regex_break("× SY");
    this.regex_break("OP SP* ×");
    this.regex_break("QU SP* × OP");
    this.regex_break("(CL | CP) SP* × NS");
    this.regex_break("B2 SP* × B2");
    this.regex_break("SP ÷");
    this.regex_break("× QU");
    this.regex_break("QU ×");
    this.regex_break("÷ CB");
    this.regex_break("CB ÷");
    this.regex_break("× BA");
    this.regex_break("× HY");
    this.regex_break("× NS");
    this.regex_break("BB ×");
    this.regex_break("HL(HY | BA) ×");
    this.regex_break("SY × HL");
    this.regex_break("× IN");
    this.regex_break("(AL | HL) × NU");
    this.regex_break("NU × (AL | HL)");
    this.regex_break("PR × (ID | EB | EM)");
    this.regex_break("(ID | EB | EM) × PO");
    this.regex_break("(PR | PO) × (AL | HL)");
    this.regex_break("(AL | HL) × (PR | PO)");
    this.regex_break("CL × PO");
    this.regex_break("CP × PO");
    this.regex_break("CL × PR");
    this.regex_break("CP × PR");
    this.regex_break("NU × PO");
    this.regex_break("NU × PR");
    this.regex_break("PO × OP");
    this.regex_break("PO × NU");
    this.regex_break("PR × OP");
    this.regex_break("PR × NU");
    this.regex_break("HY × NU");
    this.regex_break("IS × NU");
    this.regex_break("NU × NU");
    this.regex_break("SY × NU");
    this.regex_break("JL × (JL | JV | H2 | H3)");
    this.regex_break("(JV | H2) × (JV | JT)");
    this.regex_break("(JT | H3) × JT");
    this.regex_break("(JL | JV | JT | H2 | H3) × PO");
    this.regex_break("PR × (JL | JV | JT | H2 | H3)");
    this.regex_break("(AL | HL) × (AL | HL)");
    this.regex_break("IS × (AL | HL)");
    this.regex_break("(AL | HL | NU) × [OP-[\p{ea=F}\p{ea=W}\p{ea=H}]]");
    this.regex_break("[CP-[\p{ea=F}\p{ea=W}\p{ea=H}]] × (AL | HL | NU)");
    this.regex_break("sot(RI RI) * RI × RI");
    this.regex_break("[^RI](RI RI) * RI × RI");
    this.regex_break("EB × EM");
    this.regex_break("[\p{Extended_Pictographic}&\p{Cn}] × EM");
    this.regex_break("ALL ÷");
    this.regex_break("÷ ALL");
  }

  resolve_with_unicode_15_plus_l2_22_080r2() {
    this.classes = new Map(SPECIALS_MAPPINGS.concat(UNICODE_15_WITH_L2_22_080R2_CLASSES));
    // LB1 defaults rephrased as remap rules.
    this.remap("(AI|SG|XX)", "a");
    this.remap("[SA&[\p{Mn}\p{Mc}]]", "\u{0300}");
    this.remap("[SA-[\p{Mn}\p{Mc}]]", "a");
    this.remap("CJ", "៖");

    this.regex_break("sot ÷");
    this.regex_break("! eot");
    this.regex_break("BK !");
    this.regex_break("CR × LF");
    this.regex_break("CR !");
    this.regex_break("LF !");
    this.regex_break("NL !");
    this.regex_break("× ( BK | CR | LF | NL )");
    this.regex_break("× SP");
    this.regex_break("× ZW");
    this.regex_break("ZW SP* ÷");
    this.regex_break("ZWJ ×");
    this.remap("([^BK,CR,LF,NL,SP,ZW]) (CM | ZWJ)*", "$1");
    this.remap("CM", "a");
    this.regex_break("× WJ");
    this.regex_break("WJ ×");
    this.regex_break("GL ×");
    this.regex_break("[^SP,BA,HY] × GL");
    this.regex_break("× CL");
    this.regex_break("× CP");
    this.regex_break("× EX");
    this.regex_break("× IS");
    this.regex_break("× SY");
    this.regex_break("OP SP* ×");
    this.regex_break("QU SP* × OP");
    this.regex_break("(CL | CP) SP* × NS");
    this.regex_break("B2 SP* × B2");
    this.regex_break("SP ÷");
    this.regex_break("× QU");
    this.regex_break("QU ×");
    this.regex_break("÷ CB");
    this.regex_break("CB ÷");
    this.regex_break("× BA");
    this.regex_break("× HY");
    this.regex_break("× NS");
    this.regex_break("BB ×");
    this.regex_break("HL(HY | BA) ×");
    this.regex_break("SY × HL");
    this.regex_break("× IN");
    this.regex_break("(AL | HL) × NU");
    this.regex_break("NU × (AL | HL)");
    this.regex_break("PR × (ID | EB | EM)");
    this.regex_break("(ID | EB | EM) × PO");
    this.regex_break("(PR | PO) × (AL | HL)");
    this.regex_break("(AL | HL) × (PR | PO)");
    this.regex_break("CL × PO");
    this.regex_break("CP × PO");
    this.regex_break("CL × PR");
    this.regex_break("CP × PR");
    this.regex_break("NU × PO");
    this.regex_break("NU × PR");
    this.regex_break("PO × OP");
    this.regex_break("PO × NU");
    this.regex_break("PR × OP");
    this.regex_break("PR × NU");
    this.regex_break("HY × NU");
    this.regex_break("IS × NU");
    this.regex_break("NU × NU");
    this.regex_break("SY × NU");
    this.regex_break("JL × (JL | JV | H2 | H3)");
    this.regex_break("(JV | H2) × (JV | JT)");
    this.regex_break("(JT | H3) × JT");
    this.regex_break("(JL | JV | JT | H2 | H3) × PO");
    this.regex_break("PR × (JL | JV | JT | H2 | H3)");
    this.regex_break("(AL | HL) × (AL | HL)");

    // Rules from the proposal.
    this.regex_break("AP × (AK | AS)");
    this.regex_break("(AK | AS) × (VF | VI)");
    this.regex_break("(AK | AS) VI × AK");
    this.regex_break("(AK | AS) × (AK | AS) VF");

    this.regex_break("IS × (AL | HL)");
    this.regex_break("(AL | HL | NU) × [OP-[\p{ea=F}\p{ea=W}\p{ea=H}]]");
    this.regex_break("[CP-[\p{ea=F}\p{ea=W}\p{ea=H}]] × (AL | HL | NU)");
    this.regex_break("sot(RI RI) * RI × RI");
    this.regex_break("[^RI](RI RI) * RI × RI");
    this.regex_break("EB × EM");
    this.regex_break("[\p{Extended_Pictographic}&\p{Cn}] × EM");
    this.regex_break("ALL ÷");
    this.regex_break("÷ ALL");
  }

  resolve_with_unicode_15_plus_quotes() {
    this.classes = new Map(SPECIALS_MAPPINGS.concat(UNICODE_15_CLASSES));
    // LB1 defaults rephrased as remap rules.
    this.remap("(AI|SG|XX)", "a");
    this.remap("[SA&[\p{Mn}\p{Mc}]]", "\u{0300}");
    this.remap("[SA-[\p{Mn}\p{Mc}]]", "a");
    this.remap("CJ", "៖");

    this.regex_break("sot ÷");
    this.regex_break("! eot");
    this.regex_break("BK !");
    this.regex_break("CR × LF");
    this.regex_break("CR !");
    this.regex_break("LF !");
    this.regex_break("NL !");
    this.regex_break("× ( BK | CR | LF | NL )");
    this.regex_break("× SP");
    this.regex_break("× ZW");
    this.regex_break("ZW SP* ÷");
    this.regex_break("ZWJ ×");
    this.remap("([^BK,CR,LF,NL,SP,ZW]) (CM | ZWJ)*", "$1");
    this.remap("CM", "a");
    this.regex_break("× WJ");
    this.regex_break("WJ ×");
    this.regex_break("GL ×");
    this.regex_break("[^SP,BA,HY] × GL");
    this.regex_break("× CL");
    this.regex_break("× CP");
    this.regex_break("× EX");
    this.regex_break("× IS");
    this.regex_break("× SY");
    this.regex_break("OP SP* ×");
    this.regex_break("(sot | BK | CR | LF | NL | OP | QU | GL | SP) [:Pi:] SP* ×");
    this.regex_break("× [:Pf:] ( SP | GL | WJ | CL | QU | CP | EX | IS | SY | BK | CR | LF | NL | eot)");
    this.regex_break("(CL | CP) SP* × NS");
    this.regex_break("B2 SP* × B2");
    this.regex_break("SP ÷");
    this.regex_break("× QU");
    this.regex_break("QU ×");
    this.regex_break("÷ CB");
    this.regex_break("CB ÷");
    this.regex_break("× BA");
    this.regex_break("× HY");
    this.regex_break("× NS");
    this.regex_break("BB ×");
    this.regex_break("HL(HY | BA) ×");
    this.regex_break("SY × HL");
    this.regex_break("× IN");
    this.regex_break("(AL | HL) × NU");
    this.regex_break("NU × (AL | HL)");
    this.regex_break("PR × (ID | EB | EM)");
    this.regex_break("(ID | EB | EM) × PO");
    this.regex_break("(PR | PO) × (AL | HL)");
    this.regex_break("(AL | HL) × (PR | PO)");
    this.regex_break("CL × PO");
    this.regex_break("CP × PO");
    this.regex_break("CL × PR");
    this.regex_break("CP × PR");
    this.regex_break("NU × PO");
    this.regex_break("NU × PR");
    this.regex_break("PO × OP");
    this.regex_break("PO × NU");
    this.regex_break("PR × OP");
    this.regex_break("PR × NU");
    this.regex_break("HY × NU");
    this.regex_break("IS × NU");
    this.regex_break("NU × NU");
    this.regex_break("SY × NU");
    this.regex_break("JL × (JL | JV | H2 | H3)");
    this.regex_break("(JV | H2) × (JV | JT)");
    this.regex_break("(JT | H3) × JT");
    this.regex_break("(JL | JV | JT | H2 | H3) × PO");
    this.regex_break("PR × (JL | JV | JT | H2 | H3)");
    this.regex_break("(AL | HL) × (AL | HL)");
    this.regex_break("IS × (AL | HL)");
    this.regex_break("(AL | HL | NU) × [OP-[\p{ea=F}\p{ea=W}\p{ea=H}]]");
    this.regex_break("[CP-[\p{ea=F}\p{ea=W}\p{ea=H}]] × (AL | HL | NU)");
    this.regex_break("sot(RI RI) * RI × RI");
    this.regex_break("[^RI](RI RI) * RI × RI");
    this.regex_break("EB × EM");
    this.regex_break("[\p{Extended_Pictographic}&\p{Cn}] × EM");
    this.regex_break("ALL ÷");
    this.regex_break("÷ ALL");
  }

  convert_regex(regex) {
    const syntax = /([(|)*?+ ])/;
    let result = "";
    for (let element of regex.split(syntax)) {
      if (element.match(syntax) && element != " ") {
        result += element;
      } else if (element != "" && element != " ") {
        if (!this.classes.has(element)) {
          this.errors.innerHTML += `Undefined class ${element}<br>`;
        }
        result += this.classes.get(element);
      }
    }
    return result;
  }

  regex_break(rule) {
    const types = /([!×÷])/;
    let left_regex, type, right_regex;
    [left_regex, type, right_regex] = rule.split(types);
    left_regex = new RegExp(this.convert_regex(left_regex) + "$", "u");
    right_regex = new RegExp("^" + this.convert_regex(right_regex), "u");
    //console.log(left_regex, type, right_regex);
    let left = "";
    let right = this.remapped_code_points.join("");
    for (let i = 0; i < this.resolved_breaks.length; ++i) {
      if (!this.resolved_breaks[i]) {
        if (left.match(left_regex) && right.match(right_regex)) {
          //console.log(rule, ":", left, type, right);
          this.resolved_breaks[i] = type;
        } else {
          //console.log(left, "?", right);
        }
      }
      if (i < this.remapped_code_points.length) {
        left += this.remapped_code_points[i];
        right = right.slice(this.remapped_code_points[i].length);
      }
    }
  }

  remap(regex, replacement) {
    regex = new RegExp("^" + this.convert_regex(regex), "u");
    for (let i = 0; i < this.remapped_code_points.length; ++i) {
      if (this.remapped_code_points[i] === "") {
        continue;
      }
      let match = this.remapped_code_points.slice(i).join("").match(regex);
      if (match) {
        //console.log(match[0], ":::", this.remapped_code_points.join());
        this.remapped_code_points[i] = match[0].replace(regex, replacement);
        //console.log(this.remapped_code_points.join());
        for (let j = 1; j < Array.from(match[0]).length; ++j) {
          this.remapped_code_points[i + j] = "";
        }
        //console.log(this.remapped_code_points.join());
        for (let j = 1; j < Array.from(match[0]).length; ++j) {
          this.resolved_breaks[i + j] = "×";
        }
      }
    }
  }
}