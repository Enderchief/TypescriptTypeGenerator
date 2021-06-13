//  Constants
const CONST = {
  INDENT: "  ",
  ARRAY_MAX_DEPTH: 100,
  INTERFACE_NAME: "data",
  USE_NEWLINE: true,
};

// highlight
// @ts-ignore
Prism!.hooks.add(
  "before-highlight",
  function (env: { code: any; element: { innerText: any } }) {
    env.code = env.element.innerText;
  }
);

// Variables - DOM Elements
const inputIndent = document.querySelector("#indent")! as HTMLInputElement;
const inputInterName = document.querySelector("#name")! as HTMLInputElement;
const inputNewLines = document.querySelector("#newline")! as HTMLInputElement;

inputIndent.addEventListener("input", (ev: Event) => {
  CONST.INDENT = " ".repeat(+inputIndent.value);
  parse(jsonArea.value);
});
inputInterName.addEventListener("input", (ev: Event) => {
  CONST.INTERFACE_NAME = inputInterName.value;
  parse(jsonArea.value);
});
inputNewLines.addEventListener("input", (ev: Event) => {
  CONST.USE_NEWLINE = inputNewLines.checked;
  parse(jsonArea.value);
});

// DOM Elements
const errorText = document.querySelector("#error") as HTMLSpanElement;

const jsonArea = document.querySelector("#json")! as HTMLTextAreaElement;
const typescriptArea = document.querySelector(
  "#typescript"
)! as HTMLSpanElement;
const button = document.querySelector("#btn")! as HTMLButtonElement;

// Event Listener
jsonArea.addEventListener("input", (ev: Event) => {
  let parent = ev.target as HTMLTextAreaElement;
  let val = parent.value;
  //   console.log(val);
  parse(val);
});

// Functions
function parse(text: string) {
  if (!text) return;
  try {
    let json = JSON.parse(text);
    const inter: string = getTypes(json).replaceAll('"', "");
    typescriptArea.innerText = `interface ${
      CONST.INTERFACE_NAME || "data"
    } ${inter};`;
    errorText.innerText = "";
    jsonArea.classList.remove("invalid");
    jsonArea.classList.add("valid");
    // @ts-ignore
    Prism.highlightElement(typescriptArea);
  } catch (error: any) {
    const prettyError = { line: "", column: "" };
    try {
      prettyError.line = / line [\d]+ /
        .exec(error)![0]
        .replace("line", "")
        .trim();
      prettyError.column = / column [\d]+ /
        .exec(error)![0]
        .replace("column", "")
        .trim();
    } catch {}

    errorText.innerText = error + "\n";

    const tempArr = jsonArea.value.split("\n");
    const val = tempArr[+prettyError.line];

    let start = 0;
    for (let i = 0; i < +prettyError.line - 1; i++) {
      start += tempArr[i].length;
    }

    jsonArea.setSelectionRange(start, start + +prettyError.column);

    console.log(error);
    console.log(prettyError);
    console.log(val);
    console.log(start);

    jsonArea.classList.remove("valid");
    jsonArea.classList.add("invalid");
  }
}

function getTypes(obj: any, level?: number) {
  if (!level) level = 1;
  let inter: string = "{";
  let keys = Object.keys(obj);
  keys.forEach((key) => {
    let type = typeof obj[key];
    inter +=
      (CONST.USE_NEWLINE ? "\n" : "") +
      CONST.INDENT.repeat(level!) +
      key +
      ": ";

    if (Array.isArray(obj[key])) {
      inter += arrTypes(obj[key], level! + 1) + ";";
    } else if (obj[key] === null) {
      inter += "null;";
    } else if (type == "object") {
      inter += getTypes(obj[key], level! + 1) + ";";
    } else inter += type + ";";
  });
  return (
    inter +
    (CONST.USE_NEWLINE ? "\n" : "") +
    CONST.INDENT.repeat(level - 1) +
    "}"
  );
}

function arrTypes(arr: Array<any>, level: number) {
  if (CONST.ARRAY_MAX_DEPTH <= 0) return "Array<any>";

  const types: string[] = [];

  let iterations: number;
  if (CONST.ARRAY_MAX_DEPTH >= arr.length) iterations = arr.length;
  else iterations = CONST.ARRAY_MAX_DEPTH;

  for (let i = 0; i < iterations; i++) {
    const type = typeof arr[i];
    let curr;

    if (Array.isArray(arr[i])) curr = arrTypes(arr[i], level + 1);
    else if (arr[i] === null) curr = "null";
    else if (type === "object") curr = getTypes(arr[i], level + 1);
    else curr = type;

    if (types.indexOf(curr) === -1) types.push(curr);
  }

  if (types.length === 1) return `${types || "any"}[]`.replaceAll(";", ",");
  else return `[${types || "any"}]`.replaceAll(";", ",");
}
