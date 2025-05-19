import { AtomIcon, Edit, Share2 } from 'lucide-react'
import React from 'react'
import Dashboard from '../dashboard/page'

function Hero() {
  return (
    // bg-[url('/grid.svg')]
    <section className=" h-[500px] bg-[url('/grid.svg')]">
  <div className="mx-auto max-w-screen-xl z-30 px-4 pt-32 lg:flex  ">
    <div className="mx-auto max-w-xl text-center">
      <h1 className="text-3xl font-extrabold sm:text-5xl">
       Créez votre formulaire
        <strong className="font-extrabold text-primary sm:block"> En quelques secondes, pas en quelques heures </strong>
      </h1>

      <p className="mt-4 sm:text-xl/relaxed text-gray-500">
      Générez, publiez et partagez votre formulaire immédiatement grâce à l'IA. Plongez dans des résultats, des graphiques et des analyses perspicaces.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <a
          className="block w-full rounded bg-primary px-12 py-3 text-sm font-medium text-white shadow hover:bg-blue-300 focus:outline-none focus:ring active:bg-blue-300 sm:w-auto"
          href="/sign-in"
        >
          Créer un formulaire AI
        </a>

        <a
          className="block w-full rounded px-12 py-3 bg-white text-sm font-medium text-blue-600 shadow hover:text-primary-600 focus:outline-none focus:ring active:text-blue-300 sm:w-auto"
          href="#"
        >
          En savoir plus
        </a>
      </div>
    </div>
  </div>
  {/* <img src='/grid.svg' className=' absolute w-full h-[400px] '/> */}
<section className="bg-white dark:bg-gray-900">
  <div className="mx-auto max-w-screen-xl px-4 py-56 ">
    <div className="mx-auto max-w-lg text-center">
      <h2 className="text-3xl font-bold sm:text-3xl">Comment cela fonctionne-t-il ?</h2>

      <p className="mt-4 text-black-300">
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Consequuntur aliquam doloribus
        nesciunt eos fugiat. Vitae aperiam fugit consequuntur saepe laborum.
      </p>
    </div>

    <div className="mt-8  grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      <a
        className="block rounded-xl  p-8 shadow-xl transition hover:border-blue-800 hover:shadow-blue-300"
        href="sign-in"
      >
       <AtomIcon className='h-8 w-8'/>

        <h2 className="mt-4 text-xl font-bold text-black">Rédiger une promotion pour votre formulaire</h2>

        <p className="mt-1 text-sm text-gray-600">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex ut quo possimus adipisci
          distinctio alias voluptatum blanditiis laudantium.
        </p>
      </a>

      <a
        className="block rounded-xl  p-8 shadow-xl transition hover:border-blue-800 hover:shadow-blue-300"
        href="/sign-in"
      >
      <Edit className='h-8 w-8'/>

        <h2 className="mt-4 text-xl font-bold text-black">Modifier le formulaire </h2>

        <p className="mt-1 text-sm text-gray-600">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex ut quo possimus adipisci
          distinctio alias voluptatum blanditiis laudantium.
        </p>
      </a>

      <a
        className="block rounded-xl  p-8 shadow-xl transition hover:border-blue-800 hover:shadow-blue-300"
        href="/sign-in"
      >
      <Share2 className='h-8 w-8' />

        <h2 className="mt-4 text-xl font-bold text-black">Partager et commencer à accepter des réponses</h2>

        <p className="mt-1 text-sm text-gray-600">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex ut quo possimus adipisci
          distinctio alias voluptatum blanditiis laudantium.
        </p>
      </a>

    
    </div>

    <div className="mt-12 text-center">
      <a
        href="/sign-in"
        className="inline-block rounded bg-primary px-12 py-3 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring focus:ring-yellow-400"
      >
        Commencez dès aujourd'hui
      </a>
    </div>
  </div>
</section>
</section>
  )
}

export default Hero