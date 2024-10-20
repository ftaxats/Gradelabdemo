"use client";

import React, { useContext, useEffect, useRef } from "react";
import { FiBook, FiCheck, FiExternalLink, FiFileText, FiImage, FiInfo, FiKey, FiShoppingCart, FiUsers, FiX, FiTrash } from "react-icons/fi";
import { MainContext } from "@/context/context";
import { UploadDropzone } from "@/utils/uploadthing";
import { toast } from "react-toastify";
import { FaTrophy } from "react-icons/fa";
import Link from "next/link";
import { appName } from "@/utils/utils";

export default function Evaluators() {
  const {
    evaluators,
    selectedEvaluator,
    setSelectedEvaluator,
    getStudents,
    students,
    updateEvaluation,
    getEvaluation,
    answerSheets,
    setAnswerSheets,
    evaluate,
    evaluating,
    setEvaluating,
    evaluationData,
    setImgPreviewURL,
    imgPreviewURL,
    limits
  } = useContext(MainContext);

  const limitExceedModalRef = useRef(null);

  useEffect(() => {
    getStudents(evaluators[selectedEvaluator]?.classId);
    getEvaluation();
  }, [selectedEvaluator]);

  const evaluateAnswerSheets = async () => {
    if (students.length < 1) {
      return;
    }

    for (let i = 0; i < students.length; i++) {
      if (!answerSheets[i] || answerSheets[i].length < 1) {
        continue;
      }
      var val = await evaluate(i + 1);
      if (val === -3) {
        setEvaluating(-1);
        toast.error("Evaluation failed! Please try again later.");
        return;
      }
      else if (val === -2) {
        setEvaluating(-1);
        limitExceedModalRef.current?.click();
        return;
      }
      else if (val === -1) {
        setEvaluating(-1);
        toast.error("Evaluation failed! Please try again later.");
        return;
      }
    }

    setEvaluating(-1);
    toast.success("Evaluation completed!");
    getEvaluation();
    window.location.href = "/results/" + evaluators[selectedEvaluator]?._id;
  };

  const handleDeleteImage = (index, type) => {
    // Logic to delete the image based on type (question papers or answer keys)
    if (type === 'questionPaper') {
      const updatedPapers = evaluators[selectedEvaluator]?.questionPapers.filter((_, i) => i !== index);
      // Update state or context with updatedPapers
    } else if (type === 'answerKey') {
      const updatedKeys = evaluators[selectedEvaluator]?.answerKeys.filter((_, i) => i !== index);
      // Update state or context with updatedKeys
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      {evaluators.length === 0 ? (
        <div className="max-w-5xl lg:max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-6">🤖 {appName} 📝</h1>
          <p className="text-center text-gray-600 mb-8">Create a new evaluator or select an existing evaluator to get started.</p>
          <div className="grid lg:grid-cols-3 sm:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-6 hover:shadow-md transition duration-300">
              <h3 className="font-semibold text-lg mb-2">🤖 AI-Powered Evaluation</h3>
              <p className="text-sm text-gray-600">Leverage cutting-edge AI for accurate and efficient grading.</p>
            </div>
            <div className="bg-green-50 rounded-lg p-6 hover:shadow-md transition duration-300">
              <h3 className="font-semibold text-lg mb-2">📊 Detailed Result Insights</h3>
              <p className="text-sm text-gray-600">Explore detailed insights for a holistic view of student performance.</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-6 hover:shadow-md transition duration-300">
              <h3 className="font-semibold text-lg mb-2">👥 Effortless Class Management</h3>
              <p className="text-sm text-gray-600">Create, organize, and add students with ease.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-5xl lg:max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              <FiFileText className="mr-2" /> {evaluators[selectedEvaluator]?.title}
            </h2>
            <button className="md:hidden btn btn-square" onClick={() => setSelectedEvaluator(-1)}>
              <FiX />
            </button>
          </div>

          {/* Class Info */}
          <div className="flex flex-wrap items-center mb-6">
            <p className="flex items-center text-gray-600 mr-6 mb-2">
              <FiBook className="mr-2" /> {evaluators[selectedEvaluator]?.class?.subject}
            </p>
            <p className="flex items-center text-gray-600 mb-2">
              <FiUsers className="mr-2" /> {evaluators[selectedEvaluator]?.class?.name} {evaluators[selectedEvaluator]?.class?.section}
            </p>
            {Object.keys(evaluationData).length && answerSheets.length >= 1 ? (
              <Link href={"/results/" + evaluators[selectedEvaluator]?._id} className="ml-auto">
                <button className="btn btn-primary"><FaTrophy className="mr-2" /> View Results</button>
              </Link>
            ) : null}
          </div>

          {/* Question Papers */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb=4 flex items-center"><FiFileText className="mr=2" /> Question Paper(s)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap=4">
              {evaluators[selectedEvaluator]?.questionPapers.map((file, i) => (
                <div key={i} className="relative group">
                  {/* Image Preview */}
                  <label htmlFor='preview_modal' onClick={() => setImgPreviewURL(file)}>
                    <img src={file} 
                      alt={`Question Paper ${i + 1}`} 
                      className='w-full h-auto object-cover rounded-lg shadow-md hover:shadow-lg transition duration=300 cursor-pointer' 
                    />
                  </label>
                  {/* Delete option on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent label click
                      handleDeleteImage(i, 'questionPaper');
                    }}
                    className='absolute top=0 right=0 p=1 bg-red=500 text-white rounded-full opacity=0 group-hover:opacity=100 transition duration=200'
                  >
                    <FiTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Answer Keys */}
          <div className='mb=8'>
            <h3 className='text-xl font-semibold mb=4 flex items-center'><FiKey className='mr=2' /> Answer Key / Criteria</h3>
            <div className='grid grid-cols=2 md:grid-cols=4 lg:grid-cols=6 gap=4'>
              {evaluators[selectedEvaluator]?.answerKeys.map((file, i) => (
                <div key={i} className='relative group'>
                  {/* Image Preview */}
                  <label htmlFor='preview_modal' onClick={() => setImgPreviewURL(file)}>
                    <img src={file} 
                      alt={`Answer Key ${i + 1}`} 
                      className='w-full h-auto object-cover rounded-lg shadow-md hover:shadow-lg transition duration=300 cursor-pointer' 
                    />
                  </label>
                  {/* Delete option on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent label click
                      handleDeleteImage(i, 'answerKey');
                    }}
                    className='absolute top=0 right=0 p=1 bg-red=500 text-white rounded-full opacity=0 group-hover:opacity=100 transition duration=200'
                  >
                    <FiTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Answer Sheets */}
          <div>
            <h3 className='text-xl font-semibold mb=4 flex items-center'><FiFileText className='mr=2' /> Upload answer sheets</h3>
            {students?.length === 0 ? (
              // No Students Message
              <div className='bg-blue-50 border-l=4 border-blue-500 p=4 mb=6'>
                <div className='flex'>
                  <FiInfo className='flex-shrink=0 h=5 w=5 text-blue-500' />
                  <p>No students in the selected class!</p> {/* Adjusted message */}
                </div>
                {/* Link to add students */}
                <Link href='/home/classes' className='font-medium text-blue700 hover:text-blue600 transition duration150 ease-in-out'>Add Students &rarr;</Link> 
              </div> 
            ) : (
              students.map((student, i) => (
                // Student Information and Upload Area
                <>
                  {/* Student Info */}
                  ...
                </>
              ))
            )}
          </div>

          {/* Limit Exceeded Modal */}
          ...
        </div> 
      )}
    </div> 
  );
}
