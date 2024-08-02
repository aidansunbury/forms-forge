"use client";
import useDrivePicker from "react-google-drive-picker";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";

export default function Picker({ token }: { token: string | undefined }) {
  const [openPicker, authResponse] = useDrivePicker();

  const handleOpenPicker = () => {
    openPicker({
      clientId:
        "1019712694717-2a6u9d71s48tggkub2ka3ppdrgok9dtr.apps.googleusercontent.com",
      developerKey: "",
      // viewId: "FORMS"
      setOrigin: "http://localhost:3000",
      appId: "1019712694717",

      token: token, // pass oauth token in case you already have one
      showUploadView: true,
      showUploadFolders: true,
      supportDrives: true,
      setIncludeFolders: true,
      setSelectFolderEnabled: true,

      multiselect: true,
      // customViews: customViewsArray, // custom view
      callbackFunction: (data) => {
        if (data.action === "cancel") {
          console.log("User clicked cancel/close button");
        }
        console.log(data);
      },
    });
  };
  return <button onClick={() => handleOpenPicker()}>Open Picker</button>;
}
