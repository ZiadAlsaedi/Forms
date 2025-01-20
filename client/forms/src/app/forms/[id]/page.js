'use client';

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import NavBar from "@/app/components/NavBar";
import { useRouter } from "next/navigation";

const FormPage = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [replies, setReplies] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const userResponse = await fetch('http://localhost:5000/get_user', {
          method: 'GET',
          credentials: 'include',
        });
        const userData = await userResponse.json();

        if (!userResponse.ok || !userData.user) {
          router.push('/signin');
          return;
        }

        const fetchForm = async () => {
          try {
            const formResponse = await fetch(`http://localhost:5000/forms/${id}`, {
              method: 'GET',
              credentials: 'include',
            });
            if (!formResponse.ok) throw new Error("Form not found");
            const formData = await formResponse.json();
            setForm(formData);
          } catch (err) {
            setError(err.message);
          }
        };

        fetchForm();
      } catch (err) {
        setError(err.message);
        router.push('/signin');
      }
    };

    checkUserSession();
  }, [id, router]);

  useEffect(() => {
    if (form) {
      const fetchReplies = async () => {
        try {
          const response = await fetch(`http://localhost:5000/forms/${form.id}/submissions/`, {
            method: 'GET',
            credentials: 'include',
          });
          const data = await response.json();
          if(response.ok){
            setReplies(data);
          }else{
            setReplies([]);
          }
        } catch (err) {
          setError(err.message);
        }
      };

      fetchReplies();
    }
  }, [form]);

  if (error) return <p>{error}</p>;
  if (!form)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-center text-gray-600">Loading form details...</p>{" "}
      </div>
    );

  const fields = JSON.parse(form.fields);

  const handleClick = () => {
    router.push(`/replies/${form.id}`);
  };

  return (
    <>
      <NavBar />
      <hr />
      <div className="min-h-screen bg-white w-full flex justify-center p-10 max-sm:w-[100%]">
        <div className="w-[80vw] bg-white p-10 shadow-2xl max-sm:w-[100%]">
          <div
            role="tablist"
            className="tabs w-[100%] tabs-lifted bg-white rounded-lg tabs-lg"
          >
            <input
              type="radio"
              name="my_tabs_2"
              role="tab"
              className="tab border-gray-300"
              aria-label="Form"
              defaultChecked
            />
            <div
              role="tabpanel"
              className="tab-content bg-white border-gray-300 rounded-box p-6 custom-scrollbar"
            >
              <div className="flex justify-between">
                <p className="text-black font-bold text-3xl max-sm:text-lg max-sm:m-4 text-center mb-8">
                  {form.title}
                </p>
                <button
                  className="btn text-white bg-primary hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                  onClick={handleClick}
                >
                  URL
                </button>
              </div>
              <p className="text-gray-700 mb-6">{form.description}</p>
              <form>
                {fields.map((field, index) => (
                  <div key={index} className="mb-6 border p-4 rounded">
                    <label className="block text-gray-700 font-semibold mb-2">
                      Q{index + 1}-{field.label}
                    </label>
                    {field.type === "text" && (
                      <input
                        type="text"
                        value={field.value}
                        readOnly
                        className="input input-bordered w-full mt-2 bg-white"
                      />
                    )}
                    {field.type === "checkbox" && (
                      <div className="mt-2">
                        {field.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className="flex items-center mt-2"
                          >
                            <input
                              type="checkbox"
                              value={option}
                              readOnly
                              checked={field.value.includes(option)}
                              className="checkbox"
                            />
                            <label className="ml-2 text-gray-700">
                              {option}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                    {field.type === "dropdown" && (
                      <select
                        value={field.value}
                        readOnly
                        className="select select-bordered w-full mt-2 bg-white"
                      >
                        {field.options.map((option, optIndex) => (
                          <option key={optIndex} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </form>
            </div>
            <input
              type="radio"
              name="my_tabs_2"
              role="tab"
              className="tab bg-white border-gray-300"
              aria-label="Dashboard"
            />
            <div
              role="tabpanel"
              className="tab-content bg-white border-gray-300 rounded-box p-6 custom-scrollbar min-h-screen"
            >
              <p className="text-black font-bold text-3xl mb-8">Replies</p>
              {replies.length === 0 ? (
                <p className="text-center text-gray-600">No replies yet.</p>
              ) : (
                <ul>
                  {replies.map((reply, index) => (
                    <li
                      key={index}
                      className="border p-4 mb-4 rounded shadow-sm"
                    >
                      <p className="font-semibold text-2xl mb-2 max-sm:text-left max-sm:text-base">
                        Reply {index + 1}:
                      </p>
                      <div>
                        {Object.keys(reply.submitted_data).length > 0 ? (
                          Object.keys(reply.submitted_data).map((key) => (
                            <div key={key} className="mb-2">
                              <strong>{key}:</strong>{" "}
                              {reply.submitted_data[key]}
                              <hr className="my-2" />
                            </div>
                          ))
                        ) : (
                          <p>No data available</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FormPage;
