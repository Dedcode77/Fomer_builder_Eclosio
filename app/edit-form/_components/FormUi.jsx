import { Input } from '@/components/ui/input';
import React, { useEffect, useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from '@/components/ui/button';
import { Pen } from 'lucide-react';
import FieldEdit from './FieldEdit';
import { db } from '@/configs';
import { userResponses } from '@/configs/schema';
import moment from 'moment';
import { toast } from 'sonner';
import { SignInButton, useUser } from '@clerk/nextjs';

function FormUi({ jsonForm, selectedTheme, selectedStyle, 
  onFieldUpdate, deleteField, editable = true, formId = 0, enabledSignIn = false }) {
  const [formData, setFormData] = useState({});
  const [signatureData, setSignatureData] = useState(null);
  const [isSignatureEmpty, setIsSignatureEmpty] = useState(true); // Nouvel état pour vérifier si la signature est vide
  let formRef = useRef();
  const signaturePadRef = useRef();
  const { user, isSignedIn } = useUser();

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSignatureClear = () => {
    signaturePadRef.current.clear();
    setSignatureData(null);
    setIsSignatureEmpty(true);
    // Mettre à jour formData
    setFormData(prev => {
      const newData = {...prev};
      delete newData.signature;
      return newData;
    });
  };

  // Fonction pour enregistrer automatiquement la signature
  const handleSignatureEnd = () => {
    if (!signaturePadRef.current.isEmpty()) {
      const signature = signaturePadRef.current.toDataURL();
      setSignatureData(signature);
      setIsSignatureEmpty(false);
      setFormData({
        ...formData,
        signature,
      });
    } else {
      setIsSignatureEmpty(true);
    }
  };

  const onFormSubmit = async (event) => {
    event.preventDefault();
    
    // Vérifier si la signature est requise et vide
    const signatureField = jsonForm?.fields?.find(field => field.fieldType === 'signature');
    if (signatureField?.required && isSignatureEmpty) {
      toast.error('Veuillez fournir une signature');
      return;
    }

    console.log(formData);

    const result = await db.insert(userResponses).values({
      jsonResponse: formData,
      createdAt: moment().format('DD/MM/yyyy'),
      formRef: formId,
    });

    if (result) {
      formRef.reset();
      toast('Réponse envoyée avec succès!');
    } else {
      toast('Erreur lors de la sauvegarde du formulaire!');
    }
  };

  const handleCheckboxChange = (fieldName, itemName, value) => {
    const list = formData?.[fieldName] ? formData?.[fieldName] : [];

    if (value) {
      list.push({
        label: itemName,
        value: value,
      });
      setFormData({
        ...formData,
        [fieldName]: list,
      });
    } else {
      const result = list.filter((item) => item.label !== itemName);
      setFormData({
        ...formData,
        [fieldName]: result,
      });
    }
  };

  return (
    <form
      ref={(e) => (formRef = e)}
      onSubmit={onFormSubmit}
      className="border p-5 md:w-[600px] rounded-lg"
      data-theme={selectedTheme}
      style={{
        boxShadow: selectedStyle?.key === 'boxshadow' && '5px 5px 0px black',
        border: selectedStyle?.key === 'border' && selectedStyle.value,
      }}
    >
      <h2 className="font-bold text-center text-2xl">{jsonForm?.formTitle}</h2>
      <h2 className="text-sm text-gray-400 text-center">{jsonForm?.formHeading}</h2>

      {jsonForm?.fields?.map((field, index) => (
        <div key={index} className="flex items-center gap-2">
          {field.fieldType === 'select' ? (
            <div className="my-3 w-full">
              <label className="text-xs text-gray-500">{field.label}</label>

              <Select
                required={field?.required}
                onValueChange={(v) => handleSelectChange(field.fieldName, v)}
              >
                <SelectTrigger className="w-full bg-transparent">
                  <SelectValue placeholder={field.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((item, index) => (
                    <SelectItem key={index} value={item.label ? item.label : item}>
                      {item.label ? item.label : item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : field.fieldType === 'radio' ? (
            <div className="w-full my-3">
              <label className="text-xs text-gray-500">{field.label}</label>

              <RadioGroup required={field?.required}>
                {field.options.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={item.label}
                      id={item.label}
                      onClick={() => handleSelectChange(field.fieldName, item.label)}
                    />
                    <Label htmlFor={item.label}>{item.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ) : field.fieldType === 'checkbox' ? (
            <div className="my-3 w-full">
              <label className="text-xs text-gray-500">{field?.label}</label>
              {field?.options
                ? field?.options?.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Checkbox
                        onCheckedChange={(v) =>
                          handleCheckboxChange(field?.label, item.label ? item.label : item, v)
                        }
                      />
                      <h2>{item.label ? item.label : item}</h2>
                    </div>
                  ))
                : null}
            </div>
          ) : field.fieldType === 'signature' ? (
            <div className="my-3 w-full">
              <label className="text-xs text-gray-500">{field.label} {field.required && '*'}</label>
              <div className="border rounded-md p-2">
                <SignatureCanvas
                  ref={signaturePadRef}
                  penColor="black"
                  canvasProps={{
                    width: 500,
                    height: 200,
                    className: 'sigCanvas',
                  }}
                  onEnd={handleSignatureEnd} // Enregistrement automatique
                />
                <div className="flex gap-2 mt-2">
                  <Button type="button" onClick={handleSignatureClear}>
                    Effacer
                  </Button>
                </div>
                {field.required && isSignatureEmpty && (
                  <p className="text-xs text-red-500 mt-1">Une signature est requise</p>
                )}
              </div>
            </div>
          ) : (
            <div className="my-3 w-full">
              <label className="text-xs text-gray-500">{field.label}</label>
              <Input
                type={field?.type}
                placeholder={field.placeholder}
                name={field.fieldName}
                className="bg-transparent"
                required={field?.required}
                onChange={(e) => handleInputChange(e)}
              />
            </div>
          )}

          {editable && (
            <div>
              <FieldEdit
                defaultValue={field}
                onUpdate={(value) => onFieldUpdate(value, index)}
                deleteField={() => deleteField(index)}
              />
            </div>
          )}
        </div>
      ))}
      {!enabledSignIn ? (
        <button className="btn btn-primary">Soumettre</button>
      ) : isSignedIn ? (
        <button className="btn btn-primary">Soumettre</button>
      ) : (
        <Button>
          <SignInButton mode="modal">Se connecter avant de soumettre</SignInButton>
        </Button>
      )}
    </form>
  );
}

export default FormUi;