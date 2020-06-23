import "../css/popup.css";
import { dumpDB } from "./database/database";

document.getElementById("doExport").addEventListener("click", downloadFile);

function downloadFile(){
  alert("Downloading File");
  dumpDB()
    .catch (err => {
        console.error ("DB | EXPORT ERROR" + err.stack);
        alert(("DB | EXPORT ERROR" + err.stack));
    });
}
