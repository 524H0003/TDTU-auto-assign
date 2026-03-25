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
  extendFields(formData) {
    const plan = "306105:28;306106:35;D01201:05";

    const target = new URL(window.location.href).searchParams.get("go");

    if (target == "dkmhdkdd2") {
      formData.append("__LASTFOCUS", "");
      formData.append("__EVENTARGUMENT", "");
      return;
    }

    const items = plan.split(";");

    items.forEach((item) => {
      const [maMon, nhom] = item.split(":");

      if (maMon && nhom) {
        const xpath = /* tx */ `
          //tr[contains(., '${maMon}') and contains(.,
          '${nhom}')]//input[@type='checkbox']
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
          formData.append(name, "on");
        } else {
          console.warn(
            `Không tìm thấy checkbox cho Môn: ${maMon}, Nhóm: ${nhom}`,
          );
        }
      }
    });
  },
});
