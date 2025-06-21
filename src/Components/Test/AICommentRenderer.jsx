import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { API_URL } from "../../../config";
import LoadingSpinner from "../../Components/ui/LoadingSpinner";

const AICommentRenderer = ({ comment }) => {
  const normalizeAIComments = (comments) => {
    if (!comments) return null;
    if (typeof comments === 'object') return comments;

    try {
      return JSON.parse(comments);
    } catch (e) {
      console.error('Failed to parse AI comments:', e);
      return null;
    }
  };

  const parsedComment = normalizeAIComments(comment);
  if (!parsedComment) return null;

  return (
    <div className="mt-2 p-3 bg-blue-50 rounded-md text-sm text-gray-700 space-y-3">
      <div className="flex items-start">
        <span className="font-semibold min-w-[100px]">Evaluación:</span>
        <span className={`font-medium ${parsedComment.evaluacion === 'correcta' ? 'text-green-600' : 'text-red-600'}`}>
          {parsedComment.evaluacion === 'correcta' ? 'Correcto' : 'Incorrecto'}
        </span>
      </div>

      {parsedComment.explicacion && parsedComment.explicacion.length > 0 && (
        <div className="flex items-start">
          <span className="font-semibold min-w-[100px]">Explicación:</span>
          <ul className="list-disc pl-5 space-y-1">
            {parsedComment.explicacion.map((item, index) => (
              <li key={`expl-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {parsedComment.sugerencias && parsedComment.sugerencias.length > 0 && (
        <div className="flex items-start">
          <span className="font-semibold min-w-[100px]">Sugerencias:</span>
          <ul className="list-disc pl-5 space-y-1">
            {parsedComment.sugerencias.map((item, index) => (
              <li key={`sug-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AICommentRenderer;
