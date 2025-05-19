'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Edit, Share, Trash, Printer } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useUser } from '@clerk/nextjs';
import { db } from '@/configs';
import { JsonForms } from '@/configs/schema';
import { and, eq } from 'drizzle-orm';
import { toast } from 'sonner';
import { QRCodeCanvas } from 'qrcode.react';

function ShareModal({ shareUrl, onClose, qrCodeRef, onPrint }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg shadow-lg text-center max-w-sm w-full">
        <h3 className="text-lg font-bold mb-3">Partager ce formulaire</h3>
        <div ref={qrCodeRef}>
          <QRCodeCanvas value={shareUrl} size={150} className="mx-auto mb-3" />
        </div>
        <p className="text-sm text-gray-500 mb-2">Scannez le QR Code ou utilisez le lien ci-dessous :</p>
        <p className="text-sm text-blue-600 break-all">{shareUrl}</p>
        <div className="mt-5 flex justify-center gap-3">
          <Button className="bg-gray-600 hover:bg-gray-700" onClick={onPrint}>
            <Printer className="h-5 w-5 mr-2" />
            Imprimer
          </Button>
          <Button className="bg-red-600 hover:bg-red-700" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}

function FormListItem({ formRecord, jsonForm, refreshData }) {
  const { user } = useUser();
  const [showShareModal, setShowShareModal] = useState(false);
  const qrCodeRef = useRef(null);

  const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/aiform/${formRecord.id}`;

  const onDeleteForm = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    const result = await db
      .delete(JsonForms)
      .where(
        and(
          eq(JsonForms.id, formRecord.id),
          eq(JsonForms.createdBy, user.primaryEmailAddress.emailAddress)
        )
      );

    if (result) {
      toast.success('Formulaire supprimé avec succès !');
      refreshData();
    }
  };

  const handlePrint = () => {
    const qrCodeElement = qrCodeRef.current;
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Imprimer le QR Code</title></head><body>');
    printWindow.document.write('<div style="text-align: center;">');
    printWindow.document.write(qrCodeElement.outerHTML);
    printWindow.document.write('</div>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="border shadow-sm rounded-lg p-4">
      <div className="flex justify-between">
        <div />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Trash className="h-5 w-5 text-red-600 cursor-pointer hover:scale-105 transition-all" />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible et supprimera définitivement ce formulaire.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={onDeleteForm}>Continuer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <h2 className="text-lg text-black font-semibold mt-2">{jsonForm?.formTitle}</h2>
      <h3 className="text-sm text-gray-500">{jsonForm?.formHeading}</h3>

      <hr className="my-4" />

      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" className="flex gap-2" onClick={() => setShowShareModal(true)}>
          <Share className="h-5 w-5" />
          Partager
        </Button>

        <Link href={`/edit-form/${formRecord.id}`} passHref>
          <Button className="flex gap-2" size="sm">
            <Edit className="h-5 w-5" />
            Modifier
          </Button>
        </Link>
      </div>

      {showShareModal && (
        <ShareModal
          shareUrl={shareUrl}
          onClose={() => setShowShareModal(false)}
          qrCodeRef={qrCodeRef}
          onPrint={handlePrint}
        />
      )}
    </div>
  );
}

export default FormListItem;
