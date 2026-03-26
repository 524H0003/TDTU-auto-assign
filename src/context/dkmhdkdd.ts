import { execute } from ".";

execute({
  url() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("Token");
    const reqId = urlParams.get("RequestId");
    const go = urlParams.get("go");

    // eslint-disable-next-line max-len
    return `https://dkmh.tdtu.edu.vn/default.aspx?go=${go}&Token=${token}&RequestId=${reqId}`;
  },
  handleError() {
    const target = new URL(window.location.href).searchParams.get("go");

    if (target == "dkmhdkdd2") return;

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("Token");
    const reqId = urlParams.get("RequestId");

    // eslint-disable-next-line max-len
    window.location.href = `https://dkmh.tdtu.edu.vn/default.aspx?go=dkmhdkdd2&Token=${token}&RequestId=${reqId}`;
  },
  extendFields(formData, { plan }) {
    const target = new URL(window.location.href).searchParams.get("go");

    if (target == "dkmhdkdd2") {
      formData.append("__LASTFOCUS", "");
      formData.append("__EVENTARGUMENT", "");
      return;
    }

    let classes = [];

    plan
      .split(/\r?\n/g)
      .filter((line) => line.trim() !== "")
      .every((i) => {
        const items = i.split(";");

        let count = 0;

        items.forEach((item) => {
          const [maMon, nhom] = item.split(":");

          if (maMon && nhom) {
            const xpath = /* tx */ `
              //tr[td[2]//span[text()='${maMon}'] and
              td[5]//span[text()='${nhom}']]//input[@type='checkbox' and
              not(@disabled)]
            `;

            const checkbox = document.evaluate(
              xpath,
              document,
              null,
              XPathResult.FIRST_ORDERED_NODE_TYPE,
              null,
            ).singleNodeValue as HTMLInputElement;

            if (checkbox) {
              const name = checkbox.getAttribute("name");
              classes.push(name);
              count++;
            }
          }

          if (maMon) {
            const xpath = /* tx */ `
              //tr[td[2]//span[text()='${maMon}']]//input[@type='checkbox' and
              not(@disabled)]
            `;

            const checkbox = document.evaluate(
              xpath,
              document,
              null,
              XPathResult.FIRST_ORDERED_NODE_TYPE,
              null,
            ).singleNodeValue as HTMLInputElement;

            count += checkbox ? 0 : 1;
          }
        });

        if (items.length != count) {
          classes = [];
          return true;
        }

        return false;
      });

    classes.forEach((i) => formData.append(i, "on"));
  },
});
