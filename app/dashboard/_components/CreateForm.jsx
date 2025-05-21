"use client"

import React, { useEffect, useState, useCallback } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { AiChatSession } from '@/configs/AiModal'
import { useUser } from '@clerk/nextjs'
import { db } from '@/configs'
import { JsonForms } from '@/configs/schema'
import moment from 'moment'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { desc, eq } from 'drizzle-orm'

const PROMPT = ",On Basis of description create JSON form with formTitle, formHeading along with fieldName, FieldTitle,FieldType, Placeholder, label , required fields, and checkbox and select field type options will be in array only and in JSON format"

function CreateForm() {
    const [openDialog, setOpenDialog] = useState(false)
    const [userInput, setUserInput] = useState('')
    const [loading, setLoading] = useState(false)
    const { user } = useUser()
    const router = useRouter()

    const getFormList = useCallback(async () => {
        if (!user?.primaryEmailAddress?.emailAddress) return

        try {
            await db.select()
                .from(JsonForms)
                .where(eq(JsonForms.createdBy, user.primaryEmailAddress.emailAddress))
                .orderBy(desc(JsonForms.id))
            // Tu peux utiliser ça si tu veux montrer un compteur ou pour pagination
        } catch (error) {
            console.error("Erreur lors de la récupération des formulaires :", error)
            toast.error("Impossible de charger vos formulaires")
        }
    }, [user])

    useEffect(() => {
        getFormList()
    }, [getFormList])

    const onCreateForm = async () => {
        if (!userInput.trim()) {
            toast.error("Veuillez entrer une description.")
            return
        }

        setLoading(true)
        try {
            const result = await AiChatSession.sendMessage("Description:" + userInput + PROMPT)
            const responseText = result.response.text()

            if (!responseText) {
                throw new Error("Aucune réponse de l'IA")
            }

            const resp = await db.insert(JsonForms)
                .values({
                    jsonform: responseText,
                    createdBy: user?.primaryEmailAddress?.emailAddress || '',
                    createdAt: moment().format('DD/MM/YYYY')
                })
                .returning({ id: JsonForms.id })

            const newFormId = resp[0]?.id
            if (newFormId) {
                toast.success("Formulaire créé avec succès !")
                router.push('/edit-form/' + newFormId)
                setOpenDialog(false)
                setUserInput('') // Réinitialiser le champ
            }
        } catch (error) {
            console.error("Erreur lors de la création du formulaire :", error)
            toast.error("Erreur lors de la création du formulaire")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <Button onClick={() => setOpenDialog(true)}>Créer un formulaire</Button>

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Créer un nouveau formulaire</DialogTitle>
                        <DialogDescription>
                            <Textarea 
                                className="my-2" 
                                onChange={(e) => setUserInput(e.target.value)}
                                value={userInput}
                                placeholder="Décrivez le contenu de votre formulaire"
                                disabled={loading}
                            />
                            <div className='flex gap-2 my-3 justify-end'>
                                <Button 
                                    onClick={() => setOpenDialog(false)}
                                    variant="destructive"
                                    disabled={loading}
                                >
                                    Annuler
                                </Button>
                                <Button 
                                    onClick={onCreateForm}
                                    disabled={loading || !userInput.trim()}
                                >
                                    {loading ? (
                                        <Loader2 className='animate-spin w-4 h-4' />
                                    ) : 'Créer'}
                                </Button>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default CreateForm
