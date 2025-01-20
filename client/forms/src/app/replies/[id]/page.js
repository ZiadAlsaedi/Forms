"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { z } from "zod";
import NavBar from "@/app/components/NavBar";
import { useRouter } from "next/navigation";

const ReplyPage = () => {
  const params = useParams();
  const id = params.id;
  const [form, setForm] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [errorMessages, setErrorMessages] = useState({});
  const [submissionError, setSubmissionError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const userResponse = await fetch("http://localhost:5000/get_user", {
          method: "GET",
          credentials: "include",
        });
        const userData = await userResponse.json();

        if (userResponse.ok && userData.user) {
          setUser(userData.user);
          const response = await fetch(`http://localhost:5000/forms/${id}`, {
            method: "GET",
            credentials: "include",
          });
          if (!response.ok) throw new Error("Form not found");
          const data = await response.json();
          setForm(data);
        } else {
          router.push("/signin");
        }
      } catch (error) {
        console.error("Error fetching user or form details:", error);
        router.push("/signin");
      } finally {
        setLoading(false);
      }
    };

    checkUserSession();
  }, [id, router]);

  const createZodSchema = (fields) => {
    const schemaObject = fields.reduce((acc, field) => {
      if (field.type === "text") {
        acc[field.label] = z.string().nonempty(`${field.label} is required`);
      } else if (field.type === "checkbox") {
        acc[field.label] = z.array(z.string()).min(1, `${field.label} is required`);
      } else if (field.type === "dropdown") {
        acc[field.label] = z.string().refine(
          (value) => value !== "",
          `${field.label} is required`
        );
      }
      return acc;
    }, {});

    return z.object(schemaObject);
  };

  const handleInputChange = (field, value, isCheckbox = false) => {
    setFormData((prev) => {
      if (isCheckbox) {
        const prevValues = prev[field] || [];
        if (prevValues.includes(value)) {
          return { ...prev, [field]: prevValues.filter((v) => v !== value) };
        }
        return { ...prev, [field]: [...prevValues, value] };
      }
      return { ...prev, [field]: value };
    });
    setErrorMessages((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const schema = createZodSchema(JSON.parse(form.fields));

    try {
      schema.parse(formData);

      if (!user) {
        setSubmissionError("User not logged in or ID not found.");
        return;
      }

      const submissionData = {
        formData,
        user_id: user.id,
      };

      const response = await fetch(
        `http://localhost:5000/forms/${id}/submissions/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(submissionData),
        }
      );

      if (response.ok) {
        alert("Form submitted successfully!");
      } else {
        setSubmissionError("Form submission failed. Please try again.");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
          const validationErrors = {}; 
          error.errors.forEach((error) => {
           validationErrors[error.path[0]] = error.message;
           });
        setErrorMessages(validationErrors);
      } else {
        console.error("Error submitting form:", error);
        setSubmissionError("An error occurred. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-center text-gray-600">Loading form URL...</p>{" "}
      </div>
    );
  }

  if (!form) {
    return(
    <div className="flex justify-center items-center min-h-screen">
     <p className="text-center text-red-600">Form not found</p>;
    </div>
  )}

  const fields = JSON.parse(form.fields);

  return (
    <>
      <NavBar />
      <hr />
      <div className="min-h-screen bg-white w-full flex justify-center p-10">
        <div className="w-[70vw] bg-white p-10 shadow-2xl max-sm:w-[100vw]">
          <p className="text-black font-bold text-3xl text-center mb-8">
            {form.title}
          </p>
          <p className="text-gray-700 mb-6">{form.description}</p>
          {submissionError && (
            <p className="text-red-500 mb-4">{submissionError}</p>
          )}
          <form onSubmit={handleSubmit}>
            {fields.map((field, index) => (
              <div key={index} className="mb-6 border p-4 rounded">
                <label className="block text-gray-700 font-semibold mb-2">
                  {field.label}
                  {errorMessages[field.label] && (
                    <span className="text-red-500 text-sm ml-2">
                      {errorMessages[field.label]}
                    </span>
                  )}
                </label>
                {field.type === "text" && (
                  <input
                    type="text"
                    name={field.label}
                    className="input input-bordered w-full mt-2 bg-white"
                    onChange={(e) =>
                      handleInputChange(field.label, e.target.value)
                    }
                  />
                )}
                {field.type === "checkbox" && (
                  <div className="mt-2">
                    {field.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center mt-2">
                        <input
                          type="checkbox"
                          name={field.label}
                          value={option}
                          className="checkbox"
                          onChange={(e) =>
                            handleInputChange(field.label, option, true)
                          }
                        />
                        <label className="ml-2 text-gray-700">{option}</label>
                      </div>
                    ))}
                  </div>
                )}
                {field.type === "dropdown" && (
                  <select
                    name={field.label}
                    className="select select-bordered w-full mt-2 bg-white"
                    defaultValue=""
                    onChange={(e) =>
                      handleInputChange(field.label, e.target.value)
                    }
                  >
                    <option value="" disabled>
                      Select an option
                    </option>
                    {field.options.map((option, optIndex) => (
                      <option key={optIndex} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
            <button
              type="submit"
              className="btn bg-primary text-white px-6 py-3 w-full rounded-md hover:bg-blue-600"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ReplyPage;

