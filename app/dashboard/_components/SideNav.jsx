import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { db } from '@/configs';
import { JsonForms } from '@/configs/schema';
import { useUser } from '@clerk/nextjs';
import { desc, eq } from 'drizzle-orm';
import { LibraryBig, LineChart, MessageSquare, Shield } from 'lucide-react'
import Link from 'next/link';
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

function SideNav() {
    const menuList = [
        { id: 1, name: 'My Forms', icon: LibraryBig, path: '/dashboard' },
        { id: 2, name: 'Responses', icon: MessageSquare, path: '/dashboard/responses' },
        { id: 3, name: 'Analytics', icon: LineChart, path: '/dashboard/analytics' },
        { id: 4, name: 'Upgrade', icon: Shield, path: '/dashboard/upgrade' }
    ];

    const { user } = useUser();
    const path = usePathname();
    const [formList, setFormList] = useState([]);
    const [PercFileCreated, setPercFileCreated] = useState(0);

    useEffect(() => {
        user && GetFormList()
    }, [user])

    const GetFormList = async () => {
        const result = await db.select().from(JsonForms)
            .where(eq(JsonForms.createdBy, user?.primaryEmailAddress?.emailAddress))
            .orderBy(desc(JsonForms.id));
        setFormList(result);
        const perc = (result.length / 1000) * 100;
        setPercFileCreated(perc)
    }

    return (
        <aside className="w-full md:w-64 h-auto md:h-screen shadow-md border bg-white flex md:block fixed md:static bottom-0 left-0 z-50">
            <div className="flex-1 p-2 md:p-5 flex flex-row md:flex-col overflow-x-auto">
                {menuList.map((menu, index) => (
                    <Link
                        href={menu.path}
                        key={index}
                        className={`flex items-center gap-2 md:gap-3 p-2 md:p-4 mb-0 md:mb-3 mr-2 md:mr-0
                        hover:bg-primary hover:text-white rounded-lg
                        cursor-pointer text-gray-500
                        ${path == menu.path && 'bg-primary text-white'}`}
                    >
                        <menu.icon />
                        <span className="hidden md:inline">{menu.name}</span>
                    </Link>
                ))}
            </div>
            <div className="hidden md:block fixed bottom-7 p-6 w-64">
                <Button className="w-full">Créer un formulaire</Button>
                <div className="my-7">
                    <Progress value={PercFileCreated} />
                    <h2 className="text-sm mt-2 text-gray-600">
                        <strong>{formList?.length} </strong>Out of <strong>3</strong> Fichier créé
                    </h2>
                    <h2 className="text-sm mt-3 text-gray-600">
                        Mettez à jour votre plan pour la construction d'une forme d'IA illimitée
                    </h2>
                </div>
            </div>
        </aside>
    )
}

export default SideNav;