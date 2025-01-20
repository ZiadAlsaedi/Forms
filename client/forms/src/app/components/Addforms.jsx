'use client';

import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { z } from 'zod';

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z.string().min(5, "Description must be at least 5 characters long"),
  fields: z.array(
    z.object({
      type: z.enum(["text", "checkbox", "dropdown"]),
      label: z.string().min(1, "Label is required"),
      options: z.array(z.string()).optional()
    }).refine((data) => {
      if ((data.type === "checkbox" || data.type === "dropdown") && (!data.options || data.options.length === 0)) {
        return false;
      }
      return true;
    }, {
      message: "Options are required for checkbox and dropdown fields",
      path: ["options"]
    })
  ).min(1, "Fields must contain at least one field")
});

export default function FormBuilder() {
  const [formFields, setFormFields] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFieldType, setSelectedFieldType] = useState("text");
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const handleAddField = () => {
    const newField = {
      type: selectedFieldType,
      value: selectedFieldType === "checkbox" || selectedFieldType === "dropdown" ? [] : "",
      label: "",
      options: selectedFieldType === "checkbox" || selectedFieldType === "dropdown" ? [] : null,
    };
    setFormFields((prevFields) => [...prevFields, newField]);
  };

  const handleRemoveField = (index) => {
    setFormFields((prevFields) => prevFields.filter((_, i) => i !== index));
  };

  const handleLabelChange = (index, event) => {
    const updatedFields = [...formFields];
    updatedFields[index].label = event.target.value;
    setFormFields(updatedFields);
  };

  const handleOptionChange = (fieldIndex, optionIndex, event) => {
    const updatedFields = [...formFields];
    updatedFields[fieldIndex].options[optionIndex] = event.target.value;
    setFormFields(updatedFields);
  };

  const handleAddOption = (fieldIndex) => {
    const updatedFields = [...formFields];
    updatedFields[fieldIndex].options.push("");
    setFormFields(updatedFields);
  };

  const handleRemoveOption = (fieldIndex, optionIndex) => {
    const updatedFields = [...formFields];
    updatedFields[fieldIndex].options = updatedFields[fieldIndex].options.filter((_, i) => i !== optionIndex);
    setFormFields(updatedFields);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const result = formSchema.safeParse({
      title,
      description,
      fields: formFields.map(field => ({
        type: field.type,
        label: field.label,
        options: field.options || []
      }))
    });

    if (!result.success) {
      const validationErrors = result.error.errors.reduce((acc, { path, message }) => {
        acc[path.join('.')] = message;
        return acc;
      }, {});
      setErrors(validationErrors);
      return;
    }

    const response = await fetch('http://localhost:5000/get_user', {
      method: 'GET',
      credentials: 'include',
    });
    const userData = await response.json();

    if (response.ok && userData.user) {
      const formData = {
        user_id: userData.user.id,
        title,
        description,
        fields: JSON.stringify(formFields),
      };
      const formResponse = await fetch('http://localhost:5000/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      const data = await formResponse.json();
      if (formResponse.ok) {
        console.log("Form Created:", data);
        router.push('/forms');
      } else {
        console.error("Error:", data.message);
      }
    } else {
      router.push('/signin');
    }
  };

  return (
    <>
      <div className="min-h-screen bg-white w-full flex justify-center p-10">
        <div className="w-[70vw] bg-white p-10 shadow-2xl max-sm:w-[100vw]">
          <form onSubmit={handleSubmit}>
            <p className="text-black font-bold text-3xl text-center">Add Form</p>
            <div className="mb-4">
              <label className="block text-gray-700">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input input-bordered w-full mt-2 bg-white"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="textarea textarea-bordered w-full mt-2 bg-white"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {formFields.map((field, index) => (
              <div key={index} className="mb-4 border p-4 rounded">
                <div className="flex justify-between items-center">
                  <label className="block text-gray-700">
                    Question {index + 1}
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveField(index)}
                    className="btn btn-sm btn-error text-white"
                  >
                    Remove Field
                  </button>
                </div>
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => handleLabelChange(index, e)}
                  placeholder="Enter question"
                  className="input input-bordered w-full mt-2 bg-white"
                />
                {errors[`fields.${index}.label`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`fields.${index}.label`]}</p>
                )}
                {field.type === "text" && (
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) => handleFieldChange(index, e)}
                    className="input input-bordered w-full mt-2 bg-white"
                  />
                )}
                {(field.type === "checkbox" || field.type === "dropdown") && (
                  <div className="mt-2">
                    {field.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center mt-1">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(index, optIndex, e)}
                          className="input input-bordered w-full mr-2 bg-white"
                          placeholder={`Option ${optIndex + 1}`}
                        />
                        {field.type === "checkbox" && (
                          <input
                            type="checkbox"
                            value={option}
                            readOnly
                            className="checkbox"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(index, optIndex)}
                          className="btn btn-sm btn-error text-white ml-2"
                        >
                          Remove Option
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleAddOption(index)}
                      className="btn btn-sm btn-primary text-white mt-2"
                    >
                      Add Option
                    </button>
                    {errors[`fields.${index}.options`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`fields.${index}.options`]}</p>
                    )}
                  </div>
                )}
              </div>
            ))}

            <div className="flex items-center mb-4">
              <label className="block text-gray-700 mr-2">Field Type</label>
              <select
                value={selectedFieldType}
                onChange={(e) => setSelectedFieldType(e.target.value)}
                className="select select-bordered bg-white"
              >
                <option value="text">Text</option>
                <option value="checkbox">Checkbox</option>
                <option value="dropdown">Dropdown</option>
              </select>
              <button
                type="button"
                onClick={handleAddField}
                className="btn btn-primary text-white ml-2"
              >
                Add Field
              </button>
            </div>
            {errors.fields && <p className="text-red-500 text-sm mt-1">{errors.fields}</p>}

            <button type="submit" className="btn bg-primary text-white mt-4">
              Submit
            </button>
          </form>
        </div>
      </div>
    </>
  )};