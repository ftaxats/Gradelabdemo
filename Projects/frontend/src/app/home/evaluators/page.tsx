import React, { useContext, useEffect, useRef } from "react";
import { FiBook, FiCheck, FiExternalLink, FiFileText, FiImage, FiInfo, FiKey, FiShoppingCart, FiUsers, FiX } from "react-icons/fi";
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

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      {evaluators.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-6">🤖 {appName} 📝</h1>
          <p className="text-center text-gray-600 mb-8">Create a new evaluator or select an existing evaluator to get started.</p>
          <div className="grid md:grid-cols-3 gap-6">
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
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              <FiFileText className="mr-2" /> {evaluators[selectedEvaluator]?.title}
            </h2>
            <button className="md:hidden btn btn-square" onClick={() => setSelectedEvaluator(-1)}>
              <FiX />
            </button>
          </div>
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

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center"><FiFileText className="mr-2" /> Question Paper(s)</h3>
            <div className="flex flex-wrap gap-4">
              {evaluators[selectedEvaluator]?.questionPapers.map((file, i) => (
                <label key={i} htmlFor="preview_modal" onClick={() => setImgPreviewURL(file)}>
                  <img src={file} className="w-24 h-24 object-cover rounded-lg shadow-md hover:shadow-lg transition duration-300 cursor-pointer" alt={`Question Paper ${i + 1}`} />
                </label>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center"><FiKey className="mr-2" /> Answer Key / Criteria</h3>
            <div className="flex flex-wrap gap-4">
              {evaluators[selectedEvaluator]?.answerKeys.map((file, i) => (
                <label key={i} htmlFor="preview_modal" onClick={() => setImgPreviewURL(file)}>
                  <img src={file} className="w-24 h-24 object-cover rounded-lg shadow-md hover:shadow-lg transition duration-300 cursor-pointer" alt={`Answer Key ${i + 1}`} />
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center"><FiFileText className="mr-2" /> Upload answer sheets</h3>
            {students?.length === 0 ? (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiInfo className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      No students in class {evaluators[selectedEvaluator]?.class?.name} {evaluators[selectedEvaluator]?.class?.section}!
                    </p>
                    <p className="mt-2 text-sm">
                      <Link href="/home/classes" className="font-medium text-blue-700 hover:text-blue-600 transition duration-150 ease-in-out">
                        Add Students &rarr;
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              students?.map((student, i) => (
                <div key={i} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{student?.rollNo}. {student?.name}</p>
                    {evaluationData[student?.rollNo] && (answerSheets[i] && answerSheets[i]?.length >= 1) && (
                      <span className="text-green-500 flex items-center">
                        <FiCheck className="mr-1" /> Evaluated
                      </span>
                    )}
                  </div>
                  {answerSheets[i] && answerSheets[i]?.length >= 1 ? (
                    <div className="flex flex-wrap gap-4">
                      {answerSheets[i]?.map((file, j) => (
                        <div key={j} className="relative">
                          {evaluating === student?.rollNo && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
                              <div className="text-blue-500 flex items-center">
                                <span className="mr-2 loading loading-spinner loading-sm"></span>
                                <p>Evaluating...</p>
                              </div>
                            </div>
                          )}
                          <div className="group relative">
                            <label htmlFor="preview_modal" onClick={() => setImgPreviewURL(file)}>
                              <img src={file} className="w-24 h-24 object-cover rounded-lg shadow-md hover:shadow-lg transition duration-300 cursor-pointer" alt={`Answer Sheet ${j + 1}`} />
                            </label>
                            <button
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition duration-300"
                              onClick={() => {
                                const newAnswerSheets = [...answerSheets];
                                newAnswerSheets[i].splice(j, 1);
                                setAnswerSheets(newAnswerSheets);
                                updateEvaluation(evaluators[selectedEvaluator]?._id, newAnswerSheets);
                              }}
                            >
                              <FiX size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <UploadDropzone
                      endpoint="media"
                      onClientUploadComplete={(res) => {
                        const files = res.map(file => file.url);
                        const newAnswerSheets = [...answerSheets];
                        newAnswerSheets[i] = files;
                        setAnswerSheets(newAnswerSheets);
                        updateEvaluation(evaluators[selectedEvaluator]?._id, newAnswerSheets);
                      }}
                      onUploadError={(error) => {
                        toast.error(`Upload failed: ${error.message}`);
                      }}
                    />
                  )}
                </div>
              ))
            )}
          </div>

          {evaluating !== -1 ? (
            <div className="mt-6">
              <p className="mb-2">Evaluating Answer Sheets of {students[evaluating - 1]?.name}... (Student {evaluating} of {students.length})</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${(evaluating / students.length) * 100}%`}}></div>
              </div>
            </div>
          ) : (
            <button className="btn btn-primary w-full mt-6" onClick={evaluateAnswerSheets}>
              🤖 Evaluate
            </button>
          )}

          <div className="flex justify-center items-center mt-4 text-sm text-gray-600">
            <FiFileText className="mr-1" />
            <span>{limits?.evaluationLimit} evaluations left</span>
            <Link href="/shop" className="ml-2 text-blue-500 hover:text-blue-600 transition duration-150 ease-in-out">
              <FiShoppingCart className="inline mr-1" /> Shop
            </Link>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      <input type="checkbox" id="preview_modal" className="modal-toggle" />
      <div className="modal" role="dialog">
        <div className="modal-box max-w-3xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center"><FiImage className="mr-2" /> Preview</h3>
            <div className="flex items-center">
              <button className="btn btn-circle btn-outline mr-2" onClick={() => window.open(imgPreviewURL)}>
                <FiExternalLink />
              </button>
              <label htmlFor="preview_modal" className="btn btn-circle btn-outline">
                <FiX />
              </label>
            </div>
          </div>
          <img src={imgPreviewURL} className="w-full h-auto object-contain" alt="Preview" />
        </div>
      </div>

      {/* Evaluation Limit Exceed Modal */}
      <input type="checkbox" id="evaluationlimitexceed_modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg flex items-center"><FiInfo className="mr-2" /> Evaluation limit exceeded</h3>
          <p className="py-4">You have reached the maximum limit of evaluations. You can purchase more evaluations from the shop.</p>
          <div className="modal-action">
            <label ref={limitExceedModalRef} htmlFor="evaluationlimitexceed_modal" className="btn">Cancel</label>
            <label htmlFor="evaluationlimitexceed_modal" className="btn btn-primary" onClick={() => window.location.href = "/shop"}>
              <FiShoppingCart className="mr-2" /> Shop
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
