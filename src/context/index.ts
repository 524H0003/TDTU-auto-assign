import { LocalStorage } from "../types";

export interface IExecute {
  passwordField?: string;
  url: string | (() => string);
  handleError?: () => void;
  extendFields?: (
    formData: {
      append: (name: string, value: string) => void;
    },
    localStorage: LocalStorage,
  ) => void | Promise<void>;
}

export async function execute({
  passwordField = "ctl00$txtXacNhan",
  url,
  extendFields = () => {},
  handleError = () => {},
}: IExecute) {
  if (typeof window === "undefined") return;

  window.executeKit = async (data: LocalStorage) => {
    if (data.password) {
      const targetUrl = typeof url === "function" ? url() : url;

      const form = document.createElement("form");
      form.method = "POST";
      form.action = targetUrl;
      form.style.display = "none";

      const addToForm = (name: string, value: string) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.appendChild(input);
      };

      addToForm(passwordField, data.password);
      addToForm("__EVENTTARGET", "ctl00$cmdDangKy");
      addToForm(
        "__VIEWSTATEGENERATOR",
        getHiddenInput('input[name="__VIEWSTATEGENERATOR"]'),
      );
      addToForm("__VIEWSTATE", getHiddenInput('input[name="__VIEWSTATE"]'));

      if (typeof extendFields === "function") {
        extendFields(
          {
            append: (name, value) => addToForm(name, value),
          },
          data,
        );
      }

      const submitBtn = document.createElement("button");
      submitBtn.type = "submit";
      submitBtn.style.display = "none";
      form.appendChild(submitBtn);

      document.body.appendChild(form);

      try {
        console.log("Đang chuyển hướng và gửi dữ liệu...");
        submitBtn.click();
      } catch (error) {
        console.error("Lỗi khi submit form:", error);
        handleError();
      }
    }
  };
}

export function getHiddenInput(query: string) {
  const extendInput = document.querySelector<HTMLInputElement>(query);

  if (extendInput) {
    return extendInput.value;
  } else {
    console.error("Không tìm thấy " + query);
  }

  return "";
}
