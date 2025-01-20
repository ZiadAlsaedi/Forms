'use client'; 
import { useRouter } from 'next/navigation'
import React from 'react'

const Card = ({ form }) => {
  const router = useRouter();
  const handleClick = () => {
    router.push(`/forms/${form.id}`);
   }
  return (
<div className="bg-primary text-white rounded-md w-56 h-fit shadow-xl cursor-pointer hover:shadow-2xl hover:bg-purple-950 transition-shadow duration-300" onClick={handleClick}>
  <figure>
    <img
      src="https://www2.0zz0.com/2024/12/24/08/627317347.png"
      alt="Shoes"
      className='rounded-md w-full'
      />
  </figure>
  <div className="flex">
    <div className="justify-start p-4">
    <h4>{form.title}</h4>
    </div>
  </div>

</div>  )
}

export default Card