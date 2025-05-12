import { Delete, Edit, Trash } from 'lucide-react'
import React, { useState } from 'react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button';
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
  } from "@/components/ui/alert-dialog"
  
  
function FieldEdit({defaultValue,onUpdate,deleteField}) {

    const [label,setLabel]=useState(defaultValue?.label);
    const [placeholder,setPlaceholder]=useState(defaultValue?.placeholder);

  return (
    <div className='flex gap-2'>
       
       <Popover>
        <PopoverTrigger> <Edit className='h-5 w-5 text-gray-500'/></PopoverTrigger>
        <PopoverContent>
            <h2>Editer les champs</h2>
            <div>
                <label className='text-xs'>Nom de l'étiquette</label>
                <Input type="text" defaultValue={defaultValue.label}
                    onChange={(e)=>setLabel(e.target.value)}
                />
            </div>
            <div>
                <label className='text-xs'>Nom de l'emplacement</label>
                <Input type="text" defaultValue={defaultValue.placeholder}
                    onChange={(e)=>setPlaceholder(e.target.value)}
                />
            </div>
            <Button size="sm"  className="mt-3"
            onClick={()=>onUpdate({
                label:label,
                placeholder:placeholder
            })}
            >Update</Button>
        </PopoverContent>
        </Popover>

      
        <AlertDialog>
  <AlertDialogTrigger>
  <Trash className='h-5 w-5 text-red-500'/>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
      <AlertDialogDescription>
        Cette action ne peut être annulée. Cette action supprimera définitivement votre compte
 et vos données de nos serveurs.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Annuler</AlertDialogCancel>
      <AlertDialogAction onClick={()=>deleteField()}>Continuer</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

      
    </div>
  )
}

export default FieldEdit