const CONST = {
  INDENT: "  ",
  ARRAY_MAX_DEPTH: 100,
  INTERFACE_NAME: "data",
  USE_NEWLINE: true
};
Prism.hooks.add("before-highlight", function(env) {
  env.code = env.element.innerText;
});
const inputIndent = document.querySelector("#indent");
const inputInterName = document.querySelector("#name");
const inputNewLines = document.querySelector("#newline");
inputIndent.addEventListener("input", (ev) => {
  CONST.INDENT = " ".repeat(+inputIndent.value);
  parse(jsonArea.value);
});
inputInterName.addEventListener("input", (ev) => {
  CONST.INTERFACE_NAME = inputInterName.value;
  parse(jsonArea.value);
});
inputNewLines.addEventListener("input", (ev) => {
  CONST.USE_NEWLINE = inputNewLines.checked;
  parse(jsonArea.value);
});
const errorText = document.querySelector("#error");
const jsonArea = document.querySelector("#json");
const typescriptArea = document.querySelector("#typescript");
const button = document.querySelector("#btn");
jsonArea.addEventListener("input", (ev) => {
  let parent = ev.target;
  let val = parent.value;
  parse(val);
});
function parse(text) {
  if (!text)
    return;
  try {
    let json = JSON.parse(text);
    const inter = getTypes(json).replaceAll('"', "");
    typescriptArea.innerText = `interface ${CONST.INTERFACE_NAME || "data"} ${inter};`;
    errorText.innerText = "";
    jsonArea.classList.remove("invalid");
    jsonArea.classList.add("valid");
    Prism.highlightElement(typescriptArea);
  } catch (error) {
    const prettyError = {
      line: / line [\d]+ /.exec(error)[0].replace("line", "").trim(),
      column: / column [\d]+ /.exec(error)[0].replace("column", "").trim()
    };
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
function getTypes(obj, level) {
  if (!level)
    level = 1;
  let inter = "{";
  let keys = Object.keys(obj);
  keys.forEach((key) => {
    let type = typeof obj[key];
    inter += (CONST.USE_NEWLINE ? "\n" : "") + CONST.INDENT.repeat(level) + key + ": ";
    if (Array.isArray(obj[key])) {
      inter += arrTypes(obj[key], level + 1) + ";";
    } else if (type == "object") {
      inter += getTypes(obj[key], level + 1) + ";";
    } else
      inter += type + ";";
  });
  return inter + (CONST.USE_NEWLINE ? "\n" : "") + CONST.INDENT.repeat(level - 1) + "}";
}
function arrTypes(arr, level) {
  if (CONST.ARRAY_MAX_DEPTH <= 0)
    return "Array<any>";
  const types = [];
  let iterations;
  if (CONST.ARRAY_MAX_DEPTH >= arr.length)
    iterations = arr.length;
  else
    iterations = CONST.ARRAY_MAX_DEPTH;
  for (let i = 0; i < iterations; i++) {
    const type = typeof arr[i];
    let curr;
    if (Array.isArray(arr[i]))
      curr = arrTypes(arr[i], level + 1);
    else if (arr[i] === null)
      curr = "null";
    else if (type === "object")
      curr = getTypes(arr[i], level + 1);
    else
      curr = type;
    if (types.indexOf(curr) === -1)
      types.push(curr);
  }
  if (types.length === 1)
    return `${types || "any"}[]`.replaceAll(";", ",");
  else
    return `[${types || "any"}]`.replaceAll(";", ",");
}
