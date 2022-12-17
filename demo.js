
const worker = new Worker('line_breaking_algorithm.js?20221217T0315');

worker.onmessage = (e) => {
  [unicode15, proposed, errors] = e.data;
  document.getElementById("unicode15").innerHTML = unicode15;
  document.getElementById("proposed").innerHTML = proposed;
  document.getElementById("errors").innerHTML = errors;
}

let proposal = "L2/22-280R2";

window.onload = (e) => {
  params = (new URL(document.location)).searchParams;
  if (params.has("text")) {
    document.getElementById("text").value = params.get("text");
  }
  if (params.has("proposal")) {
    proposal = params.get("proposal");
  }
  worker.postMessage(
    [document.getElementById("text").value,
      UNICODE_15_CLASSES,
      UNICODE_15_WITH_L2_22_080R2_CLASSES,
      proposal]);

  document.getElementById("text").oninput = (e) => {
    worker.postMessage(
      [e.target.value,
        UNICODE_15_CLASSES,
        UNICODE_15_WITH_L2_22_080R2_CLASSES,
        proposal]);
  }
}