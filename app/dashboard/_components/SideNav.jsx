import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { db } from '@/configs';
import { JsonForms } from '@/configs/schema';
import { useUser } from '@clerk/nextjs';
import { desc, eq } from 'drizzle-orm';
import { LibraryBig, LineChart, MessageSquare, Shield } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState, memo } from 'react';

function SideNavComponent() {
  const menuList = [
    { id: 1, name: 'My Forms', icon: LibraryBig, path: '/dashboard' },
    { id: 2, name: 'Responses', icon: MessageSquare, path: '/dashboard/responses' },
    { id: 3, name: 'Analytics', icon: LineChart, path: '/dashboard/analytics' },
    { id: 4, name: 'Upgrade', icon: Shield, path: '/dashboard/upgrade' }
  ];

  const { user } = useUser();
  const path = usePathname();

  const [formList, setFormList] = useState([]);
  const [percFileCreated, setPercFileCreated] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      (async () => {
        try {
          const result = await db
            .select()
            .from(JsonForms)
            .where(eq(JsonForms.createdBy, user.primaryEmailAddress.emailAddress))
            .orderBy(desc(JsonForms.id));

          setFormList(result);
          const perc = (result.length / 1000) * 100;
          setPercFileCreated(perc);
        } catch (error) {
          console.error('Erreur chargement formulaires:', error);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [user]);

  return (
    <aside className="w-full md:w-64 h-auto md:h-screen shadow-md border bg-white flex md:block fixed md:static bottom-0 left-0 z-50">
      <div className="flex-1 p-2 md:p-5 flex flex-row md:flex-col overflow-x-auto">
        {menuList.map((menu) => (
          <Link
            href={menu.path}
            prefetch
            key={menu.id}
            className={`flex items-center gap-2 md:gap-3 p-2 md:p-4 mb-0 md:mb-3 mr-2 md:mr-0
            hover:bg-primary hover:text-white rounded-lg
            cursor-pointer text-gray-500
            ${path === menu.path ? 'bg-primary text-white' : ''}`}
          >
            <menu.icon />
            <span className="hidden md:inline">{menu.name}</span>
          </Link>
        ))}
      </div>

      <div className="hidden md:block fixed bottom-7 p-6 w-64">
        <Button className="w-full">Créer un formulaire</Button>
        <div className="my-7">
          {loading ? (
            <div className="text-sm text-gray-400 mt-4">Chargement des formulaires...</div>
          ) : (
            <>
              <Progress value={percFileCreated} />
              <h2 className="text-sm mt-2 text-gray-600">
                <strong>{formList.length}</strong> sur <strong>3</strong> fichier{formList.length > 1 ? 's' : ''} créé{formList.length > 1 ? 's' : ''}
              </h2>
              <h2 className="text-sm mt-3 text-gray-600">
                Mettez à jour votre plan pour créer des formulaires IA illimités.
              </h2>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

const SideNav = memo(SideNavComponent); // ✅ Optimisation pour éviter les rerenders
export default SideNav;
