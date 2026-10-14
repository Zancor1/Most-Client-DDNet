let e="";async function n(){return e===""&&(e=$fetch("/api/version",{parseResponse:r=>JSON.parse(r)})),e}export{n as g};
