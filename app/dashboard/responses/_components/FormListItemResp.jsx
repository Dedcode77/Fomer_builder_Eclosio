'use client';

import { Button } from '@/components/ui/button';
import { db } from '@/configs';
import { userResponses } from '@/configs/schema';
import { eq } from 'drizzle-orm';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export default function FormListItemResp({ jsonForm, formRecord }) {
  const [loading, setLoading] = useState(false);
  const [responseCount, setResponseCount] = useState(0);

  useEffect(() => {
    getResponseCount();
  }, []);

  const getResponseCount = async () => {
    try {
      const result = await db
        .select()
        .from(userResponses)
        .where(eq(userResponses.formRef, formRecord.id));
      setResponseCount(result.length);
    } catch (error) {
      console.error("Erreur lors du comptage des réponses :", error);
    }
  };

  const ExportData = async () => {
    setLoading(true);
    try {
      const result = await db
        .select()
        .from(userResponses)
        .where(eq(userResponses.formRef, formRecord.id));

      const jsonData = result.map((item) => JSON.parse(item.jsonResponse));
      await exportToExcel(jsonData);
    } catch (error) {
      console.error("Erreur lors de l'export :", error);
    } finally {
      setLoading(false);
    }
  };

  const base64ToBuffer = (base64) => {
    const matches = base64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Format base64 invalide');
    }
    const binaryString = atob(matches[2]);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const exportToExcel = async (data) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Réponses');

    // Création des en-têtes
    const headers = new Set();
    data.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (key !== 'signature') headers.add(key);
      });
    });
    const headerArray = Array.from(headers);
    headerArray.push('Signature'); // Ajouter une colonne pour les signatures
    worksheet.addRow(headerArray);

    // Remplissage des données
    for (let i = 0; i < data.length; i++) {
      const rowData = headerArray
        .filter((header) => header !== 'Signature')
        .map((header) => data[i][header] ?? '');

      // Ajoute une cellule vide pour la signature (sera remplacée par l'image si présente)
      rowData.push('');
      const row = worksheet.addRow(rowData);

      // Ajout de la signature si elle existe
      if (data[i].signature) {
        try {
          const signatureBuffer = base64ToBuffer(data[i].signature);
          const imageId = workbook.addImage({
            buffer: signatureBuffer,
            extension: 'png',
          });

          // Positionnement de l'image dans la cellule "Signature" (colonne la plus à droite)
          worksheet.addImage(imageId, {
            tl: { col: headerArray.length - 0.4, row: i + 0.6,offsetX: 10,offsetY: 10 }, // +1 à cause de la ligne d'en-tête
            ext: { width: 40, height: 40 },
            editAs: 'oneCell',
          });

          row.height = 30; // Ajuster la hauteur de la ligne pour l'image
        } catch (error) {
          console.error("Erreur avec la signature :", error);
          row.getCell(headerArray.length).value = "Signature non disponible";
        }
      }
    }

    // Ajustement des colonnes
    worksheet.columns = headerArray.map((header, idx) => ({
      header,
      width: header === 'Signature' ? 25 : Math.min(Math.max(header.length, 10), 25),
      key: header,
    }));

    // Génération du fichier
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      `${jsonForm?.formTitle || 'export'}_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  return (
    <div className="border shadow-sm rounded-lg p-4 my-5">
      <h2 className="text-lg text-black">{jsonForm?.formTitle}</h2>
      <h2 className="text-sm text-gray-500">{jsonForm?.formHeading}</h2>
      <hr className="my-4" />
      <div className="flex justify-between items-center">
        <h2 className="text-sm">
          <strong>{responseCount}</strong> Réponses
        </h2>
        <Button
          size="sm"
          onClick={ExportData}
          disabled={loading || responseCount === 0}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Export...
            </>
          ) : (
            `Exporter (${responseCount})`
          )}
        </Button>
      </div>
    </div>
  );
}