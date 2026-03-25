import React, { useEffect, useState } from "react";

import packageJson from "../package.json";
import SettingsButton from "./components/settings";
import { Button } from "./components/shadcn/ui/button";
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

  const handleSave = () => {
    chrome.storage.local.set({ plan, password });
  };

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
          onCheckedChange={(e) => {
            chrome.storage.local.set({ active: e }, () => setActive(e));
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
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="fieldgroup-plan">Kế hoạch học tập</FieldLabel>
        <Textarea
          id="fieldgroup-plan"
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          rows={6}
          className="max-h-36"
        />
        <FieldDescription>
          Mẫu và ví dụ đăng ký học tập <Button variant="link">tại đây</Button>
        </FieldDescription>
      </Field>
      <Field orientation="horizontal" className="justify-between">
        <Button type="submit" onClick={handleSave}>
          Lưu thông tin
        </Button>

        <SettingsButton />
      </Field>
    </FieldGroup>
  );
}
