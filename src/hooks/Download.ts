import saveAs from "file-saver";

export const download = (jsx: string, ISConverted: boolean): void => {
  if (ISConverted) {
    const fileName = "Component.jsx";

    const blob = new Blob([jsx], { type: "text/plain;charset=utf-8" });
    saveAs(blob, fileName);
  }
};
