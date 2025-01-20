import React from 'react'
import Link from 'next/link'

const Hero = () => {
  return (
<div className="hero bg-white h-screen flex items-start justify-center">
  <div className="text-center w-full mt-20">
    <div className="w-full">
      <h1 className="text-6xl font  font-medium w-[94vw] tracking-wider ">
        Get insights quickly, with FormulateX Forms
      </h1>
      <p className="py-6">
        Easily create and share online forms and surveys, and analyze responses in real-time.
      </p>
      <Link href="/signin">      
      <button className="btn bg-primary btn-wide mb-4 text-white">Get Started</button>
      </Link>
      <p>
        Don't have an account? <span className="text-blue-700">            
       <Link href="/signup">Sign Up</Link></span>
      </p>
    </div>
  </div>
</div>

 )
}

export default Hero