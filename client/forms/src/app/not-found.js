"use client";
import Link from "next/link";

export default function NotFound() {
  return (
    <section>
      <div className="py-8 px-4 h-screen lg:py-16 lg:px-6">
        <div className="mx-auto max-w-screen-sm text-center">
          <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600">
            404
          </h1>
          <p className="mb-4 text-3xl tracking-tight font-bold">
            Something missing.
          </p>
          <p className="mb-4 text-lg font-light text-gray-500">
            Sorry, we can not find that page. You will find lots to explore on
            the home page.
          </p>
          <Link
            href={"/"}
            className="inline-flex text-white bg-primary-600 bg-primary hover:bg-purple-950 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center my-4"
          >
            {" "}
            Back to Homepage
          </Link>
        </div>
      </div>
    </section>
  );
}
