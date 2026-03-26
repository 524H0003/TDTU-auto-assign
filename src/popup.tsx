import React, { useEffect, useState } from "react";

import packageJson from "../package.json";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "./components/shadcn/ui/field";
import { Input } from "./components/shadcn/ui/input";
import { Switch } from "./components/shadcn/ui/switch";
import { Textarea } from "./components/shadcn/ui/textarea";
import { LocalStorage } from "./types";

export default function PopupPage() {
  const [plan, setPlan] = useState(""),
    [password, setPassword] = useState(""),
    [active, setActive] = useState<boolean>(false);

  useEffect(() => {
    chrome.storage.local.get<LocalStorage>(
      ["password", "plan", "active"],
      (data) => {
        setPassword(data.password || "");
        setPlan(data.plan || "");
        setActive(data.active || false);
      },
    );
  }, []);

  return (
    <FieldGroup className="p-4">
      <FieldSet>
        <FieldLegend>TDTU Auto Assign</FieldLegend>
        <FieldDescription>
          Tự động đăng ký môn học cho sinh viên. Phiên bản {packageJson.version}
        </FieldDescription>
      </FieldSet>
      <Field orientation="horizontal" className="w-fit">
        <FieldLabel htmlFor="toggleActive">Kích hoạt</FieldLabel>
        <Switch
          id="toggleActive"
          checked={active}
          onCheckedChange={(active) => {
            chrome.storage.local.set({ active }, () => setActive(active));
          }}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="fieldgroup-password">
          Mật khẩu tài khoản sinh viên
        </FieldLabel>
        <Input
          id="fieldgroup-password"
          type="password"
          value={password}
          onChange={(e) => {
            const password = e.target.value;
            chrome.storage.local.set({ password }, () => setPassword(password));
          }}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="fieldgroup-plan">Kế hoạch học tập</FieldLabel>
        <Textarea
          id="fieldgroup-plan"
          value={plan}
          onChange={(e) => {
            const plan = e.target.value;
            chrome.storage.local.set({ plan }, () => setPlan(plan));
          }}
          rows={6}
          className="max-h-36"
        />
        <FieldDescription>
          Mẫu và ví dụ đăng ký học tập{" "}
          <a
            href="#"
            className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
          >
            tại đây
          </a>
        </FieldDescription>
      </Field>
    </FieldGroup>
  );
}
