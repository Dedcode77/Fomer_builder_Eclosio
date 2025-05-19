"use client";
import { db } from "@/configs";
import { JsonForms } from "@/configs/schema";
import { useUser } from "@clerk/nextjs";
import { and, eq } from "drizzle-orm";
import { ArrowLeft, Share2, SquareArrowOutUpRight, Printer } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import FormUi from "../_components/FormUi";
import { toast } from "sonner";
import Controller from "../_components/Controller";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";

function EditForm({ params }) {
  const { user } = useUser();
  const [jsonForm, setJsonForm] = useState([]);
  const router = useRouter();
  const [updateTrigger, setUpdateTrigger] = useState();
  const [record, setRecord] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const qrCodeRef = useRef(null); // Référence pour le QR Code

  const [selectedTheme, setSelectedTheme] = useState("light");
  const [selectedBackground, setSelectedBackground] = useState();
  const [selectedStyle, setSelectedStyle] = useState();

  useEffect(() => {
    user && GetFormData();
  }, [user]);

  const GetFormData = async () => {
    const result = await db
      .select()
      .from(JsonForms)
      .where(
        and(
          eq(JsonForms.id, params?.formId),
          eq(JsonForms.createdBy, user?.primaryEmailAddress?.emailAddress)
        )
      );

    setRecord(result[0]);
    setJsonForm(JSON.parse(result[0].jsonform));
    setSelectedBackground(result[0].background);
    setSelectedTheme(result[0].theme);
    setSelectedStyle(JSON.parse(result[0].style));
  };

  useEffect(() => {
    if (updateTrigger) {
      setJsonForm(jsonForm);
      updateJsonFormInDb();
    }
  }, [updateTrigger]);

  const onFieldUpdate = (value, index) => {
    jsonForm.fields[index].label = value.label;
    jsonForm.fields[index].placeholder = value.placeholder;
    setUpdateTrigger(Date.now());
  };

  const updateJsonFormInDb = async () => {
    const result = await db
      .update(JsonForms)
      .set({
        jsonform: jsonForm,
      })
      .where(
        and(
          eq(JsonForms.id, record.id),
          eq(JsonForms.createdBy, user?.primaryEmailAddress?.emailAddress)
        )
      )
      .returning({ id: JsonForms.id });

    toast("Updated!!!");
  };

  const deleteField = (indexToRemove) => {
    const result = jsonForm.fields.filter((item, index) => index != indexToRemove);

    jsonForm.fields = result;
    setUpdateTrigger(Date.now());
  };

  const updateControllerFields = async (value, columnName) => {
    const result = await db
      .update(JsonForms)
      .set({
        [columnName]: value,
      })
      .where(
        and(
          eq(JsonForms.id, record.id),
          eq(JsonForms.createdBy, user?.primaryEmailAddress?.emailAddress)
        )
      )
      .returning({ id: JsonForms.id });

    toast("Updated!!!");
  };

  const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/aiform/${record?.id}`;

  const printQRCode = () => {
    const canvas = qrCodeRef.current.querySelector("canvas"); // Sélectionner le canvas du QR Code
    if (canvas) {
      const imageData = canvas.toDataURL("image/png"); // Convertir le canvas en image Base64
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>QR Code</title>
            </head>
            <body style="display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
              <img src="${imageData}" alt="QR Code" />
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    } else {
      console.error("QR Code canvas introuvable !");
    }
  };

  return (
    <div className="p-10">
      <div className="flex justify-between items-center">
        <h2
          className="flex gap-2 items-center my-5 cursor-pointer hover:font-bold"
          onClick={() => router.back()}
        >
          <ArrowLeft /> Retour
        </h2>
        <div className="flex gap-2">
          <Link href={"/aiform/" + record?.id} target="_blank">
            <Button className="flex gap-2">
              <SquareArrowOutUpRight className="h-5 w-5" /> Aperçu
            </Button>
          </Link>
          <Button
            className="flex gap-2 bg-green-600 hover:bg-green-700"
            onClick={() => setShowShareModal(true)}
          >
            <Share2 /> Partager
          </Button>
        </div>
      </div>

      {/* Modale de partage */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-lg text-center">
            <h3 className="text-lg font-bold mb-3">Partager ce formulaire</h3>
            <div ref={qrCodeRef}>
              <QRCodeCanvas value={shareUrl} size={150} className="mx-auto mb-3" />
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Scannez le QR Code ou utilisez le lien ci-dessous :
            </p>
            <p className="text-sm text-blue-600 break-all">{shareUrl}</p>
            <div className="mt-5 flex justify-center gap-3">
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={printQRCode}
              >
                <Printer className="h-5 w-5 mr-2" /> Imprimer
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={() => setShowShareModal(false)}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 border rounded-lg shadow-md">
          <Controller
            selectedTheme={(value) => {
              updateControllerFields(value, "theme");
              setSelectedTheme(value);
            }}
            selectedBackground={(value) => {
              updateControllerFields(value, "background");
              setSelectedBackground(value);
            }}
            selectedStyle={(value) => {
              setSelectedStyle(value);
              updateControllerFields(value, "style");
            }}
            setSignInEnable={(value) => {
              updateControllerFields(value, "enabledSignIn");
            }}
          />
        </div>
        <div
          className="md:col-span-2 border rounded-lg p-5 flex items-center justify-center"
          style={{
            backgroundImage: selectedBackground,
          }}
        >
          <FormUi
            jsonForm={jsonForm}
            selectedTheme={selectedTheme}
            selectedStyle={selectedStyle}
            onFieldUpdate={onFieldUpdate}
            deleteField={(index) => deleteField(index)}
          />
        </div>
      </div>
    </div>
  );
}

export default EditForm;